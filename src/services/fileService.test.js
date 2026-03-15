import { describe, it, expect, vi, beforeEach } from 'vitest';
import { reprocessFile } from './fileService';

// Mock global fetch
global.fetch = vi.fn();

describe('fileService', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    describe('reprocessFile', () => {
        it('should call the correct endpoint and return data', async () => {
            const mockResponse = { success: true, data: { fullText: 'reprocessed' } };
            fetch.mockResolvedValue({
                ok: true,
                json: vi.fn().mockResolvedValue(mockResponse)
            });

            const result = await reprocessFile('test-file.png');

            expect(fetch).toHaveBeenCalledWith('/api/files/test-file.png/reprocess', {
                method: 'POST'
            });
            expect(result).toEqual(mockResponse);
        });

        it('should throw error if response is not ok', async () => {
            fetch.mockResolvedValue({
                ok: false
            });

            await expect(reprocessFile('test.png')).rejects.toThrow('Failed to re-process file');
        });
    });
});
