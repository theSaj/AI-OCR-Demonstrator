import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Settings from './Settings';

// Mock global fetch
global.fetch = vi.fn();

describe('Settings Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('renders correctly', () => {
        render(<Settings />);
        expect(screen.getByText('Settings')).toBeInTheDocument();
        expect(screen.getByText('Test Connection')).toBeInTheDocument();
    });

    it('shows successful connection message', async () => {
        fetch.mockResolvedValue({
            ok: true,
            json: vi.fn().mockResolvedValue({ success: true, message: 'I am functional.' })
        });

        render(<Settings />);
        const testBtn = screen.getByText('Test Connection');
        fireEvent.click(testBtn);

        expect(screen.getByText('Testing...')).toBeInTheDocument();

        await waitFor(() => {
            expect(screen.getByText('Connection Successful')).toBeInTheDocument();
            expect(screen.getByText(/Response: "I am functional."/)).toBeInTheDocument();
        });
    });

    it('shows failed connection message', async () => {
        fetch.mockResolvedValue({
            ok: false,
            json: vi.fn().mockResolvedValue({ success: false, error: 'API Key Error' })
        });

        render(<Settings />);
        fireEvent.click(screen.getByText('Test Connection'));

        await waitFor(() => {
            expect(screen.getByText('Connection Failed')).toBeInTheDocument();
            expect(screen.getByText(/Error: API Key Error/)).toBeInTheDocument();
        });
    });
});
