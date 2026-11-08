import { useState, useEffect } from 'react';
import { db, auth } from './firebase';
import { ref, onValue, update, set, get } from 'firebase/database';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';

// ------------------------------------------------------------------
// INJECTED CSS FOR LUXURY UI & RESPONSIVENESS
// ------------------------------------------------------------------
const luxuryStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Inter:wght@300;400;500;600&display=swap');

  :root {
    --bg-color: #0a0a0a;
    --card-bg: #141414;
    --card-border: #262626;
    --text-main: #f5f5f5;
    --text-muted: #a3a3a3;
    --accent-gold: #c5a059;
    --accent-gold-hover: #d4af37;
    --danger-red: #7f1d1d;
    --success-green: #14532d;
    --font-heading: 'Playfair Display', serif;
    --font-ui: 'Inter', sans-serif;
  }

  body {
    margin: 0;
    background-color: var(--bg-color);
    color: var(--text-main);
    font-family: var(--font-ui);
    -webkit-font-smoothing: antialiased;
  }

  /* Layouts */
  .app-container {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    padding: 24px;
    box-sizing: border-box;
  }

  .center-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: calc(100vh - 48px);
  }

  .dashboard-wrapper {
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
  }

  /* Cards */
  .luxury-card {
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    border-radius: 12px;
    padding: 32px;
    width: 100%;
    max-width: 420px;
    box-shadow: 0 20px 40px rgba(0,0,0,0.5);
    text-align: center;
  }

  /* Typography */
  .heading-brand {
    font-family: var(--font-heading);
    color: var(--accent-gold);
    font-size: 1.75rem;
    font-weight: 600;
    margin: 0 0 24px 0;
    letter-spacing: 1px;
  }

  .heading-dashboard {
    font-family: var(--font-heading);
    color: var(--text-main);
    font-size: 2rem;
    margin: 0;
    font-weight: 400;
    letter-spacing: 0.5px;
  }

  .car-title {
    font-size: 1.75rem;
    font-weight: 600;
    margin: 0 0 8px 0;
    letter-spacing: -0.5px;
  }

  .car-subtitle {
    color: var(--text-muted);
    font-size: 1rem;
    margin: 0 0 24px 0;
    font-weight: 300;
  }

  /* Buttons */
  .btn-gold {
    background: var(--accent-gold);
    color: #000;
    border: none;
    padding: 16px 24px;
    border-radius: 4px;
    font-size: 1.1rem;
    font-weight: 600;
    width: 100%;
    cursor: pointer;
    transition: all 0.3s ease;
    text-transform: uppercase;
    letter-spacing: 1px;
  }
  .btn-gold:hover:not(:disabled) {
    background: var(--accent-gold-hover);
    transform: translateY(-2px);
  }
  .btn-gold:disabled {
    background: #333;
    color: #666;
    cursor: not-allowed;
  }

  .btn-outline {
    background: transparent;
    color: var(--text-main);
    border: 1px solid var(--card-border);
    padding: 10px 20px;
    border-radius: 4px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
  }
  .btn-outline:hover {
    background: rgba(255,255,255,0.05);
    border-color: var(--text-muted);
  }

  .btn-action {
    background: #450a0a;
    color: #fca5a5;
    border: 1px solid #7f1d1d;
    padding: 12px;
    border-radius: 4px;
    width: 100%;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s;
  }
  .btn-action:hover { background: #7f1d1d; color: #fff; }

  /* Inputs */
  .luxury-input {
    background: #000;
    border: 1px solid var(--card-border);
    color: var(--text-main);
    padding: 14px;
    width: 100%;
    margin-bottom: 16px;
    border-radius: 4px;
    box-sizing: border-box;
    font-family: var(--font-ui);
    font-size: 1rem;
  }
  .luxury-input:focus {
    outline: none;
    border-color: var(--accent-gold);
  }

  /* Grid for Dashboard */
  .dashboard-grid {
    display: grid;
    grid-template-columns: 1fr;
    gap: 32px;
    margin-top: 32px;
  }
  @media (min-width: 768px) {
    .dashboard-grid { grid-template-columns: 1fr 1fr; }
  }

  /* Queue Columns */
  .queue-column {
    background: var(--card-bg);
    border: 1px solid var(--card-border);
    border-radius: 8px;
    padding: 24px;
  }
  .queue-title {
    font-family: var(--font-heading);
    font-size: 1.5rem;
    margin: 0 0 20px 0;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--card-border);
  }

  /* Status Box */
  .status-box {
    background: #000;
    border: 1px solid var(--card-border);
    padding: 20px;
    border-radius: 6px;
    margin-bottom: 32px;
  }

  .ticket-card {
    background: #000;
    border: 1px solid var(--card-border);
    padding: 20px;
    border-radius: 6px;
    margin-bottom: 16px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  /* Modal */
  .modal-overlay {
    position: fixed; top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.85);
    backdrop-filter: blur(4px);
    display: flex; justify-content: center; align-items: center;
    z-index: 1000;
    padding: 20px;
  }
  
  /* Tables */
  .luxury-table {
    width: 100%;
    border-collapse: collapse;
    text-align: left;
  }
  .luxury-table th {
    padding: 16px;
    border-bottom: 1px solid var(--card-border);
    color: var(--text-muted);
    font-weight: 500;
  }
  .luxury-table td {
    padding: 16px;
    border-bottom: 1px solid var(--card-border);
  }
`;

// ------------------------------------------------------------------
// 1. GUEST VIEW COMPONENT (PUBLIC)
// ------------------------------------------------------------------
function GuestTicketView({ ticketId }) {
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onValue(ref(db, `tickets/${ticketId}`), (snapshot) => {
      if (snapshot.exists()) setTicket(snapshot.val());
      setLoading(false);
    });
    return () => unsubscribe();
  }, [ticketId]);

  const requestVehicle = async () => {
    if (!ticket) return;
    await update(ref(db, `tickets/${ticketId}`), {
      status: "requested",
      "timestamps/requestedAt": Date.now()
    });
  };

  if (loading) return <div className="app-container center-wrapper">Retrieving digital ticket...</div>;
  if (!ticket) return <div className="app-container center-wrapper">Ticket not found or expired.</div>;

  const { vehicle, status, parkingSpot } = ticket;
  const isRequested = status === "requested" || status === "retrieved";

  return (
    <div className="app-container center-wrapper">
      <div className="luxury-card">
        <h2 className="heading-brand">WALDORF ASTORIA</h2>
        
        <div>
          <h3 className="car-title">{vehicle.make} {vehicle.model}</h3>
          <p className="car-subtitle">{vehicle.color} &nbsp;|&nbsp; {vehicle.licensePlate}</p>
        </div>

        <div className="status-box">
          <p style={{ margin: '0 0 8px 0', color: 'var(--text-muted)', fontSize: '0.9rem', textTransform: 'uppercase' }}>Current Status</p>
          <p style={{ 
            margin: 0, 
            fontSize: '1.75rem', 
            fontWeight: '600',
            color: status === 'parked' ? 'var(--accent-gold)' : '#f5f5f5' 
          }}>
            {status.toUpperCase()}
          </p>
          {status === "parked" && <p style={{ margin: '12px 0 0 0', color: 'var(--text-muted)' }}>Spot: <span style={{color: '#fff'}}>{parkingSpot}</span></p>}
        </div>

        <button 
          onClick={requestVehicle} 
          disabled={isRequested}
          className="btn-gold"
        >
          {isRequested ? "Vehicle Requested" : "Request My Vehicle"}
        </button>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// 2. LOGIN COMPONENT
// ------------------------------------------------------------------
function LoginView() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError('Invalid credentials. Access denied.');
    }
  };

  return (
    <div className="app-container center-wrapper">
      <div className="luxury-card">
        <h2 className="heading-brand" style={{color: '#fff'}}>STAFF PORTAL</h2>
        {error && <p style={{ color: '#ef4444', fontSize: '0.9rem', marginBottom: '16px' }}>{error}</p>}
        <form onSubmit={handleLogin}>
          <input type="email" placeholder="Staff Email" required className="luxury-input" onChange={(e) => setEmail(e.target.value)} />
          <input type="password" placeholder="Password" required className="luxury-input" onChange={(e) => setPassword(e.target.value)} />
          <button type="submit" className="btn-gold" style={{marginTop: '8px'}}>Authenticate</button>
        </form>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// 3. VALET DASHBOARD COMPONENT (RUNNERS)
// ------------------------------------------------------------------
function ValetDashboardView() {
  const [tickets, setTickets] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [newlyCreatedTicket, setNewlyCreatedTicket] = useState(null);
  const [formData, setFormData] = useState({ make: '', model: '', color: '', plate: '', spot: '', phone: '' });

  const currentVenueId = "venue_001";

  useEffect(() => {
    const unsubscribe = onValue(ref(db, 'tickets'), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setTickets(Object.keys(data)
          .map(key => ({ id: key, ...data[key] }))
          .filter(t => t.venueId === currentVenueId && t.status !== "retrieved"));
      } else {
        setTickets([]);
      }
    });
    return () => unsubscribe();
  }, []);

  const markAsRetrieved = async (ticketId) => {
    await update(ref(db, `tickets/${ticketId}`), { status: "retrieved", "timestamps/retrievedAt": Date.now() });
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    const ticketId = `ticket_${Date.now()}`;
    await set(ref(db, `tickets/${ticketId}`), {
      venueId: currentVenueId, guestPhone: formData.phone,
      vehicle: { make: formData.make, model: formData.model, color: formData.color, licensePlate: formData.plate },
      parkingSpot: formData.spot, status: "parked", parkedByUserId: auth.currentUser.uid,
      timestamps: { issuedAt: Date.now(), parkedAt: Date.now(), requestedAt: null, retrievedAt: null }
    });
    setNewlyCreatedTicket(ticketId);
  };

  const requestedCars = tickets.filter(t => t.status === "requested");
  const parkedCars = tickets.filter(t => t.status === "parked");
  const currentDomain = window.location.origin;

  return (
    <div className="app-container">
      <div className="dashboard-wrapper">
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <h1 className="heading-dashboard">Live Queue</h1>
            <button onClick={() => signOut(auth)} className="btn-outline" style={{fontSize: '0.8rem'}}>Logout</button>
          </div>
          <button onClick={() => setShowModal(true)} className="btn-gold" style={{width: 'auto'}}>+ Log Arrival</button>
        </div>

        <div className="dashboard-grid">
          {/* URGENT QUEUE */}
          <div className="queue-column" style={{ borderColor: 'var(--danger-red)' }}>
            <h2 className="queue-title" style={{ color: '#fca5a5' }}>Action Required ({requestedCars.length})</h2>
            {requestedCars.map(t => (
              <div key={t.id} className="ticket-card" style={{ borderLeft: '4px solid #f87171' }}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                  <div>
                    <h3 style={{margin: '0 0 4px 0', fontSize: '1.2rem'}}>{t.vehicle.make} {t.vehicle.model}</h3>
                    <p style={{margin: '0', color: 'var(--text-muted)', fontSize: '0.9rem'}}>{t.vehicle.color} • {t.vehicle.licensePlate}</p>
                  </div>
                  <div style={{background: 'rgba(248, 113, 113, 0.1)', color: '#fca5a5', padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.9rem'}}>
                    Spot: {t.parkingSpot}
                  </div>
                </div>
                <button onClick={() => markAsRetrieved(t.id)} className="btn-action" style={{marginTop: '12px'}}>
                  Handed to Guest
                </button>
              </div>
            ))}
            {requestedCars.length === 0 && <p style={{color: 'var(--text-muted)'}}>No pending requests.</p>}
          </div>

          {/* PARKED QUEUE */}
          <div className="queue-column">
            <h2 className="queue-title" style={{ color: 'var(--text-main)' }}>Currently Parked ({parkedCars.length})</h2>
            {parkedCars.map(t => (
              <div key={t.id} className="ticket-card" style={{ borderLeft: '4px solid var(--card-border)' }}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                  <div>
                    <h3 style={{margin: '0 0 4px 0', fontSize: '1.1rem'}}>{t.vehicle.make} {t.vehicle.model}</h3>
                    <p style={{margin: '0', color: 'var(--text-muted)', fontSize: '0.9rem'}}>{t.vehicle.licensePlate}</p>
                  </div>
                  <div style={{color: 'var(--accent-gold)', fontWeight: '500'}}>
                    {t.parkingSpot}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* NEW ARRIVAL MODAL */}
      {showModal && (
        <div className="modal-overlay">
          <div className="luxury-card" style={{width: '90%'}}>
            {!newlyCreatedTicket ? (
              <form onSubmit={handleCreateTicket}>
                <h2 className="heading-brand" style={{color: '#fff', fontSize: '1.5rem'}}>LOG ARRIVAL</h2>
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px'}}>
                  <input required placeholder="Make" className="luxury-input" style={{marginBottom: 0}} onChange={e => setFormData({...formData, make: e.target.value})} />
                  <input required placeholder="Model" className="luxury-input" style={{marginBottom: 0}} onChange={e => setFormData({...formData, model: e.target.value})} />
                </div>
                <input required placeholder="Color" className="luxury-input" style={{marginTop: '12px'}} onChange={e => setFormData({...formData, color: e.target.value})} />
                <input required placeholder="License Plate" className="luxury-input" onChange={e => setFormData({...formData, plate: e.target.value})} />
                <input required placeholder="Parking Spot" className="luxury-input" onChange={e => setFormData({...formData, spot: e.target.value})} />
                <input required placeholder="Guest Phone" className="luxury-input" onChange={e => setFormData({...formData, phone: e.target.value})} />
                <div style={{display: 'flex', gap: '12px', marginTop: '16px'}}>
                  <button type="submit" className="btn-gold">Generate</button>
                  <button type="button" onClick={() => setShowModal(false)} className="btn-outline" style={{flex: 1}}>Cancel</button>
                </div>
              </form>
            ) : (
              <div>
                <h2 className="heading-brand" style={{color: 'var(--accent-gold)'}}>TICKET ACTIVE</h2>
                <div style={{background: '#fff', padding: '16px', borderRadius: '8px', display: 'inline-block', margin: '20px 0'}}>
                  <img src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(`${currentDomain}/?ticket=${newlyCreatedTicket}`)}`} alt="QR Code" style={{display: 'block'}} />
                </div>
                <button onClick={() => { setShowModal(false); setNewlyCreatedTicket(null); setFormData({make: '', model: '', color: '', plate: '', spot: '', phone: ''}); }} className="btn-outline" style={{width: '100%'}}>Return to Queue</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ------------------------------------------------------------------
// 4. MASTER ADMIN DASHBOARD (MANAGEMENT)
// ------------------------------------------------------------------
function MasterAdminView() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const unsubscribe = onValue(ref(db, 'tickets'), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setHistory(Object.keys(data)
          .map(key => ({ id: key, ...data[key] }))
          .filter(t => t.status === "retrieved" && t.timestamps.requestedAt && t.timestamps.retrievedAt)
          .sort((a, b) => b.timestamps.retrievedAt - a.timestamps.retrievedAt));
      }
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="app-container">
      <div className="dashboard-wrapper">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <h1 className="heading-dashboard">Management Overview</h1>
          <button onClick={() => signOut(auth)} className="btn-outline">Logout</button>
        </div>

        <div className="queue-column">
          <h2 className="queue-title">Performance Metrics</h2>
          <div style={{ overflowX: 'auto' }}>
            <table className="luxury-table">
              <thead>
                <tr>
                  <th>Vehicle</th>
                  <th>License Plate</th>
                  <th>Retrieval Time</th>
                </tr>
              </thead>
              <tbody>
                {history.map(t => {
                  const ms = t.timestamps.retrievedAt - t.timestamps.requestedAt;
                  const mins = Math.floor(ms / 60000);
                  const secs = ((ms % 60000) / 1000).toFixed(0);
                  return (
                    <tr key={t.id}>
                      <td style={{ color: '#fff' }}>{t.vehicle.make} {t.vehicle.model}</td>
                      <td>{t.vehicle.licensePlate}</td>
                      <td style={{ color: mins > 5 ? '#fca5a5' : 'var(--accent-gold)' }}>
                        {mins}m {secs}s
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// 5. MAIN ROUTER & APP SHELL
// ------------------------------------------------------------------
function App() {
  const [userRole, setUserRole] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);

  const searchParams = new URLSearchParams(window.location.search);
  const requestedTicketId = searchParams.get('ticket');

  useEffect(() => {
    // Inject the CSS into the document head automatically
    const styleSheet = document.createElement("style");
    styleSheet.innerText = luxuryStyles;
    document.head.appendChild(styleSheet);

    if (requestedTicketId) {
      setIsGuest(true);
      setAuthLoading(false);
      return () => document.head.removeChild(styleSheet);
    }

    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const snapshot = await get(ref(db, `users/${currentUser.uid}`));
        setUserRole(snapshot.exists() ? snapshot.val().role : "valet_runner");
      } else {
        setUserRole(null);
      }
      setAuthLoading(false);
    });

    return () => {
      unsubscribe();
      document.head.removeChild(styleSheet);
    };
  }, [requestedTicketId]);

  if (authLoading) return <div className="app-container center-wrapper">Authenticating...</div>;
  if (isGuest) return <GuestTicketView ticketId={requestedTicketId} />;
  if (!userRole) return <LoginView />;
  if (userRole === "master_admin") return <MasterAdminView />;
  return <ValetDashboardView />;
}

export default App;