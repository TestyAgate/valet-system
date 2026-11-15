import { useState, useEffect, useRef } from 'react';
import { db, auth } from './firebase';
import { ref, onValue, update, set, get } from 'firebase/database';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } from 'firebase/auth';

// ------------------------------------------------------------------
// INJECTED CSS FOR VIBRANT, ENERGETIC APP UI
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
  }

  body { margin: 0; background-color: var(--bg-color); color: var(--text-main); font-family: var(--font-ui); -webkit-font-smoothing: antialiased; overflow-x: hidden; }
  .app-container { min-height: 100vh; display: flex; flex-direction: column; padding: 24px; box-sizing: border-box; }
  .center-wrapper { display: flex; justify-content: center; align-items: center; min-height: calc(100vh - 48px); }
  .dashboard-wrapper { max-width: 1400px; margin: 0 auto; width: 100%; animation: fadeIn 0.4s ease-out; }

  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
  
  .animate-slide-up { animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
  .animate-scale-in { animation: scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }

  .vibrant-card { background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 20px; padding: 32px; width: 100%; max-width: 420px; box-shadow: 0 10px 40px rgba(0,0,0,0.05); text-align: center; position: relative; overflow: hidden; }
  
  .heading-brand { color: var(--text-main); font-size: 2rem; font-weight: 800; margin: 0 0 8px 0; letter-spacing: -0.5px; }
  .heading-dashboard { color: var(--text-main); font-size: 2.25rem; margin: 0; font-weight: 700; letter-spacing: -1px; }

  .btn-green { background: var(--accent-green); color: #fff; border: none; padding: 16px 24px; border-radius: 12px; font-size: 1.1rem; font-weight: 700; width: 100%; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 15px rgba(16, 185, 129, 0.3); }
  .btn-green:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4); background: var(--accent-green-hover); }
  .btn-green:disabled { background: #cbd5e1; color: #64748b; box-shadow: none; cursor: not-allowed; }
  
  .btn-purple { background: var(--draft-purple); color: #fff; border: none; padding: 16px 24px; border-radius: 12px; font-size: 1.1rem; font-weight: 700; width: 100%; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 15px rgba(139, 92, 246, 0.3); }
  .btn-purple:hover { transform: translateY(-2px); filter: brightness(1.1); }
  
  .btn-action { background: #fee2e2; color: var(--danger-red); border: none; padding: 12px; border-radius: 12px; font-weight: 700; cursor: pointer; transition: all 0.2s; }
  .btn-action:hover { background: var(--danger-red); color: white; transform: translateY(-1px); }

  .btn-outline { background: transparent; color: var(--text-main); border: 2px solid var(--card-border); padding: 12px 20px; border-radius: 12px; font-weight: 600; cursor: pointer; transition: all 0.2s ease; }
  .btn-outline:hover { background: #f1f5f9; border-color: #cbd5e1; }
  
  .vibrant-input { background: #f8fafc; border: 2px solid var(--card-border); color: var(--text-main); padding: 16px; width: 100%; border-radius: 12px; box-sizing: border-box; font-family: var(--font-ui); font-size: 1rem; font-weight: 500; transition: all 0.2s ease; }
  .vibrant-input:focus { outline: none; border-color: var(--accent-green); background: #fff; box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.1); }
  
  .autocomplete-container { position: relative; width: 100%; margin-bottom: 16px; }
  .autocomplete-dropdown { position: absolute; top: calc(100% + 8px); left: 0; right: 0; background: #fff; border: 2px solid var(--accent-green); border-radius: 12px; max-height: 220px; overflow-y: auto; z-index: 9999; box-shadow: 0 10px 30px rgba(0,0,0,0.1); list-style: none; padding: 8px; margin: 0; text-align: left; }
  .autocomplete-item { padding: 12px 16px; cursor: pointer; color: var(--text-main); border-radius: 8px; font-weight: 500; }
  .autocomplete-item:hover { background: rgba(16, 185, 129, 0.1); color: var(--accent-green); }

  /* Map Editor & Spot Selector Styles */
  .parking-map { display: grid; grid-template-columns: repeat(auto-fill, minmax(70px, 1fr)); gap: 12px; margin-top: 16px; max-height: 50vh; overflow-y: auto; padding-right: 8px; }
  .spot-box { padding: 16px 4px; border-radius: 10px; text-align: center; font-size: 0.85rem; font-weight: 700; border: 2px solid var(--card-border); transition: all 0.2s; box-sizing: border-box; }
  .spot-empty { background: #ecfdf5; color: var(--accent-green); border-color: #a7f3d0; cursor: pointer; }
  .spot-empty:hover { background: var(--accent-green); color: #fff; transform: scale(1.05); border-color: var(--accent-green); }
  .spot-occupied { background: #fef2f2; color: var(--danger-red); border-color: #fecaca; cursor: not-allowed; opacity: 0.7; }
  .zone-title { width: 100%; grid-column: 1 / -1; margin: 16px 0 8px 0; color: var(--text-main); font-weight: 800; font-size: 1.25rem; padding-bottom: 8px; border-bottom: 2px solid var(--card-border);}

  .editor-card { background: #fff; border: 1px solid var(--card-border); padding: 24px; border-radius: 16px; margin-bottom: 24px; box-shadow: 0 4px 6px rgba(0,0,0,0.02); }
  .spot-edit-input { background: #f8fafc; color: var(--text-main); border: 2px dashed #cbd5e1; text-align: center; border-radius: 10px; padding: 16px 4px; font-size: 0.85rem; font-weight: 700; width: 100%; box-sizing: border-box; font-family: var(--font-ui); transition: all 0.2s;}
  .spot-edit-input:focus { outline: none; background: #fff; border-style: solid; border-color: var(--accent-green); }
  .spot-delete-btn { position: absolute; top: -6px; right: -6px; background: var(--danger-red); color: white; border: none; border-radius: 50%; width: 24px; height: 24px; font-size: 12px; font-weight: bold; cursor: pointer; display: flex; align-items: center; justify-content: center; z-index: 10; box-shadow: 0 2px 4px rgba(0,0,0,0.2); transition: transform 0.2s; opacity: 0;}
  div[style*="position: relative"]:hover .spot-delete-btn { opacity: 1; }
  .spot-delete-btn:hover { transform: scale(1.15); background: #b91c1c; }
  .spot-add-btn { background: #f1f5f9; color: var(--text-muted); border: 2px dashed #cbd5e1; cursor: pointer; display: flex; align-items: center; justify-content: center; font-size: 1.5rem; border-radius: 10px; min-height: 52px; transition: all 0.2s; box-sizing: border-box;}
  .spot-add-btn:hover { background: #e2e8f0; color: var(--text-main); border-style: solid;}
  
  .editor-zone-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; gap: 16px; }
  .editor-zone-input { width: 60%; margin-bottom: 0 !important; font-size: 1.35rem; color: var(--text-main); font-weight: 800; background: transparent; border: none; border-bottom: 2px solid var(--card-border); padding: 8px 0; border-radius: 0; }
  .editor-zone-input:focus { outline: none; border-color: var(--accent-green); background: transparent; box-shadow: none; }
  .editor-zone-actions { display: flex; gap: 12px; }

  @media (max-width: 768px) {
    .editor-zone-header { flex-direction: column; align-items: stretch; gap: 16px; }
    .editor-zone-input { width: 100%; text-align: center; }
    .editor-zone-actions { flex-wrap: wrap; }
    .editor-zone-actions > button { flex: 1; }
  }

  .dashboard-grid { display: grid; grid-template-columns: 1fr; gap: 24px; margin-top: 32px; align-items: start; }
  @media (min-width: 1024px) { .dashboard-grid { grid-template-columns: 1fr 1fr 1fr 1fr; } }
  
  .queue-title { font-size: 1.35rem; margin: 0 0 20px 0; font-weight: 800; color: var(--text-main); }
  
  .ticket-card { background: #fff; border: 1px solid var(--card-border); padding: 20px; border-radius: 16px; margin-bottom: 16px; display: flex; flex-direction: column; gap: 12px; transition: all 0.2s ease; box-shadow: 0 4px 6px rgba(0,0,0,0.02); }
  .ticket-card:hover { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(0,0,0,0.05); }
  
  .status-badge { display: inline-block; padding: 6px 12px; border-radius: 20px; font-size: 0.85rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; width: fit-content; }
  .status-draft { background: #f3e8ff; color: var(--draft-purple); border: 1px solid #d8b4fe; }
  .status-parked { background: #f1f5f9; color: #475569; }
  .status-requested { background: #fef2f2; color: var(--danger-red); border: 1px solid #fecaca; }
  .status-incoming { background: #fffbeb; color: var(--warning-yellow); border: 1px solid #fde68a; }
  .status-ready { background: #ecfdf5; color: var(--accent-green); border: 1px solid #a7f3d0; }

  .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(8px); display: flex; justify-content: center; align-items: center; z-index: 1000; padding: 20px; animation: fadeIn 0.2s ease-out; overflow-y: auto;}
  
  .contact-bar { display: flex; gap: 12px; margin-top: 16px; }
  .btn-contact { flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px; padding: 12px; border-radius: 12px; font-weight: 700; text-decoration: none; font-size: 0.95rem; transition: transform 0.2s; }
  .btn-contact:hover { transform: translateY(-2px); }
  .btn-whatsapp { background: #25D366; color: white; }
  .btn-phone { background: #f1f5f9; color: var(--text-main); }
  
  .luxury-table { width: 100%; border-collapse: collapse; text-align: left; font-size: 0.95rem; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px rgba(0,0,0,0.02); }
  .luxury-table th { padding: 16px; border-bottom: 2px solid var(--card-border); color: var(--text-muted); font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; font-size: 0.85rem; background: #f8fafc;}
  .luxury-table td { padding: 20px 16px; border-bottom: 1px solid var(--card-border); }
`;

// ------------------------------------------------------------------
// MASSIVE GLOBAL CAR DATABASE
// ------------------------------------------------------------------
const CAR_DATABASE = {
  "Abarth": ["595", "695", "124 Spider"],
  "Acura": ["MDX", "RDX", "TLX", "Integra", "NSX"],
  "Alfa Romeo": ["Giulia", "Stelvio", "Tonale"],
  "Alpine": ["A110"],
  "Aston Martin": ["DBX", "Vantage", "DB11", "DBS", "Valhalla"],
  "Audi": ["A1", "A3", "A4", "A5", "A6", "A7", "A8", "Q2", "Q3", "Q4", "Q5", "Q7", "Q8", "RS Models", "e-tron", "R8"],
  "BAIC": ["BJ40", "BJ80", "X35", "X55"],
  "Bentley": ["Bentayga", "Continental GT", "Flying Spur"],
  "BMW": ["1-Series", "2-Series", "3-Series", "4-Series", "5-Series", "6-Series", "7-Series", "8-Series", "X1", "X2", "X3", "X4", "X5", "X6", "X7", "M Models", "i-Series"],
  "Bugatti": ["Chiron", "Veyron", "Bolide", "Tourbillon"],
  "Buick": ["Enclave", "Encore", "Envision"],
  "BYD": ["Atto 3", "Seal", "Dolphin", "Han", "Tang", "Song"],
  "Cadillac": ["Escalade", "CT4", "CT5", "XT4", "XT5", "XT6", "Lyriq"],
  "Changan": ["CS35", "CS75", "CS85", "CS95", "UNI-T", "UNI-K"],
  "Chery": ["Tiggo 2", "Tiggo 4", "Tiggo 7", "Tiggo 8", "Arrizo"],
  "Chevrolet": ["Tahoe", "Suburban", "Corvette", "Camaro", "Silverado", "Equinox", "Trax", "Blazer"],
  "Chrysler": ["300", "Pacifica"],
  "Citroen": ["C3", "C4", "C5 Aircross", "Berlingo"],
  "Cupra": ["Formentor", "Leon", "Ateca", "Born", "Tavascan"],
  "Dacia": ["Duster", "Sandero", "Logan", "Jogger"],
  "Daihatsu": ["Terios", "Sirion"],
  "Dodge": ["Charger", "Challenger", "Durango", "Ram"],
  "Dongfeng": ["Glory", "AX7"],
  "DS Automobiles": ["DS 3", "DS 4", "DS 7", "DS 9"],
  "Exeed": ["LX", "TXL", "VX"],
  "Ferrari": ["Roma", "F8", "SF90", "Purosangue", "812", "296", "Daytona SP3"],
  "Fiat": ["500", "Panda", "Tipo", "Ducato"],
  "Ford": ["Mustang", "Explorer", "Expedition", "F-150", "Bronco", "Escape", "Focus", "Edge"],
  "GAC": ["GS3", "GS4", "GS8", "GA4"],
  "Geely": ["Coolray", "Azkarra", "Tugella", "Monjaro", "Emgrand"],
  "Genesis": ["G70", "G80", "G90", "GV60", "GV70", "GV80"],
  "GMC": ["Yukon", "Sierra", "Hummer EV", "Acadia", "Terrain"],
  "Great Wall (GWM)": ["Poer", "Wingle", "Tank 300", "Tank 500"],
  "Haval": ["Jolion", "H6", "Dargo", "H9"],
  "Honda": ["Accord", "Civic", "CR-V", "Pilot", "Odyssey", "HR-V", "City"],
  "Hongqi": ["H5", "H9", "HS5", "HS7", "E-HS9"],
  "Hyundai": ["Elantra", "Sonata", "Tucson", "Santa Fe", "Palisade", "Ioniq 5", "Ioniq 6", "Kona", "Creta"],
  "Infiniti": ["Q50", "QX50", "QX55", "QX60", "QX80"],
  "Isuzu": ["D-Max", "MU-X"],
  "JAC": ["J7", "JS4", "JS6", "T8"],
  "Jaguar": ["F-PACE", "E-PACE", "I-PACE", "F-TYPE", "XF"],
  "Jeep": ["Wrangler", "Grand Cherokee", "Wagoneer", "Compass", "Renegade", "Gladiator"],
  "Jetour": ["X70", "X90", "Dashing"],
  "Kia": ["Telluride", "Sportage", "Sorento", "K5", "EV6", "EV9", "Carnival", "Seltos", "Picanto"],
  "Koenigsegg": ["Jesko", "Gemera", "Regera", "CC850"],
  "Lamborghini": ["Urus", "Huracan", "Revuelto", "Aventador"],
  "Land Rover": ["Range Rover", "Range Rover Sport", "Defender", "Velar", "Discovery", "Evoque"],
  "Lexus": ["IS", "ES", "LS", "NX", "RX", "UX", "GX", "LX", "LC"],
  "Li Auto": ["L7", "L8", "L9"],
  "Lincoln": ["Navigator", "Aviator", "Corsair", "Nautilus"],
  "Lotus": ["Emira", "Eletre", "Evija", "Emeya"],
  "Lucid": ["Air", "Gravity"],
  "Lynk & Co": ["01", "03", "05", "09"],
  "Maserati": ["Ghibli", "Quattroporte", "Levante", "Grecale", "MC20", "GranTurismo"],
  "Maxus": ["D90", "T60", "V80"],
  "Mazda": ["Mazda3", "Mazda6", "CX-30", "CX-5", "CX-50", "CX-9", "CX-90", "MX-5 Miata"],
  "McLaren": ["750S", "Artura", "GT", "720S", "Senna", "P1"],
  "Mercedes-Benz": ["A-Class", "C-Class", "E-Class", "S-Class", "G-Class", "GLA", "GLC", "GLE", "GLS", "AMG GT", "EQE", "EQS"],
  "MG": ["MG5", "MG6", "MG RX5", "MG HS", "MG ZS", "MG One"],
  "MINI": ["Cooper", "Countryman", "Clubman"],
  "Mitsubishi": ["Outlander", "Eclipse Cross", "Pajero", "L200", "ASX", "Attrage"],
  "NIO": ["ES6", "ES8", "ET5", "ET7"],
  "Nissan": ["Altima", "Maxima", "Rogue/X-Trail", "Armada", "Patrol", "Pathfinder", "Sunny", "Kicks", "GT-R", "Z"],
  "Omoda": ["C5", "S5"],
  "Opel": ["Corsa", "Astra", "Mokka", "Crossland", "Grandland"],
  "Pagani": ["Huayra", "Utopia", "Zonda"],
  "Peugeot": ["208", "2008", "308", "3008", "508", "5008", "Landtrek"],
  "Polestar": ["Polestar 2", "Polestar 3", "Polestar 4"],
  "Porsche": ["911", "Taycan", "Panamera", "Macan", "Cayenne", "718 Boxster/Cayman"],
  "Ram": ["1500", "2500", "3500", "TRX"],
  "Renault": ["Clio", "Megane", "Captur", "Arkana", "Koleos", "Duster"],
  "Rivian": ["R1T", "R1S"],
  "Rolls-Royce": ["Cullinan", "Ghost", "Phantom", "Spectre", "Dawn"],
  "SEAT": ["Leon", "Ibiza", "Ateca", "Arona", "Tarraco"],
  "Skoda": ["Octavia", "Superb", "Kodiaq", "Karoq", "Kamiq", "Fabia"],
  "Smart": ["#1", "#3"],
  "SsangYong": ["Rexton", "Tivoli", "Korando", "Musso"],
  "Subaru": ["Outback", "Forester", "Crosstrek", "WRX", "BRZ"],
  "Suzuki": ["Jimny", "Swift", "Vitara", "Ertiga", "Baleno"],
  "Tank": ["300", "500"],
  "Tesla": ["Model S", "Model 3", "Model X", "Model Y", "Cybertruck"],
  "Toyota": ["Land Cruiser", "Camry", "Corolla", "RAV4", "Highlander", "Tacoma", "Tundra", "Supra", "Yaris", "Hilux", "Prado"],
  "Vauxhall": ["Corsa", "Astra", "Mokka"],
  "Volkswagen": ["Golf", "Passat", "Tiguan", "Touareg", "Polo", "ID.3", "ID.4", "ID.buzz", "Arteon", "Amarok"],
  "Volvo": ["XC40", "XC60", "XC90", "S60", "S90", "V60", "EX90", "EX30"],
  "Zeekr": ["001", "009", "X"]
};

const COUNTRY_CODES = [
  { label: "🇦🇪 UAE (+971)", value: "+971" }, { label: "🇮🇱 Israel (+972)", value: "+972" }, { label: "🇺🇸 USA/Canada (+1)", value: "+1" }, { label: "🇬🇧 UK (+44)", value: "+44" },
  { label: "🇸🇦 Saudi Arabia (+966)", value: "+966" }, { label: "🇶🇦 Qatar (+974)", value: "+974" }, { label: "🇰🇼 Kuwait (+965)", value: "+965" }, { label: "🇧🇭 Bahrain (+973)", value: "+973" },
  { label: "🇴🇲 Oman (+968)", value: "+968" }, { label: "🇯🇴 Jordan (+962)", value: "+962" }, { label: "🇪🇬 Egypt (+20)", value: "+20" }, { label: "🇱🇧 Lebanon (+961)", value: "+961" },
  { label: "🇫🇷 France (+33)", value: "+33" }, { label: "🇩🇪 Germany (+49)", value: "+49" }, { label: "🇮🇹 Italy (+39)", value: "+39" }, { label: "🇪🇸 Spain (+34)", value: "+34" }
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
        className="vibrant-input"
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
// SHARED LOG ARRIVAL MODAL (Used by Admin & Full Log Valet)
// ------------------------------------------------------------------
function LogArrivalModal({ onClose, venueId, parkingMap, occupiedSpots, knownPlates }) {
  const [newlyCreatedTicket, setNewlyCreatedTicket] = useState(null);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [formData, setFormData] = useState({ make: '', model: '', color: '', plate: '', spot: '', countryCode: '+971', phone: '' });

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
      vehicle: { make: formData.make, model: formData.model, color: formData.color, licensePlate: formData.plate.toUpperCase() },
      parkingSpot: formData.spot, status: "parked", parkedByUserId: auth.currentUser.uid,
      timestamps: { parkedAt: Date.now(), requestedAt: null, retrievedAt: null }
    });
    setNewlyCreatedTicket(ticketId);
  };

  const handlePlateBlur = (e) => {
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
            <div style={{background: '#fff', padding: '16px', borderRadius: '12px', display: 'inline-block', margin: '24px 0', border: '2px solid var(--card-border)'}}>
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
            <h2 className="heading-brand" style={{color: 'var(--text-main)', fontSize: '1.75rem', marginBottom: '24px'}}>LOG ARRIVAL</h2>
            
            <input required placeholder="License Plate (Auto-fills if known)" className="vibrant-input" style={{marginBottom: '16px', textTransform: 'uppercase', borderColor: 'var(--warning-yellow)'}} value={formData.plate} onChange={e => setFormData({...formData, plate: e.target.value})} onBlur={handlePlateBlur} />

            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
              <Autocomplete options={availableMakes} value={formData.make} onChange={(val) => setFormData({...formData, make: val, model: ''})} placeholder="Search or type Make" isObject={false} />
              <Autocomplete options={availableModels} value={formData.model} onChange={(val) => setFormData({...formData, model: val})} placeholder="Search or type Model" isObject={false} />
            </div>
            
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
              <input required placeholder="Color" className="vibrant-input" style={{marginBottom: '16px'}} value={formData.color} onChange={e => setFormData({...formData, color: e.target.value})} />
              <input 
                required 
                readOnly
                placeholder="Tap to Select Spot" 
                className="vibrant-input" 
                style={{marginBottom: '16px', textAlign: 'center', color: 'var(--accent-green)', fontWeight: '700', cursor: 'pointer', border: '2px solid var(--accent-green)'}} 
                value={formData.spot} 
                onClick={() => setIsMapOpen(true)} 
              />
            </div>
            
            <div style={{display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '16px', alignItems: 'start'}}>
              <Autocomplete options={COUNTRY_CODES} value={formData.countryCode} onChange={(val) => setFormData({...formData, countryCode: val})} placeholder="+ Code" isObject={true} />
              <input required type="tel" placeholder="Guest Phone" className="vibrant-input" style={{marginBottom: '24px'}} value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
            </div>

            <div style={{display: 'flex', gap: '16px'}}>
              <button type="submit" className="btn-green" style={{flex: 2}}>Generate Ticket</button>
              <button type="button" onClick={onClose} className="btn-outline" style={{flex: 1}}>Cancel</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// 1. GUEST VIEW COMPONENT (PUBLIC TRACKER)
// ------------------------------------------------------------------
function GuestTicketView({ ticketId }) {
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestDetails, setRequestDetails] = useState({ location: 'Main Entrance', wantsWash: false });

  useEffect(() => {
    const unsubscribe = onValue(ref(db, `tickets/${ticketId}`), (snapshot) => {
      if (snapshot.exists()) setTicket(snapshot.val());
      setLoading(false);
    });
    return () => unsubscribe();
  }, [ticketId]);

  const submitRequest = async () => {
    await update(ref(db, `tickets/${ticketId}`), { 
      status: "requested", 
      returnLocation: requestDetails.location,
      wantsWash: requestDetails.wantsWash,
      "timestamps/requestedAt": Date.now() 
    });
    setShowRequestModal(false);
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
        <div style={{background: 'var(--accent-green)', padding: '24px', margin: '-32px -32px 32px -32px', color: 'white'}}>
          <h2 style={{margin: 0, fontSize: '1.5rem', fontWeight: 800}}>SKY VALET</h2>
          <p style={{margin: '4px 0 0 0', opacity: 0.9, fontSize: '0.9rem', fontWeight: 500}}>Digital Parking Pass</p>
        </div>

        <h3 style={{fontSize: '1.75rem', fontWeight: 800, margin: '0 0 4px 0'}}>{vehicle?.make || 'Unknown'} {vehicle?.model || ''}</h3>
        <p style={{color: 'var(--text-muted)', fontSize: '1.1rem', margin: '0 0 24px 0', fontWeight: 600}}>{vehicle?.licensePlate || 'N/A'} • {vehicle?.color || 'N/A'}</p>

        <div style={{background: '#f8fafc', border: '2px solid #e2e8f0', borderRadius: '16px', padding: '24px', marginBottom: '24px'}}>
          <p style={{margin: '0 0 12px 0', fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px'}}>Live Status</p>
          {status === 'parked' && <h4 style={{margin: 0, fontSize: '1.75rem', color: '#0f172a', fontWeight: 800}}>Safely Parked</h4>}
          {status === 'requested' && <h4 style={{margin: 0, fontSize: '1.75rem', color: 'var(--danger-red)', fontWeight: 800}}>Preparing Vehicle...</h4>}
          {status === 'incoming' && <h4 style={{margin: 0, fontSize: '1.75rem', color: 'var(--warning-yellow)', fontWeight: 800}}>On the Way!</h4>}
          {status === 'ready' && <h4 style={{margin: 0, fontSize: '1.75rem', color: 'var(--accent-green)', fontWeight: 800}}>Ready at Door!</h4>}
          {status === 'parked' && <p style={{margin: '8px 0 0 0', fontSize: '0.95rem', color: 'var(--text-muted)', fontWeight: 600}}>Parked for {hoursParked}h {minsParked}m</p>}
        </div>

        <div style={{textAlign: 'left', marginBottom: '32px'}}>
          <p style={{margin: '0 0 8px 0', fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-muted)'}}>Your Valet: <span style={{color: 'var(--text-main)'}}>{parkedByName || 'Team Member'}</span></p>
          <div className="contact-bar">
            <a href={`https://wa.me/${parkedByPhone?.replace('+', '')}`} className="btn-contact btn-whatsapp" target="_blank" rel="noreferrer">💬 Chat</a>
            <a href={`tel:${parkedByPhone}`} className="btn-contact btn-phone">📞 Call</a>
          </div>
        </div>

        {status === 'parked' && (
          <button onClick={() => setShowRequestModal(true)} className="btn-green" style={{ padding: '20px' }}>
            Request My Vehicle
          </button>
        )}
      </div>

      {showRequestModal && (
        <div className="modal-overlay">
          <div className="vibrant-card animate-slide-up">
            <h3 style={{fontSize: '1.5rem', fontWeight: 800, margin: '0 0 24px 0'}}>Vehicle Return Details</h3>
            
            <p style={{textAlign: 'left', fontWeight: 600, marginBottom: '8px'}}>Deliver to:</p>
            <select className="vibrant-input" style={{marginBottom: '24px'}} value={requestDetails.location} onChange={(e) => setRequestDetails({...requestDetails, location: e.target.value})}>
              <option>Main Entrance</option>
              <option>Sky Address View</option>
              <option>Nearby Restaurant</option>
            </select>

            <label style={{display: 'flex', alignItems: 'center', gap: '12px', background: '#f8fafc', padding: '16px', borderRadius: '12px', marginBottom: '32px', cursor: 'pointer', fontWeight: 600, border: '2px solid var(--card-border)'}}>
              <input type="checkbox" style={{width: '20px', height: '20px', accentColor: 'var(--accent-green)'}} checked={requestDetails.wantsWash} onChange={(e) => setRequestDetails({...requestDetails, wantsWash: e.target.checked})} />
              🫧 Add Car Wash (غسيل سيارة)
            </label>

            <div style={{display: 'flex', gap: '12px'}}>
              <button onClick={submitRequest} className="btn-green" style={{flex: 2}}>Send Request</button>
              <button onClick={() => setShowRequestModal(false)} className="btn-outline" style={{flex: 1}}>Cancel</button>
            </div>
          </div>
        </div>
      )}
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
// 3. VALET DASHBOARD COMPONENT (DISPATCHER)
// ------------------------------------------------------------------
function ValetDashboardView({ parkingMap }) {
  const [tickets, setTickets] = useState([]);
  
  // Modals & State
  const [showFullLogModal, setShowFullLogModal] = useState(false);
  const [quickQrId, setQuickQrId] = useState(null);
  const [draftToEdit, setDraftToEdit] = useState(null);
  const [isMapOpenForDraft, setIsMapOpenForDraft] = useState(false);
  const [formData, setFormData] = useState({ make: '', model: '', color: '', plate: '', spot: '', countryCode: '+971', phone: '' });
  const [knownPlates, setKnownPlates] = useState({});

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
    return () => unsubscribe();
  }, []);

  const changeStatus = async (ticketId, newStatus) => {
    const updates = { status: newStatus };
    if (newStatus === 'retrieved') updates["timestamps/retrievedAt"] = Date.now();
    await update(ref(db, `tickets/${ticketId}`), updates);
  };

  // Quick Drop-Off with dummy vehicle data to prevent crashes
  const handleQuickDropOff = async () => {
    const ticketId = `ticket_${Date.now()}`;
    await set(ref(db, `tickets/${ticketId}`), {
      venueId: currentVenueId, 
      status: "draft", 
      parkedByUserId: auth.currentUser.uid,
      parkedByName: "Valet Team",
      parkedByPhone: "+971501234567",
      vehicle: { make: 'Pending', model: 'Details', licensePlate: 'N/A', color: 'N/A' },
      timestamps: { created: Date.now() }
    });
    setQuickQrId(ticketId); 
  };

  // Draft Completion
  const openDraftEditor = (ticket) => {
    setDraftToEdit(ticket.id);
    setFormData({ make: '', model: '', color: '', plate: '', spot: '', countryCode: '+971', phone: '' });
  };

  const handleSaveDraft = async (e) => {
    e.preventDefault();
    await update(ref(db, `tickets/${draftToEdit}`), {
      guestPhone: `${formData.countryCode} ${formData.phone}`.trim(),
      vehicle: { make: formData.make, model: formData.model, color: formData.color, licensePlate: formData.plate.toUpperCase() },
      parkingSpot: formData.spot, 
      status: "parked", 
      "timestamps/parkedAt": Date.now()
    });
    setDraftToEdit(null);
  };

  const handlePlateBlur = (e) => {
    const plate = e.target.value.toUpperCase();
    if (knownPlates[plate]) {
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

  const drafts = tickets.filter(t => t.status === "draft");
  const requested = tickets.filter(t => t.status === "requested");
  const incomingReady = tickets.filter(t => t.status === "incoming" || t.status === "ready");
  const parked = tickets.filter(t => t.status === "parked");
  const occupiedSpots = parked.map(t => t.parkingSpot);

  const availableMakes = Object.keys(CAR_DATABASE);
  const availableModels = CAR_DATABASE[formData.make] || [];

  return (
    <div className="app-container">
      <div className="dashboard-wrapper">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <h1 className="heading-dashboard">Dispatcher</h1>
            <button onClick={() => signOut(auth)} className="btn-outline" style={{fontSize: '0.85rem', padding: '8px 16px'}}>Logout</button>
          </div>
          <div style={{display: 'flex', gap: '12px'}}>
            <button onClick={() => setShowFullLogModal(true)} className="btn-outline" style={{width: 'auto', background: 'white'}}>+ Full Log Entry</button>
            <button onClick={handleQuickDropOff} className="btn-purple" style={{width: 'auto'}}>⚡ Quick QR Drop-Off</button>
          </div>
        </div>

        <div className="dashboard-grid">
          
          {/* COLUMN 1: DRAFTS (Needs Data) */}
          <div className="queue-column">
            <h2 className="queue-title">Needs Info ({drafts.length})</h2>
            {drafts.map((t, i) => (
              <div key={t.id} className="ticket-card" style={{ borderLeft: '6px solid var(--draft-purple)', animationDelay: `${i * 0.05}s` }}>
                <span className="status-badge status-draft">Draft Ticket</span>
                <p style={{margin: '8px 0', color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 500}}>Guest has QR code. Car needs parking spot and details.</p>
                <button onClick={() => openDraftEditor(t)} className="btn-outline" style={{borderColor: 'var(--draft-purple)', color: 'var(--draft-purple)', marginTop: '8px'}}>Complete Details</button>
              </div>
            ))}
          </div>

          {/* COLUMN 2: REQUESTED */}
          <div className="queue-column">
            <h2 className="queue-title">Requested ({requested.length})</h2>
            {requested.map((t, i) => (
              <div key={t.id} className="ticket-card" style={{ borderLeft: '6px solid var(--danger-red)', animationDelay: `${i * 0.05}s` }}>
                <span className="status-badge status-requested">Needs Retrieval</span>
                <h3 style={{margin: '8px 0 0 0', fontWeight: 800}}>{t.vehicle?.make || 'Unknown'} <span style={{color: 'var(--text-muted)'}}>{t.vehicle?.licensePlate || 'N/A'}</span></h3>
                <p style={{margin: '4px 0 0 0', fontWeight: 700}}>Spot: {t.parkingSpot}</p>
                <div style={{background: '#f8fafc', padding: '12px', borderRadius: '12px', fontSize: '0.9rem', fontWeight: 700, marginTop: '8px', border: '1px solid #e2e8f0'}}>
                  📍 To: {t.returnLocation}
                  {t.wantsWash && <div style={{color: '#0ea5e9', marginTop: '4px'}}>🫧 Needs Car Wash</div>}
                </div>
                <button onClick={() => changeStatus(t.id, 'incoming')} className="btn-outline" style={{borderColor: 'var(--warning-yellow)', color: 'var(--warning-yellow)', marginTop: '8px'}}>Bring Car</button>
              </div>
            ))}
          </div>

          {/* COLUMN 3: IN TRANSIT / READY */}
          <div className="queue-column">
            <h2 className="queue-title">Transit/Ready ({incomingReady.length})</h2>
            {incomingReady.map((t, i) => (
              <div key={t.id} className="ticket-card" style={{ borderLeft: `6px solid ${t.status === 'ready' ? 'var(--accent-green)' : 'var(--warning-yellow)'}`, animationDelay: `${i * 0.05}s` }}>
                <span className={`status-badge ${t.status === 'ready' ? 'status-ready' : 'status-incoming'}`}>
                  {t.status === 'ready' ? 'Waiting at Door' : 'On The Way'}
                </span>
                <h3 style={{margin: '8px 0 12px 0', fontWeight: 800}}>{t.vehicle?.make || 'Unknown'} <span style={{color: 'var(--text-muted)'}}>{t.vehicle?.licensePlate || 'N/A'}</span></h3>
                
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

          {/* COLUMN 4: PARKED */}
          <div className="queue-column">
            <h2 className="queue-title">Parked ({parked.length})</h2>
            {parked.map((t, i) => (
              <div key={t.id} className="ticket-card" style={{ borderLeft: '6px solid #cbd5e1', animationDelay: `${i * 0.05}s` }}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                  <h3 style={{margin: 0, fontWeight: 700}}>{t.vehicle?.make || 'Unknown'}</h3>
                  <span className="status-badge status-parked" style={{background: '#f8fafc', border: '1px solid #e2e8f0'}}>{t.parkingSpot}</span>
                </div>
                <p style={{margin: 0, color: 'var(--text-muted)', fontWeight: 600}}>{t.vehicle?.licensePlate || 'N/A'}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {showFullLogModal && <LogArrivalModal onClose={() => setShowFullLogModal(false)} venueId={currentVenueId} parkingMap={parkingMap} occupiedSpots={occupiedSpots} knownPlates={knownPlates} />}

      {/* QUICK QR MODAL */}
      {quickQrId && (
        <div className="modal-overlay">
          <div className="vibrant-card animate-scale-in">
            <h2 className="heading-brand" style={{color: 'var(--draft-purple)'}}>TICKET READY</h2>
            <p style={{color: 'var(--text-muted)', marginBottom: '24px', fontWeight: 500}}>Guest can scan this now. You can fill out the car details later from the "Needs Info" queue.</p>
            <div style={{background: '#fff', padding: '16px', borderRadius: '12px', display: 'inline-block', margin: '0 0 24px 0', border: '2px solid var(--card-border)'}}>
              <img src={`https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(`${currentDomain}/?ticket=${quickQrId}`)}`} alt="QR Code" style={{display: 'block'}} />
            </div>
            <button onClick={() => setQuickQrId(null)} className="btn-outline" style={{width: '100%', padding: '16px'}}>Close & Return</button>
          </div>
        </div>
      )}

      {/* DRAFT EDITOR MODAL */}
      {draftToEdit && (
        <div className="modal-overlay">
          <div className="vibrant-card animate-slide-up" style={{maxWidth: isMapOpenForDraft ? '850px' : '500px', width: '90%', padding: '32px', transition: 'max-width 0.4s ease'}}>
            
            {isMapOpenForDraft ? (
               <div style={{textAlign: 'left'}}>
                 <h2 className="heading-brand" style={{color: 'var(--text-main)', fontSize: '1.75rem', marginBottom: '8px'}}>SELECT PARKING SPOT</h2>
                 <p style={{color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: '24px', fontWeight: 500}}>Tap an empty green spot to assign it.</p>
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
                               if(!isOccupied) { setFormData({...formData, spot: spot}); setIsMapOpenForDraft(false); }
                             }}
                           >
                             {spot}
                           </div>
                         );
                       })}
                     </div>
                   ))}
                 </div>
                 <button onClick={() => setIsMapOpenForDraft(false)} className="btn-outline" style={{width: '100%', marginTop: '32px', padding: '16px'}}>Cancel Selection</button>
               </div>
            ) : (
              <form onSubmit={handleSaveDraft}>
                <h2 className="heading-brand" style={{marginBottom: '24px', color: 'var(--draft-purple)'}}>COMPLETE VEHICLE INFO</h2>
                
                <input required placeholder="License Plate (Auto-fills if known)" className="vibrant-input" style={{marginBottom: '16px', textTransform: 'uppercase', borderColor: 'var(--draft-purple)'}} value={formData.plate} onChange={e => setFormData({...formData, plate: e.target.value})} onBlur={handlePlateBlur} />

                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px'}}>
                  <Autocomplete options={availableMakes} value={formData.make} onChange={(val) => setFormData({...formData, make: val, model: ''})} placeholder="Search or type Make" isObject={false} />
                  <Autocomplete options={availableModels} value={formData.model} onChange={(val) => setFormData({...formData, model: val})} placeholder="Search or type Model" isObject={false} />
                </div>
                
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px'}}>
                  <input required placeholder="Color" className="vibrant-input" style={{marginBottom: '16px'}} value={formData.color} onChange={e => setFormData({...formData, color: e.target.value})} />
                  <input 
                    required 
                    readOnly
                    placeholder="Tap to Select Spot" 
                    className="vibrant-input" 
                    style={{marginBottom: '16px', textAlign: 'center', color: 'var(--accent-green)', fontWeight: '700', cursor: 'pointer', border: '2px solid var(--accent-green)'}} 
                    value={formData.spot} 
                    onClick={() => setIsMapOpenForDraft(true)} 
                  />
                </div>
                
                <div style={{display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px', alignItems: 'start'}}>
                  <Autocomplete options={COUNTRY_CODES} value={formData.countryCode} onChange={(val) => setFormData({...formData, countryCode: val})} placeholder="+ Code" isObject={true} />
                  <input required type="tel" placeholder="Guest Phone" className="vibrant-input" style={{marginBottom: '24px'}} value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>

                <div style={{display: 'flex', gap: '12px'}}>
                  <button type="submit" className="btn-green" style={{flex: 2}}>Save & Mark Parked</button>
                  <button type="button" onClick={() => setDraftToEdit(null)} className="btn-outline" style={{flex: 1}}>Cancel</button>
                </div>
              </form>
            )}
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
  const [qrModalTicket, setQrModalTicket] = useState(null);
  const [knownPlates, setKnownPlates] = useState({});
  
  const [confirmConfig, setConfirmConfig] = useState({ isOpen: false, title: '', message: '', onConfirm: null, isDanger: true });

  const currentDomain = window.location.origin;

  useEffect(() => {
    setEditingMap(JSON.parse(JSON.stringify(parkingMap || [])));
  }, [parkingMap]);

  useEffect(() => {
    const unsubscribe = onValue(ref(db, 'tickets'), (snapshot) => {
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
          <button onClick={() => setShowLogModal(true)} className="btn-green" style={{width: 'auto', padding: '12px 32px'}}>+ Full Log Arrival</button>
        </div>

        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', overflowX: 'auto', paddingBottom: '8px' }}>
          <button className={activeTab === 'parked' ? 'btn-green' : 'btn-outline'} onClick={() => setActiveTab('parked')} style={{ padding: '12px 28px', whiteSpace: 'nowrap' }}>
            Currently Parked ({parkedCars.length})
          </button>
          <button className={activeTab === 'metrics' ? 'btn-green' : 'btn-outline'} onClick={() => setActiveTab('metrics')} style={{ padding: '12px 28px', whiteSpace: 'nowrap' }}>
            Performance Metrics
          </button>
          <button className={activeTab === 'map' ? 'btn-green' : 'btn-outline'} onClick={() => setActiveTab('map')} style={{ padding: '12px 28px', whiteSpace: 'nowrap' }}>
            Visual Map Editor
          </button>
        </div>

        <div>
          <h2 className="queue-title">
            {activeTab === 'parked' ? 'Active Lot Inventory' : activeTab === 'metrics' ? 'Retrieval Time History' : 'Live Floor Plan Editor'}
          </h2>
          
          <div style={{ overflowX: 'auto' }}>
            {activeTab !== 'map' ? (
              <table className="luxury-table animate-slide-up">
                {activeTab === 'parked' && (
                  <>
                    <thead><tr><th>Vehicle</th><th>Plate</th><th>Phone</th><th>Spot</th><th>Arrival Date</th><th>Parked Time</th><th>QR Ticket</th></tr></thead>
                    <tbody>
                      {parkedCars.map(t => {
                        const { date, time } = formatDateTime(t.timestamps?.parkedAt);
                        return (
                          <tr key={t.id}>
                            <td style={{ color: 'var(--text-main)', fontWeight: '700' }}>{t.vehicle?.make || 'Unknown'} {t.vehicle?.model || ''}</td>
                            <td style={{ fontWeight: 600 }}>{t.vehicle?.licensePlate || 'N/A'}</td>
                            <td style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{t.guestPhone || '-'}</td>
                            <td style={{ color: 'var(--accent-green)', fontWeight: '800' }}>{t.parkingSpot}</td>
                            <td style={{ fontWeight: 500 }}>{date}</td><td style={{ fontWeight: 500 }}>{time}</td>
                            <td>
                              <button onClick={() => setQrModalTicket(t.id)} className="btn-outline" style={{padding: '6px 12px', fontSize: '0.8rem'}}>
                                View QR
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                      {parkedCars.length === 0 && <tr><td colSpan="7" style={{textAlign: 'center', padding: '48px', color: 'var(--text-muted)'}}>Lot is completely empty.</td></tr>}
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
                            <td style={{ color: 'var(--text-main)', fontWeight: '700' }}>{t.vehicle?.make || 'Unknown'} {t.vehicle?.model || ''}</td>
                            <td style={{ fontWeight: 600 }}>{t.vehicle?.licensePlate || 'N/A'}</td>
                            <td style={{ color: 'var(--text-muted)', fontWeight: 500 }}>{t.guestPhone || '-'}</td>
                            <td style={{ fontWeight: 500 }}>{date}</td>
                            <td style={{ color: mins > 5 ? 'var(--danger-red)' : 'var(--accent-green)', fontWeight: '800' }}>{mins}m {secs}s</td>
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
                  <button onClick={handleSaveMap} className="btn-green" style={{flex: 2, padding: '16px', fontSize: '1.05rem'}}>Save Floor Plan to Live Database</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {showLogModal && <LogArrivalModal onClose={() => setShowLogModal(false)} venueId="venue_001" parkingMap={parkingMap} occupiedSpots={occupiedSpots} knownPlates={knownPlates}/>}
      
      {qrModalTicket && (
        <div className="modal-overlay">
          <div className="vibrant-card animate-scale-in" style={{width: '90%'}}>
            <h2 className="heading-brand" style={{color: 'var(--accent-green)'}}>DIGITAL TICKET</h2>
            <div style={{background: '#fff', padding: '20px', borderRadius: '12px', display: 'inline-block', margin: '24px 0', border: '2px solid var(--card-border)'}}>
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