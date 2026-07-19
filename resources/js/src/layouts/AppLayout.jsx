import { useState, useEffect, useRef } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { logout } from '../api/auth';

const icons = {
    dashboard:           '⊞',
    accounts:            '👤',
    authorization:       '🔐',
    'mining-devices':    '⛏️',
    'inventory-request': '📦',
    reports:             '📊',
    'add-on-plan':       '➕',
    'user-manual':       '📖',
    administration:      '🛡️',
    'master-settings':   '⚙️',
    'activity-log':      '📋',
    default:             '◈',
};

function AccordionMenu({ item }) {
    const [open, setOpen] = useState(false);
    const icon = icons[item.slug] ?? icons.default;
    return (
        <div>
            <button onClick={() => setOpen(o => !o)} style={{
                display: 'flex', alignItems: 'center', width: '100%',
                gap: '10px', justifyContent: 'space-between',
                padding: '8px 10px', borderRadius: '8px', border: 'none',
                background: 'transparent', cursor: 'pointer',
                color: 'var(--sidebar-text)', fontSize: '0.875rem', fontWeight: 500,
                transition: 'background 0.18s',
            }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--sidebar-hover)'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
                <span style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                    <span style={{ width: '20px', textAlign: 'center', flexShrink: 0, fontSize: '1rem' }}>{icon}</span>
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</span>
                </span>
                <span style={{
                    fontSize: '0.55rem', opacity: 0.45, flexShrink: 0,
                    display: 'inline-block', transition: 'transform 0.25s ease',
                    transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
                }}>▼</span>
            </button>
            <div style={{
                display: 'grid',
                gridTemplateRows: open ? '1fr' : '0fr',
                transition: 'grid-template-rows 0.28s cubic-bezier(.4,0,.2,1)',
            }}>
                <div style={{ overflow: 'hidden' }}>
                    <div style={{ marginLeft: '30px', marginTop: '2px', marginBottom: '4px', paddingLeft: '10px', borderLeft: '2px solid var(--card-border)' }}>
                        {item.children.map(child => (
                            <NavLink key={child.id} to={child.route || '#'}
                                style={({ isActive }) => ({
                                    display: 'block', padding: '6px 10px', borderRadius: '7px',
                                    fontSize: '0.82rem', fontWeight: 500, textDecoration: 'none',
                                    color: isActive ? 'var(--primary)' : 'var(--sidebar-text)',
                                    background: isActive ? 'var(--primary-light)' : 'transparent',
                                    transition: 'background 0.18s, color 0.18s',
                                })}
                                onMouseEnter={e => { if (!e.currentTarget.classList.contains('active')) e.currentTarget.style.background = 'var(--sidebar-hover)'; }}
                                onMouseLeave={e => { if (!e.currentTarget.classList.contains('active')) e.currentTarget.style.background = 'transparent'; }}
                            >
                                {child.name}
                            </NavLink>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

function MenuItem({ item }) {
    const icon = icons[item.slug] ?? icons.default;
    if (item.children?.length > 0) return <AccordionMenu item={item} />;
    return (
        <NavLink to={item.route || '#'}
            style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '8px 10px', borderRadius: '8px', textDecoration: 'none',
                fontSize: '0.875rem', fontWeight: 500,
                color: isActive ? 'var(--primary)' : 'var(--sidebar-text)',
                background: isActive ? 'var(--primary-light)' : 'transparent',
                transition: 'background 0.18s, color 0.18s',
            })}
        >
            <span style={{ width: '20px', textAlign: 'center', flexShrink: 0, fontSize: '1rem' }}>{icon}</span>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</span>
        </NavLink>
    );
}

function CollapsedItem({ item }) {
    const icon = icons[item.slug] ?? icons.default;
    return (
        <NavLink to={item.route || item.children?.[0]?.route || '#'} title={item.name}
            style={({ isActive }) => ({
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '8px', borderRadius: '8px', textDecoration: 'none', fontSize: '1.1rem',
                color: isActive ? 'var(--primary)' : 'var(--sidebar-text)',
                background: isActive ? 'var(--primary-light)' : 'transparent',
                transition: 'background 0.18s',
            })}
        >{icon}</NavLink>
    );
}

/* ── User dropdown in header ── */
function UserDropdown({ user, dark, toggleDark, onLogout }) {
    const [open, setOpen] = useState(false);
    const ref = useRef(null);
    const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) ?? 'U';

    useEffect(() => {
        const handler = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    return (
        <div ref={ref} style={{ position: 'relative' }}>
            <button onClick={() => setOpen(o => !o)} style={{
                display: 'flex', alignItems: 'center', gap: '8px',
                padding: '5px 10px 5px 5px', borderRadius: '99px',
                border: '1px solid var(--card-border)', background: 'var(--card-bg)',
                cursor: 'pointer', transition: 'box-shadow 0.18s',
            }}>
                <div style={{
                    width: '30px', height: '30px', borderRadius: '50%',
                    background: 'var(--primary)', color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.72rem', fontWeight: 700, flexShrink: 0,
                }}>{initials}</div>
                <div style={{ textAlign: 'left', lineHeight: 1.3 }}>
                    <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>{user?.name}</p>
                    <p style={{ margin: 0, fontSize: '0.7rem', color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{user?.role?.name}</p>
                </div>
                <span style={{ fontSize: '0.55rem', color: 'var(--text-secondary)', marginLeft: '2px' }}>▼</span>
            </button>

            {open && (
                <div style={{
                    position: 'absolute', right: 0, top: 'calc(100% + 8px)',
                    width: '200px', borderRadius: '12px',
                    background: 'var(--card-bg)', border: '1px solid var(--card-border)',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
                    zIndex: 100, overflow: 'hidden',
                    animation: 'fadeSlideIn 0.2s ease both',
                }}>
                    <div style={{ padding: '12px 14px', borderBottom: '1px solid var(--card-border)' }}>
                        <p style={{ margin: 0, fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>{user?.name}</p>
                        <p style={{ margin: 0, fontSize: '0.72rem', color: 'var(--text-secondary)' }}>{user?.email ?? user?.role?.name}</p>
                    </div>
                    <div style={{ padding: '6px' }}>
                        <DropItem icon="🌙" label={dark ? 'Light Mode' : 'Dark Mode'} onClick={() => { toggleDark(); setOpen(false); }} />
                        <NavLink to="/settings" onClick={() => setOpen(false)} style={{ textDecoration: 'none' }}>
                            <DropItem icon="⚙️" label="Settings" />
                        </NavLink>
                        <div style={{ margin: '4px 0', borderTop: '1px solid var(--card-border)' }} />
                        <DropItem icon="🚪" label="Sign out" danger onClick={() => { onLogout(); setOpen(false); }} />
                    </div>
                </div>
            )}
        </div>
    );
}

function DropItem({ icon, label, onClick, danger }) {
    return (
        <button onClick={onClick} style={{
            display: 'flex', alignItems: 'center', gap: '10px', width: '100%',
            padding: '8px 10px', borderRadius: '8px', border: 'none',
            background: 'transparent', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 500,
            color: danger ? '#f43f5e' : 'var(--text-primary)',
            transition: 'background 0.15s',
        }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--sidebar-hover)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
        >
            <span>{icon}</span><span>{label}</span>
        </button>
    );
}

export default function AppLayout() {
    const { user, menus, clearAuth } = useAuthStore();
    const { dark, toggleDark } = useThemeStore();
    const navigate = useNavigate();
    const [collapsed, setCollapsed] = useState(false);

    const handleLogout = async () => {
        void logout().catch(() => {});
        clearAuth();
        navigate('/login');
    };

    return (
        <div style={{ display: 'flex', minHeight: '100vh', background: 'var(--body-bg)' }}>

            {/* ── Sidebar ── */}
            <aside className="sidebar" style={{
                width: collapsed ? '60px' : '240px',
                minWidth: collapsed ? '60px' : '240px',
                transition: 'width 0.3s cubic-bezier(.4,0,.2,1), min-width 0.3s cubic-bezier(.4,0,.2,1)',
                flexShrink: 0, overflow: 'hidden',
                position: 'sticky', top: 0, height: '100vh',
                display: 'flex', flexDirection: 'column',
            }}>
                {/* Logo */}
                <div style={{
                    height: '56px', display: 'flex', alignItems: 'center', flexShrink: 0,
                    padding: '0 12px', borderBottom: '1px solid var(--card-border)',
                    justifyContent: collapsed ? 'center' : 'space-between',
                }}>
                    {!collapsed && (
                        <span style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '1.1rem', letterSpacing: '-0.3px' }}>
                            Aura Industrial
                        </span>
                    )}
                    <button onClick={() => setCollapsed(c => !c)} title={collapsed ? 'Expand' : 'Collapse'} style={{
                        width: '28px', height: '28px', borderRadius: '6px',
                        border: '1px solid var(--card-border)', background: 'var(--sidebar-hover)',
                        color: 'var(--text-secondary)', cursor: 'pointer',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.65rem', flexShrink: 0,
                    }}>
                        {collapsed ? '▶' : '◀'}
                    </button>
                </div>

                {/* Nav */}
                <nav style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', padding: '10px 8px' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        {menus.map(item =>
                            collapsed
                                ? <CollapsedItem key={item.id} item={item} />
                                : <MenuItem key={item.id} item={item} />
                        )}
                    </div>
                </nav>
            </aside>

            {/* ── Right side ── */}
            <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

                {/* ── Top Header ── */}
                <header style={{
                    height: '56px', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '0 24px',
                    background: 'var(--card-bg)',
                    borderBottom: '1px solid var(--card-border)',
                    position: 'sticky', top: 0, zIndex: 50,
                }}>
                    {/* Page breadcrumb placeholder */}
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                        Aura Industrial
                    </div>

                    {/* Right actions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {/* Dark toggle quick button */}
                        <button onClick={toggleDark} title={dark ? 'Light Mode' : 'Dark Mode'} style={{
                            width: '34px', height: '34px', borderRadius: '8px',
                            border: '1px solid var(--card-border)', background: 'var(--card-bg)',
                            cursor: 'pointer', fontSize: '1rem',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'var(--text-secondary)', transition: 'background 0.18s',
                        }}>
                            {dark ? '☀️' : '🌙'}
                        </button>

                        {/* User dropdown */}
                        <UserDropdown
                            user={user}
                            dark={dark}
                            toggleDark={toggleDark}
                            onLogout={handleLogout}
                        />
                    </div>
                </header>

                {/* ── Main content ── */}
                <main style={{
                    flex: 1, overflow: 'auto', padding: '24px',
                    position: 'relative',
                    backgroundImage: dark
                        ? 'url(/app-bg-dark.jpg)'
                        : 'url(/app-bg.jpg)',
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    backgroundAttachment: 'fixed',
                    backgroundRepeat: 'no-repeat',
                }} className="animate-in">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
