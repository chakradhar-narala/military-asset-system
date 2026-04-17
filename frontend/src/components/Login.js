import React, { useState } from 'react';
import api from '../services/api';

const Login = ({ setAuth }) => {
    const [credentials, setCredentials] = useState({ username: '', password: '' });
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await api.post('/api/auth/login', credentials);
            localStorage.setItem('token', res.data.token);
            setAuth(res.data.user);
        } catch (err) {
            setError('Authentication Failed. Check Intel (Credentials).');
        }
    };

    return (
        <div className="login-overlay">
            <div className="login-card">
                <h2>Strategic Command Access</h2>
                <form onSubmit={handleSubmit} className="tactical-form">
                    <input 
                        type="text" 
                        placeholder="Callsign (Username)" 
                        value={credentials.username} 
                        onChange={e => setCredentials({...credentials, username: e.target.value})} 
                        required 
                    />
                    <input 
                        type="password" 
                        placeholder="Secure Key (Password)" 
                        value={credentials.password} 
                        onChange={e => setCredentials({...credentials, password: e.target.value})} 
                        required 
                    />
                    <button type="submit" className="action-btn">Access Command</button>
                </form>
                {error && <p className="error-message">{error}</p>}
                <div className="login-hint">
                    <p>Hint: Use Seed Script to create accounts.</p>
                </div>
            </div>
        </div>
    );
};

export default Login;
