import React, { useState, useEffect } from 'react';
import Dashboard from './components/Dashboard';
import Purchases from './components/Purchases';
import Transfers from './components/Transfers';
import Assignments from './components/Assignments';
import Login from './components/Login';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [view, setView] = useState('dashboard');

  useEffect(() => {
    try {
      const savedUser = localStorage.getItem('user');
      if (savedUser && savedUser !== 'undefined') {
        setUser(JSON.parse(savedUser));
      }
    } catch (err) {
      console.error("Failed to parse user from local storage:", err);
      localStorage.removeItem('user');
    }
  }, []);

  const setAuth = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  if (!user) {
    return <Login setAuth={setAuth} />;
  }

  return (
    <div className="app-container">
      <nav className="side-nav">
        <div className="nav-logo">Tactical Intel</div>
        <ul>
          <li className={view === 'dashboard' ? 'active' : ''} onClick={() => setView('dashboard')}>Dashboard</li>
          {(user.role === 'Admin' || user.role === 'Logistics Officer') && (
            <>
              <li className={view === 'purchases' ? 'active' : ''} onClick={() => setView('purchases')}>Procurement (Purchases)</li>
              <li className={view === 'transfers' ? 'active' : ''} onClick={() => setView('transfers')}>Transfers</li>
            </>
          )}
          <li className={view === 'assignments' ? 'active' : ''} onClick={() => setView('assignments')}>Field Assignments</li>
        </ul>
        <div className="nav-footer">
          <p>User: {user.username}</p>
          <p>Role: {user.role}</p>
          <button onClick={logout} className="logout-btn">Abort Mission</button>
        </div>
      </nav>

      <main className="content-area">
        {view === 'dashboard' && <Dashboard user={user} />}
        {view === 'purchases' && <Purchases />}
        {view === 'transfers' && <Transfers />}
        {view === 'assignments' && <Assignments />}
      </main>
    </div>
  );
}

export default App;