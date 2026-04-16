import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Transfers = () => {
    const [assets, setAssets] = useState([]);
    const [bases, setBases] = useState([]);
    const [selectedAsset, setSelectedAsset] = useState('');
    const [toBase, setToBase] = useState('');
    const [message, setMessage] = useState('');

    const [history, setHistory] = useState([]);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const [assetsRes, basesRes, historyRes] = await Promise.all([
                axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/purchases`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/bases`),
                axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/transactions?type=Transfer Out`, { headers: { Authorization: `Bearer ${token}` } })
            ]);
            setAssets(assetsRes.data.filter(a => a.status === 'Available'));
            setBases(basesRes.data);
            setHistory(historyRes.data);
            if (basesRes.data.length > 0) setToBase(basesRes.data[0]);
        } catch (err) {
            console.error("Failed to fetch data:", err);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleTransfer = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/transfers`, { assetId: selectedAsset, toBase }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage('TRANSFER ORDERS CONFIRMED. DEPLOYMENT IN PROGRESS.');
            setSelectedAsset('');
            fetchData(); // Refresh history and assets
        } catch (err) {
            setMessage('OPERATION DENIED: UNAUTHORIZED ROLE OR SYSTEM ERROR.');
        }
    };

    return (
        <div className="procurement-view">
            <div className="form-container glass animate-fade-in" style={{ marginBottom: '2rem' }}>
                <h2>Asset Strategic Deployment</h2>
                <p className="subtitle">Initiate inter-sector asset transfer protocols</p>
                <form onSubmit={handleTransfer} className="tactical-form">
                    <div className="input-group">
                        <label>Select Asset to Deploy</label>
                        <select value={selectedAsset} onChange={e => setSelectedAsset(e.target.value)} required>
                            <option value="">-- SELECT ASSET --</option>
                            {assets.map(a => <option key={a._id} value={a._id}>{a.name} [Currently: {a.baseId}]</option>)}
                        </select>
                    </div>
                    <div className="input-group">
                        <label>Destination Sector</label>
                        <select value={toBase} onChange={e => setToBase(e.target.value)} required>
                            <option value="">-- SELECT DESTINATION --</option>
                            {bases.map(b => <option key={b} value={b}>{b}</option>)}
                            <option value="NEW_SECTOR">Add New Sector...</option>
                        </select>
                    </div>
                    {toBase === 'NEW_SECTOR' && (
                        <input 
                            type="text" 
                            placeholder="Enter New Sector Name" 
                            onChange={e => setToBase(e.target.value)} 
                            required 
                        />
                    )}
                    <button type="submit" className="action-btn">Authorize Deployment</button>
                </form>
                {message && <div className={`form-message ${message.includes('DENIED') ? 'error' : 'success'}`}>{message}</div>}
            </div>

            <div className="history-container glass animate-slide-up">
                <div className="history-header">
                    <h2>Transfer Logs</h2>
                </div>
                <div className="table-responsive">
                    <table className="tactical-table">
                        <thead>
                            <tr>
                                <th>Timestamp</th>
                                <th>Asset Model</th>
                                <th>Movement</th>
                                <th>Authorized By</th>
                            </tr>
                        </thead>
                        <tbody>
                            {history.length > 0 ? history.map(record => (
                                <tr key={record._id}>
                                    <td>{new Date(record.date).toLocaleString()}</td>
                                    <td>{record.assetId?.name || 'UNKNOWN'}</td>
                                    <td>{record.fromBase} &rarr; {record.toBase}</td>
                                    <td>{record.performedBy?.username || 'SYSTEM'}</td>
                                </tr>
                            )) : (
                                <tr>
                                    <td colSpan="4">No historical transfer orders found.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Transfers;
