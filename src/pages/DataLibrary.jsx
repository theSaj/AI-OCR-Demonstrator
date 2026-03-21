import React, { useState, useEffect } from 'react';
import { getDocuments } from '../services/dataService';

/**
 * DataLibrary page component.
 * Displays extracted data from processed documents, including structured tables and full transcriptions.
 */
const DataLibrary = () => {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getDocuments().then(data => {
            setDocuments(data);
            setLoading(false);
        });
    }, []);

    return (
        <div className="content-container">
            <h1>Data Library</h1>
            <p style={{ color: 'var(--text-secondary)' }}>
                View extracted data from processed documents.
            </p>

            <div className="card">
                {loading ? (
                    <p>Loading documents...</p>
                ) : documents.length === 0 ? (
                    <p>No processed documents found.</p>
                ) : (
                    <div style={{ display: 'grid', gap: '2rem' }}>
                        {documents.map(doc => (
                            <div key={doc.id} style={{
                                background: 'var(--bg-color)',
                                padding: '1.5rem',
                                borderRadius: '8px',
                                border: '1px solid var(--glass-border)'
                            }}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', borderBottom: '1px solid var(--glass-border)', paddingBottom: '0.5rem' }}>
                                    <h3 style={{ margin: 0 }}>
                                        <a
                                            href={`/api/files/${doc.filename}/content`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            style={{
                                                color: 'var(--primary-color)',
                                                textDecoration: 'none',
                                                borderBottom: '1px dashed var(--primary-color)'
                                            }}
                                            onMouseOver={(e) => e.target.style.opacity = '0.8'}
                                            onMouseOut={(e) => e.target.style.opacity = '1'}
                                            aria-label={`Open original file ${doc.filename} in new tab`}
                                        >
                                            {doc.filename}
                                        </a>
                                    </h3>
                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                        {new Date(doc.uploadDate).toLocaleString()}
                                    </span>
                                </div>

                                {/* Display Extracted Data */}
                                <div style={{ display: 'grid', gap: '1rem' }}>
                                    {doc.data.title && (
                                        <div style={{ marginBottom: '0.5rem' }}>
                                            <strong>Title: </strong>
                                            <span style={{ color: 'var(--primary-color)' }}>{doc.data.title}</span>
                                        </div>
                                    )}

                                    {/* Metadata / Key-Values */}
                                    {Object.keys(doc.data.metadata).length > 0 && (
                                        <div>
                                            <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem', opacity: 0.8 }}>Metadata</h4>
                                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '0.5rem' }}>
                                                {Object.entries(doc.data.metadata).map(([key, value]) => (
                                                    <div key={key} style={{
                                                        background: 'var(--card-bg)',
                                                        padding: '0.5rem',
                                                        borderRadius: '4px',
                                                        fontSize: '0.9rem'
                                                    }}>
                                                        <strong style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{key}</strong>
                                                        {Array.isArray(value) ? value.join(', ') : value}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Table Data */}
                                    {doc.data.tableData.length > 0 && (
                                        <div>
                                            <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem', opacity: 0.8 }}>Table Data</h4>
                                            <div style={{ overflowX: 'auto' }}>
                                                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem' }}>
                                                    <thead>
                                                        <tr>
                                                            {Object.keys(doc.data.tableData[0]).map(header => (
                                                                <th key={header} scope="col" style={{
                                                                    textAlign: 'left',
                                                                    padding: '0.5rem',
                                                                    borderBottom: '1px solid var(--glass-border)',
                                                                    color: 'var(--text-secondary)'
                                                                }}>
                                                                    {header}
                                                                </th>
                                                            ))}
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {doc.data.tableData.map((row, idx) => (
                                                            <tr key={idx} style={{ background: idx % 2 === 0 ? 'rgba(255,255,255,0.03)' : 'transparent' }}>
                                                                {Object.values(row).map((cell, cIdx) => (
                                                                    <td key={cIdx} style={{ padding: '0.5rem', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                                                                        {cell}
                                                                    </td>
                                                                ))}
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>
                                        </div>
                                    )}

                                    {/* Full Text Transcription */}
                                    {doc.data.fullText && (
                                        <div style={{ marginTop: '1rem' }}>
                                            <h4 style={{ fontSize: '1rem', marginBottom: '0.5rem', opacity: 0.8 }}>Full Transcription</h4>
                                            <div style={{
                                                background: 'var(--card-bg)',
                                                padding: '1rem',
                                                borderRadius: '8px',
                                                fontSize: '0.9rem',
                                                lineHeight: '1.6',
                                                whiteSpace: 'pre-wrap',
                                                borderLeft: '4px solid var(--primary-color)',
                                                color: 'var(--text-secondary)'
                                            }}>
                                                {doc.data.fullText}
                                            </div>
                                        </div>
                                    )}

                                    {/* Raw JSON Toggle for Debug */}
                                    <details style={{ marginTop: '1rem' }}>
                                        <summary style={{ cursor: 'pointer', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>View Raw JSON</summary>
                                        <pre style={{
                                            background: '#000',
                                            color: '#fff',
                                            padding: '1rem',
                                            borderRadius: '8px',
                                            overflowX: 'auto',
                                            fontSize: '0.8rem',
                                            marginTop: '0.5rem'
                                        }}>
                                            {JSON.stringify(doc.data, null, 2)}
                                        </pre>
                                    </details>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default DataLibrary;
