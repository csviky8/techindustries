import { useCallback, useEffect, useState } from 'react';
import api from '../api/client';
import { getRtoZonesCached } from '../api/lookups';
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

const inputStyle = {
    padding: '7px 10px',
    borderRadius: '7px',
    fontSize: '0.8rem',
    border: '1px solid var(--card-border)',
    background: 'var(--body-bg)',
    color: 'var(--text-primary)',
    outline: 'none',
    width: '100%',
    boxSizing: 'border-box',
};

const cellStyle = {
    padding: '10px 12px',
    color: 'var(--text-primary)',
    whiteSpace: 'nowrap',
};

const cellMono = {
    ...cellStyle,
    fontFamily: 'monospace',
    fontWeight: 600,
};

const cellBold = {
    ...cellStyle,
    fontWeight: 600,
};

const iconCell = {
    ...cellStyle,
    textAlign: 'center',
    fontSize: '1rem',
};

const actionBadge = {
    width: '32px',
    height: '32px',
    borderRadius: '8px',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '1px solid var(--card-border)',
    background: 'var(--body-bg)',
    color: 'var(--text-primary)',
};

const DetailItem = ({ label, value }) => (
    <div>
        <div style={{ fontSize: '0.68rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 2 }}>
            {label}
        </div>
        <div style={{ fontSize: '0.82rem', color: 'var(--text-primary)', fontWeight: 500, wordBreak: 'break-word' }}>
            {value || <span style={{ color: 'var(--text-secondary)', fontStyle: 'italic' }}>—</span>}
        </div>
    </div>
);

export default function RtoApprovedPage() {
    const [rows, setRows] = useState([]);
    const [meta, setMeta] = useState(null);
    const [loading, setLoading] = useState(false);
    const [rtos, setRtos] = useState([]);
    const [viewRow, setViewRow] = useState(null);
    const [filters, setFilters] = useState({
        imei: '',
        manufacturer: '',
        vehicle_reg_no: '',
        owner_mobile: '',
        rto_id: '',
        validity: '',
        fitted_date: '',
        temp_cert: '',
        rto_approved: 'Approved',
    });

    const fetchList = useCallback(async (nextFilters = filters) => {
        setLoading(true);
        try {
            const params = Object.fromEntries(
                Object.entries({
                    ...nextFilters,
                    rto_approved: 'Approved',
                }).filter(([, value]) => value !== '')
            );
            const res = await api.get('/fitment/fitted-list', { params });
            setRows(res.data.data || []);
            setMeta(res.data.meta || null);
        } finally {
            setLoading(false);
        }
    }, [filters]);

    useEffect(() => {
        fetchList();
        getRtoZonesCached().then(data => {
            const allRtos = data.flatMap(z => z.rtos || []);
            setRtos(allRtos);
        });
    }, []);

    const setFilter = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value }));
    };

    const handleFilter = () => fetchList(filters);

    const handleReset = () => {
        const empty = {
            imei: '',
            manufacturer: '',
            vehicle_reg_no: '',
            owner_mobile: '',
            rto_id: '',
            validity: '',
            fitted_date: '',
            temp_cert: '',
            rto_approved: 'Approved',
        };
        setFilters(empty);
        fetchList(empty);
    };

    const pending = meta ? meta.total : rows.length;
    const headers = [
        '#',
        'IMEI',
        'Serial No',
        'Manufacturer',
        'RTO',
        'Owner Name',
        'Owner Mobile',
        'Reg No',
        'Reg Date',
        'Temp Certificate',
        'RTO Approved',
        'Locked',
        'Actions',
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
                <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                    RTO Approved List
                </h1>
                <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                    Only approved GPS fitments
                </p>
            </div>

            <div style={{
                background: 'var(--card-bg)',
                border: '1px solid var(--card-border)',
                borderRadius: '12px',
                padding: '16px 20px',
            }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '10px', alignItems: 'end' }}>
                    <div>
                        <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>IMEI</div>
                        <input style={inputStyle} value={filters.imei} onChange={e => setFilter('imei', e.target.value)} placeholder="IMEI" />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>Manufacturer</div>
                        <SearchSelect
                            options={MANUFACTURERS.map(m => ({ value: m, label: m }))}
                            value={filters.manufacturer}
                            onChange={v => setFilter('manufacturer', v)}
                            placeholder="Select"
                        />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>Vehicle Reg No</div>
                        <input style={inputStyle} value={filters.vehicle_reg_no} onChange={e => setFilter('vehicle_reg_no', e.target.value)} placeholder="Reg No" />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>Owner Mobile</div>
                        <input style={inputStyle} value={filters.owner_mobile} onChange={e => setFilter('owner_mobile', e.target.value)} placeholder="Mobile" />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>RTO</div>
                        <SearchSelect
                            options={rtos.map(r => ({ value: r.id, label: r.code }))}
                            value={filters.rto_id}
                            onChange={v => setFilter('rto_id', v)}
                            placeholder="Select"
                        />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>Validity</div>
                        <select style={inputStyle} value={filters.validity} onChange={e => setFilter('validity', e.target.value)}>
                            <option value="">Select</option>
                            <option value="1">1</option>
                            <option value="2">2</option>
                        </select>
                    </div>
                    <div>
                        <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>Fitted date</div>
                        <input type="date" style={inputStyle} value={filters.fitted_date} onChange={e => setFilter('fitted_date', e.target.value)} />
                    </div>
                    <div>
                        <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>Temp Cert</div>
                        <select style={inputStyle} value={filters.temp_cert} onChange={e => setFilter('temp_cert', e.target.value)}>
                            <option value="">Select</option>
                            <option value="yes">Uploaded</option>
                            <option value="no">Not Uploaded</option>
                        </select>
                    </div>
                    <div>
                        <div style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: 4 }}>RTO Approved</div>
                        <select style={inputStyle} value={filters.rto_approved} onChange={e => setFilter('rto_approved', e.target.value)}>
                            <option value="">Select</option>
                            <option value="Pending">Pending</option>
                            <option value="Approved">Approved</option>
                            <option value="Rejected">Rejected</option>
                        </select>
                    </div>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'end' }}>
                        <button onClick={handleFilter} style={{
                            flex: 1,
                            padding: '7px 0',
                            borderRadius: '7px',
                            border: 'none',
                            background: 'var(--primary)',
                            color: '#fff',
                            fontWeight: 700,
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                        }}>🔍 Filter</button>
                        <button onClick={handleReset} style={{
                            padding: '7px 12px',
                            borderRadius: '7px',
                            border: '1px solid var(--card-border)',
                            background: 'transparent',
                            color: 'var(--text-secondary)',
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                        }}>Reset</button>
                    </div>
                </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                <span style={{
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    padding: '4px 14px',
                    borderRadius: '20px',
                    background: 'rgba(16,185,129,0.1)',
                    color: '#059669',
                    border: '1px solid rgba(16,185,129,0.3)',
                }}>● Pending Items: {pending}</span>
            </div>

            <div style={{
                background: 'var(--card-bg)',
                border: '1px solid var(--card-border)',
                borderRadius: '12px',
                overflow: 'hidden',
            }}>
                <div style={{ overflowX: 'auto' }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem' }}>
                        <thead>
                            <tr style={{ background: 'var(--body-bg)', borderBottom: '1px solid var(--card-border)' }}>
                                {headers.map(h => (
                                    <th key={h} style={{
                                        padding: '10px 12px',
                                        textAlign: 'left',
                                        fontWeight: 700,
                                        fontSize: '0.75rem',
                                        color: 'var(--text-secondary)',
                                        whiteSpace: 'nowrap',
                                    }}>{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {loading ? (
                                <tr>
                                    <td colSpan={headers.length} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                        Loading...
                                    </td>
                                </tr>
                            ) : rows.length === 0 ? (
                                <tr>
                                    <td colSpan={headers.length} style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                                        No records found.
                                    </td>
                                </tr>
                            ) : rows.map((row, index) => {
                                const vehicle = row.vehicle || {};
                                const device = row.device || {};
                                const hasTempCert = !!row.temp_certificate_file;
                                const isLocked = row.status === false || row.status === 0;
                                const tempCertIcon = hasTempCert ? '✅' : '❌';
                                const approvalIcon = row.approved_status === 'Approved'
                                    ? '👤'
                                    : row.approved_status === 'Rejected'
                                        ? '❌'
                                        : '🕐';

                                return (
                                    <tr key={row.id} style={{ borderBottom: '1px solid var(--card-border)' }}>
                                        <td style={cellStyle}>{index + 1}</td>
                                        <td style={cellMono}>{device.imei || '—'}</td>
                                        <td style={cellMono}>{device.serial_no || '—'}</td>
                                        <td style={cellStyle}>{device.manufacturer || '—'}</td>
                                        <td style={cellStyle}>{vehicle.rto_model ? vehicle.rto_model.code : (vehicle.rto || '—')}</td>
                                        <td style={cellStyle}>{vehicle.owner_name || '—'}</td>
                                        <td style={cellStyle}>{vehicle.owner_mobile || '—'}</td>
                                        <td style={cellBold}>{vehicle.vehicle_reg_no || '—'}</td>
                                        <td style={cellStyle}>{vehicle.vehicle_reg_date?.slice(0, 10) || '—'}</td>
                                        <td style={iconCell} title={hasTempCert ? 'Temp Certificate Uploaded' : 'Temp Certificate Not Uploaded'}>
                                            {tempCertIcon}
                                        </td>
                                        <td style={iconCell} title={row.approved_status || 'Pending'}>
                                            {approvalIcon}
                                        </td>
                                        <td style={iconCell}>{isLocked ? '🔒' : ''}</td>
                                        <td style={iconCell}>
                                            <button
                                                type="button"
                                                onClick={() => setViewRow(row)}
                                                style={{ ...actionBadge, cursor: 'pointer' }}
                                                title="View"
                                            >
                                                👁
                                            </button>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>
            </div>

            <Modal open={!!viewRow} onClose={() => setViewRow(null)} title="RTO Approved Details" maxWidth="900px">
                {viewRow && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '12px 18px' }}>
                        <DetailItem label="IMEI" value={viewRow.device?.imei} />
                        <DetailItem label="Serial No" value={viewRow.device?.serial_no} />
                        <DetailItem label="Manufacturer" value={viewRow.device?.manufacturer} />
                        <DetailItem label="RTO" value={viewRow.vehicle?.rto_model ? viewRow.vehicle.rto_model.code : viewRow.vehicle?.rto} />
                        <DetailItem label="Owner Name" value={viewRow.vehicle?.owner_name} />
                        <DetailItem label="Owner Mobile" value={viewRow.vehicle?.owner_mobile} />
                        <DetailItem label="Reg No" value={viewRow.vehicle?.vehicle_reg_no} />
                        <DetailItem label="Reg Date" value={viewRow.vehicle?.vehicle_reg_date?.slice(0, 10)} />
                        <DetailItem label="Validity" value={viewRow.sim_plan} />
                        <DetailItem label="Fitted Date" value={viewRow.fitted_date?.slice(0, 10)} />
                        <DetailItem label="Temp Cert" value={viewRow.temp_certificate_file ? 'Uploaded' : 'Not Uploaded'} />
                        <DetailItem label="RTO Approved" value={viewRow.approved_status} />
                    </div>
                )}
            </Modal>
        </div>
    );
}
