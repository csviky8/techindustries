import { useState, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { getRtos, createRto, updateRto, deleteRto } from '../api/rtos';
import Button from '../components/Button';
import Input from '../components/Input';
import Modal from '../components/Modal';

const EMPTY = { name: '', code: '', is_active: true };
const PER_PAGE_OPTIONS = [10, 15, 25, 50];

export default function RtosPage() {
    const qc = useQueryClient();

    const [page, setPage]                   = useState(1);
    const [perPage, setPerPage]             = useState(15);
    const [search, setSearch]               = useState('');
    const [statusFilter, setStatus]         = useState('');
    const [sortCol, setSortCol]             = useState('code');
    const [sortDir, setSortDir]             = useState('asc');
    const [modal, setModal]                 = useState(null);
    const [form, setForm]                   = useState(EMPTY);
    const [errors, setErrors]               = useState({});
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const searchTimer                       = useRef(null);

    const queryParams = { page, per_page: perPage, search: search || undefined, status: statusFilter || undefined };

    const { data, isFetching, isLoading } = useQuery({
        queryKey: ['rtos', queryParams],
        queryFn: () => getRtos(queryParams).then(r => r.data),
        placeholderData: keepPreviousData,
    });

    const invalidate = () => qc.invalidateQueries({ queryKey: ['rtos'] });

    const saveMutation = useMutation({
        mutationFn: (f) => modal?.mode === 'edit' ? updateRto(modal.rto.id, f) : createRto(f),
        onSuccess: () => { invalidate(); setModal(null); },
        onError: (err) => setErrors(err.response?.data?.errors ?? {}),
    });

    const deleteMutation = useMutation({
        mutationFn: deleteRto,
        onSuccess: () => { invalidate(); setDeleteConfirm(null); },
    });

    const openCreate = () => { setForm(EMPTY); setErrors({}); setModal({ mode: 'create' }); };
    const openEdit   = (r) => { setForm({ name: r.name, code: r.code, is_active: r.is_active }); setErrors({}); setModal({ mode: 'edit', rto: r }); };
    const set        = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

    const handleSearch = useCallback((val) => {
        clearTimeout(searchTimer.current);
        searchTimer.current = setTimeout(() => { setSearch(val); setPage(1); }, 350);
    }, []);

    const handleSort = (col) => {
        if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        else { setSortCol(col); setSortDir('asc'); }
    };

    let rtos = [...(data?.data ?? [])].sort((a, b) => {
        const av = (a[sortCol] ?? '').toString().toLowerCase();
        const bv = (b[sortCol] ?? '').toString().toLowerCase();
        return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
    });

    const meta = data?.meta;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* ── Header ── */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>Assigned RTOs</h1>
                    <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {meta ? `${meta.total} RTOs registered` : 'Manage Regional Transport Offices'}
                    </p>
                </div>
                <Button onClick={openCreate}>
                    <span style={{ fontSize: '1rem', lineHeight: 1 }}>+</span> New RTO
                </Button>
            </div>

            {/* ── Filters ── */}
            <div style={{
                display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center',
                padding: '12px 16px', borderRadius: '12px',
                background: 'var(--card-bg)', border: '1px solid var(--card-border)',
            }}>
                <div style={{ position: 'relative', flex: '1 1 220px', minWidth: '180px' }}>
                    <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', fontSize: '0.85rem', pointerEvents: 'none' }}>🔍</span>
                    <input
                        placeholder="Search RTO name or code…"
                        onChange={e => handleSearch(e.target.value)}
                        style={{
                            width: '100%', paddingLeft: '32px', paddingRight: '12px',
                            height: '36px', borderRadius: '8px', fontSize: '0.85rem',
                            border: '1px solid var(--card-border)', background: 'var(--body-bg)',
                            color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box',
                        }}
                    />
                </div>

                <select value={statusFilter} onChange={e => { setStatus(e.target.value); setPage(1); }} style={selectStyle}>
                    <option value="">All Status</option>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                </select>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>Show</span>
                    <select value={perPage} onChange={e => { setPerPage(Number(e.target.value)); setPage(1); }} style={{ ...selectStyle, width: '70px' }}>
                        {PER_PAGE_OPTIONS.map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                </div>

                {(search || statusFilter) && (
                    <button onClick={() => { setSearch(''); setStatus(''); setPage(1); }} style={{
                        padding: '6px 12px', borderRadius: '8px', fontSize: '0.78rem', fontWeight: 500,
                        border: '1px solid var(--card-border)', background: 'transparent',
                        color: 'var(--text-secondary)', cursor: 'pointer',
                    }}>✕ Clear</button>
                )}
            </div>

            {/* ── Table ── */}
            <div style={{ borderRadius: '12px', border: '1px solid var(--card-border)', background: 'var(--card-bg)', overflow: 'hidden' }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: 'var(--sidebar-hover)', borderBottom: '2px solid var(--card-border)' }}>
                            <tr>
                                <th style={thStyle(false)}>#</th>
                                <th style={thStyle(true)} onClick={() => handleSort('code')}>Code <SortIcon col="code" sortCol={sortCol} sortDir={sortDir} /></th>
                                <th style={thStyle(true)} onClick={() => handleSort('name')}>RTO Name <SortIcon col="name" sortCol={sortCol} sortDir={sortDir} /></th>
                                <th style={thStyle(false)}>Status</th>
                                <th style={{ ...thStyle(false), textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody style={{ opacity: isFetching && !isLoading ? 0.5 : 1, transition: 'opacity 0.2s' }}>
                            {isLoading
                                ? Array.from({ length: 10 }).map((_, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid var(--card-border)' }}>
                                        {[40, 80, 260, 90, 80].map((w, j) => (
                                            <td key={j} style={{ padding: '13px 14px' }}>
                                                <div style={{ height: '13px', borderRadius: '6px', width: w, background: 'var(--sidebar-hover)', animation: 'pulse 1.4s ease-in-out infinite' }} />
                                            </td>
                                        ))}
                                    </tr>
                                ))
                                : rtos.length === 0
                                    ? (
                                        <tr>
                                            <td colSpan={5} style={{ padding: '48px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                                <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🚗</div>
                                                <p style={{ margin: 0, fontWeight: 500 }}>No RTOs found</p>
                                                <p style={{ margin: '4px 0 0', fontSize: '0.8rem' }}>Try adjusting your search or filters</p>
                                            </td>
                                        </tr>
                                    )
                                    : rtos.map((r, i) => (
                                        <tr key={r.id}
                                            style={{ borderBottom: '1px solid var(--card-border)', transition: 'background 0.15s' }}
                                            onMouseEnter={e => e.currentTarget.style.background = 'var(--sidebar-hover)'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                        >
                                            <td style={{ ...tdMuted, width: '48px' }}>
                                                {((meta?.current_page ?? 1) - 1) * perPage + i + 1}
                                            </td>
                                            <td style={{ padding: '10px 14px' }}>
                                                <span style={{
                                                    display: 'inline-block', padding: '3px 10px', borderRadius: '6px',
                                                    fontSize: '0.78rem', fontWeight: 700, fontFamily: 'monospace',
                                                    letterSpacing: '0.05em', background: 'var(--primary-light)', color: 'var(--primary)',
                                                }}>{r.code}</span>
                                            </td>
                                            <td style={{ padding: '10px 14px', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-primary)' }}>
                                                {r.name}
                                            </td>
                                            <td style={{ padding: '10px 14px' }}>
                                                <span style={{
                                                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                                                    padding: '2px 10px', borderRadius: '99px', fontSize: '0.72rem', fontWeight: 600,
                                                    background: r.is_active ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.1)',
                                                    color: r.is_active ? '#059669' : '#dc2626',
                                                }}>
                                                    {r.is_active ? '● Active' : '● Inactive'}
                                                </span>
                                            </td>
                                            <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                                                <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                                                    <ActionBtn onClick={() => openEdit(r)} title="Edit">✏️</ActionBtn>
                                                    <ActionBtn danger onClick={() => setDeleteConfirm(r)} title="Delete">🗑</ActionBtn>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                            }
                        </tbody>
                    </table>
                </div>

                {/* ── Pagination ── */}
                {meta && meta.last_page >= 1 && (
                    <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '10px 16px', borderTop: '1px solid var(--card-border)',
                        flexWrap: 'wrap', gap: '8px',
                    }}>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                            Showing {meta.from ?? 0}–{meta.to ?? 0} of <strong style={{ color: 'var(--text-primary)' }}>{meta.total}</strong> RTOs
                        </span>
                        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
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

            {/* ── Delete Confirm ── */}
            <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete RTO" maxWidth="400px">
                <p style={{ margin: '0 0 16px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    Delete <strong style={{ color: 'var(--text-primary)' }}>{deleteConfirm?.name} ({deleteConfirm?.code})</strong>? This cannot be undone.
                </p>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                    <Button variant="secondary" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
                    <Button variant="danger" loading={deleteMutation.isPending} onClick={() => deleteMutation.mutate(deleteConfirm.id)}>Delete</Button>
                </div>
            </Modal>

            {/* ── Create / Edit Modal ── */}
            <Modal open={modal?.mode === 'create' || modal?.mode === 'edit'} onClose={() => setModal(null)} title={modal?.mode === 'edit' ? 'Edit RTO' : 'New RTO'} maxWidth="420px">
                <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(form); }} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <Input id="rname" label="RTO Name" value={form.name} onChange={set('name')} error={errors.name?.[0]} required placeholder="e.g. CHENNAI (CENTRAL)" />
                    <Input id="rcode" label="RTO Code" value={form.code} onChange={set('code')} error={errors.code?.[0]} required placeholder="e.g. TN01" />
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', cursor: 'pointer', color: 'var(--text-primary)' }}>
                        <input type="checkbox" checked={form.is_active} onChange={set('is_active')} style={{ accentColor: 'var(--primary)', width: '15px', height: '15px' }} />
                        Active
                    </label>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', paddingTop: '4px' }}>
                        <Button type="button" variant="secondary" onClick={() => setModal(null)}>Cancel</Button>
                        <Button type="submit" loading={saveMutation.isPending}>Save</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

// ── Helpers & sub-components ──

const selectStyle = {
    height: '36px', padding: '0 10px', borderRadius: '8px', fontSize: '0.82rem',
    border: '1px solid var(--card-border)', background: 'var(--body-bg)',
    color: 'var(--text-primary)', outline: 'none', cursor: 'pointer',
};

const tdMuted = { padding: '10px 14px', fontSize: '0.8rem', color: 'var(--text-secondary)' };

const thStyle = (sortable) => ({
    padding: '10px 14px', textAlign: 'left', fontSize: '0.72rem',
    fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
    color: 'var(--text-secondary)', cursor: sortable ? 'pointer' : 'default',
    userSelect: 'none', whiteSpace: 'nowrap',
});

function SortIcon({ col, sortCol, sortDir }) {
    if (sortCol !== col) return <span style={{ opacity: 0.25, fontSize: '0.6rem', marginLeft: 4 }}>⇅</span>;
    return <span style={{ fontSize: '0.6rem', marginLeft: 4, color: 'var(--primary)' }}>{sortDir === 'asc' ? '↑' : '↓'}</span>;
}

function ActionBtn({ children, danger, onClick, title }) {
    return (
        <button onClick={onClick} title={title} style={{
            width: '30px', height: '30px', borderRadius: '7px', border: '1px solid var(--card-border)',
            background: 'transparent', cursor: 'pointer', fontSize: '0.85rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: danger ? '#dc2626' : 'var(--text-secondary)', transition: 'background 0.15s, border-color 0.15s',
        }}
            onMouseEnter={e => { e.currentTarget.style.background = danger ? 'rgba(220,38,38,0.08)' : 'var(--sidebar-hover)'; e.currentTarget.style.borderColor = danger ? '#fca5a5' : 'var(--primary)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = 'var(--card-border)'; }}
        >{children}</button>
    );
}

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
