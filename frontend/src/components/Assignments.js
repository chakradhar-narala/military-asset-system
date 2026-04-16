import React, { useState, useEffect } from 'react';
import axios from 'axios';

const Assignments = () => {
    const [assets, setAssets] = useState([]);
    const [selectedAsset, setSelectedAsset] = useState('');
    const [type, setType] = useState('Assignment');
    const [assignedTo, setAssignedTo] = useState('');
    const [message, setMessage] = useState('');

    useEffect(() => {
        const fetchAssets = async () => {
            try {
                const token = localStorage.getItem('token');
                const res = await axios.get(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/purchases`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setAssets(res.data.filter(a => a.status === 'Available'));
            } catch (err) {
                console.error("Failed to fetch assets:", err);
            }
        };
        fetchAssets();
    }, []);

    const handleAssign = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            await axios.post(`${process.env.REACT_APP_API_URL || 'http://localhost:5000'}/api/assignments`, { assetId: selectedAsset, type, assignedTo }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage(`TACTICAL ${type.toUpperCase()} LOGGED SUCCESSFULLY.`);
            setSelectedAsset('');
            setAssignedTo('');
        } catch (err) {
            setMessage('AUTHORIZATION FAILURE: FIELD OPERATIONS DENIED.');
        }
    };

    return (
        <div className="form-container glass animate-fade-in">
            <h2>Field Assignment & Expenditure</h2>
            <p className="subtitle">Log operational status changes for tactical equipment</p>
            <form onSubmit={handleAssign} className="tactical-form">
                <div className="input-group">
                    <label>Combat Ready Asset</label>
                    <select value={selectedAsset} onChange={e => setSelectedAsset(e.target.value)} required>
                        <option value="">-- SELECT AVAILABLE ASSET --</option>
                        {assets.map(a => <option key={a._id} value={a._id}>{a.name} [{a.baseId}]</option>)}
                    </select>
                </div>
                <div className="input-group">
                    <label>Operation Type</label>
                    <select value={type} onChange={e => setType(e.target.value)}>
                        <option value="Assignment">Unit Assignment</option>
                        <option value="Expenditure">Operational Expenditure (Consumable)</option>
                    </select>
                </div>
                <div className="input-group">
                    <label>Recipient / Target</label>
                    <input 
                        type="text" 
                        placeholder="Personnel Name or Unit Identifier" 
                        value={assignedTo} 
                        onChange={e => setAssignedTo(e.target.value)} 
                        required={type === 'Assignment'}
                    />
                </div>
                <button type="submit" className="action-btn">Log Operation Status</button>
            </form>
            {message && <div className={`form-message ${message.includes('FAILURE') ? 'error' : 'success'}`}>{message}</div>}
        </div>
    );
};

export default Assignments;
