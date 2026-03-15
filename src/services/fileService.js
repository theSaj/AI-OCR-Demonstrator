/**
 * File Management Service
 * 
 * This service handles all HTTP communication with the backend File System API.
 * It replaces the previous localforage implementation with real API calls.
 */

/**
 * Fetches all files from the backend.
 * @returns {Promise<Array>} Array of file objects.
 */
export const getFiles = async () => {
    try {
        const response = await fetch('/api/files');
        if (!response.ok) throw new Error('Failed to fetch files');
        return await response.json();
    } catch (error) {
        console.error('Error fetching files:', error);
        return [];
    }
};

/**
 * Fetches files filtered by their current status.
 * @param {string} status - 'all', 'unprocessed', 'processed', or 'failure'.
 * @returns {Promise<Array>} Filtered array of file objects.
 */
export const getFilesByStatus = async (status) => {
    try {
        const allFiles = await getFiles();
        if (status === 'all') {
            return allFiles;
        }
        return allFiles.filter(f => f.status === status);
    } catch (error) {
        console.error('Error getting files by status:', error);
        return [];
    }
};

/**
 * Uploads a file to the 'unprocessed' directory.
 * @param {File} fileObj - The browser File object to upload.
 * @returns {Promise<Object>} The created file object from server.
 */
export const uploadFile = async (fileObj) => {
    const formData = new FormData();
    formData.append('file', fileObj);

    try {
        const response = await fetch('/api/files', {
            method: 'POST',
            body: formData
        });

        if (!response.ok) throw new Error('Failed to upload file');
        return await response.json();
    } catch (error) {
        console.error('Error uploading file:', error);
        throw error;
    }
};

/**
 * Permanently deletes a file by its ID (filename).
 * @param {string} id - The ID/filename of the file to delete.
 */
export const deleteFile = async (id) => {
    try {
        const response = await fetch(`/api/files/${id}`, {
            method: 'DELETE'
        });

        if (!response.ok) throw new Error('Failed to delete file');
    } catch (error) {
        console.error('Error deleting file:', error);
        throw error;
    }
};

/**
 * Moves a file from 'unprocessed' to 'processed' directory.
 * @param {string} id - The ID/filename of the file to process.
 * @returns {Promise<Object>} The updated file status.
 */
export const processFile = async (id) => {
    try {
        const response = await fetch(`/api/files/${id}/process`, {
            method: 'POST'
        });

        if (!response.ok) throw new Error('Failed to process file');
        return await response.json();
    } catch (error) {
        console.error('Error processing file:', error);
        throw error;
    }
};

/**
 * Re-processes an already processed file.
 * @param {string} id - The ID/filename of the file to re-process.
 * @returns {Promise<Object>} The updated data.
 */
export const reprocessFile = async (id) => {
    try {
        const response = await fetch(`/api/files/${id}/reprocess`, {
            method: 'POST'
        });

        if (!response.ok) throw new Error('Failed to re-process file');
        return await response.json();
    } catch (error) {
        console.error('Error re-processing file:', error);
        throw error;
    }
};

/**
 * Resets the system: moves processed files back to unprocessed and clears the DB.
 * @returns {Promise<Object>}
 */

/**
 * Renames a file.
 * @param {string} id - The ID/filename of the file to rename.
 * @param {string} newName - The new name for the file.
 * @returns {Promise<Object>} The updated file info.
 */
export const renameFile = async (id, newName) => {
    try {
        const response = await fetch(`/api/files/${id}/rename`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ newName })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || 'Failed to rename file');
        }
        return await response.json();
    } catch (error) {
        console.error('Error renaming file:', error);
        throw error;
    }
};

export const resetData = async () => {

    try {
        const response = await fetch('/api/reset', {
            method: 'POST',
        });
        if (!response.ok) {
            throw new Error(`Error resetting data: ${response.statusText}`);
        }
        return await response.json();
    } catch (error) {
        console.error('Resetting data failed:', error);
        throw error;
    }
};
