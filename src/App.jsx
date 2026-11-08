import { useState, useEffect, useRef } from 'react';
import { db, auth } from './firebase';
import { ref, onValue, update, set, get } from 'firebase/database';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';

// ------------------------------------------------------------------
// INJECTED CSS FOR ULTRA-LUXURY UI & SMOOTH ANIMATIONS
// ------------------------------------------------------------------
const luxuryStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400&family=Inter:wght@300;400;500;600&display=swap');

  :root {
    --bg-color: #050505;
    --card-bg: #0a0a0a;
    --card-border: rgba(255, 255, 255, 0.08);
    --text-main: #f5f5f5;
    --text-muted: #888888;
    --accent-gold: #d4af37;
    --accent-gold-hover: #f1c40f;
    --danger-red: #ef4444;
    --danger-red-hover: #dc2626;
    --success-green: #10b981;
    --font-heading: 'Playfair Display', serif;
    --font-ui: 'Inter', sans-serif;
  }

  body { margin: 0; background-color: var(--bg-color); color: var(--text-main); font-family: var(--font-ui); -webkit-font-smoothing: antialiased; overflow-x: hidden; }
  .app-container { min-height: 100vh; display: flex; flex-direction: column; padding: 24px; box-sizing: border-box; }
  .center-wrapper { display: flex; justify-content: center; align-items: center; min-height: calc(100vh - 48px); }
  .dashboard-wrapper { max-width: 1200px; margin: 0 auto; width: 100%; animation: fadeIn 0.6s ease-out; }

  /* Smooth Animations */
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
  
  .animate-slide-up { animation: slideUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
  .animate-scale-in { animation: scaleIn 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }

  /* Premium Cards */
  .luxury-card { background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 16px; padding: 32px; width: 100%; max-width: 420px; box-shadow: 0 24px 48px rgba(0,0,0,0.6); text-align: center; position: relative; overflow: hidden; }
  .luxury-card::before { content: ''; position: absolute; top: 0; left: 0; right: 0; height: 1px; background: linear-gradient(90deg, transparent, var(--accent-gold), transparent); opacity: 0.3; }
  
  .heading-brand { font-family: var(--font-heading); color: var(--accent-gold); font-size: 1.75rem; font-weight: 600; margin: 0 0 24px 0; letter-spacing: 2px; text-transform: uppercase; }
  .heading-dashboard { font-family: var(--font-heading); color: var(--text-main); font-size: 2.25rem; margin: 0; font-weight: 400; letter-spacing: 0.5px; }

  /* Buttons */
  .btn-gold { background: linear-gradient(135deg, var(--accent-gold), #b8860b); color: #000; border: none; padding: 16px 24px; border-radius: 8px; font-size: 1.1rem; font-weight: 600; width: 100%; cursor: pointer; transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 4px 15px rgba(212, 175, 55, 0.2); }
  .btn-gold:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(212, 175, 55, 0.4); filter: brightness(1.1); }
  .btn-gold:active:not(:disabled) { transform: translateY(0); }
  .btn-gold:disabled { background: #222; color: #555; box-shadow: none; cursor: not-allowed; }
  
  .btn-outline { background: rgba(255,255,255,0.03); color: var(--text-main); border: 1px solid var(--card-border); padding: 12px 20px; border-radius: 8px; font-weight: 500; cursor: pointer; transition: all 0.3s ease; backdrop-filter: blur(4px); }
  .btn-outline:hover { background: rgba(255,255,255,0.08); border-color: var(--text-muted); transform: translateY(-1px); }
  
  .btn-action { background: rgba(239, 68, 68, 0.1); color: var(--danger-red); border: 1px solid rgba(239, 68, 68, 0.3); padding: 12px; border-radius: 8px; width: 100%; font-weight: 600; cursor: pointer; transition: all 0.3s ease; }
  .btn-action:hover { background: var(--danger-red); color: #fff; border-color: var(--danger-red); transform: translateY(-1px); box-shadow: 0 4px 12px rgba(239, 68, 68, 0.3); }

  /* Inputs */
  .luxury-input { background: rgba(0,0,0,0.5); border: 1px solid var(--card-border); color: var(--text-main); padding: 16px; width: 100%; border-radius: 8px; box-sizing: border-box; font-family: var(--font-ui); font-size: 1rem; transition: all 0.3s ease; }
  .luxury-input:focus { outline: none; border-color: var(--accent-gold); background: rgba(0,0,0,0.8); box-shadow: 0 0 0 1px var(--accent-gold); }
  .luxury-input[readonly] { cursor: pointer; }
  
  /* Autocomplete */
  .autocomplete-container { position: relative; width: 100%; margin-bottom: 16px; }
  .autocomplete-dropdown { position: absolute; top: calc(100% + 8px); left: 0; right: 0; background: #111; border: 1px solid var(--accent-gold); border-radius: 8px; max-height: 220px; overflow-y: auto; z-index: 9999; box-shadow: 0 10px 30px rgba(0,0,0,0.9); list-style: none; padding: 4px; margin: 0; text-align: left; animation: slideUp 0.2s ease-out; }
  .autocomplete-item { padding: 14px 16px; cursor: pointer; color: var(--text-muted); border-radius: 6px; transition: all 0.2s; font-size: 0.95rem; }
  .autocomplete-item:hover { background: rgba(212, 175, 55, 0.1); color: var(--accent-gold); }

  /* Parking Grid */
  .parking-map { display: grid; grid-template-columns: repeat(auto-fill, minmax(75px, 1fr)); gap: 14px; margin-top: 20px; max-height: 55vh; overflow-y: auto; padding: 4px 12px 12px 4px; }
  .spot-box { padding: 18px 4px; border-radius: 8px; text-align: center; font-size: 0.9rem; font-weight: 600; border: 1px solid var(--card-border); transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1); box-sizing: border-box; position: relative; overflow: hidden; }
  .spot-empty { background: rgba(16, 185, 129, 0.05); color: var(--success-green); border-color: rgba(16, 185, 129, 0.3); cursor: pointer; }
  .spot-empty:hover { background: var(--success-green); color: #fff; border-color: var(--success-green); transform: translateY(-3px); box-shadow: 0 6px 15px rgba(16, 185, 129, 0.3); }
  .spot-occupied { background: rgba(239, 68, 68, 0.05); color: var(--danger-red); border-color: rgba(239, 68, 68, 0.3); cursor: not-allowed; opacity: 0.6; }
  .zone-title { width: 100%; grid-column: 1 / -1; margin: 24px 0 12px 0; color: var(--accent-gold); font-family: var(--font-heading); font-size: 1.35rem; border-bottom: 1px solid rgba(212, 175, 55, 0.2); padding-bottom: 8px;}

  /* Editor */
  .spot-edit-input { background: rgba(0,0,0,0.3); color: var(--accent-gold); border: 1px dashed rgba(212, 175, 55, 0.5); text-align: center; border-radius: 8px; padding: 16px 4px; font-size: 0.9rem; font-weight: 600; width: 100%; box-sizing: border-box; font-family: var(--font-ui); transition: all 0.3s ease;}
  .spot-edit-input:focus { outline: none; background: rgba(0,0,0,0.8); border-style: solid; border-color: var(--accent-gold); }
  .spot-delete-btn { position: absolute; top: -8px; right: -8px; background: var(--danger-red); color: white; border: none; border-radius: 50%; width: 24px; height: 24px; font-size: 12px; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; z-index: 10; box-shadow: 0 4px 8px rgba(0,0,0,0.5); transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1); opacity: 0; }
  div[style*="position: relative"]:hover .spot-delete-btn { opacity: 1; transform: scale(1); }
  .spot-delete-btn:hover { background: var(--danger-red-hover); transform: scale(1.15) !important; }
  .spot-add-btn { background: rgba(212, 175, 55, 0.05); color: var(--accent-gold); border: 1px dashed rgba(212, 175, 55, 0.4); cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 1.75rem; border-radius: 8px; min-height: 54px; transition: all 0.3s ease; box-sizing: border-box;}
  .spot-add-btn:hover { background: var(--accent-gold); color: #000; border-style: solid;}

  /* Dashboard Structure */
  .dashboard-grid { display: grid; grid-template-columns: 1fr; gap: 32px; margin-top: 32px; }
  @media (min-width: 768px) { .dashboard-grid { grid-template-columns: 1fr 1fr; } }
  .queue-column { background: rgba(10,10,10,0.6); border: 1px solid var(--card-border); border-radius: 12px; padding: 24px; backdrop-filter: blur(10px); }
  .queue-title { font-family: var(--font-heading); font-size: 1.5rem; margin: 0 0 24px 0; padding-bottom: 16px; border-bottom: 1px solid var(--card-border); }
  
  .ticket-card { background: #000; border: 1px solid var(--card-border); padding: 24px; border-radius: 12px; margin-bottom: 16px; display: flex; flex-direction: column; gap: 12px; transition: all 0.3s ease; animation: slideUp 0.4s ease-out backwards; }
  .ticket-card:hover { transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,0,0,0.4); border-color: rgba(255,255,255,0.15); }
  
  /* Overlays & Modals */
  .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.7); backdrop-filter: blur(12px); display: flex; justify-content: center; align-items: center; z-index: 1000; padding: 20px; animation: fadeIn 0.3s ease-out; }
  
  /* Tables */
  .luxury-table { width: 100%; border-collapse: collapse; text-align: left; font-size: 0.95rem; }
  .luxury-table th { padding: 16px; border-bottom: 1px solid var(--card-border); color: var(--text-muted); font-weight: 500; text-transform: uppercase; letter-spacing: 0.5px; font-size: 0.85rem; }
  .luxury-table td { padding: 20px 16px; border-bottom: 1px solid rgba(255,255,255,0.03); transition: background 0.2s; }
  .luxury-table tr:hover td { background: rgba(255,255,255,0.02); }
  
  .editor-card { background: #000; border: 1px solid var(--card-border); padding: 24px; border-radius: 12px; margin-bottom: 24px; animation: slideUp 0.4s ease-out backwards; }
`;

// ------------------------------------------------------------------
// DATABASES & DEFAULTS
// ------------------------------------------------------------------
const CAR_DATABASE = {
  "Acura": ["MDX", "RDX", "TLX", "Integra", "NSX"],
  "Alfa Romeo": ["Giulia", "Stelvio", "Tonale"],
  "Aston Martin": ["DBX", "Vantage", "DB11", "DBS", "Valhalla"],
  "Audi": ["A-Series (A3-A8)", "Q-Series (Q3-Q8)", "RS Models", "e-tron", "R8"],
  "Bentley": ["Bentayga", "Continental GT", "Flying Spur"],
  "BMW": ["1-4 Series", "5-8 Series", "X-Series (SUVs)", "M Models", "i-Series (EV)"],
  "Bugatti": ["Chiron", "Veyron", "Bolide"],
  "Buick": ["Enclave", "Encore", "Envision"],
  "Cadillac": ["Escalade", "CT-Series", "XT-Series", "Lyriq"],
  "Chevrolet": ["Tahoe/Suburban", "Corvette", "Camaro", "Silverado", "Equinox"],
  "Chrysler": ["300", "Pacifica"],
  "Dodge": ["Charger", "Challenger", "Durango", "Ram"],
  "Ferrari": ["Roma", "F8", "SF90", "Purosangue", "812", "296"],
  "Fiat": ["500", "Panda", "Tipo"],
  "Ford": ["Mustang", "Explorer", "Expedition", "F-Series", "Bronco"],
  "Genesis": ["G-Series (Sedans)", "GV-Series (SUVs)"],
  "GMC": ["Yukon", "Sierra", "Hummer EV", "Acadia"],
  "Honda": ["Accord", "Civic", "CR-V", "Pilot", "Odyssey"],
  "Hyundai": ["Elantra", "Sonata", "Tucson", "Santa Fe", "Palisade", "Ioniq"],
  "Infiniti": ["Q-Series", "QX-Series (SUVs)"],
  "Jaguar": ["F-PACE", "E-PACE", "I-PACE", "F-TYPE", "XF"],
  "Jeep": ["Wrangler", "Grand Cherokee", "Wagoneer", "Compass"],
  "Kia": ["Telluride", "Sportage", "Sorento", "K-Series", "EV-Series"],
  "Koenigsegg": ["Jesko", "Gemera", "Regera"],
  "Lamborghini": ["Urus", "Huracan", "Revuelto", "Aventador"],
  "Land Rover": ["Range Rover", "Range Rover Sport", "Defender", "Velar", "Discovery"],
  "Lexus": ["IS/ES/LS (Sedans)", "RX/NX/UX (Crossovers)", "GX/LX (SUVs)", "LC"],
  "Lincoln": ["Navigator", "Aviator", "Corsair", "Nautilus"],
  "Lotus": ["Emira", "Eletre", "Evija"],
  "Lucid": ["Air", "Gravity"],
  "Maserati": ["Ghibli", "Quattroporte", "Levante", "Grecale", "MC20"],
  "Mazda": ["CX-Series (SUVs)", "Mazda3", "MX-5 Miata"],
  "McLaren": ["750S", "Artura", "GT", "720S", "Senna"],
  "Mercedes-Benz": ["C/E/S-Class", "G-Class (G-Wagon)", "GL-Series (SUVs)", "AMG Models", "EQ-Series (EV)"],
  "MINI": ["Cooper", "Countryman", "Clubman"],
  "Mitsubishi": ["Outlander", "Eclipse Cross", "Pajero"],
  "Nissan": ["Altima", "Maxima", "Rogue", "Armada", "GT-R", "Z"],
  "Pagani": ["Huayra", "Utopia", "Zonda"],
  "Peugeot": ["208", "3008", "5008", "508"],
  "Polestar": ["Polestar 2", "Polestar 3", "Polestar 4"],
  "Porsche": ["911", "Taycan", "Panamera", "Macan", "Cayenne", "718"],
  "Ram": ["1500", "2500", "3500", "TRX"],
  "Renault": ["Clio", "Megane", "Captur", "Arkana"],
  "Rivian": ["R1T", "R1S"],
  "Rolls-Royce": ["Cullinan", "Ghost", "Phantom", "Spectre"],
  "Skoda": ["Octavia", "Superb", "Kodiaq"],
  "Subaru": ["Outback", "Forester", "Crosstrek", "WRX"],
  "Suzuki": ["Jimny", "Swift", "Vitara"],
  "Tesla": ["Model S", "Model 3", "Model X", "Model Y", "Cybertruck"],
  "Toyota": ["Land Cruiser", "Camry/Corolla", "RAV4", "Highlander", "Tacoma/Tundra", "Supra"],
  "Volkswagen": ["Golf", "Passat", "Tiguan", "Touareg", "ID-Series"],
  "Volvo": ["XC40", "XC60", "XC90", "S-Series", "V-Series"]
};

const COUNTRY_CODES = [
  { label: "🇦🇪 UAE (+971)", value: "+971" }, { label: "🇮🇱 Israel (+972)", value: "+972" }, { label: "🇺🇸 USA/Canada (+1)", value: "+1" }, { label: "🇬🇧 UK (+44)", value: "+44" },
  { label: "🇸🇦 Saudi Arabia (+966)", value: "+966" }, { label: "🇶🇦 Qatar (+974)", value: "+974" }, { label: "🇰🇼 Kuwait (+965)", value: "+965" }, { label: "🇧🇭 Bahrain (+973)", value: "+973" },
  { label: "🇴🇲 Oman (+968)", value: "+968" }, { label: "🇯🇴 Jordan (+962)", value: "+962" }, { label: "🇪🇬 Egypt (+20)", value: "+20" }, { label: "🇱🇧 Lebanon (+961)", value: "+961" },
  { label: "🇫🇷 France (+33)", value: "+33" }, { label: "🇩🇪 Germany (+49)", value: "+49" }, { label: "🇮🇹 Italy (+39)", value: "+39" }, { label: "🇪🇸 Spain (+34)", value: "+34" },
  { label: "🇨🇭 Switzerland (+41)", value: "+41" }, { label: "🇳🇱 Netherlands (+31)", value: "+31" }, { label: "🇧🇪 Belgium (+32)", value: "+32" }, { label: "🇸🇪 Sweden (+46)", value: "+46" }
];

const DEFAULT_PARKING_MAP = [
  { zone: 'VIP Front', spots: Array.from({length: 12}, (_, i) => `VIP-${i + 1}`) },
  { zone: 'Zone A', spots: Array.from({length: 30}, (_, i) => `A-${i + 1}`) },
  { zone: 'Zone B', spots: Array.from({length: 30}, (_, i) => `B-${i + 1}`) }
];

const getZonePrefix = (zoneName) => {
  const trimmed = zoneName.trim();
  if (/^Zone\s+[A-Z0-9]+$/i.test(trimmed)) return trimmed.split(/\s+/)[1].toUpperCase();
  const firstWord = trimmed.split(/\s+/)[0];
  if (firstWord === firstWord.toUpperCase() && firstWord.length > 1) return firstWord;
  return firstWord.charAt(0).toUpperCase();
};

// ------------------------------------------------------------------
// CUSTOM CONFIRM MODAL (Replaces window.confirm)
// ------------------------------------------------------------------
function CustomConfirmWidget({ isOpen, title, message, onConfirm, onCancel, confirmText = "Confirm", isDanger = true }) {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay" style={{ zIndex: 1100 }}>
      <div className="luxury-card animate-scale-in" style={{ maxWidth: '400px', padding: '32px' }}>
        <h3 style={{ color: isDanger ? 'var(--danger-red)' : 'var(--accent-gold)', marginTop: 0, fontFamily: 'var(--font-heading)', fontSize: '1.5rem', textTransform: 'uppercase', letterSpacing: '1px' }}>
          {title}
        </h3>
        <p style={{ color: 'var(--text-main)', marginBottom: '32px', lineHeight: '1.6', fontSize: '0.95rem' }}>
          {message}
        </p>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={onConfirm} className={isDanger ? "btn-action" : "btn-gold"} style={{ flex: 1 }}>{confirmText}</button>
          <button onClick={onCancel} className="btn-outline" style={{ flex: 1 }}>Cancel</button>
        </div>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// REUSABLE COMPONENTS
// ------------------------------------------------------------------
function LuxuryAutocomplete({ options, value, onChange, placeholder, style, isObject }) {
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

  const handleInputChange = (e) => {
    const val = e.target.value;
    setSearchTerm(val);
    setIsOpen(true);
    if (!isObject) onChange(val); 
  };

  const handleSelect = (option) => {
    if (isObject) {
      setSearchTerm(option.label);
      onChange(option.value);
    } else {
      setSearchTerm(option);
      onChange(option);
    }
    setIsOpen(false);
  };

  const filteredOptions = options.filter(opt => {
    const text = isObject ? opt.label : opt;
    return text.toLowerCase().includes(searchTerm.toLowerCase());
  });

  return (
    <div className="autocomplete-container" ref={wrapperRef} style={style}>
      <input
        type="text"
        className="luxury-input"
        style={{ marginBottom: 0 }}
        placeholder={placeholder}
        value={searchTerm}
        onChange={handleInputChange}
        onFocus={() => setIsOpen(true)}
        required
      />
      {isOpen && filteredOptions.length > 0 && (
        <ul className="autocomplete-dropdown">
          {filteredOptions.map((opt, i) => (
            <li key={i} className="autocomplete-item" onClick={() => handleSelect(opt)}>
              {isObject ? opt.label : opt}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

// ------------------------------------------------------------------
// SHARED LOG ARRIVAL MODAL (Used by Valet and Admin)
// ------------------------------------------------------------------
function LogArrivalModal({ onClose, venueId, parkingMap, occupiedSpots }) {
  const [newlyCreatedTicket, setNewlyCreatedTicket] = useState(null);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [formData, setFormData] = useState({ make: '', model: '', color: '', plate: '', spot: '', countryCode: '', phone: '' });

  const currentDomain = window.location.origin;
  const availableMakes = Object.keys(CAR_DATABASE);
  const availableModels = CAR_DATABASE[formData.make] || [];

  const handleCreateTicket = async (e) => {
    e.preventDefault();
    const ticketId = `ticket_${Date.now()}`;
    const fullPhone = `${formData.countryCode} ${formData.phone}`.trim();

    await set(ref(db, `tickets/${ticketId}`), {
      venueId: venueId, 
      guestPhone: fullPhone,
      vehicle: { make: formData.make, model: formData.model, color: formData.color, licensePlate: formData.plate },
      parkingSpot: formData.spot, status: "parked", parkedByUserId: auth.currentUser.uid,
      timestamps: { parkedAt: Date.now(), requestedAt: null, retrievedAt: null }
    });
    setNewlyCreatedTicket(ticketId);
  };

  return (
    <div className="modal-overlay">
      <div className="luxury-card animate-scale-in" style={{width: '90%', maxWidth: isMapOpen ? '850px' : '460px', padding: '40px', maxHeight: '90vh', overflowY: 'visible', transition: 'max-width 0.4s cubic-bezier(0.16, 1, 0.3, 1)'}}>
        
        {newlyCreatedTicket ? (
          <div className="animate-slide-up">
            <h2 className="heading-brand" style={{color: 'var(--accent-gold)'}}>TICKET ACTIVE</h2>
            <div style={{background: '#fff', padding: '16px', borderRadius: '12px', display: 'inline-block', margin: '24px 0', boxShadow: '0 10px 30px rgba(0,0,0,0.5)'}}>
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(`${currentDomain}/?ticket=${newlyCreatedTicket}`)}`} alt="QR Code" style={{display: 'block'}} />
            </div>
            <button onClick={onClose} className="btn-outline" style={{width: '100%', padding: '16px'}}>Return to Dashboard</button>
          </div>
        ) : isMapOpen ? (
          <div className="animate-slide-up" style={{textAlign: 'left'}}>
            <h2 className="heading-brand" style={{color: '#fff', fontSize: '1.75rem', marginBottom: '8px'}}>SELECT PARKING SPOT</h2>
            <p style={{color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '24px'}}>Tap an empty green spot to assign it to this vehicle.</p>
            
            <div className="parking-map" style={{maxHeight: '60vh'}}>
              {parkingMap.map((section, idx) => (
                <div key={idx} style={{display: 'contents'}}>
                  <div className="zone-title">{section.zone}</div>
                  {section.spots.map(spot => {
                    const isOccupied = occupiedSpots.includes(spot);
                    return (
                      <div 
                        key={spot} 
                        className={`spot-box ${isOccupied ? 'spot-occupied' : 'spot-empty'}`}
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
          <form onSubmit={handleCreateTicket} className="animate-slide-up">
            <h2 className="heading-brand" style={{color: '#fff', fontSize: '1.75rem', marginBottom: '24px'}}>LOG ARRIVAL</h2>
            
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
              <LuxuryAutocomplete options={availableMakes} value={formData.make} onChange={(val) => setFormData({...formData, make: val, model: ''})} placeholder="Search Make" isObject={false} />
              <LuxuryAutocomplete options={availableModels} value={formData.model} onChange={(val) => setFormData({...formData, model: val})} placeholder="Search Model" isObject={false} />
            </div>
            
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
              <input required placeholder="Color" className="luxury-input" style={{marginBottom: '16px'}} value={formData.color} onChange={e => setFormData({...formData, color: e.target.value})} />
              <input required placeholder="License Plate" className="luxury-input" style={{marginBottom: '16px', textTransform: 'uppercase'}} value={formData.plate} onChange={e => setFormData({...formData, plate: e.target.value})} />
            </div>
            
            <input 
              required 
              readOnly
              placeholder="Tap to Select Parking Spot" 
              className="luxury-input" 
              style={{marginBottom: '20px', textAlign: 'center', color: 'var(--accent-gold)', fontWeight: '600', letterSpacing: '1px'}} 
              value={formData.spot} 
              onClick={() => setIsMapOpen(true)} 
            />
            
            <div style={{display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px', alignItems: 'start'}}>
              <LuxuryAutocomplete options={COUNTRY_CODES} value={formData.countryCode} onChange={(val) => setFormData({...formData, countryCode: val})} placeholder="+ Code" isObject={true} />
              <input required type="tel" placeholder="Phone Number" className="luxury-input" style={{marginBottom: '24px'}} value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
            </div>

            <div style={{display: 'flex', gap: '16px'}}>
              <button type="submit" className="btn-gold" style={{flex: 2}}>Generate Ticket</button>
              <button type="button" onClick={onClose} className="btn-outline" style={{flex: 1}}>Cancel</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// 1. GUEST VIEW COMPONENT
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
    await update(ref(db, `tickets/${ticketId}`), { status: "requested", "timestamps/requestedAt": Date.now() });
  };

  if (loading) return <div className="app-container center-wrapper"><div className="animate-pulse" style={{color: 'var(--accent-gold)', letterSpacing: '2px'}}>RETRIEVING TICKET...</div></div>;
  if (!ticket) return <div className="app-container center-wrapper"><div className="luxury-card animate-scale-in">Ticket not found or expired.</div></div>;

  const { vehicle, status, parkingSpot } = ticket;
  const isRequested = status === "requested" || status === "retrieved";

  return (
    <div className="app-container center-wrapper">
      <div className="luxury-card animate-scale-in">
        <h2 className="heading-brand">WALDORF ASTORIA</h2>
        <div style={{ marginBottom: '32px' }}>
          <h3 className="car-title">{vehicle.make} {vehicle.model}</h3>
          <p className="car-subtitle">{vehicle.color} &nbsp;|&nbsp; {vehicle.licensePlate}</p>
        </div>
        <div style={{ background: 'rgba(0,0,0,0.4)', border: '1px solid var(--card-border)', padding: '24px', borderRadius: '12px', marginBottom: '40px' }}>
          <p style={{ margin: '0 0 12px 0', color: 'var(--text-muted)', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '1px' }}>Current Status</p>
          <p style={{ margin: 0, fontSize: '2rem', fontWeight: '400', color: status === 'parked' ? 'var(--accent-gold)' : '#fff', letterSpacing: '1px' }}>
            {status.toUpperCase()}
          </p>
          {status === "parked" && <p style={{ margin: '16px 0 0 0', color: 'var(--text-muted)', fontSize: '1rem' }}>Spot: <span style={{color: '#fff', fontWeight: '600'}}>{parkingSpot}</span></p>}
        </div>
        <button onClick={requestVehicle} disabled={isRequested} className="btn-gold" style={{ padding: '20px' }}>
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
    try { await signInWithEmailAndPassword(auth, email, password); } 
    catch (err) { setError('Invalid credentials.'); }
  };

  return (
    <div className="app-container center-wrapper">
      <div className="luxury-card animate-scale-in" style={{ padding: '48px 32px' }}>
        <h2 className="heading-brand" style={{color: '#fff', marginBottom: '40px'}}>STAFF PORTAL</h2>
        {error && <p style={{ color: 'var(--danger-red)', fontSize: '0.9rem', marginBottom: '24px', background: 'rgba(239, 68, 68, 0.1)', padding: '12px', borderRadius: '6px' }}>{error}</p>}
        <form onSubmit={handleLogin}>
          <input type="email" placeholder="Staff Email" required className="luxury-input" style={{marginBottom: '20px'}} onChange={(e) => setEmail(e.target.value)} />
          <input type="password" placeholder="Password" required className="luxury-input" style={{marginBottom: '32px'}} onChange={(e) => setPassword(e.target.value)} />
          <button type="submit" className="btn-gold">Authenticate</button>
        </form>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// 3. VALET DASHBOARD COMPONENT
// ------------------------------------------------------------------
function ValetDashboardView({ parkingMap }) {
  const [tickets, setTickets] = useState([]);
  const [showLogModal, setShowLogModal] = useState(false);
  const [qrModalTicket, setQrModalTicket] = useState(null);
  
  const currentVenueId = "venue_001";
  const currentDomain = window.location.origin;

  useEffect(() => {
    const unsubscribe = onValue(ref(db, 'tickets'), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        setTickets(Object.keys(data).map(key => ({ id: key, ...data[key] })).filter(t => t.venueId === currentVenueId && t.status !== "retrieved"));
      } else { setTickets([]); }
    });
    return () => unsubscribe();
  }, []);

  const markAsRetrieved = async (ticketId) => {
    await update(ref(db, `tickets/${ticketId}`), { status: "retrieved", "timestamps/retrievedAt": Date.now() });
  };

  const requestedCars = tickets.filter(t => t.status === "requested");
  const parkedCars = tickets.filter(t => t.status === "parked");
  const occupiedSpots = parkedCars.map(t => t.parkingSpot);

  return (
    <div className="app-container">
      <div className="dashboard-wrapper">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <h1 className="heading-dashboard">Live Queue</h1>
            <button onClick={() => signOut(auth)} className="btn-outline" style={{fontSize: '0.85rem', padding: '8px 16px'}}>Logout</button>
          </div>
          <button onClick={() => setShowLogModal(true)} className="btn-gold" style={{width: 'auto', padding: '12px 32px'}}>+ Log Arrival</button>
        </div>

        <div className="dashboard-grid">
          {/* URGENT QUEUE */}
          <div className="queue-column" style={{ borderColor: 'var(--danger-red)', background: 'rgba(239, 68, 68, 0.02)' }}>
            <h2 className="queue-title" style={{ color: '#fca5a5', borderColor: 'rgba(239, 68, 68, 0.2)' }}>Action Required ({requestedCars.length})</h2>
            {requestedCars.map((t, index) => (
              <div key={t.id} className="ticket-card" style={{ borderLeft: '4px solid #ef4444', animationDelay: `${index * 0.05}s` }}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                  <div>
                    <h3 style={{margin: '0 0 6px 0', fontSize: '1.25rem', fontWeight: '600'}}>{t.vehicle.make} {t.vehicle.model}</h3>
                    <p style={{margin: '0', color: 'var(--text-muted)', fontSize: '0.95rem'}}>{t.vehicle.color} • <span style={{color: '#fff'}}>{t.vehicle.licensePlate}</span></p>
                  </div>
                  <div style={{background: 'rgba(239, 68, 68, 0.1)', color: '#fca5a5', padding: '6px 10px', borderRadius: '6px', fontWeight: 'bold', fontSize: '0.9rem', border: '1px solid rgba(239,68,68,0.3)'}}>
                    Spot: {t.parkingSpot}
                  </div>
                </div>
                <button onClick={() => markAsRetrieved(t.id)} className="btn-action" style={{marginTop: '16px'}}>Handed to Guest</button>
              </div>
            ))}
            {requestedCars.length === 0 && <p style={{color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '32px'}}>No pending requests.</p>}
          </div>

          {/* PARKED QUEUE */}
          <div className="queue-column">
            <h2 className="queue-title" style={{ color: 'var(--text-main)' }}>Currently Parked ({parkedCars.length})</h2>
            {parkedCars.map((t, index) => (
              <div key={t.id} className="ticket-card" style={{ borderLeft: '4px solid var(--card-border)', animationDelay: `${index * 0.05}s` }}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                  <div>
                    <h3 style={{margin: '0 0 6px 0', fontSize: '1.15rem', fontWeight: '500'}}>{t.vehicle.make} {t.vehicle.model}</h3>
                    <p style={{margin: '0', color: 'var(--text-muted)', fontSize: '0.95rem'}}><span style={{color: '#fff'}}>{t.vehicle.licensePlate}</span></p>
                  </div>
                  <div style={{color: 'var(--accent-gold)', fontWeight: '600', textAlign: 'right', fontSize: '1.1rem'}}>{t.parkingSpot}</div>
                </div>
                <button onClick={() => setQrModalTicket(t.id)} className="btn-outline" style={{marginTop: '16px', padding: '10px', fontSize: '0.9rem'}}>
                  View Digital Ticket
                </button>
              </div>
            ))}
            {parkedCars.length === 0 && <p style={{color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '32px'}}>Lot is completely empty.</p>}
          </div>
        </div>
      </div>

      {showLogModal && <LogArrivalModal onClose={() => setShowLogModal(false)} venueId={currentVenueId} parkingMap={parkingMap} occupiedSpots={occupiedSpots} />}

      {qrModalTicket && (
        <div className="modal-overlay">
          <div className="luxury-card animate-scale-in" style={{width: '90%'}}>
            <h2 className="heading-brand" style={{color: 'var(--accent-gold)'}}>DIGITAL TICKET</h2>
            <div style={{background: '#fff', padding: '20px', borderRadius: '12px', display: 'inline-block', margin: '24px 0', boxShadow: '0 10px 30px rgba(0,0,0,0.5)'}}>
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(`${currentDomain}/?ticket=${qrModalTicket}`)}`} alt="QR Code" style={{display: 'block'}} />
            </div>
            <button onClick={() => setQrModalTicket(null)} className="btn-outline" style={{width: '100%', padding: '16px'}}>Close Ticket</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ------------------------------------------------------------------
// 4. MASTER ADMIN DASHBOARD
// ------------------------------------------------------------------
function MasterAdminView({ parkingMap }) {
  const [history, setHistory] = useState([]);
  const [parkedCars, setParkedCars] = useState([]);
  const [activeTab, setActiveTab] = useState('parked');
  const [showLogModal, setShowLogModal] = useState(false);
  const [editingMap, setEditingMap] = useState([]);
  
  // Custom Confirm Dialog State
  const [confirmConfig, setConfirmConfig] = useState({ isOpen: false, title: '', message: '', onConfirm: null, isDanger: true });

  useEffect(() => {
    setEditingMap(JSON.parse(JSON.stringify(parkingMap || [])));
  }, [parkingMap]);

  useEffect(() => {
    const unsubscribe = onValue(ref(db, 'tickets'), (snapshot) => {
      if (snapshot.exists()) {
        const data = snapshot.val();
        const allTickets = Object.keys(data).map(key => ({ id: key, ...data[key] }));
        setParkedCars(allTickets.filter(t => t.status !== "retrieved").sort((a, b) => b.timestamps.parkedAt - a.timestamps.parkedAt));
        setHistory(allTickets.filter(t => t.status === "retrieved" && t.timestamps.requestedAt && t.timestamps.retrievedAt).sort((a, b) => b.timestamps.retrievedAt - a.timestamps.retrievedAt));
      }
    });
    return () => unsubscribe();
  }, []);

  const formatDateTime = (timestamp) => {
    if (!timestamp) return { date: '-', time: '-' };
    const dateObj = new Date(timestamp);
    return { date: dateObj.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }), time: dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) };
  };

  const occupiedSpots = parkedCars.map(t => t.parkingSpot);

  // --- Editor Functions using Custom Confirm ---
  const handleSaveMap = async () => {
    setConfirmConfig({
      isOpen: true,
      title: "Save Floor Plan",
      message: "Are you sure you want to push these changes to the live database? This will update the interactive map for all valets instantly.",
      isDanger: false,
      onConfirm: async () => {
        await set(ref(db, 'parkingMap'), editingMap);
        setConfirmConfig({ ...confirmConfig, isOpen: false });
      },
      onCancel: () => setConfirmConfig({ ...confirmConfig, isOpen: false })
    });
  };

  const moveZone = (index, direction) => {
    const newMap = [...editingMap];
    if (direction === 'up' && index > 0) {
      [newMap[index - 1], newMap[index]] = [newMap[index], newMap[index - 1]];
    } else if (direction === 'down' && index < newMap.length - 1) {
      [newMap[index + 1], newMap[index]] = [newMap[index], newMap[index + 1]];
    }
    setEditingMap(newMap);
  };

  const addZone = () => {
    let nextZoneName = "Zone A";
    if (editingMap.length > 0) {
      const lastZone = editingMap[editingMap.length - 1].zone.trim();
      const match = lastZone.match(/^(Zone\s+)([A-Y])$/i); 
      if (match) {
        const nextLetter = String.fromCharCode(match[2].charCodeAt(0) + 1);
        nextZoneName = match[1] + nextLetter;
      } else {
        nextZoneName = lastZone + " (New)";
      }
    }
    setEditingMap([...editingMap, { zone: nextZoneName, spots: [] }]);
  };

  const removeZone = (index) => {
    setConfirmConfig({
      isOpen: true,
      title: "Delete Zone",
      message: "Are you sure you want to delete this entire zone? All parking spots inside this zone will be permanently lost.",
      isDanger: true,
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
      isOpen: true,
      title: "Remove Spot",
      message: "Are you sure you want to delete this parking spot from the floor plan?",
      isDanger: true,
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
    
    while (newMap[zoneIdx].spots.includes(newSpotName)) {
      newNum++;
      newSpotName = `${prefix}-${newNum}`;
    }
    
    newMap[zoneIdx].spots.push(newSpotName);
    setEditingMap(newMap);
  };

  return (
    <div className="app-container">
      <div className="dashboard-wrapper">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <h1 className="heading-dashboard">Management Overview</h1>
            <button onClick={() => signOut(auth)} className="btn-outline" style={{fontSize: '0.85rem', padding: '8px 16px'}}>Logout</button>
          </div>
          <button onClick={() => setShowLogModal(true)} className="btn-gold" style={{width: 'auto', padding: '12px 32px'}}>+ Log Arrival</button>
        </div>

        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', overflowX: 'auto', paddingBottom: '8px' }}>
          <button className={activeTab === 'parked' ? 'btn-gold' : 'btn-outline'} onClick={() => setActiveTab('parked')} style={{ padding: '12px 28px', whiteSpace: 'nowrap' }}>
            Currently Parked ({parkedCars.length})
          </button>
          <button className={activeTab === 'metrics' ? 'btn-gold' : 'btn-outline'} onClick={() => setActiveTab('metrics')} style={{ padding: '12px 28px', whiteSpace: 'nowrap' }}>
            Performance Metrics
          </button>
          <button className={activeTab === 'map' ? 'btn-gold' : 'btn-outline'} onClick={() => setActiveTab('map')} style={{ padding: '12px 28px', whiteSpace: 'nowrap' }}>
            Visual Map Editor
          </button>
        </div>

        <div className="queue-column">
          <h2 className="queue-title">
            {activeTab === 'parked' ? 'Active Lot Inventory' : activeTab === 'metrics' ? 'Retrieval Time History' : 'Live Floor Plan Editor'}
          </h2>
          
          <div style={{ overflowX: 'auto' }}>
            {activeTab !== 'map' ? (
              <table className="luxury-table animate-slide-up">
                {activeTab === 'parked' && (
                  <>
                    <thead><tr><th>Vehicle</th><th>Plate</th><th>Phone</th><th>Spot</th><th>Arrival Date</th><th>Parked Time</th></tr></thead>
                    <tbody>
                      {parkedCars.map(t => {
                        const { date, time } = formatDateTime(t.timestamps?.parkedAt);
                        return (
                          <tr key={t.id}>
                            <td style={{ color: '#fff', fontWeight: '500' }}>{t.vehicle.make} {t.vehicle.model}</td>
                            <td>{t.vehicle.licensePlate}</td>
                            <td style={{ color: 'var(--text-muted)' }}>{t.guestPhone || '-'}</td>
                            <td style={{ color: 'var(--accent-gold)', fontWeight: '600' }}>{t.parkingSpot}</td>
                            <td>{date}</td><td>{time}</td>
                          </tr>
                        );
                      })}
                      {parkedCars.length === 0 && <tr><td colSpan="6" style={{textAlign: 'center', padding: '48px', color: 'var(--text-muted)'}}>Lot is completely empty.</td></tr>}
                    </tbody>
                  </>
                )}

                {activeTab === 'metrics' && (
                  <>
                    <thead><tr><th>Vehicle</th><th>Plate</th><th>Phone</th><th>Arrival Date</th><th>Retrieval Time</th></tr></thead>
                    <tbody>
                      {history.map(t => {
                        const { date } = formatDateTime(t.timestamps?.parkedAt);
                        const ms = t.timestamps.retrievedAt - t.timestamps.requestedAt;
                        const mins = Math.floor(ms / 60000);
                        const secs = ((ms % 60000) / 1000).toFixed(0);
                        return (
                          <tr key={t.id}>
                            <td style={{ color: '#fff', fontWeight: '500' }}>{t.vehicle.make} {t.vehicle.model}</td>
                            <td>{t.vehicle.licensePlate}</td>
                            <td style={{ color: 'var(--text-muted)' }}>{t.guestPhone || '-'}</td>
                            <td>{date}</td>
                            <td style={{ color: mins > 5 ? 'var(--danger-red)' : 'var(--accent-gold)', fontWeight: '600' }}>{mins}m {secs}s</td>
                          </tr>
                        );
                      })}
                      {history.length === 0 && <tr><td colSpan="5" style={{textAlign: 'center', padding: '48px', color: 'var(--text-muted)'}}>No completed retrieval data.</td></tr>}
                    </tbody>
                  </>
                )}
              </table>
            ) : (
              
              /* VISUAL MAP EDITOR TAB */
              <div style={{maxWidth: '1000px', margin: '0 auto'}}>
                <p style={{color: 'var(--text-muted)', marginBottom: '32px', fontSize: '1rem'}}>Changes made here will instantly update the interactive floor map for all valets. Tap a spot to rename it.</p>
                
                {editingMap.map((section, idx) => (
                  <div key={idx} className="editor-card" style={{ animationDelay: `${idx * 0.1}s` }}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px'}}>
                      <input 
                        type="text" 
                        value={section.zone} 
                        onChange={(e) => {
                          const newMap = [...editingMap];
                          newMap[idx].zone = e.target.value;
                          setEditingMap(newMap);
                        }} 
                        className="luxury-input" 
                        style={{width: '60%', marginBottom: 0, fontSize: '1.35rem', color: 'var(--accent-gold)', fontFamily: 'var(--font-heading)', background: 'transparent', border: 'none', borderBottom: '1px solid var(--card-border)', padding: '8px 0', borderRadius: '0'}} 
                      />
                      <div style={{display: 'flex', gap: '12px'}}>
                        <button onClick={() => moveZone(idx, 'up')} disabled={idx === 0} className="btn-outline" style={{padding: '8px 16px'}}>↑</button>
                        <button onClick={() => moveZone(idx, 'down')} disabled={idx === editingMap.length - 1} className="btn-outline" style={{padding: '8px 16px'}}>↓</button>
                        <button onClick={() => removeZone(idx)} className="btn-action" style={{padding: '8px 16px', width: 'auto'}}>Delete Zone</button>
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
                  <button onClick={handleSaveMap} className="btn-gold" style={{flex: 2, padding: '16px', fontSize: '1.05rem'}}>Save Floor Plan to Live Database</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {showLogModal && <LogArrivalModal onClose={() => setShowLogModal(false)} venueId="venue_001" parkingMap={parkingMap} occupiedSpots={occupiedSpots} />}
      
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
    styleSheet.innerText = luxuryStyles;
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

  if (authLoading) return <div className="app-container center-wrapper"><div className="animate-pulse" style={{color: 'var(--accent-gold)', letterSpacing: '2px'}}>AUTHENTICATING...</div></div>;
  if (isGuest) return <GuestTicketView ticketId={requestedTicketId} />;
  if (!userRole) return <LoginView />;
  if (userRole === "master_admin") return <MasterAdminView parkingMap={globalParkingMap} />;
  return <ValetDashboardView parkingMap={globalParkingMap} />;
}

export default App;