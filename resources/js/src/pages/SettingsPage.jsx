import { useThemeStore, themes } from '../store/themeStore';

export default function SettingsPage() {
    const { theme, dark, setTheme, toggleDark } = useThemeStore();

    return (
        <div className="animate-in max-w-xl">
            <h1 className="text-2xl font-bold mb-1" style={{ color: 'var(--text-primary)' }}>Settings</h1>
            <p className="text-sm mb-8" style={{ color: 'var(--text-secondary)' }}>Customize your experience</p>

            {/* Dark / Light */}
            <div className="card p-5 mb-6">
                <h2 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Appearance</h2>
                <div className="flex gap-3">
                    {['light', 'dark'].map(mode => (
                        <button
                            key={mode}
                            onClick={() => { if ((mode === 'dark') !== dark) toggleDark(); }}
                            className="flex-1 rounded-xl border-2 p-4 text-center transition-all"
                            style={{
                                borderColor: (mode === 'dark') === dark ? 'var(--primary)' : 'var(--card-border)',
                                background: 'var(--card-bg)',
                                color: 'var(--text-primary)',
                                transform: (mode === 'dark') === dark ? 'scale(1.03)' : 'scale(1)',
                            }}
                        >
                            <div className="text-3xl mb-2">{mode === 'dark' ? '🌙' : '☀️'}</div>
                            <div className="text-sm font-medium capitalize">{mode}</div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Color themes */}
            <div className="card p-5">
                <h2 className="font-semibold mb-4" style={{ color: 'var(--text-primary)' }}>Color Theme</h2>
                <div className="grid grid-cols-4 gap-3">
                    {themes.map(t => (
                        <button
                            key={t.value}
                            onClick={() => setTheme(t.value)}
                            title={t.name}
                            className="flex flex-col items-center gap-2 rounded-xl border-2 p-3 transition-all"
                            style={{
                                borderColor: theme === t.value ? t.primary : 'var(--card-border)',
                                background: 'var(--card-bg)',
                                transform: theme === t.value ? 'scale(1.06)' : 'scale(1)',
                            }}
                        >
                            <span
                                className="h-8 w-8 rounded-full shadow-md"
                                style={{ background: t.primary, display: 'block' }}
                            />
                            <span className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>{t.name}</span>
                            {theme === t.value && (
                                <span className="text-xs font-bold" style={{ color: t.primary }}>✓</span>
                            )}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}
