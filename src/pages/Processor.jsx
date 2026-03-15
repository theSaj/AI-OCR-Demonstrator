import React from 'react';

const Processor = () => {
    return (
        <div className="content-container">
            <h1>Intelligent Document Processing</h1>
            <div className="card">
                <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                    <div style={{ flex: 1, minWidth: '300px' }}>
                        <h2>Capabilities</h2>
                        <ul style={{ listStyle: 'none', color: 'var(--text-secondary)' }}>
                            <li style={{ marginBottom: '0.5rem', padding: '0.5rem', borderBottom: '1px solid var(--glass-border)' }}>
                                <strong>Accuracy:</strong> 99.9% Character Recognition
                            </li>
                            <li style={{ marginBottom: '0.5rem', padding: '0.5rem', borderBottom: '1px solid var(--glass-border)' }}>
                                <strong>Speed:</strong> &lt; 100ms per page
                            </li>
                            <li style={{ marginBottom: '0.5rem', padding: '0.5rem', borderBottom: '1px solid var(--glass-border)' }}>
                                <strong>Formats:</strong> PDF, JPEG, PNG, TIFF
                            </li>
                            <li style={{ marginBottom: '0.5rem', padding: '0.5rem', borderBottom: '1px solid var(--glass-border)' }}>
                                <strong>Languages:</strong> Support for 100+ languages
                            </li>
                        </ul>
                    </div>
                    <div style={{ flex: 1, minWidth: '300px' }}>
                        <h2>Key Features</h2>
                        <p>
                            Our OCR engine is designed for high-volume, high-precision text extraction.
                            Whether you are digitizing archives, automating invoice processing,
                            or analyzing legal documents, Antigravity delivers parsing perfection.
                        </p>
                        <p>
                            With our proprietary "DeepGlyph" technology, the processor maintains formatting,
                            tables, and layout structure, ensuring that your data isn't just readable—it's usable.
                        </p>
                    </div>
                </div>
            </div>

            <div className="card">
                <h2>Performance</h2>
                <p>
                    Processing millions of pages daily with industry-leading uptime. Our scalable architecture
                    ensures no bottleneck, no matter the workload size.
                </p>
            </div>
        </div>
    );
};

export default Processor;
