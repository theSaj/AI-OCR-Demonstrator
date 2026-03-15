// ==========================================
// AI / OCR SERVICE (Google Gemini)
// ==========================================
// OCR stands for "Optical Character Recognition" (reading text from images).
// But we are using a smart AI, Google Gemini, so it does much more than just read text!

import { GoogleGenerativeAI } from '@google/generative-ai'; // The official Google tool for talking to Gemini
import fs from 'fs'; // Node's 'File System' tool

/**
 * Processes an image using Google Gemini API.
 * It reads the picture, sends it to Google, asks Google to find specific information,
 * and returns that info as a neat JavaScript object.
 * 
 * @param {string} filePath - Where the file is on our hard drive.
 */
const processImage = async (filePath) => {
    try {
        // Step 1: Make sure we have a key to open the door to Google's servers.
        // This is usually saved safely in a file named ".env" which you never share publicly.
        if (!process.env.GEMINI_API_KEY) {
            throw new Error('Uh oh! GEMINI_API_KEY is not set in the .env file. We cannot talk to Google.');
        }

        // Step 2: Set up our connection to the AI.
        const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
        
        // We chose the "flash" model because it is very fast but still very smart.
        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        // Step 3: Read the actual image file from our hard drive.
        const fileBuffer = fs.readFileSync(filePath);
        
        // The internet sends files as long strings of characters called "Base64". 
        // We have to convert our binary image into Base64 so we can send it in our request.
        const base64Image = fileBuffer.toString('base64');
        const mimeType = 'image/png'; // We tell Gemini what kind of file it is.

        // Step 4: Write instructions for the AI. This is called a "Prompt".
        // It's like writing instructions for a human assistant.
        const prompt = `
        Analyze this image of an accounting ledger. 
        Extract the data into a structured JSON object with the following keys:
        - title: The main title or heading of the document.
        - metadata: An object containing all key-value pairs found (e.g., Dates, IDs, Names, Approval status, Notes).
        - tableData: An array of objects representing the rows in any tables found. Use column headers as keys.
        - fullText: A complete, verbatim transcription of ALL text found in the image, preserving the general reading order.

        Return ONLY the JSON object. Do not wrap it in markdown code blocks. Ensure all text found in the image is present in either metadata, tableData, or fullText.
        `;

        // Step 5: Send the prompt and the picture to Gemini and wait for the answer.
        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: base64Image,
                    mimeType: mimeType
                }
            }
        ]);

        const response = await result.response;
        const text = response.text();

        // Step 6: Sometimes Gemini tries to be helpful and wraps the JSON in markdown like ```json ... ```.
        // We have to clean that up before Javascript can understand it.
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        
        // Convert the clean text string into a real JavaScript Object
        const structuredData = JSON.parse(cleanText);

        // Send both the raw text and the structured data back to whoever called this function.
        return { rawText: text, structuredData };

    } catch (error) {
        console.error('Gemini OCR Error (Our AI had a problem):', error);
        // Throw the error back so index.js knows something went wrong
        throw error;
    }
};

export { processImage };
