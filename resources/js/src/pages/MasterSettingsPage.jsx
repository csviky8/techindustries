import { useState, useRef } from 'react';
import api from '../api/client';

const TABS = [
    { key: 'devices', label: 'Device', icon: '📱' },
];

const COLUMNS = ['MODEL', 'PART NO', 'SERIAL NO', 'IMEI NO', 'ICCID NO1', 'ICCID NO2', 'SIM1', 'SIM2', 'NEW VEHICLE YES/NO'];

export default function MasterSettingsPage() {
    const [openTab, setOpenTab] = useState('devices');

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
                <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>Master Settings</h1>
                <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Configure system master data</p>
            </div>

            {/* Accordion */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {TABS.map(tab => (
                    <AccordionItem
                        key={tab.key}
                        tab={tab}
                        open={openTab === tab.key}
                        onToggle={() => setOpenTab(openTab === tab.key ? null : tab.key)}
                    />
                ))}
            </div>
        </div>
    );
}

function AccordionItem({ tab, open, onToggle }) {
    return (
        <div style={{
            borderRadius: '12px', border: '1px solid var(--card-border)',
            background: 'var(--card-bg)', overflow: 'hidden',
        }}>
            {/* Header */}
            <button onClick={onToggle} style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '14px 20px', background: 'transparent', border: 'none', cursor: 'pointer',
                borderBottom: open ? '1px solid var(--card-border)' : 'none',
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{
                        width: '32px', height: '32px', borderRadius: '8px',
                        background: 'var(--primary-light)', display: 'flex',
                        alignItems: 'center', justifyContent: 'center', fontSize: '1rem',
                    }}>{tab.icon}</span>
                    <span style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{tab.label} Settings</span>
                </div>
                <span style={{
                    fontSize: '0.6rem', color: 'var(--text-secondary)',
                    transition: 'transform 0.25s', display: 'inline-block',
                    transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
                }}>▼</span>
            </button>

            {/* Body */}
            <div style={{
                display: 'grid',
                gridTemplateRows: open ? '1fr' : '0fr',
                transition: 'grid-template-rows 0.28s cubic-bezier(.4,0,.2,1)',
            }}>
                <div style={{ overflow: 'hidden' }}>
                    <div style={{ padding: '20px' }}>
                        {tab.key === 'devices' && <DeviceUploadTab />}
                    </div>
                </div>
            </div>
        </div>
    );
}

function DeviceUploadTab() {
    const [file, setFile]         = useState(null);
    const [dragging, setDragging] = useState(false);
    const [loading, setLoading]   = useState(false);
    const [result, setResult]     = useState(null);
    const [error, setError]       = useState('');
    const inputRef                = useRef(null);

    const handleFile = (f) => {
        if (!f) return;
        const ext = f.name.split('.').pop().toLowerCase();
        if (!['xlsx', 'xls', 'csv'].includes(ext)) {
            setError('Only .xlsx, .xls or .csv files are allowed.');
            return;
        }
        setFile(f);
        setError('');
        setResult(null);
    };

    const handleDrop = (e) => {
        e.preventDefault();
        setDragging(false);
        handleFile(e.dataTransfer.files[0]);
    };

    const handleUpload = async () => {
        if (!file) return;
        setLoading(true);
        setError('');
        setResult(null);
        try {
            const fd = new FormData();
            fd.append('file', file);
            const res = await api.post('/settings/devices/import', fd, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setResult(res.data);
            setFile(null);
            if (inputRef.current) inputRef.current.value = '';
        } catch (err) {
            setError(err.response?.data?.message ?? err.response?.data?.errors?.file?.[0] ?? 'Upload failed.');
        } finally {
            setLoading(false);
        }
    };

    const downloadTemplate = () => {
        window.open('/api/v1/settings/devices/template', '_blank');
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

            {/* Info */}
            <div style={{
                padding: '12px 16px', borderRadius: '10px',
                background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)',
            }}>
                <p style={{ margin: '0 0 8px', fontSize: '0.82rem', fontWeight: 600, color: 'var(--primary)' }}>
                    📋 Required Excel Columns
                </p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {COLUMNS.map(col => (
                        <span key={col} style={{
                            padding: '2px 10px', borderRadius: '99px', fontSize: '0.72rem', fontWeight: 600,
                            background: 'var(--card-bg)', border: '1px solid var(--card-border)',
                            color: 'var(--text-primary)', fontFamily: 'monospace',
                        }}>{col}</span>
                    ))}
                </div>
                <p style={{ margin: '8px 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                    IMEI NO is required. Existing records will be updated by IMEI.
                </p>
            </div>

            {/* Drop zone */}
            <div
                onDragOver={e => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => inputRef.current?.click()}
                style={{
                    border: `2px dashed ${dragging ? 'var(--primary)' : file ? '#10b981' : 'var(--card-border)'}`,
                    borderRadius: '12px', padding: '36px 20px', textAlign: 'center',
                    cursor: 'pointer', transition: 'all 0.2s',
                    background: dragging ? 'var(--primary-light)' : file ? 'rgba(16,185,129,0.05)' : 'var(--body-bg)',
                }}
            >
                <input
                    ref={inputRef} type="file" accept=".xlsx,.xls,.csv"
                    style={{ display: 'none' }}
                    onChange={e => handleFile(e.target.files[0])}
                />
                <div style={{ fontSize: '2.5rem', marginBottom: '8px' }}>
                    {file ? '✅' : '📂'}
                </div>
                {file ? (
                    <>
                        <p style={{ margin: 0, fontWeight: 600, color: '#059669', fontSize: '0.9rem' }}>{file.name}</p>
                        <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            {(file.size / 1024).toFixed(1)} KB — Click to change
                        </p>
                    </>
                ) : (
                    <>
                        <p style={{ margin: 0, fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9rem' }}>
                            Drop your Excel file here
                        </p>
                        <p style={{ margin: '4px 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                            or click to browse — .xlsx, .xls, .csv supported
                        </p>
                    </>
                )}
            </div>

            {/* Error */}
            {error && (
                <div style={{
                    padding: '10px 14px', borderRadius: '8px',
                    background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)',
                    color: '#dc2626', fontSize: '0.85rem',
                }}>⚠️ {error}</div>
            )}

            {/* Success result */}
            {result && (
                <div style={{
                    padding: '14px 16px', borderRadius: '10px',
                    background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)',
                }}>
                    <p style={{ margin: 0, fontWeight: 700, color: '#059669', fontSize: '0.9rem' }}>✅ Import Successful</p>
                    <div style={{ display: 'flex', gap: '20px', marginTop: '8px' }}>
                        <Stat label="Imported" value={result.imported} color="#059669" />
                        <Stat label="Skipped" value={result.skipped} color="#d97706" />
                    </div>
                </div>
            )}

            {/* Actions */}
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                <button
                    onClick={handleUpload}
                    disabled={!file || loading}
                    style={{
                        padding: '9px 20px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600,
                        background: 'var(--primary)', color: '#fff', border: 'none', cursor: !file || loading ? 'not-allowed' : 'pointer',
                        opacity: !file || loading ? 0.6 : 1, display: 'flex', alignItems: 'center', gap: '6px',
                    }}
                >
                    {loading && <Spinner />}
                    {loading ? 'Uploading…' : '⬆ Upload & Import'}
                </button>
                <button
                    onClick={downloadTemplate}
                    style={{
                        padding: '9px 20px', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600,
                        background: 'transparent', color: 'var(--text-primary)',
                        border: '1px solid var(--card-border)', cursor: 'pointer',
                    }}
                >
                    ⬇ Download Template
                </button>
            </div>
        </div>
    );
}

function Stat({ label, value, color }) {
    return (
        <div>
            <p style={{ margin: 0, fontSize: '1.3rem', fontWeight: 700, color }}>{value}</p>
            <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{label}</p>
        </div>
    );
}

function Spinner() {
    return (
        <svg style={{ width: 14, height: 14, animation: 'spin 1s linear infinite' }} viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" style={{ opacity: 0.25 }} />
            <path fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" style={{ opacity: 0.75 }} />
        </svg>
    );
}
