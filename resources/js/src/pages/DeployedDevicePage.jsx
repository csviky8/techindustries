import { useRef, useState } from 'react';
import { keepPreviousData, useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import Button from '../components/Button';
import Input from '../components/Input';
import Modal from '../components/Modal';
import { createDevice, getDevices } from '../api/devices';

const PER_PAGE_OPTIONS = [10, 15, 25, 50];

const EMPTY_FORM = {
    imei: '',
    device_model: '',
    part_no: '',
    serial_no: '',
    iccid_1: '',
    iccid_2: '',
    sim_1: '',
    sim_2: '',
    new_vehicle: 'No',
    status: true,
};

const DEVICE_FIELDS = [
    { key: 'device_model', label: 'MODEL', placeholder: 'Device model' },
    { key: 'part_no', label: 'PART NO', placeholder: 'Part number' },
    { key: 'serial_no', label: 'SERIAL NO', placeholder: 'Serial number' },
    { key: 'imei', label: 'IMEI NO', placeholder: 'IMEI number', required: true },
    { key: 'iccid_1', label: 'ICCID NO1', placeholder: 'ICCID number 1' },
    { key: 'iccid_2', label: 'ICCID NO2', placeholder: 'ICCID number 2' },
    { key: 'sim_1', label: 'SIM1', placeholder: 'SIM 1' },
    { key: 'sim_2', label: 'SIM2', placeholder: 'SIM 2' },
];

function Badge({ active }) {
    return (
        <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '2px 10px',
            borderRadius: '99px',
            fontSize: '0.72rem',
            fontWeight: 600,
            background: active ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.1)',
            color: active ? '#059669' : '#dc2626',
        }}>
            {active ? 'Active' : 'Inactive'}
        </span>
    );
}

export default function DeployedDevicePage() {
    const qc = useQueryClient();
    const searchTimer = useRef(null);

    const [page, setPage] = useState(1);
    const [perPage, setPerPage] = useState(10);
    const [search, setSearch] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [form, setForm] = useState(EMPTY_FORM);
    const [errors, setErrors] = useState({});

    const queryParams = {
        page,
        per_page: perPage,
        search: search || undefined,
    };

    const { data, isLoading, isFetching } = useQuery({
        queryKey: ['devices', queryParams],
        queryFn: () => getDevices(queryParams).then(r => r.data),
        placeholderData: keepPreviousData,
    });

    const saveMutation = useMutation({
        mutationFn: createDevice,
        onSuccess: () => {
            qc.invalidateQueries({ queryKey: ['devices'] });
            setModalOpen(false);
            setForm(EMPTY_FORM);
            setErrors({});
        },
        onError: (err) => {
            setErrors(err.response?.data?.errors ?? {});
        },
    });

    const devices = data?.data ?? [];
    const meta = data?.meta;

    const openCreate = () => {
        setForm(EMPTY_FORM);
        setErrors({});
        setModalOpen(true);
    };

    const handleSearch = (value) => {
        clearTimeout(searchTimer.current);
        searchTimer.current = setTimeout(() => {
            setSearch(value);
            setPage(1);
        }, 300);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        saveMutation.mutate(form);
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
                <div>
                    <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>Deployed Device</h1>
                    <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                        Add devices manually or via Excel using the same master columns
                    </p>
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                    <Button variant="secondary" onClick={() => window.open('/api/v1/settings/devices/template', '_blank')}>
                        Download Template
                    </Button>
                    <Button onClick={openCreate}>+ Add New</Button>
                </div>
            </div>

            <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '10px',
                flexWrap: 'wrap',
                padding: '12px 16px',
                borderRadius: '12px',
                background: 'var(--card-bg)',
                border: '1px solid var(--card-border)',
            }}>
                <div style={{ display: 'flex', gap: '10px', flex: '1 1 260px', minWidth: '220px' }}>
                    <input
                        placeholder="Search IMEI, model, serial no..."
                        onChange={e => handleSearch(e.target.value)}
                        style={{
                            width: '100%',
                            height: '36px',
                            borderRadius: '8px',
                            padding: '0 12px',
                            border: '1px solid var(--card-border)',
                            background: 'var(--body-bg)',
                            color: 'var(--text-primary)',
                            outline: 'none',
                            boxSizing: 'border-box',
                            fontSize: '0.85rem',
                        }}
                    />
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>Show</span>
                    <select
                        value={perPage}
                        onChange={e => { setPerPage(Number(e.target.value)); setPage(1); }}
                        style={{
                            height: '36px',
                            borderRadius: '8px',
                            padding: '0 10px',
                            border: '1px solid var(--card-border)',
                            background: 'var(--body-bg)',
                            color: 'var(--text-primary)',
                            fontSize: '0.85rem',
                        }}
                    >
                        {PER_PAGE_OPTIONS.map(n => <option key={n} value={n}>{n}</option>)}
                    </select>
                </div>
            </div>

            <div style={{
                borderRadius: '12px',
                border: '1px solid var(--card-border)',
                background: 'var(--card-bg)',
                overflow: 'hidden',
            }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                        <thead style={{ background: 'var(--sidebar-hover)', borderBottom: '2px solid var(--card-border)' }}>
                            <tr>
                                <th style={thStyle}>#</th>
                                <th style={thStyle}>IMEI</th>
                                <th style={thStyle}>Model</th>
                                <th style={thStyle}>Serial No</th>
                                <th style={thStyle}>Part No</th>
                                <th style={thStyle}>SIM 1</th>
                                <th style={thStyle}>SIM 2</th>
                                <th style={thStyle}>New Vehicle</th>
                                <th style={thStyle}>Status</th>
                            </tr>
                        </thead>
                        <tbody style={{ opacity: isFetching && !isLoading ? 0.5 : 1, transition: 'opacity 0.2s' }}>
                            {isLoading ? (
                                Array.from({ length: 6 }).map((_, idx) => (
                                    <tr key={idx} style={{ borderBottom: '1px solid var(--card-border)' }}>
                                        {Array.from({ length: 9 }).map((__, cell) => (
                                            <td key={cell} style={{ padding: '12px 14px' }}>
                                                <div style={{ height: '12px', width: cell === 0 ? 30 : 90, borderRadius: '6px', background: 'var(--sidebar-hover)', animation: 'pulse 1.4s ease-in-out infinite' }} />
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : devices.length === 0 ? (
                                <tr>
                                    <td colSpan={9} style={{ padding: '48px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                        <div style={{ fontSize: '2rem', marginBottom: '8px' }}>📦</div>
                                        <p style={{ margin: 0, fontWeight: 600 }}>No deployed devices found</p>
                                        <p style={{ margin: '4px 0 0', fontSize: '0.8rem' }}>Click Add New to create the first entry</p>
                                    </td>
                                </tr>
                            ) : devices.map((device, idx) => (
                                <tr key={device.id} style={{ borderBottom: '1px solid var(--card-border)' }}>
                                    <td style={tdMuted}>{((meta?.current_page ?? 1) - 1) * perPage + idx + 1}</td>
                                    <td style={tdMono}>{device.imei || '—'}</td>
                                    <td style={tdText}>{device.device_model || '—'}</td>
                                    <td style={tdText}>{device.serial_no || '—'}</td>
                                    <td style={tdText}>{device.part_no || '—'}</td>
                                    <td style={tdText}>{device.sim_1 || '—'}</td>
                                    <td style={tdText}>{device.sim_2 || '—'}</td>
                                    <td style={tdText}>{device.new_vehicle || '—'}</td>
                                    <td style={tdText}><Badge active={!!device.status} /></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {meta && meta.last_page > 1 && (
                    <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        gap: '10px',
                        flexWrap: 'wrap',
                        padding: '10px 16px',
                        borderTop: '1px solid var(--card-border)',
                    }}>
                        <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                            Showing {meta.from ?? 0}-{meta.to ?? 0} of {meta.total} devices
                        </span>
                        <div style={{ display: 'flex', gap: '6px' }}>
                            <Button variant="secondary" disabled={page === 1} onClick={() => setPage(1)}>First</Button>
                            <Button variant="secondary" disabled={page === 1} onClick={() => setPage(p => p - 1)}>Prev</Button>
                            <Button variant="secondary" disabled={page === meta.last_page} onClick={() => setPage(p => p + 1)}>Next</Button>
                            <Button variant="secondary" disabled={page === meta.last_page} onClick={() => setPage(meta.last_page)}>Last</Button>
                        </div>
                    </div>
                )}
            </div>

            <Modal
                open={modalOpen}
                onClose={() => setModalOpen(false)}
                title="Add New Device"
                maxWidth="820px"
            >
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    <div style={{
                        padding: '12px 14px',
                        borderRadius: '10px',
                        border: '1px solid rgba(99,102,241,0.2)',
                        background: 'rgba(99,102,241,0.08)',
                        color: 'var(--text-primary)',
                        fontSize: '0.82rem',
                    }}>
                        These inputs match the Excel upload columns. IMEI is required and must be unique.
                    </div>

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
                        gap: '14px',
                    }}>
                        {DEVICE_FIELDS.map(field => (
                            <Input
                                key={field.key}
                                id={field.key}
                                label={field.label}
                                value={form[field.key]}
                                placeholder={field.placeholder}
                                required={field.required}
                                error={errors[field.key]?.[0]}
                                onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
                            />
                        ))}

                        <div className="flex flex-col gap-1">
                            <label htmlFor="new_vehicle" className="text-xs font-medium" style={{ color: 'var(--text-secondary)' }}>
                                NEW VEHICLE YES/NO
                            </label>
                            <select
                                id="new_vehicle"
                                value={form.new_vehicle}
                                onChange={e => setForm(f => ({ ...f, new_vehicle: e.target.value }))}
                                className="rounded-lg border px-3 py-2 text-sm"
                                style={{ background: 'var(--card-bg)', color: 'var(--text-primary)', borderColor: errors.new_vehicle ? '#f87171' : 'var(--card-border)' }}
                            >
                                <option value="No">No</option>
                                <option value="Yes">Yes</option>
                            </select>
                            {errors.new_vehicle && (
                                <p className="text-xs text-red-500">{errors.new_vehicle[0]}</p>
                            )}
                        </div>

                        <div className="flex items-center gap-3 rounded-lg border px-3 py-2" style={{ borderColor: 'var(--card-border)' }}>
                            <input
                                id="status"
                                type="checkbox"
                                checked={!!form.status}
                                onChange={e => setForm(f => ({ ...f, status: e.target.checked }))}
                            />
                            <label htmlFor="status" className="text-sm" style={{ color: 'var(--text-primary)' }}>
                                Active
                            </label>
                        </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', paddingTop: '4px' }}>
                        <Button type="button" variant="secondary" onClick={() => setModalOpen(false)}>
                            Cancel
                        </Button>
                        <Button type="submit" loading={saveMutation.isPending}>
                            Save Device
                        </Button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}

const thStyle = {
    padding: '12px 14px',
    textAlign: 'left',
    fontSize: '0.72rem',
    fontWeight: 700,
    color: 'var(--text-secondary)',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    whiteSpace: 'nowrap',
};

const tdText = {
    padding: '11px 14px',
    fontSize: '0.85rem',
    color: 'var(--text-primary)',
    whiteSpace: 'nowrap',
};

const tdMuted = {
    ...tdText,
    color: 'var(--text-secondary)',
    width: '52px',
};

const tdMono = {
    ...tdText,
    fontFamily: 'monospace',
    fontSize: '0.82rem',
};
