import { useState, useEffect, useRef } from 'react';
import { db, auth } from './firebase';
import { ref, onValue, update, set, get } from 'firebase/database';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';

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
    --danger-red: #ef4444;
    --warning-yellow: #f59e0b;
    --draft-purple: #8b5cf6;
    --font-ui: 'Outfit', sans-serif;
    
    /* New Shadow Variables for Depth */
    --shadow-sm: 0 2px 4px rgba(0,0,0,0.05);
    --shadow-md: 0 4px 12px rgba(0,0,0,0.08);
    --shadow-lg: 0 12px 32px rgba(0,0,0,0.12);
    --shadow-btn: 0 4px 14px rgba(16, 185, 129, 0.3);
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

  /* Buttons with Shadows */
  .btn-green { background: var(--accent-green); color: #fff; border: none; padding: 16px 24px; border-radius: 12px; font-size: 1.1rem; font-weight: 700; width: 100%; cursor: pointer; transition: all 0.2s; box-shadow: var(--shadow-btn); }
  .btn-green:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4); background: var(--accent-green-hover); }
  .btn-green:disabled { background: #cbd5e1; color: #64748b; box-shadow: none; cursor: not-allowed; }
  
  .btn-purple { background: var(--draft-purple); color: #fff; border: none; padding: 16px 24px; border-radius: 12px; font-size: 1.1rem; font-weight: 700; width: 100%; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 14px rgba(139, 92, 246, 0.3); }
  .btn-purple:hover { transform: translateY(-2px); filter: brightness(1.1); }
  
  .btn-action { background: #fee2e2; color: var(--danger-red); border: none; padding: 12px; border-radius: 12px; font-weight: 700; cursor: pointer; transition: all 0.2s; box-shadow: var(--shadow-sm); }
  .btn-action:hover { background: var(--danger-red); color: white; transform: translateY(-1px); box-shadow: var(--shadow-md); }

  .btn-outline { background: #fff; color: var(--text-main); border: 2px solid var(--card-border); padding: 12px 20px; border-radius: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s ease; box-shadow: var(--shadow-sm); }
  .btn-outline:hover { background: #f8fafc; border-color: #cbd5e1; box-shadow: var(--shadow-md); transform: translateY(-1px); }
  
  /* Mobile Wallet Buttons */
  .btn-apple-pay { background: #000; color: #fff; border: none; padding: 16px; border-radius: 8px; font-size: 1.1rem; font-weight: 600; width: 100%; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: var(--shadow-md); }
  .btn-apple-pay:hover { background: #333; transform: translateY(-2px); }
  .btn-google-pay { background: #fff; color: #3c4043; border: 1px solid #dadce0; padding: 16px; border-radius: 8px; font-size: 1.1rem; font-weight: 600; width: 100%; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; gap: 8px; box-shadow: var(--shadow-md); }
  .btn-google-pay:hover { background: #f8f9fa; transform: translateY(-2px); }

  /* Inputs */
  .vibrant-input { background: #f8fafc; border: 2px solid var(--card-border); color: var(--text-main); padding: 16px; width: 100%; border-radius: 12px; box-sizing: border-box; font-family: var(--font-ui); font-size: 1rem; font-weight: 500; transition: all 0.2s ease; box-shadow: inset 0 2px 4px rgba(0,0,0,0.02); }
  .vibrant-input:focus { outline: none; border-color: var(--accent-green); background: #fff; box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1); }
  
  /* Map Editor & Spot Selector Styles */
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

  .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(8px); display: flex; justify-content: center; align-items: center; z-index: 1000; padding: 20px; animation: fadeIn 0.2s ease-out; overflow-y: auto;}
  
  .contact-bar { display: flex; gap: 12px; margin-top: 16px; }
  .btn-contact { flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px; padding: 12px; border-radius: 12px; font-weight: 700; text-decoration: none; font-size: 0.95rem; transition: transform 0.2s; box-shadow: var(--shadow-sm); border: 1px solid var(--card-border); }
  .btn-contact:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); }
  .btn-whatsapp { background: #25D366; color: white; border-color: #25D366; }
  
  .luxury-table { width: 100%; border-collapse: collapse; text-align: left; font-size: 0.95rem; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: var(--shadow-md); }
  .luxury-table th { padding: 16px; border-bottom: 2px solid var(--card-border); color: var(--text-muted); font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; font-size: 0.85rem; background: #f8fafc;}
  .luxury-table td { padding: 20px 16px; border-bottom: 1px solid var(--card-border); }

  /* Settings UI */
  .settings-row { display: flex; justify-content: space-between; align-items: center; padding: 16px 0; border-bottom: 1px solid var(--card-border); }
  .toggle-switch { position: relative; width: 50px; height: 26px; }
  .toggle-switch input { opacity: 0; width: 0; height: 0; }
  .toggle-slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #cbd5e1; transition: .4s; border-radius: 34px; box-shadow: inset 0 2px 4px rgba(0,0,0,0.1); }
  .toggle-slider:before { position: absolute; content: ""; height: 18px; width: 18px; left: 4px; bottom: 4px; background-color: white; transition: .4s; border-radius: 50%; box-shadow: var(--shadow-sm); }
  input:checked + .toggle-slider { background-color: var(--accent-green); }
  input:checked + .toggle-slider:before { transform: translateX(24px); }

  /* Autocomplete Specific */
  .autocomplete-container { position: relative; width: 100%; margin-bottom: 16px; }
  .autocomplete-dropdown { position: absolute; top: calc(100% + 8px); left: 0; right: 0; background: #fff; border: 2px solid var(--accent-green); border-radius: 12px; max-height: 220px; overflow-y: auto; z-index: 9999; box-shadow: var(--shadow-lg); list-style: none; padding: 8px; margin: 0; text-align: left; }
  .autocomplete-item { padding: 12px 16px; cursor: pointer; color: var(--text-main); border-radius: 8px; font-weight: 500; }
  .autocomplete-item:hover { background: rgba(16, 185, 129, 0.1); color: var(--accent-green); }
`;

// ------------------------------------------------------------------
// MASSIVE GLOBAL CAR DATABASE
// ------------------------------------------------------------------
const CAR_DATABASE = {
  "Abarth": ["595", "695", "124 Spider"], "Acura": ["MDX", "RDX", "TLX", "Integra", "NSX"],
  "Alfa Romeo": ["Giulia", "Stelvio", "Tonale"], "Aston Martin": ["DBX", "Vantage", "DB11", "DBS", "Valhalla"],
  "Audi": ["A1", "A3", "A4", "A5", "A6", "A7", "A8", "Q2", "Q3", "Q4", "Q5", "Q7", "Q8", "RS Models", "e-tron", "R8"],
  "Bentley": ["Bentayga", "Continental GT", "Flying Spur"], "BMW": ["1-Series", "3-Series", "5-Series", "7-Series", "X1", "X3", "X5", "X7", "M Models"],
  "Bugatti": ["Chiron", "Veyron", "Bolide"], "BYD": ["Atto 3", "Seal", "Dolphin", "Han", "Tang"],
  "Cadillac": ["Escalade", "CT4", "CT5", "XT4", "XT5", "Lyriq"], "Chevrolet": ["Tahoe", "Suburban", "Corvette", "Camaro", "Silverado"],
  "Ferrari": ["Roma", "F8", "SF90", "Purosangue", "812", "296"], "Ford": ["Mustang", "Explorer", "Expedition", "F-150", "Bronco"],
  "Geely": ["Coolray", "Azkarra", "Tugella", "Monjaro"], "Honda": ["Accord", "Civic", "CR-V", "Pilot", "Odyssey"],
  "Hyundai": ["Elantra", "Sonata", "Tucson", "Santa Fe", "Palisade", "Ioniq 5"], "Jeep": ["Wrangler", "Grand Cherokee", "Wagoneer"],
  "Kia": ["Telluride", "Sportage", "Sorento", "K5", "EV6", "EV9"], "Lamborghini": ["Urus", "Huracan", "Revuelto", "Aventador"],
  "Land Rover": ["Range Rover", "Range Rover Sport", "Defender", "Velar", "Discovery"], "Lexus": ["IS", "ES", "LS", "NX", "RX", "UX", "GX", "LX", "LC"],
  "Maserati": ["Ghibli", "Quattroporte", "Levante", "Grecale", "MC20"], "McLaren": ["750S", "Artura", "GT", "720S"],
  "Mercedes-Benz": ["A-Class", "C-Class", "E-Class", "S-Class", "G-Class", "GLA", "GLC", "GLE", "GLS", "AMG GT", "EQS"],
  "Nissan": ["Altima", "Maxima", "Rogue/X-Trail", "Armada", "Patrol", "Pathfinder", "GT-R"], "Porsche": ["911", "Taycan", "Panamera", "Macan", "Cayenne"],
  "Rolls-Royce": ["Cullinan", "Ghost", "Phantom", "Spectre"], "Tesla": ["Model S", "Model 3", "Model X", "Model Y", "Cybertruck"],
  "Toyota": ["Land Cruiser", "Camry", "Corolla", "RAV4", "Highlander", "Tacoma", "Tundra", "Supra", "Hilux", "Prado"],
  "Volkswagen": ["Golf", "Passat", "Tiguan", "Touareg", "ID.4"], "Volvo": ["XC40", "XC60", "XC90"]
};

const COUNTRY_CODES = [
  { label: "🇦🇪 UAE (+971)", value: "+971" }, { label: "🇮🇱 Israel (+972)", value: "+972" }, { label: "🇺🇸 USA/Canada (+1)", value: "+1" }, { label: "🇬🇧 UK (+44)", value: "+44" },
  { label: "🇸🇦 Saudi Arabia (+966)", value: "+966" }, { label: "🇶🇦 Qatar (+974)", value: "+974" }
];

const DEFAULT_PARKING_MAP = [
  { zone: 'VIP Front', spots: Array.from({length: 12}, (_, i) => `VIP-${i + 1}`) },
  { zone: 'Zone A', spots: Array.from({length: 30}, (_, i) => `A-${i + 1}`) }
];

const DEFAULT_VENUE_SETTINGS = {
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

// ------------------------------------------------------------------
// CUSTOM CONFIRM MODAL
// ------------------------------------------------------------------
function CustomConfirmWidget({ isOpen, title, message, onConfirm, onCancel, confirmText = "Confirm", isDanger = true }) {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay" style={{ zIndex: 1100 }}>
      <div className="vibrant-card animate-scale-in" style={{ maxWidth: '400px', padding: '32px' }}>
        <h3 style={{ color: isDanger ? 'var(--danger-red)' : 'var(--accent-green)', marginTop: 0, fontWeight: 800, fontSize: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {title}
        </h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: '32px', lineHeight: '1.6', fontSize: '1rem', fontWeight: 500 }}>
          {message}
        </p>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={onConfirm} className={isDanger ? "btn-action" : "btn-green"} style={{ flex: 1, border: 'none', color: 'white', background: isDanger ? 'var(--danger-red)' : 'var(--accent-green)' }}>{confirmText}</button>
          <button onClick={onCancel} className="btn-outline" style={{ flex: 1 }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// REUSABLE AUTOCOMPLETE COMPONENT
// ------------------------------------------------------------------
function Autocomplete({ options, value, onChange, placeholder, style, isObject }) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (isObject) {
      const match = options.find(o => o.value === value);
      setSearchTerm(match ? match.label : value);
    } else {
      setSearchTerm(value);
    }
  }, [value, options, isObject]);

  useEffect(() => {
    function handleClickOutside(event) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) setIsOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="autocomplete-container" ref={wrapperRef} style={style}>
      <input
        type="text" className="vibrant-input" style={{ marginBottom: 0 }}
        placeholder={placeholder} value={searchTerm}
        onChange={(e) => { setSearchTerm(e.target.value); setIsOpen(true); if (!isObject) onChange(e.target.value); }}
        onFocus={() => setIsOpen(true)} required
      />
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
// SHARED LOG ARRIVAL MODAL (Used by Admin & Valet for Creation & Editing)
// ------------------------------------------------------------------
function LogArrivalModal({ onClose, venueId, parkingMap, occupiedSpots, knownPlates, editingTicket = null }) {
  const [newlyCreatedTicket, setNewlyCreatedTicket] = useState(null);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [formData, setFormData] = useState({ 
    make: '', model: '', color: '', plate: '', spot: '', countryCode: '+971', phone: '' 
  });

  useEffect(() => {
    // If we are editing an existing draft or ticket, auto-fill it
    if (editingTicket && editingTicket.vehicle) {
      const phoneParts = (editingTicket.guestPhone || "").split(' ');
      setFormData({
        make: editingTicket.vehicle.make || '',
        model: editingTicket.vehicle.model || '',
        color: editingTicket.vehicle.color || '',
        plate: editingTicket.vehicle.licensePlate || '',
        spot: editingTicket.parkingSpot || '',
        countryCode: phoneParts[0] || '+971',
        phone: phoneParts[1] || ''
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
      // Edit Mode
      await update(ref(db, `tickets/${editingTicket.id}`), {
        guestPhone: fullPhone,
        vehicle: { make: formData.make, model: formData.model, color: formData.color, licensePlate: formData.plate.toUpperCase() },
        parkingSpot: formData.spot,
        status: editingTicket.status === "draft" ? "parked" : editingTicket.status, 
        "timestamps/parkedAt": editingTicket.status === "draft" ? Date.now() : editingTicket.timestamps?.parkedAt
      });
      onClose();
    } else {
      // Create Mode
      const ticketId = `ticket_${Date.now()}`;
      await set(ref(db, `tickets/${ticketId}`), {
        venueId: venueId, 
        guestPhone: fullPhone,
        vehicle: { make: formData.make, model: formData.model, color: formData.color, licensePlate: formData.plate.toUpperCase() },
        parkingSpot: formData.spot, status: "parked", parkedByUserId: auth.currentUser.uid,
        timestamps: { parkedAt: Date.now(), requestedAt: null, retrievedAt: null }
      });
      setNewlyCreatedTicket(ticketId);
    }
  };

  const handlePlateBlur = (e) => {
    if(editingTicket) return; // Disable auto-fill if we are actively editing
    const plate = e.target.value.toUpperCase();
    if (knownPlates && knownPlates[plate]) {
      const past = knownPlates[plate];
      const phoneParts = (past.guestPhone || "").split(' ');
      setFormData({
        ...formData,
        plate: plate,
        make: past.vehicle?.make || '',
        model: past.vehicle?.model || '',
        color: past.vehicle?.color || '',
        countryCode: phoneParts[0] || '+971',
        phone: phoneParts[1] || ''
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
            <p style={{color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '24px', fontWeight: 500}}>Tap an empty green spot to assign it to this vehicle.</p>
            
            <div className="parking-map" style={{maxHeight: '60vh'}}>
              {parkingMap.map((section, idx) => (
                <div key={idx} style={{display: 'contents'}}>
                  <div className="zone-title">{section.zone}</div>
                  {section.spots.map(spot => {
                    // Spot is occupied if it's in the list AND it's not the spot we are currently editing
                    const isOccupied = occupiedSpots.includes(spot) && spot !== formData.spot; 
                    return (
                      <div 
                        key={spot} 
                        className={`spot-box ${isOccupied ? 'spot-occupied' : 'spot-empty'}`}
                        style={formData.spot === spot ? {background: 'var(--accent-green)', color: 'white', borderColor: 'var(--accent-green)'} : {}}
                        onClick={() => {
                          if(!isOccupied) {
                            setFormData({...formData, spot: spot});
                            setIsMapOpen(false);
                          }
                        }}
                      >
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
              {editingTicket ? 'EDIT DETAILS' : 'LOG ARRIVAL'}
            </h2>
            
            {errorMsg && <div style={{background: '#fef2f2', color: 'var(--danger-red)', padding: '16px', borderRadius: '12px', marginBottom: '24px', fontWeight: 600, border: '2px solid #fecaca'}}>{errorMsg}</div>}

            <input placeholder="License Plate (Auto-fills if known)" className="vibrant-input" style={{marginBottom: '16px', textTransform: 'uppercase', borderColor: 'var(--warning-yellow)'}} value={formData.plate} onChange={e => setFormData({...formData, plate: e.target.value})} onBlur={handlePlateBlur} />

            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
              <Autocomplete options={availableMakes} value={formData.make} onChange={(val) => setFormData({...formData, make: val, model: ''})} placeholder="Search or type Make" isObject={false} />
              <Autocomplete options={availableModels} value={formData.model} onChange={(val) => setFormData({...formData, model: val})} placeholder="Search or type Model" isObject={false} />
            </div>
            
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
              <input placeholder="Color" className="vibrant-input" style={{marginBottom: '16px'}} value={formData.color} onChange={e => setFormData({...formData, color: e.target.value})} />
              <input 
                readOnly
                placeholder="Tap to Select Spot" 
                className="vibrant-input" 
                style={{marginBottom: '16px', textAlign: 'center', color: formData.spot ? 'var(--accent-green)' : 'var(--danger-red)', fontWeight: '700', cursor: 'pointer', border: formData.spot ? '2px solid var(--accent-green)' : '2px dashed var(--danger-red)'}} 
                value={formData.spot || "Spot Missing!"} 
                onClick={() => setIsMapOpen(true)} 
              />
            </div>
            
            <div style={{display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px', alignItems: 'start'}}>
              <Autocomplete options={COUNTRY_CODES} value={formData.countryCode} onChange={(val) => setFormData({...formData, countryCode: val})} placeholder="+ Code" isObject={true} />
              <input type="tel" placeholder="Guest Phone" className="vibrant-input" style={{marginBottom: '24px'}} value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
            </div>

            <div style={{display: 'flex', gap: '16px'}}>
              <button type="submit" className="btn-green" style={{flex: 2}}>{editingTicket ? 'Save Update' : 'Generate Ticket'}</button>
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
  
  const [requestDetails, setRequestDetails] = useState({ location: 'Main Entrance', wantsWash: false });

  useEffect(() => {
    const unsubscribeTicket = onValue(ref(db, `tickets/${ticketId}`), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setTicket(data);
        
        // Fetch Venue Settings dynamically
        get(ref(db, `venues/${data.venueId}/settings`)).then(snap => {
          if (snap.exists()) setVenueSettings(snap.val());
        });

        // Trigger Tip Modal if retrieved and not tipped
        if (data.status === 'retrieved' && !data.tippedAmount) {
          setShowTipModal(true);
        }
      }
      setLoading(false);
    });
    return () => unsubscribeTicket();
  }, [ticketId]);

  const handleRequestClick = () => {
    if (requestDetails.wantsWash) {
      setShowPaymentModal(true); // Open payment gateway first
    } else {
      setShowRequestModal(true); // Open location select
    }
  };

  const submitRequest = async () => {
    await update(ref(db, `tickets/${ticketId}`), { 
      status: "requested", 
      returnLocation: requestDetails.location,
      wantsWash: requestDetails.wantsWash,
      washPaid: requestDetails.wantsWash ? true : false,
      "timestamps/requestedAt": Date.now() 
    });
    setShowRequestModal(false);
    setShowPaymentModal(false);
  };

  const submitTip = async (amount) => {
    await update(ref(db, `tickets/${ticketId}`), { tippedAmount: amount });
    setShowTipModal(false);
    alert(`Thank you for tipping $${amount}!`);
  };

  if (loading) return <div className="app-container center-wrapper"><div className="animate-pulse" style={{color: 'var(--accent-green)', letterSpacing: '2px', fontWeight: 800}}>LOADING TICKET...</div></div>;
  if (!ticket) return <div className="app-container center-wrapper"><div className="vibrant-card animate-scale-in">Ticket not found or expired.</div></div>;

  const { vehicle, status, parkedByPhone, parkedByName } = ticket;

  if (status === 'draft') {
    return (
      <div className="app-container center-wrapper">
        <div className="vibrant-card animate-slide-up">
          <div style={{background: 'var(--draft-purple)', padding: '24px', margin: '-32px -32px 32px -32px', color: 'white'}}>
            <h2 style={{margin: 0, fontSize: '1.5rem', fontWeight: 800}}>SKY VALET</h2>
          </div>
          <h3 style={{fontSize: '1.5rem', fontWeight: 700, marginBottom: '16px'}}>Securing your vehicle...</h3>
          <p style={{color: 'var(--text-muted)', marginBottom: '32px', fontWeight: 500}}>Your valet is currently logging your vehicle details and parking it safely. This screen will update automatically.</p>
          <div style={{display: 'flex', justifyContent: 'center'}}>
            <div style={{width: '40px', height: '40px', border: '4px solid #e2e8f0', borderTopColor: 'var(--draft-purple)', borderRadius: '50%', animation: 'spin 1s linear infinite'}} />
          </div>
          <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  const parkedTimeMs = Date.now() - ticket.timestamps.parkedAt;
  const hoursParked = Math.floor(parkedTimeMs / (1000 * 60 * 60));
  const minsParked = Math.floor((parkedTimeMs % (1000 * 60 * 60)) / (1000 * 60));

  return (
    <div className="app-container center-wrapper">
      <div className="vibrant-card animate-slide-up">
        <div style={{background: 'var(--accent-green)', padding: '24px', margin: '-32px -32px 32px -32px', color: 'white', boxShadow: 'var(--shadow-sm)'}}>
          <h2 style={{margin: 0, fontSize: '1.5rem', fontWeight: 800}}>SKY VALET</h2>
          <p style={{margin: '4px 0 0 0', opacity: 0.9, fontSize: '0.9rem', fontWeight: 500}}>Digital Parking Pass</p>
        </div>

        <h3 style={{fontSize: '1.75rem', fontWeight: 800, margin: '0 0 4px 0'}}>{vehicle?.make || 'Unknown'} {vehicle?.model || ''}</h3>
        <p style={{color: 'var(--text-muted)', fontSize: '1.1rem', margin: '0 0 24px 0', fontWeight: 600}}>{vehicle?.licensePlate || 'N/A'} • {vehicle?.color || 'N/A'}</p>

        <div style={{background: '#f8fafc', border: '2px solid #e2e8f0', borderRadius: '16px', padding: '24px', marginBottom: '24px', boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.02)'}}>
          <p style={{margin: '0 0 12px 0', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px'}}>Live Status</p>
          {status === 'parked' && <h4 style={{margin: 0, fontSize: '1.75rem', color: '#0f172a', fontWeight: 800}}>Safely Parked</h4>}
          {status === 'requested' && <h4 style={{margin: 0, fontSize: '1.75rem', color: 'var(--danger-red)', fontWeight: 800}}>Preparing Vehicle...</h4>}
          {status === 'incoming' && <h4 style={{margin: 0, fontSize: '1.75rem', color: 'var(--warning-yellow)', fontWeight: 800}}>On the Way!</h4>}
          {status === 'ready' && <h4 style={{margin: 0, fontSize: '1.75rem', color: 'var(--accent-green)', fontWeight: 800}}>Ready at Door!</h4>}
          {status === 'retrieved' && <h4 style={{margin: 0, fontSize: '1.75rem', color: '#0f172a', fontWeight: 800}}>Delivered</h4>}
          {status === 'parked' && <p style={{margin: '8px 0 0 0', fontSize: '0.95rem', color: 'var(--text-muted)', fontWeight: 600}}>Parked for {hoursParked}h {minsParked}m</p>}
        </div>

        {status !== 'retrieved' && (
          <div style={{textAlign: 'left', marginBottom: '32px'}}>
            <p style={{margin: '0 0 8px 0', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)'}}>Your Valet: <span style={{color: 'var(--text-main)'}}>{parkedByName || 'Team Member'}</span></p>
            <div className="contact-bar">
              <a href={`https://wa.me/${parkedByPhone?.replace('+', '')}`} className="btn-contact btn-whatsapp" target="_blank" rel="noreferrer">💬 Chat with Valet</a>
            </div>
          </div>
        )}

        {status === 'parked' && (
          <div className="animate-scale-in">
            {/* Car Wash Toggle on Main Page */}
            <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff', padding: '16px', borderRadius: '12px', border: '2px solid var(--card-border)', marginBottom: '16px', boxShadow: 'var(--shadow-md)'}}>
              <label style={{display: 'flex', alignItems: 'center', gap: '12px', cursor: venueSettings.carWashEnabled ? 'pointer' : 'not-allowed', fontWeight: 700, opacity: venueSettings.carWashEnabled ? 1 : 0.5}}>
                <input type="checkbox" style={{width: '20px', height: '20px', accentColor: 'var(--accent-green)'}} checked={requestDetails.wantsWash} disabled={!venueSettings.carWashEnabled} onChange={(e) => setRequestDetails({...requestDetails, wantsWash: e.target.checked})} />
                🫧 Add Car Wash (${venueSettings.carWashPrice || 25})
              </label>
              <span style={{fontSize: '0.85rem', fontWeight: 800, color: venueSettings.carWashEnabled ? 'var(--accent-green)' : 'var(--danger-red)'}}>
                {venueSettings.carWashEnabled ? 'AVAILABLE' : 'UNAVAILABLE'}
              </span>
            </div>

            <button onClick={handleRequestClick} className="btn-green" style={{ padding: '20px' }}>
              Request My Vehicle
            </button>
          </div>
        )}
      </div>

      {/* REQUEST VEHICLE MODAL (Location Select) */}
      {showRequestModal && (
        <div className="modal-overlay">
          <div className="vibrant-card animate-slide-up">
            <h3 style={{fontSize: '1.5rem', fontWeight: 800, margin: '0 0 24px 0'}}>Confirm Return Details</h3>
            
            <p style={{textAlign: 'left', fontWeight: 600, marginBottom: '8px'}}>Deliver my car to:</p>
            <select className="vibrant-input" style={{marginBottom: '24px', cursor: 'pointer'}} value={requestDetails.location} onChange={(e) => setRequestDetails({...requestDetails, location: e.target.value})}>
              {venueSettings.returnLocations.map(loc => <option key={loc}>{loc}</option>)}
            </select>

            <div style={{display: 'flex', gap: '12px'}}>
              <button onClick={submitRequest} className="btn-green" style={{flex: 2}}>Confirm Request</button>
              <button onClick={() => setShowRequestModal(false)} className="btn-outline" style={{flex: 1}}>Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* PAYMENT MODAL (Car Wash Checkout) */}
      {showPaymentModal && (
        <div className="modal-overlay">
          <div className="vibrant-card animate-slide-up">
            <h3 style={{fontSize: '1.5rem', fontWeight: 800, margin: '0 0 8px 0'}}>Complete Payment</h3>
            <p style={{color: 'var(--text-muted)', marginBottom: '24px', fontWeight: 500}}>Premium Car Wash Service: <strong>${venueSettings.carWashPrice || 25}.00</strong></p>
            
            <div style={{display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px'}}>
              <button onClick={() => setShowRequestModal(true)} className="btn-apple-pay"> Pay</button>
              <button onClick={() => setShowRequestModal(true)} className="btn-google-pay">
                <svg width="24" height="24" viewBox="0 0 24 24"><path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/><path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/><path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/><path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/></svg>
                Pay
              </button>
            </div>
            
            <button onClick={() => setShowPaymentModal(false)} className="btn-outline" style={{width: '100%'}}>Cancel Wash</button>
          </div>
        </div>
      )}

      {/* TIP MODAL (Post Delivery) */}
      {showTipModal && (
        <div className="modal-overlay">
          <div className="vibrant-card animate-slide-up">
            <h3 style={{fontSize: '1.5rem', fontWeight: 800, margin: '0 0 8px 0'}}>Vehicle Delivered</h3>
            <p style={{color: 'var(--text-muted)', marginBottom: '24px', fontWeight: 500}}>If you enjoyed your service, consider leaving a tip for your valet team.</p>
            
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', marginBottom: '24px'}}>
              <button onClick={() => submitTip(2)} className="btn-outline" style={{padding: '12px', fontSize: '1.1rem', fontWeight: 700}}>$2</button>
              <button onClick={() => submitTip(5)} className="btn-outline" style={{padding: '12px', fontSize: '1.1rem', fontWeight: 700}}>$5</button>
              <button onClick={() => submitTip(10)} className="btn-outline" style={{padding: '12px', fontSize: '1.1rem', fontWeight: 700}}>$10</button>
            </div>
            
            <button onClick={() => setShowTipModal(false)} className="btn-outline" style={{width: '100%', border: 'none', background: 'transparent', boxShadow: 'none', color: 'var(--text-muted)'}}>No Tip / Skip</button>
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
          <input type="email" placeholder="Staff Email" required className="vibrant-input" style={{marginBottom: '20px'}} onChange={(e) => setEmail(e.target.value)} />
          <input type="password" placeholder="Password" required className="vibrant-input" style={{marginBottom: '32px'}} onChange={(e) => setPassword(e.target.value)} />
          <button type="submit" className="btn-green">Authenticate</button>
        </form>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// VALET DASHBOARD COMPONENT
// ------------------------------------------------------------------
function ValetDashboardView({ parkingMap }) {
  const [tickets, setTickets] = useState([]);
  const [showLogModal, setShowLogModal] = useState(false);
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [quickQrId, setQuickQrId] = useState(null);
  const [draftToEdit, setDraftToEdit] = useState(null); 
  const [knownPlates, setKnownPlates] = useState({});
  const [venueSettings, setVenueSettings] = useState(DEFAULT_VENUE_SETTINGS);

  const currentVenueId = "venue_001";
  const currentDomain = window.location.origin;

  useEffect(() => {
    const unsubscribe = onValue(ref(db, 'tickets'), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const all = Object.keys(data).map(key => ({ id: key, ...data[key] }));
        setTickets(all.filter(t => t.venueId === currentVenueId && t.status !== "retrieved"));
        
        const memory = {};
        all.forEach(t => { if(t.vehicle?.licensePlate) memory[t.vehicle?.licensePlate.toUpperCase()] = t; });
        setKnownPlates(memory);
      } else { setTickets([]); }
    });
    
    get(ref(db, `venues/${currentVenueId}/settings`)).then(snap => {
      if (snap.exists()) setVenueSettings(snap.val());
    });

    return () => unsubscribe();
  }, []);

  const changeStatus = async (ticketId, newStatus) => {
    const updates = { status: newStatus };
    if (newStatus === 'retrieved') updates["timestamps/retrievedAt"] = Date.now();
    await update(ref(db, `tickets/${ticketId}`), updates);
  };

  const handleQuickDropOff = async () => {
    const ticketId = `ticket_${Date.now()}`;
    await set(ref(db, `tickets/${ticketId}`), {
      venueId: currentVenueId, 
      status: "draft", 
      parkedByUserId: auth.currentUser.uid,
      parkedByName: "Valet Team",
      parkedByPhone: "+971501234567",
      vehicle: { make: '', model: '', licensePlate: '', color: '' },
      timestamps: { created: Date.now() }
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
          {/* DRAFTS */}
          <div className="queue-column">
            <h2 className="queue-title">Needs Info ({drafts.length})</h2>
            {drafts.map((t, i) => (
              <div key={t.id} className="ticket-card" style={{ borderLeft: '6px solid var(--draft-purple)', animationDelay: `${i * 0.05}s` }}>
                <span className="status-badge status-draft">Draft Ticket</span>
                <p style={{margin: '8px 0', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500}}>Guest has QR code. Car needs parking spot and details.</p>
                <button onClick={() => setDraftToEdit(t)} className="btn-outline" style={{borderColor: 'var(--draft-purple)', color: 'var(--draft-purple)', marginTop: '8px'}}>Complete Details</button>
              </div>
            ))}
          </div>

          {/* REQUESTED */}
          <div className="queue-column">
            <h2 className="queue-title">Requested ({requested.length})</h2>
            {requested.map((t, i) => (
              <div key={t.id} className="ticket-card" style={{ borderLeft: '6px solid var(--danger-red)', animationDelay: `${i * 0.05}s` }}>
                <span className="status-badge status-requested">Needs Retrieval</span>
                <h3 style={{margin: '8px 0 0 0', fontWeight: 800}}>{t.vehicle?.make || 'Unknown'} <span style={{color: 'var(--text-muted)'}}>{t.vehicle?.licensePlate || ''}</span></h3>
                <p style={{margin: '4px 0 0 0', fontWeight: 700}}>Spot: {t.parkingSpot}</p>
                <div style={{background: '#f8fafc', padding: '12px', borderRadius: '12px', fontSize: '0.9rem', fontWeight: 700, marginTop: '8px', border: '1px solid #e2e8f0'}}>
                  📍 To: {t.returnLocation}
                  {t.wantsWash && <div style={{color: '#0ea5e9', marginTop: '4px'}}>🫧 PAID CAR WASH (${venueSettings.carWashPrice})</div>}
                </div>
                <button onClick={() => changeStatus(t.id, 'incoming')} className="btn-outline" style={{borderColor: 'var(--warning-yellow)', color: 'var(--warning-yellow)', marginTop: '8px'}}>Bring Car</button>
              </div>
            ))}
          </div>

          {/* TRANSIT/READY */}
          <div className="queue-column">
            <h2 className="queue-title">Transit/Ready ({incomingReady.length})</h2>
            {incomingReady.map((t, i) => (
              <div key={t.id} className="ticket-card" style={{ borderLeft: `6px solid ${t.status === 'ready' ? 'var(--accent-green)' : 'var(--warning-yellow)'}`, animationDelay: `${i * 0.05}s` }}>
                <span className={`status-badge ${t.status === 'ready' ? 'status-ready' : 'status-incoming'}`}>
                  {t.status === 'ready' ? 'Waiting at Door' : 'On The Way'}
                </span>
                <h3 style={{margin: '8px 0 12px 0', fontWeight: 800}}>{t.vehicle?.make || 'Unknown'} <span style={{color: 'var(--text-muted)'}}>{t.vehicle?.licensePlate || ''}</span></h3>
                
                {t.status === 'incoming' ? (
                  <button onClick={() => changeStatus(t.id, 'ready')} className="btn-green">Mark "Ready at Door"</button>
                ) : (
                  <button onClick={() => {
                    const plateMatch = prompt(`Verify Plate before handing keys over.\nType the plate number to confirm handover:`);
                    if (plateMatch && plateMatch.toUpperCase() === t.vehicle?.licensePlate?.toUpperCase()) changeStatus(t.id, 'retrieved');
                    else if (plateMatch) alert("Plate does not match! Do not hand over keys.");
                  }} className="btn-outline" style={{borderColor: 'var(--accent-green)', color: 'var(--accent-green)'}}>
                    Verify Plate & Handover
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* PARKED */}
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
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {draftToEdit && <LogArrivalModal onClose={() => setDraftToEdit(null)} venueId={currentVenueId} parkingMap={parkingMap} occupiedSpots={occupiedSpots} knownPlates={knownPlates} editingTicket={draftToEdit} />}

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

      {/* SCANNER MODAL PLACEHOLDER */}
      {showScannerModal && (
        <div className="modal-overlay">
          <div className="vibrant-card animate-scale-in" style={{maxWidth: '400px'}}>
            <h3 style={{marginTop: 0, fontWeight: 800, fontSize: '1.5rem'}}>Scan Guest QR</h3>
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

// ------------------------------------------------------------------
// MASTER ADMIN DASHBOARD
// ------------------------------------------------------------------
function MasterAdminView({ parkingMap }) {
  const [history, setHistory] = useState([]);
  const [parkedCars, setParkedCars] = useState([]);
  const [activeTab, setActiveTab] = useState('parked');
  const [draftToEdit, setDraftToEdit] = useState(null);
  const [editingMap, setEditingMap] = useState([]);
  const [qrModalTicket, setQrModalTicket] = useState(null);
  const [knownPlates, setKnownPlates] = useState({});
  const [confirmConfig, setConfirmConfig] = useState({ isOpen: false, title: '', message: '', onConfirm: null, isDanger: true });
  
  // Venue Settings State
  const [venueSettings, setVenueSettings] = useState(DEFAULT_VENUE_SETTINGS);
  const [newLocationInput, setNewLocationInput] = useState('');

  const currentDomain = window.location.origin;
  const currentVenueId = "venue_001";

  useEffect(() => {
    setEditingMap(JSON.parse(JSON.stringify(parkingMap || [])));
  }, [parkingMap]);

  useEffect(() => {
    // Tickets listener
    const unsubscribeTickets = onValue(ref(db, 'tickets'), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const allTickets = Object.keys(data).map(key => ({ id: key, ...data[key] }));
        setParkedCars(allTickets.filter(t => t.status !== "retrieved").sort((a, b) => (b.timestamps?.parkedAt || 0) - (a.timestamps?.parkedAt || 0)));
        setHistory(allTickets.filter(t => t.status === "retrieved" && t.timestamps?.requestedAt && t.timestamps?.retrievedAt).sort((a, b) => b.timestamps.retrievedAt - a.timestamps.retrievedAt));
        
        const memory = {};
        allTickets.forEach(t => { if(t.vehicle?.licensePlate) memory[t.vehicle.licensePlate.toUpperCase()] = t; });
        setKnownPlates(memory);
      }
    });

    // Settings listener
    const unsubscribeSettings = onValue(ref(db, `venues/${currentVenueId}/settings`), (snapshot) => {
      if (snapshot.exists()) {
        setVenueSettings(snapshot.val());
      } else {
        set(ref(db, `venues/${currentVenueId}/settings`), DEFAULT_VENUE_SETTINGS);
        setVenueSettings(DEFAULT_VENUE_SETTINGS);
      }
    });

    return () => { unsubscribeTickets(); unsubscribeSettings(); };
  }, []);

  const formatDateTime = (timestamp) => {
    if (!timestamp) return { date: '-', time: '-' };
    const dateObj = new Date(timestamp);
    return { date: dateObj.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }), time: dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
  };

  const occupiedSpots = parkedCars.map(t => t.parkingSpot);

  // --- Map Editor Functions ---
  const handleSaveMap = async () => {
    setConfirmConfig({
      isOpen: true, title: "Save Floor Plan", message: "Push these changes to the live database?", isDanger: false,
      onConfirm: async () => {
        await set(ref(db, 'parkingMap'), editingMap);
        setConfirmConfig({ ...confirmConfig, isOpen: false });
      },
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
      onConfirm: () => {
        const newMap = [...editingMap];
        newMap.splice(index, 1);
        setEditingMap(newMap);
        setConfirmConfig({ ...confirmConfig, isOpen: false });
      },
      onCancel: () => setConfirmConfig({ ...confirmConfig, isOpen: false })
    });
  };

  const updateSpotName = (zoneIdx, spotIdx, val) => {
    const newMap = [...editingMap];
    newMap[zoneIdx].spots[spotIdx] = val;
    setEditingMap(newMap);
  };

  const removeSpot = (zoneIdx, spotIdx) => {
    setConfirmConfig({
      isOpen: true, title: "Remove Spot", message: "Delete this parking spot from the floor plan?", isDanger: true,
      onConfirm: () => {
        const newMap = [...editingMap];
        newMap[zoneIdx].spots.splice(spotIdx, 1);
        setEditingMap(newMap);
        setConfirmConfig({ ...confirmConfig, isOpen: false });
      },
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

  // --- Settings Functions ---
  const handleToggleWash = async (e) => {
    await update(ref(db, `venues/${currentVenueId}/settings`), { carWashEnabled: e.target.checked });
  };
  const handlePriceChange = async (e) => {
    await update(ref(db, `venues/${currentVenueId}/settings`), { carWashPrice: Number(e.target.value) });
  };
  const handleAddLocation = async () => {
    if (!newLocationInput.trim()) return;
    const locs = [...(venueSettings.returnLocations || []), newLocationInput.trim()];
    await update(ref(db, `venues/${currentVenueId}/settings`), { returnLocations: locs });
    setNewLocationInput('');
  };
  const handleRemoveLocation = async (index) => {
    const locs = [...(venueSettings.returnLocations || [])];
    locs.splice(index, 1);
    await update(ref(db, `venues/${currentVenueId}/settings`), { returnLocations: locs });
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
          <button className={activeTab === 'parked' ? 'btn-green' : 'btn-outline'} onClick={() => setActiveTab('parked')} style={{ padding: '12px 28px', whiteSpace: 'nowrap' }}>
            Active Fleet ({parkedCars.length})
          </button>
          <button className={activeTab === 'metrics' ? 'btn-green' : 'btn-outline'} onClick={() => setActiveTab('metrics')} style={{ padding: '12px 28px', whiteSpace: 'nowrap' }}>
            History & Metrics
          </button>
          <button className={activeTab === 'map' ? 'btn-green' : 'btn-outline'} onClick={() => setActiveTab('map')} style={{ padding: '12px 28px', whiteSpace: 'nowrap' }}>
            Visual Map Editor
          </button>
          <button className={activeTab === 'settings' ? 'btn-green' : 'btn-outline'} onClick={() => setActiveTab('settings')} style={{ padding: '12px 28px', whiteSpace: 'nowrap' }}>
            Venue Settings
          </button>
        </div>

        <div>
          <h2 className="queue-title">
            {activeTab === 'parked' ? 'Live Parked Inventory' : 
             activeTab === 'metrics' ? 'Retrieval Time History' : 
             activeTab === 'map' ? 'Live Floor Plan Editor' : 'Venue Configuration'}
          </h2>
          
          <div style={{ overflowX: 'auto' }}>
            
            {/* PARKED TICKETS */}
            {activeTab === 'parked' && (
              <table className="luxury-table animate-slide-up">
                <thead><tr><th>Vehicle</th><th>Plate</th><th>Phone</th><th>Spot</th><th>Arrival Date</th><th>Parked Time</th><th>Actions</th></tr></thead>
                <tbody>
                  {parkedCars.map(t => {
                    const { date, time } = formatDateTime(t.timestamps?.parkedAt);
                    return (
                      <tr key={t.id}>
                        <td style={{ color: 'var(--text-main)', fontWeight: '700' }}>{t.vehicle?.make || 'Unknown'} {t.vehicle?.model || ''}</td>
                        <td style={{ fontWeight: 600 }}>{t.vehicle?.licensePlate || ''}</td>
                        <td style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{t.guestPhone || '-'}</td>
                        <td style={{ color: 'var(--accent-green)', fontWeight: '800' }}>{t.parkingSpot || 'Draft'}</td>
                        <td style={{ fontWeight: 500 }}>{date}</td><td style={{ fontWeight: 500 }}>{time}</td>
                        <td style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={() => setDraftToEdit(t)} className="btn-outline" style={{padding: '6px 12px', fontSize: '0.8rem', boxShadow: 'none'}}>Edit</button>
                          <button onClick={() => setQrModalTicket(t.id)} className="btn-outline" style={{padding: '6px 12px', fontSize: '0.8rem', boxShadow: 'none'}}>View QR</button>
                        </td>
                      </tr>
                    );
                  })}
                  {parkedCars.length === 0 && <tr><td colSpan="7" style={{textAlign: 'center', padding: '48px', color: 'var(--text-muted)'}}>Lot is completely empty.</td></tr>}
                </tbody>
              </table>
            )}

            {/* METRICS */}
            {activeTab === 'metrics' && (
              <table className="luxury-table animate-slide-up">
                <thead><tr><th>Vehicle</th><th>Plate</th><th>Phone</th><th>Arrival Date</th><th>Wash</th><th>Tip</th><th>Retrieval Time</th></tr></thead>
                <tbody>
                  {history.map(t => {
                    const { date } = formatDateTime(t.timestamps?.parkedAt);
                    const ms = t.timestamps.retrievedAt - t.timestamps.requestedAt;
                    const mins = Math.floor(ms / 60000);
                    const secs = ((ms % 60000) / 1000).toFixed(0);
                    return (
                      <tr key={t.id}>
                        <td style={{ color: 'var(--text-main)', fontWeight: '700' }}>{t.vehicle?.make || 'Unknown'} {t.vehicle?.model || ''}</td>
                        <td style={{ fontWeight: 600 }}>{t.vehicle?.licensePlate || ''}</td>
                        <td style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{t.guestPhone || '-'}</td>
                        <td style={{ fontWeight: 500 }}>{date}</td>
                        <td style={{ fontWeight: 700, color: t.washPaid ? '#0ea5e9' : 'var(--text-muted)' }}>{t.washPaid ? 'Yes' : 'No'}</td>
                        <td style={{ fontWeight: 700, color: 'var(--accent-green)' }}>{t.tippedAmount ? `$${t.tippedAmount}` : '-'}</td>
                        <td style={{ color: mins > 5 ? 'var(--danger-red)' : 'var(--accent-green)', fontWeight: '800' }}>{mins}m {secs}s</td>
                      </tr>
                    );
                  })}
                  {history.length === 0 && <tr><td colSpan="7" style={{textAlign: 'center', padding: '48px', color: 'var(--text-muted)'}}>No completed retrieval data.</td></tr>}
                </tbody>
              </table>
            )}

            {/* SETTINGS TAB */}
            {activeTab === 'settings' && (
              <div style={{maxWidth: '800px', margin: '0 auto'}} className="animate-slide-up">
                <div className="editor-card">
                  <h3 style={{marginTop: 0, fontWeight: 800, fontSize: '1.5rem'}}>Service Options</h3>
                  <div className="settings-row">
                    <div>
                      <p style={{margin: '0 0 4px 0', fontWeight: 700}}>Enable Car Wash Service</p>
                      <p style={{margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500}}>Allow guests to request a wash before checkout.</p>
                    </div>
                    <label className="toggle-switch">
                      <input type="checkbox" checked={venueSettings.carWashEnabled} onChange={handleToggleWash} />
                      <span className="toggle-slider"></span>
                    </label>
                  </div>
                  
                  <div className="settings-row" style={{borderBottom: 'none'}}>
                    <div>
                      <p style={{margin: '0 0 4px 0', fontWeight: 700}}>Car Wash Price ($)</p>
                    </div>
                    <input type="number" className="vibrant-input" style={{width: '100px', marginBottom: 0, padding: '12px', textAlign: 'center'}} value={venueSettings.carWashPrice || 25} onChange={handlePriceChange} />
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
              
            {/* MAP EDITOR TAB */}
            {activeTab === 'map' && (
              <div style={{maxWidth: '1000px', margin: '0 auto'}}>
                <p style={{color: 'var(--text-muted)', marginBottom: '32px', fontSize: '1rem', fontWeight: 500}}>Changes made here will instantly update the interactive floor map for all valets. Tap a spot to rename it.</p>
                
                {editingMap.map((section, idx) => (
                  <div key={idx} className="editor-card" style={{ animationDelay: `${idx * 0.1}s` }}>
                    <div className="editor-zone-header">
                      <input 
                        type="text" 
                        value={section.zone} 
                        onChange={(e) => {
                          const newMap = [...editingMap];
                          newMap[idx].zone = e.target.value;
                          setEditingMap(newMap);
                        }} 
                        className="vibrant-input editor-zone-input" 
                      />
                      <div className="editor-zone-actions">
                        <button onClick={() => moveZone(idx, 'up')} disabled={idx === 0} className="btn-outline" style={{padding: '8px 16px'}}>↑</button>
                        <button onClick={() => moveZone(idx, 'down')} disabled={idx === editingMap.length - 1} className="btn-outline" style={{padding: '8px 16px'}}>↓</button>
                        <button onClick={() => removeZone(idx)} className="btn-action" style={{padding: '8px 16px', width: 'auto', boxShadow: 'none'}}>Delete Zone</button>
                      </div>
                    </div>
                    
                    <div className="parking-map" style={{maxHeight: 'none', overflowY: 'visible', marginTop: '24px'}}>
                      {section.spots.map((spot, sIdx) => (
                        <div key={sIdx} style={{ position: 'relative' }}>
                          <input
                            value={spot}
                            onChange={(e) => updateSpotName(idx, sIdx, e.target.value)}
                            className="spot-edit-input"
                          />
                          <button
                            onClick={() => removeSpot(idx, sIdx)}
                            className="spot-delete-btn"
                            title="Remove Spot"
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                      <div className="spot-add-btn" onClick={() => addSpotToZone(idx)} title="Add New Spot">
                        +
                      </div>
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
      
      {draftToEdit && <LogArrivalModal onClose={() => setDraftToEdit(null)} venueId={currentVenueId} parkingMap={parkingMap} occupiedSpots={occupiedSpots} knownPlates={knownPlates} editingTicket={draftToEdit.id === 'new' ? null : draftToEdit} />}
      
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

      <CustomConfirmWidget 
        isOpen={confirmConfig.isOpen} 
        title={confirmConfig.title} 
        message={confirmConfig.message} 
        onConfirm={confirmConfig.onConfirm} 
        onCancel={confirmConfig.onCancel}
        isDanger={confirmConfig.isDanger}
      />
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
        setUserRole(snapshot.exists() ? snapshot.val().role : "valet_runner");
      } else {
        setUserRole(null);
      }
      setAuthLoading(false);
    });

    const unsubscribeMap = onValue(ref(db, 'parkingMap'), (snapshot) => {
      if (snapshot.exists()) {
        setGlobalParkingMap(snapshot.val());
      } else {
        set(ref(db, 'parkingMap'), DEFAULT_PARKING_MAP);
        setGlobalParkingMap(DEFAULT_PARKING_MAP);
      }
    });

    return () => { unsubscribeAuth(); unsubscribeMap(); document.head.removeChild(styleSheet); };
  }, [requestedTicketId]);

  if (authLoading) return <div className="app-container center-wrapper"><div className="animate-pulse" style={{color: 'var(--accent-green)', letterSpacing: '2px', fontWeight: 800}}>AUTHENTICATING...</div></div>;
  if (isGuest) return <GuestTicketView ticketId={requestedTicketId} />;
  if (!userRole) return <LoginView />;
  if (userRole === "master_admin") return <MasterAdminView parkingMap={globalParkingMap} />;
  return <ValetDashboardView parkingMap={globalParkingMap} />;
}

export default App;