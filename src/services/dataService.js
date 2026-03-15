/**
 * Data Service
 * 
 * Handles communication with the backend for processed document data.
 */

/**
 * Fetches all processed documents from the database.
 * @returns {Promise<Array>} Array of document objects with parsed JSON data.
 */
export const getDocuments = async () => {
    try {
        const response = await fetch('/api/documents');
        if (!response.ok) throw new Error('Failed to fetch documents');
        return await response.json();
    } catch (error) {
        console.error('Error fetching documents:', error);
        return [];
    }
};
