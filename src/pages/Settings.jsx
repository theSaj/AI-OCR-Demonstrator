import React, { useState } from 'react';

/**
 * Settings page component.
 * Allows users to test the connection to the Gemini API.
 */
function Settings() {
    const [testResult, setTestResult] = useState(null);
    const [loading, setLoading] = useState(false);

    const testConnection = async () => {
        setLoading(true);
        setTestResult(null);
        try {
            const response = await fetch('http://localhost:3001/api/test-gemini', {
                method: 'POST',
            });
            const data = await response.json();
            setTestResult(data);
        } catch (error) {
            setTestResult({ success: false, error: error.message });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-8">
            <header className="mb-8">
                <h1 className="text-3xl font-bold text-gray-800">Settings</h1>
                <p className="text-gray-600">Configuration and Status</p>
            </header>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 max-w-2xl">
                <h2 className="text-xl font-semibold text-gray-800 mb-4">Gemini API Connection</h2>
                <p className="text-gray-600 mb-6">
                    Verify that your Google Gemini API key is correctly configured and the server can communicate with the API.
                </p>

                <div className="flex items-center gap-4 mb-6">
                    <button
                        onClick={testConnection}
                        disabled={loading}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${loading
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                        aria-busy={loading}
                    >
                        {loading ? 'Testing...' : 'Test Connection'}
                    </button>
                </div>

                {testResult && (
                    <div
                        className={`p-4 rounded-lg border ${testResult.success
                            ? 'bg-green-50 border-green-200 text-green-800'
                            : 'bg-red-50 border-red-200 text-red-800'
                            }`}
                        role="status"
                        aria-live="polite"
                    >
                        <div className="flex items-center gap-2 font-medium mb-1">
                            <span className="material-icons text-sm" aria-hidden="true">
                                {testResult.success ? 'check_circle' : 'error'}
                            </span>
                            {testResult.success ? 'Connection Successful' : 'Connection Failed'}
                        </div>
                        <p className="text-sm font-mono mt-2">
                            {testResult.success ? `Response: "${testResult.message.trim()}"` : `Error: ${testResult.error}`}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}

export default Settings;
