import { useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function Modal({ open, onClose, title, headerActions, children, maxWidth = '520px' }) {
    useEffect(() => {
        if (!open) return;
        const handler = (e) => e.key === 'Escape' && onClose();
        document.addEventListener('keydown', handler);
        document.body.style.overflow = 'hidden';
        return () => {
            document.removeEventListener('keydown', handler);
            document.body.style.overflow = '';
        };
    }, [open, onClose]);

    if (!open) return null;

    return createPortal(
        <div style={{
            position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
            zIndex: 9999,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '16px',
        }} role="dialog" aria-modal="true" aria-labelledby="modal-title">

            {/* Backdrop */}
            <div
                onClick={onClose}
                aria-hidden="true"
                style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    background: 'rgba(0,0,0,0.5)',
                    backdropFilter: 'blur(3px)',
                }}
            />

            {/* Modal box */}
            <div style={{
                position: 'relative',
                width: '100%',
                maxWidth,
                borderRadius: '16px',
                background: 'var(--card-bg)',
                border: '1px solid var(--card-border)',
                boxShadow: '0 24px 80px rgba(0,0,0,0.3)',
                maxHeight: '90vh',
                display: 'flex',
                flexDirection: 'column',
                animation: 'fadeSlideIn 0.2s ease both',
            }}>
                {/* Sticky header */}
                <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '18px 24px 14px',
                    borderBottom: '1px solid var(--card-border)',
                    flexShrink: 0,
                }}>
                    <h2 id="modal-title" style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {title}
                    </h2>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                        {headerActions}
                        <button onClick={onClose} style={{
                            width: '28px', height: '28px', borderRadius: '7px',
                            border: '1px solid var(--card-border)', background: 'transparent',
                            cursor: 'pointer', fontSize: '0.9rem', color: 'var(--text-secondary)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            flexShrink: 0,
                        }}>✕</button>
                    </div>
                </div>
                {/* Scrollable body */}
                <div style={{ overflowY: 'auto', padding: '20px 24px', flex: 1 }}>
                    {children}
                </div>
            </div>
        </div>,
        document.body
    );
}
