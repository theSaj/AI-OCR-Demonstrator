import React, { useState, useEffect, useRef } from 'react';
import { getFilesByStatus, uploadFile, deleteFile, processFile, reprocessFile, renameFile, resetData } from '../services/fileService';

/**
 * ViewFiles Component
 * 
 * Displays a list of files with filtering and management capabilities.
 * Features:
 * - List files from 'unprocessed' and 'processed' directories.
 * - Filter by status tabs (All, Unprocessed, Processed, Failure).
 * - Upload new files via hidden file input.
 * - Preview files (Image/PDF) in a modal.
 * - "Process" files (move folders) with optimistic UI updates.
 * - Delete files with a custom confirmation modal.
 * - Rename files.
 */
const ViewFiles = () => {
    const [files, setFiles] = useState([]);
    const [activeTab, setActiveTab] = useState('all');
    const [loading, setLoading] = useState(true);
    const [selectedFile, setSelectedFile] = useState(null);
    const fileInputRef = useRef(null);

    // Renaming state
    const [renamingFileId, setRenamingFileId] = useState(null);
    const [renameValue, setRenameValue] = useState('');

    // Sort State
    const [sortOrder, setSortOrder] = useState('newest');

    useEffect(() => {
        setLoading(true);
        getFilesByStatus(activeTab).then(data => {
            setFiles(data);
            setLoading(false);
        });
    }, [activeTab]);

    const getSortedFiles = () => {
        return [...files].sort((a, b) => {
            // Extract timestamps from ID if possible (format: timestamp-name)
            // If not available, fall back to uploadDate handling or string compare

            const getTimestamp = (file) => {
                const parts = file.id.split('-');
                const ts = parseInt(parts[0]);
                if (!isNaN(ts) && ts > 1000000000000) { // Simple check for valid ms timestamp
                    return ts;
                }
                // Fallback for files without timestamp prefix: return 0 (oldest) or something
                return 0;
            };

            const tsA = getTimestamp(a);
            const tsB = getTimestamp(b);

            // Both have valid timestamps
            if (tsA !== 0 && tsB !== 0) {
                return sortOrder === 'newest' ? tsB - tsA : tsA - tsB;
            }

            // Mixed: One has timestamp, one doesn't
            if (tsA !== 0 && tsB === 0) {
                // A has timestamp (New), B doesn't (Old).
                // Newest First: A comes first (-1).
                // Oldest First: B comes first (1).
                return sortOrder === 'newest' ? -1 : 1;
            }
            if (tsA === 0 && tsB !== 0) {
                // A doesn't (Old), B has timestamp (New).
                // Newest First: B comes first (1).
                // Oldest First: A comes first (-1).
                return sortOrder === 'newest' ? 1 : -1;
            }

            // Neither has timestamp, or fallback
            // Always sort by name for stability within non-timestamped groups
            // Or if sortOrder is actually name-based
            if (sortOrder === 'a-z') return a.name.localeCompare(b.name);
            if (sortOrder === 'z-a') return b.name.localeCompare(a.name);

            // For Newest/Oldest on non-timestamped files, fallback to name sort for stability
            return a.name.localeCompare(b.name);
        });
    };

    const sortedFiles = getSortedFiles();

    const getStatusColor = (status) => {
        switch (status) {
            case 'processed': return '#10b981'; // Emerald
            case 'failure': return '#ef4444'; // Red
            case 'unprocessed': return '#f59e0b'; // Amber
            default: return 'var(--text-secondary)';
        }
    };

    const handleFileClick = (file) => {
        setSelectedFile(file);
    };

    const closePreview = () => {
        setSelectedFile(null);
    };

    const handleUploadClick = () => {
        fileInputRef.current.click();
    };


    // Generic Confirmation Modal State
    // { type: 'delete' | 'process', file: fileObj }
    const [confirmation, setConfirmation] = useState(null);

    const [processingFileIds, setProcessingFileIds] = useState(new Set());

    const handleProcessClick = (e, file) => {
        e.stopPropagation();

        setProcessingFileIds(prev => new Set(prev).add(file.id));

        processFile(file.id)
            .then(() => {
                if (activeTab === 'unprocessed') {
                    setFiles(prev => prev.filter(f => f.id !== file.id));
                } else {
                    setFiles(prev => prev.map(f => f.id === file.id ? { ...f, status: 'processed' } : f));
                }
            })
            .catch(err => {
                console.error(err);
                alert('Processing failed');
            })
            .finally(() => {
                setProcessingFileIds(prev => {
                    const next = new Set(prev);
                    next.delete(file.id);
                    return next;
                });
            });
    };

    const handleReprocessClick = (e, file) => {
        e.stopPropagation();
        setConfirmation({ type: 'reprocess', file });
    };

    const handleResetClick = () => {
        setConfirmation({ type: 'reset' });
    };

    const onDeleteFile = (e, file) => {
        e.stopPropagation();
        setConfirmation({ type: 'delete', file });
    };

    const startRenaming = (e, file) => {
        e.stopPropagation();
        setRenamingFileId(file.id);
        // Pre-fill with name (without extension usually, but file.name might have it depending on how we render)
        // file.name includes extension currently based on server "name: file.substring(file.indexOf('-') + 1)"
        // Users typically rename the base name. 
        // Let's strip extension for editing convenience.
        const ext = file.name.substring(file.name.lastIndexOf('.'));
        const baseName = file.name.substring(0, file.name.lastIndexOf('.'));
        setRenameValue(baseName);
    };

    const cancelRenaming = (e) => {
        e?.stopPropagation();
        setRenamingFileId(null);
        setRenameValue('');
    };

    const saveRename = async (e, file) => {
        e?.stopPropagation();
        if (!renameValue.trim()) return;

        try {
            const updatedFile = await renameFile(file.id, renameValue);

            setFiles(prev => prev.map(f => f.id === file.id ? { ...f, ...updatedFile } : f));
            setRenamingFileId(null);
        } catch (error) {
            alert(error.message);
        }
    };

    const handleRenameKeyDown = (e, file) => {
        if (e.key === 'Enter') {
            saveRename(e, file);
        } else if (e.key === 'Escape') {
            cancelRenaming(e);
        }
        e.stopPropagation();
    };


    const confirmAction = () => {
        if (!confirmation) return;

        const { type, file } = confirmation;

        if (type === 'delete') {
            // Optimistic update for delete
            setFiles(prevFiles => prevFiles.filter(f => f.id !== file.id));

            deleteFile(file.id).catch(err => {
                console.error('Delete failed:', err);
                alert('Failed to delete file. It may reappear on reload.');
            });
        } else if (type === 'process') {
            // Optimistic update for process
            if (activeTab === 'unprocessed') {
                setFiles(prev => prev.filter(f => f.id !== file.id));
            } else {
                setFiles(prev => prev.map(f => f.id === file.id ? { ...f, status: 'processed' } : f));
            }

            processFile(file.id).catch(err => {
                console.error(err);
                alert('Processing failed');
            });
        } else if (type === 'reprocess') {
            setLoading(true);
            reprocessFile(file.id)
                .then(() => {
                    alert('File re-processed successfully');
                })
                .catch(err => {
                    console.error(err);
                    alert('Re-processing failed');
                })
                .finally(() => {
                    setLoading(false);
                });
        } else if (type === 'reset') {
            setLoading(true);
            resetData()
                .then(() => {
                    alert('System reset successfully');
                    // Refresh current view
                    getFilesByStatus(activeTab).then(data => {
                        setFiles(data);
                        setLoading(false);
                    });
                })
                .catch(err => {
                    console.error(err);
                    alert('Reset failed');
                    setLoading(false);
                });
        }

        setConfirmation(null);
    };

    const cancelAction = () => {
        setConfirmation(null);
    };

    const handleFileChange = (event) => {
        const file = event.target.files[0];
        if (file) {
            setLoading(true);
            uploadFile(file).then(() => {
                // Switch to unprocessed tab to see new file
                if (activeTab !== 'unprocessed') {
                    setActiveTab('unprocessed');
                } else {
                    // Refresh list if already on unprocessed
                    getFilesByStatus('unprocessed').then(data => {
                        setFiles(data);
                        setLoading(false);
                    });
                }
            });
        }
    };

    return (
        <div className="content-container">
            <style>{`@keyframes spin { 100% { transform: rotate(360deg); } }`}</style>
            <h1>Files</h1>

            {/* Actions Bar */}
            <div
                className="card"
                style={{ padding: '0.75rem', display: 'flex', gap: '1rem', marginBottom: '1.5rem', alignItems: 'center', background: 'var(--section-bg)' }}
                role="toolbar"
                aria-label="File Filters and Actions"
            >
                <div style={{ display: 'flex', gap: '1rem', flex: 1 }} role="tablist" aria-label="Filter Files by Status">
                    {['all', 'unprocessed', 'processed', 'failure'].map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            role="tab"
                            aria-selected={activeTab === tab}
                            aria-controls="file-list-panel"
                            id={`tab-${tab}`}
                            style={{
                                background: activeTab === tab ? 'var(--secondary-color)' : 'transparent',
                                color: activeTab === tab ? 'white' : 'var(--text-secondary)',
                                border: activeTab === tab ? 'none' : '1px solid transparent',
                                padding: '0.5rem 1rem',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                textTransform: 'capitalize',
                                fontWeight: activeTab === tab ? '700' : '600'
                            }}
                        >
                            {tab}
                        </button>
                    ))}
                </div>

                <div style={{ marginLeft: 'auto', marginRight: '1rem' }}>
                    <select
                        value={sortOrder}
                        onChange={(e) => setSortOrder(e.target.value)}
                        style={{
                            padding: '0.5rem',
                            borderRadius: '4px',
                            border: '1px solid #dfe1e2',
                            background: 'white',
                            color: 'var(--text-primary)',
                            cursor: 'pointer',
                            minWidth: '150px'
                        }}
                        aria-label="Sort Files"
                    >
                        <option value="newest">Newest First</option>
                        <option value="oldest">Oldest First</option>
                        <option value="a-z">Name (A-Z)</option>
                        <option value="z-a">Name (Z-A)</option>
                    </select>
                </div>

                <label htmlFor="file-upload" className="sr-only" style={{ position: 'absolute', width: '1px', height: '1px', padding: 0, margin: '-1px', overflow: 'hidden', clip: 'rect(0, 0, 0, 0)', whiteSpace: 'nowrap', border: 0 }}>
                    Upload File
                </label>
                <input
                    id="file-upload"
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                    aria-hidden="true"
                />
                <button
                    onClick={handleUploadClick}
                    style={{
                        background: 'var(--secondary-color)',
                        color: 'white',
                        border: 'none',
                        padding: '0.5rem 1rem',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: '700',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        fontSize: '0.95rem'
                    }}
                >
                    <span>☁️</span> Upload File
                </button>
                <button
                    onClick={handleResetClick}
                    style={{
                        background: 'transparent',
                        color: '#d54309', // USWDS Red text
                        border: '1px solid #d54309',
                        padding: '0.5rem 1rem',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: '700',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem'
                    }}
                >
                    <span>⚠️</span> Reset Data
                </button>
            </div>

            {/* File List */}
            <div
                className="card"
                id="file-list-panel"
                role="tabpanel"
                aria-labelledby={`tab-${activeTab}`}
                aria-live="polite"
            >
                {loading ? (
                    <p>Loading files...</p>
                ) : files.length === 0 ? (
                    <p>No files found.</p>
                ) : (
                    <div style={{ display: 'grid', gap: '1rem' }}>
                        {sortedFiles.map(file => (
                            <div
                                key={file.id}
                                style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    padding: '1rem',
                                    background: 'var(--card-bg)',
                                    borderRadius: '4px',
                                    borderBottom: '1px solid #dfe1e2',
                                    boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                                }}
                            >
                                <div style={{
                                    width: '40px',
                                    height: '40px',
                                    background: 'var(--card-bg)',
                                    borderRadius: '8px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: '1rem',
                                    fontSize: '1.2rem'
                                }}>
                                    {file.type === 'application/pdf' ? '📄' : file.type === 'text/plain' ? '📝' : '🖼️'}
                                </div>
                                <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                        {renamingFileId === file.id ? (
                                            // Rename Input
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <input
                                                    type="text"
                                                    value={renameValue}
                                                    onChange={(e) => setRenameValue(e.target.value)}
                                                    onKeyDown={(e) => handleRenameKeyDown(e, file)}
                                                    autoFocus
                                                    style={{
                                                        background: 'var(--card-bg)',
                                                        border: '1px solid var(--text-secondary)',
                                                        color: 'text-primary',
                                                        borderRadius: '4px',
                                                        padding: '0.25rem 0.5rem',
                                                        fontSize: '1rem'
                                                    }}
                                                    onClick={e => e.stopPropagation()}
                                                />
                                                <button
                                                    onClick={(e) => saveRename(e, file)}
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#10b981', fontSize: '1.2rem' }}
                                                    title="Save"
                                                >
                                                    ✓
                                                </button>
                                                <button
                                                    onClick={(e) => cancelRenaming(e)}
                                                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#ef4444', fontSize: '1.2rem' }}
                                                    title="Cancel"
                                                >
                                                    ✕
                                                </button>
                                            </div>
                                        ) : (
                                            // File Name Display
                                            <>
                                                <button
                                                    onClick={() => handleFileClick(file)}
                                                    aria-label={`Preview ${file.name}`}
                                                    style={{
                                                        background: 'none',
                                                        border: 'none',
                                                        cursor: 'pointer',
                                                        textAlign: 'left',
                                                        padding: 0,
                                                        fontSize: '1rem',
                                                        fontWeight: 'bold',
                                                        color: 'var(--primary-color)',
                                                        textDecoration: 'underline',
                                                        textUnderlineOffset: '4px'
                                                    }}
                                                >
                                                    {file.name}
                                                </button>
                                                <button
                                                    onClick={(e) => startRenaming(e, file)}
                                                    style={{
                                                        background: 'none',
                                                        border: 'none',
                                                        cursor: 'pointer',
                                                        fontSize: '0.9rem',
                                                        opacity: 0.7
                                                    }}
                                                    title="Rename File"
                                                >
                                                    ✏️
                                                </button>
                                            </>
                                        )}
                                    </div>
                                    <p style={{ margin: '0.25rem 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                        📂 {file.folder || '/'} • {file.uploadDate} • {file.size}
                                    </p>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', position: 'relative', zIndex: 10 }}>
                                    <span style={{
                                        padding: '0.25rem 0.75rem',
                                        borderRadius: '20px',
                                        fontSize: '0.75rem',
                                        fontWeight: '600',
                                        background: `${getStatusColor(file.status)}20`,
                                        color: getStatusColor(file.status),
                                        border: `1px solid ${getStatusColor(file.status)}`
                                    }}>
                                        {file.status.toUpperCase()}
                                    </span>
                                    {file.status === 'unprocessed' && (
                                        <button
                                            onClick={(e) => handleProcessClick(e, file)}
                                            disabled={processingFileIds.has(file.id)}
                                            style={{
                                                background: 'var(--primary-color)',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '4px',
                                                padding: '0.25rem 0.75rem',
                                                cursor: processingFileIds.has(file.id) ? 'not-allowed' : 'pointer',
                                                fontSize: '0.8rem',
                                                fontWeight: '600',
                                                opacity: processingFileIds.has(file.id) ? 0.7 : 1,
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '0.4rem'
                                            }}
                                        >
                                            {processingFileIds.has(file.id) ? (
                                                <>
                                                    <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⏳</span> Processing...
                                                </>
                                            ) : 'Process'}
                                        </button>
                                    )}
                                    {file.status === 'processed' && (
                                        <button
                                            onClick={(e) => handleReprocessClick(e, file)}
                                            style={{
                                                background: 'var(--bg-color)',
                                                color: 'var(--primary-color)',
                                                border: '1px solid var(--primary-color)',
                                                borderRadius: '4px',
                                                padding: '0.25rem 0.75rem',
                                                cursor: 'pointer',
                                                fontSize: '0.8rem',
                                                fontWeight: '600'
                                            }}
                                            title="Re-run OCR extraction"
                                        >
                                            🔄 Re-process
                                        </button>
                                    )}
                                    <button
                                        onClick={(e) => onDeleteFile(e, file)}
                                        className="file-trash-btn"
                                        title="Delete File"
                                        style={{ color: '#565c65' }}
                                    >
                                        🗑️
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Preview Modal */}
            {selectedFile && (
                <div
                    style={{
                        position: 'fixed',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        background: 'rgba(0,0,0,0.8)',
                        zIndex: 1000,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        backdropFilter: 'blur(5px)'
                    }}
                    onClick={closePreview}
                    role="dialog"
                    aria-modal="true"
                    aria-label="File Preview"
                >
                    <div
                        style={{
                            background: 'var(--card-bg)',
                            width: '90%',
                            maxWidth: '800px',
                            height: '80vh',
                            borderRadius: '12px',
                            border: '1px solid var(--glass-border)',
                            display: 'flex',
                            flexDirection: 'column',
                            padding: '2rem',
                            position: 'relative'
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        <button
                            onClick={closePreview}
                            style={{
                                position: 'absolute',
                                top: '1rem',
                                right: '1rem',
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--text-secondary)',
                                fontSize: '1.5rem',
                                cursor: 'pointer'
                            }}
                            aria-label="Close Preview"
                        >
                            <span aria-hidden="true">✕</span>
                        </button>

                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '1.5rem', gap: '1rem' }}>
                            <div style={{ fontSize: '2rem' }}>
                                {selectedFile.type === 'application/pdf' ? '📄' : selectedFile.type === 'text/plain' ? '📝' : '🖼️'}
                            </div>
                            <div>
                                <h2 style={{ margin: 0, fontSize: '1.5rem' }}>{selectedFile.name}</h2>
                                <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
                                    {selectedFile.size} • {selectedFile.uploadDate}
                                </p>
                            </div>
                            <div style={{ marginLeft: 'auto' }}>
                                <span style={{
                                    padding: '0.25rem 0.75rem',
                                    borderRadius: '20px',
                                    fontSize: '0.75rem',
                                    fontWeight: '600',
                                    background: `${getStatusColor(selectedFile.status)}20`,
                                    color: getStatusColor(selectedFile.status),
                                    border: `1px solid ${getStatusColor(selectedFile.status)}`
                                }}>
                                    {selectedFile.status.toUpperCase()}
                                </span>
                            </div>
                        </div>

                        {selectedFile.type === 'application/pdf' ? (
                            <iframe
                                src={`/api/files/${selectedFile.id}/content`}
                                style={{
                                    flex: 1,
                                    width: '100%',
                                    border: 'none',
                                    borderRadius: '8px',
                                    background: 'var(--bg-color)'
                                }}
                                title={selectedFile.name}
                            />
                        ) : selectedFile.type === 'text/plain' ? (
                            <iframe
                                src={`/api/files/${selectedFile.id}/content`}
                                style={{
                                    flex: 1,
                                    width: '100%',
                                    border: 'none',
                                    borderRadius: '8px',
                                    background: 'white',
                                    padding: '1rem',
                                    fontFamily: 'monospace'
                                }}
                                title={selectedFile.name}
                            />
                        ) : (
                            <div style={{
                                flex: 1,
                                background: 'var(--bg-color)',
                                borderRadius: '8px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                overflow: 'hidden'
                            }}>
                                <img
                                    src={`/api/files/${selectedFile.id}/content`}
                                    alt={selectedFile.name}
                                    style={{
                                        maxWidth: '100%',
                                        maxHeight: '100%',
                                        objectFit: 'contain',
                                        borderRadius: '4px'
                                    }}
                                />
                            </div>
                        )}
                    </div>
                </div>
            )}
            {/* Custom Confirmation Modal */}
            {confirmation && (
                <div
                    className="modal-overlay"
                    onClick={cancelAction}
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="modal-title"
                    aria-describedby="modal-desc"
                >
                    <div className="modal-content" onClick={e => e.stopPropagation()}>
                        <h2 id="modal-title">{confirmation.type === 'delete' ? 'Delete File?' : confirmation.type === 'reprocess' ? 'Re-process File?' : confirmation.type === 'reset' ? 'Reset Data?' : 'Process File?'}</h2>
                        <p id="modal-desc">
                            {confirmation.type === 'delete'
                                ? <>Are you sure you want to permanently delete <strong>{confirmation.file.name}</strong>?</>
                                : confirmation.type === 'reprocess'
                                    ? <>Do you want to re-run Gemini OCR on <strong>{confirmation.file.name}</strong>? This will update the data in your library.</>
                                    : confirmation.type === 'reset'
                                        ? <>Are you sure you want to <strong>Reset Data</strong>? This will delete all extracted data and move all processed files back to "Unprocessed".</>
                                        : <>Are you sure you want to process <strong>{confirmation.file.name}</strong>?</>
                            }
                        </p>
                        <div className="modal-actions">
                            <button className="btn btn-secondary" onClick={cancelAction}>Cancel</button>
                            <button
                                className="btn btn-danger"
                                onClick={confirmAction}
                                style={{ background: confirmation.type === 'process' ? 'var(--primary-color)' : '' }}
                            >
                                {confirmation.type === 'delete' ? 'Delete' : confirmation.type === 'reprocess' ? 'Re-process' : confirmation.type === 'reset' ? 'Reset' : 'Process'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ViewFiles;
