
const generateDummyFiles = () => {
    const statuses = ['unprocessed', 'processed', 'failure'];
    const files = [];

    // Generate 20 dummy files
    for (let i = 1; i <= 20; i++) {
        const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];
        const date = new Date(Date.now() - Math.floor(Math.random() * 10000000000)); // Random date in recent past

        files.push({
            id: `doc_${1000 + i}`,
            name: `document_${i.toString().padStart(3, '0')}.${i % 3 === 0 ? 'pdf' : i % 3 === 1 ? 'jpg' : 'png'}`,
            status: randomStatus,
            uploadDate: date.toLocaleDateString(),
            size: `${(Math.random() * 5 + 0.1).toFixed(2)} MB`,
            type: i % 3 === 0 ? 'application/pdf' : 'image/jpeg'
        });
    }
    return files;
};

// Initial data
const mockFiles = generateDummyFiles();

export const getFiles = () => {
    return new Promise((resolve) => {
        // Simulate network delay
        setTimeout(() => {
            resolve(mockFiles);
        }, 500);
    });
};

export const getFilesByStatus = (status) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            if (status === 'all') {
                resolve(mockFiles);
            } else {
                resolve(mockFiles.filter(f => f.status === status));
            }
        }, 300);
    });
};

export const uploadFile = (fileObj) => {
    return new Promise((resolve) => {
        setTimeout(() => {
            const newFile = {
                id: `doc_${Date.now()}`,
                name: fileObj.name,
                status: 'unprocessed',
                uploadDate: new Date().toLocaleDateString(),
                size: `${(fileObj.size / (1024 * 1024)).toFixed(2)} MB`,
                type: fileObj.type
            };
            mockFiles.unshift(newFile);
            resolve(newFile);
        }, 500);
    });
};
