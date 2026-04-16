import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Dashboard = ({ user }) => {
    const [metrics, setMetrics] = useState(null);
    const [bases, setBases] = useState([]);
    const [showPopup, setShowPopup] = useState(false);
    const [filterBase, setFilterBase] = useState('All');
    const [filterDate, setFilterDate] = useState('All');
    const [filterEquip, setFilterEquip] = useState('All');

    const fetchDashboard = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/dashboard?base=${filterBase}&date=${filterDate}&equipmentType=${filterEquip}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMetrics(res.data);
        } catch (err) {
            console.error("Dashboard fetch error:", err);
        }
    };

    const fetchBases = async () => {
        try {
            const res = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/bases`);
            setBases(res.data);
        } catch (err) {
            console.error("Bases fetch error:", err);
        }
    };

    useEffect(() => {
        fetchBases();
    }, []);

    useEffect(() => {
        fetchDashboard();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [filterBase, filterDate, filterEquip]);

    if (!metrics) return <div className="loading">Initializing Strategic Intel...</div>;

    return (
        <div className="dashboard-container">
            <header className="dashboard-header animate-fade-in">
                <div className="header-intel">
                    <h1>Command & Control Dashboard</h1>
                    <p className="subtitle">Real-time assets monitoring system [SECURE ACCESS]</p>
                </div>
                <div className="filters dashboard-filters">
                    {user.role !== 'Base Commander' ? (
                        <div className="filter-group">
                            <label>Sector Filter:</label>
                            <select value={filterBase} onChange={(e) => setFilterBase(e.target.value)}>
                                <option value="All">Global Sectors</option>
                                {bases.map(b => <option key={b} value={b}>{b}</option>)}
                            </select>
                        </div>
                    ) : (
                        <div className="filter-group">
                            <label>Restricted View:</label>
                            <span className="restricted-badge">{user.baseId}</span>
                        </div>
                    )}
                    <div className="filter-group">
                        <label>Timeframe:</label>
                        <select value={filterDate} onChange={(e) => setFilterDate(e.target.value)}>
                            <option value="All">All Operations</option>
                            <option value="7days">Last 7 Days</option>
                            <option value="30days">Last 30 Days</option>
                        </select>
                    </div>
                    <div className="filter-group">
                        <label>Asset Type:</label>
                        <select value={filterEquip} onChange={(e) => setFilterEquip(e.target.value)}>
                            <option value="All">All Hardware</option>
                            <option value="Weapon">Weapons</option>
                            <option value="Vehicle">Vehicles</option>
                            <option value="Ammo">Ammunition</option>
                            <option value="Consumable">Consumables</option>
                        </select>
                    </div>
                </div>
            </header>

            <div className="stats-grid">
                <div className="stat-card glass animate-slide-up">
                    <div className="card-header">
                        <i className="icon-inventory"></i>
                        <h3>Closing Balance</h3>
                    </div>
                    <p className="stat-value">{metrics.totalAssets}</p>
                    <span className="stat-label">Total Tactical Assets</span>
                </div>

                <div className="stat-card glass animate-slide-up" style={{ animationDelay: '0.1s' }}>
                    <div className="card-header">
                        <i className="icon-inventory"></i>
                        <h3>Assigned Assets</h3>
                    </div>
                    <p className="stat-value">{metrics.assignedCount}</p>
                    <span className="stat-label">Deployments Active</span>
                </div>

                <div className="stat-card glass alert animate-slide-up" style={{ animationDelay: '0.2s', borderColor: 'rgba(255, 60, 60, 0.4)' }}>
                    <div className="card-header">
                        <i className="icon-inventory"></i>
                        <h3>Expended</h3>
                    </div>
                    <p className="stat-value" style={{ color: '#ff4b4b' }}>{metrics.expendedCount}</p>
                    <span className="stat-label">Assets Destroyed/Used</span>
                </div>

                <div className="stat-card glass highlight animate-slide-up" style={{ animationDelay: '0.3s' }} onClick={() => setShowPopup(true)}>
                    <div className="card-header">
                        <i className="icon-flow"></i>
                        <h3>Net Movement</h3>
                    </div>
                    <p className="stat-value">{metrics.netMovement > 0 ? `+${metrics.netMovement}` : metrics.netMovement}</p>
                    <span className="stat-label">Operational Flow [CLICK FOR INTEL]</span>
                </div>
            </div>

            <div className="activity-section animate-fade-in" style={{ animationDelay: '0.2s' }}>
                <h2>Recent Inventory Status</h2>
                <div className="status-grid">
                    <div className="status-item">
                        <p>Purchases</p>
                        <div className="progress-bar"><div className="fill" style={{ width: `${Math.min(metrics.breakdown.purchases * 10, 100)}%` }}></div></div>
                    </div>
                    <div className="status-item">
                        <p>Expenditures</p>
                        <div className="progress-bar alert"><div className="fill" style={{ width: `${Math.min(metrics.breakdown.expenditures * 10, 100)}%` }}></div></div>
                    </div>
                </div>
            </div>

            {showPopup && (
                <div className="modal-overlay" onClick={() => setShowPopup(false)}>
                    <div className="modal-content glass animate-zoom-in" onClick={e => e.stopPropagation()}>
                        <h2>Tactical Movement Breakdown</h2>
                        <div className="breakdown-list">
                            <div className="breakdown-item positive">
                                <span>Supply Drop (Purchases):</span>
                                <span>+{metrics.breakdown.purchases}</span>
                            </div>
                            <div className="breakdown-item positive">
                                <span>Transfers Inbound:</span>
                                <span>+{metrics.breakdown.transfersIn}</span>
                            </div>
                            <div className="breakdown-item negative">
                                <span>Transfers Outbound:</span>
                                <span>-{metrics.breakdown.transfersOut}</span>
                            </div>
                            <div className="breakdown-item neutral">
                                <span>Active Assignments:</span>
                                <span>{metrics.breakdown.assignments}</span>
                            </div>
                            <div className="breakdown-item alert">
                                <span>Operational Expenditures:</span>
                                <span>{metrics.breakdown.expenditures}</span>
                            </div>
                        </div>
                        <div className="breakdown-total">
                            <span>NET MOVEMENT:</span>
                            <span className={metrics.netMovement >= 0 ? 'positive' : 'negative'}>
                                {metrics.netMovement > 0 ? `+${metrics.netMovement}` : metrics.netMovement}
                            </span>
                        </div>
                        <button className="close-btn" onClick={() => setShowPopup(false)}>ACKNOWLEDGE & CLOSE</button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;
