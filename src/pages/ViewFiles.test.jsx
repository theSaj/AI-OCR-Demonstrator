/**
 * Component Tests for ViewFiles
 * 
 * Tests the file list UI, interactions, and modal logic.
 * Mocks `fileService` to isolate the component from the backend.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ViewFiles from './ViewFiles';
import * as fileService from '../services/fileService';

// Mock the file service module to control data flow
vi.mock('../services/fileService', () => ({
    getFilesByStatus: vi.fn(),
    uploadFile: vi.fn(),
    deleteFile: vi.fn(),
    processFile: vi.fn(),
    reprocessFile: vi.fn()
}));

const mockFiles = [
    {
        id: '1',
        name: 'test-file.png',
        status: 'unprocessed',
        size: '1.2 MB',
        uploadDate: '12/12/2024',
        type: 'image/png'
    },
    {
        id: '2',
        name: 'processed-file.pdf',
        status: 'processed',
        size: '2.5 MB',
        uploadDate: '12/13/2024',
        type: 'application/pdf'
    }
];

describe('ViewFiles Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders loading state initially', () => {
        fileService.getFilesByStatus.mockImplementation(() => new Promise(() => { })); // Never resolves
        render(<ViewFiles />);
        expect(screen.getByText('Loading files...')).toBeInTheDocument();
    });

    it('renders files after loading', async () => {
        fileService.getFilesByStatus.mockResolvedValue(mockFiles);
        render(<ViewFiles />);

        await waitFor(() => {
            expect(screen.getByText('test-file.png')).toBeInTheDocument();
            expect(screen.getByText('processed-file.pdf')).toBeInTheDocument();
        });
    });

    it('filters files when tabs are clicked', async () => {
        fileService.getFilesByStatus.mockResolvedValue(mockFiles);
        render(<ViewFiles />);

        // Wait for initial load (all files)
        await waitFor(() => {
            expect(screen.getByText('test-file.png')).toBeInTheDocument();
        });

        // Click 'processed' tab
        const processedTab = screen.getByText('processed');
        fireEvent.click(processedTab);

        expect(fileService.getFilesByStatus).toHaveBeenCalledWith('processed');
    });

    it('opens custom delete modal on trash click', async () => {
        fileService.getFilesByStatus.mockResolvedValue([mockFiles[0]]);
        render(<ViewFiles />);

        await waitFor(() => {
            expect(screen.getByTitle('Delete File')).toBeInTheDocument();
        });

        // Click trash icon
        const trashBtn = screen.getByTitle('Delete File');
        fireEvent.click(trashBtn);

        // Modal should appear
        expect(screen.getByText('Delete File?')).toBeInTheDocument();
        expect(screen.getByText(/Are you sure you want to permanently delete/i)).toBeInTheDocument();
        // Check that the file name is visible in the modal (might match multiple if in list too, so just check existence)
        expect(screen.getAllByText(/test-file.png/i).length).toBeGreaterThanOrEqual(1);
    });

    it('deletes file when confirmed in modal', async () => {
        fileService.getFilesByStatus.mockResolvedValue([mockFiles[0]]);
        fileService.deleteFile.mockResolvedValue({});

        render(<ViewFiles />);

        await waitFor(() => {
            expect(screen.getByTitle('Delete File')).toBeInTheDocument();
        });

        // Open modal
        fireEvent.click(screen.getByTitle('Delete File'));

        // Confirm delete
        const deleteBtn = screen.getByText('Delete', { selector: 'button.btn-danger' });
        fireEvent.click(deleteBtn);

        // API should be called
        expect(fileService.deleteFile).toHaveBeenCalledWith('1');
    });

    it('processes file immediately when process button is clicked', async () => {
        fileService.getFilesByStatus.mockResolvedValue([mockFiles[0]]);
        fileService.processFile.mockResolvedValue({ status: 'processed' });

        render(<ViewFiles />);

        await waitFor(() => {
            expect(screen.getByText('Process')).toBeInTheDocument();
        });

        // Click process button
        const processBtn = screen.getByText('Process');
        fireEvent.click(processBtn);

        // Expect immediate API call without modal
        expect(fileService.processFile).toHaveBeenCalledWith('1');
    });

    it('opens confirmation modal when re-process button is clicked', async () => {
        // Use processed file
        fileService.getFilesByStatus.mockResolvedValue([mockFiles[1]]);
        fileService.reprocessFile = vi.fn().mockResolvedValue({ success: true });

        render(<ViewFiles />);

        // Switch to processed tab
        fireEvent.click(screen.getByText('processed'));

        await waitFor(() => {
            expect(screen.getByTitle('Re-run OCR extraction')).toBeInTheDocument();
        });

        // Click re-process button
        fireEvent.click(screen.getByTitle('Re-run OCR extraction'));

        // Modal should appear
        expect(screen.getByText('Re-process File?')).toBeInTheDocument();

        // Confirm re-process
        const confirmBtn = screen.getByText('Re-process', { selector: 'button.btn-danger' });
        fireEvent.click(confirmBtn);

        expect(fileService.reprocessFile).toHaveBeenCalledWith('2');
    });
});
