import { useState, useEffect, useRef } from 'react';
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

  body { margin: 0; background-color: var(--bg-color); color: var(--text-main); font-family: var(--font-ui); -webkit-font-smoothing: antialiased; }
  .app-container { min-height: 100vh; display: flex; flex-direction: column; padding: 24px; box-sizing: border-box; }
  .center-wrapper { display: flex; justify-content: center; align-items: center; min-height: calc(100vh - 48px); }
  .dashboard-wrapper { max-width: 1200px; margin: 0 auto; width: 100%; }

  .luxury-card { background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 12px; padding: 32px; width: 100%; max-width: 420px; box-shadow: 0 20px 40px rgba(0,0,0,0.5); text-align: center; }
  .heading-brand { font-family: var(--font-heading); color: var(--accent-gold); font-size: 1.75rem; font-weight: 600; margin: 0 0 24px 0; letter-spacing: 1px; }
  .heading-dashboard { font-family: var(--font-heading); color: var(--text-main); font-size: 2rem; margin: 0; font-weight: 400; letter-spacing: 0.5px; }

  .btn-gold { background: var(--accent-gold); color: #000; border: none; padding: 16px 24px; border-radius: 4px; font-size: 1.1rem; font-weight: 600; width: 100%; cursor: pointer; transition: all 0.3s ease; text-transform: uppercase; letter-spacing: 1px; }
  .btn-gold:hover:not(:disabled) { background: var(--accent-gold-hover); transform: translateY(-2px); }
  .btn-gold:disabled { background: #333; color: #666; cursor: not-allowed; }
  
  .btn-outline { background: transparent; color: var(--text-main); border: 1px solid var(--card-border); padding: 10px 20px; border-radius: 4px; font-weight: 500; cursor: pointer; transition: all 0.2s ease; }
  .btn-outline:hover { background: rgba(255,255,255,0.05); border-color: var(--text-muted); }
  
  .btn-action { background: #450a0a; color: #fca5a5; border: 1px solid #7f1d1d; padding: 12px; border-radius: 4px; width: 100%; font-weight: 600; cursor: pointer; transition: all 0.2s; }
  .btn-action:hover { background: #7f1d1d; color: #fff; }

  .luxury-input { background: #000; border: 1px solid var(--card-border); color: var(--text-main); padding: 14px; width: 100%; border-radius: 4px; box-sizing: border-box; font-family: var(--font-ui); font-size: 1rem; }
  .luxury-input:focus { outline: none; border-color: var(--accent-gold); }
  .luxury-input[readonly] { cursor: pointer; background: #1a1a1a; }
  
  .autocomplete-container { position: relative; width: 100%; margin-bottom: 16px; }
  .autocomplete-dropdown { position: absolute; top: calc(100% + 4px); left: 0; right: 0; background: #1a1a1a; border: 1px solid var(--accent-gold); border-radius: 4px; max-height: 200px; overflow-y: auto; z-index: 9999; box-shadow: 0 10px 25px rgba(0,0,0,0.8); list-style: none; padding: 0; margin: 0; text-align: left; }
  .autocomplete-item { padding: 12px 16px; cursor: pointer; color: var(--text-main); border-bottom: 1px solid var(--card-border); transition: background 0.2s; font-size: 0.95rem; }
  .autocomplete-item:hover { background: #262626; color: var(--accent-gold); }

  /* Parking Grid Styles */
  .parking-map { display: grid; grid-template-columns: repeat(auto-fill, minmax(70px, 1fr)); gap: 12px; margin-top: 16px; max-height: 50vh; overflow-y: auto; padding-right: 8px; }
  .spot-box { padding: 16px 4px; border-radius: 6px; text-align: center; font-size: 0.85rem; font-weight: bold; border: 1px solid var(--card-border); transition: all 0.2s; box-sizing: border-box; }
  .spot-empty { background: rgba(20, 83, 45, 0.15); color: #86efac; border-color: #14532d; cursor: pointer; }
  .spot-empty:hover { background: #14532d; color: #fff; transform: scale(1.05); }
  .spot-occupied { background: rgba(127, 29, 29, 0.15); color: #fca5a5; border-color: #7f1d1d; cursor: not-allowed; opacity: 0.7; }
  .zone-title { width: 100%; grid-column: 1 / -1; margin: 16px 0 8px 0; color: var(--accent-gold); font-family: var(--font-heading); font-size: 1.25rem; border-bottom: 1px solid var(--card-border); padding-bottom: 8px;}

  /* Map Editor Specific Styles */
  .spot-edit-input { background: #1a1a1a; color: var(--accent-gold); border: 1px dashed var(--accent-gold); text-align: center; border-radius: 6px; padding: 16px 4px; font-size: 0.85rem; font-weight: bold; width: 100%; box-sizing: border-box; font-family: var(--font-ui); transition: all 0.2s;}
  .spot-edit-input:focus { outline: none; background: #262626; border-style: solid; }
  .spot-delete-btn { position: absolute; top: -6px; right: -6px; background: var(--danger-red); color: white; border: none; border-radius: 50%; width: 22px; height: 22px; font-size: 12px; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; z-index: 10; box-shadow: 0 2px 4px rgba(0,0,0,0.5); transition: transform 0.2s;}
  .spot-delete-btn:hover { transform: scale(1.15); background: #991b1b; }
  .spot-add-btn { background: rgba(197, 160, 89, 0.05); color: var(--accent-gold); border: 1px dashed var(--accent-gold); cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; border-radius: 6px; min-height: 49px; transition: all 0.2s; box-sizing: border-box;}
  .spot-add-btn:hover { background: var(--accent-gold); color: #000; border-style: solid;}

  .dashboard-grid { display: grid; grid-template-columns: 1fr; gap: 32px; margin-top: 32px; }
  @media (min-width: 768px) { .dashboard-grid { grid-template-columns: 1fr 1fr; } }
  .queue-column { background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 8px; padding: 24px; }
  .queue-title { font-family: var(--font-heading); font-size: 1.5rem; margin: 0 0 20px 0; padding-bottom: 16px; border-bottom: 1px solid var(--card-border); }
  .status-box { background: #000; border: 1px solid var(--card-border); padding: 20px; border-radius: 6px; margin-bottom: 32px; }
  .ticket-card { background: #000; border: 1px solid var(--card-border); padding: 20px; border-radius: 6px; margin-bottom: 16px; display: flex; flex-direction: column; gap: 8px; }
  .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0.85); backdrop-filter: blur(4px); display: flex; justify-content: center; align-items: center; z-index: 1000; padding: 20px; }
  
  .luxury-table { width: 100%; border-collapse: collapse; text-align: left; }
  .luxury-table th { padding: 16px; border-bottom: 1px solid var(--card-border); color: var(--text-muted); font-weight: 500; }
  .luxury-table td { padding: 16px; border-bottom: 1px solid var(--card-border); }
  .editor-card { background: #000; border: 1px solid var(--card-border); padding: 20px; border-radius: 8px; margin-bottom: 24px; }
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
  { label: "🇨🇭 Switzerland (+41)", value: "+41" }, { label: "🇳🇱 Netherlands (+31)", value: "+31" }, { label: "🇧🇪 Belgium (+32)", value: "+32" }, { label: "🇸🇪 Sweden (+46)", value: "+46" },
  { label: "🇷🇺 Russia (+7)", value: "+7" }, { label: "🇮🇳 India (+91)", value: "+91" }, { label: "🇨🇳 China (+86)", value: "+86" }, { label: "🇯🇵 Japan (+81)", value: "+81" },
  { label: "🇰🇷 South Korea (+82)", value: "+82" }, { label: "🇦🇺 Australia (+61)", value: "+61" }, { label: "🇳🇿 New Zealand (+64)", value: "+64" }, { label: "🇧🇷 Brazil (+55)", value: "+55" },
  { label: "🇲🇽 Mexico (+52)", value: "+52" }, { label: "🇿🇦 South Africa (+27)", value: "+27" }, { label: "🇹🇷 Turkey (+90)", value: "+90" }, { label: "🇬🇷 Greece (+30)", value: "+30" },
  { label: "🇵🇹 Portugal (+351)", value: "+351" }, { label: "🇦🇹 Austria (+43)", value: "+43" }, { label: "🇮🇪 Ireland (+353)", value: "+353" }, { label: "🇵🇱 Poland (+48)", value: "+48" }
];

const DEFAULT_PARKING_MAP = [
  { zone: 'VIP Front', spots: Array.from({length: 12}, (_, i) => `VIP-${i + 1}`) },
  { zone: 'Zone A', spots: Array.from({length: 30}, (_, i) => `A-${i + 1}`) },
  { zone: 'Zone B', spots: Array.from({length: 30}, (_, i) => `B-${i + 1}`) }
];


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
      <div className="luxury-card" style={{width: '90%', maxWidth: isMapOpen ? '800px' : '420px', padding: '24px', maxHeight: '90vh', overflowY: 'visible', transition: 'max-width 0.3s'}}>
        
        {newlyCreatedTicket ? (
          <div>
            <h2 className="heading-brand" style={{color: 'var(--accent-gold)'}}>TICKET ACTIVE</h2>
            <div style={{background: '#fff', padding: '16px', borderRadius: '8px', display: 'inline-block', margin: '20px 0'}}>
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(`${currentDomain}/?ticket=${newlyCreatedTicket}`)}`} alt="QR Code" style={{display: 'block'}} />
            </div>
            <button onClick={onClose} className="btn-outline" style={{width: '100%'}}>Return to Dashboard</button>
          </div>
        ) : isMapOpen ? (
          <div style={{textAlign: 'left'}}>
            <h2 className="heading-brand" style={{color: '#fff', fontSize: '1.5rem', marginBottom: '8px'}}>SELECT PARKING SPOT</h2>
            <p style={{color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '16px'}}>Tap an empty green spot to assign it.</p>
            
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
            <button onClick={() => setIsMapOpen(false)} className="btn-outline" style={{width: '100%', marginTop: '24px'}}>Cancel Selection</button>
          </div>
        ) : (
          <form onSubmit={handleCreateTicket}>
            <h2 className="heading-brand" style={{color: '#fff', fontSize: '1.5rem', marginBottom: '16px'}}>LOG ARRIVAL</h2>
            
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px'}}>
              <LuxuryAutocomplete options={availableMakes} value={formData.make} onChange={(val) => setFormData({...formData, make: val, model: ''})} placeholder="Search Make" isObject={false} />
              <LuxuryAutocomplete options={availableModels} value={formData.model} onChange={(val) => setFormData({...formData, model: val})} placeholder="Search Model" isObject={false} />
            </div>
            
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px'}}>
              <input required placeholder="Color" className="luxury-input" style={{marginBottom: '16px'}} value={formData.color} onChange={e => setFormData({...formData, color: e.target.value})} />
              <input required placeholder="License Plate" className="luxury-input" style={{marginBottom: '16px'}} value={formData.plate} onChange={e => setFormData({...formData, plate: e.target.value})} />
            </div>
            
            {/* The interactive spot selector */}
            <input 
              required 
              readOnly
              placeholder="Tap to Select Parking Spot" 
              className="luxury-input" 
              style={{marginBottom: '16px', textAlign: 'center', color: 'var(--accent-gold)', fontWeight: 'bold'}} 
              value={formData.spot} 
              onClick={() => setIsMapOpen(true)} 
            />
            
            <div style={{display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px', alignItems: 'start'}}>
              <LuxuryAutocomplete options={COUNTRY_CODES} value={formData.countryCode} onChange={(val) => setFormData({...formData, countryCode: val})} placeholder="+ Code" isObject={true} />
              <input required type="tel" placeholder="Phone Number" className="luxury-input" style={{marginBottom: '16px'}} value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
            </div>

            <div style={{display: 'flex', gap: '12px', marginTop: '8px'}}>
              <button type="submit" className="btn-gold">Generate Ticket</button>
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
          <p style={{ margin: 0, fontSize: '1.75rem', fontWeight: '600', color: status === 'parked' ? 'var(--accent-gold)' : '#f5f5f5' }}>
            {status.toUpperCase()}
          </p>
          {status === "parked" && <p style={{ margin: '12px 0 0 0', color: 'var(--text-muted)' }}>Spot: <span style={{color: '#fff'}}>{parkingSpot}</span></p>}
        </div>
        <button onClick={requestVehicle} disabled={isRequested} className="btn-gold">
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
      <div className="luxury-card">
        <h2 className="heading-brand" style={{color: '#fff'}}>STAFF PORTAL</h2>
        {error && <p style={{ color: '#ef4444', fontSize: '0.9rem', marginBottom: '16px' }}>{error}</p>}
        <form onSubmit={handleLogin}>
          <input type="email" placeholder="Staff Email" required className="luxury-input" style={{marginBottom: '16px'}} onChange={(e) => setEmail(e.target.value)} />
          <input type="password" placeholder="Password" required className="luxury-input" style={{marginBottom: '16px'}} onChange={(e) => setPassword(e.target.value)} />
          <button type="submit" className="btn-gold" style={{marginTop: '8px'}}>Authenticate</button>
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
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <h1 className="heading-dashboard">Live Queue</h1>
            <button onClick={() => signOut(auth)} className="btn-outline" style={{fontSize: '0.8rem'}}>Logout</button>
          </div>
          <button onClick={() => setShowLogModal(true)} className="btn-gold" style={{width: 'auto'}}>+ Log Arrival</button>
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
                <button onClick={() => markAsRetrieved(t.id)} className="btn-action" style={{marginTop: '12px'}}>Handed to Guest</button>
              </div>
            ))}
          </div>

          {/* PARKED QUEUE */}
          <div className="queue-column">
            <h2 className="queue-title" style={{ color: 'var(--text-main)' }}>Currently Parked ({parkedCars.length})</h2>
            {parkedCars.map(t => (
              <div key={t.id} className="ticket-card" style={{ borderLeft: '4px solid var(--card-border)' }}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                  <div>
                    <h3 style={{margin: '0 0 4px 0', fontSize: '1.1rem'}}>{t.vehicle.make} {t.vehicle.model}</h3>
                    <p style={{margin: '0', color: 'var(--text-muted)', fontSize: '0.9rem'}}>{t.vehicle.licensePlate}</p>
                  </div>
                  <div style={{color: 'var(--accent-gold)', fontWeight: '500', textAlign: 'right'}}>{t.parkingSpot}</div>
                </div>
                <button onClick={() => setQrModalTicket(t.id)} className="btn-outline" style={{marginTop: '12px', padding: '8px', fontSize: '0.85rem'}}>
                  Show QR Code
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showLogModal && <LogArrivalModal onClose={() => setShowLogModal(false)} venueId={currentVenueId} parkingMap={parkingMap} occupiedSpots={occupiedSpots} />}

      {qrModalTicket && (
        <div className="modal-overlay">
          <div className="luxury-card" style={{width: '90%'}}>
            <h2 className="heading-brand" style={{color: 'var(--accent-gold)'}}>DIGITAL TICKET</h2>
            <div style={{background: '#fff', padding: '16px', borderRadius: '8px', display: 'inline-block', margin: '20px 0'}}>
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(`${currentDomain}/?ticket=${qrModalTicket}`)}`} alt="QR Code" style={{display: 'block'}} />
            </div>
            <button onClick={() => setQrModalTicket(null)} className="btn-outline" style={{width: '100%'}}>Close</button>
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
  
  // Shared Arrival Modal for Admin
  const [showLogModal, setShowLogModal] = useState(false);
  
  // Map Editor State
  const [editingMap, setEditingMap] = useState([]);

  useEffect(() => {
    // Make a deep copy so we can edit freely before saving
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

  // --- Editor Functions ---
  const handleSaveMap = async () => {
    await set(ref(db, 'parkingMap'), editingMap);
    alert('Parking Floor Plan Live Updated Successfully');
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
    setEditingMap([...editingMap, { zone: 'New Zone', spots: [] }]);
  };

  const removeZone = (index) => {
    if(window.confirm("Are you sure you want to delete this entire zone?")) {
      const newMap = [...editingMap];
      newMap.splice(index, 1);
      setEditingMap(newMap);
    }
  };

  const updateSpotName = (zoneIdx, spotIdx, val) => {
    const newMap = [...editingMap];
    newMap[zoneIdx].spots[spotIdx] = val;
    setEditingMap(newMap);
  };

  const removeSpot = (zoneIdx, spotIdx) => {
    const newMap = [...editingMap];
    newMap[zoneIdx].spots.splice(spotIdx, 1);
    setEditingMap(newMap);
  };

  const addSpotToZone = (zoneIdx) => {
    const newMap = [...editingMap];
    const prefix = newMap[zoneIdx].zone.charAt(0).toUpperCase();
    newMap[zoneIdx].spots.push(`${prefix}-${newMap[zoneIdx].spots.length + 1}`);
    setEditingMap(newMap);
  };

  return (
    <div className="app-container">
      <div className="dashboard-wrapper">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
            <h1 className="heading-dashboard">Management Overview</h1>
            <button onClick={() => signOut(auth)} className="btn-outline" style={{fontSize: '0.8rem'}}>Logout</button>
          </div>
          <button onClick={() => setShowLogModal(true)} className="btn-gold" style={{width: 'auto'}}>+ Log Arrival</button>
        </div>

        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', overflowX: 'auto', paddingBottom: '8px' }}>
          <button className={activeTab === 'parked' ? 'btn-gold' : 'btn-outline'} onClick={() => setActiveTab('parked')} style={{ padding: '12px 24px', whiteSpace: 'nowrap' }}>
            Currently Parked ({parkedCars.length})
          </button>
          <button className={activeTab === 'metrics' ? 'btn-gold' : 'btn-outline'} onClick={() => setActiveTab('metrics')} style={{ padding: '12px 24px', whiteSpace: 'nowrap' }}>
            Performance Metrics
          </button>
          <button className={activeTab === 'map' ? 'btn-gold' : 'btn-outline'} onClick={() => setActiveTab('map')} style={{ padding: '12px 24px', whiteSpace: 'nowrap' }}>
            Visual Map Editor
          </button>
        </div>

        <div className="queue-column">
          <h2 className="queue-title">
            {activeTab === 'parked' ? 'Active Lot Inventory' : activeTab === 'metrics' ? 'Retrieval Time History' : 'Live Floor Plan Editor'}
          </h2>
          
          <div style={{ overflowX: 'auto' }}>
            {/* PARKED OR METRICS TABS */}
            {activeTab !== 'map' ? (
              <table className="luxury-table">
                {activeTab === 'parked' && (
                  <>
                    <thead><tr><th>Vehicle</th><th>Plate</th><th>Phone</th><th>Spot</th><th>Arrival Date</th><th>Parked Time</th></tr></thead>
                    <tbody>
                      {parkedCars.map(t => {
                        const { date, time } = formatDateTime(t.timestamps?.parkedAt);
                        return (
                          <tr key={t.id}>
                            <td style={{ color: '#fff' }}>{t.vehicle.make} {t.vehicle.model}</td>
                            <td>{t.vehicle.licensePlate}</td>
                            <td style={{ color: 'var(--text-muted)' }}>{t.guestPhone || '-'}</td>
                            <td style={{ color: 'var(--accent-gold)' }}>{t.parkingSpot}</td>
                            <td>{date}</td><td>{time}</td>
                          </tr>
                        );
                      })}
                      {parkedCars.length === 0 && <tr><td colSpan="6" style={{textAlign: 'center'}}>Lot is completely empty.</td></tr>}
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
                            <td style={{ color: '#fff' }}>{t.vehicle.make} {t.vehicle.model}</td>
                            <td>{t.vehicle.licensePlate}</td>
                            <td style={{ color: 'var(--text-muted)' }}>{t.guestPhone || '-'}</td>
                            <td>{date}</td>
                            <td style={{ color: mins > 5 ? '#fca5a5' : 'var(--accent-gold)' }}>{mins}m {secs}s</td>
                          </tr>
                        );
                      })}
                      {history.length === 0 && <tr><td colSpan="5" style={{textAlign: 'center'}}>No completed retrieval data.</td></tr>}
                    </tbody>
                  </>
                )}
              </table>
            ) : (
              
              /* VISUAL MAP EDITOR TAB */
              <div style={{maxWidth: '900px', margin: '0 auto'}}>
                <p style={{color: 'var(--text-muted)', marginBottom: '24px'}}>Changes made here will instantly update the interactive floor map for all valets. Tap a spot to rename it.</p>
                
                {editingMap.map((section, idx) => (
                  <div key={idx} className="editor-card">
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px'}}>
                      <input 
                        type="text" 
                        value={section.zone} 
                        onChange={(e) => {
                          const newMap = [...editingMap];
                          newMap[idx].zone = e.target.value;
                          setEditingMap(newMap);
                        }} 
                        className="luxury-input" 
                        style={{width: '60%', marginBottom: 0, fontSize: '1.25rem', color: 'var(--accent-gold)'}} 
                      />
                      <div style={{display: 'flex', gap: '8px'}}>
                        <button onClick={() => moveZone(idx, 'up')} disabled={idx === 0} className="btn-outline" style={{padding: '8px 12px'}}>↑</button>
                        <button onClick={() => moveZone(idx, 'down')} disabled={idx === editingMap.length - 1} className="btn-outline" style={{padding: '8px 12px'}}>↓</button>
                        <button onClick={() => removeZone(idx)} className="btn-action" style={{padding: '8px 12px', width: 'auto'}}>X</button>
                      </div>
                    </div>
                    
                    {/* VISUAL SPOT GRID (Replaces the textarea) */}
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

                <div style={{display: 'flex', gap: '16px', marginTop: '32px'}}>
                  <button onClick={addZone} className="btn-outline" style={{flex: 1}}>+ Add New Zone</button>
                  <button onClick={handleSaveMap} className="btn-gold" style={{flex: 2}}>Save Floor Plan to Live Database</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {showLogModal && <LogArrivalModal onClose={() => setShowLogModal(false)} venueId="venue_001" parkingMap={parkingMap} occupiedSpots={occupiedSpots} />}
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

    // Listen for Auth Role
    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        const snapshot = await get(ref(db, `users/${currentUser.uid}`));
        setUserRole(snapshot.exists() ? snapshot.val().role : "valet_runner");
      } else {
        setUserRole(null);
      }
      setAuthLoading(false);
    });

    // Listen for global parking map changes
    const unsubscribeMap = onValue(ref(db, 'parkingMap'), (snapshot) => {
      if (snapshot.exists()) {
        setGlobalParkingMap(snapshot.val());
      } else {
        // Seed default map if database is empty
        set(ref(db, 'parkingMap'), DEFAULT_PARKING_MAP);
        setGlobalParkingMap(DEFAULT_PARKING_MAP);
      }
    });

    return () => { unsubscribeAuth(); unsubscribeMap(); document.head.removeChild(styleSheet); };
  }, [requestedTicketId]);

  if (authLoading) return <div className="app-container center-wrapper">Authenticating...</div>;
  if (isGuest) return <GuestTicketView ticketId={requestedTicketId} />;
  if (!userRole) return <LoginView />;
  if (userRole === "master_admin") return <MasterAdminView parkingMap={globalParkingMap} />;
  return <ValetDashboardView parkingMap={globalParkingMap} />;
}

export default App;