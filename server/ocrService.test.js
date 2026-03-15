import { describe, it, expect, vi, beforeEach } from 'vitest';
import { processImage } from './ocrService';
import { GoogleGenerativeAI } from '@google/generative-ai';
import fs from 'fs';

vi.mock('@google/generative-ai');
vi.mock('fs', () => ({
    default: {
        readFileSync: vi.fn()
    },
    readFileSync: vi.fn()
}));

describe('ocrService', () => {
    const mockApiKey = 'mock-api-key';

    beforeEach(() => {
        process.env.GEMINI_API_KEY = mockApiKey;
        vi.clearAllMocks();
    });

    it('should successfully process an image and return structured data', async () => {
        const mockFileContent = Buffer.from('fake-image-content');
        fs.readFileSync.mockReturnValue(mockFileContent);

        const mockResponseText = JSON.stringify({
            title: 'Test Title',
            metadata: { date: '2025-01-01' },
            tableData: [{ item: 'A', price: 10 }],
            fullText: 'Full text content'
        });

        const mockResponse = {
            text: vi.fn().mockReturnValue(mockResponseText)
        };

        const mockGenerateContent = vi.fn().mockResolvedValue({
            response: mockResponse
        });

        const mockGetGenerativeModel = vi.fn().mockReturnValue({
            generateContent: mockGenerateContent
        });

        GoogleGenerativeAI.prototype.getGenerativeModel = mockGetGenerativeModel;

        const result = await processImage('/path/to/image.png');

        expect(fs.readFileSync).toHaveBeenCalledWith('/path/to/image.png');
        expect(result.structuredData.title).toBe('Test Title');
        expect(result.structuredData.fullText).toBe('Full text content');
    });

    it('should throw error if GEMINI_API_KEY is missing', async () => {
        delete process.env.GEMINI_API_KEY;
        await expect(processImage('test.png')).rejects.toThrow('GEMINI_API_KEY is not set');
    });

    it('should handle API errors gracefully', async () => {
        fs.readFileSync.mockReturnValue(Buffer.from('data'));
        const mockGetGenerativeModel = vi.fn().mockReturnValue({
            generateContent: vi.fn().mockRejectedValue(new Error('API Failure'))
        });
        GoogleGenerativeAI.prototype.getGenerativeModel = mockGetGenerativeModel;

        await expect(processImage('test.png')).rejects.toThrow('API Failure');
    });
});
