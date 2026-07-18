import { useState, useEffect, useRef } from 'react';
import api from '../api/client';

const DEPARTMENTS = ['Motor Vehicles Department', 'Mining Department'];

const Field = ({ label, required, children }) => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
            {label}{required && <span style={{ color: '#ef4444' }}> *</span>}
        </label>
        {children}
    </div>
);

const inp = {
    padding: '9px 12px', borderRadius: '8px', fontSize: '0.85rem',
    border: '1px solid var(--card-border)', background: 'var(--body-bg)',
    color: 'var(--text-primary)', outline: 'none', width: '100%', boxSizing: 'border-box',
};

export default function WebInstallPage() {
    const [imei, setImei]           = useState('');
    const [searching, setSearching]   = useState(false);
    const [device, setDevice]         = useState(null);
    const [existing, setExisting]     = useState(null);
    const [searchErr, setSearchErr]   = useState('');
    const [searchWarn, setSearchWarn] = useState('');
    const [notFound, setNotFound]     = useState(false);
    const [zones, setZones]       = useState([]);
    const [rtos, setRtos]         = useState([]);
    const [saving, setSaving]     = useState(false);
    const [slip, setSlip]         = useState(null);
    const [formErr, setFormErr]   = useState({});
    const slipRef                 = useRef(null);

    const [form, setForm] = useState({
        owner_name: '', owner_mobile: '', owner_address: '',
        vehicle_reg_no: '', vehicle_reg_date: '', department: '',
        zone_id: '', rto_id: '', vehicle_type: '', chassis_no: '',
        engine_no: '', fitment_date: new Date().toISOString().slice(0, 10),
    });

    useEffect(() => {
        api.get('/rtos/zones').then(r => setZones(r.data.data));
    }, []);

    const onZoneChange = (zoneId) => {
        setForm(f => ({ ...f, zone_id: zoneId, rto_id: '' }));
        const zone = zones.find(z => z.id == zoneId);
        setRtos(zone ? zone.rtos : []);
    };

    const handleSearch = async () => {
        if (!imei.trim()) return;
        setSearching(true);
        setSearchErr(''); setSearchWarn(''); setNotFound(false);
        setDevice(null); setExisting(null); setSlip(null);
        try {
            const r = await api.get('/fitment/search', { params: { imei: imei.trim() } });
            setDevice(r.data.device);
            if (r.data.vehicle) {
                setExisting(r.data.vehicle);
                const v = r.data.vehicle;
                setForm(f => ({
                    ...f,
                    owner_name: v.owner_name || '', owner_mobile: v.owner_mobile || '',
                    owner_address: v.owner_address || '', vehicle_reg_no: v.vehicle_reg_no || '',
                    vehicle_reg_date: v.vehicle_reg_date?.slice(0, 10) || '',
                    department: v.department || '', zone_id: v.zone_id || '',
                    rto_id: v.rto_id || '', vehicle_type: v.vehicle_type || '',
                    chassis_no: v.chassis_no || '', engine_no: v.engine_no || '',
                    fitment_date: v.fitment_date?.slice(0, 10) || f.fitment_date,
                }));
                if (v.zone_id) {
                    const zone = zones.find(z => z.id == v.zone_id);
                    setRtos(zone ? zone.rtos : []);
                }
            }
        } catch (e) {
            const msg  = e.response?.data?.message || '';
            const code = e.response?.status;
            if (code === 404) setNotFound(true);
            else if (e.response?.data?.inactive) setSearchWarn(msg);
            else setSearchErr(msg || 'Search failed.');
        } finally {
            setSearching(false);
        }
    };

    const validate = () => {
        const err = {};
        if (!form.owner_name)       err.owner_name = 'Required';
        if (!form.owner_mobile)     err.owner_mobile = 'Required';
        if (!form.owner_address)    err.owner_address = 'Required';
        if (!form.vehicle_reg_no)   err.vehicle_reg_no = 'Required';
        if (!form.vehicle_reg_date) err.vehicle_reg_date = 'Required';
        if (!form.department)       err.department = 'Required';
        if (!form.zone_id)          err.zone_id = 'Required';
        if (!form.rto_id)           err.rto_id = 'Required';
        setFormErr(err);
        return Object.keys(err).length === 0;
    };

    const handleSave = async () => {
        if (!validate()) return;
        setSaving(true);
        try {
            const r = await api.post('/fitment', { ...form, imei: imei.trim() });
            const slipR = await api.get(`/fitment/slip/${r.data.vehicle.id}`);
            setSlip(slipR.data.data);
            setTimeout(() => slipRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
        } catch (e) {
            const errs = e.response?.data?.errors || {};
            setFormErr(errs);
        } finally {
            setSaving(false);
        }
    };

    const handlePrint = () => window.print();

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
                <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>Web Install</h1>
                <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Search device by IMEI and complete fitment</p>
            </div>

            {/* IMEI Search */}
            <div style={{
                background: 'var(--card-bg)', border: '1px solid var(--card-border)',
                borderRadius: '12px', padding: '20px',
            }}>
                <p style={{ margin: '0 0 12px', fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>🔍 Search Device by IMEI</p>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-start' }}>
                    <input
                        value={imei} onChange={e => setImei(e.target.value)}
                        onKeyDown={e => e.key === 'Enter' && handleSearch()}
                        placeholder="Enter IMEI number..."
                        style={{ ...inp, maxWidth: '320px' }}
                    />
                    <button onClick={handleSearch} disabled={searching || !imei.trim()} style={{
                        padding: '9px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                        background: 'var(--primary)', color: '#fff', fontWeight: 600, fontSize: '0.85rem',
                        opacity: searching || !imei.trim() ? 0.6 : 1,
                    }}>{searching ? 'Searching...' : 'Search'}</button>
                </div>
                {notFound && (
                    <div style={{ marginTop: '10px', padding: '10px 14px', borderRadius: '8px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#dc2626', fontSize: '0.85rem' }}>
                        🔍 No result found. IMEI does not exist in the system.
                    </div>
                )}
                {searchWarn && (
                    <div style={{ marginTop: '10px', padding: '10px 14px', borderRadius: '8px', background: 'rgba(245,158,11,0.08)', border: '1px solid rgba(245,158,11,0.35)', color: '#b45309', fontSize: '0.85rem' }}>
                        ⚠️ {searchWarn}
                    </div>
                )}
                {searchErr && (
                    <div style={{ marginTop: '10px', padding: '10px 14px', borderRadius: '8px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.25)', color: '#dc2626', fontSize: '0.85rem' }}>
                        ⚠️ {searchErr}
                    </div>
                )}
            </div>

            {/* Device Info Card */}
            {device && (
                <div style={{
                    background: 'rgba(16,185,129,0.06)', border: '1px solid rgba(16,185,129,0.25)',
                    borderRadius: '12px', padding: '16px 20px',
                }}>
                    <p style={{ margin: '0 0 10px', fontWeight: 700, color: '#059669', fontSize: '0.88rem' }}>
                        ✅ Device Found {existing && <span style={{ color: '#f59e0b', marginLeft: 8 }}>⚠️ Already fitted — editing existing record</span>}
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '10px' }}>
                        {[
                            ['IMEI', device.imei], ['Model', device.device_model],
                            ['Part No', device.part_no], ['Serial No', device.serial_no],
                            ['ICCID 1', device.iccid_1], ['ICCID 2', device.iccid_2],
                            ['SIM 1', device.sim_1], ['SIM 2', device.sim_2],
                        ].map(([k, v]) => v ? (
                            <div key={k} style={{
                                background: 'var(--card-bg)', borderRadius: '8px',
                                padding: '8px 12px', border: '1px solid var(--card-border)',
                            }}>
                                <div style={{ fontSize: '0.68rem', color: 'var(--text-secondary)', fontWeight: 600 }}>{k}</div>
                                <div style={{ fontSize: '0.82rem', color: 'var(--text-primary)', fontWeight: 600, fontFamily: 'monospace', marginTop: 2 }}>{v}</div>
                            </div>
                        ) : null)}
                    </div>
                </div>
            )}

            {/* Fitment Form */}
            {device && (
                <div style={{
                    background: 'var(--card-bg)', border: '1px solid var(--card-border)',
                    borderRadius: '12px', padding: '20px',
                }}>
                    <p style={{ margin: '0 0 16px', fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-primary)' }}>📋 Fitment Details</p>

                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: '14px' }}>

                        <Field label="Owner Name" required>
                            <input style={{ ...inp, borderColor: formErr.owner_name ? '#ef4444' : undefined }}
                                value={form.owner_name} onChange={e => setForm(f => ({ ...f, owner_name: e.target.value }))} />
                            {formErr.owner_name && <span style={{ fontSize: '0.72rem', color: '#ef4444' }}>{formErr.owner_name}</span>}
                        </Field>

                        <Field label="Owner Mobile" required>
                            <input style={{ ...inp, borderColor: formErr.owner_mobile ? '#ef4444' : undefined }}
                                value={form.owner_mobile} onChange={e => setForm(f => ({ ...f, owner_mobile: e.target.value }))} />
                            {formErr.owner_mobile && <span style={{ fontSize: '0.72rem', color: '#ef4444' }}>{formErr.owner_mobile}</span>}
                        </Field>

                        <Field label="Vehicle Registration Number" required>
                            <input style={{ ...inp, borderColor: formErr.vehicle_reg_no ? '#ef4444' : undefined }}
                                value={form.vehicle_reg_no} onChange={e => setForm(f => ({ ...f, vehicle_reg_no: e.target.value.toUpperCase() }))} />
                            {formErr.vehicle_reg_no && <span style={{ fontSize: '0.72rem', color: '#ef4444' }}>{formErr.vehicle_reg_no}</span>}
                        </Field>

                        <Field label="Vehicle Registration Date" required>
                            <input type="date" style={{ ...inp, borderColor: formErr.vehicle_reg_date ? '#ef4444' : undefined }}
                                value={form.vehicle_reg_date} onChange={e => setForm(f => ({ ...f, vehicle_reg_date: e.target.value }))} />
                            {formErr.vehicle_reg_date && <span style={{ fontSize: '0.72rem', color: '#ef4444' }}>{formErr.vehicle_reg_date}</span>}
                        </Field>

                        <Field label="Department" required>
                            <select style={{ ...inp, borderColor: formErr.department ? '#ef4444' : undefined }}
                                value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))}>
                                <option value="">Select Department</option>
                                {DEPARTMENTS.map(d => <option key={d} value={d}>{d}</option>)}
                            </select>
                            {formErr.department && <span style={{ fontSize: '0.72rem', color: '#ef4444' }}>{formErr.department}</span>}
                        </Field>

                        <Field label="RTO Zone" required>
                            <select style={{ ...inp, borderColor: formErr.zone_id ? '#ef4444' : undefined }}
                                value={form.zone_id} onChange={e => onZoneChange(e.target.value)}>
                                <option value="">Select Zone</option>
                                {zones.map(z => <option key={z.id} value={z.id}>{z.name}</option>)}
                            </select>
                            {formErr.zone_id && <span style={{ fontSize: '0.72rem', color: '#ef4444' }}>{formErr.zone_id}</span>}
                        </Field>

                        <Field label="RTO" required>
                            <select style={{ ...inp, borderColor: formErr.rto_id ? '#ef4444' : undefined }}
                                value={form.rto_id} onChange={e => setForm(f => ({ ...f, rto_id: e.target.value }))}
                                disabled={!form.zone_id}>
                                <option value="">Select RTO</option>
                                {rtos.map(r => <option key={r.id} value={r.id}>{r.code} — {r.name}</option>)}
                            </select>
                            {formErr.rto_id && <span style={{ fontSize: '0.72rem', color: '#ef4444' }}>{formErr.rto_id}</span>}
                        </Field>

                        <Field label="Fitment Date">
                            <input type="date" style={inp}
                                value={form.fitment_date} onChange={e => setForm(f => ({ ...f, fitment_date: e.target.value }))} />
                        </Field>

                        <Field label="Vehicle Type">
                            <input style={inp} value={form.vehicle_type}
                                onChange={e => setForm(f => ({ ...f, vehicle_type: e.target.value }))} />
                        </Field>

                        <Field label="Chassis No">
                            <input style={inp} value={form.chassis_no}
                                onChange={e => setForm(f => ({ ...f, chassis_no: e.target.value.toUpperCase() }))} />
                        </Field>

                        <Field label="Engine No">
                            <input style={inp} value={form.engine_no}
                                onChange={e => setForm(f => ({ ...f, engine_no: e.target.value.toUpperCase() }))} />
                        </Field>

                        <Field label="Owner Address" required>
                            <textarea rows={3} style={{ ...inp, resize: 'vertical', borderColor: formErr.owner_address ? '#ef4444' : undefined }}
                                value={form.owner_address} onChange={e => setForm(f => ({ ...f, owner_address: e.target.value }))} />
                            {formErr.owner_address && <span style={{ fontSize: '0.72rem', color: '#ef4444' }}>{formErr.owner_address}</span>}
                        </Field>
                    </div>

                    <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                        <button onClick={handleSave} disabled={saving} style={{
                            padding: '10px 28px', borderRadius: '8px', border: 'none', cursor: 'pointer',
                            background: 'var(--primary)', color: '#fff', fontWeight: 700, fontSize: '0.88rem',
                            opacity: saving ? 0.6 : 1,
                        }}>{saving ? 'Saving...' : '💾 Save Fitment'}</button>
                    </div>
                </div>
            )}

            {/* Fitment Slip */}
            {slip && (
                <div ref={slipRef} style={{
                    background: 'var(--card-bg)', border: '2px solid var(--primary)',
                    borderRadius: '12px', padding: '28px', maxWidth: '720px',
                }} className="print-slip">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                        <div>
                            <h2 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800, color: 'var(--primary)' }}>GPS FITMENT CERTIFICATE</h2>
                            <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: 'var(--text-secondary)' }}>SafeTek — Device Installation Slip</p>
                        </div>
                        <button onClick={handlePrint} style={{
                            padding: '7px 16px', borderRadius: '8px', border: '1px solid var(--primary)',
                            background: 'transparent', color: 'var(--primary)', cursor: 'pointer', fontWeight: 600, fontSize: '0.8rem',
                        }}>🖨️ Print</button>
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0', border: '1px solid var(--card-border)', borderRadius: '8px', overflow: 'hidden' }}>
                        {[
                            ['Owner Name',        slip.owner_name],
                            ['Owner Mobile',      slip.owner_mobile],
                            ['Owner Address',     slip.owner_address],
                            ['Reg. Number',       slip.vehicle_reg_no],
                            ['Reg. Date',         slip.vehicle_reg_date],
                            ['Department',        slip.department],
                            ['RTO Zone',          slip.zone?.name],
                            ['RTO',               slip.rto_model ? `${slip.rto_model.code} — ${slip.rto_model.name}` : slip.rto],
                            ['Vehicle Type',      slip.vehicle_type],
                            ['Chassis No',        slip.chassis_no],
                            ['Engine No',         slip.engine_no],
                            ['Fitment Date',      slip.fitment_date],
                            ['Device IMEI',       slip.gps?.device?.imei],
                            ['Device Model',      slip.gps?.device?.device_model],
                            ['Part No',           slip.gps?.device?.part_no],
                            ['Serial No',         slip.gps?.device?.serial_no],
                            ['ICCID 1',           slip.gps?.device?.iccid_1],
                            ['ICCID 2',           slip.gps?.device?.iccid_2],
                            ['SIM 1',             slip.gps?.device?.sim_1],
                            ['SIM 2',             slip.gps?.device?.sim_2],
                        ].filter(([, v]) => v).map(([k, v], i) => (
                            <div key={k} style={{
                                display: 'flex', borderBottom: '1px solid var(--card-border)',
                                borderRight: i % 2 === 0 ? '1px solid var(--card-border)' : 'none',
                            }}>
                                <div style={{
                                    padding: '8px 12px', fontSize: '0.75rem', fontWeight: 700,
                                    color: 'var(--text-secondary)', background: 'var(--body-bg)',
                                    minWidth: '130px', borderRight: '1px solid var(--card-border)',
                                }}>{k}</div>
                                <div style={{ padding: '8px 12px', fontSize: '0.82rem', color: 'var(--text-primary)', wordBreak: 'break-all' }}>{v}</div>
                            </div>
                        ))}
                    </div>

                    <p style={{ margin: '16px 0 0', fontSize: '0.72rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
                        This is a computer-generated certificate. Generated on {new Date().toLocaleString()}.
                    </p>
                </div>
            )}
        </div>
    );
}
