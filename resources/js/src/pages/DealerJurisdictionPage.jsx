import { useState, useEffect } from 'react';
import api from '../api/client';

export default function DealerJurisdictionPage() {
    const [zones, setZones]       = useState([]);
    const [loading, setLoading]   = useState(true);
    const [openZone, setOpenZone] = useState(null);
    const [search, setSearch]     = useState('');

    useEffect(() => {
        api.get('/rtos/zones').then(r => setZones(r.data.data)).finally(() => setLoading(false));
    }, []);

    const filtered = zones.map(z => ({
        ...z,
        rtos: z.rtos.filter(r =>
            r.name.toLowerCase().includes(search.toLowerCase()) ||
            r.code.toLowerCase().includes(search.toLowerCase())
        ),
    })).filter(z => z.name.toLowerCase().includes(search.toLowerCase()) || z.rtos.length > 0);

    return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
                <h1 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 700, color: 'var(--text-primary)' }}>Dealer Jurisdiction</h1>
                <p style={{ margin: '2px 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>RTO zones and their offices</p>
            </div>

            <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search zone or RTO..."
                style={{
                    padding: '9px 14px', borderRadius: '8px', fontSize: '0.85rem',
                    border: '1px solid var(--card-border)', background: 'var(--card-bg)',
                    color: 'var(--text-primary)', outline: 'none', width: '280px',
                }}
            />

            {loading ? (
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>Loading...</p>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {filtered.map(zone => (
                        <div key={zone.id} style={{
                            borderRadius: '12px', border: '1px solid var(--card-border)',
                            background: 'var(--card-bg)', overflow: 'hidden',
                        }}>
                            {/* Zone header */}
                            <button
                                onClick={() => setOpenZone(openZone === zone.id ? null : zone.id)}
                                style={{
                                    width: '100%', display: 'flex', alignItems: 'center',
                                    justifyContent: 'space-between', padding: '14px 20px',
                                    background: 'transparent', border: 'none', cursor: 'pointer',
                                    borderBottom: openZone === zone.id ? '1px solid var(--card-border)' : 'none',
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                    <span style={{
                                        width: '32px', height: '32px', borderRadius: '8px',
                                        background: 'var(--primary-light)', display: 'flex',
                                        alignItems: 'center', justifyContent: 'center', fontSize: '1rem',
                                    }}>🗺️</span>
                                    <span style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-primary)' }}>{zone.name}</span>
                                    <span style={{
                                        padding: '2px 8px', borderRadius: '99px', fontSize: '0.72rem',
                                        background: 'var(--primary-light)', color: 'var(--primary)', fontWeight: 600,
                                    }}>{zone.rtos.length} RTOs</span>
                                </div>
                                <span style={{
                                    fontSize: '0.6rem', color: 'var(--text-secondary)',
                                    transition: 'transform 0.25s', display: 'inline-block',
                                    transform: openZone === zone.id ? 'rotate(180deg)' : 'rotate(0deg)',
                                }}>▼</span>
                            </button>

                            {/* RTO list */}
                            <div style={{
                                display: 'grid',
                                gridTemplateRows: openZone === zone.id ? '1fr' : '0fr',
                                transition: 'grid-template-rows 0.28s cubic-bezier(.4,0,.2,1)',
                            }}>
                                <div style={{ overflow: 'hidden' }}>
                                    <div style={{ padding: '12px 20px 16px', display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                        {zone.rtos.length === 0 ? (
                                            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-secondary)' }}>No RTOs found.</p>
                                        ) : zone.rtos.map(rto => (
                                            <div key={rto.id} style={{
                                                padding: '6px 12px', borderRadius: '8px', fontSize: '0.8rem',
                                                border: '1px solid var(--card-border)', background: 'var(--body-bg)',
                                                display: 'flex', alignItems: 'center', gap: '8px',
                                            }}>
                                                <span style={{
                                                    fontFamily: 'monospace', fontWeight: 700, fontSize: '0.75rem',
                                                    color: 'var(--primary)',
                                                }}>{rto.code}</span>
                                                <span style={{ color: 'var(--text-primary)' }}>{rto.name}</span>
                                                {!rto.is_active && (
                                                    <span style={{ fontSize: '0.65rem', color: '#ef4444' }}>Inactive</span>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
