import { useState, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { getInstallers, createInstaller, updateInstaller, deleteInstaller, getDealers } from '../api/installers';
import { useAuthStore } from '../store/authStore';
import Button from '../components/Button';
import Input from '../components/Input';
import Modal from '../components/Modal';

const EMPTY = { name: '', phone: '', email: '', state: '', district: '', address: '', is_approved: true, password: '', dealer_id: '' };
const PER_PAGE_OPTIONS = [10, 15, 25, 50];

export default function InstallerPage() {
    const qc        = useQueryClient();
    const authUser  = useAuthStore(s => s.user);
    const isDealer  = authUser?.role?.slug === 'dealer';
    const isAdmin   = authUser?.role?.slug === 'admin';

    const [page, setPage]                   = useState(1);
    const [perPage, setPerPage]             = useState(15);
    const [search, setSearch]               = useState('');
    const [statusFilter, setStatus]         = useState('');
    const [sortCol, setSortCol]             = useState('name');
    const [sortDir, setSortDir]             = useState('asc');
    const [modal, setModal]                 = useState(null);
    const [form, setForm]                   = useState(EMPTY);
    const [errors, setErrors]               = useState({});
    const [deleteConfirm, setDeleteConfirm] = useState(null);
    const searchTimer                       = useRef(null);

    const queryParams = { page, per_page: perPage, search: search || undefined, status: statusFilter || undefined };

    const { data, isFetching, isLoading } = useQuery({
        queryKey: ['installers', queryParams],
        queryFn: () => getInstallers(queryParams).then(r => r.data),
        placeholderData: keepPreviousData,
    });

    // Only admin needs the dealers list
    const { data: dealersData } = useQuery({
        queryKey: ['dealers-list'],
        queryFn: () => getDealers().then(r => r.data),
        enabled: isAdmin,
    });
    const dealers = dealersData?.data ?? [];

    const invalidate = () => qc.invalidateQueries({ queryKey: ['installers'] });

    const saveMutation = useMutation({
        mutationFn: (f) => {
            const payload = { ...f };
            if (!payload.password) delete payload.password;
            // dealer login: always send their own id, don't let it be overridden
            if (isDealer) payload.dealer_id = authUser.id;
            if (!payload.dealer_id) delete payload.dealer_id;
            return modal?.mode === 'edit'
                ? updateInstaller(modal.installer.id, payload)
                : createInstaller(payload);
        },
        onSuccess: () => { invalidate(); setModal(null); },
        onError: (err) => setErrors(err.response?.data?.errors ?? {}),
    });

    const deleteMutation = useMutation({
        mutationFn: deleteInstaller,
        onSuccess: () => { invalidate(); setDeleteConfirm(null); },
    });

    const openCreate = () => {
        setForm({
            ...EMPTY,
            dealer_id: isDealer ? String(authUser.id) : '',
        });
        setErrors({});
        setModal({ mode: 'create' });
    };

    const openEdit = (u) => {
        setForm({
            name: u.name ?? '', phone: u.phone ?? '', email: u.email ?? '',
            state: u.state ?? '', district: u.district ?? '', address: u.address ?? '',
            is_approved: u.is_approved ?? true, password: '',
            dealer_id: u.dealer_id ? String(u.dealer_id) : '',
        });
        setErrors({});
        setModal({ mode: 'edit', installer: u });
    };

    const openView = (u) => setModal({ mode: 'view', installer: u });

    const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

    const handleSearch = useCallback((val) => {
        clearTimeout(searchTimer.current);
        searchTimer.current = setTimeout(() => { setSearch(val); setPage(1); }, 350);
    }, []);

    const handleSort = (col) => {
        if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        else { setSortCol(col); setSortDir('asc'); }
    };

    let installers = [...(data?.data ?? [])].sort((a, b) => {
        const av = (a[sortCol] ?? '').toString().toLowerCase();
        const bv = (b[sortCol] ?? '').toString().toLowerCase();
        return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
    });

    const meta = data?.meta;

    // Dealer label for display
    const dealerLabel = (u) => u.dealer?.name ?? u.dealer_name ?? '—';

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* ── Header ── */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>Installers</h1>
                    <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {meta ? `${meta.total} installers` : 'Manage installer accounts'}
                        {isDealer && <span style={{ marginLeft: 8, padding: '1px 8px', borderRadius: '99px', fontSize: '0.7rem', background: 'var(--primary-light)', color: 'var(--primary)', fontWeight: 600 }}>Your installers only</span>}
                    </p>
                </div>
                <Button onClick={openCreate}>
                    <span style={{ fontSize: '1rem', lineHeight: 1 }}>+</span> New Installer
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
                        placeholder="Search name, phone, email, state…"
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
                                <th style={thStyle(true)} onClick={() => handleSort('name')}>Contact Name <SortIcon col="name" sortCol={sortCol} sortDir={sortDir} /></th>
                                <th style={thStyle(true)} onClick={() => handleSort('phone')}>Mobile <SortIcon col="phone" sortCol={sortCol} sortDir={sortDir} /></th>
                                <th style={thStyle(true)} onClick={() => handleSort('email')}>Email <SortIcon col="email" sortCol={sortCol} sortDir={sortDir} /></th>
                                <th style={thStyle(true)} onClick={() => handleSort('state')}>State <SortIcon col="state" sortCol={sortCol} sortDir={sortDir} /></th>
                                <th style={thStyle(true)} onClick={() => handleSort('district')}>District <SortIcon col="district" sortCol={sortCol} sortDir={sortDir} /></th>
                                {isAdmin && <th style={thStyle(true)} onClick={() => handleSort('dealer_name')}>Dealer <SortIcon col="dealer_name" sortCol={sortCol} sortDir={sortDir} /></th>}
                                <th style={thStyle(false)}>Status</th>
                                <th style={{ ...thStyle(false), textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody style={{ opacity: isFetching && !isLoading ? 0.5 : 1, transition: 'opacity 0.2s' }}>
                            {isLoading
                                ? Array.from({ length: 10 }).map((_, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid var(--card-border)' }}>
                                        {Array.from({ length: isAdmin ? 10 : 9 }).map((_, j) => (
                                            <td key={j} style={{ padding: '13px 14px' }}>
                                                <div style={{ height: '13px', borderRadius: '6px', width: [40,160,110,180,90,90,140,110,80,80][j] ?? 80, background: 'var(--sidebar-hover)', animation: 'pulse 1.4s ease-in-out infinite' }} />
                                            </td>
                                        ))}
                                    </tr>
                                ))
                                : installers.length === 0
                                    ? (
                                        <tr>
                                            <td colSpan={isAdmin ? 9 : 8} style={{ padding: '48px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                                <div style={{ fontSize: '2rem', marginBottom: '8px' }}>👷</div>
                                                <p style={{ margin: 0, fontWeight: 500 }}>No installers found</p>
                                                <p style={{ margin: '4px 0 0', fontSize: '0.8rem' }}>Try adjusting your search or add a new installer</p>
                                            </td>
                                        </tr>
                                    )
                                    : installers.map((u, i) => (
                                        <tr key={u.id}
                                            style={{ borderBottom: '1px solid var(--card-border)', transition: 'background 0.15s' }}
                                            onMouseEnter={e => e.currentTarget.style.background = 'var(--sidebar-hover)'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                        >
                                            <td style={{ ...tdMuted, width: '48px' }}>{((meta?.current_page ?? 1) - 1) * perPage + i + 1}</td>
                                            <td style={{ padding: '10px 14px' }}>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                    <div style={{
                                                        width: '30px', height: '30px', borderRadius: '50%', flexShrink: 0,
                                                        background: 'var(--primary)', color: '#fff',
                                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                        fontSize: '0.65rem', fontWeight: 700,
                                                    }}>
                                                        {u.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                                    </div>
                                                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-primary)' }}>{u.name}</span>
                                                </div>
                                            </td>
                                            <td style={tdMuted}>{u.phone ?? '—'}</td>
                                            <td style={tdMuted}>{u.email ?? '—'}</td>
                                            <td style={tdMuted}>{u.state ?? '—'}</td>
                                            <td style={tdMuted}>{u.district ?? '—'}</td>
                                            {isAdmin && <td style={tdMuted}>{dealerLabel(u)}</td>}
                                            <td style={{ padding: '10px 14px' }}>
                                                <span style={{
                                                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                                                    padding: '2px 10px', borderRadius: '99px', fontSize: '0.72rem', fontWeight: 600,
                                                    background: u.is_approved ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.1)',
                                                    color: u.is_approved ? '#059669' : '#dc2626',
                                                }}>
                                                    {u.is_approved ? '● Active' : '● Inactive'}
                                                </span>
                                            </td>
                                            <td style={{ padding: '10px 14px', textAlign: 'right' }}>
                                                <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                                                    <ActionBtn onClick={() => openView(u)} title="View">👁</ActionBtn>
                                                    <ActionBtn onClick={() => openEdit(u)} title="Edit">✏️</ActionBtn>
                                                    <ActionBtn danger onClick={() => setDeleteConfirm(u)} title="Delete">🗑</ActionBtn>
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                            }
                        </tbody>
                    </table>
                </div>

                {meta && meta.last_page >= 1 && (
                    <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '10px 16px', borderTop: '1px solid var(--card-border)',
                        flexWrap: 'wrap', gap: '8px',
                    }}>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                            Showing {meta.from ?? 0}–{meta.to ?? 0} of <strong style={{ color: 'var(--text-primary)' }}>{meta.total}</strong> installers
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

            {/* ── View Modal ── */}
            <Modal open={modal?.mode === 'view'} onClose={() => setModal(null)} title="Installer Details" maxWidth="480px">
                {modal?.installer && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <ViewField label="Contact Name"  value={modal.installer.name} />
                        <ViewField label="Mobile Number" value={modal.installer.phone} />
                        <ViewField label="Email"         value={modal.installer.email} />
                        <ViewField label="State"         value={modal.installer.state} />
                        <ViewField label="District"      value={modal.installer.district} />
                        <ViewField label="Status"        value={modal.installer.is_approved ? 'Active' : 'Inactive'} />
                        {isAdmin && <ViewField label="Dealer" value={dealerLabel(modal.installer)} />}
                        <div style={{ gridColumn: '1 / -1' }}>
                            <ViewField label="Address" value={modal.installer.address} />
                        </div>
                    </div>
                )}
            </Modal>

            {/* ── Delete Confirm ── */}
            <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete Installer" maxWidth="400px">
                <p style={{ margin: '0 0 16px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    Delete <strong style={{ color: 'var(--text-primary)' }}>{deleteConfirm?.name}</strong>? This cannot be undone.
                </p>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                    <Button variant="secondary" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
                    <Button variant="danger" loading={deleteMutation.isPending} onClick={() => deleteMutation.mutate(deleteConfirm.id)}>Delete</Button>
                </div>
            </Modal>

            {/* ── Create / Edit Modal ── */}
            <Modal
                open={modal?.mode === 'create' || modal?.mode === 'edit'}
                onClose={() => setModal(null)}
                title={modal?.mode === 'edit' ? 'Edit Installer' : 'New Installer'}
                maxWidth="560px"
            >
                <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(form); }} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                        <Input id="iname"     label="Contact Name *"  value={form.name}     onChange={set('name')}     error={errors.name?.[0]}  required />
                        <Input id="iphone"    label="Mobile Number *" value={form.phone}    onChange={set('phone')}    error={errors.phone?.[0]} required />
                        <Input id="iemail"    label="Email"           value={form.email}    onChange={set('email')}    error={errors.email?.[0]} type="email" />
                        <Input id="ipassword" label={modal?.mode === 'edit' ? 'Password (leave blank to keep)' : 'Password *'} value={form.password} onChange={set('password')} error={errors.password?.[0]} type="password" required={modal?.mode === 'create'} />
                        <Input id="istate"    label="State"           value={form.state}    onChange={set('state')}    error={errors.state?.[0]} />
                        <Input id="idistrict" label="District"        value={form.district} onChange={set('district')} error={errors.district?.[0]} />
                    </div>

                    {/* Address */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Address</label>
                        <textarea value={form.address} onChange={set('address')} rows={3} placeholder="Enter full address…" style={{
                            borderRadius: '8px', border: '1px solid var(--card-border)',
                            background: 'var(--card-bg)', color: 'var(--text-primary)',
                            padding: '8px 12px', fontSize: '0.85rem', resize: 'vertical',
                            outline: 'none', fontFamily: 'inherit',
                        }} />
                        {errors.address && <p style={{ margin: 0, fontSize: '0.72rem', color: '#dc2626' }}>{errors.address[0]}</p>}
                    </div>

                    {/* Dealer field */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Dealer</label>
                        {isDealer ? (
                            // Dealer login: show their own name, locked
                            <div style={{
                                height: '38px', borderRadius: '8px', border: '1px solid var(--card-border)',
                                background: 'var(--sidebar-hover)', color: 'var(--text-primary)',
                                padding: '0 12px', fontSize: '0.85rem', display: 'flex', alignItems: 'center',
                                opacity: 0.75,
                            }}>
                                {authUser?.dealer_name || authUser?.name}
                                <span style={{ marginLeft: 8, fontSize: '0.7rem', color: 'var(--text-secondary)' }}>(auto-assigned)</span>
                            </div>
                        ) : (
                            // Admin: dropdown of all dealers
                            <select value={form.dealer_id} onChange={set('dealer_id')} style={{ ...selectStyle, height: '38px' }}>
                                <option value="">— Select Dealer —</option>
                                {dealers.map(d => (
                                    <option key={d.id} value={String(d.id)}>
                                        {d.name}{d.dealer_name ? ` (${d.dealer_name})` : ''}
                                    </option>
                                ))}
                            </select>
                        )}
                        {errors.dealer_id && <p style={{ margin: 0, fontSize: '0.72rem', color: '#dc2626' }}>{errors.dealer_id[0]}</p>}
                    </div>

                    {/* Status */}
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', cursor: 'pointer', color: 'var(--text-primary)' }}>
                        <input type="checkbox" checked={form.is_approved} onChange={set('is_approved')} style={{ accentColor: 'var(--primary)', width: '15px', height: '15px' }} />
                        Active (Approved)
                    </label>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', paddingTop: '4px' }}>
                        <Button type="button" variant="secondary" onClick={() => setModal(null)}>Cancel</Button>
                        <Button type="submit" loading={saveMutation.isPending}>
                            {modal?.mode === 'edit' ? 'Update' : 'Create'} Installer
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

// ── Sub-components & helpers ──

function ViewField({ label, value }) {
    return (
        <div>
            <p style={{ margin: 0, fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>{label}</p>
            <p style={{ margin: '3px 0 0', fontSize: '0.875rem', color: 'var(--text-primary)' }}>{value || '—'}</p>
        </div>
    );
}

const selectStyle = {
    height: '36px', padding: '0 10px', borderRadius: '8px', fontSize: '0.82rem',
    border: '1px solid var(--card-border)', background: 'var(--body-bg)',
    color: 'var(--text-primary)', outline: 'none', cursor: 'pointer',
};

const tdMuted = { padding: '10px 14px', fontSize: '0.8rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' };

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
