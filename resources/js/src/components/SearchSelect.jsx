import { useState, useRef, useEffect } from 'react';

/**
 * SearchSelect — lightweight Select2-style searchable dropdown
 *
 * Props:
 *   options   : [{ value, label }]
 *   value     : current value
 *   onChange  : (value) => void
 *   placeholder : string
 *   disabled  : bool
 *   style     : object  (applied to wrapper)
 *   error     : bool
 */
export default function SearchSelect({ options = [], value, onChange, placeholder = 'Select…', disabled = false, style = {}, error = false }) {
    const [open, setOpen]     = useState(false);
    const [query, setQuery]   = useState('');
    const wrapRef             = useRef(null);
    const inputRef            = useRef(null);

    const selected = options.find(o => String(o.value) === String(value));

    const filtered = query
        ? options.filter(o => o.label.toLowerCase().includes(query.toLowerCase()))
        : options;

    // Close on outside click
    useEffect(() => {
        const handler = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const handleOpen = () => {
        if (disabled) return;
        setOpen(true);
        setQuery('');
        setTimeout(() => inputRef.current?.focus(), 0);
    };

    const handleSelect = (opt) => {
        onChange(opt.value);
        setOpen(false);
        setQuery('');
    };

    const handleClear = (e) => {
        e.stopPropagation();
        onChange('');
        setOpen(false);
    };

    const base = {
        position: 'relative',
        width: '100%',
        boxSizing: 'border-box',
        ...style,
    };

    const triggerStyle = {
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '7px 10px', borderRadius: '7px', fontSize: '0.85rem',
        border: `1px solid ${error ? '#ef4444' : open ? 'var(--primary)' : 'var(--card-border)'}`,
        background: disabled ? 'var(--sidebar-hover)' : 'var(--body-bg)',
        color: selected ? 'var(--text-primary)' : 'var(--text-secondary)',
        cursor: disabled ? 'not-allowed' : 'pointer',
        outline: 'none', width: '100%', boxSizing: 'border-box',
        userSelect: 'none', minHeight: '34px',
        opacity: disabled ? 0.65 : 1,
        transition: 'border-color 0.15s',
    };

    const dropStyle = {
        position: 'absolute', top: 'calc(100% + 4px)', left: 0, right: 0,
        background: 'var(--card-bg)', border: '1px solid var(--card-border)',
        borderRadius: '8px', zIndex: 9999, boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
        overflow: 'hidden',
    };

    const searchStyle = {
        width: '100%', padding: '8px 10px', fontSize: '0.82rem',
        border: 'none', borderBottom: '1px solid var(--card-border)',
        background: 'var(--body-bg)', color: 'var(--text-primary)',
        outline: 'none', boxSizing: 'border-box',
    };

    const listStyle = {
        maxHeight: '220px', overflowY: 'auto',
    };

    return (
        <div ref={wrapRef} style={base}>
            {/* Trigger */}
            <div style={triggerStyle} onClick={handleOpen}>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                    {selected ? selected.label : placeholder}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', flexShrink: 0, marginLeft: '6px' }}>
                    {selected && !disabled && (
                        <span
                            onClick={handleClear}
                            style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', lineHeight: 1, padding: '1px 3px', borderRadius: '3px' }}
                            title="Clear"
                        >✕</span>
                    )}
                    <span style={{ fontSize: '0.55rem', color: 'var(--text-secondary)', transition: 'transform 0.2s', display: 'inline-block', transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>▼</span>
                </span>
            </div>

            {/* Dropdown */}
            {open && (
                <div style={dropStyle}>
                    <input
                        ref={inputRef}
                        style={searchStyle}
                        placeholder="Search…"
                        value={query}
                        onChange={e => setQuery(e.target.value)}
                        onKeyDown={e => e.key === 'Escape' && setOpen(false)}
                    />
                    <div style={listStyle}>
                        {filtered.length === 0 ? (
                            <div style={{ padding: '10px 12px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>No results</div>
                        ) : filtered.map(opt => (
                            <div
                                key={opt.value}
                                onClick={() => handleSelect(opt)}
                                style={{
                                    padding: '8px 12px', fontSize: '0.85rem', cursor: 'pointer',
                                    color: String(opt.value) === String(value) ? 'var(--primary)' : 'var(--text-primary)',
                                    background: String(opt.value) === String(value) ? 'var(--primary-light)' : 'transparent',
                                    fontWeight: String(opt.value) === String(value) ? 600 : 400,
                                    transition: 'background 0.1s',
                                }}
                                onMouseEnter={e => { if (String(opt.value) !== String(value)) e.currentTarget.style.background = 'var(--sidebar-hover)'; }}
                                onMouseLeave={e => { if (String(opt.value) !== String(value)) e.currentTarget.style.background = 'transparent'; }}
                            >
                                {opt.label}
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
