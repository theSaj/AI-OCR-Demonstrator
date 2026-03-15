// ==========================================
// DATABASE SETUP
// ==========================================
// We use SQLite, which is a simple database that stores all its data in a single file
// right here on your hard drive (database.sqlite). No need to install complex database servers!

import sqlite3 from 'sqlite3'; // The core SQLite library
import { open } from 'sqlite'; // A helper that lets us use modern "async/await" with SQLite
import path from 'path'; // Helper for building file paths
import { fileURLToPath } from 'url';

// Boilerplate to find where this file is located on the computer
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * dbPromise is our "Connection Tool". 
 * We set it up once, and whenever we need to talk to the database, we use this.
 */
const dbPromise = open({
    filename: path.join(__dirname, 'database.sqlite'), // Where to save the data file
    driver: sqlite3.Database // Instructions on how to read/write the file
});

/**
 * initDb is a function we call when the server first starts up.
 * Its job is to make sure our tables (like spreadsheets) exist before we try to save data.
 */
const initDb = async () => {
    // Wait for the connection to be ready
    const db = await dbPromise;
    
    // Tell the database to create our table if it hasn't already been created.
    // Think of this like setting up the columns in Excel.
    await db.exec(`
        CREATE TABLE IF NOT EXISTS processed_documents (
            id INTEGER PRIMARY KEY AUTOINCREMENT, -- A unique ID number that goes up automatically (1, 2, 3...)
            filename TEXT,                        -- The name of the file (e.g., "1704..-receipt.png")
            uploadDate TEXT,                      -- When it was processed
            data JSON                             -- All the smart data Gemini found, saved as a JSON string
        )
    `);
    console.log('Database initialized successfully! Ready to store data.');
};

// Export these so index.js can use them
export { dbPromise, initDb };
