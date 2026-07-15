import { useState, useEffect } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useThemeStore } from '../store/themeStore';
import { logout } from '../api/auth';
import { getMenus } from '../api/menus';

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
    default:             '◈',
};

/* ── Accordion parent item ── */
function AccordionMenu({ item }) {
    const [open, setOpen] = useState(false);
    const icon = icons[item.slug] ?? icons.default;

    return (
        <div>
            <button onClick={() => setOpen(o => !o)} className="nav-item" style={{
                display: 'flex', alignItems: 'center', width: '100%',
                gap: '10px', justifyContent: 'space-between',
            }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                    <span style={{ fontSize: '1rem', width: '20px', textAlign: 'center', flexShrink: 0 }}>{icon}</span>
                    <span style={{ truncate: true, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</span>
                </span>
                <span style={{
                    fontSize: '0.55rem',
                    opacity: 0.5,
                    flexShrink: 0,
                    transition: 'transform 0.25s ease',
                    transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
                    display: 'inline-block',
                }}>▼</span>
            </button>

            <div style={{
                display: 'grid',
                gridTemplateRows: open ? '1fr' : '0fr',
                transition: 'grid-template-rows 0.28s cubic-bezier(.4,0,.2,1)',
            }}>
                <div style={{ overflow: 'hidden' }}>
                    <div style={{
                        marginLeft: '30px',
                        marginTop: '2px',
                        marginBottom: '4px',
                        paddingLeft: '12px',
                        borderLeft: '2px solid var(--card-border)',
                    }}>
                        {item.children.map(child => (
                            <NavLink key={child.id} to={child.route || '#'}
                                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
                                style={{ display: 'block', fontSize: '0.82rem', padding: '6px 10px' }}
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

/* ── Simple nav item ── */
function MenuItem({ item }) {
    const icon = icons[item.slug] ?? icons.default;
    if (item.children?.length > 0) return <AccordionMenu item={item} />;
    return (
        <NavLink to={item.route || '#'}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            style={{ display: 'flex', alignItems: 'center', gap: '10px' }}
        >
            <span style={{ fontSize: '1rem', width: '20px', textAlign: 'center', flexShrink: 0 }}>{icon}</span>
            <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.name}</span>
        </NavLink>
    );
}

/* ── Icon-only collapsed item ── */
function CollapsedItem({ item }) {
    const icon = icons[item.slug] ?? icons.default;
    return (
        <NavLink to={item.route || item.children?.[0]?.route || '#'} title={item.name}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', padding: '8px' }}
        >
            {icon}
        </NavLink>
    );
}

/* ── Bottom action button ── */
function ActionBtn({ onClick, to, title, icon, label, danger, collapsed }) {
    const style = {
        display: 'flex', alignItems: 'center',
        justifyContent: collapsed ? 'center' : 'flex-start',
        gap: '8px', padding: '8px 12px', borderRadius: '8px',
        border: `1px solid ${danger ? '#fecdd3' : 'var(--card-border)'}`,
        background: 'transparent',
        color: danger ? '#f43f5e' : 'var(--text-secondary)',
        cursor: 'pointer', fontSize: '0.82rem', fontWeight: 500,
        textDecoration: 'none', whiteSpace: 'nowrap',
        transition: 'background 0.18s, border-color 0.18s',
        width: collapsed ? '40px' : '100%',
        height: '36px',
    };

    const content = (
        <>
            <span style={{ fontSize: '0.95rem', flexShrink: 0 }}>{icon}</span>
            {!collapsed && <span>{label}</span>}
        </>
    );

    if (to) return <NavLink to={to} title={title} style={({ isActive }) => ({
        ...style,
        borderColor: isActive ? 'var(--primary)' : style.border.replace('1px solid ', ''),
        color: isActive ? 'var(--primary)' : style.color,
        background: isActive ? 'var(--primary-light)' : 'transparent',
    })}>{content}</NavLink>;

    return <button onClick={onClick} title={title} style={style}>{content}</button>;
}

/* ── Main layout ── */
export default function AppLayout() {
    const { user, clearAuth } = useAuthStore();
    const { dark, toggleDark } = useThemeStore();
    const navigate = useNavigate();
    const [menus, setMenus] = useState([]);
    const [collapsed, setCollapsed] = useState(false);

    useEffect(() => { getMenus().then(setMenus).catch(() => {}); }, []);

    const handleLogout = async () => {
        await logout().catch(() => {});
        clearAuth();
        navigate('/login');
    };

    const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) ?? 'U';

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

                {/* Logo row */}
                <div style={{
                    height: '56px', display: 'flex', alignItems: 'center', flexShrink: 0,
                    padding: '0 12px', borderBottom: '1px solid var(--card-border)',
                    justifyContent: collapsed ? 'center' : 'space-between',
                }}>
                    {!collapsed && (
                        <span style={{ color: 'var(--primary)', fontWeight: 700, fontSize: '1.05rem', letterSpacing: '-0.3px' }}>
                            SafeTek
                        </span>
                    )}
                    <button onClick={() => setCollapsed(c => !c)} title={collapsed ? 'Expand' : 'Collapse'} style={{
                        width: '28px', height: '28px', borderRadius: '6px', border: '1px solid var(--card-border)',
                        background: 'var(--sidebar-hover)', color: 'var(--text-secondary)',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.65rem', flexShrink: 0, transition: 'background 0.2s',
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

                {/* ── Bottom ── */}
                <div style={{ flexShrink: 0, borderTop: '1px solid var(--card-border)' }}>

                    {/* User card — expanded only */}
                    {!collapsed && (
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '10px',
                            padding: '12px 14px', borderBottom: '1px solid var(--card-border)',
                        }}>
                            <div style={{
                                width: '36px', height: '36px', borderRadius: '50%',
                                background: 'var(--primary)', color: '#fff',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                fontSize: '0.8rem', fontWeight: 700, flexShrink: 0,
                            }}>{initials}</div>
                            <div style={{ minWidth: 0 }}>
                                <p style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '0.875rem', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</p>
                                <p style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', margin: 0, textTransform: 'capitalize' }}>{user?.role?.name}</p>
                            </div>
                        </div>
                    )}

                    {/* Action buttons */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '8px' }}>
                        <ActionBtn
                            onClick={toggleDark}
                            title={dark ? 'Light Mode' : 'Dark Mode'}
                            icon={dark ? '☀️' : '🌙'}
                            label={dark ? 'Light Mode' : 'Dark Mode'}
                            collapsed={collapsed}
                        />
                        <ActionBtn
                            to="/settings"
                            title="Settings"
                            icon="⚙️"
                            label="Settings"
                            collapsed={collapsed}
                        />
                        <ActionBtn
                            onClick={handleLogout}
                            title="Sign out"
                            icon="🚪"
                            label="Sign out"
                            danger
                            collapsed={collapsed}
                        />
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <main style={{ flex: 1, overflow: 'auto', padding: '24px' }} className="animate-in">
                <Outlet />
            </main>
        </div>
    );
}
