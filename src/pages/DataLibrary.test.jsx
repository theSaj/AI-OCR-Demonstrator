import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import DataLibrary from './DataLibrary';
import * as dataService from '../services/dataService';

vi.mock('../services/dataService', () => ({
    getDocuments: vi.fn()
}));

const mockDocs = [
    {
        id: '1',
        filename: 'test.png',
        uploadDate: '2025-01-01T12:00:00Z',
        data: {
            title: 'Test Doc',
            metadata: { key: 'value' },
            tableData: [{ col1: 'val1' }],
            fullText: 'Transcription here'
        }
    }
];

describe('DataLibrary Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders loading state initially', () => {
        dataService.getDocuments.mockImplementation(() => new Promise(() => { }));
        render(<DataLibrary />);
        expect(screen.getByText('Loading documents...')).toBeInTheDocument();
    });

    it('renders documents after loading', async () => {
        dataService.getDocuments.mockResolvedValue(mockDocs);
        render(<DataLibrary />);

        await waitFor(() => {
            expect(screen.getByText('test.png')).toBeInTheDocument();
            expect(screen.getByText('Test Doc')).toBeInTheDocument();
            expect(screen.getByText('Transcription here')).toBeInTheDocument();
        });
    });

    it('renders metadata correctly', async () => {
        dataService.getDocuments.mockResolvedValue(mockDocs);
        render(<DataLibrary />);

        await waitFor(() => {
            expect(screen.getByText('key')).toBeInTheDocument();
            expect(screen.getByText('value')).toBeInTheDocument();
        });
    });

    it('renders table data correctly', async () => {
        dataService.getDocuments.mockResolvedValue(mockDocs);
        render(<DataLibrary />);

        await waitFor(() => {
            expect(screen.getByText('col1')).toBeInTheDocument();
            expect(screen.getByText('val1')).toBeInTheDocument();
        });
    });
});
