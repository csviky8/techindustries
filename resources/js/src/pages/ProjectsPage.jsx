import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProjects, createProject, updateProject, deleteProject } from '../api/projects';
import Button from '../components/Button';
import Input from '../components/Input';
import Badge from '../components/Badge';
import Modal from '../components/Modal';

const STATUSES = ['active', 'on_hold', 'completed', 'archived'];
const EMPTY = { name: '', description: '', status: 'active', due_date: '' };

export default function ProjectsPage() {
    const qc = useQueryClient();
    const [page, setPage] = useState(1);
    const [modal, setModal] = useState(null); // null | { mode: 'create'|'edit', project? }
    const [form, setForm] = useState(EMPTY);
    const [errors, setErrors] = useState({});

    const { data, isLoading } = useQuery({
        queryKey: ['projects', page],
        queryFn: () => getProjects(page).then((r) => r.data),
    });

    const invalidate = () => qc.invalidateQueries({ queryKey: ['projects'] });

    const saveMutation = useMutation({
        mutationFn: (f) =>
            modal?.mode === 'edit' ? updateProject(modal.project.id, f) : createProject(f),
        onSuccess: () => { invalidate(); closeModal(); },
        onError: (err) => setErrors(err.response?.data?.errors ?? {}),
    });

    const deleteMutation = useMutation({
        mutationFn: deleteProject,
        onSuccess: invalidate,
    });

    const openCreate = () => { setForm(EMPTY); setErrors({}); setModal({ mode: 'create' }); };
    const openEdit = (p) => { setForm({ name: p.name, description: p.description ?? '', status: p.status, due_date: p.due_date ?? '' }); setErrors({}); setModal({ mode: 'edit', project: p }); };
    const closeModal = () => setModal(null);

    const handleSubmit = (e) => { e.preventDefault(); saveMutation.mutate(form); };

    const projects = data?.data ?? [];
    const meta = data?.meta;

    return (
        <div>
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Projects</h1>
                <Button onClick={openCreate}>+ New Project</Button>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                {isLoading ? (
                    <div className="p-6 text-sm text-gray-400">Loading…</div>
                ) : (
                    <table className="w-full text-sm">
                        <thead className="border-b border-gray-200 bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                            <tr>
                                <th className="px-6 py-3">Name</th>
                                <th className="px-6 py-3">Status</th>
                                <th className="px-6 py-3">Due Date</th>
                                <th className="px-6 py-3">Owner</th>
                                <th className="px-6 py-3" />
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {projects.map((p) => (
                                <tr key={p.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-3 font-medium text-gray-900">{p.name}</td>
                                    <td className="px-6 py-3"><Badge type={p.status} /></td>
                                    <td className="px-6 py-3 text-gray-500">{p.due_date ?? '—'}</td>
                                    <td className="px-6 py-3 text-gray-500">{p.owner?.name}</td>
                                    <td className="px-6 py-3">
                                        <div className="flex gap-2 justify-end">
                                            <Button variant="secondary" onClick={() => openEdit(p)}>Edit</Button>
                                            <Button variant="danger" loading={deleteMutation.isPending} onClick={() => deleteMutation.mutate(p.id)}>Delete</Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {projects.length === 0 && (
                                <tr><td colSpan={5} className="px-6 py-8 text-center text-gray-400">No projects found.</td></tr>
                            )}
                        </tbody>
                    </table>
                )}
                {meta && meta.last_page > 1 && (
                    <div className="flex items-center justify-between border-t border-gray-200 px-6 py-3">
                        <span className="text-xs text-gray-500">Page {meta.current_page} of {meta.last_page}</span>
                        <div className="flex gap-2">
                            <Button variant="secondary" disabled={page === 1} onClick={() => setPage((p) => p - 1)}>Prev</Button>
                            <Button variant="secondary" disabled={page === meta.last_page} onClick={() => setPage((p) => p + 1)}>Next</Button>
                        </div>
                    </div>
                )}
            </div>

            <Modal open={!!modal} onClose={closeModal} title={modal?.mode === 'edit' ? 'Edit Project' : 'New Project'}>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <Input id="name" label="Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} error={errors.name?.[0]} required />
                    <div className="flex flex-col gap-1">
                        <label htmlFor="description" className="text-sm font-medium text-gray-700">Description</label>
                        <textarea id="description" rows={3} value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label htmlFor="status" className="text-sm font-medium text-gray-700">Status</label>
                        <select id="status" value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value }))} className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500">
                            {STATUSES.map((s) => <option key={s} value={s}>{s.replace('_', ' ')}</option>)}
                        </select>
                    </div>
                    <Input id="due_date" label="Due Date" type="date" value={form.due_date} onChange={(e) => setForm((f) => ({ ...f, due_date: e.target.value }))} error={errors.due_date?.[0]} />
                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="secondary" onClick={closeModal}>Cancel</Button>
                        <Button type="submit" loading={saveMutation.isPending}>Save</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
