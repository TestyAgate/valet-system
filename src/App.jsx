import { useState, useEffect } from 'react';
import { db, auth } from './firebase'; // Imported auth here
import { ref, onValue, update, set } from 'firebase/database';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';

// ------------------------------------------------------------------
// 1. GUEST VIEW COMPONENT (PUBLIC)
// ------------------------------------------------------------------
function GuestTicketView({ ticketId }) {
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ticketRef = ref(db, `tickets/${ticketId}`);
    const unsubscribe = onValue(ticketRef, (snapshot) => {
      if (snapshot.exists()) {
        setTicket(snapshot.val());
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [ticketId]);

  const requestVehicle = async () => {
    if (!ticket) return;
    try {
      await update(ref(db, `tickets/${ticketId}`), {
        status: "requested",
        "timestamps/requestedAt": Date.now()
      });
    } catch (error) {
      console.error("Error requesting vehicle:", error);
    }
  };

  if (loading) return <div style={styles.container}>Loading your digital ticket...</div>;
  if (!ticket) return <div style={styles.container}>Ticket not found or expired.</div>;

  const { vehicle, status, parkingSpot } = ticket;
  const isRequested = status === "requested" || status === "retrieved";

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Waldorf Astoria Valet</h2>
        <div style={{ marginBottom: '24px' }}>
          <h3 style={styles.carName}>{vehicle.make} {vehicle.model}</h3>
          <p style={styles.carDetails}>{vehicle.color} • {vehicle.licensePlate}</p>
        </div>
        <div style={styles.statusBox}>
          <p style={styles.statusLabel}>Current Status</p>
          <p style={{ ...styles.statusValue, color: status === 'parked' ? '#10b981' : '#f59e0b' }}>
            {status.toUpperCase()}
          </p>
          {status === "parked" && <p style={styles.spotText}>Spot: {parkingSpot}</p>}
        </div>
        <button 
          onClick={requestVehicle} 
          disabled={isRequested}
          style={{
            ...styles.button,
            backgroundColor: isRequested ? '#9ca3af' : '#000000',
            cursor: isRequested ? 'not-allowed' : 'pointer'
          }}
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
      setError('Invalid email or password.');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>Staff Login</h2>
        {error && <p style={{ color: 'red', fontSize: '0.875rem' }}>{error}</p>}
        <form onSubmit={handleLogin}>
          <input 
            type="email" 
            placeholder="Staff Email" 
            required 
            style={styles.input} 
            onChange={(e) => setEmail(e.target.value)} 
          />
          <input 
            type="password" 
            placeholder="Password" 
            required 
            style={styles.input} 
            onChange={(e) => setPassword(e.target.value)} 
          />
          <button type="submit" style={styles.submitButton}>Login to Dashboard</button>
        </form>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// 3. VALET DASHBOARD COMPONENT (PROTECTED)
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
        const activeTickets = Object.keys(data)
          .map(key => ({ id: key, ...data[key] }))
          .filter(t => t.venueId === currentVenueId && t.status !== "retrieved");
        setTickets(activeTickets);
      } else {
        setTickets([]);
      }
    });
    return () => unsubscribe();
  }, []);

  const markAsRetrieved = async (ticketId) => {
    await update(ref(db, `tickets/${ticketId}`), {
      status: "retrieved",
      "timestamps/retrievedAt": Date.now()
    });
  };

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    const ticketId = `ticket_${Date.now()}`;
    const newTicket = {
      venueId: currentVenueId,
      guestPhone: formData.phone,
      vehicle: { make: formData.make, model: formData.model, color: formData.color, licensePlate: formData.plate },
      parkingSpot: formData.spot,
      status: "parked",
      parkedByUserId: auth.currentUser.uid, // Track exactly which staff member parked it
      timestamps: { issuedAt: Date.now(), parkedAt: Date.now(), requestedAt: null, retrievedAt: null }
    };
    await set(ref(db, `tickets/${ticketId}`), newTicket);
    setNewlyCreatedTicket(ticketId);
  };

  const requestedCars = tickets.filter(t => t.status === "requested");
  const parkedCars = tickets.filter(t => t.status === "parked");
  const currentDomain = window.location.origin;

  return (
    <div style={styles.container}>
      <div style={styles.dashboard}>
        <div style={styles.header}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <h1 style={styles.title}>Valet Live Queue</h1>
            <button onClick={() => signOut(auth)} style={styles.logoutButton}>Logout</button>
          </div>
          <button onClick={() => setShowModal(true)} style={styles.newButton}>+ Log New Vehicle</button>
        </div>

        <div style={styles.grid}>
          <div style={styles.column}>
            <h2 style={{...styles.columnTitle, color: '#dc2626'}}>Action Required ({requestedCars.length})</h2>
            {requestedCars.map(t => (
              <div key={t.id} style={{...styles.card, borderLeft: '6px solid #dc2626'}}>
                <h3 style={styles.carName}>{t.vehicle.make} {t.vehicle.model}</h3>
                <p style={styles.carDetails}>{t.vehicle.color} • {t.vehicle.licensePlate}</p>
                <div style={styles.spotHighlight}>Retrieve from: {t.parkingSpot}</div>
                <button onClick={() => markAsRetrieved(t.id)} style={styles.actionButton}>Mark Handed to Guest</button>
              </div>
            ))}
          </div>

          <div style={styles.column}>
            <h2 style={{...styles.columnTitle, color: '#10b981'}}>Currently Parked ({parkedCars.length})</h2>
            {parkedCars.map(t => (
              <div key={t.id} style={{...styles.card, borderLeft: '6px solid #10b981'}}>
                <h3 style={styles.carName}>{t.vehicle.make} {t.vehicle.model}</h3>
                <p style={styles.carDetails}>{t.vehicle.color} • {t.vehicle.licensePlate}</p>
                <p style={{...styles.spotText, color: '#10b981'}}>Spot: {t.parkingSpot}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showModal && (
        <div style={styles.modalOverlay}>
          <div style={styles.modalContent}>
            {!newlyCreatedTicket ? (
              <form onSubmit={handleCreateTicket}>
                <h2 style={{marginTop: 0}}>Log New Arrival</h2>
                <input required placeholder="Make (e.g. BMW)" style={styles.input} onChange={e => setFormData({...formData, make: e.target.value})} />
                <input required placeholder="Model (e.g. X5)" style={styles.input} onChange={e => setFormData({...formData, model: e.target.value})} />
                <input required placeholder="Color" style={styles.input} onChange={e => setFormData({...formData, color: e.target.value})} />
                <input required placeholder="License Plate" style={styles.input} onChange={e => setFormData({...formData, plate: e.target.value})} />
                <input required placeholder="Parking Spot" style={styles.input} onChange={e => setFormData({...formData, spot: e.target.value})} />
                <input required placeholder="Guest Phone" style={styles.input} onChange={e => setFormData({...formData, phone: e.target.value})} />
                <div style={{display: 'flex', gap: '10px', marginTop: '20px'}}>
                  <button type="submit" style={styles.submitButton}>Create Ticket</button>
                  <button type="button" onClick={() => setShowModal(false)} style={styles.cancelButton}>Cancel</button>
                </div>
              </form>
            ) : (
              <div style={{textAlign: 'center'}}>
                <h2 style={{color: '#10b981', marginTop: 0}}>Ticket Created!</h2>
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`${currentDomain}/?ticket=${newlyCreatedTicket}`)}`} 
                  alt="QR Code" 
                  style={{margin: '20px 0', borderRadius: '8px'}}
                />
                <button onClick={() => {
                  setShowModal(false);
                  setNewlyCreatedTicket(null);
                  setFormData({make: '', model: '', color: '', plate: '', spot: '', phone: ''});
                }} style={styles.submitButton}>Close & Return to Queue</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ------------------------------------------------------------------
// 4. MAIN ROUTER & AUTH LISTENER
// ------------------------------------------------------------------
function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Read URL for guest ticket
  const searchParams = new URLSearchParams(window.location.search);
  const requestedTicketId = searchParams.get('ticket');

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // 1. If there's a ticket ID in the URL, show the Guest View immediately (no login required)
  if (requestedTicketId) {
    return <GuestTicketView ticketId={requestedTicketId} />;
  }

  // 2. If checking auth status, show a loader
  if (authLoading) {
    return <div style={styles.container}>Verifying staff credentials...</div>;
  }

  // 3. If no user is logged in, show Login screen
  if (!user) {
    return <LoginView />;
  }

  // 4. If logged in, show the Dashboard
  return <ValetDashboardView />;
}

// Shared Styles
const styles = {
  container: { display: 'flex', flexDirection: 'column', backgroundColor: '#f3f4f6', minHeight: '100vh', padding: '20px', fontFamily: 'system-ui, sans-serif' },
  card: { backgroundColor: 'white', padding: '2rem', borderRadius: '16px', boxShadow: '0 10px 25px rgba(0,0,0,0.05)', width: '100%', maxWidth: '400px', textAlign: 'center', margin: 'auto' },
  title: { margin: '0 0 24px 0', color: '#111827' },
  carName: { margin: '0 0 4px 0', fontSize: '1.5rem', fontWeight: '700' },
  carDetails: { margin: '0 0 12px 0', color: '#4b5563' },
  statusBox: { backgroundColor: '#f9fafb', padding: '16px', borderRadius: '12px', marginBottom: '32px', border: '1px solid #e5e7eb' },
  statusLabel: { margin: '0 0 4px 0', fontSize: '0.875rem', color: '#6b7280' },
  statusValue: { margin: 0, fontSize: '1.5rem', fontWeight: '800', letterSpacing: '1px' },
  spotText: { margin: '8px 0 0 0', fontSize: '0.875rem', fontWeight: '600' },
  button: { width: '100%', padding: '16px', color: 'white', border: 'none', borderRadius: '8px', fontSize: '1.125rem', fontWeight: '600', transition: 'background-color 0.2s' },
  
  dashboard: { maxWidth: '1000px', margin: '0 auto', width: '100%' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' },
  newButton: { backgroundColor: '#000', color: '#fff', padding: '10px 20px', borderRadius: '8px', border: 'none', fontWeight: '600', cursor: 'pointer' },
  logoutButton: { backgroundColor: '#e5e7eb', color: '#374151', padding: '6px 12px', borderRadius: '6px', border: 'none', fontWeight: '600', cursor: 'pointer', fontSize: '0.875rem' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px' },
  column: { backgroundColor: 'white', padding: '20px', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' },
  columnTitle: { margin: '0 0 16px 0', fontSize: '1.25rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '12px' },
  spotHighlight: { backgroundColor: '#fee2e2', color: '#991b1b', padding: '8px', borderRadius: '6px', fontWeight: '600', marginBottom: '12px', fontSize: '0.875rem' },
  actionButton: { width: '100%', padding: '12px', backgroundColor: '#dc2626', color: 'white', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' },
  
  modalOverlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', justifyContent: 'center', alignItems: 'center' },
  modalContent: { backgroundColor: '#fff', padding: '30px', borderRadius: '12px', width: '90%', maxWidth: '400px' },
  input: { width: '100%', padding: '12px', marginBottom: '12px', borderRadius: '6px', border: '1px solid #d1d5db', boxSizing: 'border-box' },
  submitButton: { width: '100%', padding: '12px', backgroundColor: '#000', color: '#fff', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' },
  cancelButton: { flex: 1, padding: '12px', backgroundColor: '#e5e7eb', color: '#374151', border: 'none', borderRadius: '6px', fontWeight: '600', cursor: 'pointer' }
};

export default App;