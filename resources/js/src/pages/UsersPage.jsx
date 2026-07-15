import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUsers, createUser, updateUser, deleteUser } from '../api/admin';
import { getRoles } from '../api/admin';
import Button from '../components/Button';
import Input from '../components/Input';
import Badge from '../components/Badge';
import Modal from '../components/Modal';

const EMPTY = { name: '', email: '', password: '', role_id: '' };

export default function UsersPage() {
    const qc = useQueryClient();
    const [page, setPage] = useState(1);
    const [modal, setModal] = useState(null);
    const [form, setForm] = useState(EMPTY);
    const [errors, setErrors] = useState({});

    const { data } = useQuery({ queryKey: ['users', page], queryFn: () => getUsers(page).then((r) => r.data) });
    const { data: rolesData } = useQuery({ queryKey: ['roles'], queryFn: () => getRoles().then((r) => r.data) });

    const invalidate = () => qc.invalidateQueries({ queryKey: ['users'] });

    const saveMutation = useMutation({
        mutationFn: (f) => modal?.mode === 'edit' ? updateUser(modal.user.id, f) : createUser(f),
        onSuccess: () => { invalidate(); setModal(null); },
        onError: (err) => setErrors(err.response?.data?.errors ?? {}),
    });

    const deleteMutation = useMutation({ mutationFn: deleteUser, onSuccess: invalidate });

    const openCreate = () => { setForm(EMPTY); setErrors({}); setModal({ mode: 'create' }); };
    const openEdit = (u) => { setForm({ name: u.name, email: u.email, password: '', role_id: u.role?.id ?? '' }); setErrors({}); setModal({ mode: 'edit', user: u }); };

    const users = data?.data ?? [];
    const roles = rolesData?.data ?? [];
    const meta = data?.meta;

    return (
        <div>
            <div className="mb-6 flex items-center justify-between">
                <h1 className="text-2xl font-bold text-gray-900">Users</h1>
                <Button onClick={openCreate}>+ New User</Button>
            </div>

            <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                <table className="w-full text-sm">
                    <thead className="border-b border-gray-200 bg-gray-50 text-left text-xs font-medium uppercase tracking-wide text-gray-500">
                        <tr>
                            <th className="px-6 py-3">Name</th>
                            <th className="px-6 py-3">Email</th>
                            <th className="px-6 py-3">Role</th>
                            <th className="px-6 py-3" />
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {users.map((u) => (
                            <tr key={u.id} className="hover:bg-gray-50">
                                <td className="px-6 py-3 font-medium text-gray-900">{u.name}</td>
                                <td className="px-6 py-3 text-gray-500">{u.email}</td>
                                <td className="px-6 py-3"><Badge type={u.role?.slug} label={u.role?.name} /></td>
                                <td className="px-6 py-3">
                                    <div className="flex gap-2 justify-end">
                                        <Button variant="secondary" onClick={() => openEdit(u)}>Edit</Button>
                                        <Button variant="danger" loading={deleteMutation.isPending} onClick={() => deleteMutation.mutate(u.id)}>Delete</Button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                        {users.length === 0 && <tr><td colSpan={4} className="px-6 py-8 text-center text-gray-400">No users found.</td></tr>}
                    </tbody>
                </table>
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

            <Modal open={!!modal} onClose={() => setModal(null)} title={modal?.mode === 'edit' ? 'Edit User' : 'New User'}>
                <form onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(form); }} className="space-y-4">
                    <Input id="uname" label="Name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} error={errors.name?.[0]} required />
                    <Input id="uemail" label="Email" type="email" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} error={errors.email?.[0]} required />
                    <Input id="upassword" label={modal?.mode === 'edit' ? 'New Password (optional)' : 'Password'} type="password" value={form.password} onChange={(e) => setForm((f) => ({ ...f, password: e.target.value }))} error={errors.password?.[0]} required={modal?.mode === 'create'} />
                    <div className="flex flex-col gap-1">
                        <label htmlFor="urole" className="text-sm font-medium text-gray-700">Role</label>
                        <select id="urole" value={form.role_id} onChange={(e) => setForm((f) => ({ ...f, role_id: e.target.value }))} className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500" required>
                            <option value="">Select role…</option>
                            {roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
                        </select>
                        {errors.role_id && <p className="text-xs text-red-600">{errors.role_id[0]}</p>}
                    </div>
                    <div className="flex justify-end gap-2 pt-2">
                        <Button type="button" variant="secondary" onClick={() => setModal(null)}>Cancel</Button>
                        <Button type="submit" loading={saveMutation.isPending}>Save</Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
