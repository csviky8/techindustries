import { useEffect } from 'react';

export default function Modal({ open, onClose, title, children }) {
    useEffect(() => {
        const handler = (e) => e.key === 'Escape' && onClose();
        document.addEventListener('keydown', handler);
        return () => document.removeEventListener('keydown', handler);
    }, [onClose]);

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4" role="dialog" aria-modal="true" aria-labelledby="modal-title">
            <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />
            <div className="relative w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
                <h2 id="modal-title" className="mb-4 text-lg font-semibold text-gray-900">{title}</h2>
                {children}
            </div>
        </div>
    );
}
