import { useState, useCallback, useRef } from 'react';
import { useQuery, keepPreviousData } from '@tanstack/react-query';
import api from '../api/client';

const ACTION_COLORS = {
    create: { bg: 'rgba(16,185,129,0.12)', color: '#059669' },
    update: { bg: 'rgba(59,130,246,0.12)', color: '#2563eb' },
    delete: { bg: 'rgba(239,68,68,0.10)', color: '#dc2626' },
    import: { bg: 'rgba(139,92,246,0.12)', color: '#7c3aed' },
};

const MODULES = ['Users', 'Installers', 'RTOs', 'Device Settings'];

export default function ActivityLogPage() {
    const [page, setPage]           = useState(1);
    const [perPage]                 = useState(20);
    const [search, setSearch]       = useState('');
    const [moduleFilter, setModule] = useState('');
    const searchTimer               = useRef(null);

    const queryParams = { page, per_page: perPage, search: search || undefined, module: moduleFilter || undefined };

    const { data, isLoading, isFetching } = useQuery({
        queryKey: ['activity-logs', queryParams],
        queryFn: () => api.get('/activity-logs', { params: queryParams }).then(r => r.data),
        placeholderData: keepPreviousData,
    });

    const handleSearch = useCallback((val) => {
        clearTimeout(searchTimer.current);
        searchTimer.current = setTimeout(() => { setSearch(val); setPage(1); }, 350);
    }, []);

    const logs = data?.data ?? [];
    const meta = data?.meta;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>Activity Log</h1>
                    <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {meta ? `${meta.total} total activities` : 'All system activity'}
                    </p>
                </div>
            </div>

            {/* Filters */}
            <div style={{
                display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center',
                padding: '12px 16px', borderRadius: '12px',
                background: 'var(--card-bg)', border: '1px solid var(--card-border)',
            }}>
                <div style={{ position: 'relative', flex: '1 1 220px', minWidth: '180px' }}>
                    <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', fontSize: '0.85rem', pointerEvents: 'none' }}>🔍</span>
                    <input
                        placeholder="Search description, action, user…"
                        onChange={e => handleSearch(e.target.value)}
                        style={{
                            width: '100%', paddingLeft: '32px', paddingRight: '12px',
                            height: '36px', borderRadius: '8px', fontSize: '0.85rem',
                            border: '1px solid var(--card-border)', background: 'var(--body-bg)',
                            color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box',
                        }}
                    />
                </div>
                <select value={moduleFilter} onChange={e => { setModule(e.target.value); setPage(1); }} style={selectStyle}>
                    <option value="">All Modules</option>
                    {MODULES.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                {(search || moduleFilter) && (
                    <button onClick={() => { setSearch(''); setModule(''); setPage(1); }} style={{
                        padding: '6px 12px', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 500,
                        border: '1px solid var(--card-border)', background: 'transparent',
                        color: 'var(--text-secondary)', cursor: 'pointer',
                    }}>✕ Clear</button>
                )}
            </div>

            {/* Table */}
            <div style={{ borderRadius: '12px', border: '1px solid var(--card-border)', background: 'var(--card-bg)', overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: 'var(--sidebar-hover)', borderBottom: '2px solid var(--card-border)' }}>
                            <tr>
                                {['#', 'Time', 'User', 'Module', 'Action', 'Description', 'IP'].map(h => (
                                    <th key={h} style={{
                                        padding: '10px 14px', textAlign: 'left', fontSize: '0.72rem',
                                        fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
                                        color: 'var(--text-secondary)', whiteSpace: 'nowrap',
                                    }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody style={{ opacity: isFetching && !isLoading ? 0.5 : 1, transition: 'opacity 0.2s' }}>
                            {isLoading
                                ? Array.from({ length: 10 }).map((_, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid var(--card-border)' }}>
                                        {[40, 120, 100, 90, 70, 260, 90].map((w, j) => (
                                            <td key={j} style={{ padding: '13px 14px' }}>
                                                <div style={{ height: '13px', borderRadius: '6px', width: w, background: 'var(--sidebar-hover)', animation: 'pulse 1.4s ease-in-out infinite' }} />
                                            </td>
                                        ))}
                                    </tr>
                                ))
                                : logs.length === 0
                                    ? (
                                        <tr>
                                            <td colSpan={7} style={{ padding: '48px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                                <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📋</div>
                                                <p style={{ margin: 0, fontWeight: 500 }}>No activity found</p>
                                            </td>
                                        </tr>
                                    )
                                    : logs.map((log, i) => {
                                        const ac = ACTION_COLORS[log.action] ?? { bg: 'rgba(100,116,139,0.1)', color: '#64748b' };
                                        return (
                                            <tr key={log.id}
                                                style={{ borderBottom: '1px solid var(--card-border)', transition: 'background 0.15s' }}
                                                onMouseEnter={e => e.currentTarget.style.background = 'var(--sidebar-hover)'}
                                                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                            >
                                                <td style={tdMuted}>{((meta?.current_page ?? 1) - 1) * perPage + i + 1}</td>
                                                <td style={{ ...tdMuted, whiteSpace: 'nowrap' }}>
                                                    {new Date(log.created_at).toLocaleString('en-IN', { dateStyle: 'short', timeStyle: 'short' })}
                                                </td>
                                                <td style={{ padding: '10px 14px' }}>
                                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                                        <div style={{
                                                            width: '24px', height: '24px', borderRadius: '50%', flexShrink: 0,
                                                            background: 'var(--primary)', color: '#fff',
                                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                            fontSize: '0.6rem', fontWeight: 700,
                                                        }}>
                                                            {log.user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) ?? '?'}
                                                        </div>
                                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                                                            {log.user?.name ?? 'System'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td style={{ padding: '10px 14px' }}>
                                                    <span style={{
                                                        padding: '2px 8px', borderRadius: '6px', fontSize: '0.72rem', fontWeight: 600,
                                                        background: 'var(--primary-light)', color: 'var(--primary)',
                                                    }}>{log.module}</span>
                                                </td>
                                                <td style={{ padding: '10px 14px' }}>
                                                    <span style={{
                                                        padding: '2px 8px', borderRadius: '99px', fontSize: '0.72rem', fontWeight: 600,
                                                        background: ac.bg, color: ac.color, textTransform: 'capitalize',
                                                    }}>{log.action}</span>
                                                </td>
                                                <td style={{ padding: '10px 14px', fontSize: '0.82rem', color: 'var(--text-primary)', maxWidth: '320px' }}>
                                                    {log.description}
                                                    {log.meta && (
                                                        <span style={{ marginLeft: 6, fontSize: '0.7rem', color: 'var(--text-secondary)' }}>
                                                            {log.meta.imported !== undefined && `(${log.meta.imported} rows)`}
                                                        </span>
                                                    )}
                                                </td>
                                                <td style={tdMuted}>{log.ip ?? '—'}</td>
                                            </tr>
                                        );
                                    })
                            }
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {meta && meta.last_page >= 1 && (
                    <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '10px 16px', borderTop: '1px solid var(--card-border)',
                        flexWrap: 'wrap', gap: '8px',
                    }}>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                            Showing {meta.from ?? 0}–{meta.to ?? 0} of <strong style={{ color: 'var(--text-primary)' }}>{meta.total}</strong>
                        </span>
                        <div style={{ display: 'flex', gap: '4px' }}>
                            <PageBtn disabled={page === 1} onClick={() => setPage(1)}>«</PageBtn>
                            <PageBtn disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹</PageBtn>
                            {getPageNumbers(meta.current_page, meta.last_page).map((p, idx) =>
                                p === '...'
                                    ? <span key={`e-${idx}`} style={{ padding: '0 4px', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>…</span>
                                    : <PageBtn key={p} active={p === meta.current_page} onClick={() => setPage(p)}>{p}</PageBtn>
                            )}
                            <PageBtn disabled={page === meta.last_page} onClick={() => setPage(p => p + 1)}>›</PageBtn>
                            <PageBtn disabled={page === meta.last_page} onClick={() => setPage(meta.last_page)}>»</PageBtn>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

const selectStyle = {
    height: '36px', padding: '0 10px', borderRadius: '8px', fontSize: '0.82rem',
    border: '1px solid var(--card-border)', background: 'var(--body-bg)',
    color: 'var(--text-primary)', outline: 'none', cursor: 'pointer',
};

const tdMuted = { padding: '10px 14px', fontSize: '0.8rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' };

function PageBtn({ children, active, disabled, onClick }) {
    return (
        <button onClick={onClick} disabled={disabled} style={{
            minWidth: '30px', height: '30px', padding: '0 6px', borderRadius: '7px', fontSize: '0.8rem',
            border: `1px solid ${active ? 'var(--primary)' : 'var(--card-border)'}`,
            background: active ? 'var(--primary)' : 'transparent',
            color: active ? '#fff' : 'var(--text-secondary)',
            cursor: disabled ? 'not-allowed' : 'pointer', opacity: disabled ? 0.4 : 1,
            fontWeight: active ? 700 : 400, transition: 'all 0.15s',
        }}>{children}</button>
    );
}

function getPageNumbers(current, last) {
    if (last <= 7) return Array.from({ length: last }, (_, i) => i + 1);
    if (current <= 4) return [1, 2, 3, 4, 5, '...', last];
    if (current >= last - 3) return [1, '...', last - 4, last - 3, last - 2, last - 1, last];
    return [1, '...', current - 1, current, current + 1, '...', last];
}
