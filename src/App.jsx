import { useState, useEffect, useRef } from 'react';
import { db, auth } from './firebase';
import { ref, onValue, update, set, get } from 'firebase/database';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, getAuth, createUserWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth';
import { initializeApp, getApps } from 'firebase/app';

// ------------------------------------------------------------------
// INJECTED CSS FOR VIBRANT, ENERGETIC APP UI & SHADOWS
// ------------------------------------------------------------------
const vibrantStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800&display=swap');

  :root {
    --bg-color: #f4f7f6;
    --card-bg: #ffffff;
    --card-border: #e2e8f0;
    --text-main: #0f172a;
    --text-muted: #64748b;
    
    --accent-green: #10b981;
    --accent-green-hover: #059669;
    --accent-blue: #0ea5e9;
    --accent-blue-hover: #0284c7;
    --danger-red: #ef4444;
    --warning-yellow: #f59e0b;
    --draft-purple: #8b5cf6;
    --dev-black: #0f172a;
    
    --font-ui: 'Outfit', sans-serif;
    
    --shadow-sm: 0 2px 4px rgba(0,0,0,0.05);
    --shadow-md: 0 4px 12px rgba(0,0,0,0.08);
    --shadow-lg: 0 12px 32px rgba(0,0,0,0.12);
    --shadow-btn: 0 4px 14px rgba(16, 185, 129, 0.3);
    --shadow-btn-blue: 0 4px 14px rgba(14, 165, 233, 0.3);
  }

  body { margin: 0; background-color: var(--bg-color); color: var(--text-main); font-family: var(--font-ui); -webkit-font-smoothing: antialiased; overflow-x: hidden; }
  .app-container { min-height: 100vh; display: flex; flex-direction: column; padding: 24px; box-sizing: border-box; }
  .center-wrapper { display: flex; justify-content: center; align-items: center; min-height: calc(100vh - 48px); }
  .dashboard-wrapper { max-width: 1400px; margin: 0 auto; width: 100%; animation: fadeIn 0.4s ease-out; }

  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
  @keyframes scanLaser { 0% { top: 0; } 50% { top: 100%; } 100% { top: 0; } }
  
  .animate-slide-up { animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
  .animate-scale-in { animation: scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }

  .vibrant-card { background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 20px; padding: 32px; width: 100%; max-width: 420px; box-shadow: var(--shadow-lg); text-align: center; position: relative; overflow: hidden; }
  
  .heading-brand { color: var(--text-main); font-size: 2rem; font-weight: 800; margin: 0 0 8px 0; letter-spacing: -0.5px; }
  .heading-dashboard { color: var(--text-main); font-size: 2.25rem; margin: 0; font-weight: 700; letter-spacing: -1px; }

  .btn-green { background: var(--accent-green); color: #fff; border: none; padding: 16px 24px; border-radius: 12px; font-size: 1.1rem; font-weight: 700; width: 100%; cursor: pointer; transition: all 0.2s; box-shadow: var(--shadow-btn); display: flex; justify-content: center; align-items: center; gap: 8px;}
  .btn-green:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4); background: var(--accent-green-hover); }
  .btn-green:disabled { background: #cbd5e1; color: #64748b; box-shadow: none; cursor: not-allowed; }
  
  .btn-blue { background: var(--accent-blue); color: #fff; border: none; padding: 16px 24px; border-radius: 12px; font-size: 1.1rem; font-weight: 700; width: 100%; cursor: pointer; transition: all 0.2s; box-shadow: var(--shadow-btn-blue); display: flex; justify-content: center; align-items: center; gap: 8px;}
  .btn-blue:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(14, 165, 233, 0.4); background: var(--accent-blue-hover); }

  .btn-purple { background: var(--draft-purple); color: #fff; border: none; padding: 16px 24px; border-radius: 12px; font-size: 1.1rem; font-weight: 700; width: 100%; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 14px rgba(139, 92, 246, 0.3); }
  .btn-purple:hover { transform: translateY(-2px); filter: brightness(1.1); }
  
  .btn-dev { background: var(--dev-black); color: #fff; border: none; padding: 16px 24px; border-radius: 12px; font-size: 1.1rem; font-weight: 700; width: 100%; cursor: pointer; transition: all 0.2s; box-shadow: var(--shadow-md); }
  .btn-dev:hover { transform: translateY(-2px); filter: brightness(1.2); }

  .btn-action { background: #fee2e2; color: var(--danger-red); border: none; padding: 12px; border-radius: 12px; font-weight: 700; cursor: pointer; transition: all 0.2s; box-shadow: var(--shadow-sm); }
  .btn-action:hover { background: var(--danger-red); color: white; transform: translateY(-1px); box-shadow: var(--shadow-md); }

  .btn-outline { background: #fff; color: var(--text-main); border: 2px solid var(--card-border); padding: 12px 20px; border-radius: 12px; font-weight: 700; cursor: pointer; transition: all 0.2s ease; box-shadow: var(--shadow-sm); }
  .btn-outline:hover { background: #f8fafc; border-color: #cbd5e1; box-shadow: var(--shadow-md); transform: translateY(-1px); }
  
  .btn-apple-pay { background: #000; color: #fff; border: none; padding: 14px; border-radius: 8px; width: 100%; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; box-shadow: var(--shadow-md); }
  .btn-apple-pay:hover { background: #222; transform: translateY(-2px); }
  .btn-google-pay { background: #fff; color: #3c4043; border: 1px solid #dadce0; padding: 14px; border-radius: 8px; width: 100%; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; box-shadow: var(--shadow-md); }
  .btn-google-pay:hover { background: #f8f9fa; transform: translateY(-2px); }

  .vibrant-input { background: #f8fafc; border: 2px solid var(--card-border); color: var(--text-main); padding: 16px; width: 100%; border-radius: 12px; box-sizing: border-box; font-family: var(--font-ui); font-size: 1rem; font-weight: 500; transition: all 0.2s ease; box-shadow: inset 0 2px 4px rgba(0,0,0,0.02); }
  .vibrant-input:focus { outline: none; border-color: var(--accent-green); background: #fff; box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1); }
  .vibrant-input.dev-focus:focus { border-color: var(--dev-black); box-shadow: 0 0 0 4px rgba(15, 23, 42, 0.1); }
  
  .autocomplete-container { position: relative; width: 100%; margin-bottom: 16px; }
  .autocomplete-dropdown { position: absolute; top: calc(100% + 8px); left: 0; right: 0; background: #fff; border: 2px solid var(--accent-green); border-radius: 12px; max-height: 220px; overflow-y: auto; z-index: 9999; box-shadow: var(--shadow-lg); list-style: none; padding: 8px; margin: 0; text-align: left; }
  .autocomplete-item { padding: 12px 16px; cursor: pointer; color: var(--text-main); border-radius: 8px; font-weight: 500; }
  .autocomplete-item:hover { background: rgba(16, 185, 129, 0.1); color: var(--accent-green); }

  .parking-map { display: grid; grid-template-columns: repeat(auto-fill, minmax(70px, 1fr)); gap: 12px; margin-top: 16px; max-height: 50vh; overflow-y: auto; padding-right: 8px; }
  .spot-box { padding: 16px 4px; border-radius: 10px; text-align: center; font-size: 0.85rem; font-weight: 700; border: 2px solid var(--card-border); transition: all 0.2s; box-sizing: border-box; box-shadow: var(--shadow-sm); }
  .spot-empty { background: #ecfdf5; color: var(--accent-green); border-color: #a7f3d0; cursor: pointer; }
  .spot-empty:hover { background: var(--accent-green); color: #fff; transform: scale(1.05); border-color: var(--accent-green); box-shadow: var(--shadow-md); }
  .spot-occupied { background: #fef2f2; color: var(--danger-red); border-color: #fecaca; cursor: not-allowed; opacity: 0.7; }
  .zone-title { width: 100%; grid-column: 1 / -1; margin: 16px 0 8px 0; color: var(--text-main); font-weight: 800; font-size: 1.25rem; padding-bottom: 8px; border-bottom: 2px solid var(--card-border);}

  .editor-card { background: #fff; border: 1px solid var(--card-border); padding: 24px; border-radius: 16px; margin-bottom: 24px; box-shadow: var(--shadow-md); }
  .spot-edit-input { background: #f8fafc; color: var(--text-main); border: 2px dashed #cbd5e1; text-align: center; border-radius: 10px; padding: 16px 4px; font-size: 0.85rem; font-weight: 700; width: 100%; box-sizing: border-box; font-family: var(--font-ui); transition: all 0.2s;}
  .spot-edit-input:focus { outline: none; background: #fff; border-style: solid; border-color: var(--accent-green); box-shadow: var(--shadow-sm); }
  .spot-delete-btn { position: absolute; top: -6px; right: -6px; background: var(--danger-red); color: white; border: none; border-radius: 50%; width: 24px; height: 24px; font-size: 12px; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; z-index: 10; box-shadow: var(--shadow-md); transition: transform 0.2s; opacity: 0;}
  div[style*="position: relative"]:hover .spot-delete-btn { opacity: 1; }
  .spot-delete-btn:hover { transform: scale(1.15); background: #b91c1c; }
  .spot-add-btn { background: #f1f5f9; color: var(--text-muted); border: 2px dashed #cbd5e1; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; border-radius: 10px; min-height: 52px; transition: all 0.2s; box-sizing: border-box;}
  .spot-add-btn:hover { background: #e2e8f0; color: var(--text-main); border-style: solid; box-shadow: var(--shadow-sm);}
  
  .dashboard-grid { display: grid; grid-template-columns: 1fr; gap: 24px; margin-top: 32px; align-items: start; }
  @media (min-width: 1024px) { .dashboard-grid { grid-template-columns: 1fr 1fr 1fr 1fr; } }
  
  .queue-title { font-size: 1.35rem; margin: 0 0 20px 0; font-weight: 800; color: var(--text-main); }
  
  .ticket-card { background: #fff; border: 1px solid var(--card-border); padding: 20px; border-radius: 16px; margin-bottom: 16px; display: flex; flex-direction: column; gap: 12px; transition: all 0.2s ease; box-shadow: var(--shadow-md); position: relative; }
  .ticket-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-lg); }
  .edit-icon-btn { position: absolute; top: 16px; right: 16px; background: transparent; border: none; cursor: pointer; color: var(--text-muted); padding: 4px; border-radius: 4px; transition: all 0.2s; }
  .edit-icon-btn:hover { background: #f1f5f9; color: var(--accent-green); }

  .status-badge { display: inline-block; padding: 6px 12px; border-radius: 20px; font-size: 0.85rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; width: fit-content; box-shadow: var(--shadow-sm); }
  .status-draft { background: #f3e8ff; color: var(--draft-purple); border: 1px solid #d8b4fe; }
  .status-parked { background: #f1f5f9; color: #475569; border: 1px solid #e2e8f0; }
  .status-requested { background: #fef2f2; color: var(--danger-red); border: 1px solid #fecaca; }
  .status-incoming { background: #fffbeb; color: var(--warning-yellow); border: 1px solid #fde68a; }
  .status-ready { background: #ecfdf5; color: var(--accent-green); border: 1px solid #a7f3d0; }
  
  .wash-queued { background: #fffbeb; color: var(--warning-yellow); border: 1px solid #fde68a; }
  .wash-washing { background: #e0f2fe; color: var(--accent-blue); border: 1px solid #bae6fd; }
  .wash-completed { background: #ecfdf5; color: var(--accent-green); border: 1px solid #a7f3d0; }

  .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(8px); display: flex; justify-content: center; align-items: center; z-index: 1000; padding: 20px; animation: fadeIn 0.2s ease-out; overflow-y: auto;}
  
  .luxury-table { width: 100%; border-collapse: collapse; text-align: left; font-size: 0.95rem; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: var(--shadow-md); }
  .luxury-table th { padding: 16px; border-bottom: 2px solid var(--card-border); color: var(--text-muted); font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; font-size: 0.85rem; background: #f8fafc;}
  .luxury-table td { padding: 20px 16px; border-bottom: 1px solid var(--card-border); }
  
  .metric-card { background: #fff; border: 1px solid var(--card-border); border-radius: 16px; padding: 24px; box-shadow: var(--shadow-md); text-align: left; }
  .metric-value { font-size: 2.5rem; font-weight: 800; margin: 8px 0; color: var(--text-main); }
  
  .settings-row { display: flex; justify-content: space-between; align-items: center; padding: 16px 0; border-bottom: 1px solid var(--card-border); }
  .toggle-switch { position: relative; width: 50px; height: 26px; }
  .toggle-switch input { opacity: 0; width: 0; height: 0; }
  .toggle-slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #cbd5e1; transition: .4s; border-radius: 34px; box-shadow: inset 0 2px 4px rgba(0,0,0,0.1); }
  .toggle-slider:before { position: absolute; content: ""; height: 18px; width: 18px; left: 4px; bottom: 4px; background-color: white; transition: .4s; border-radius: 50%; box-shadow: var(--shadow-sm); }
  input:checked + .toggle-slider { background-color: var(--accent-green); }
  input:checked + .toggle-slider:before { transform: translateX(24px); }
`;

const CAR_DATABASE = {
  "Abarth": ["595", "695"], "Acura": ["MDX", "RDX"], "Alfa Romeo": ["Giulia", "Stelvio"],
  "Audi": ["A3", "A4", "Q5", "Q7", "e-tron"], "Bentley": ["Bentayga", "Continental GT"], 
  "BMW": ["3-Series", "5-Series", "X5", "X7", "M Models"], "Bugatti": ["Chiron"], 
  "Cadillac": ["Escalade"], "Chevrolet": ["Tahoe", "Corvette"], "Ferrari": ["F8", "Roma", "Purosangue"], 
  "Ford": ["Mustang", "F-150"], "Honda": ["Accord", "Civic"], "Hyundai": ["Tucson", "Ioniq 5"],
  "Jeep": ["Wrangler", "Grand Cherokee"], "Kia": ["Telluride", "Sportage"], "Lamborghini": ["Urus", "Huracan"],
  "Land Rover": ["Range Rover", "Defender"], "Lexus": ["RX", "LX"], "Maserati": ["Levante", "Grecale"], 
  "McLaren": ["720S", "Artura"], "Mercedes-Benz": ["C-Class", "S-Class", "G-Class", "GLE"],
  "Nissan": ["Patrol", "Altima"], "Porsche": ["911", "Macan", "Cayenne"], "Rolls-Royce": ["Cullinan", "Ghost"], 
  "Tesla": ["Model 3", "Model Y"], "Toyota": ["Land Cruiser", "Camry", "RAV4"], "Volvo": ["XC60", "XC90"]
};

const COUNTRY_CODES = [
  { label: "🇦🇪 UAE (+971)", value: "+971" }, { label: "🇮🇱 Israel (+972)", value: "+972" }, { label: "🇺🇸 USA/Canada (+1)", value: "+1" }, { label: "🇬🇧 UK (+44)", value: "+44" },
];

const DEFAULT_PARKING_MAP = [
  { zone: 'VIP Front', spots: Array.from({length: 12}, (_, i) => `VIP-${i + 1}`) },
  { zone: 'Zone A', spots: Array.from({length: 30}, (_, i) => `A-${i + 1}`) }
];

const DEFAULT_VENUE_SETTINGS = {
  tier: 2, 
  carWashEnabled: true,
  carWashPrice: 25,
  returnLocations: ["Main Entrance", "Sky Address View", "Nearby Restaurant"]
};

const getZonePrefix = (zoneName) => {
  const trimmed = zoneName.trim();
  if (/^Zone\s+[A-Z0-9]+$/i.test(trimmed)) return trimmed.split(/\s+/)[1].toUpperCase();
  const firstWord = trimmed.split(/\s+/)[0];
  if (firstWord === firstWord.toUpperCase() && firstWord.length > 1) return firstWord;
  return firstWord.charAt(0).toUpperCase();
};

function CustomConfirmWidget({ isOpen, title, message, onConfirm, onCancel, confirmText = "Confirm", isDanger = true }) {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay" style={{ zIndex: 1100 }}>
      <div className="vibrant-card animate-scale-in" style={{ maxWidth: '400px', padding: '32px' }}>
        <h3 style={{ color: isDanger ? 'var(--danger-red)' : 'var(--accent-green)', marginTop: 0, fontWeight: 800, fontSize: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{title}</h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: '32px', lineHeight: '1.6', fontSize: '1rem', fontWeight: 500 }}>{message}</p>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={onConfirm} className={isDanger ? "btn-action" : "btn-green"} style={{ flex: 1, border: 'none', color: 'white', background: isDanger ? 'var(--danger-red)' : 'var(--accent-green)' }}>{confirmText}</button>
          <button onClick={onCancel} className="btn-outline" style={{ flex: 1 }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

function CustomPromptWidget({ isOpen, title, message, expectedValue, onMatch, onCancel }) {
  const [val, setVal] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => { setVal(''); setErrorMsg(''); }, [isOpen]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (val.trim().toUpperCase() === expectedValue.toUpperCase()) { onMatch(); } 
    else { setErrorMsg('Incorrect License Plate. Do not hand over keys.'); }
  };

  if (!isOpen) return null;
  return (
    <div className="modal-overlay" style={{ zIndex: 1100 }}>
      <div className="vibrant-card animate-scale-in" style={{ maxWidth: '400px', padding: '32px' }}>
        <h3 style={{ color: 'var(--accent-green)', marginTop: 0, fontWeight: 800, fontSize: '1.5rem', textTransform: 'uppercase' }}>{title}</h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: '24px', lineHeight: '1.6', fontSize: '1rem', fontWeight: 500 }}>{message}</p>
        {errorMsg && <div style={{background: '#fef2f2', color: 'var(--danger-red)', padding: '12px', borderRadius: '8px', marginBottom: '16px', fontWeight: 700, border: '1px solid #fecaca'}}>{errorMsg}</div>}
        <form onSubmit={handleSubmit}>
          <input type="text" placeholder="Type License Plate" className="vibrant-input" style={{marginBottom: '24px', textTransform: 'uppercase', textAlign: 'center', fontSize: '1.2rem', fontWeight: 700}} value={val} onChange={(e) => {setVal(e.target.value); setErrorMsg('');}} autoFocus />
          <div style={{ display: 'flex', gap: '12px' }}>
            <button type="submit" className="btn-green" style={{ flex: 2 }}>Verify Handover</button>
            <button type="button" onClick={onCancel} className="btn-outline" style={{ flex: 1 }}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  );
}

const ApplePayLogo = () => (
  <span style={{fontSize: '1.3rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', color: 'white'}}> Pay</span>
);

const GooglePayLogo = () => (
  <span style={{fontSize: '1.2rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px', color: '#3c4043'}}>
    <svg width="22" height="22" viewBox="0 0 48 48">
      <path fill="#4285F4" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#EA4335" d="M39.89 42.19c4.22-3.83 6.64-9.52 6.64-16.19 0-1.25-.13-2.47-.35-3.64H24v9.06h12.59c-.58 3.01-2.27 5.56-4.7 7.28l7.73 6.01h.27z"/>
    </svg> 
    Pay
  </span>
);

function Autocomplete({ options, value, onChange, placeholder, style, isObject }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (isObject) { const match = options.find(o => o.value === value); setSearchTerm(match ? match.label : value); } 
    else { setSearchTerm(value); }
  }, [value, options, isObject]);

  useEffect(() => {
    function handleClickOutside(event) { if (wrapperRef.current && !wrapperRef.current.contains(event.target)) setIsOpen(false); }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="autocomplete-container" ref={wrapperRef} style={style}>
      <input type="text" className="vibrant-input" style={{ marginBottom: 0 }} placeholder={placeholder} value={searchTerm}
        onChange={(e) => { setSearchTerm(e.target.value); setIsOpen(true); if (!isObject) onChange(e.target.value); }}
        onFocus={() => setIsOpen(true)} required autoComplete="off" />
      {isOpen && (
        <ul className="autocomplete-dropdown">
          {options.filter(opt => (isObject ? opt.label : opt).toLowerCase().includes(searchTerm.toLowerCase())).map((opt, i) => (
            <li key={i} className="autocomplete-item" onClick={() => { setSearchTerm(isObject ? opt.label : opt); onChange(isObject ? opt.value : opt); setIsOpen(false); }}>
              {isObject ? opt.label : opt}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ------------------------------------------------------------------
// LOG ARRIVAL MODAL (Edit / Create)
// ------------------------------------------------------------------
function LogArrivalModal({ onClose, venueId, parkingMap, occupiedSpots, knownPlates, editingTicket = null }) {
  const [newlyCreatedTicket, setNewlyCreatedTicket] = useState(null);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [formData, setFormData] = useState({ make: '', model: '', color: '', plate: '', spot: '', countryCode: '+971', phone: '' });

  useEffect(() => {
    if (editingTicket && editingTicket.vehicle) {
      const phoneParts = (editingTicket.guestPhone || "").split(' ');
      setFormData({
        make: editingTicket.vehicle.make || '', model: editingTicket.vehicle.model || '',
        color: editingTicket.vehicle.color || '', plate: editingTicket.vehicle.licensePlate || '',
        spot: editingTicket.parkingSpot || '', countryCode: phoneParts[0] || '+971', phone: phoneParts[1] || ''
      });
    }
  }, [editingTicket]);

  const currentDomain = window.location.origin;
  const availableMakes = Object.keys(CAR_DATABASE);
  const availableModels = CAR_DATABASE[formData.make] || [];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.plate || !formData.make || !formData.color || !formData.spot || !formData.phone) {
      setErrorMsg('⚠️ Please fill in all details and select a parking spot.');
      return;
    }

    const fullPhone = `${formData.countryCode} ${formData.phone}`.trim();
    
    if (editingTicket) {
      await update(ref(db, `tickets/${editingTicket.id}`), {
        guestPhone: fullPhone,
        vehicle: { make: formData.make, model: formData.model, color: formData.color, licensePlate: formData.plate.toUpperCase() },
        parkingSpot: formData.spot,
        status: editingTicket.status === "draft" ? "parked" : editingTicket.status, 
        "timestamps/parkedAt": editingTicket.status === "draft" ? Date.now() : (editingTicket.timestamps?.parkedAt || Date.now())
      });
      onClose();
    } else {
      const ticketId = `ticket_${Date.now()}`;
      await set(ref(db, `tickets/${ticketId}`), {
        venueId: venueId, guestPhone: fullPhone,
        vehicle: { make: formData.make, model: formData.model, color: formData.color, licensePlate: formData.plate.toUpperCase() },
        parkingSpot: formData.spot, status: "parked", parkedByUserId: auth.currentUser.uid,
        timestamps: { parkedAt: Date.now(), requestedAt: null, retrievedAt: null }
      });
      setNewlyCreatedTicket(ticketId);
    }
  };

  const handlePlateBlur = (e) => {
    if(editingTicket && editingTicket.id !== 'new') return; 
    const plate = e.target.value.toUpperCase();
    if (knownPlates && knownPlates[plate]) {
      const past = knownPlates[plate];
      const phoneParts = (past.guestPhone || "").split(' ');
      setFormData({
        ...formData, plate: plate, make: past.vehicle?.make || '', model: past.vehicle?.model || '',
        color: past.vehicle?.color || '', countryCode: phoneParts[0] || '+971', phone: phoneParts[1] || ''
      });
    }
  };

  return (
    <div className="modal-overlay">
      <div className="vibrant-card animate-scale-in" style={{width: '90%', maxWidth: isMapOpen ? '850px' : '460px', padding: '40px', maxHeight: '90vh', overflowY: 'auto', transition: 'max-width 0.4s cubic-bezier(0.16, 1, 0.3, 1)'}}>
        
        {newlyCreatedTicket ? (
          <div className="animate-slide-up">
            <h2 className="heading-brand" style={{color: 'var(--accent-green)'}}>TICKET ACTIVE</h2>
            <div style={{background: '#fff', padding: '16px', borderRadius: '12px', display: 'inline-block', margin: '24px 0', border: '2px solid var(--card-border)', boxShadow: 'var(--shadow-lg)'}}>
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(`${currentDomain}/?ticket=${newlyCreatedTicket}`)}`} alt="QR Code" style={{display: 'block'}} />
            </div>
            <button onClick={onClose} className="btn-outline" style={{width: '100%', padding: '16px'}}>Return to Dashboard</button>
          </div>
        ) : isMapOpen ? (
          <div className="animate-slide-up" style={{textAlign: 'left'}}>
            <h2 className="heading-brand" style={{color: 'var(--text-main)', fontSize: '1.75rem', marginBottom: '8px'}}>SELECT PARKING SPOT</h2>
            <div className="parking-map" style={{maxHeight: '60vh'}}>
              {parkingMap.map((section, idx) => (
                <div key={idx} style={{display: 'contents'}}>
                  <div className="zone-title">{section.zone}</div>
                  {section.spots.map(spot => {
                    const isOccupied = occupiedSpots.includes(spot) && spot !== formData.spot; 
                    return (
                      <div key={spot} className={`spot-box ${isOccupied ? 'spot-occupied' : 'spot-empty'}`}
                        style={formData.spot === spot ? {background: 'var(--accent-green)', color: 'white', borderColor: 'var(--accent-green)'} : {}}
                        onClick={() => { if(!isOccupied) { setFormData({...formData, spot: spot}); setIsMapOpen(false); } }}>
                        {spot}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
            <button onClick={() => setIsMapOpen(false)} className="btn-outline" style={{width: '100%', marginTop: '32px', padding: '16px'}}>Cancel Selection</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="animate-slide-up">
            <h2 className="heading-brand" style={{color: 'var(--text-main)', fontSize: '1.75rem', marginBottom: '24px'}}>
              {editingTicket && editingTicket.id !== 'new' ? 'EDIT DETAILS' : 'LOG ARRIVAL'}
            </h2>
            
            {errorMsg && <div style={{background: '#fef2f2', color: 'var(--danger-red)', padding: '16px', borderRadius: '12px', marginBottom: '24px', fontWeight: 600, border: '2px solid #fecaca', boxShadow: 'var(--shadow-sm)'}}>{errorMsg}</div>}

            <input placeholder="License Plate (Auto-fills if known)" className="vibrant-input" style={{marginBottom: '16px', textTransform: 'uppercase', borderColor: 'var(--warning-yellow)'}} value={formData.plate} onChange={e => setFormData({...formData, plate: e.target.value})} onBlur={handlePlateBlur} autoComplete="off" />

            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
              <Autocomplete options={availableMakes} value={formData.make} onChange={(val) => setFormData({...formData, make: val, model: ''})} placeholder="Search or type Make" isObject={false} />
              <Autocomplete options={availableModels} value={formData.model} onChange={(val) => setFormData({...formData, model: val})} placeholder="Search or type Model" isObject={false} />
            </div>
            
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
              <input placeholder="Color" className="vibrant-input" style={{marginBottom: '16px'}} value={formData.color} onChange={e => setFormData({...formData, color: e.target.value})} autoComplete="off" />
              <input readOnly placeholder="Tap to Select Spot" className="vibrant-input" 
                style={{marginBottom: '16px', textAlign: 'center', color: formData.spot ? 'var(--accent-green)' : 'var(--danger-red)', fontWeight: '700', cursor: 'pointer', border: formData.spot ? '2px solid var(--accent-green)' : '2px dashed var(--danger-red)'}} 
                value={formData.spot || "Spot Missing!"} onClick={() => setIsMapOpen(true)} />
            </div>
            
            <div style={{display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px', alignItems: 'start'}}>
              <Autocomplete options={COUNTRY_CODES} value={formData.countryCode} onChange={(val) => setFormData({...formData, countryCode: val})} placeholder="+ Code" isObject={true} />
              <input type="tel" placeholder="Guest Phone" className="vibrant-input" style={{marginBottom: '24px'}} value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} autoComplete="off" />
            </div>

            <div style={{display: 'flex', gap: '16px'}}>
              <button type="submit" className="btn-green" style={{flex: 2}}>{editingTicket && editingTicket.id !== 'new' ? 'Save Update' : 'Generate Ticket'}</button>
              <button type="button" onClick={onClose} className="btn-outline" style={{flex: 1}}>Cancel</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// GUEST VIEW COMPONENT (PUBLIC TRACKER)
// ------------------------------------------------------------------
function GuestTicketView({ ticketId }) {
  const [ticket, setTicket] = useState(null);
  const [venueSettings, setVenueSettings] = useState(DEFAULT_VENUE_SETTINGS);
  const [loading, setLoading] = useState(true);
  
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showTipModal, setShowTipModal] = useState(false);
  const [requestDetails, setRequestDetails] = useState({ location: 'Main Entrance' });

  const [customTipAmount, setCustomTipAmount] = useState('');
  const [tipStep, setTipStep] = useState(1); 
  const [selectedTip, setSelectedTip] = useState(0);

  useEffect(() => {
    const unsubscribeTicket = onValue(ref(db, `tickets/${ticketId}`), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setTicket(data);
        get(ref(db, `venues/${data.venueId}/settings`)).then(snap => { if (snap.exists()) setVenueSettings(snap.val()); });
        if (data.status === 'retrieved' && !data.tippedAmount && data.wantsWash !== 'processing') setShowTipModal(true);
      }
      setLoading(false);
    });
    return () => unsubscribeTicket();
  }, [ticketId]);

  const handleWashCheckout = async (method) => {
    const transaction = { date: Date.now(), last4: Math.floor(1000 + Math.random() * 9000), status: 'Done', method: method, amount: venueSettings.carWashPrice || 25 };
    await update(ref(db, `tickets/${ticketId}`), { wantsWash: true, washPaid: true, washStatus: 'queued', "timestamps/washRequestedAt": Date.now(), washTransaction: transaction });
    setShowPaymentModal(false);
  };

  const submitVehicleRequest = async () => {
    await update(ref(db, `tickets/${ticketId}`), { status: "requested", returnLocation: requestDetails.location, "timestamps/requestedAt": Date.now() });
    setShowRequestModal(false);
  };

  const proceedToTipPayment = (amount) => {
    setSelectedTip(amount);
    setTipStep(2);
  };

  const submitTip = async (method) => {
    const transaction = { date: Date.now(), last4: Math.floor(1000 + Math.random() * 9000), status: 'Done', method: method, amount: selectedTip };
    await update(ref(db, `tickets/${ticketId}`), { tippedAmount: selectedTip, tipTransaction: transaction });
    setShowTipModal(false);
  };

  if (loading) return <div className="app-container center-wrapper"><div className="animate-pulse" style={{color: 'var(--accent-green)', letterSpacing: '2px', fontWeight: 800}}>LOADING TICKET...</div></div>;
  if (!ticket) return <div className="app-container center-wrapper"><div className="vibrant-card animate-scale-in">Ticket not found or expired.</div></div>;

  const { vehicle, status, parkedByPhone, parkedByName, wantsWash, washStatus } = ticket;

  if (status === 'draft') {
    return (
      <div className="app-container center-wrapper">
        <div className="vibrant-card animate-slide-up">
          <div style={{background: 'var(--draft-purple)', padding: '24px', margin: '-32px -32px 32px -32px', color: 'white'}}>
            <h2 style={{margin: 0, fontSize: '1.5rem', fontWeight: 800}}>SKY VALET</h2>
          </div>
          <h3 style={{fontSize: '1.5rem', fontWeight: 700, marginBottom: '16px'}}>Securing your vehicle...</h3>
          <p style={{color: 'var(--text-muted)', marginBottom: '32px', fontWeight: 500}}>Your valet is currently logging your vehicle details and parking it safely. This screen will update automatically.</p>
          <div style={{display: 'flex', justifyContent: 'center'}}><div style={{width: '40px', height: '40px', border: '4px solid #e2e8f0', borderTopColor: 'var(--draft-purple)', borderRadius: '50%', animation: 'spin 1s linear infinite'}} /></div>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  // Safe fallback to prevent crash on older tickets without timestamps
  const parkedTimeMs = Date.now() - (ticket.timestamps?.parkedAt || Date.now());
  const hoursParked = Math.floor(parkedTimeMs / (1000 * 60 * 60));
  const minsParked = Math.floor((parkedTimeMs % (1000 * 60 * 60)) / (1000 * 60));

  return (
    <div className="app-container center-wrapper">
      <div className="vibrant-card animate-slide-up" style={{padding: '24px'}}>
        <div style={{background: 'var(--accent-green)', padding: '24px', margin: '-24px -24px 24px -24px', color: 'white', boxShadow: 'var(--shadow-sm)'}}>
          <h2 style={{margin: 0, fontSize: '1.5rem', fontWeight: 800}}>SKY VALET</h2>
          <p style={{margin: '4px 0 0 0', opacity: 0.9, fontSize: '0.9rem', fontWeight: 500}}>Digital Parking Pass</p>
        </div>

        <h3 style={{fontSize: '1.75rem', fontWeight: 800, margin: '0 0 4px 0'}}>{vehicle?.make || 'Unknown'} {vehicle?.model || ''}</h3>
        <p style={{color: 'var(--text-muted)', fontSize: '1.1rem', margin: '0 0 24px 0', fontWeight: 600}}>{vehicle?.licensePlate || ''} • {vehicle?.color || ''}</p>

        {/* DUAL TRACKERS */}
        <div style={{display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '32px'}}>
          {wantsWash && (
            <div style={{background: '#f0f9ff', border: '2px solid #bae6fd', borderRadius: '16px', padding: '20px', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'}}>
              <p style={{margin: '0 0 8px 0', fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent-blue)', textTransform: 'uppercase', letterSpacing: '1px'}}>Car Wash Status</p>
              {washStatus === 'queued' && <h4 style={{margin: 0, fontSize: '1.5rem', color: 'var(--warning-yellow)', fontWeight: 800}}>🚗 In Queue</h4>}
              {washStatus === 'washing' && <h4 style={{margin: 0, fontSize: '1.5rem', color: 'var(--accent-blue)', fontWeight: 800}}>🫧 Washing Now...</h4>}
              {washStatus === 'completed' && <h4 style={{margin: 0, fontSize: '1.5rem', color: 'var(--accent-green)', fontWeight: 800}}>✨ Shining & Ready</h4>}
            </div>
          )}

          <div style={{background: '#f8fafc', border: '2px solid #e2e8f0', borderRadius: '16px', padding: '20px', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'}}>
            <p style={{margin: '0 0 8px 0', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px'}}>Valet Status</p>
            {status === 'parked' && <h4 style={{margin: 0, fontSize: '1.5rem', color: '#0f172a', fontWeight: 800}}>Safely Parked</h4>}
            {status === 'requested' && <h4 style={{margin: 0, fontSize: '1.5rem', color: 'var(--danger-red)', fontWeight: 800}}>Preparing Vehicle...</h4>}
            {status === 'incoming' && <h4 style={{margin: 0, fontSize: '1.5rem', color: 'var(--warning-yellow)', fontWeight: 800}}>On the Way!</h4>}
            {status === 'ready' && <h4 style={{margin: 0, fontSize: '1.5rem', color: 'var(--accent-green)', fontWeight: 800}}>Ready at Door!</h4>}
            {status === 'retrieved' && <h4 style={{margin: 0, fontSize: '1.5rem', color: '#0f172a', fontWeight: 800}}>Delivered</h4>}
            {status === 'parked' && <p style={{margin: '8px 0 0 0', fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 600}}>Parked for {hoursParked}h {minsParked}m</p>}
          </div>
        </div>

        {status !== 'retrieved' && (
          <div style={{textAlign: 'left', marginBottom: '32px'}}>
            <p style={{margin: '0 0 8px 0', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)'}}>Your Valet: <span style={{color: 'var(--text-main)'}}>{parkedByName || 'Team Member'}</span></p>
            <div className="contact-bar">
              <a href={`https://wa.me/${parkedByPhone?.replace('+', '')}`} className="btn-contact btn-outline" target="_blank" rel="noreferrer">💬 Chat with Valet</a>
            </div>
          </div>
        )}

        {status === 'parked' && (
          <div className="animate-scale-in">
            {!wantsWash && venueSettings.tier === 2 && venueSettings.carWashEnabled && (
              <button onClick={() => setShowPaymentModal(true)} className="btn-blue" style={{ marginBottom: '16px' }}>
                🫧 Premium Car Wash (${venueSettings.carWashPrice || 25})
              </button>
            )}
            <button onClick={() => setShowRequestModal(true)} className="btn-green">Request My Vehicle</button>
          </div>
        )}
      </div>

      {showRequestModal && (
        <div className="modal-overlay">
          <div className="vibrant-card animate-slide-up">
            <h3 style={{fontSize: '1.5rem', fontWeight: 800, margin: '0 0 24px 0'}}>Confirm Return Details</h3>
            <p style={{textAlign: 'left', fontWeight: 600, marginBottom: '8px'}}>Deliver my car to:</p>
            <select className="vibrant-input" style={{marginBottom: '32px', cursor: 'pointer'}} value={requestDetails.location} onChange={(e) => setRequestDetails({...requestDetails, location: e.target.value})}>
              {venueSettings.returnLocations.map(loc => <option key={loc}>{loc}</option>)}
            </select>
            <div style={{display: 'flex', gap: '12px'}}>
              <button onClick={submitVehicleRequest} className="btn-green" style={{flex: 2}}>Confirm Request</button>
              <button onClick={() => setShowRequestModal(false)} className="btn-outline" style={{flex: 1}}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {showPaymentModal && (
        <div className="modal-overlay">
          <div className="vibrant-card animate-slide-up">
            <h3 style={{fontSize: '1.5rem', fontWeight: 800, margin: '0 0 8px 0'}}>Complete Payment</h3>
            <p style={{color: 'var(--text-muted)', marginBottom: '24px', fontWeight: 500}}>Premium Car Wash Service: <strong>${venueSettings.carWashPrice || 25}.00</strong></p>
            <div style={{display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px'}}>
              <button onClick={() => handleWashCheckout('Apple Pay')} className="btn-apple-pay"><ApplePayLogo/></button>
              <button onClick={() => handleWashCheckout('Google Pay')} className="btn-google-pay"><GooglePayLogo/></button>
            </div>
            <button onClick={() => setShowPaymentModal(false)} className="btn-outline" style={{width: '100%'}}>Cancel</button>
          </div>
        </div>
      )}

      {/* 2-STEP TIP MODAL */}
      {showTipModal && (
        <div className="modal-overlay">
          <div className="vibrant-card animate-slide-up">
            <h3 style={{fontSize: '1.5rem', fontWeight: 800, margin: '0 0 8px 0'}}>Vehicle Delivered</h3>
            
            {tipStep === 1 ? (
              <div className="animate-scale-in">
                <p style={{color: 'var(--text-muted)', marginBottom: '24px', fontWeight: 500}}>If you enjoyed your service, consider leaving a tip for your valet team.</p>
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '16px'}}>
                  <button onClick={() => proceedToTipPayment(2)} className="btn-outline" style={{padding: '12px', fontSize: '1.1rem'}}>$2</button>
                  <button onClick={() => proceedToTipPayment(5)} className="btn-outline" style={{padding: '12px', fontSize: '1.1rem'}}>$5</button>
                  <button onClick={() => proceedToTipPayment(10)} className="btn-outline" style={{padding: '12px', fontSize: '1.1rem'}}>$10</button>
                </div>
                <div style={{display: 'flex', gap: '8px', marginBottom: '24px'}}>
                  <input type="number" placeholder="Custom Tip ($)" className="vibrant-input" style={{marginBottom: 0, width: '100%'}} value={customTipAmount} onChange={(e) => setCustomTipAmount(e.target.value)} autoComplete="off" />
                  <button onClick={() => {if(customTipAmount) proceedToTipPayment(Number(customTipAmount))}} className="btn-green" style={{width: 'auto', padding: '0 24px'}}>Tip</button>
                </div>
                <button onClick={() => setShowTipModal(false)} className="btn-outline" style={{width: '100%', border: 'none', background: 'transparent', boxShadow: 'none', color: 'var(--text-muted)'}}>No Tip / Skip</button>
              </div>
            ) : (
              <div className="animate-slide-up">
                <p style={{color: 'var(--text-muted)', marginBottom: '24px', fontWeight: 500}}>Gratuity Amount: <strong style={{color: 'var(--accent-green)', fontSize: '1.2rem'}}>${selectedTip}.00</strong></p>
                <div style={{display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px'}}>
                  <button onClick={() => submitTip('Apple Pay')} className="btn-apple-pay"><ApplePayLogo/></button>
                  <button onClick={() => submitTip('Google Pay')} className="btn-google-pay"><GooglePayLogo/></button>
                </div>
                <button onClick={() => setTipStep(1)} className="btn-outline" style={{width: '100%'}}>Back</button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ------------------------------------------------------------------
// LOGIN COMPONENT
// ------------------------------------------------------------------
function LoginView() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    try { await signInWithEmailAndPassword(auth, email, password); } 
    catch (err) { setError('Invalid credentials.'); }
  };

  return (
    <div className="app-container center-wrapper">
      <div className="vibrant-card animate-scale-in" style={{ padding: '48px 32px' }}>
        <h2 className="heading-brand" style={{marginBottom: '40px'}}>STAFF PORTAL</h2>
        {error && <p style={{ color: 'var(--danger-red)', fontSize: '0.95rem', marginBottom: '24px', background: '#fef2f2', padding: '12px', borderRadius: '8px', fontWeight: 600, border: '1px solid #fecaca' }}>{error}</p>}
        <form onSubmit={handleLogin}>
          <input type="email" placeholder="Staff Email" required className="vibrant-input" style={{marginBottom: '20px'}} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
          <input type="password" placeholder="Password" required className="vibrant-input" style={{marginBottom: '32px'}} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
          <button type="submit" className="btn-green">Authenticate</button>
        </form>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// SUPER ADMIN DASHBOARD (DEVELOPER SAAS PORTAL)
// ------------------------------------------------------------------
function DeveloperView() {
  const [activeTab, setActiveTab] = useState('venues');
  const [allVenues, setAllVenues] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [allTickets, setAllTickets] = useState([]);
  
  // Account Provisioning State
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState('valet_runner');
  const [newUserVenue, setNewUserVenue] = useState('');
  const [devConfirm, setDevConfirm] = useState({ isOpen: false, title: '', message: '', onConfirm: null, isDanger: true });

  // Venue Creation State
  const [newVenueId, setNewVenueId] = useState('');
  const [newVenueName, setNewVenueName] = useState('');
  const [newVenueTier, setNewVenueTier] = useState(1);

  useEffect(() => {
    const unsubVenues = onValue(ref(db, 'venues'), (snap) => {
      if(snap.exists()) setAllVenues(Object.keys(snap.val()).map(k => ({ id: k, ...snap.val()[k] })));
      else setAllVenues([]);
    });
    const unsubUsers = onValue(ref(db, 'users'), (snap) => {
      if(snap.exists()) setAllUsers(Object.keys(snap.val()).map(k => ({ uid: k, ...snap.val()[k] })));
      else setAllUsers([]);
    });
    const unsubTickets = onValue(ref(db, 'tickets'), (snap) => {
      if(snap.exists()) setAllTickets(Object.keys(snap.val()).map(k => ({ id: k, ...snap.val()[k] })));
      else setAllTickets([]);
    });
    return () => { unsubVenues(); unsubUsers(); unsubTickets(); };
  }, []);

  const handleCreateVenue = async (e) => {
    e.preventDefault();
    await set(ref(db, `venues/${newVenueId}`), {
      name: newVenueName, type: "hotel", isActive: true,
      settings: { tier: newVenueTier, carWashEnabled: newVenueTier === 2, carWashPrice: 25, returnLocations: ["Main Entrance"] }
    });
    setNewVenueId(''); setNewVenueName('');
    alert(`Venue ${newVenueId} Created.`);
  };

  const handleProvisionUser = async (e) => {
    e.preventDefault();
    if (!newUserVenue) { alert("Select a venue."); return; }
    
    try {
      const appOptions = auth.app.options;
      const secondaryApp = getApps().find(app => app.name === "StaffCreator") || initializeApp(appOptions, "StaffCreator");
      const secondaryAuth = getAuth(secondaryApp);
      
      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, newEmail, newPassword);
      const newUid = userCredential.user.uid;
      
      await set(ref(db, `users/${newUid}`), { role: newUserRole, venueId: newUserVenue, email: newEmail });
      await secondaryAuth.signOut();
      
      setNewEmail(''); setNewPassword('');
      alert(`Account Created Successfully!`);
      
    } catch (error) {
      alert("Error creating account: " + error.message);
    }
  };

  const handleResetPassword = async (emailToReset) => {
    if(!emailToReset) return alert("No email saved for this user. Cannot send reset link.");
    try {
      await sendPasswordResetEmail(auth, emailToReset);
      alert(`Password reset link securely sent to ${emailToReset}`);
    } catch(err) {
      alert(err.message);
    }
  };

  const promptToggleTier = (venueId, currentTier) => {
    setDevConfirm({
      isOpen: true,
      title: "Change SaaS Tier",
      message: `Are you sure you want to ${currentTier === 1 ? 'UPGRADE this venue to Premium (Tier 2)?' : 'DOWNGRADE this venue to Standard (Tier 1)?'}`,
      isDanger: currentTier === 2,
      onConfirm: async () => {
        await update(ref(db, `venues/${venueId}/settings`), { tier: currentTier === 1 ? 2 : 1 });
        setDevConfirm({ ...devConfirm, isOpen: false });
      },
      onCancel: () => setDevConfirm({ ...devConfirm, isOpen: false })
    });
  };

  const formatTxDateTime = (timestamp) => {
    if (!timestamp) return { date: '-', time: '-' };
    const d = new Date(timestamp);
    return { date: d.toLocaleDateString([], {month: 'short', day: 'numeric'}), time: d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) };
  };

  return (
    <div className="app-container" style={{backgroundColor: '#0f172a'}}>
      <div className="dashboard-wrapper">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
          <h1 className="heading-dashboard" style={{color: 'white'}}>SaaS Control Room</h1>
          <button onClick={() => signOut(auth)} className="btn-outline" style={{fontSize: '0.85rem', padding: '8px 16px', background: 'transparent', color: 'white', borderColor: 'rgba(255,255,255,0.2)', boxShadow: 'none'}}>Logout</button>
        </div>

        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', overflowX: 'auto', paddingBottom: '8px' }}>
          <button className={activeTab === 'venues' ? 'btn-dev' : 'btn-outline'} style={activeTab !== 'venues' ? {background: 'transparent', color: 'white'} : {background: 'white', color: 'var(--dev-black)'}} onClick={() => setActiveTab('venues')}>Client Venues</button>
          <button className={activeTab === 'users' ? 'btn-dev' : 'btn-outline'} style={activeTab !== 'users' ? {background: 'transparent', color: 'white'} : {background: 'white', color: 'var(--dev-black)'}} onClick={() => setActiveTab('users')}>Staff Creation</button>
          <button className={activeTab === 'finance' ? 'btn-dev' : 'btn-outline'} style={activeTab !== 'finance' ? {background: 'transparent', color: 'white'} : {background: 'white', color: 'var(--dev-black)'}} onClick={() => setActiveTab('finance')}>Global Revenue</button>
        </div>

        <div>
          {activeTab === 'venues' && (
            <div className="animate-slide-up" style={{display: 'grid', gridTemplateColumns: '1fr', gap: '24px'}}>
              <div className="vibrant-card" style={{maxWidth: '100%', textAlign: 'left'}}>
                <h3 style={{marginTop: 0, fontWeight: 800}}>Add New Client Venue</h3>
                <form onSubmit={handleCreateVenue} style={{display: 'flex', gap: '12px', alignItems: 'flex-start'}}>
                  <input placeholder="Venue ID (e.g. venue_002)" required className="vibrant-input dev-focus" value={newVenueId} onChange={e => setNewVenueId(e.target.value.toLowerCase().replace(/\s+/g, '_'))} />
                  <input placeholder="Display Name (e.g. North Platte)" required className="vibrant-input dev-focus" value={newVenueName} onChange={e => setNewVenueName(e.target.value)} />
                  <select className="vibrant-input dev-focus" value={newVenueTier} onChange={e => setNewVenueTier(Number(e.target.value))}>
                    <option value={1}>Tier 1 (Standard)</option>
                    <option value={2}>Tier 2 (Premium Wash)</option>
                  </select>
                  <button type="submit" className="btn-dev" style={{width: 'auto', whiteSpace: 'nowrap'}}>Create Venue</button>
                </form>
              </div>

              <table className="luxury-table">
                <thead><tr><th>Venue ID</th><th>Display Name</th><th>SaaS Tier</th><th>Status</th><th>Action</th></tr></thead>
                <tbody>
                  {allVenues.map(v => (
                    <tr key={v.id}>
                      <td style={{fontWeight: '700', color: 'var(--dev-black)'}}>{v.id}</td>
                      <td style={{fontWeight: '600'}}>{v.name || 'Unnamed Venue'}</td>
                      <td>
                        <span style={{background: v.settings?.tier === 1 ? '#cbd5e1' : 'var(--warning-yellow)', color: v.settings?.tier === 1 ? '#475569' : '#fff', padding: '4px 12px', borderRadius: '6px', fontWeight: 800, fontSize: '0.8rem'}}>
                          Tier {v.settings?.tier || 1}
                        </span>
                      </td>
                      <td style={{color: 'var(--accent-green)', fontWeight: 700}}>Active</td>
                      <td><button onClick={() => promptToggleTier(v.id, v.settings?.tier || 1)} className="btn-outline" style={{padding: '6px 12px', fontSize: '0.8rem'}}>Change Tier</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="animate-slide-up" style={{display: 'grid', gridTemplateColumns: '1fr', gap: '24px'}}>
              <div className="vibrant-card" style={{maxWidth: '100%', textAlign: 'left'}}>
                <h3 style={{marginTop: 0, fontWeight: 800}}>Create Staff Account</h3>
                <p style={{color: 'var(--text-muted)', marginBottom: '16px', fontWeight: 500}}>Generate logins for hotel managers and valets here. They cannot create accounts themselves.</p>
                
                {/* Dummy hidden inputs to block aggressive Chrome Autocomplete */}
                <input type="email" style={{display: 'none'}} />
                <input type="password" style={{display: 'none'}} />
                
                <form onSubmit={handleProvisionUser} style={{display: 'flex', gap: '12px', alignItems: 'flex-start', flexWrap: 'wrap'}} autoComplete="off">
                  <input type="email" name="new-staff-email" placeholder="Staff Email" required className="vibrant-input dev-focus" value={newEmail} onChange={e => setNewEmail(e.target.value)} style={{flex: 1, minWidth: '200px'}} autoComplete="off" />
                  <input type="password" name="new-staff-password" placeholder="Password (Min 6 chars)" required className="vibrant-input dev-focus" value={newPassword} onChange={e => setNewPassword(e.target.value)} style={{flex: 1, minWidth: '200px'}} minLength={6} autoComplete="new-password" />
                  
                  <select className="vibrant-input dev-focus" value={newUserRole} onChange={e => setNewUserRole(e.target.value)} style={{flex: 1, minWidth: '200px'}}>
                    <option value="valet_runner">Valet Runner</option>
                    <option value="wash_team">Wash Team</option>
                    <option value="master_admin">Master Admin (Hotel Mgr)</option>
                    <option value="developer">SaaS Developer (Super Admin)</option>
                  </select>
                  
                  <select className="vibrant-input dev-focus" value={newUserVenue} onChange={e => setNewUserVenue(e.target.value)} required style={{flex: 1, minWidth: '200px'}}>
                    <option value="" disabled>Assign to Venue...</option>
                    {allVenues.map(v => <option key={v.id} value={v.id}>{v.name || v.id}</option>)}
                  </select>
                  
                  <button type="submit" className="btn-dev" style={{width: 'auto', whiteSpace: 'nowrap'}}>Create Account</button>
                </form>
              </div>

              {/* Group Users by Venue */}
              {allVenues.map(venue => {
                const venueUsers = allUsers.filter(u => u.venueId === venue.id);
                return (
                  <div key={venue.id} className="vibrant-card" style={{maxWidth: '100%', textAlign: 'left', padding: '0', overflow: 'hidden'}}>
                    <div style={{background: '#f8fafc', padding: '16px 24px', borderBottom: '1px solid var(--card-border)'}}>
                      <h3 style={{margin: 0, fontWeight: 800}}>{venue.name} <span style={{color: 'var(--text-muted)', fontSize: '1rem', fontWeight: 500}}>({venue.id})</span></h3>
                    </div>
                    {venueUsers.length === 0 ? (
                       <p style={{padding: '24px', color: 'var(--text-muted)', margin: 0, textAlign: 'center'}}>No staff accounts active.</p>
                    ) : (
                      <table className="luxury-table" style={{boxShadow: 'none', borderRadius: 0}}>
                        <thead><tr><th>Email / UID</th><th>Assigned Role</th><th>Account Actions</th></tr></thead>
                        <tbody>
                          {venueUsers.map(u => (
                            <tr key={u.uid}>
                              <td>
                                <div style={{fontWeight: '700', color: 'var(--dev-black)'}}>{u.email || 'Unknown Email'}</div>
                                <div style={{fontFamily: 'monospace', color: 'var(--text-muted)', fontSize: '0.8rem'}}>{u.uid}</div>
                              </td>
                              <td style={{fontWeight: '700', textTransform: 'capitalize'}}>{(u.role || 'none').replace('_', ' ')}</td>
                              <td>
                                <button onClick={() => handleResetPassword(u.email)} className="btn-outline" style={{padding: '6px 12px', fontSize: '0.8rem', boxShadow: 'none'}}>Reset Pass</button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === 'finance' && (
            <div className="animate-slide-up" style={{display: 'grid', gridTemplateColumns: '1fr', gap: '24px'}}>
              
              {allVenues.map(venue => {
                const venueTransactions = allTickets.filter(t => t.venueId === venue.id && (t.washTransaction || t.tipTransaction));
                const washRev = venueTransactions.filter(t => t.washTransaction).reduce((acc, t) => acc + (t.washTransaction.amount || 0), 0);
                const tipRev = venueTransactions.filter(t => t.tipTransaction).reduce((acc, t) => acc + (t.tipTransaction.amount || 0), 0);
                
                let ledger = [];
                venueTransactions.forEach(t => {
                  if(t.washTransaction) ledger.push({ type: 'Car Wash', tx: t.washTransaction, vehicle: t.vehicle?.licensePlate || 'Unknown' });
                  if(t.tipTransaction) ledger.push({ type: 'Valet Tip', tx: t.tipTransaction, vehicle: t.vehicle?.licensePlate || 'Unknown' });
                });
                ledger.sort((a, b) => b.tx.date - a.tx.date);

                return (
                  <div key={venue.id} className="vibrant-card" style={{maxWidth: '100%', textAlign: 'left', padding: '0', overflow: 'hidden'}}>
                    <div style={{background: '#f8fafc', padding: '16px 24px', borderBottom: '1px solid var(--card-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                      <h3 style={{margin: 0, fontWeight: 800}}>{venue.name} <span style={{color: 'var(--text-muted)', fontSize: '1rem', fontWeight: 500}}>({venue.id})</span></h3>
                      <div style={{display: 'flex', gap: '24px'}}>
                        <div style={{textAlign: 'right'}}>
                          <div style={{fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase'}}>Wash Rev</div>
                          <div style={{fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-blue)'}}>${washRev.toLocaleString()}</div>
                        </div>
                        <div style={{textAlign: 'right'}}>
                          <div style={{fontSize: '0.8rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase'}}>Total Tips</div>
                          <div style={{fontSize: '1.2rem', fontWeight: 800, color: 'var(--accent-green)'}}>${tipRev.toLocaleString()}</div>
                        </div>
                      </div>
                    </div>
                    
                    {ledger.length === 0 ? (
                       <p style={{padding: '24px', color: 'var(--text-muted)', margin: 0, textAlign: 'center'}}>No transactions processed yet.</p>
                    ) : (
                      <table className="luxury-table" style={{boxShadow: 'none', borderRadius: 0}}>
                        <thead><tr><th>Date & Time</th><th>Service Type</th><th>Plate</th><th>Method</th><th>Card Info</th><th>Amount</th><th>Status</th></tr></thead>
                        <tbody>
                          {ledger.map((row, i) => {
                            const { date, time } = formatTxDateTime(row.tx.date);
                            return (
                              <tr key={i}>
                                <td style={{fontWeight: 500}}>{date} <span style={{color: 'var(--text-muted)'}}>{time}</span></td>
                                <td style={{fontWeight: 700, color: row.type === 'Car Wash' ? 'var(--accent-blue)' : 'var(--accent-green)'}}>{row.type}</td>
                                <td style={{fontWeight: 600}}>{row.vehicle}</td>
                                <td style={{fontWeight: 600}}>{row.tx.method}</td>
                                <td style={{fontFamily: 'monospace', color: 'var(--text-muted)'}}>**** {row.tx.last4}</td>
                                <td style={{fontWeight: 800}}>${row.tx.amount}.00</td>
                                <td><span style={{background: row.tx.status === 'Done' ? '#ecfdf5' : '#fef2f2', color: row.tx.status === 'Done' ? 'var(--accent-green)' : 'var(--danger-red)', padding: '4px 12px', borderRadius: '6px', fontWeight: 700, fontSize: '0.8rem'}}>{row.tx.status}</span></td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      
      <CustomConfirmWidget isOpen={devConfirm.isOpen} title={devConfirm.title} message={devConfirm.message} onConfirm={devConfirm.onConfirm} onCancel={devConfirm.onCancel} isDanger={devConfirm.isDanger} />
    </div>
  );
}

// ------------------------------------------------------------------
// VALET, WASH BAY, & ADMIN VIEWS
// ------------------------------------------------------------------
function WashBayView({ venueId }) {
  const [tickets, setTickets] = useState([]);

  useEffect(() => {
    const unsubscribe = onValue(ref(db, 'tickets'), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const all = Object.keys(data).map(key => ({ id: key, ...data[key] }));
        setTickets(all.filter(t => t.venueId === venueId && t.status !== "retrieved"));
      } else { setTickets([]); }
    });
    return () => unsubscribe();
  }, [venueId]);

  const changeStatus = async (ticketId, field, newStatus) => {
    await update(ref(db, `tickets/${ticketId}`), { [field]: newStatus });
  };

  const washQueued = tickets.filter(t => t.wantsWash && t.washStatus === 'queued');
  const washWashing = tickets.filter(t => t.wantsWash && t.washStatus === 'washing');
  const washCompleted = tickets.filter(t => t.wantsWash && t.washStatus === 'completed' && t.status !== 'requested');

  return (
    <div className="app-container">
      <div className="dashboard-wrapper">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
          <h1 className="heading-dashboard" style={{color: 'var(--accent-blue)'}}>Wash Bay Operations</h1>
          <button onClick={() => signOut(auth)} className="btn-outline" style={{fontSize: '0.85rem', padding: '8px 16px'}}>Logout</button>
        </div>

        <div className="dashboard-grid" style={{gridTemplateColumns: '1fr 1fr 1fr'}}>
          <div className="queue-column">
            <h2 className="queue-title">Wash Queue ({washQueued.length})</h2>
            {washQueued.map(t => (
              <div key={t.id} className="ticket-card animate-slide-up" style={{ borderLeft: '6px solid var(--warning-yellow)' }}>
                <h3 style={{margin: '0 0 4px 0', fontWeight: 800}}>{t.vehicle?.make} <span style={{color: 'var(--text-muted)'}}>{t.vehicle?.licensePlate}</span></h3>
                <p style={{margin: '0 0 12px 0', fontWeight: 700}}>Spot: {t.parkingSpot}</p>
                <button onClick={() => changeStatus(t.id, 'washStatus', 'washing')} className="btn-blue" style={{boxShadow: 'none'}}>Bring to Wash Bay</button>
              </div>
            ))}
          </div>
          <div className="queue-column">
            <h2 className="queue-title">Currently Washing ({washWashing.length})</h2>
            {washWashing.map(t => (
              <div key={t.id} className="ticket-card animate-slide-up" style={{ borderLeft: '6px solid var(--accent-blue)' }}>
                <h3 style={{margin: '0 0 4px 0', fontWeight: 800}}>{t.vehicle?.make} <span style={{color: 'var(--text-muted)'}}>{t.vehicle?.licensePlate}</span></h3>
                <button onClick={() => changeStatus(t.id, 'washStatus', 'completed')} className="btn-green" style={{boxShadow: 'none'}}>Mark Wash Complete</button>
              </div>
            ))}
          </div>
          <div className="queue-column">
            <h2 className="queue-title">Completed ({washCompleted.length})</h2>
            {washCompleted.map(t => (
              <div key={t.id} className="ticket-card animate-slide-up" style={{ borderLeft: '6px solid var(--accent-green)' }}>
                <h3 style={{margin: '0 0 4px 0', fontWeight: 800}}>{t.vehicle?.make} <span style={{color: 'var(--text-muted)'}}>{t.vehicle?.licensePlate}</span></h3>
                <p style={{margin: 0, color: 'var(--accent-green)', fontWeight: 700}}>✨ Cleaned & Ready</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function ValetDashboardView({ parkingMap, venueId }) {
  const [tickets, setTickets] = useState([]);
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [quickQrId, setQuickQrId] = useState(null);
  const [draftToEdit, setDraftToEdit] = useState(null); 
  const [knownPlates, setKnownPlates] = useState({});
  const [promptConfig, setPromptConfig] = useState({ isOpen: false, ticketId: null, expectedPlate: '' });

  const currentDomain = window.location.origin;

  useEffect(() => {
    const unsubscribe = onValue(ref(db, 'tickets'), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const all = Object.keys(data).map(key => ({ id: key, ...data[key] }));
        setTickets(all.filter(t => t.venueId === venueId && t.status !== "retrieved"));
        
        const memory = {};
        all.forEach(t => { 
          if(t.vehicle?.licensePlate && typeof t.vehicle.licensePlate === 'string') {
            memory[t.vehicle.licensePlate.toUpperCase()] = t; 
          }
        });
        setKnownPlates(memory);
      } else { setTickets([]); }
    });
    return () => unsubscribe();
  }, [venueId]);

  const changeStatus = async (ticketId, field, newStatus) => {
    const updates = { [field]: newStatus };
    if (newStatus === 'retrieved') updates["timestamps/retrievedAt"] = Date.now();
    await update(ref(db, `tickets/${ticketId}`), updates);
  };

  const handleQuickDropOff = async () => {
    const ticketId = `ticket_${Date.now()}`;
    await set(ref(db, `tickets/${ticketId}`), {
      venueId: venueId, status: "draft", parkedByUserId: auth.currentUser.uid, parkedByName: "Valet Team", parkedByPhone: "+971501234567",
      vehicle: { make: '', model: '', licensePlate: '', color: '' }, timestamps: { created: Date.now() }
    });
    setQuickQrId(ticketId); 
  };

  const drafts = tickets.filter(t => t.status === "draft");
  const requested = tickets.filter(t => t.status === "requested");
  const incomingReady = tickets.filter(t => t.status === "incoming" || t.status === "ready");
  const parked = tickets.filter(t => t.status === "parked");
  const occupiedSpots = parked.map(t => t.parkingSpot);

  return (
    <div className="app-container">
      <div className="dashboard-wrapper">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <h1 className="heading-dashboard">Dispatcher</h1>
            <button onClick={() => signOut(auth)} className="btn-outline" style={{fontSize: '0.85rem', padding: '8px 16px', boxShadow: 'none'}}>Logout</button>
          </div>
          <div style={{display: 'flex', gap: '12px', flexWrap: 'wrap'}}>
            <button onClick={() => setShowScannerModal(true)} className="btn-outline" style={{width: 'auto', background: 'white'}}>📷 Scan Guest App</button>
            <button onClick={handleQuickDropOff} className="btn-purple" style={{width: 'auto'}}>⚡ Quick QR Drop-Off</button>
          </div>
        </div>

        <div className="dashboard-grid">
          <div className="queue-column">
            <h2 className="queue-title">Needs Info ({drafts.length})</h2>
            {drafts.map((t, i) => (
              <div key={t.id} className="ticket-card" style={{ borderLeft: '6px solid var(--draft-purple)', animationDelay: `${i * 0.05}s` }}>
                <span className="status-badge status-draft">Draft Ticket</span>
                <p style={{margin: '8px 0', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500}}>Guest has QR code. Car needs parking spot and details.</p>
                <button onClick={() => setDraftToEdit(t)} className="btn-outline" style={{borderColor: 'var(--draft-purple)', color: 'var(--draft-purple)', marginTop: '8px', boxShadow: 'none'}}>Complete Details</button>
              </div>
            ))}
          </div>

          <div className="queue-column">
            <h2 className="queue-title">Requested ({requested.length})</h2>
            {requested.map((t, i) => (
              <div key={t.id} className="ticket-card" style={{ borderLeft: '6px solid var(--danger-red)', animationDelay: `${i * 0.05}s` }}>
                <span className="status-badge status-requested">Needs Retrieval</span>
                <h3 style={{margin: '8px 0 0 0', fontWeight: 800}}>{t.vehicle?.make || 'Unknown'} <span style={{color: 'var(--text-muted)'}}>{t.vehicle?.licensePlate || ''}</span></h3>
                <p style={{margin: '4px 0 0 0', fontWeight: 700}}>Spot: {t.parkingSpot}</p>
                {t.wantsWash && (
                  <div style={{marginTop: '8px', padding: '8px', background: '#f0f9ff', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700, border: '1px solid #bae6fd'}}>
                    {t.washStatus === 'queued' && <span style={{color: 'var(--warning-yellow)'}}>🫧 Wash Queued</span>}
                    {t.washStatus === 'washing' && <span style={{color: 'var(--accent-blue)'}}>🫧 Washing In Progress</span>}
                    {t.washStatus === 'completed' && <span style={{color: 'var(--accent-green)'}}>✨ Wash Completed</span>}
                  </div>
                )}
                <div style={{background: '#f8fafc', padding: '12px', borderRadius: '12px', fontSize: '0.9rem', fontWeight: 700, marginTop: '8px', border: '1px solid #e2e8f0'}}>
                  📍 To: {t.returnLocation}
                </div>
                <button onClick={() => changeStatus(t.id, 'status', 'incoming')} className="btn-outline" style={{borderColor: 'var(--warning-yellow)', color: 'var(--warning-yellow)', marginTop: '8px', boxShadow: 'none'}}>Bring Car</button>
              </div>
            ))}
          </div>

          <div className="queue-column">
            <h2 className="queue-title">Transit/Ready ({incomingReady.length})</h2>
            {incomingReady.map((t, i) => (
              <div key={t.id} className="ticket-card" style={{ borderLeft: `6px solid ${t.status === 'ready' ? 'var(--accent-green)' : 'var(--warning-yellow)'}`, animationDelay: `${i * 0.05}s` }}>
                <span className={`status-badge ${t.status === 'ready' ? 'status-ready' : 'status-incoming'}`}>
                  {t.status === 'ready' ? 'Waiting at Door' : 'On The Way'}
                </span>
                <h3 style={{margin: '8px 0 12px 0', fontWeight: 800}}>{t.vehicle?.make || 'Unknown'} <span style={{color: 'var(--text-muted)'}}>{t.vehicle?.licensePlate || ''}</span></h3>
                {t.status === 'incoming' ? (
                  <button onClick={() => changeStatus(t.id, 'status', 'ready')} className="btn-green" style={{boxShadow: 'none'}}>Mark "Ready at Door"</button>
                ) : (
                  <button onClick={() => setPromptConfig({ isOpen: true, ticketId: t.id, expectedPlate: t.vehicle?.licensePlate })} className="btn-outline" style={{borderColor: 'var(--accent-green)', color: 'var(--accent-green)', boxShadow: 'none'}}>
                    Verify Plate & Handover
                  </button>
                )}
              </div>
            ))}
          </div>

          <div className="queue-column">
            <h2 className="queue-title">Parked ({parked.length})</h2>
            {parked.map((t, i) => (
              <div key={t.id} className="ticket-card" style={{ borderLeft: '6px solid #cbd5e1', animationDelay: `${i * 0.05}s` }}>
                <button className="edit-icon-btn" onClick={() => setDraftToEdit(t)}>✏️</button>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                  <h3 style={{margin: 0, fontWeight: 700}}>{t.vehicle?.make || 'Unknown'}</h3>
                  <span className="status-badge status-parked" style={{background: '#f8fafc', border: '1px solid #e2e8f0'}}>{t.parkingSpot}</span>
                </div>
                <p style={{margin: 0, color: 'var(--text-muted)', fontWeight: 600}}>{t.vehicle?.licensePlate || ''}</p>
                {t.wantsWash && (
                  <div style={{marginTop: '4px', padding: '8px', background: '#f0f9ff', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 700, border: '1px solid #bae6fd'}}>
                    {t.washStatus === 'queued' && <span style={{color: 'var(--warning-yellow)'}}>🫧 Wash Queued</span>}
                    {t.washStatus === 'washing' && <span style={{color: 'var(--accent-blue)'}}>🫧 Washing In Progress</span>}
                    {t.washStatus === 'completed' && <span style={{color: 'var(--accent-green)'}}>✨ Wash Completed</span>}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {draftToEdit && <LogArrivalModal onClose={() => setDraftToEdit(null)} venueId={venueId} parkingMap={parkingMap} occupiedSpots={occupiedSpots} knownPlates={knownPlates} editingTicket={draftToEdit} />}

      {quickQrId && (
        <div className="modal-overlay">
          <div className="vibrant-card animate-scale-in">
            <h2 className="heading-brand" style={{color: 'var(--draft-purple)'}}>TICKET READY</h2>
            <p style={{color: 'var(--text-muted)', marginBottom: '24px', fontWeight: 500}}>Guest can scan this now. You can fill out the car details later from the "Needs Info" queue.</p>
            <div style={{background: '#fff', padding: '16px', borderRadius: '12px', display: 'inline-block', margin: '0 0 24px 0', border: '2px solid var(--card-border)', boxShadow: 'var(--shadow-md)'}}>
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(`${currentDomain}/?ticket=${quickQrId}`)}`} alt="QR Code" style={{display: 'block'}} />
            </div>
            <button onClick={() => setQuickQrId(null)} className="btn-outline" style={{width: '100%', padding: '16px'}}>Close & Return</button>
          </div>
        </div>
      )}

      <CustomPromptWidget isOpen={promptConfig.isOpen} title="Verify Handover" message="Type the license plate number of this vehicle to confirm you are handing the keys to the correct guest." expectedValue={promptConfig.expectedPlate || 'N/A'} onMatch={() => { changeStatus(promptConfig.ticketId, 'status', 'retrieved'); setPromptConfig({ ...promptConfig, isOpen: false }); }} onCancel={() => setPromptConfig({ ...promptConfig, isOpen: false })} />

      {showScannerModal && (
        <div className="modal-overlay">
          <div className="vibrant-card animate-scale-in" style={{maxWidth: '400px'}}>
            <h3 style={{marginTop: 0, fontWeight: 800, fontSize: '1.5rem'}}>Scan Guest App</h3>
            <div style={{background: '#000', height: '220px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', marginBottom: '24px', position: 'relative', overflow: 'hidden', boxShadow: 'inset 0 0 20px rgba(0,0,0,0.8)'}}>
              <div style={{position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'var(--accent-green)', boxShadow: '0 0 15px 2px var(--accent-green)', animation: 'scanLaser 2s linear infinite'}}></div>
              <p style={{fontWeight: 600, letterSpacing: '1px'}}>Camera Active...</p>
            </div>
            <p style={{color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '24px', fontWeight: 500}}>Point camera at the guest's Sky Valet App to instantly retrieve their vehicle and membership details.</p>
            <button onClick={() => setShowScannerModal(false)} className="btn-outline" style={{width: '100%', padding: '16px'}}>Close Scanner</button>
          </div>
        </div>
      )}
    </div>
  );
}

function MasterAdminView({ parkingMap, venueId }) {
  const [history, setHistory] = useState([]);
  const [parkedCars, setParkedCars] = useState([]);
  const [activeTab, setActiveTab] = useState('operations');
  const [draftToEdit, setDraftToEdit] = useState(null);
  const [editingMap, setEditingMap] = useState([]);
  const [qrModalTicket, setQrModalTicket] = useState(null);
  const [knownPlates, setKnownPlates] = useState({});
  const [confirmConfig, setConfirmConfig] = useState({ isOpen: false, title: '', message: '', onConfirm: null, isDanger: true });
  
  const [venueSettings, setVenueSettings] = useState(DEFAULT_VENUE_SETTINGS);
  const [newLocationInput, setNewLocationInput] = useState('');

  const currentDomain = window.location.origin;

  useEffect(() => { setEditingMap(JSON.parse(JSON.stringify(parkingMap || []))); }, [parkingMap]);

  useEffect(() => {
    const unsubscribeTickets = onValue(ref(db, 'tickets'), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const allTickets = Object.keys(data).map(key => ({ id: key, ...data[key] })).filter(t => t.venueId === venueId);
        
        // Bulletproof timestamp sorting to prevent crashes on old data
        setParkedCars(allTickets.filter(t => t.status !== "retrieved").sort((a, b) => (b.timestamps?.parkedAt || 0) - (a.timestamps?.parkedAt || 0)));
        setHistory(allTickets.filter(t => t.status === "retrieved").sort((a, b) => (b.timestamps?.retrievedAt || 0) - (a.timestamps?.retrievedAt || 0)));
        
        const memory = {};
        allTickets.forEach(t => { 
          if(t.vehicle?.licensePlate && typeof t.vehicle.licensePlate === 'string') {
            memory[t.vehicle.licensePlate.toUpperCase()] = t; 
          }
        });
        setKnownPlates(memory);
      }
    });

    const unsubscribeSettings = onValue(ref(db, `venues/${venueId}/settings`), (snapshot) => {
      if (snapshot.exists()) setVenueSettings(snapshot.val());
      else { set(ref(db, `venues/${venueId}/settings`), DEFAULT_VENUE_SETTINGS); setVenueSettings(DEFAULT_VENUE_SETTINGS); }
    });

    return () => { unsubscribeTickets(); unsubscribeSettings(); };
  }, [venueId]);

  const formatDateTime = (timestamp) => {
    if (!timestamp) return { date: '-', time: '-' };
    const dateObj = new Date(timestamp);
    return { date: dateObj.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }), time: dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
  };

  const occupiedSpots = parkedCars.map(t => t.parkingSpot);

  const handleSaveMap = async () => {
    setConfirmConfig({
      isOpen: true, title: "Save Floor Plan", message: "Push these changes to the live database?", isDanger: false,
      onConfirm: async () => { await set(ref(db, `venues/${venueId}/parkingMap`), editingMap); setConfirmConfig({ ...confirmConfig, isOpen: false }); },
      onCancel: () => setConfirmConfig({ ...confirmConfig, isOpen: false })
    });
  };

  const moveZone = (index, direction) => {
    const newMap = [...editingMap];
    if (direction === 'up' && index > 0) [newMap[index - 1], newMap[index]] = [newMap[index], newMap[index - 1]];
    else if (direction === 'down' && index < newMap.length - 1) [newMap[index + 1], newMap[index]] = [newMap[index], newMap[index + 1]];
    setEditingMap(newMap);
  };

  const addZone = () => {
    let nextZoneName = "Zone A";
    if (editingMap.length > 0) {
      const lastZone = editingMap[editingMap.length - 1].zone.trim();
      const match = lastZone.match(/^(Zone\s+)([A-Y])$/i); 
      if (match) nextZoneName = match[1] + String.fromCharCode(match[2].charCodeAt(0) + 1);
      else nextZoneName = lastZone + " (New)";
    }
    setEditingMap([...editingMap, { zone: nextZoneName, spots: [] }]);
  };

  const removeZone = (index) => {
    setConfirmConfig({
      isOpen: true, title: "Delete Zone", message: "Delete this entire zone? All parking spots inside will be lost.", isDanger: true,
      onConfirm: () => { const newMap = [...editingMap]; newMap.splice(index, 1); setEditingMap(newMap); setConfirmConfig({ ...confirmConfig, isOpen: false }); },
      onCancel: () => setConfirmConfig({ ...confirmConfig, isOpen: false })
    });
  };

  const updateSpotName = (zoneIdx, spotIdx, val) => { const newMap = [...editingMap]; newMap[zoneIdx].spots[spotIdx] = val; setEditingMap(newMap); };

  const removeSpot = (zoneIdx, spotIdx) => {
    setConfirmConfig({
      isOpen: true, title: "Remove Spot", message: "Delete this parking spot from the floor plan?", isDanger: true,
      onConfirm: () => { const newMap = [...editingMap]; newMap[zoneIdx].spots.splice(spotIdx, 1); setEditingMap(newMap); setConfirmConfig({ ...confirmConfig, isOpen: false }); },
      onCancel: () => setConfirmConfig({ ...confirmConfig, isOpen: false })
    });
  };

  const addSpotToZone = (zoneIdx) => {
    const newMap = [...editingMap];
    const prefix = getZonePrefix(newMap[zoneIdx].zone);
    let newNum = newMap[zoneIdx].spots.length + 1;
    let newSpotName = `${prefix}-${newNum}`;
    while (newMap[zoneIdx].spots.includes(newSpotName)) { newNum++; newSpotName = `${prefix}-${newNum}`; }
    newMap[zoneIdx].spots.push(newSpotName);
    setEditingMap(newMap);
  };

  const handleToggleWash = async (e) => { await update(ref(db, `venues/${venueId}/settings`), { carWashEnabled: e.target.checked }); };
  const handlePriceChange = async (e) => { await update(ref(db, `venues/${venueId}/settings`), { carWashPrice: Number(e.target.value) }); };
  const handleAddLocation = async () => {
    if (!newLocationInput.trim()) return;
    const locs = [...(venueSettings.returnLocations || []), newLocationInput.trim()];
    await update(ref(db, `venues/${venueId}/settings`), { returnLocations: locs });
    setNewLocationInput('');
  };
  const handleRemoveLocation = async (index) => {
    const locs = [...(venueSettings.returnLocations || [])];
    locs.splice(index, 1);
    await update(ref(db, `venues/${venueId}/settings`), { returnLocations: locs });
  };
  
  const handleAdminDelete = (id) => {
    setConfirmConfig({
      isOpen: true, title: "Delete Ticket?", message: "Are you sure you want to permanently delete this active ticket from the system?", isDanger: true,
      onConfirm: async () => { await set(ref(db, `tickets/${id}`), null); setConfirmConfig({ ...confirmConfig, isOpen: false }); },
      onCancel: () => setConfirmConfig({ ...confirmConfig, isOpen: false })
    });
  };

  return (
    <div className="app-container">
      <div className="dashboard-wrapper">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <h1 className="heading-dashboard">Management Overview</h1>
            <button onClick={() => signOut(auth)} className="btn-outline" style={{fontSize: '0.85rem', padding: '8px 16px', boxShadow: 'none'}}>Logout</button>
          </div>
          <button onClick={() => setDraftToEdit({ id: 'new' })} className="btn-green" style={{width: 'auto', padding: '12px 32px'}}>+ Add Vehicle</button>
        </div>

        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', overflowX: 'auto', paddingBottom: '8px' }}>
          <button className={activeTab === 'operations' ? 'btn-green' : 'btn-outline'} onClick={() => setActiveTab('operations')} style={{ padding: '12px 28px', whiteSpace: 'nowrap' }}>Live Operations</button>
          <button className={activeTab === 'metrics' ? 'btn-green' : 'btn-outline'} onClick={() => setActiveTab('metrics')} style={{ padding: '12px 28px', whiteSpace: 'nowrap' }}>Metrics</button>
          <button className={activeTab === 'map' ? 'btn-green' : 'btn-outline'} onClick={() => setActiveTab('map')} style={{ padding: '12px 28px', whiteSpace: 'nowrap' }}>Map Editor</button>
          <button className={activeTab === 'settings' ? 'btn-green' : 'btn-outline'} onClick={() => setActiveTab('settings')} style={{ padding: '12px 28px', whiteSpace: 'nowrap' }}>Settings</button>
        </div>

        <div>
          <div style={{ overflowX: 'auto' }}>
            
            {activeTab === 'operations' && (
              <table className="luxury-table animate-slide-up">
                <thead><tr><th>Vehicle</th><th>Plate</th><th>Spot</th><th>Valet Status</th><th>Wash Status</th><th>Time Parked</th><th>Actions</th></tr></thead>
                <tbody>
                  {parkedCars.map(t => {
                    const { time } = formatDateTime(t.timestamps?.parkedAt);
                    return (
                      <tr key={t.id}>
                        <td style={{ color: 'var(--text-main)', fontWeight: '700' }}>{t.vehicle?.make || 'Waiting for details'} {t.vehicle?.model || ''}</td>
                        <td style={{ fontWeight: 600 }}>{t.vehicle?.licensePlate || '-'}</td>
                        <td style={{ fontWeight: '800' }}>{t.parkingSpot || '-'}</td>
                        <td>
                          {t.status === 'draft' && <span className="status-badge status-draft">Draft</span>}
                          {t.status === 'parked' && <span className="status-badge status-parked">Parked</span>}
                          {t.status === 'requested' && <span className="status-badge status-requested">Requested</span>}
                          {t.status === 'incoming' && <span className="status-badge status-incoming">Transit</span>}
                          {t.status === 'ready' && <span className="status-badge status-ready">Ready</span>}
                        </td>
                        <td>
                          {!t.wantsWash && <span style={{color: 'var(--text-muted)', fontWeight: 600}}>Not Ordered</span>}
                          {t.wantsWash && t.washStatus === 'queued' && <span className="status-badge wash-queued">Queued</span>}
                          {t.wantsWash && t.washStatus === 'washing' && <span className="status-badge wash-washing">Washing</span>}
                          {t.wantsWash && t.washStatus === 'completed' && <span className="status-badge wash-completed">Completed</span>}
                        </td>
                        <td style={{ fontWeight: 500 }}>{t.status === 'draft' ? '-' : time}</td>
                        <td style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={() => setDraftToEdit(t)} className="btn-outline" style={{padding: '6px 12px', fontSize: '0.8rem', boxShadow: 'none'}}>Edit</button>
                          <button onClick={() => setQrModalTicket(t.id)} className="btn-outline" style={{padding: '6px 12px', fontSize: '0.8rem', boxShadow: 'none'}}>QR</button>
                          <button onClick={() => handleAdminDelete(t.id)} className="btn-action" style={{padding: '6px 12px', fontSize: '0.8rem', boxShadow: 'none'}}>Del</button>
                        </td>
                      </tr>
                    );
                  })}
                  {parkedCars.length === 0 && <tr><td colSpan="7" style={{textAlign: 'center', padding: '48px', color: 'var(--text-muted)'}}>No cars currently on site.</td></tr>}
                </tbody>
              </table>
            )}

            {activeTab === 'metrics' && (
              <table className="luxury-table animate-slide-up">
                <thead><tr><th>Vehicle</th><th>Plate</th><th>Arrival Date</th><th>Wash</th><th>Tip</th><th>Retrieval Time</th></tr></thead>
                <tbody>
                  {history.map(t => {
                    const { date } = formatDateTime(t.timestamps?.parkedAt);
                    
                    // Bulletproof Math calculation
                    const retrievedAt = t.timestamps?.retrievedAt || 0;
                    const requestedAt = t.timestamps?.requestedAt || 0;
                    const ms = (retrievedAt > requestedAt && requestedAt > 0) ? retrievedAt - requestedAt : 0;
                    
                    const mins = Math.floor(ms / 60000);
                    const secs = ((ms % 60000) / 1000).toFixed(0);
                    
                    return (
                      <tr key={t.id}>
                        <td style={{ color: 'var(--text-main)', fontWeight: '700' }}>{t.vehicle?.make || 'Unknown'} {t.vehicle?.model || ''}</td>
                        <td style={{ fontWeight: 600 }}>{t.vehicle?.licensePlate || ''}</td>
                        <td style={{ fontWeight: 500 }}>{date}</td>
                        <td style={{ fontWeight: 700, color: t.washPaid ? '#0ea5e9' : 'var(--text-muted)' }}>{t.washPaid ? 'Yes' : 'No'}</td>
                        <td style={{ fontWeight: 700, color: 'var(--accent-green)' }}>{t.tippedAmount ? `$${t.tippedAmount}` : '-'}</td>
                        <td style={{ color: mins > 5 ? 'var(--danger-red)' : 'var(--accent-green)', fontWeight: '800' }}>{mins}m {secs}s</td>
                      </tr>
                    );
                  })}
                  {history.length === 0 && <tr><td colSpan="6" style={{textAlign: 'center', padding: '48px', color: 'var(--text-muted)'}}>No completed retrieval data.</td></tr>}
                </tbody>
              </table>
            )}

            {activeTab === 'settings' && (
              <div style={{maxWidth: '800px', margin: '0 auto'}} className="animate-slide-up">
                
                <div className="editor-card" style={{borderColor: venueSettings.tier === 1 ? 'var(--card-border)' : 'var(--warning-yellow)', borderWidth: venueSettings.tier === 2 ? '2px' : '1px'}}>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px'}}>
                    <h3 style={{margin: 0, fontWeight: 800, fontSize: '1.5rem'}}>Service Options</h3>
                    <span style={{background: venueSettings.tier === 1 ? '#cbd5e1' : 'var(--warning-yellow)', color: venueSettings.tier === 1 ? '#475569' : '#fff', padding: '6px 12px', borderRadius: '8px', fontWeight: 800, fontSize: '0.8rem', letterSpacing: '1px', textTransform: 'uppercase'}}>
                      {venueSettings.tier === 1 ? 'Standard Tier' : 'Premium Tier'}
                    </span>
                  </div>
                  
                  <div className="settings-row" style={{opacity: venueSettings.tier === 1 ? 0.5 : 1}}>
                    <div>
                      <p style={{margin: '0 0 4px 0', fontWeight: 700}}>Enable Car Wash Service</p>
                      <p style={{margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500}}>Allow guests to request a wash on their ticket.</p>
                      {venueSettings.tier === 1 && <p style={{margin: '8px 0 0 0', fontSize: '0.85rem', color: 'var(--danger-red)', fontWeight: 700}}>Please contact software provider to unlock.</p>}
                    </div>
                    <label className="toggle-switch">
                      <input type="checkbox" checked={venueSettings.tier === 1 ? false : venueSettings.carWashEnabled} onChange={handleToggleWash} disabled={venueSettings.tier === 1} />
                      <span className="toggle-slider" style={{cursor: venueSettings.tier === 1 ? 'not-allowed' : 'pointer'}}></span>
                    </label>
                  </div>
                  
                  <div className="settings-row" style={{borderBottom: 'none', opacity: venueSettings.tier === 1 ? 0.5 : 1}}>
                    <div>
                      <p style={{margin: '0 0 4px 0', fontWeight: 700}}>Car Wash Price ($)</p>
                    </div>
                    <input type="number" className="vibrant-input" style={{width: '100px', marginBottom: 0, padding: '12px', textAlign: 'center'}} value={venueSettings.carWashPrice || 25} onChange={handlePriceChange} disabled={venueSettings.tier === 1} />
                  </div>
                </div>

                <div className="editor-card">
                  <h3 style={{marginTop: 0, fontWeight: 800, fontSize: '1.5rem'}}>Return Locations (Deliver To)</h3>
                  <p style={{fontSize: '0.95rem', color: 'var(--text-muted)', marginBottom: '16px', fontWeight: 500}}>These are the physical places a guest can request their car be brought to.</p>
                  
                  {(venueSettings.returnLocations || []).map((loc, i) => (
                    <div key={i} className="settings-row" style={{padding: '12px 0'}}>
                      <span style={{fontWeight: 600}}>{loc}</span>
                      <button onClick={() => handleRemoveLocation(i)} style={{background: 'transparent', border: 'none', color: 'var(--danger-red)', cursor: 'pointer', fontWeight: 'bold'}}>Remove</button>
                    </div>
                  ))}
                  
                  <div style={{display: 'flex', gap: '12px', marginTop: '24px'}}>
                    <input type="text" className="vibrant-input" placeholder="e.g. Back Entrance" value={newLocationInput} onChange={e => setNewLocationInput(e.target.value)} style={{marginBottom: 0}} />
                    <button onClick={handleAddLocation} className="btn-green" style={{width: '120px'}}>Add</button>
                  </div>
                </div>
              </div>
            )}
              
            {activeTab === 'map' && (
              <div style={{maxWidth: '1000px', margin: '0 auto'}}>
                <p style={{color: 'var(--text-muted)', marginBottom: '32px', fontSize: '1rem', fontWeight: 500}}>Changes made here will instantly update the interactive floor map for all valets. Tap a spot to rename it.</p>
                {editingMap.map((section, idx) => (
                  <div key={idx} className="editor-card" style={{ animationDelay: `${idx * 0.1}s` }}>
                    <div className="editor-zone-header">
                      <input type="text" value={section.zone} onChange={(e) => { const newMap = [...editingMap]; newMap[idx].zone = e.target.value; setEditingMap(newMap); }} className="vibrant-input editor-zone-input" />
                      <div className="editor-zone-actions">
                        <button onClick={() => moveZone(idx, 'up')} disabled={idx === 0} className="btn-outline" style={{padding: '8px 16px'}}>↑</button>
                        <button onClick={() => moveZone(idx, 'down')} disabled={idx === editingMap.length - 1} className="btn-outline" style={{padding: '8px 16px'}}>↓</button>
                        <button onClick={() => removeZone(idx)} className="btn-action" style={{padding: '8px 16px', width: 'auto', boxShadow: 'none'}}>Delete</button>
                      </div>
                    </div>
                    <div className="parking-map" style={{maxHeight: 'none', overflowY: 'visible', marginTop: '24px'}}>
                      {section.spots.map((spot, sIdx) => (
                        <div key={sIdx} style={{ position: 'relative' }}>
                          <input value={spot} onChange={(e) => updateSpotName(idx, sIdx, e.target.value)} className="spot-edit-input" />
                          <button onClick={() => removeSpot(idx, sIdx)} className="spot-delete-btn" title="Remove Spot">✕</button>
                        </div>
                      ))}
                      <div className="spot-add-btn" onClick={() => addSpotToZone(idx)} title="Add New Spot">+</div>
                    </div>
                  </div>
                ))}
                <div style={{display: 'flex', gap: '24px', marginTop: '40px'}}>
                  <button onClick={addZone} className="btn-outline" style={{flex: 1, padding: '16px', fontSize: '1.05rem'}}>+ Add New Zone</button>
                  <button onClick={handleSaveMap} className="btn-green" style={{flex: 2, padding: '16px', fontSize: '1.05rem'}}>Save Floor Plan to Live Database</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {draftToEdit && <LogArrivalModal onClose={() => setDraftToEdit(null)} venueId={venueId} parkingMap={parkingMap} occupiedSpots={occupiedSpots} knownPlates={knownPlates} editingTicket={draftToEdit.id === 'new' ? null : draftToEdit} />}
      {qrModalTicket && (
        <div className="modal-overlay">
          <div className="vibrant-card animate-scale-in" style={{width: '90%'}}>
            <h2 className="heading-brand" style={{color: 'var(--accent-green)'}}>DIGITAL TICKET</h2>
            <div style={{background: '#fff', padding: '20px', borderRadius: '12px', display: 'inline-block', margin: '24px 0', border: '2px solid var(--card-border)', boxShadow: 'var(--shadow-lg)'}}>
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(`${currentDomain}/?ticket=${qrModalTicket}`)}`} alt="QR Code" style={{display: 'block'}} />
            </div>
            <button onClick={() => setQrModalTicket(null)} className="btn-outline" style={{width: '100%', padding: '16px'}}>Close Ticket</button>
          </div>
        </div>
      )}
      <CustomConfirmWidget isOpen={confirmConfig.isOpen} title={confirmConfig.title} message={confirmConfig.message} onConfirm={confirmConfig.onConfirm} onCancel={confirmConfig.onCancel} isDanger={confirmConfig.isDanger} />
    </div>
  );
}

// ------------------------------------------------------------------
// APP ROUTER (Role-Based Access)
// ------------------------------------------------------------------
function App() {
  const [userRole, setUserRole] = useState(null);
  const [userVenueId, setUserVenueId] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [isGuest, setIsGuest] = useState(false);
  const [globalParkingMap, setGlobalParkingMap] = useState([]);

  const searchParams = new URLSearchParams(window.location.search);
  const requestedTicketId = searchParams.get('ticket');

  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = vibrantStyles;
    document.head.appendChild(styleSheet);

    if (requestedTicketId) {
      setIsGuest(true);
      setAuthLoading(false);
      return () => document.head.removeChild(styleSheet);
    }

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const snapshot = await get(ref(db, `users/${currentUser.uid}`));
        if (snapshot.exists()) {
          const userData = snapshot.val();
          setUserRole(userData.role || "valet_runner"); 
          setUserVenueId(userData.venueId || "venue_001");
        } else {
          setUserRole("valet_runner");
          setUserVenueId("venue_001");
        }
      } else {
        setUserRole(null);
        setUserVenueId(null);
      }
      setAuthLoading(false);
    });

    return () => { unsubscribeAuth(); document.head.removeChild(styleSheet); };
  }, [requestedTicketId]);

  useEffect(() => {
    if (!userVenueId || userRole === 'developer') return;
    
    const unsubscribeMap = onValue(ref(db, `venues/${userVenueId}/parkingMap`), (snapshot) => {
      if (snapshot.exists()) {
        setGlobalParkingMap(snapshot.val());
      } else {
        set(ref(db, `venues/${userVenueId}/parkingMap`), DEFAULT_PARKING_MAP);
        setGlobalParkingMap(DEFAULT_PARKING_MAP);
      }
    });
    return () => unsubscribeMap();
  }, [userVenueId, userRole]);

  if (authLoading) return <div className="app-container center-wrapper"><div className="animate-pulse" style={{color: 'var(--accent-green)', letterSpacing: '2px', fontWeight: 800}}>AUTHENTICATING...</div></div>;
  if (isGuest) return <GuestTicketView ticketId={requestedTicketId} />;
  
  if (!userRole) return <LoginView />;
  if (userRole === "developer") return <DeveloperView />;
  if (userRole === "master_admin") return <MasterAdminView parkingMap={globalParkingMap} venueId={userVenueId} />;
  if (userRole === "wash_team") return <WashBayView venueId={userVenueId} />;
  
  return <ValetDashboardView parkingMap={globalParkingMap} venueId={userVenueId} />;
}

export default App;