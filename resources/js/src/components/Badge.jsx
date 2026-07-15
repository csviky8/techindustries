const colors = {
    active: 'bg-green-100 text-green-800',
    on_hold: 'bg-yellow-100 text-yellow-800',
    completed: 'bg-blue-100 text-blue-800',
    archived: 'bg-gray-100 text-gray-600',
    admin: 'bg-purple-100 text-purple-800',
    manager: 'bg-indigo-100 text-indigo-800',
    user: 'bg-gray-100 text-gray-700',
};

export default function Badge({ label, type }) {
    return (
        <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${colors[type] ?? 'bg-gray-100 text-gray-700'}`}>
            {label ?? type}
        </span>
    );
}
