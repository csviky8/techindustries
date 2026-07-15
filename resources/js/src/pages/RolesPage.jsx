import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getRoles, createRole, updateRole, deleteRole } from '../api/admin';
import Button from '../components/Button';
import Input from '../components/Input';
import Modal from '../components/Modal';

const EMPTY = { name: '', slug: '', description: '' };

export default function RolesPage() {
    const qc = useQueryClient();
    const [modal, setModal] = useState(null);
    const [form, setForm] = useState(EMPTY);
    const [errors, setErrors] = useState({});

    const { data } = useQuery({ queryKey: ['roles'], queryFn: () => getRoles().then((r) => r.data) });

    const invalidate = () => qc.invalidateQueries({ queryKey: ['roles'] });

    const saveMutation = useMutation({
        mutationFn: (f) => modal?.mode === 'edit' ? updateRole(modal.role.id, f) : createRole(f),
        onSuccess: () => { invalidate(); setModal(null); },
        onError: (err) => setErrors(err.response?.data?.errors ?? {}),
    });

    const deleteMutation = useMutation({ mutationFn: deleteRole, onSuccess: invalidate });

    const openCreate = () => { setForm(EMPTY); setErrors({}); setModal({ mode: 'create' }); };
    const openEdit = (r) => { setForm({ name: r.name, slug: r.slug, description: r.description ?? '' }); setErrors({}); setModal({ mode: 'edit', role: r }); };

    const roles = data?.data ?? [];

    return (
        <div>
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Roles</h1>
                <Button onClick={openCreate}>+ New Role</Button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {roles.map((r) => (
                    <div key={r.id} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                        <div className="mb-1 flex items-start justify-between">
                            <h2 className="font-semibold text-gray-900">{r.name}</h2>
                            <span className="rounded bg-gray-100 px-2 py-0.5 text-xs font-mono text-gray-500">{r.slug}</span>
                        </div>
                        <p className="mb-4 text-sm text-gray-500">{r.description ?? 'No description.'}</p>
                        <div className="mb-4 flex flex-wrap gap-1">
                            {r.permissions?.map((p) => (
                                <span key={p.id} className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs text-indigo-700">{p.name}</span>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <Button variant="secondary" onClick={() => openEdit(r)}>Edit</Button>
                            <Button variant="danger" loading={deleteMutation.isPending} onClick={() => deleteMutation.mutate(r.id)}>Delete</Button>
                        </div>
                    </div>
                ))}
                {roles.length === 0 && <p className="text-sm text-gray-400">No roles found.</p>}
            </div>

            <Modal open={!!modal} onClose={() => setModal(null)} title={modal?.mode === 'edit' ? 'Edit Role' : 'New Role'}>
                <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(form); }} className="space-y-4">
                    <Input id="rname" label="Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} error={errors.name?.[0]} required />
                    <Input id="rslug" label="Slug" value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} error={errors.slug?.[0]} required disabled={modal?.mode === 'edit'} />
                    <Input id="rdesc" label="Description" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} error={errors.description?.[0]} />
                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="secondary" onClick={() => setModal(null)}>Cancel</Button>
                        <Button type="submit" loading={saveMutation.isPending}>Save</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
