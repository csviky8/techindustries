import { useState, useEffect, useCallback, useRef } from 'react';
import api from '../api/client';
import Modal from '../components/Modal';
import SearchSelect from '../components/SearchSelect';

const MANUFACTURERS = [
    'AARGEE EQUIPMENTS PRIVATE LIMITED',
    'ACUTE COMMUNICATION SERVICES PVT LTD',
    'CONTAINE TECHNOLOGIES PRIVATE LIMITED',
    'Craysol Technologies India Pvt Ltd',
    'ECOGAS IMPEX PVT LTD',
    'GRL Engineers Private Limited',
    'Markon Electronics Corporation Private Limited',
    'RDM Enterprises',
    'TEDI ELITE PRIVATE LIMITED',
    'Transight Systems Private Limited',
    'Volty IOT Solutions Private Limited',
];

const inp = {
    padding: '7px 10px', borderRadius: '7px', fontSize: '0.8rem',
    border: '1px solid var(--card-border)', background: 'var(--body-bg)',
    color: 'var(--text-primary)', outline: 'none', width: '100%', boxSizing: 'border-box',
};

const iconBtn = (color = 'var(--primary)') => ({
    width: '32px', height: '32px', borderRadius: '8px', border: `1px solid ${color}`,
    background: 'transparent', cursor: 'pointer', display: 'flex',
    alignItems: 'center', justifyContent: 'center', color, flexShrink: 0,
});

const STATUS_COLORS = {
    Approved: { bg: 'rgba(16,185,129,0.12)', color: '#059669', border: 'rgba(16,185,129,0.3)' },
    Rejected: { bg: 'rgba(239,68,68,0.1)', color: '#dc2626', border: 'rgba(239,68,68,0.25)' },
    Pending:  { bg: 'rgba(245,158,11,0.1)', color: '#b45309', border: 'rgba(245,158,11,0.3)' },
};

const Badge = ({ status }) => {
    const s = STATUS_COLORS[status] || STATUS_COLORS.Pending;
    return (
        <span style={{
            fontSize: '0.7rem', fontWeight: 700, padding: '2px 8px', borderRadius: '20px',
            background: s.bg, color: s.color, border: `1px solid ${s.border}`,
        }}>{status}</span>
    );
};

const VEHICLE_TYPES = [
    '5 Seater Motorcab', '7 Seater Motorcab', '8 Seater Maxicab',
    '13 Seater Maxicab', '21 Seater Bus', '30+ Seater Bus',
    '50+ Seater Bus', 'Goods Vehicle', 'Tractor', 'Car',
];

const Section = ({ title, children }) => (
    <div style={{ marginBottom: '16px' }}>
        <div style={{
            fontSize: '0.7rem', fontWeight: 700, color: 'var(--primary)',
            textTransform: 'uppercase', letterSpacing: '0.08em',
            borderBottom: '1px solid var(--card-border)', paddingBottom: '5px', marginBottom: '8px',
        }}>{title}</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px 16px' }}>
            {children}
        </div>
    </div>
);

const Field = ({ label, value }) => (
    <div>
        <div style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 2 }}>{label}</div>
        <div style={{ fontSize: '0.82rem', color: 'var(--text-primary)', fontWeight: 500, wordBreak: 'break-word' }}>
            {value || <span style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>—</span>}
        </div>
    </div>
);

const DOC_FIELDS = [
    { field: 'rc_book_file',        label: 'RC Book',              icon: '📄', accept: '.pdf,.jpg,.jpeg,.png' },
    { field: 'device_fitment_file', label: 'Device Fitment Photo', icon: '📷', accept: '.jpg,.jpeg,.png' },
    { field: 'vehicle_image',       label: 'Vehicle Image',        icon: '🚗', accept: '.jpg,.jpeg,.png' },
    { field: 'temp_certificate_file', label: 'Temporary Certificate', icon: '📋', accept: '.pdf,.jpg,.jpeg,.png' },
];

const getFileBaseUrl = () => {
    const apiBase = import.meta.env.VITE_API_URL ?? '/api/v1';
    try {
        const url = new URL(apiBase, window.location.origin);
        return url.pathname.replace(/\/api\/v1\/?$/, '') ? `${url.origin}${url.pathname.replace(/\/api\/v1\/?$/, '')}` : url.origin;
    } catch {
        return window.location.origin;
    }
};

const downloadRemoteFile = async (fileUrl, fileName) => {
    const res = await fetch(fileUrl, {
        credentials: 'include',
        headers: { Accept: '*/*' },
    });

    if (!res.ok) {
        throw new Error(`Download failed (${res.status})`);
    }

    const blob = await res.blob();
    const objectUrl = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = objectUrl;
    a.download = fileName || 'download';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(objectUrl);
};

function DocCard({ field, label, icon, accept, path: initialPath, gpsId, onUploaded }) {
    const [uploading, setUploading] = useState(false);
    const [path, setPath] = useState(initialPath);

    // sync if parent row changes
    useEffect(() => { setPath(initialPath); }, [initialPath]);

    const handleFile = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploading(true);
        try {
            const fd = new FormData();
            fd.append('field', field);
            fd.append('file', file);
            const res = await api.post(`/fitment/${gpsId}/upload-doc`, fd, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            const newPath = res.data.gps[field];
            setPath(newPath);
            onUploaded(res.data.gps);
        } finally {
            setUploading(false);
            e.target.value = '';
        }
    };

    const isImage = path && /\.(jpg|jpeg|png)$/i.test(path);
    const fileUrl = path ? `${getFileBaseUrl()}/fitment-file?path=${encodeURIComponent(path)}` : null;
    const fileName = path ? path.split('/').pop() : 'download';
    return (
        <div style={{
            border: '1px solid var(--card-border)', borderRadius: '10px',
            overflow: 'hidden', background: 'var(--body-bg)',
        }}>
            {/* Preview */}
            <div style={{
                height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'var(--card-bg)', position: 'relative', overflow: 'hidden',
                cursor: path ? 'pointer' : 'default',
            }} onClick={() => fileUrl && window.open(fileUrl, '_blank', 'noopener,noreferrer')}>
                {path ? (
                    isImage ? (
                        <img
                            src={fileUrl || undefined}
                            alt={label}
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            onError={e => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                        />
                    ) : (
                        <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                            <div style={{ fontSize: '2.2rem' }}>📄</div>
                            <div style={{ fontSize: '0.7rem', marginTop: 4 }}>PDF — click to view</div>
                        </div>
                    )
                ) : (
                    <div style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                        <div style={{ fontSize: '2.2rem' }}>{icon}</div>
                        <div style={{ fontSize: '0.7rem', marginTop: 4 }}>Not uploaded</div>
                    </div>
                )}
                {path && (
                    <span style={{
                        position: 'absolute', top: 6, right: 6,
                        fontSize: '0.65rem', fontWeight: 700, padding: '2px 6px', borderRadius: '10px',
                        background: 'rgba(16,185,129,0.9)', color: '#fff',
                    }}>✓ Uploaded</span>
                )}
            </div>

            {/* Label + actions */}
            <div style={{ padding: '8px 10px' }}>
                <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>{label}</div>
                <div style={{ display: 'flex', gap: '5px' }}>
                    {path && (
                        <>
                            <button
                                onClick={() => fileUrl && window.open(fileUrl, '_blank', 'noopener,noreferrer')}
                                style={{
                                    flex: 1, padding: '5px 0', borderRadius: '6px', fontSize: '0.72rem',
                                    fontWeight: 600, textAlign: 'center', cursor: 'pointer',
                                    border: '1px solid var(--primary)', color: 'var(--primary)',
                                    background: 'transparent',
                                }}>👁 View</button>
                            <a
                                href={fileUrl || undefined}
                                onClick={async (e) => {
                                    e.preventDefault();
                                    if (!fileUrl) return;
                                    try {
                                        await downloadRemoteFile(fileUrl, fileName);
                                    } catch {
                                        window.open(fileUrl, '_blank', 'noopener,noreferrer');
                                    }
                                }}
                                style={{
                                    flex: 1, padding: '5px 0', borderRadius: '6px', fontSize: '0.72rem',
                                    fontWeight: 600, textAlign: 'center', textDecoration: 'none',
                                    border: '1px solid #059669', color: '#059669', display: 'block',
                                }}>⬇ Save</a>
                        </>
                    )}
                    <label style={{
                        flex: path ? 'none' : 1, padding: '5px 8px', borderRadius: '6px', fontSize: '0.72rem',
                        fontWeight: 600, textAlign: 'center', cursor: uploading ? 'not-allowed' : 'pointer',
                        border: '1px solid var(--card-border)',
                        color: uploading ? 'var(--text-secondary)' : 'var(--text-primary)',
                        background: 'transparent',
                        opacity: uploading ? 0.6 : 1, whiteSpace: 'nowrap',
                    }}>
                        {uploading ? '⏳' : path ? '↑ Replace' : '⬆ Upload'}
                        <input type="file" accept={accept} style={{ display: 'none' }}
                            onChange={handleFile} disabled={uploading} />
                    </label>
                </div>
            </div>
        </div>
    );
}

function ViewDetail({ row: initialRow, rtos, onUpdated, editing, onSaveDone, saveRef }) {
    const [row, setRow] = useState(initialRow);
    const [form, setForm] = useState({});
    const [files, setFiles] = useState({});
    const [saving, setSaving] = useState(false);

    useEffect(() => { setRow(initialRow); }, [initialRow]);

    const v = row.vehicle;
    const d = row.device;

    useEffect(() => {
        if (editing) {
            setForm({
                vehicle_reg_no:   v?.vehicle_reg_no   || '',
                vehicle_reg_date: v?.vehicle_reg_date?.slice(0, 10) || '',
                rto_id:           String(v?.rto_id || ''),
                vehicle_type:     v?.vehicle_type     || '',
                owner_name:       v?.owner_name       || '',
                owner_mobile:     v?.owner_mobile     || '',
                owner_address:    v?.owner_address    || '',
            });
            setFiles({});
        }
    }, [editing]);

    // expose save fn to parent via ref
    useEffect(() => {
        if (saveRef) saveRef.current = async () => {
            setSaving(true);
            try {
                const fd = new FormData();
                Object.entries(form).forEach(([k, val]) => fd.append(k, val));
                Object.entries(files).forEach(([k, f]) => { if (f) fd.append(k, f); });
                const res = await api.post(`/fitment/${row.id}/update`, fd, {
                    headers: { 'Content-Type': 'multipart/form-data' },
                });
                setRow(res.data.gps);
                onUpdated(res.data.gps);
                onSaveDone();
            } finally {
                setSaving(false);
            }
        };
    });

    const EInp = ({ field, type = 'text' }) => (
        <input type={type} style={inp} value={form[field] || ''}
            onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))} />
    );
    return (
        <div>
            {/* 2-column split */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 24px', alignItems: 'start' }}>

                {/* LEFT */}
                <div>
                    <Section title="Vehicle Information">
                        {editing ? (
                            <>
                                <div><div style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 3 }}>Reg No</div><EInp field="vehicle_reg_no" /></div>
                                <div><div style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 3 }}>Reg Date</div><EInp field="vehicle_reg_date" type="date" /></div>
                                <div>
                                    <div style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 3 }}>RTO</div>
                                    <select style={inp} value={form.rto_id} onChange={e => setForm(f => ({ ...f, rto_id: e.target.value }))}>
                                        <option value="">Select RTO</option>
                                        {rtos.map(r => <option key={r.id} value={String(r.id)}>{r.code} – {r.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <div style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 3 }}>Vehicle Type</div>
                                    <select style={inp} value={form.vehicle_type} onChange={e => setForm(f => ({ ...f, vehicle_type: e.target.value }))}>
                                        <option value="">Select Type</option>
                                        {VEHICLE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                            </>
                        ) : (
                            <>
                                <Field label="Registration No" value={v?.vehicle_reg_no} />
                                <Field label="Registration Date" value={v?.vehicle_reg_date?.slice(0, 10)} />
                                <Field label="RTO" value={v?.rto_model ? `${v.rto_model.code} – ${v.rto_model.name}` : v?.rto} />
                                <Field label="Vehicle Type" value={v?.vehicle_type} />
                                <Field label="Chassis No" value={v?.chassis_no} />
                                <Field label="Engine No" value={v?.engine_no} />
                                <Field label="Department" value={v?.department} />
                            </>
                        )}
                    </Section>

                    <Section title="Owner Information">
                        {editing ? (
                            <>
                                <div><div style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 3 }}>Owner Name</div><EInp field="owner_name" /></div>
                                <div><div style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 3 }}>Mobile</div><EInp field="owner_mobile" /></div>
                                <div style={{ gridColumn: '1 / -1' }}>
                                    <div style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 3 }}>Address</div>
                                    <textarea rows={2} style={{ ...inp, resize: 'vertical' }} value={form.owner_address}
                                        onChange={e => setForm(f => ({ ...f, owner_address: e.target.value }))} />
                                </div>
                            </>
                        ) : (
                            <>
                                <Field label="Owner Name" value={v?.owner_name} />
                                <Field label="Mobile" value={v?.owner_mobile} />
                                <Field label="Address" value={v?.owner_address} />
                            </>
                        )}
                    </Section>

                    <Section title="Device Information">
                        <Field label="IMEI" value={d?.imei} />
                        <Field label="Serial No" value={d?.serial_no} />
                        <Field label="Manufacturer" value={d?.manufacturer} />
                        <Field label="Device Model" value={d?.device_model} />
                        <Field label="Part No" value={d?.part_no} />
                        <Field label="ICCID 1" value={d?.iccid_1} />
                        <Field label="ICCID 2" value={d?.iccid_2} />
                        <Field label="SIM 1" value={d?.sim_1} />
                        <Field label="SIM 2" value={d?.sim_2} />
                    </Section>
                </div>

                {/* RIGHT */}
                <div>
                    <Section title="Fitment Details">
                        <Field label="Fitted Date" value={row.fitted_date?.slice(0, 10)} />
                        <Field label="End Date" value={row.end_date?.slice(0, 10)} />
                        <Field label="Technician Mobile" value={row.technician_mobile} />
                        <Field label="UIN Number" value={row.uin_number} />
                        <Field label="Panic Button Count" value={row.panic_button_count} />
                        <Field label="SIM Plan" value={row.sim_plan} />
                        <Field label="SIM Validity" value={row.sim_validity?.slice(0, 10)} />
                        <Field label="Temp Cert Date" value={row.temp_certificate_date?.slice(0, 10)} />
                        <Field label="Vahan Cert Date" value={row.vahan_certificate_date?.slice(0, 10)} />
                    </Section>

                    <Section title="Status & Approval">
                        <div>
                            <div style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>Approval Status</div>
                            <Badge status={row.approved_status || 'Pending'} />
                        </div>
                        <div>
                            <div style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>Temp Certificate</div>
                            <span style={{
                                fontSize: '0.72rem', fontWeight: 700, padding: '2px 8px', borderRadius: '20px',
                                background: row.temp_certificate_file ? 'rgba(16,185,129,0.12)' : 'rgba(239,68,68,0.1)',
                                color: row.temp_certificate_file ? '#059669' : '#dc2626',
                                border: `1px solid ${row.temp_certificate_file ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.25)'}`,
                            }}>{row.temp_certificate_file ? 'Uploaded' : 'Not Uploaded'}</span>
                        </div>
                        <Field label="Approval Notes" value={row.approval_notes} />
                        <Field label="Remarks" value={row.remarks} />
                    </Section>
                </div>
            </div>

            {/* Documents — full width at bottom */}
            <div style={{ marginTop: '4px' }}>
                <div style={{
                    fontSize: '0.7rem', fontWeight: 700, color: 'var(--primary)',
                    textTransform: 'uppercase', letterSpacing: '0.08em',
                    borderBottom: '1px solid var(--card-border)', paddingBottom: '5px', marginBottom: '10px',
                }}>Documents</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '10px' }}>
                    {DOC_FIELDS.map(({ field, label, icon, accept }) => (
                        <DocCard key={field} field={field} label={label} icon={icon} accept={accept}
                            path={row[field]} gpsId={row.id}
                            onUploaded={updated => { setRow(updated); onUpdated(updated); }}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}


export default function FittedListPage() {
    const [rows, setRows]           = useState([]);
    const [meta, setMeta]           = useState(null);
    const [loading, setLoading]     = useState(false);
    const [manufacturers, setMfrs]  = useState([]);
    const [rtos, setRtos]           = useState([]);

    const [filters, setFilters] = useState({
        imei: '', manufacturer: '', vehicle_reg_no: '', owner_mobile: '',
        rto_id: '', fitted_date: '', temp_cert: '', rto_approved: '',
    });

    // View modal
    const [viewModal, setViewModal] = useState(null);
    const [viewEditing, setViewEditing] = useState(false);
    const [viewSaving, setViewSaving] = useState(false);
    const saveRef = useRef(null);

    // Temp Cert modal
    const [certModal, setCertModal]   = useState(null); // gps row
    const [certFile, setCertFile]     = useState(null);
    const [certSaving, setCertSaving] = useState(false);

    // RTO Approve modal
    const [approveModal, setApproveModal]   = useState(null); // gps row
    const [approveForm, setApproveForm]     = useState({ approved_status: 'Pending', approval_notes: '' });
    const [approveSaving, setApproveSaving] = useState(false);

    const fetchList = useCallback(async (f = filters) => {
        setLoading(true);
        try {
            const params = Object.fromEntries(Object.entries(f).filter(([, v]) => v !== ''));
            const r = await api.get('/fitment/fitted-list', { params });
            setRows(r.data.data);
            setMeta(r.data.meta);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchList();
        api.get('/rtos/zones').then(r => {
            const allRtos = r.data.data.flatMap(z => z.rtos || []);
            setRtos(allRtos);
            const mfrs = [...new Set([])]; // manufacturers come from device list
            setMfrs(mfrs);
        });
    }, []);

    const setF = (key, val) => setFilters(f => ({ ...f, [key]: val }));

    const handleFilter = () => fetchList(filters);
    const handleReset  = () => {
        const empty = { imei: '', manufacturer: '', vehicle_reg_no: '', owner_mobile: '', rto_id: '', fitted_date: '', temp_cert: '', rto_approved: '' };
        setFilters(empty);
        fetchList(empty);
    };

    // Temp cert upload
    const openCertModal = (row) => { setCertModal(row); setCertFile(null); };
    const handleCertSave = async () => {
        if (!certFile) return;
        setCertSaving(true);
        try {
            const fd = new FormData();
            fd.append('file', certFile);
            await api.post(`/fitment/${certModal.id}/temp-cert`, fd, {
                headers: { 'Content-Type': 'multipart/form-data' },
            });
            setCertModal(null);
            fetchList(filters);
        } finally {
            setCertSaving(false);
        }
    };

    // RTO approve
    const openApproveModal = (row) => {
        setApproveModal(row);
        setApproveForm({ approved_status: row.approved_status || 'Pending', approval_notes: row.approval_notes || '' });
    };
    const handleApproveSave = async () => {
        setApproveSaving(true);
        try {
            await api.post(`/fitment/${approveModal.id}/rto-approve`, approveForm);
            setApproveModal(null);
            fetchList(filters);
        } finally {
            setApproveSaving(false);
        }
    };

    const pending = meta ? meta.total : rows.length;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
                <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>Fitted List</h1>
                <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>All fitted GPS devices</p>
            </div>

            {/* Filters */}
            <div style={{
                background: 'var(--card-bg)', border: '1px solid var(--card-border)',
                borderRadius: '12px', padding: '16px 20px',
            }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '10px', alignItems: 'end' }}>
                    <div>
                        <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>IMEI</div>
                        <input style={inp} value={filters.imei} onChange={e => setF('imei', e.target.value)} placeholder="IMEI" />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>Manufacturer</div>
                        <SearchSelect
                            options={MANUFACTURERS.map(m => ({ value: m, label: m }))}
                            value={filters.manufacturer}
                            onChange={v => setF('manufacturer', v)}
                            placeholder="Select Manufacturer"
                        />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>Vehicle Reg No</div>
                        <input style={inp} value={filters.vehicle_reg_no} onChange={e => setF('vehicle_reg_no', e.target.value)} placeholder="Reg No" />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>Owner Mobile</div>
                        <input style={inp} value={filters.owner_mobile} onChange={e => setF('owner_mobile', e.target.value)} placeholder="Mobile" />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>RTO</div>
                        <SearchSelect
                            options={rtos.map(r => ({ value: r.id, label: r.code }))}
                            value={filters.rto_id}
                            onChange={v => setF('rto_id', v)}
                            placeholder="Select RTO"
                        />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>Fitted Date</div>
                        <input type="date" style={inp} value={filters.fitted_date} onChange={e => setF('fitted_date', e.target.value)} />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>Temp Cert</div>
                        <select style={inp} value={filters.temp_cert} onChange={e => setF('temp_cert', e.target.value)}>
                            <option value="">Select</option>
                            <option value="yes">Uploaded</option>
                            <option value="no">Not Uploaded</option>
                        </select>
                    </div>
                    <div>
                        <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>RTO Approved</div>
                        <select style={inp} value={filters.rto_approved} onChange={e => setF('rto_approved', e.target.value)}>
                            <option value="">Select</option>
                            <option value="Pending">Pending</option>
                            <option value="Approved">Approved</option>
                            <option value="Rejected">Rejected</option>
                        </select>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                        <button onClick={handleFilter} style={{
                            flex: 1, padding: '7px 0', borderRadius: '7px', border: 'none',
                            background: 'var(--primary)', color: '#fff', fontWeight: 700,
                            fontSize: '0.8rem', cursor: 'pointer',
                        }}>🔍 Filter</button>
                        <button onClick={handleReset} style={{
                            padding: '7px 12px', borderRadius: '7px',
                            border: '1px solid var(--card-border)', background: 'transparent',
                            color: 'var(--text-secondary)', fontSize: '0.8rem', cursor: 'pointer',
                        }}>Reset</button>
                    </div>
                </div>
            </div>

            {/* Pending badge */}
            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <span style={{
                    fontSize: '0.78rem', fontWeight: 700, padding: '4px 14px', borderRadius: '20px',
                    background: 'rgba(16,185,129,0.1)', color: '#059669', border: '1px solid rgba(16,185,129,0.3)',
                }}>● Pending Items: {pending}</span>
            </div>

            {/* Table */}
            <div style={{
                background: 'var(--card-bg)', border: '1px solid var(--card-border)',
                borderRadius: '12px', overflow: 'hidden',
            }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                        <thead>
                            <tr style={{ background: 'var(--body-bg)', borderBottom: '1px solid var(--card-border)' }}>
                                {['#','IMEI','Serial No','Manufacturer','RTO','Owner Name','Owner Mobile','Reg No','Reg Date','Fitment Date','Actions'].map(h => (
                                    <th key={h} style={{
                                        padding: '10px 12px', textAlign: 'left', fontWeight: 700,
                                        fontSize: '0.75rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap',
                                    }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr><td colSpan={11} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading...</td></tr>
                            ) : rows.length === 0 ? (
                                <tr><td colSpan={11} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>No records found.</td></tr>
                            ) : rows.map((row, i) => {
                                const v = row.vehicle;
                                const d = row.device;
                                const hasCert = !!row.temp_certificate_file;
                                return (
                                    <tr key={row.id} style={{ borderBottom: '1px solid var(--card-border)' }}>
                                        <td style={{ padding: '10px 12px', color: 'var(--text-secondary)' }}>{i + 1}</td>
                                        <td style={{ padding: '10px 12px', fontFamily: 'monospace', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>{d?.imei}</td>
                                        <td style={{ padding: '10px 12px', fontFamily: 'monospace', color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>{d?.serial_no}</td>
                                        <td style={{ padding: '10px 12px', color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>{d?.manufacturer}</td>
                                        <td style={{ padding: '10px 12px', color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>{v?.rto_model ? `${v.rto_model.code}` : v?.rto}</td>
                                        <td style={{ padding: '10px 12px', color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>{v?.owner_name}</td>
                                        <td style={{ padding: '10px 12px', color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>{v?.owner_mobile}</td>
                                        <td style={{ padding: '10px 12px', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>{v?.vehicle_reg_no}</td>
                                        <td style={{ padding: '10px 12px', color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>{v?.vehicle_reg_date?.slice(0, 10)}</td>
                                        <td style={{ padding: '10px 12px', color: 'var(--text-primary)', whiteSpace: 'nowrap' }}>{row.fitted_date?.slice(0, 10)}</td>
                                        <td style={{ padding: '10px 12px' }}>
                                            <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                                                {/* Temp Cert Status */}
                                                <span
                                                    title={hasCert ? 'Temp Certificate Uploaded' : 'Temp Certificate Not Uploaded'}
                                                    style={{
                                                        width: '32px', height: '32px', borderRadius: '8px', display: 'flex',
                                                        alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                                                        border: `1px solid ${hasCert ? 'rgba(16,185,129,0.4)' : 'rgba(239,68,68,0.35)'}`,
                                                        background: hasCert ? 'rgba(16,185,129,0.08)' : 'rgba(239,68,68,0.06)',
                                                        fontSize: '1rem',
                                                    }}
                                                >
                                                    {hasCert ? '✅' : '❌'}
                                                </span>

                                                {/* RTO Approve */}
                                                <button
                                                    title={`RTO Approval: ${row.approved_status}`}
                                                    onClick={() => openApproveModal(row)}
                                                    style={iconBtn(
                                                        row.approved_status === 'Approved' ? '#059669' :
                                                        row.approved_status === 'Rejected' ? '#dc2626' : '#b45309'
                                                    )}
                                                >
                                                    {row.approved_status === 'Approved' ? '✅' :
                                                     row.approved_status === 'Rejected' ? '❌' : '🕐'}
                                                </button>

                                                {/* View */}
                                                <button title="View" onClick={() => setViewModal(row)} style={iconBtn()}>👁</button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* View Modal */}
            <Modal
                open={!!viewModal}
                onClose={() => { setViewModal(null); setViewEditing(false); }}
                title="📋 GPS Fitment Details"
                maxWidth="1100px"
                headerActions={
                    viewEditing ? (
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button onClick={() => setViewEditing(false)} style={{
                                padding: '5px 14px', borderRadius: '7px', border: '1px solid var(--card-border)',
                                background: 'transparent', color: 'var(--text-secondary)', fontSize: '0.8rem', cursor: 'pointer',
                            }}>Cancel</button>
                            <button onClick={async () => { setViewSaving(true); await saveRef.current?.(); setViewSaving(false); }} disabled={viewSaving} style={{
                                padding: '5px 16px', borderRadius: '7px', border: 'none',
                                background: 'var(--primary)', color: '#fff', fontWeight: 700,
                                fontSize: '0.8rem', cursor: 'pointer', opacity: viewSaving ? 0.6 : 1,
                            }}>{viewSaving ? 'Saving...' : '💾 Save'}</button>
                        </div>
                    ) : (
                        <button onClick={() => setViewEditing(true)} style={{
                            padding: '5px 14px', borderRadius: '7px', border: '1px solid var(--primary)',
                            background: 'transparent', color: 'var(--primary)', fontWeight: 700,
                            fontSize: '0.8rem', cursor: 'pointer',
                        }}>✏️ Edit</button>
                    )
                }
            >
                {viewModal && <ViewDetail
                    row={viewModal}
                    rtos={rtos}
                    editing={viewEditing}
                    saveRef={saveRef}
                    onSaveDone={() => setViewEditing(false)}
                    onUpdated={updated => {
                        setViewModal(updated);
                        setRows(prev => prev.map(r => r.id === updated.id ? updated : r));
                    }}
                />}
            </Modal>

            {/* Temp Cert Modal */}
            <Modal open={!!certModal} onClose={() => setCertModal(null)} title="📋 Upload Temp Certificate">
                {certModal && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            Vehicle: <strong style={{ color: 'var(--text-primary)' }}>{certModal.vehicle?.vehicle_reg_no}</strong>
                        </p>
                        {certModal.temp_certificate_file && (
                            <div style={{ padding: '8px 12px', borderRadius: '8px', background: 'rgba(16,185,129,0.08)', border: '1px solid rgba(16,185,129,0.25)', fontSize: '0.8rem', color: '#059669' }}>
                                ✅ Certificate already uploaded. Upload again to replace.
                            </div>
                        )}
                        <div>
                            <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Select File (PDF / Image)</div>
                            <input type="file" accept=".pdf,.jpg,.jpeg,.png"
                                onChange={e => setCertFile(e.target.files[0])}
                                style={{ fontSize: '0.82rem', color: 'var(--text-primary)' }}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                            <button onClick={() => setCertModal(null)} style={{
                                padding: '8px 18px', borderRadius: '8px', border: '1px solid var(--card-border)',
                                background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.85rem',
                            }}>Cancel</button>
                            <button onClick={handleCertSave} disabled={!certFile || certSaving} style={{
                                padding: '8px 20px', borderRadius: '8px', border: 'none',
                                background: 'var(--primary)', color: '#fff', fontWeight: 700,
                                fontSize: '0.85rem', cursor: 'pointer', opacity: !certFile || certSaving ? 0.6 : 1,
                            }}>{certSaving ? 'Uploading...' : 'Upload'}</button>
                        </div>
                    </div>
                )}
            </Modal>

            {/* RTO Approve Modal */}
            <Modal open={!!approveModal} onClose={() => setApproveModal(null)} title="🏛️ RTO Approval Status">
                {approveModal && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                        <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            Vehicle: <strong style={{ color: 'var(--text-primary)' }}>{approveModal.vehicle?.vehicle_reg_no}</strong>
                            &nbsp;|&nbsp; Current: <Badge status={approveModal.approved_status} />
                        </p>
                        <div>
                            <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Status</div>
                            <select style={inp} value={approveForm.approved_status}
                                onChange={e => setApproveForm(f => ({ ...f, approved_status: e.target.value }))}>
                                <option value="Pending">Pending</option>
                                <option value="Approved">Approved</option>
                                <option value="Rejected">Rejected</option>
                            </select>
                        </div>
                        <div>
                            <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 6 }}>Notes</div>
                            <textarea rows={3} style={{ ...inp, resize: 'vertical' }}
                                placeholder="Add approval notes..."
                                value={approveForm.approval_notes}
                                onChange={e => setApproveForm(f => ({ ...f, approval_notes: e.target.value }))}
                            />
                        </div>
                        <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                            <button onClick={() => setApproveModal(null)} style={{
                                padding: '8px 18px', borderRadius: '8px', border: '1px solid var(--card-border)',
                                background: 'transparent', color: 'var(--text-secondary)', cursor: 'pointer', fontSize: '0.85rem',
                            }}>Cancel</button>
                            <button onClick={handleApproveSave} disabled={approveSaving} style={{
                                padding: '8px 20px', borderRadius: '8px', border: 'none',
                                background: 'var(--primary)', color: '#fff', fontWeight: 700,
                                fontSize: '0.85rem', cursor: 'pointer', opacity: approveSaving ? 0.6 : 1,
                            }}>{approveSaving ? 'Saving...' : 'Save'}</button>
                        </div>
                    </div>
                )}
            </Modal>
        </div>
    );
}
