// ==========================================
// 1. IMPORTS
// ==========================================
// Think of imports like borrowing tools from a toolbox before starting a project.
import 'dotenv/config'; // Loads environment variables (like secret keys) from a .env file into process.env
import express from 'express'; // Our web server framework. It handles incoming HTTP requests and sends responses.
import cors from 'cors'; // Cross-Origin Resource Sharing. Allows our frontend (React) to talk to this backend safely.
import multer from 'multer'; // A tool to handle file uploads when users send files to our server.
import { initDb, dbPromise } from './database.js'; // Our custom database tools to save information.
import { processImage } from './ocrService.js'; // Our custom service that talks to the Google Gemini AI.
import fs from 'fs'; // 'File System' tool built into Node.js. Used to read, write, and delete files on your computer.
import path from 'path'; // A tool to help build and work with file paths (like "folder/subfolder/file.txt").
import { fileURLToPath } from 'url'; // Helps convert a web URL to a local file path.

// ==========================================
// 2. SETUP PATHS
// ==========================================
// Because we are using ES Modules (type="module" in package.json), we need to do a little trick
// to find out exactly where this currently running file is located on the computer.
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Express Server for Local File System Management
 * 
 * This server provides a simple REST API (a set of web URLs that accept/return data) to interact with the local file system.
 * It manages two main directories:
 * - ../unprocessed: Default location for uploaded files. Think of this as the "Inbox".
 * - ../processed: Location for files that have been 'processed' by the AI. Think of this as the "Archive".
 * - database.sqlite: SQLite database to store the data we extract from the documents.
 */

// Create our Express application instance. This 'app' object will be configured to listen for requests.
const app = express();
// The port number our server will listen on. When you type http://localhost:3002, you are connecting here.
const port = 3002;

/**
 * Middleware Configuration
 * Interceptors that process requests *before* they reach our specific route handlers.
 * - CORS: Allow cross-origin requests from the frontend (which runs on port 3001).
 * - JSON: Automatically parse any incoming data that is formatted as JSON.
 */
app.use(cors());
app.use(express.json());

// ==========================================
// 3. FOLDER INITIALIZATION
// ==========================================
// Ensure the directories exist before we try to save files to them.
const uploadDir = path.join(__dirname, '../unprocessed');
const processedDir = path.join(__dirname, '../processed');

[uploadDir, processedDir].forEach(dir => {
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
});

// Initialize DB
initDb();

// ==========================================
// 4. FILE UPLOAD CONFIGURATION (Multer)
// ==========================================
// Multer is a helper that handles "multipart/form-data", which is the format used when uploading files.
const storage = multer.diskStorage({
    // Where should we save the uploaded file?
    destination: (req, file, cb) => {
        cb(null, uploadDir); // Save it to our 'unprocessed' folder.
    },
    // What should we name the saved file?
    filename: (req, file, cb) => {
        // Keep the original name, but add a unique timestamp to the beginning.
        // This prevents two files with the same name from overwriting each other.
        // E.g., "receipt.pdf" becomes "1704067200000-receipt.pdf"
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

// Create the upload middleware using our configuration.
const upload = multer({ storage: storage });

// ==========================================
// 5. HELPER FUNCTIONS
// ==========================================
/**
 * A helper function to read a file from the hard drive and format its details 
 * so our React frontend can easily display it.
 * 
 * @param {string} dir - The folder where the file lives (uploadDir or processedDir)
 * @param {string} file - The actual filename (e.g., "1704067200000-receipt.pdf")
 * @param {string} status - Whether it's 'unprocessed' or 'processed'
 * @returns {Object} An object containing neat properties about the file.
 */
const getFileInfo = (dir, file, status) => {
    const filePath = path.join(dir, file);
    try {
        // 'fs.statSync' gets metadata about the file, like its size and creation date.
        const stats = fs.statSync(filePath);
        return {
            id: file, // The full filename acts as our unique ID
            name: file.substring(file.indexOf('-') + 1), // Remove the timestamp to get the original friendly name
            status: status,
            uploadDate: stats.birthtime.toLocaleDateString(), // Format the creation date
            size: `${(stats.size / (1024 * 1024)).toFixed(2)} MB`, // Convert bytes to Megabytes
            type: path.extname(file) === '.pdf' ? 'application/pdf' : path.extname(file) === '.txt' ? 'text/plain' : 'image/jpeg',
            folder: `/${path.basename(dir)}`,
            rawName: file
        };
    } catch (err) {
        // If something goes wrong (e.g., file was deleted just before we checked), return null.
        return null;
    }
};

// ==========================================
// 6. API ENDPOINTS
// ==========================================
// Think of these as different "doors" a user can knock on to ask the server to do something.

// GET /api/files - List files from all folders
// When the frontend asks "What files do you have?", we look in both folders and send a combined list.
app.get('/api/files', (req, res) => {
    // Read all files in the Inbox ('unprocessed')
    const unprocessedFiles = fs.readdirSync(uploadDir)
        .map(file => getFileInfo(uploadDir, file, 'unprocessed')) // Format their details
        .filter(Boolean); // Remove any null values (files that caused an error)

    // Read all files in the Archive ('processed')
    const processedFiles = fs.readdirSync(processedDir)
        .map(file => getFileInfo(processedDir, file, 'processed')) // Format their details
        .filter(Boolean);

    // Combine both arrays into one master list
    const allFiles = [...unprocessedFiles, ...processedFiles];

    // Sort the list newest-first. Because our filenames start with a timestamp (Date.now()),
    // a simple string comparison sorts them chronologically.
    allFiles.sort((a, b) => b.rawName.localeCompare(a.rawName));

    // Send the list back to the frontend formatted as JSON.
    res.json(allFiles);
});

// GET /api/files/:id/content - Stream file content
// When the user clicks an image to view it, the frontend asks for the actual file data.
app.get('/api/files/:id/content', (req, res) => {
    const filename = req.params.id; // Extract the requested filename from the URL route
    
    // Check both locations to see where the file lives right now
    const unprocessedPath = path.join(uploadDir, filename);
    const processedPath = path.join(processedDir, filename);

    if (fs.existsSync(unprocessedPath)) {
        res.sendFile(unprocessedPath); // Send the actual file back to the browser
    } else if (fs.existsSync(processedPath)) {
        res.sendFile(processedPath);
    } else {
        res.status(404).json({ error: 'File not found' }); // Return a 404 error if missing
    }
});

// POST /api/files - Upload file
// This "door" accepts new file uploads thanks to our Multer middleware.
app.post('/api/files', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).send('No file uploaded.'); // 400 means "Bad Request"
    }

    const file = req.file; // Multer put the file information here
    
    // Construct a friendly summary object to send back to the frontend
    const newFile = {
        id: file.filename,
        name: file.originalname,
        status: 'unprocessed',
        uploadDate: new Date().toLocaleDateString(),
        size: `${(file.size / (1024 * 1024)).toFixed(2)} MB`,
        type: file.mimetype,
        folder: '/unprocessed',
        rawName: file.filename
    };

    res.json(newFile);
});

// Test Gemini API Endpoint
/**
 * POST /api/test-gemini
 * Tests the connection to the Google Gemini API using the provided key.
 */
app.post('/api/test-gemini', async (req, res) => {
    try {
        if (!process.env.GEMINI_API_KEY) {
            throw new Error('GEMINI_API_KEY is not set');
        }
        const { GoogleGenerativeAI } = await import('@google/generative-ai');
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        const prompt = "Hello! Are you working? Reply with 'Yes, I am functional.'";
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        res.json({ success: true, message: text });
    } catch (error) {
        console.error('Gemini Test Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

// POST /api/files/:id/process - Move to processed and run OCR
/**
 * POST /api/files/:id/process
 * The MAGIC happens here! This route takes an unprocessed file, asks Gemini AI to read it,
 * saves the extracted data to the database, and moves the file to the 'processed' folder.
 */
app.post('/api/files/:id/process', async (req, res) => {
    const filename = req.params.id; // Get the ID from the URL
    const oldPath = path.join(uploadDir, filename); // Current location
    const newPath = path.join(processedDir, filename); // Future location

    // Always check if the file actually exists before we try to process it
    if (fs.existsSync(oldPath)) {
        try {
            // 1. Run OCR (Optical Character Recognition) using our custom service
            // This 'await' means "pause here until the AI finishes reading the document"
            const ocrResult = await processImage(oldPath);

            // 2. Move file
            // fs.renameSync is like cutting and pasting a file from one folder to another
            fs.renameSync(oldPath, newPath);

            // 3. Save to DB
            // Get our database connection
            const db = await dbPromise;
            
            // Insert a new row with the filename, current time, and the structured JSON data we got from Gemini
            await db.run(
                'INSERT INTO processed_documents (filename, uploadDate, data) VALUES (?, ?, ?)',
                filename,
                new Date().toISOString(),
                JSON.stringify(ocrResult.structuredData) // Convert the JS object to a string for storage
            );

            // Tell the frontend everything went well
            res.json({
                message: 'File processed and stored successfully',
                status: 'processed',
                folder: '/processed',
                data: ocrResult.structuredData
            });
        } catch (error) {
            // If the AI fails (e.g., bad API key, unreadable image), we catch the error here
            // so the server doesn't crash completely.
            console.error(error);
            res.status(500).json({ error: 'Processing failed' });
        }
    } else {
        res.status(404).json({ error: 'File not found in unprocessed directory' });
    }
});

// POST /api/files/:id/reprocess - Re-run OCR on an already processed file
/**
 * POST /api/files/:id/reprocess
 * Re-runs OCR on an already processed file and updates its existing record in the database.
 */
app.post('/api/files/:id/reprocess', async (req, res) => {
    const filename = req.params.id;
    const filePath = path.join(processedDir, filename);

    if (fs.existsSync(filePath)) {
        try {
            // Run OCR again
            const ocrResult = await processImage(filePath);

            // Update DB
            const db = await dbPromise;
            await db.run(
                'UPDATE processed_documents SET uploadDate = ?, data = ? WHERE filename = ?',
                new Date().toISOString(),
                JSON.stringify(ocrResult.structuredData),
                filename
            );

            res.json({
                message: 'File re-processed and database updated successfully',
                data: ocrResult.structuredData
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Re-processing failed' });
        }
    } else {
        res.status(404).json({ error: 'File not found in processed directory' });
    }
});

// GET /api/documents - Get all processed documents
app.get('/api/documents', async (req, res) => {
    try {
        const db = await dbPromise;
        const documents = await db.all('SELECT * FROM processed_documents ORDER BY id DESC');
        // Parse JSON data string back to object
        const parsedDocs = documents.map(doc => ({
            ...doc,
            data: JSON.parse(doc.data)
        }));
        res.json(parsedDocs);
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Failed to fetch documents' });
    }
});

// DELETE /api/files/:id - Delete file
app.delete('/api/files/:id', (req, res) => {
    const filename = req.params.id;
    const uPath = path.join(uploadDir, filename);
    const pPath = path.join(processedDir, filename);

    if (fs.existsSync(uPath)) {
        fs.unlinkSync(uPath);
        res.json({ message: 'File deleted successfully' });
    } else if (fs.existsSync(pPath)) {
        fs.unlinkSync(pPath);
        res.json({ message: 'File deleted successfully' });
    } else {
        res.status(404).json({ error: 'File not found' });
    }
});




// PUT /api/files/:id/rename - Rename file
app.put('/api/files/:id/rename', async (req, res) => {
    const filename = req.params.id;
    const { newName } = req.body;

    if (!newName) {
        return res.status(400).json({ error: 'New name is required' });
    }

    // Basic validation for filename (prevent directory traversal etc)
    if (newName.includes('/') || newName.includes('\\') || newName.includes('..')) {
        return res.status(400).json({ error: 'Invalid filename' });
    }

    const uPath = path.join(uploadDir, filename);
    const pPath = path.join(processedDir, filename);

    try {
        if (fs.existsSync(uPath)) {
            const ext = path.extname(filename);
            // Ensure new name has the same extension or append it if missing? 
            // For safety, let's preserve the original extension or assume user provided it correctly.
            // Requirement says "rename", usually implies base name. Let's assume user sends full name or we preserve ext.
            // Let's decide to preserve extension if user didn't provide one matching the original, 
            // OR just trust the user input but check for collision.
            // Easier approach: User renames the "friendly name" but we keep the ID/timestamp prefix?
            // The system uses filename AS ID (e.g., `1736177700000-foo.png`).
            // If we rename the file, the ID changes! This breaks things if we rely on ID persistence.
            // ViewFiles uses `file.id` which is the filename.

            // If we change the filename, we change the ID. The frontend will need to know the new ID.

            // Construct new filename. Keep the timestamp prefix if we want to sort by date easily?
            // The current `getFileInfo` parses `name` as `file.substring(file.indexOf('-') + 1)`.
            // So if we just change the part after the first hyphen, we are good.

            const timestampPart = filename.substring(0, filename.indexOf('-'));
            // If user provided a name without extension, append original extension
            let finalNewName = newName;
            if (!path.extname(finalNewName)) {
                finalNewName += path.extname(filename);
            }

            const newFilename = `${timestampPart}-${finalNewName}`;
            const newUPath = path.join(uploadDir, newFilename);

            if (fs.existsSync(newUPath)) {
                return res.status(409).json({ error: 'File with this name already exists' });
            }

            fs.renameSync(uPath, newUPath);

            // Return new file info
            res.json({
                message: 'File renamed successfully',
                id: newFilename,
                name: finalNewName,
                status: 'unprocessed'
            });

        } else if (fs.existsSync(pPath)) {
            const timestampPart = filename.substring(0, filename.indexOf('-'));
            let finalNewName = newName;
            if (!path.extname(finalNewName)) {
                finalNewName += path.extname(filename);
            }

            const newFilename = `${timestampPart}-${finalNewName}`;
            const newPPath = path.join(processedDir, newFilename);

            if (fs.existsSync(newPPath)) {
                return res.status(409).json({ error: 'File with this name already exists' });
            }

            fs.renameSync(pPath, newPPath);

            // Update DB if it exists there
            const db = await dbPromise;
            // Check if record exists
            const existing = await db.get('SELECT * FROM processed_documents WHERE filename = ?', filename);
            if (existing) {
                await db.run('UPDATE processed_documents SET filename = ? WHERE filename = ?', newFilename, filename);
            }

            res.json({
                message: 'File renamed successfully',
                id: newFilename,
                name: finalNewName,
                status: 'processed'
            });
        } else {
            res.status(404).json({ error: 'File not found' });
        }
    } catch (error) {
        console.error('Rename Error:', error);
        res.status(500).json({ error: 'Rename failed: ' + error.message });
    }
});

app.post('/api/reset', async (req, res) => {
    try {
        // 1. Move all files from processed to unprocessed
        const files = fs.readdirSync(processedDir);
        let movedCount = 0;

        for (const file of files) {
            const srcPath = path.join(processedDir, file);
            // Check if it's a file (ignore .gitignore or folders if any)
            if (fs.lstatSync(srcPath).isFile() && file !== '.gitignore') {
                const destPath = path.join(uploadDir, file);

                // Handle name collision by appending timestamp if needed, or just overwrite/rename
                // For simplicity in this reset tool, we'll just move it.
                // If a file with same name exists in unprocessed (unlikely if flow is strict), it will verify.

                if (fs.existsSync(destPath)) {
                    // Rename src file
                    const ext = path.extname(file);
                    const name = path.basename(file, ext);
                    const newName = `${name}_restored_${Date.now()}${ext}`;
                    fs.renameSync(srcPath, path.join(uploadDir, newName));
                } else {
                    fs.renameSync(srcPath, destPath);
                }
                movedCount++;
            }
        }

        // 2. Clear Database
        const db = await dbPromise;
        await db.run('DELETE FROM processed_documents');
        // Reset ID counter
        try {
            await db.run('DELETE FROM sqlite_sequence WHERE name="processed_documents"');
        } catch (e) {
            // Ignore error if sqlite_sequence doesn't exist or table isn't in it yet
        }

        res.json({ success: true, message: `System reset. Moved ${movedCount} files and cleared database.` });

    } catch (error) {
        console.error('Reset Error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
