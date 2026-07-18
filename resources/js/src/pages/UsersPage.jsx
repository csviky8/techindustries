import { useState, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query';
import { getUsers, getUsersLegacy, createUser, updateUser, deleteUser, getRoles } from '../api/admin';
import Button from '../components/Button';
import Input from '../components/Input';
import Badge from '../components/Badge';
import Modal from '../components/Modal';

const EMPTY = {
    name: '', email: '', phone: '', username: '', password: '',
    role_id: '', dealer_id: '', state: '', district: '', dealer_name: '', is_approved: false,
};

const PER_PAGE_OPTIONS = [10, 15, 25, 50];

function Field({ label, value }) {
    return (
        <div>
            <p style={{ margin: 0, fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)' }}>{label}</p>
            <p style={{ margin: '2px 0 0', fontSize: '0.875rem', color: 'var(--text-primary)' }}>{value || '—'}</p>
        </div>
    );
}

function SortIcon({ col, sortCol, sortDir }) {
    if (sortCol !== col) return <span style={{ opacity: 0.25, fontSize: '0.6rem', marginLeft: 4 }}>⇅</span>;
    return <span style={{ fontSize: '0.6rem', marginLeft: 4, color: 'var(--primary)' }}>{sortDir === 'asc' ? '↑' : '↓'}</span>;
}

export default function UsersPage() {
    const qc = useQueryClient();

    // ── Table state ──
    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(15);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [approvedFilter, setApprovedFilter] = useState('');
    const [sortCol, setSortCol] = useState('');
    const [sortDir, setSortDir] = useState('asc');
    const searchTimer = useRef(null);

    // ── Modal state ──
    const [modal, setModal] = useState(null);
    const [form, setForm] = useState(EMPTY);
    const [errors, setErrors] = useState({});
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    const queryParams = { page, per_page: perPage, search: search || undefined, role: roleFilter || undefined };

    const { data, isFetching, isLoading } = useQuery({
        queryKey: ['users', queryParams],
        queryFn: () => getUsers(queryParams).then(r => r.data),
        placeholderData: keepPreviousData,
    });

    const { data: rolesData } = useQuery({ queryKey: ['roles'], queryFn: () => getRoles().then(r => r.data) });
    const { data: dealersData } = useQuery({ queryKey: ['dealers'], queryFn: () => getUsers({ role: 'dealer', per_page: 100 }).then(r => r.data) });

    const invalidate = () => qc.invalidateQueries({ queryKey: ['users'] });

    const saveMutation = useMutation({
        mutationFn: (f) => {
            const payload = { ...f };
            if (!payload.password) delete payload.password;
            if (!payload.dealer_id) delete payload.dealer_id;
            return modal?.mode === 'edit' ? updateUser(modal.user.id, payload) : createUser(payload);
        },
        onSuccess: () => { invalidate(); setModal(null); },
        onError: (err) => setErrors(err.response?.data?.errors ?? {}),
    });

    const deleteMutation = useMutation({
        mutationFn: deleteUser,
        onSuccess: () => { invalidate(); setDeleteConfirm(null); },
    });

    const openCreate = () => { setForm(EMPTY); setErrors({}); setModal({ mode: 'create' }); };
    const openEdit = (u) => {
        setForm({
            name: u.name ?? '', email: u.email ?? '', phone: u.phone ?? '',
            username: u.username ?? '', password: '',
            role_id: u.role?.id ?? '', dealer_id: u.dealer_id ?? '',
            state: u.state ?? '', district: u.district ?? '',
            dealer_name: u.dealer_name ?? '', is_approved: u.is_approved ?? false,
        });
        setErrors({});
        setModal({ mode: 'edit', user: u });
    };
    const openView = (u) => setModal({ mode: 'view', user: u });

    const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }));

    const handleSearch = useCallback((val) => {
        clearTimeout(searchTimer.current);
        searchTimer.current = setTimeout(() => { setSearch(val); setPage(1); }, 350);
    }, []);

    const handleSort = (col) => {
        if (sortCol === col) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
        else { setSortCol(col); setSortDir('asc'); }
    };

    let users = data?.data ?? [];
    const roles = rolesData?.data ?? [];
    const dealers = dealersData?.data ?? [];
    const meta = data?.meta;

    // Client-side sort (server doesn't sort yet)
    if (sortCol) {
        users = [...users].sort((a, b) => {
            const av = (a[sortCol] ?? '').toString().toLowerCase();
            const bv = (b[sortCol] ?? '').toString().toLowerCase();
            return sortDir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
        });
    }

    // Client-side approved filter
    if (approvedFilter !== '') {
        users = users.filter(u => String(u.is_approved ? '1' : '0') === approvedFilter);
    }

    const thStyle = (col) => ({
        padding: '10px 14px', textAlign: 'left', fontSize: '0.72rem',
        fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em',
        color: 'var(--text-secondary)', cursor: col ? 'pointer' : 'default',
        userSelect: 'none', whiteSpace: 'nowrap',
    });

    const tdStyle = { padding: '10px 14px', fontSize: '0.85rem', color: 'var(--text-primary)', whiteSpace: 'nowrap' };
    const tdMuted = { ...tdStyle, color: 'var(--text-secondary)', fontSize: '0.8rem' };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {/* ── Header ── */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>Users</h1>
                    <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        {meta ? `${meta.total} total users` : 'Manage system users'}
                    </p>
                </div>
                <Button onClick={openCreate}>
                    <span style={{ fontSize: '1rem', lineHeight: 1 }}>+</span> New User
                </Button>
            </div>

            {/* ── Filters Bar ── */}
            <div style={{
                display: 'flex', flexWrap: 'wrap', gap: '10px', alignItems: 'center',
                padding: '12px 16px', borderRadius: '12px',
                background: 'var(--card-bg)', border: '1px solid var(--card-border)',
            }}>
                {/* Search */}
                <div style={{ position: 'relative', flex: '1 1 220px', minWidth: '180px' }}>
                    <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', fontSize: '0.85rem', pointerEvents: 'none' }}>🔍</span>
                    <input
                        placeholder="Search name, email, phone, state…"
                        onChange={e => handleSearch(e.target.value)}
                        style={{
                            width: '100%', paddingLeft: '32px', paddingRight: '12px',
                            height: '36px', borderRadius: '8px', fontSize: '0.85rem',
                            border: '1px solid var(--card-border)', background: 'var(--body-bg)',
                            color: 'var(--text-primary)', outline: 'none', boxSizing: 'border-box',
                        }}
                    />
                </div>

                {/* Role filter */}
                <select
                    value={roleFilter}
                    onChange={e => { setRoleFilter(e.target.value); setPage(1); }}
                    style={selectStyle}
                >
                    <option value="">All Roles</option>
                    {roles.map(r => <option key={r.id} value={r.slug}>{r.name}</option>)}
                </select>

                {/* Approved filter */}
                <select value={approvedFilter} onChange={e => setApprovedFilter(e.target.value)} style={selectStyle}>
                    <option value="">All Status</option>
                    <option value="1">Approved</option>
                    <option value="0">Pending</option>
                </select>

                {/* Per page */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>Show</span>
                    <select value={perPage} onChange={e => { setPerPage(Number(e.target.value)); setPage(1); }} style={{ ...selectStyle, width: '70px' }}>
                        {PER_PAGE_OPTIONS.map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                </div>

                {/* Clear filters */}
                {(search || roleFilter || approvedFilter) && (
                    <button onClick={() => { setSearch(''); setRoleFilter(''); setApprovedFilter(''); setPage(1); }} style={{
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
                                <th style={thStyle(null)}>#</th>
                                {[['name','Name'],['phone','Phone'],['email','Email'],['username','Username']].map(([col, label]) => (
                                    <th key={col} style={thStyle(col)} onClick={() => handleSort(col)}>
                                        {label}<SortIcon col={col} sortCol={sortCol} sortDir={sortDir} />
                                    </th>
                                ))}
                                <th style={thStyle(null)}>Role</th>
                                <th style={thStyle('dealer_name')} onClick={() => handleSort('dealer_name')}>
                                    Dealer<SortIcon col="dealer_name" sortCol={sortCol} sortDir={sortDir} />
                                </th>
                                <th style={thStyle('state')} onClick={() => handleSort('state')}>
                                    State<SortIcon col="state" sortCol={sortCol} sortDir={sortDir} />
                                </th>
                                <th style={thStyle('district')} onClick={() => handleSort('district')}>
                                    District<SortIcon col="district" sortCol={sortCol} sortDir={sortDir} />
                                </th>
                                <th style={thStyle(null)}>Status</th>
                                <th style={{ ...thStyle(null), textAlign: 'right' }}>Actions</th>
                            </tr>
                        </thead>
                        <tbody style={{ opacity: isFetching && !isLoading ? 0.5 : 1, transition: 'opacity 0.2s' }}>
                            {isLoading
                                ? Array.from({ length: 10 }).map((_, i) => (
                                    <tr key={i} style={{ borderBottom: '1px solid var(--card-border)' }}>
                                        {[40, 160, 100, 180, 100, 80, 100, 80, 80, 70, 90].map((w, j) => (
                                            <td key={j} style={{ padding: '13px 14px' }}>
                                                <div style={{ height: '13px', borderRadius: '6px', width: w, background: 'var(--sidebar-hover)', animation: 'pulse 1.4s ease-in-out infinite' }} />
                                            </td>
                                        ))}
                                    </tr>
                                ))
                                : users.map((u, i) => (
                                <tr key={u.id} style={{ borderBottom: '1px solid var(--card-border)', transition: 'background 0.15s' }}
                                    onMouseEnter={e => e.currentTarget.style.background = 'var(--sidebar-hover)'}
                                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                >
                                    <td style={{ ...tdMuted, width: '40px' }}>
                                        {((meta?.current_page ?? 1) - 1) * perPage + i + 1}
                                    </td>
                                    <td style={tdStyle}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                            <div style={{
                                                width: '30px', height: '30px', borderRadius: '50%', flexShrink: 0,
                                                background: 'var(--primary)', color: '#fff',
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                                fontSize: '0.65rem', fontWeight: 700,
                                            }}>
                                                {u.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
                                            </div>
                                            <span style={{ fontWeight: 600 }}>{u.name}</span>
                                        </div>
                                    </td>
                                    <td style={tdMuted}>{u.phone ?? '—'}</td>
                                    <td style={tdMuted}>{u.email ?? '—'}</td>
                                    <td style={tdMuted}>{u.username ?? '—'}</td>
                                    <td style={tdStyle}><Badge type={u.role?.slug} label={u.role?.name} /></td>
                                    <td style={tdMuted}>{u.dealer_name ?? '—'}</td>
                                    <td style={tdMuted}>{u.state ?? '—'}</td>
                                    <td style={tdMuted}>{u.district ?? '—'}</td>
                                    <td style={tdStyle}>
                                        <span style={{
                                            display: 'inline-flex', alignItems: 'center', gap: '4px',
                                            padding: '2px 8px', borderRadius: '99px', fontSize: '0.72rem', fontWeight: 600,
                                            background: u.is_approved ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.1)',
                                            color: u.is_approved ? '#059669' : '#dc2626',
                                        }}>
                                            {u.is_approved ? '● Approved' : '● Pending'}
                                        </span>
                                    </td>
                                    <td style={{ ...tdStyle, textAlign: 'right' }}>
                                        <div style={{ display: 'flex', gap: '4px', justifyContent: 'flex-end' }}>
                                            <ActionBtn onClick={() => openView(u)} title="View">👁</ActionBtn>
                                            <ActionBtn onClick={() => openEdit(u)} title="Edit">✏️</ActionBtn>
                                            <ActionBtn danger onClick={() => setDeleteConfirm(u)} title="Delete">🗑</ActionBtn>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {!isLoading && users.length === 0 && (
                                <tr>
                                    <td colSpan={12} style={{ padding: '48px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                        <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🔍</div>
                                        <p style={{ margin: 0, fontWeight: 500 }}>No users found</p>
                                        <p style={{ margin: '4px 0 0', fontSize: '0.8rem' }}>Try adjusting your search or filters</p>
                                    </td>
                                </tr>
                            )}
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
                            Showing {meta.from ?? 0}–{meta.to ?? 0} of <strong style={{ color: 'var(--text-primary)' }}>{meta.total}</strong> users
                        </span>
                        <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                            <PageBtn disabled={page === 1} onClick={() => setPage(1)}>«</PageBtn>
                            <PageBtn disabled={page === 1} onClick={() => setPage(p => p - 1)}>‹</PageBtn>
                            {getPageNumbers(meta.current_page, meta.last_page).map((p, idx) =>
                                p === '...' ? (
                                    <span key={`ellipsis-${idx}`} style={{ padding: '0 4px', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>…</span>
                                ) : (
                                    <PageBtn key={p} active={p === meta.current_page} onClick={() => setPage(p)}>{p}</PageBtn>
                                )
                            )}
                            <PageBtn disabled={page === meta.last_page} onClick={() => setPage(p => p + 1)}>›</PageBtn>
                            <PageBtn disabled={page === meta.last_page} onClick={() => setPage(meta.last_page)}>»</PageBtn>
                        </div>
                    </div>
                )}
            </div>

            {/* ── Delete Confirm Modal ── */}
            <Modal open={!!deleteConfirm} onClose={() => setDeleteConfirm(null)} title="Delete User">
                <p style={{ margin: '0 0 16px', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    Are you sure you want to delete <strong style={{ color: 'var(--text-primary)' }}>{deleteConfirm?.name}</strong>? This cannot be undone.
                </p>
                <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                    <Button variant="secondary" onClick={() => setDeleteConfirm(null)}>Cancel</Button>
                    <Button variant="danger" loading={deleteMutation.isPending} onClick={() => deleteMutation.mutate(deleteConfirm.id)}>Delete</Button>
                </div>
            </Modal>

            {/* ── View Modal ── */}
            <Modal open={modal?.mode === 'view'} onClose={() => setModal(null)} title="User Details">
                {modal?.user && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                        <Field label="Name" value={modal.user.name} />
                        <Field label="Email" value={modal.user.email} />
                        <Field label="Phone" value={modal.user.phone} />
                        <Field label="Username" value={modal.user.username} />
                        <Field label="Role" value={modal.user.role?.name} />
                        <Field label="Dealer" value={modal.user.dealer_name} />
                        <Field label="State" value={modal.user.state} />
                        <Field label="District" value={modal.user.district} />
                        <Field label="Approved" value={modal.user.is_approved ? 'Yes' : 'No'} />
                        <Field label="Created" value={new Date(modal.user.created_at).toLocaleDateString()} />
                    </div>
                )}
            </Modal>

            {/* ── Create / Edit Modal ── */}
            <Modal open={modal?.mode === 'create' || modal?.mode === 'edit'} onClose={() => setModal(null)} title={modal?.mode === 'edit' ? 'Edit User' : 'New User'}>
                <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(form); }} className="space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                        <Input id="uname" label="Name" value={form.name} onChange={set('name')} error={errors.name?.[0]} required />
                        <Input id="uphone" label="Phone" value={form.phone} onChange={set('phone')} error={errors.phone?.[0]} />
                        <Input id="uemail" label="Email" type="email" value={form.email} onChange={set('email')} error={errors.email?.[0]} />
                        <Input id="uusername" label="Username" value={form.username} onChange={set('username')} error={errors.username?.[0]} />
                        <Input id="upassword" label={modal?.mode === 'edit' ? 'New Password (optional)' : 'Password'} type="password" value={form.password} onChange={set('password')} error={errors.password?.[0]} required={modal?.mode === 'create'} />
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Role</label>
                            <select value={form.role_id} onChange={set('role_id')} required style={{ ...selectStyle, height: '38px' }}>
                                <option value="">Select role…</option>
                                {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
                            </select>
                            {errors.role_id && <p style={{ margin: 0, fontSize: '0.72rem', color: '#dc2626' }}>{errors.role_id[0]}</p>}
                        </div>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <label style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Dealer (if staff)</label>
                            <select value={form.dealer_id} onChange={(e) => {
                                const selected = dealers.find(d => String(d.id) === e.target.value);
                                setForm(f => ({ ...f, dealer_id: e.target.value, dealer_name: selected ? selected.dealer_name || selected.name : f.dealer_name }));
                            }} style={{ ...selectStyle, height: '38px' }}>
                                <option value="">None</option>
                                {dealers.map(d => <option key={d.id} value={d.id}>{d.name} — {d.dealer_name}</option>)}
                            </select>
                        </div>
                        <Input id="udealer_name" label="Dealer Name" value={form.dealer_name} onChange={set('dealer_name')} error={errors.dealer_name?.[0]} readOnly={!!form.dealer_id} />
                        <Input id="ustate" label="State" value={form.state} onChange={set('state')} error={errors.state?.[0]} />
                        <Input id="udistrict" label="District" value={form.district} onChange={set('district')} error={errors.district?.[0]} />
                    </div>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.875rem', cursor: 'pointer', color: 'var(--text-primary)' }}>
                        <input type="checkbox" checked={form.is_approved} onChange={set('is_approved')} style={{ accentColor: 'var(--primary)', width: '15px', height: '15px' }} />
                        Approved
                    </label>
                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', paddingTop: '8px' }}>
                        <Button type="button" variant="secondary" onClick={() => setModal(null)}>Cancel</Button>
                        <Button type="submit" loading={saveMutation.isPending}>Save</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

// ── Helpers ──

const selectStyle = {
    height: '36px', padding: '0 10px', borderRadius: '8px', fontSize: '0.82rem',
    border: '1px solid var(--card-border)', background: 'var(--body-bg)',
    color: 'var(--text-primary)', outline: 'none', cursor: 'pointer',
};

function ActionBtn({ children, danger, onClick, title }) {
    return (
        <button onClick={onClick} title={title} style={{
            width: '30px', height: '30px', borderRadius: '7px', border: '1px solid var(--card-border)',
            background: 'transparent', cursor: 'pointer', fontSize: '0.85rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: danger ? '#dc2626' : 'var(--text-secondary)',
            transition: 'background 0.15s, border-color 0.15s',
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
    const pages = [];
    if (current <= 4) {
        pages.push(1, 2, 3, 4, 5, '...', last);
    } else if (current >= last - 3) {
        pages.push(1, '...', last - 4, last - 3, last - 2, last - 1, last);
    } else {
        pages.push(1, '...', current - 1, current, current + 1, '...', last);
    }
    return pages;
}
