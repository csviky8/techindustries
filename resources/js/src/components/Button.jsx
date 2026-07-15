const variants = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 focus-visible:ring-indigo-500',
    secondary: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus-visible:ring-gray-400',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500',
};

export default function Button({ children, variant = 'primary', loading = false, className = '', ...props }) {
    return (
        <button
            {...props}
            disabled={loading || props.disabled}
            className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
        >
            {loading && (
                <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                </svg>
            )}
            {children}
        </button>
    );
}
