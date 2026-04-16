import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Purchases = () => {
    const [bases, setBases] = useState([]);
    const [formData, setFormData] = useState({ name: '', equipmentType: 'Weapon', baseId: '', quantity: 1 });
    const [message, setMessage] = useState('');
    
    // History State
    const [history, setHistory] = useState([]);
    const [filterDate, setFilterDate] = useState('All');
    const [filterEquip, setFilterEquip] = useState('All');

    const fetchBases = async () => {
        try {
            const res = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/bases`);
            setBases(res.data);
            if (res.data.length > 0) setFormData(prev => ({ ...prev, baseId: res.data[0] }));
        } catch (err) {
            console.error("Failed to fetch bases:", err);
        }
    };

    const fetchHistory = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/transactions?type=Purchase&date=${filterDate}&equipmentType=${filterEquip}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setHistory(res.data);
        } catch (err) {
            console.error("Failed to fetch history:", err);
        }
    };

    useEffect(() => {
        fetchBases();
    }, []);

    useEffect(() => {
        fetchHistory();
    }, [filterDate, filterEquip]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/purchases`, formData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage('PROCUREMENT SUCCESSFUL. ASSET ADDED TO STRATEGIC RESERVE.');
            setFormData({ ...formData, name: '', quantity: 1 });
            fetchHistory(); // Refresh history
            fetchBases(); // Refresh bases in case a new one was added
        } catch (err) {
            setMessage('ACCESS DENIED: LOGISTICS CLEARANCE REQUIRED.');
        }
    };

    return (
        <div className="procurement-view">
            <div className="form-container glass animate-fade-in" style={{ marginBottom: '2rem' }}>
                <h2>Log New Procurement</h2>
                <p className="subtitle">Enter specialized equipment acquisition details</p>
                <form onSubmit={handleSubmit} className="tactical-form">
                    <input 
                        type="text" 
                        placeholder="Asset Model / Nomenclature" 
                        value={formData.name} 
                        onChange={e => setFormData({...formData, name: e.target.value})} 
                        required 
                    />
                    <select value={formData.equipmentType} onChange={e => setFormData({...formData, equipmentType: e.target.value})}>
                        <option value="Weapon">Weapon System</option>
                        <option value="Vehicle">Combat Vehicle</option>
                        <option value="Ammo">Ammunition</option>
                        <option value="Consumable">Logistics Consumable</option>
                    </select>
                    <select value={formData.baseId} onChange={e => setFormData({...formData, baseId: e.target.value})}>
                        {bases.map(b => <option key={b} value={b}>{b}</option>)}
                        <option value="NEW_BASE">Initialize New Sector...</option>
                    </select>
                    {formData.baseId === 'NEW_BASE' && (
                        <input 
                            type="text" 
                            placeholder="New Sector Identifier" 
                            onChange={e => setFormData({...formData, baseId: e.target.value})} 
                            required 
                        />
                    )}
                    <input 
                        type="number" 
                        value={formData.quantity} 
                        onChange={e => setFormData({...formData, quantity: parseInt(e.target.value)})} 
                        min="1"
                    />
                    <button type="submit" className="action-btn">Confirm Acquisition</button>
                </form>
                {message && <div className={`form-message ${message.includes('DENIED') ? 'error' : 'success'}`}>{message}</div>}
            </div>

            <div className="history-container glass animate-slide-up">
                <div className="history-header">
                    <h2>Procurement History</h2>
                    <div className="filters">
                        <select value={filterDate} onChange={(e) => setFilterDate(e.target.value)}>
                            <option value="All">All Time</option>
                            <option value="7days">Last 7 Days</option>
                            <option value="30days">Last 30 Days</option>
                        </select>
                        <select value={filterEquip} onChange={(e) => setFilterEquip(e.target.value)}>
                            <option value="All">All Equipment</option>
                            <option value="Weapon">Weapons</option>
                            <option value="Vehicle">Vehicles</option>
                            <option value="Ammo">Ammunition</option>
                            <option value="Consumable">Consumables</option>
                        </select>
                    </div>
                </div>
                <div className="table-responsive">
                    <table className="tactical-table">
                        <thead>
                            <tr>
                                <th>Date (UTC)</th>
                                <th>Asset Model</th>
                                <th>Type</th>
                                <th>Destination</th>
                                <th>Officer</th>
                            </tr>
                        </thead>
                        <tbody>
                            {history.length > 0 ? history.map(record => (
                                <tr key={record._id}>
                                    <td>{new Date(record.date).toLocaleString()}</td>
                                    <td>{record.assetId?.name || 'UNKNOWN'}</td>
                                    <td>{record.assetId?.equipmentType || '-'}</td>
                                    <td>{record.toBase}</td>
                                    <td>{record.performedBy?.username || 'SYSTEM'}</td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="5">No procurement records found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Purchases;
