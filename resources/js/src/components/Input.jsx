export default function Input({ label, id, error, readOnly, className = '', ...props }) {
    return (
        <div className="flex flex-col gap-1">
            {label && (
                <label htmlFor={id} className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                    {label}
                </label>
            )}
            <input
                id={id}
                readOnly={readOnly}
                {...props}
                aria-invalid={!!error}
                aria-describedby={error ? `${id}-error` : undefined}
                className={`rounded-lg border px-3 py-2 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    readOnly ? 'opacity-60 cursor-not-allowed' : ''
                } ${error ? 'border-red-400 bg-red-50' : 'border-gray-300'} ${className}`}
                style={{ background: readOnly ? 'var(--sidebar-hover)' : 'var(--card-bg)', color: 'var(--text-primary)', borderColor: error ? undefined : 'var(--card-border)' }}
            />
            {error && (
                <p id={`${id}-error`} role="alert" className="text-xs text-red-500">
                    {error}
                </p>
            )}
        </div>
    );
}
