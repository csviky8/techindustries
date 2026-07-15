export default function Input({ label, id, error, className = '', ...props }) {
    return (
        <div className="flex flex-col gap-1">
            {label && (
                <label htmlFor={id} className="text-sm font-medium text-gray-700">
                    {label}
                </label>
            )}
            <input
                id={id}
                {...props}
                aria-invalid={!!error}
                aria-describedby={error ? `${id}-error` : undefined}
                className={`rounded-lg border px-3 py-2 text-sm shadow-sm transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 ${error ? 'border-red-400 bg-red-50' : 'border-gray-300 bg-white'} ${className}`}
            />
            {error && (
                <p id={`${id}-error`} role="alert" className="text-xs text-red-600">
                    {error}
                </p>
            )}
        </div>
    );
}
