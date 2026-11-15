import { useState, useEffect, useRef } from 'react';
import { db, auth } from './firebase';
import { ref, onValue, update, set, get, remove } from 'firebase/database';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged, getAuth, createUserWithEmailAndPassword, sendPasswordResetEmail, setPersistence, browserSessionPersistence } from 'firebase/auth';
import { initializeApp, getApps } from 'firebase/app';

// ------------------------------------------------------------------
// INJECTED CSS FOR VIBRANT, ENERGETIC APP UI, LANDING PAGE & SHADOWS
// ------------------------------------------------------------------
const vibrantStyles = `
  @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;800;900&display=swap');

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

  html, body, #root { margin: 0 !important; padding: 0 !important; width: 100% !important; max-width: 100vw !important; min-height: 100vh; display: block !important; background-color: var(--bg-color) !important; color: var(--text-main) !important; font-family: var(--font-ui); -webkit-font-smoothing: antialiased; overflow-x: hidden !important; text-align: left; }
  h1, h2, h3, h4, h5, h6, p { color: inherit; }
  .app-container { min-height: 100vh; width: 100%; display: flex; flex-direction: column; padding: 24px; box-sizing: border-box; }
  .center-wrapper { display: flex; justify-content: center; align-items: center; min-height: calc(100vh - 48px); }
  .dashboard-wrapper { max-width: 1400px; margin: 0 auto; width: 100%; animation: fadeIn 0.4s ease-out; }

  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes slideUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
  @keyframes scaleIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
  @keyframes scanLaser { 0% { top: 0; } 50% { top: 100%; } 100% { top: 0; } }
  @keyframes floatSlow { 0% { transform: translateY(0px); } 50% { transform: translateY(-8px); } 100% { transform: translateY(0px); } }
  
  .animate-slide-up { animation: slideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
  .animate-scale-in { animation: scaleIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }

  .vibrant-card { background: var(--card-bg); border: 1px solid var(--card-border); border-radius: 20px; padding: 32px; width: 100%; max-width: 420px; box-shadow: var(--shadow-lg); text-align: center; position: relative; overflow: hidden; box-sizing: border-box; }
  
  .heading-brand { color: var(--text-main); font-size: 2rem; font-weight: 800; margin: 0 0 8px 0; letter-spacing: -0.5px; }
  .heading-dashboard { color: var(--text-main); font-size: 2.25rem; margin: 0; font-weight: 700; letter-spacing: -1px; }

  .btn-green { background: var(--accent-green); color: #fff; border: none; padding: 16px 24px; border-radius: 12px; font-size: 1.1rem; font-weight: 700; width: 100%; cursor: pointer; transition: all 0.2s; box-shadow: var(--shadow-btn); display: flex; justify-content: center; align-items: center; gap: 8px; font-family: var(--font-ui);}
  .btn-green:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(16, 185, 129, 0.4); background: var(--accent-green-hover); }
  .btn-green:disabled { background: #cbd5e1; color: #64748b; box-shadow: none; cursor: not-allowed; }
  
  .btn-blue { background: var(--accent-blue); color: #fff; border: none; padding: 16px 24px; border-radius: 12px; font-size: 1.1rem; font-weight: 700; width: 100%; cursor: pointer; transition: all 0.2s; box-shadow: var(--shadow-btn-blue); display: flex; justify-content: center; align-items: center; gap: 8px; font-family: var(--font-ui);}
  .btn-blue:hover { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(14, 165, 233, 0.4); background: var(--accent-blue-hover); }

  .btn-purple { background: var(--draft-purple); color: #fff; border: none; padding: 16px 24px; border-radius: 12px; font-size: 1.1rem; font-weight: 700; width: 100%; cursor: pointer; transition: all 0.2s; box-shadow: 0 4px 14px rgba(139, 92, 246, 0.3); font-family: var(--font-ui);}
  .btn-purple:hover { transform: translateY(-2px); filter: brightness(1.1); }
  
  .btn-dev { background: var(--dev-black); color: #fff; border: none; padding: 16px 24px; border-radius: 12px; font-size: 1.1rem; font-weight: 700; width: 100%; cursor: pointer; transition: all 0.2s; box-shadow: var(--shadow-md); font-family: var(--font-ui);}
  .btn-dev:hover { transform: translateY(-2px); filter: brightness(1.2); }

  .btn-action { background: #fee2e2; color: var(--danger-red); border: none; padding: 12px; border-radius: 12px; font-weight: 700; cursor: pointer; transition: all 0.2s; box-shadow: var(--shadow-sm); font-family: var(--font-ui);}
  .btn-action:hover { background: var(--danger-red); color: white; transform: translateY(-1px); box-shadow: var(--shadow-md); }

  .btn-outline { background: #fff; color: var(--text-main); border: 2px solid var(--card-border); padding: 12px 20px; border-radius: 12px; font-weight: 700; cursor: pointer; transition: all 0.2s ease; box-shadow: var(--shadow-sm); font-family: var(--font-ui);}
  .btn-outline:hover { background: #f8fafc; border-color: #cbd5e1; box-shadow: var(--shadow-md); transform: translateY(-1px); }
  
  .btn-apple-pay { background: #000; color: #fff; border: none; padding: 14px; border-radius: 10px; width: 100%; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; box-shadow: var(--shadow-md); }
  .btn-apple-pay:hover { background: #222; transform: translateY(-2px); }
  .btn-google-pay { background: #fff; color: #3c4043; border: 1px solid #dadce0; padding: 14px; border-radius: 10px; width: 100%; cursor: pointer; transition: all 0.2s; display: flex; align-items: center; justify-content: center; box-shadow: var(--shadow-md); }
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
  
  .editor-zone-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; gap: 16px; }
  .editor-zone-input { width: 60%; margin-bottom: 0 !important; font-size: 1.35rem; color: var(--text-main); font-weight: 800; background: transparent; border: none; border-bottom: 2px solid var(--card-border); padding: 8px 0; border-radius: 0; }
  .editor-zone-input:focus { outline: none; border-color: var(--accent-green); background: transparent; box-shadow: none; }
  .editor-zone-actions { display: flex; gap: 12px; }

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

  .modal-overlay { position: fixed; top: 0; left: 0; right: 0; bottom: 0; background: rgba(15, 23, 42, 0.65); backdrop-filter: blur(8px); display: flex; justify-content: center; align-items: center; z-index: 1000; padding: 20px; animation: fadeIn 0.2s ease-out; overflow-y: auto;}
  
  .contact-bar { display: flex; gap: 12px; margin-top: 16px; }
  .btn-contact { flex: 1; display: flex; align-items: center; justify-content: center; gap: 8px; padding: 12px; border-radius: 12px; font-weight: 700; text-decoration: none; font-size: 0.95rem; transition: transform 0.2s; box-shadow: var(--shadow-sm); border: 1px solid var(--card-border); }
  .btn-contact:hover { transform: translateY(-2px); box-shadow: var(--shadow-md); }

  .luxury-table { width: 100%; border-collapse: collapse; text-align: left; font-size: 0.95rem; background: #fff; border-radius: 16px; overflow: hidden; box-shadow: var(--shadow-md); color: var(--text-main); }
  .luxury-table th { padding: 16px; border-bottom: 2px solid var(--card-border); color: var(--text-muted); font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; font-size: 0.85rem; background: #f8fafc;}
  .luxury-table td { padding: 20px 16px; border-bottom: 1px solid var(--card-border); color: var(--text-main); }
  
  .metric-card { background: #fff; border: 1px solid var(--card-border); border-radius: 16px; padding: 24px; box-shadow: var(--shadow-md); text-align: left; }
  .metric-value { font-size: 2.5rem; font-weight: 800; margin: 8px 0; color: var(--text-main); }
  
  .settings-row { display: flex; justify-content: space-between; align-items: center; padding: 16px 0; border-bottom: 1px solid var(--card-border); }
  .toggle-switch { position: relative; width: 54px; height: 28px; display: inline-block; flex-shrink: 0; }
  .toggle-switch input { opacity: 0; width: 0; height: 0; position: absolute; }
  .toggle-slider { position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #cbd5e1; transition: .3s; border-radius: 34px; box-shadow: inset 0 2px 4px rgba(0,0,0,0.1); }
  .toggle-slider:before { position: absolute; content: ""; height: 20px; width: 20px; left: 4px; bottom: 4px; background-color: white; transition: .3s; border-radius: 50%; box-shadow: var(--shadow-sm); }
  .toggle-switch input:checked + .toggle-slider { background-color: var(--accent-green); }
  .toggle-switch input:checked + .toggle-slider:before { transform: translateX(26px); }
  .toggle-switch input:disabled + .toggle-slider { opacity: 0.5; cursor: not-allowed; }

  /* LANDING PAGE & VIP GARAGE STYLES */
  .landing-nav { display: flex; justify-content: space-between; align-items: center; padding: 20px 40px; max-width: 1400px; margin: 0 auto; width: 100%; box-sizing: border-box; gap: 12px; }
  .landing-hero { position: relative; border-radius: 28px; overflow: hidden; max-width: 1350px; width: 100%; margin: 0 auto 64px auto; min-height: 560px; display: flex; align-items: center; padding: 56px; box-sizing: border-box; background: #0f172a; color: white; box-shadow: 0 25px 60px rgba(15, 23, 42, 0.25); }
  .landing-hero-bg { position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover; opacity: 0.42; filter: contrast(1.1); }
  .landing-hero-gradient { position: absolute; inset: 0; background: linear-gradient(90deg, rgba(15,23,42,0.96) 0%, rgba(15,23,42,0.8) 60%, rgba(15,23,42,0.35) 100%); }
  .landing-hero-content { position: relative; z-index: 2; width: 100%; max-width: 640px; min-width: 0; box-sizing: border-box; text-align: left; }
  .hero-badge { display: inline-flex; align-items: center; gap: 6px; background: rgba(16, 185, 129, 0.18); border: 1px solid rgba(16, 185, 129, 0.45); color: #34d399; padding: 6px 14px; border-radius: 999px; font-weight: 700; font-size: 0.78rem; letter-spacing: 0.5px; text-transform: uppercase; margin-bottom: 20px; backdrop-filter: blur(8px); max-width: 100%; box-sizing: border-box; }
  .hero-actions { display: flex; gap: 14px; flex-wrap: wrap; margin-bottom: 28px; width: 100%; }
  .hero-ticket-form { background: rgba(255,255,255,0.1); backdrop-filter: blur(12px); padding: 8px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.2); display: flex; gap: 8px; width: 100%; max-width: 480px; box-sizing: border-box; }
  .feature-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 24px; max-width: 1350px; margin: 0 auto 80px auto; padding: 0 24px; box-sizing: border-box; }
  .feature-card { background: #fff; border: 1px solid var(--card-border); border-radius: 24px; overflow: hidden; box-shadow: var(--shadow-md); transition: all 0.3s ease; display: flex; flex-direction: column; text-align: left; }
  .feature-card:hover { transform: translateY(-6px); box-shadow: var(--shadow-lg); }
  .feature-img { width: 100%; height: 200px; object-fit: cover; }
  .garage-car-card { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: white; border-radius: 22px; padding: 28px; position: relative; overflow: hidden; box-shadow: var(--shadow-lg); text-align: left; display: flex; flex-direction: column; justify-content: space-between; min-height: 210px; }
  .plate-pill { background: #fef08a; color: #0f172a; font-weight: 900; padding: 6px 14px; border-radius: 8px; font-family: monospace; font-size: 1.05rem; letter-spacing: 1.5px; border: 2px solid #0f172a; display: inline-block; box-shadow: var(--shadow-sm); }

  @media (max-width: 768px) {
    .app-container { padding: 14px; }
    .landing-nav { padding: 14px 16px; }
    .landing-hero { padding: 28px 20px; margin: 0 auto 36px auto; border-radius: 22px; min-height: auto; }
    .hero-badge { font-size: 0.7rem; padding: 6px 12px; white-space: normal; line-height: 1.3; }
    .hero-actions { flex-direction: column; gap: 10px; }
    .hero-actions button { width: 100% !important; justify-content: center; padding: 15px 20px !important; }
    .hero-ticket-form { flex-direction: column; padding: 10px; }
    .hero-ticket-form button { width: 100% !important; padding: 12px !important; }
    .feature-grid { grid-template-columns: 1fr !important; padding: 0 16px; margin-bottom: 48px; }
    .vibrant-card { padding: 24px 18px; }
    .heading-dashboard { font-size: 1.6rem; }
  }
`;

const CAR_DATABASE = {
  "Abarth": ["595", "695"], "Acura": ["MDX", "RDX"], "Alfa Romeo": ["Giulia", "Stelvio"],
  "Audi": ["A3", "A4", "Q5", "Q7", "e-tron", "RS6", "R8"], "Bentley": ["Bentayga", "Continental GT", "Flying Spur"], 
  "BMW": ["3-Series", "5-Series", "7-Series", "X5", "X7", "M3", "M5"], "Bugatti": ["Chiron"], 
  "Cadillac": ["Escalade", "CT5"], "Chevrolet": ["Tahoe", "Corvette"], "Ferrari": ["F8", "Roma", "Purosangue", "SF90"], 
  "Ford": ["Mustang", "F-150", "Bronco"], "Honda": ["Accord", "Civic"], "Hyundai": ["Tucson", "Ioniq 5"],
  "Jeep": ["Wrangler", "Grand Cherokee"], "Kia": ["Telluride", "Sportage", "EV6"], "Lamborghini": ["Urus", "Huracan", "Revuelto"],
  "Land Rover": ["Range Rover", "Range Rover Sport", "Defender"], "Lexus": ["RX", "LX", "IS"], "Maserati": ["Levante", "Grecale", "MC20"], 
  "McLaren": ["720S", "750S", "Artura"], "Mercedes-Benz": ["C-Class", "E-Class", "S-Class", "G-Class", "GLE", "AMG GT"],
  "Nissan": ["Patrol", "GT-R", "Altima"], "Porsche": ["911", "Taycan", "Panamera", "Macan", "Cayenne"], "Rolls-Royce": ["Cullinan", "Ghost", "Phantom", "Spectre"], 
  "SEAT": ["Leon FR", "Ibiza", "Ateca"], "Tesla": ["Model 3", "Model Y", "Model S", "Cybertruck"], "Toyota": ["Land Cruiser", "Camry", "RAV4", "Supra"], "Volvo": ["XC60", "XC90"]
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

// ------------------------------------------------------------------
// WIDGETS & LOGOS
// ------------------------------------------------------------------
function CustomConfirmWidget({ isOpen, title, message, onConfirm, onCancel, confirmText = "Confirm", isDanger = true, singleButton = false }) {
  if (!isOpen) return null;
  return (
    <div className="modal-overlay" style={{ zIndex: 1100 }}>
      <div className="vibrant-card animate-scale-in" style={{ maxWidth: '400px', padding: '32px' }}>
        <h3 style={{ color: isDanger ? 'var(--danger-red)' : 'var(--accent-green)', marginTop: 0, fontWeight: 800, fontSize: '1.5rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{title}</h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: '32px', lineHeight: '1.6', fontSize: '1rem', fontWeight: 500 }}>{message}</p>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={onConfirm} className={isDanger ? "btn-action" : "btn-green"} style={{ flex: 1, border: 'none', color: 'white', background: isDanger ? 'var(--danger-red)' : 'var(--accent-green)' }}>{confirmText}</button>
          {!singleButton && <button onClick={onCancel} className="btn-outline" style={{ flex: 1 }}>Cancel</button>}
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
    if (val.trim().toUpperCase() === expectedValue.trim().toUpperCase()) { onMatch(); } 
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
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '1.25rem', fontWeight: 600, color: '#fff', fontFamily: '-apple-system, BlinkMacSystemFont, "Outfit", sans-serif' }}>
    <svg width="17" height="20" viewBox="0 0 384 512" fill="currentColor" style={{ marginBottom: '2px' }}>
      <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
    </svg>
    <span>Pay</span>
  </span>
);

const GooglePayLogo = () => (
  <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '1.25rem', fontWeight: 600, color: '#3c4043', fontFamily: '"Outfit", sans-serif' }}>
    <svg width="20" height="20" viewBox="0 0 48 48">
      <path fill="#4285F4" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
      <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
      <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
      <path fill="#EA4335" d="M39.89 42.19c4.22-3.83 6.64-9.52 6.64-16.19 0-1.25-.13-2.47-.35-3.64H24v9.06h12.59c-.58 3.01-2.27 5.56-4.7 7.28l7.73 6.01h.27z"/>
    </svg>
    <span>Pay</span>
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
// PUBLIC LUXURY LANDING PAGE (OPENING VIEW BEFORE SIGN IN)
// ------------------------------------------------------------------
function LandingPageView({ onNavigateAuth, onOpenTicket }) {
  const [ticketCodeInput, setTicketCodeInput] = useState('');

  const handleTicketLookup = (e) => {
    e.preventDefault();
    if (!ticketCodeInput.trim()) return;
    const cleaned = ticketCodeInput.trim().includes('ticket=')
      ? new URLSearchParams(ticketCodeInput.split('?')[1]).get('ticket')
      : ticketCodeInput.trim();
    if (cleaned) onOpenTicket(cleaned);
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#f8fafc', display: 'flex', flexDirection: 'column' }}>
      {/* Top Navbar */}
      <nav className="landing-nav">
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ width: '38px', height: '38px', borderRadius: '10px', background: 'var(--accent-green)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 900, fontSize: '1.2rem', boxShadow: 'var(--shadow-btn)', flexShrink: 0 }}>S</div>
          <div>
            <span style={{ fontWeight: 900, fontSize: '1.25rem', letterSpacing: '-0.5px', color: 'var(--text-main)', display: 'block', lineHeight: 1.1 }}>SKY VALET</span>
            <span style={{ display: 'block', fontSize: '0.65rem', fontWeight: 700, color: 'var(--accent-green)', letterSpacing: '1.2px', textTransform: 'uppercase' }}>VIP Mobility & Fleet</span>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <button onClick={() => onNavigateAuth('customer_login')} className="btn-outline" style={{ width: 'auto', padding: '8px 16px', fontSize: '0.9rem' }}>Login</button>
          <button onClick={() => onNavigateAuth('customer_register')} className="btn-green" style={{ width: 'auto', padding: '8px 16px', fontSize: '0.9rem' }}>Register</button>
        </div>
      </nav>

      {/* Hero Section */}
      <div style={{ padding: '0 16px', width: '100%', boxSizing: 'border-box' }}>
        <section className="landing-hero animate-scale-in">
          <img className="landing-hero-bg" src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1800&q=80" alt="Luxury Porsche at Hotel Valet" />
          <div className="landing-hero-gradient" />
          
          <div className="landing-hero-content">
            <div className="hero-badge">✨ Zero-Wait Digital Valet Ecosystem</div>
            <h1 style={{ fontSize: 'clamp(1.85rem, 5vw, 3.8rem)', fontWeight: 900, margin: '0 0 16px 0', lineHeight: 1.1, letterSpacing: '-1px', color: '#ffffff', wordBreak: 'break-word' }}>
              Arrive Like Royalty. Leave Without Waiting.
            </h1>
            <p style={{ fontSize: 'clamp(0.95rem, 2.5vw, 1.15rem)', color: '#cbd5e1', lineHeight: 1.55, marginBottom: '28px', fontWeight: 400 }}>
              Register your vehicles once in the Sky Valet VIP Garage. Flash your digital pass at any partner 5-star hotel or restaurant, track live wash bay progress, and summon your car to the front door with a single tap.
            </p>
            
            <div className="hero-actions">
              <button onClick={() => onNavigateAuth('customer_register')} className="btn-green" style={{ width: 'auto', padding: '16px 28px', fontSize: '1.05rem' }}>
                🚘 Register Your Car — Free
              </button>
              <button onClick={() => onNavigateAuth('customer_login')} className="btn-outline" style={{ width: 'auto', padding: '16px 24px', background: 'rgba(255,255,255,0.1)', color: 'white', borderColor: 'rgba(255,255,255,0.25)', backdropFilter: 'blur(8px)' }}>
                Open My VIP Pass
              </button>
            </div>

            {/* Instant Ticket Lookup Bar */}
            <form onSubmit={handleTicketLookup} className="hero-ticket-form">
              <input
                type="text"
                placeholder="Have a paper/QR ticket ID? (e.g. ticket_173...)"
                value={ticketCodeInput}
                onChange={(e) => setTicketCodeInput(e.target.value)}
                style={{ background: 'transparent', border: 'none', color: 'white', padding: '10px 12px', flex: 1, minWidth: 0, width: '100%', boxSizing: 'border-box', fontSize: '0.95rem', outline: 'none', fontFamily: 'var(--font-ui)' }}
              />
              <button type="submit" className="btn-blue" style={{ width: 'auto', padding: '10px 20px', fontSize: '0.9rem', whiteSpace: 'nowrap', flexShrink: 0 }}>Track Car</button>
            </form>
          </div>
        </section>
      </div>

      {/* Why Use Sky Valet - 4 Visual Pillars */}
      <div style={{ textAlign: 'center', maxWidth: '800px', margin: '0 auto 48px auto', padding: '0 24px' }}>
        <span style={{ color: 'var(--accent-green)', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '1.5px', fontSize: '0.85rem' }}>Why Drivers & Venues Choose Us</span>
        <h2 style={{ fontSize: '2.5rem', fontWeight: 900, margin: '8px 0 12px 0', letterSpacing: '-1px' }}>Engineered for Effortless Luxury</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.1rem', fontWeight: 500 }}>No more lost paper tickets, no more standing in the heat or rain waiting for your keys.</p>
      </div>

      <section className="feature-grid">
        <div className="feature-card">
          <img className="feature-img" src="https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=800&q=80" alt="VIP Garage Pass" />
          <div style={{ padding: '24px' }}>
            <span className="status-badge status-ready" style={{ marginBottom: '12px' }}>1-Second Drop-Off</span>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '1.35rem', fontWeight: 800 }}>Digital VIP Fleet Garage</h3>
            <p style={{ margin: 0, color: 'var(--text-muted)', lineHeight: 1.6, fontWeight: 500 }}>
              Save all your vehicles in your personal garage. Show your QR Express Pass to the valet runner and walk straight into the venue—zero forms or waiting.
            </p>
          </div>
        </div>

        <div className="feature-card">
          <img className="feature-img" src="https://images.unsplash.com/photo-1520340356584-f9917d1eea6f?auto=format&fit=crop&w=800&q=80" alt="Luxury Car Detailing" />
          <div style={{ padding: '24px' }}>
            <span className="status-badge wash-washing" style={{ marginBottom: '12px' }}>Live Detailing</span>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '1.35rem', fontWeight: 800 }}>1-Tap Wash Bay & Tracking</h3>
            <p style={{ margin: 0, color: 'var(--text-muted)', lineHeight: 1.6, fontWeight: 500 }}>
              Order a full luxury wash while you dine using Apple Pay or Google Pay. Watch your car move from Queued to Washing to Shining in real time.
            </p>
          </div>
        </div>

        <div className="feature-card">
          <img className="feature-img" src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80" alt="Five Star Hotel Entrance" />
          <div style={{ padding: '24px' }}>
            <span className="status-badge status-incoming" style={{ marginBottom: '12px' }}>Pinpoint Delivery</span>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '1.35rem', fontWeight: 800 }}>Summon Before You Pay the Bill</h3>
            <p style={{ margin: 0, color: 'var(--text-muted)', lineHeight: 1.6, fontWeight: 500 }}>
              Request your car from your table and choose which entrance you're walking out of. Your vehicle is running and waiting at the curb the second you step outside.
            </p>
          </div>
        </div>

        <div className="feature-card">
          <img className="feature-img" src="https://images.unsplash.com/photo-1549399542-7e3f8b79c341?auto=format&fit=crop&w=800&q=80" alt="Secure Key Handover" />
          <div style={{ padding: '24px' }}>
            <span className="status-badge status-draft" style={{ marginBottom: '12px' }}>Anti-Theft Security</span>
            <h3 style={{ margin: '0 0 8px 0', fontSize: '1.35rem', fontWeight: 800 }}>Verified Plate Handover</h3>
            <p style={{ margin: 0, color: 'var(--text-muted)', lineHeight: 1.6, fontWeight: 500 }}>
              Every vehicle is logged to an exact GPS-mapped parking zone and requires mandatory license plate verification before keys are ever released.
            </p>
          </div>
        </div>
      </section>

      {/* B2B SaaS Banner for Hotels & Restaurants */}
      <section style={{ maxWidth: '1300px', margin: '0 auto 64px auto', padding: '0 24px', width: '100%', boxSizing: 'border-box' }}>
        <div style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)', borderRadius: '24px', padding: '48px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '24px', boxShadow: 'var(--shadow-lg)' }}>
          <div style={{ maxWidth: '680px', textAlign: 'left' }}>
            <span style={{ color: '#38bdf8', fontWeight: 800, fontSize: '0.85rem', letterSpacing: '1.5px', textTransform: 'uppercase' }}>For Hotels, Resorts & Fine Dining</span>
            <h3 style={{ fontSize: '2rem', fontWeight: 900, margin: '8px 0 12px 0' }}>Upgrade Your Venue to Sky Valet SaaS</h3>
            <p style={{ color: '#94a3b8', margin: 0, lineHeight: 1.6, fontSize: '1.05rem' }}>
              Multi-tenant cloud dispatch, custom interactive floor maps, dedicated wash bay pipelines, and instant mobile tipping for your valet runners.
            </p>
          </div>
          <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
            <button onClick={() => onNavigateAuth('staff_login')} className="btn-green" style={{ width: 'auto', padding: '16px 28px' }}>Partner Portal Login</button>
          </div>
        </div>
      </section>
    </div>
  );
}

// ------------------------------------------------------------------
// UNIFIED AUTH VIEW (Customer Register, Customer Login, & Staff Login)
// ------------------------------------------------------------------
function LoginView({ initialMode = 'customer_login', onBackToLanding }) {
  const [mode, setMode] = useState(initialMode); // 'customer_login' | 'customer_register' | 'staff_login'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [countryCode, setCountryCode] = useState('+971');
  const [phone, setPhone] = useState('');
  const [firstCarMake, setFirstCarMake] = useState('');
  const [firstCarModel, setFirstCarModel] = useState('');
  const [firstCarColor, setFirstCarColor] = useState('');
  const [firstCarPlate, setFirstCarPlate] = useState('');
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const availableMakes = Object.keys(CAR_DATABASE);
  const availableModels = CAR_DATABASE[firstCarMake] || [];

  const unlockInput = (e) => e.target.removeAttribute('readonly');

  const handleAuth = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      await setPersistence(auth, browserSessionPersistence);

      if (mode === 'customer_register') {
        if (!fullName.trim() || !phone.trim()) {
          setError('Please enter your name and phone number.');
          setSubmitting(false);
          return;
        }
        const cred = await createUserWithEmailAndPassword(auth, email.trim(), password);
        const uid = cred.user.uid;
        const vipCode = `VIP-${Math.floor(1000 + Math.random() * 9000)}`;
        const fullPhone = `${countryCode} ${phone.trim()}`;

        const initialGarage = {};
        if (firstCarPlate.trim() && firstCarMake.trim()) {
          const carId = `car_${Date.now()}`;
          initialGarage[carId] = {
            id: carId,
            make: firstCarMake.trim(),
            model: firstCarModel.trim(),
            color: firstCarColor.trim() || 'Black',
            licensePlate: firstCarPlate.trim().toUpperCase(),
            vipCode
          };
        }

        await set(ref(db, `users/${uid}`), {
          role: 'customer',
          name: fullName.trim(),
          email: email.trim(),
          phone: fullPhone,
          vipCode,
          garage: initialGarage,
          createdAt: Date.now()
        });
      } else {
        const cred = await signInWithEmailAndPassword(auth, email.trim(), password);
        const snap = await get(ref(db, `users/${cred.user.uid}`));
        const role = snap.exists() ? (snap.val().role || 'customer') : 'valet_runner';

        // Strict portal separation: block staff from customer login & vice-versa
        if (mode === 'customer_login' && role !== 'customer') {
          await signOut(auth);
          setError('Staff accounts cannot sign in here. Scroll to the bottom of the home page and use Partner Portal Login.');
          setSubmitting(false);
          return;
        }
        if (mode === 'staff_login' && role === 'customer') {
          await signOut(auth);
          setError('Customer accounts must sign in using the regular Customer Login.');
          setSubmitting(false);
          return;
        }
      }
    } catch (err) {
      setError('Invalid email or password.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="app-container center-wrapper">
      <div className="vibrant-card animate-scale-in" style={{ maxWidth: mode === 'customer_register' ? '520px' : '430px', padding: '40px 32px' }}>
        {onBackToLanding && (
          <button onClick={onBackToLanding} style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '16px', padding: 0, fontFamily: 'var(--font-ui)' }}>
            ← Back to Home
          </button>
        )}

        {/* Customer Tabs (Hidden when inside Staff Portal) */}
        {mode !== 'staff_login' && (
          <div style={{ display: 'flex', background: '#f1f5f9', padding: '6px', borderRadius: '14px', marginBottom: '28px', gap: '6px' }}>
            <button type="button" onClick={() => { setMode('customer_login'); setError(''); }} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-ui)', background: mode === 'customer_login' ? '#fff' : 'transparent', color: mode === 'customer_login' ? 'var(--text-main)' : 'var(--text-muted)', boxShadow: mode === 'customer_login' ? 'var(--shadow-sm)' : 'none' }}>
              Login
            </button>
            <button type="button" onClick={() => { setMode('customer_register'); setError(''); }} style={{ flex: 1, padding: '10px', borderRadius: '10px', border: 'none', fontWeight: 700, cursor: 'pointer', fontFamily: 'var(--font-ui)', background: mode === 'customer_register' ? '#fff' : 'transparent', color: mode === 'customer_register' ? 'var(--accent-green)' : 'var(--text-muted)', boxShadow: mode === 'customer_register' ? 'var(--shadow-sm)' : 'none' }}>
              Register
            </button>
          </div>
        )}

        <h2 className="heading-brand" style={{ marginBottom: '8px', fontSize: '1.85rem' }}>
          {mode === 'customer_register' ? 'CREATE ACCOUNT' : mode === 'staff_login' ? 'STAFF PORTAL' : 'WELCOME BACK'}
        </h2>
        <p style={{ color: 'var(--text-muted)', marginTop: 0, marginBottom: '28px', fontWeight: 500, fontSize: '0.95rem' }}>
          {mode === 'customer_register'
            ? 'Save your vehicles once for instant QR drop-off & live tracking.'
            : mode === 'staff_login'
            ? 'Authorized venue & developer personnel only.'
            : 'Sign in to access your saved vehicles and live valet tickets.'}
        </p>

        {error && <p style={{ color: 'var(--danger-red)', fontSize: '0.9rem', marginBottom: '20px', background: '#fef2f2', padding: '12px', borderRadius: '10px', fontWeight: 600, border: '1px solid #fecaca' }}>{error}</p>}

        <form onSubmit={handleAuth} autoComplete="off" style={{ textAlign: 'left' }}>
          {mode === 'customer_register' && (
            <>
              <input type="text" placeholder="Full Name" required className="vibrant-input" style={{ marginBottom: '14px' }} value={fullName} onChange={(e) => setFullName(e.target.value)} autoComplete="off" />
              <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 2fr', gap: '12px', marginBottom: '14px' }}>
                <Autocomplete options={COUNTRY_CODES} value={countryCode} onChange={(val) => setCountryCode(val)} placeholder="+ Code" isObject={true} style={{ marginBottom: 0 }} />
                <input type="tel" placeholder="Mobile Number" required className="vibrant-input" value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="off" />
              </div>
            </>
          )}

          <input type="email" name="sky_auth_email_field" readOnly onFocus={unlockInput} placeholder={mode === 'staff_login' ? "Staff Email" : "Email Address"} required className="vibrant-input" style={{ marginBottom: '14px' }} value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="off" />
          <input type="password" name="sky_auth_pass_field" readOnly onFocus={unlockInput} placeholder="Password (Min 6 chars)" required minLength={6} className="vibrant-input" style={{ marginBottom: '20px' }} value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="new-password" />

          {mode === 'customer_register' && (
            <div style={{ background: '#f8fafc', padding: '18px', borderRadius: '14px', border: '1px solid var(--card-border)', marginBottom: '24px' }}>
              <p style={{ margin: '0 0 12px 0', fontWeight: 800, fontSize: '0.85rem', color: 'var(--accent-green)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                🚘 Add Your Primary Vehicle
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <Autocomplete options={availableMakes} value={firstCarMake} onChange={(val) => { setFirstCarMake(val); setFirstCarModel(''); }} placeholder="Make (e.g. Porsche)" isObject={false} />
                <Autocomplete options={availableModels} value={firstCarModel} onChange={(val) => setFirstCarModel(val)} placeholder="Model (e.g. 911)" isObject={false} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <input placeholder="Color (e.g. Black)" className="vibrant-input" value={firstCarColor} onChange={(e) => setFirstCarColor(e.target.value)} autoComplete="off" />
                <input placeholder="License Plate" className="vibrant-input" style={{ textTransform: 'uppercase', fontWeight: 700 }} value={firstCarPlate} onChange={(e) => setFirstCarPlate(e.target.value)} autoComplete="off" />
              </div>
            </div>
          )}

          <button type="submit" disabled={submitting} className={mode === 'staff_login' ? "btn-dev" : "btn-green"}>
            {submitting ? 'Please wait...' : mode === 'customer_register' ? 'Create Account' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
}

// ------------------------------------------------------------------
// CUSTOMER VIP GARAGE & LIVE TRACKING DASHBOARD
// ------------------------------------------------------------------
function CustomerGarageView({ userProfile, uid, onOpenLiveTicket }) {
  const [activeTab, setActiveTab] = useState('garage'); // 'garage' | 'history'
  const [myTickets, setMyTickets] = useState([]);
  const [allVenues, setAllVenues] = useState({});
  const [showAddCarModal, setShowAddCarModal] = useState(false);
  const [selectedPassCar, setSelectedPassCar] = useState(null);
  const [showVipModal, setShowVipModal] = useState(false);
const isSubscribed = Boolean(userProfile?.isVipMember);
const getPassDisplay = (code) => {
  const digits = (code || userProfile?.vipCode || '0000').replace(/\D/g, '');
  return isSubscribed ? `VIP-${digits}` : digits;
};

const handleSubscribeVip = async (method) => {
  const subRecord = {
    plan: 'Sky Black Card',
    price: 49,
    method,
    last4: Math.floor(1000 + Math.random() * 9000),
    date: Date.now(),
    status: 'Done'
  };
  await update(ref(db, `users/${uid}`), {
    isVipMember: true,
    vipSubscription: subRecord
  });
  setShowVipModal(false);
};
  const [newCar, setNewCar] = useState({ make: '', model: '', color: '', plate: '' });

  const garageCars = userProfile?.garage ? Object.values(userProfile.garage) : [];
  const myPlates = garageCars.map(c => (c.licensePlate || '').toUpperCase()).filter(Boolean);

  useEffect(() => {
    const unsubVenues = onValue(ref(db, 'venues'), (snap) => {
      if (snap.exists()) setAllVenues(snap.val());
    });

    const unsubTickets = onValue(ref(db, 'tickets'), (snap) => {
      if (snap.exists()) {
        const data = snap.val();
        const all = Object.keys(data).map(k => ({ id: k, ...data[k] }));
        const matched = all.filter(t =>
          t.customerId === uid ||
          (t.vehicle?.licensePlate && myPlates.includes(t.vehicle.licensePlate.toUpperCase()))
        );
        setMyTickets(matched.sort((a, b) => ((b.timestamps && b.timestamps.parkedAt) || 0) - ((a.timestamps && a.timestamps.parkedAt) || 0)));
      } else {
        setMyTickets([]);
      }
    });

    return () => { unsubVenues(); unsubTickets(); };
  }, [uid, JSON.stringify(myPlates)]);

  const handleAddCar = async (e) => {
    e.preventDefault();
    if (!newCar.make || !newCar.plate) return;
    const carId = `car_${Date.now()}`;
    const carCode = `VIP-${Math.floor(1000 + Math.random() * 9000)}`;
    await set(ref(db, `users/${uid}/garage/${carId}`), {
      id: carId,
      make: newCar.make,
      model: newCar.model,
      color: newCar.color || 'Black',
      licensePlate: newCar.plate.toUpperCase(),
      vipCode: carCode
    });
    setNewCar({ make: '', model: '', color: '', plate: '' });
    setShowAddCarModal(false);
  };

  const handleDeleteCar = async (carId) => {
    await remove(ref(db, `users/${uid}/garage/${carId}`));
  };

  const activeParkedTickets = myTickets.filter(t => t.status !== 'retrieved');
  const pastTickets = myTickets.filter(t => t.status === 'retrieved');
  const availableMakes = Object.keys(CAR_DATABASE);
  const availableModels = CAR_DATABASE[newCar.make] || [];

  return (
    <div className="app-container">
      <div className="dashboard-wrapper" style={{ maxWidth: '1050px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '28px' }}>
          <div>
            <span style={{ color: 'var(--accent-green)', fontWeight: 800, fontSize: '0.8rem', letterSpacing: '1.5px', textTransform: 'uppercase' }}>{isSubscribed ? '👑 VIP Member Garage' : 'Member Garage'}</span>
            <h1 className="heading-dashboard">Welcome, {userProfile?.name || 'VIP Guest'}</h1>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button onClick={() => setShowAddCarModal(true)} className="btn-green" style={{ width: 'auto', padding: '12px 24px' }}>+ Add Vehicle</button>
            <button onClick={() => signOut(auth)} className="btn-outline" style={{ width: 'auto', padding: '12px 20px' }}>Logout</button>
          </div>
        </div>

        {/* LIVE ACTIVE VALET TICKET BANNER */}
        {activeParkedTickets.length > 0 && (
          <div style={{ marginBottom: '32px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {activeParkedTickets.map(activeT => {
              const venueName = allVenues[activeT.venueId]?.name || 'Partner Venue';
              return (
                <div key={activeT.id} className="animate-scale-in" style={{ background: 'linear-gradient(135deg, #065f46 0%, #10b981 100%)', color: 'white', borderRadius: '20px', padding: '24px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', boxShadow: 'var(--shadow-btn)' }}>
                  <div>
                    <span style={{ background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '999px', fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase' }}>
                      🟢 Live Parked Vehicle • {venueName}
                    </span>
                    <h3 style={{ margin: '10px 0 4px 0', fontSize: '1.6rem', fontWeight: 900 }}>
                      {activeT.vehicle?.make} {activeT.vehicle?.model} ({activeT.vehicle?.licensePlate})
                    </h3>
                    <p style={{ margin: 0, opacity: 0.9, fontWeight: 600 }}>
                      Status: <strong style={{ textTransform: 'uppercase' }}>{activeT.status}</strong> {activeT.parkingSpot ? `• Spot ${activeT.parkingSpot}` : ''} {activeT.wantsWash ? `• 🫧 Wash: ${activeT.washStatus}` : ''}
                    </p>
                  </div>
                  <button onClick={() => onOpenLiveTicket(activeT.id)} className="btn-outline" style={{ width: 'auto', background: 'white', color: '#065f46', border: 'none', padding: '14px 24px', fontWeight: 800 }}>
                    Open Live Controls & Request Car →
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Navigation Tabs */}
        <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
          <button onClick={() => setActiveTab('garage')} className={activeTab === 'garage' ? 'btn-dev' : 'btn-outline'} style={{ width: 'auto', padding: '12px 28px' }}>
            🚘 My Saved Fleet ({garageCars.length})
          </button>
          <button onClick={() => setActiveTab('history')} className={activeTab === 'history' ? 'btn-dev' : 'btn-outline'} style={{ width: 'auto', padding: '12px 28px' }}>
            🧾 Past Visits & Receipts ({pastTickets.length})
          </button>
        </div>

        {/* VIP BLACK CARD MEMBERSHIP BANNER */}
<div style={{
  background: isSubscribed ? 'linear-gradient(135deg, #0f172a 0%, #334155 100%)' : 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
  border: isSubscribed ? '2px solid #f59e0b' : '1px solid #4338ca',
  color: 'white', borderRadius: '20px', padding: '24px 28px', marginBottom: '28px',
  display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', boxShadow: 'var(--shadow-lg)'
}}>
  <div>
    <span style={{ background: isSubscribed ? '#f59e0b' : 'rgba(255,255,255,0.15)', color: isSubscribed ? '#0f172a' : '#fff', padding: '4px 12px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 900, textTransform: 'uppercase', letterSpacing: '1px' }}>
      {isSubscribed ? '👑 Active Sky Black Card' : '⚡ Upgrade Available'}
    </span>
    <h3 style={{ margin: '10px 0 4px 0', fontSize: '1.5rem', fontWeight: 900 }}>
      {isSubscribed ? 'VIP Priority & 50% Wash Discount Unlocked' : 'Get the Sky Valet Black Card — $49/mo'}
    </h3>
    <p style={{ margin: 0, color: '#cbd5e1', fontSize: '0.95rem', fontWeight: 500 }}>
      {isSubscribed ? 'Your vehicles automatically jump to #1 in the retrieval queue at all partner venues.' : 'Skip the retrieval line at every hotel & get 50% off unlimited luxury car washes.'}
    </p>
  </div>
  {!isSubscribed && (
    <button onClick={() => setShowVipModal(true)} className="btn-green" style={{ width: 'auto', background: '#f59e0b', color: '#0f172a', padding: '14px 24px', fontWeight: 900 }}>
      👑 Upgrade Now ($49/mo)
    </button>
  )}
</div>

        {/* MY GARAGE TAB */}
        {activeTab === 'garage' && (
          <div className="animate-slide-up" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(310px, 1fr))', gap: '24px' }}>
            {garageCars.map(car => (
              <div key={car.id} className="garage-car-card">
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                    <span className="plate-pill">{car.licensePlate}</span>
                    <button onClick={() => handleDeleteCar(car.id)} style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#cbd5e1', borderRadius: '8px', padding: '6px 10px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700 }}>
                      Remove
                    </button>
                  </div>
                  <h3 style={{ fontSize: '1.65rem', fontWeight: 900, margin: '0 0 4px 0' }}>{car.make} {car.model}</h3>
                  <p style={{ margin: 0, color: '#94a3b8', fontWeight: 600 }}>Exterior: {car.color} • Pass: <span style={{ color: isSubscribed ? '#f59e0b' : '#34d399', fontFamily: 'monospace', fontWeight: 800 }}>{getPassDisplay(car.vipCode)}</span></p>
                </div>

                <div style={{ marginTop: '24px', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.12)', display: 'flex', gap: '10px' }}>
                  <button onClick={() => setSelectedPassCar(car)} className="btn-green" style={{ padding: '12px', fontSize: '0.95rem' }}>
                    📲 Show Valet QR Pass
                  </button>
                </div>
              </div>
            ))}

            {garageCars.length === 0 && (
              <div className="editor-card" style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '48px 24px' }}>
                <h3 style={{ marginTop: 0, fontSize: '1.4rem', fontWeight: 800 }}>Your VIP Garage is Empty</h3>
                <p style={{ color: 'var(--text-muted)', maxWidth: '420px', margin: '0 auto 24px auto', fontWeight: 500 }}>
                  Add your car once so valets at partner hotels and restaurants can scan your digital pass in 1 second.
                </p>
                <button onClick={() => setShowAddCarModal(true)} className="btn-green" style={{ width: 'auto', margin: '0 auto', display: 'inline-flex' }}>+ Add Your First Vehicle</button>
              </div>
            )}
          </div>
        )}

        {/* PAST VISITS & RECEIPTS TAB */}
        {activeTab === 'history' && (
          <div className="animate-slide-up" style={{ overflowX: 'auto' }}>
            <table className="luxury-table">
              <thead>
                <tr><th>Date</th><th>Venue</th><th>Vehicle</th><th>Car Wash</th><th>Valet Tip</th><th>Status</th></tr>
              </thead>
              <tbody>
                {pastTickets.map(t => {
                  const d = t.timestamps?.parkedAt ? new Date(t.timestamps.parkedAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }) : '-';
                  const venueName = allVenues[t.venueId]?.name || t.venueId;
                  return (
                    <tr key={t.id}>
                      <td style={{ fontWeight: 600 }}>{d}</td>
                      <td style={{ fontWeight: 800 }}>{venueName}</td>
                      <td style={{ fontWeight: 700 }}>{t.vehicle?.make} {t.vehicle?.model} ({t.vehicle?.licensePlate})</td>
                      <td style={{ fontWeight: 700, color: t.washPaid ? 'var(--accent-blue)' : 'var(--text-muted)' }}>
                        {t.washPaid ? `Paid ($${t.washTransaction?.amount || 25})` : 'None'}
                      </td>
                      <td style={{ fontWeight: 700, color: t.tippedAmount ? 'var(--accent-green)' : 'var(--text-muted)' }}>
                        {t.tippedAmount ? `$${t.tippedAmount}.00` : '-'}
                      </td>
                      <td><span className="status-badge status-ready">Delivered</span></td>
                    </tr>
                  );
                })}
                {pastTickets.length === 0 && (
                  <tr><td colSpan="6" style={{ textAlign: 'center', padding: '48px', color: 'var(--text-muted)' }}>No past valet visits recorded yet.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* VIP SUBSCRIPTION CHECKOUT MODAL */}
{showVipModal && (
  <div className="modal-overlay">
    <div className="vibrant-card animate-scale-in">
      <span style={{ background: '#fef3c7', color: '#b45309', padding: '6px 14px', borderRadius: '999px', fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase' }}>Sky Black Card</span>
      <h3 style={{ fontSize: '1.6rem', fontWeight: 900, margin: '12px 0 8px 0' }}>VIP Membership</h3>
      <p style={{ color: 'var(--text-muted)', marginBottom: '20px', fontWeight: 500 }}>
        Instant #1 queue priority + 50% off every car wash: <strong>$49.00 / month</strong>
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '20px' }}>
        <button onClick={() => handleSubscribeVip('Apple Pay')} className="btn-apple-pay"><ApplePayLogo /></button>
        <button onClick={() => handleSubscribeVip('Google Pay')} className="btn-google-pay"><GooglePayLogo /></button>
      </div>
      <button onClick={() => setShowVipModal(false)} className="btn-outline" style={{ width: '100%' }}>Cancel</button>
    </div>
  </div>
)}

      {/* ADD VEHICLE MODAL */}
      {showAddCarModal && (
        <div className="modal-overlay">
          <div className="vibrant-card animate-scale-in" style={{ textAlign: 'left' }}>
            <h3 style={{ marginTop: 0, fontSize: '1.5rem', fontWeight: 800 }}>Add Vehicle to Garage</h3>
            <form onSubmit={handleAddCar}>
              <Autocomplete options={availableMakes} value={newCar.make} onChange={(val) => setNewCar({ ...newCar, make: val, model: '' })} placeholder="Vehicle Make (e.g. BMW)" isObject={false} />
              <Autocomplete options={availableModels} value={newCar.model} onChange={(val) => setNewCar({ ...newCar, model: val })} placeholder="Vehicle Model (e.g. M5)" isObject={false} />
              <input placeholder="Exterior Color (e.g. Matte Black)" required className="vibrant-input" style={{ marginBottom: '16px' }} value={newCar.color} onChange={e => setNewCar({ ...newCar, color: e.target.value })} />
              <input placeholder="License Plate Number" required className="vibrant-input" style={{ marginBottom: '24px', textTransform: 'uppercase', fontWeight: 800 }} value={newCar.plate} onChange={e => setNewCar({ ...newCar, plate: e.target.value })} />
              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="submit" className="btn-green" style={{ flex: 2 }}>Save to Garage</button>
                <button type="button" onClick={() => setShowAddCarModal(false)} className="btn-outline" style={{ flex: 1 }}>Cancel</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VIP EXPRESS QR PASS MODAL */}
      {selectedPassCar && (
        <div className="modal-overlay">
          <div className="vibrant-card animate-scale-in">
            <div style={{ background: '#0f172a', color: 'white', margin: '-32px -32px 24px -32px', padding: '24px' }}>
              <span style={{ color: '#34d399', fontWeight: 800, fontSize: '0.8rem', letterSpacing: '1.5px', textTransform: 'uppercase' }}>Sky Valet Express Pass</span>
              <h3 style={{ margin: '6px 0 0 0', fontSize: '1.6rem', fontWeight: 900 }}>{selectedPassCar.make} {selectedPassCar.model}</h3>
              <p style={{ margin: '4px 0 0 0', color: '#94a3b8', fontWeight: 600 }}>{selectedPassCar.licensePlate} • {selectedPassCar.color}</p>
            </div>

            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: '0 0 16px 0', fontWeight: 500 }}>
              Show this pass to the valet runner. They can scan the QR or enter your Express Code below:
            </p>

            <div style={{ background: '#fff', padding: '16px', borderRadius: '16px', display: 'inline-block', border: '2px solid var(--card-border)', boxShadow: 'var(--shadow-md)', marginBottom: '16px' }}>
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=${encodeURIComponent(getPassDisplay(selectedPassCar.vipCode))}`}
                alt="VIP Car QR"
                style={{ display: 'block' }}
              />
            </div>

            <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '12px', border: '2px dashed #cbd5e1', marginBottom: '24px' }}>
              <span style={{ display: 'block', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>Valet Express Code / Plate</span>
              <strong style={{ fontSize: '1.5rem', fontFamily: 'monospace', letterSpacing: '2px', color: 'var(--text-main)' }}>
                {getPassDisplay(selectedPassCar.vipCode)}
              </strong>
            </div>

            <button onClick={() => setSelectedPassCar(null)} className="btn-outline" style={{ width: '100%' }}>Done</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ------------------------------------------------------------------
// LOG ARRIVAL MODAL (Edit / Create / Pre-filled from VIP Scan)
// ------------------------------------------------------------------
function LogArrivalModal({ onClose, venueId, parkingMap, occupiedSpots, knownPlates, editingTicket = null, prefillVipData = null }) {
  const [newlyCreatedTicket, setNewlyCreatedTicket] = useState(null);
  const [isMapOpen, setIsMapOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [formData, setFormData] = useState({ make: '', model: '', color: '', plate: '', spot: '', countryCode: '+971', phone: '', customerId: null });

  useEffect(() => {
    if (editingTicket && editingTicket.vehicle) {
      const phoneParts = (editingTicket.guestPhone || "").split(' ');
      setFormData({
        make: editingTicket.vehicle.make || '', model: editingTicket.vehicle.model || '',
        color: editingTicket.vehicle.color || '', plate: editingTicket.vehicle.licensePlate || '',
        spot: editingTicket.parkingSpot || '', countryCode: phoneParts[0] || '+971', phone: phoneParts.slice(1).join(' ') || '',
        customerId: editingTicket.customerId || null
      });
    } else if (prefillVipData) {
      const phoneParts = (prefillVipData.phone || "").split(' ');
      setFormData({
        make: prefillVipData.make || '', model: prefillVipData.model || '',
        color: prefillVipData.color || '', plate: prefillVipData.licensePlate || '',
        spot: '', countryCode: phoneParts[0] || '+971', phone: phoneParts.slice(1).join(' ') || '',
        customerId: prefillVipData.customerId || null,
        isVipMember: Boolean(prefillVipData.isVipMember)
      });
    }
  }, [editingTicket, prefillVipData]);

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

    const normalizedPlate = formData.plate.trim().toUpperCase();

    // Prevent parking the same vehicle twice while it still has an active ticket
    const activeSnap = await get(ref(db, 'tickets'));
    if (activeSnap.exists()) {
      const allTickets = activeSnap.val();
      const duplicateId = Object.keys(allTickets).find(id => {
        const t = allTickets[id];
        const samePlate = t.vehicle?.licensePlate?.trim().toUpperCase() === normalizedPlate;
        const isStillParked = t.status !== 'retrieved';
        const isNotCurrentEdit = !editingTicket || id !== editingTicket.id;
        return samePlate && isStillParked && isNotCurrentEdit;
      });

      if (duplicateId) {
        const dup = allTickets[duplicateId];
        setErrorMsg(`⚠️ ${normalizedPlate} is already parked (${dup.parkingSpot || 'Draft'})!`);
        return;
      }
    }

    const fullPhone = `${formData.countryCode} ${formData.phone}`.trim();
    
    if (editingTicket) {
      await update(ref(db, `tickets/${editingTicket.id}`), {
        guestPhone: fullPhone,
        customerId: formData.customerId || null,
        vehicle: { make: formData.make, model: formData.model, color: formData.color, licensePlate: normalizedPlate },
        parkingSpot: formData.spot,
        status: editingTicket.status === "draft" ? "parked" : editingTicket.status, 
        "timestamps/parkedAt": editingTicket.status === "draft" ? Date.now() : (editingTicket.timestamps?.parkedAt || Date.now())
      });
      onClose();
    } else {
      const ticketId = `ticket_${Date.now()}`;
      await set(ref(db, `tickets/${ticketId}`), {
        venueId: venueId,
        guestPhone: fullPhone,
        customerId: formData.customerId || null,
        isVipMember: Boolean(formData.isVipMember),
        vehicle: { make: formData.make, model: formData.model, color: formData.color, licensePlate: normalizedPlate },
        parkingSpot: formData.spot, status: "parked", parkedByUserId: auth.currentUser.uid,
        timestamps: { parkedAt: Date.now(), requestedAt: null, retrievedAt: null }
      });

      // Registered guests get the ticket straight in their app—close modal instead of showing a QR popup
      if (formData.customerId || prefillVipData) {
        onClose();
      } else {
        setNewlyCreatedTicket(ticketId);
      }
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
        color: past.vehicle?.color || '', countryCode: phoneParts[0] || '+971', phone: phoneParts.slice(1).join(' ') || '',
        customerId: past.customerId || null
      });
    }
  };

  return (
    <div className="modal-overlay">
      <div className="vibrant-card animate-scale-in" style={{width: '90%', maxWidth: isMapOpen ? '850px' : '460px', padding: '40px', maxHeight: '90vh', overflowY: 'auto', transition: 'max-width 0.4s cubic-bezier(0.16, 1, 0.3, 1)'}}>
        
        {newlyCreatedTicket ? (
          <div className="animate-slide-up">
            <h2 className="heading-brand" style={{color: 'var(--accent-green)'}}>TICKET ACTIVE</h2>
            <p style={{ color: 'var(--text-muted)', fontWeight: 500 }}>If this guest is a registered VIP member, this ticket is already live in their app.</p>
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
            <h2 className="heading-brand" style={{color: 'var(--text-main)', fontSize: '1.75rem', marginBottom: '16px'}}>
              {editingTicket && editingTicket.id !== 'new'
                ? 'EDIT DETAILS'
                : prefillVipData
                ? (prefillVipData.isVipMember ? '👑 VIP PASS SCANNED' : '⚡ GUEST PASS SCANNED')
                : 'LOG ARRIVAL'}
            </h2>
            
            {prefillVipData && (
              <div style={{
                background: prefillVipData.isVipMember ? '#fef3c7' : '#ecfdf5',
                color: prefillVipData.isVipMember ? '#b45309' : '#065f46',
                padding: '10px 14px', borderRadius: '10px', marginBottom: '16px', fontWeight: 700, fontSize: '0.9rem',
                border: prefillVipData.isVipMember ? '1px solid #f59e0b' : '1px solid #a7f3d0'
              }}>
                {prefillVipData.isVipMember ? '👑 VIP Black Card Member — ' : '✓ '}
                Auto-filled from {prefillVipData.ownerName || 'Guest'}'s Garage. Just pick a spot!
              </div>
            )}

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
              <button type="submit" className="btn-green" style={{flex: 2}}>
  {editingTicket && editingTicket.id !== 'new' ? 'Save Update' : (prefillVipData || formData.customerId) ? 'Park Vehicle' : 'Generate Ticket'}
</button>
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
function GuestTicketView({ ticketId, onBack }) {
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
    const transaction = { date: Date.now(), last4: Math.floor(1000 + Math.random() * 9000), status: 'Done', method: method, amount: effectiveWashPrice };
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
  if (!ticket) return (
    <div className="app-container center-wrapper">
      <div className="vibrant-card animate-scale-in">
        <h3 style={{ marginTop: 0 }}>Ticket Not Found</h3>
        <p style={{ color: 'var(--text-muted)' }}>This ticket ID does not exist or has expired.</p>
        {onBack && <button onClick={onBack} className="btn-outline" style={{ width: '100%', marginTop: '16px' }}>← Return</button>}
      </div>
    </div>
  );

  const { vehicle, status, parkedByPhone, parkedByName, wantsWash, washStatus } = ticket;
  const baseWashPrice = venueSettings.carWashPrice || 25;
const effectiveWashPrice = ticket.isVipMember ? Math.round(baseWashPrice * 0.5) : baseWashPrice;

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
          {onBack && <button onClick={onBack} className="btn-outline" style={{ width: '100%', marginTop: '24px' }}>← Back</button>}
        </div>
      </div>
    );
  }

  const parkedTimeMs = Date.now() - (ticket.timestamps?.parkedAt || Date.now());
  const hoursParked = Math.floor(parkedTimeMs / (1000 * 60 * 60));
  const minsParked = Math.floor((parkedTimeMs % (1000 * 60 * 60)) / (1000 * 60));

  return (
    <div className="app-container center-wrapper">
      <div className="vibrant-card animate-slide-up" style={{padding: '24px'}}>
        <div style={{background: 'var(--accent-green)', padding: '24px', margin: '-24px -24px 24px -24px', color: 'white', boxShadow: 'var(--shadow-sm)'}}>
          {onBack && (
            <button onClick={onBack} style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '6px 12px', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', marginBottom: '8px', fontFamily: 'var(--font-ui)' }}>
              ← Back to Garage
            </button>
          )}
          <h2 style={{margin: 0, fontSize: '1.5rem', fontWeight: 800}}>SKY VALET</h2>
          <p style={{margin: '4px 0 0 0', opacity: 0.9, fontSize: '0.9rem', fontWeight: 500}}>Digital Parking Pass</p>
        </div>

        <h3 style={{fontSize: '1.75rem', fontWeight: 800, margin: '0 0 4px 0'}}>{vehicle?.make || 'Unknown'} {vehicle?.model || ''}</h3>
        <p style={{color: 'var(--text-muted)', fontSize: '1.1rem', margin: '0 0 24px 0', fontWeight: 600}}>{vehicle?.licensePlate || ''} • {vehicle?.color || ''}</p>

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
                🫧 Premium Car Wash (${effectiveWashPrice})
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
              {(venueSettings.returnLocations || ["Main Entrance"]).map(loc => <option key={loc}>{loc}</option>)}
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
            <p style={{color: 'var(--text-muted)', marginBottom: '24px', fontWeight: 500}}>Premium Car Wash Service: <strong>${effectiveWashPrice}.00</strong></p>
            <div style={{display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '24px'}}>
              <button onClick={() => handleWashCheckout('Apple Pay')} className="btn-apple-pay"><ApplePayLogo/></button>
              <button onClick={() => handleWashCheckout('Google Pay')} className="btn-google-pay"><GooglePayLogo/></button>
            </div>
            <button onClick={() => setShowPaymentModal(false)} className="btn-outline" style={{width: '100%'}}>Cancel</button>
          </div>
        </div>
      )}

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
// SUPER ADMIN DASHBOARD (DEVELOPER SAAS PORTAL)
// ------------------------------------------------------------------
function DeveloperView() {
  const [activeTab, setActiveTab] = useState('venues');
  const [allVenues, setAllVenues] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [allTickets, setAllTickets] = useState([]);
  
  const [newEmail, setNewEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [newUserRole, setNewUserRole] = useState('valet_runner');
  const [newUserVenue, setNewUserVenue] = useState('');
  const [devConfirm, setDevConfirm] = useState({ isOpen: false, title: '', message: '', onConfirm: null, isDanger: true, singleButton: false, confirmText: 'Confirm' });

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

  const showNotice = (title, message, isDanger = false) => {
    setDevConfirm({
      isOpen: true, title, message, isDanger, singleButton: true, confirmText: "OK",
      onConfirm: () => setDevConfirm(prev => ({ ...prev, isOpen: false })),
      onCancel: () => setDevConfirm(prev => ({ ...prev, isOpen: false }))
    });
  };

  const handleCreateVenue = async (e) => {
    e.preventDefault();
    const cleanId = newVenueId.trim();
    await set(ref(db, `venues/${cleanId}`), {
      name: newVenueName, type: "hotel", isActive: true,
      settings: { tier: newVenueTier, carWashEnabled: newVenueTier === 2, carWashPrice: 25, returnLocations: ["Main Entrance"] }
    });
    setNewVenueId(''); setNewVenueName('');
    showNotice("Venue Created", `${newVenueName} (${cleanId}) is now live on Tier ${newVenueTier}.`, false);
  };

  const handleProvisionUser = async (e) => {
    e.preventDefault();
    if (!newUserVenue) return showNotice("Venue Required", "Please select a venue to assign this staff account to.", true);
    
    try {
      const appOptions = auth.app.options;
      const secondaryApp = getApps().find(app => app.name === "StaffCreator") || initializeApp(appOptions, "StaffCreator");
      const secondaryAuth = getAuth(secondaryApp);
      
      const userCredential = await createUserWithEmailAndPassword(secondaryAuth, newEmail, newPassword);
      const newUid = userCredential.user.uid;
      
      await set(ref(db, `users/${newUid}`), { role: newUserRole, venueId: newUserVenue, email: newEmail });
      await secondaryAuth.signOut();
      
      const createdEmail = newEmail;
      setNewEmail(''); setNewPassword('');
      showNotice("Account Created", `Staff login for ${createdEmail} has been provisioned and linked to ${newUserVenue}.`, false);
      
    } catch (error) {
      showNotice("Creation Error", error.message, true);
    }
  };

  const handleResetPassword = async (emailToReset) => {
    if(!emailToReset) return showNotice("Missing Email", "This legacy user has no email stored in the database. Delete the account and recreate it to enable password resets.", true);
    try {
      await sendPasswordResetEmail(auth, emailToReset);
      showNotice("Reset Email Sent", `A password reset link has been emailed to ${emailToReset}.`, false);
    } catch(err) {
      showNotice("Reset Failed", err.message, true);
    }
  };

  const promptToggleTier = (venueId, currentTier) => {
    setDevConfirm({
      isOpen: true, singleButton: false, confirmText: "Confirm Change",
      title: "Change SaaS Tier",
      message: `Are you sure you want to ${currentTier === 1 ? 'UPGRADE this venue to Premium (Tier 2)?' : 'DOWNGRADE this venue to Standard (Tier 1)?'}`,
      isDanger: currentTier === 2,
      onConfirm: async () => {
        await update(ref(db, `venues/${venueId}/settings`), { tier: currentTier === 1 ? 2 : 1 });
        setDevConfirm(prev => ({ ...prev, isOpen: false }));
      },
      onCancel: () => setDevConfirm(prev => ({ ...prev, isOpen: false }))
    });
  };

  const promptDeleteVenue = (venueId) => {
    setDevConfirm({
      isOpen: true, singleButton: false, confirmText: "Delete Venue",
      title: "Delete Venue?",
      message: `CRITICAL: Are you sure you want to completely delete ${venueId}? This will destroy all their settings and parking maps.`,
      isDanger: true,
      onConfirm: async () => {
        await remove(ref(db, `venues/${venueId}`));
        setDevConfirm(prev => ({ ...prev, isOpen: false }));
      },
      onCancel: () => setDevConfirm(prev => ({ ...prev, isOpen: false }))
    });
  };

  const promptDeleteStaff = (uid, email) => {
    setDevConfirm({
      isOpen: true, singleButton: false, confirmText: "Delete Account",
      title: "Delete Staff Account?",
      message: `Are you sure you want to remove access for ${email || uid}? They will immediately be locked out of the platform.`,
      isDanger: true,
      onConfirm: async () => {
        await remove(ref(db, `users/${uid}`));
        setDevConfirm(prev => ({ ...prev, isOpen: false }));
      },
      onCancel: () => setDevConfirm(prev => ({ ...prev, isOpen: false }))
    });
  };

  const formatTxDateTime = (timestamp) => {
    if (!timestamp) return { date: '-', time: '-' };
    const d = new Date(timestamp);
    return { date: d.toLocaleDateString([], {month: 'short', day: 'numeric', year: 'numeric'}), time: d.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) };
  };

  return (
    <div className="app-container" style={{backgroundColor: '#0f172a'}}>
      <div className="dashboard-wrapper">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
          <h1 className="heading-dashboard" style={{color: 'white'}}>SaaS Control Room</h1>
          <button onClick={() => signOut(auth)} className="btn-outline" style={{fontSize: '0.85rem', padding: '8px 16px', background: 'transparent', color: 'white', borderColor: 'rgba(255,255,255,0.2)', boxShadow: 'none'}}>Logout</button>
        </div>

        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', overflowX: 'auto', paddingBottom: '8px' }}>
          <button className={activeTab === 'venues' ? 'btn-dev' : 'btn-outline'} style={activeTab !== 'venues' ? {background: 'transparent', color: 'white', width: 'auto'} : {background: 'white', color: 'var(--dev-black)', width: 'auto'}} onClick={() => setActiveTab('venues')}>Client Venues</button>
          <button className={activeTab === 'users' ? 'btn-dev' : 'btn-outline'} style={activeTab !== 'users' ? {background: 'transparent', color: 'white', width: 'auto'} : {background: 'white', color: 'var(--dev-black)', width: 'auto'}} onClick={() => setActiveTab('users')}>Staff Creation</button>
          <button className={activeTab === 'finance' ? 'btn-dev' : 'btn-outline'} style={activeTab !== 'finance' ? {background: 'transparent', color: 'white', width: 'auto'} : {background: 'white', color: 'var(--dev-black)', width: 'auto'}} onClick={() => setActiveTab('finance')}>Global Revenue</button>
        </div>

        <div>
          {activeTab === 'venues' && (
            <div className="animate-slide-up" style={{display: 'grid', gridTemplateColumns: '1fr', gap: '24px'}}>
              <div className="vibrant-card" style={{maxWidth: '100%', textAlign: 'left', boxSizing: 'border-box'}}>
                <h3 style={{marginTop: 0, fontWeight: 800, color: 'var(--dev-black)'}}>Add New Client Venue</h3>
                <form onSubmit={handleCreateVenue} style={{display: 'flex', gap: '12px', alignItems: 'flex-start', flexWrap: 'wrap'}}>
                  <input placeholder="Venue ID (e.g. venue_002)" required className="vibrant-input dev-focus" value={newVenueId} onChange={e => setNewVenueId(e.target.value.toLowerCase().replace(/\s+/g, '_'))} style={{flex: 1, minWidth: '150px'}} />
                  <input placeholder="Display Name (e.g. North Platte)" required className="vibrant-input dev-focus" value={newVenueName} onChange={e => setNewVenueName(e.target.value)} style={{flex: 2, minWidth: '200px'}} />
                  <select className="vibrant-input dev-focus" value={newVenueTier} onChange={e => setNewVenueTier(Number(e.target.value))} style={{flex: 1, minWidth: '150px'}}>
                    <option value={1}>Tier 1 (Standard)</option>
                    <option value={2}>Tier 2 (Premium Wash)</option>
                  </select>
                  <button type="submit" className="btn-dev" style={{width: 'auto', whiteSpace: 'nowrap'}}>Create Venue</button>
                </form>
              </div>

              <div style={{background: 'white', borderRadius: '16px', overflow: 'hidden', boxShadow: 'var(--shadow-lg)'}}>
                <table className="luxury-table" style={{boxShadow: 'none', margin: 0}}>
                  <thead><tr><th>Venue ID</th><th>Display Name</th><th>SaaS Tier</th><th>Status</th><th>Actions</th></tr></thead>
                  <tbody>
                    {allVenues.map(v => (
                      <tr key={v.id}>
                        <td style={{fontWeight: '800', color: 'var(--dev-black)'}}>{v.id}</td>
                        <td style={{fontWeight: '600', color: 'var(--dev-black)'}}>{v.name || 'Unnamed Venue'}</td>
                        <td>
                          <span style={{background: v.settings?.tier === 1 ? '#cbd5e1' : 'var(--warning-yellow)', color: v.settings?.tier === 1 ? '#475569' : '#fff', padding: '4px 12px', borderRadius: '6px', fontWeight: 800, fontSize: '0.8rem'}}>
                            Tier {v.settings?.tier || 1}
                          </span>
                        </td>
                        <td style={{color: 'var(--accent-green)', fontWeight: 700}}>Active</td>
                        <td style={{display: 'flex', gap: '8px'}}>
                          <button onClick={() => promptToggleTier(v.id, v.settings?.tier || 1)} className="btn-outline" style={{padding: '6px 12px', fontSize: '0.8rem', boxShadow: 'none'}}>Change Tier</button>
                          <button onClick={() => promptDeleteVenue(v.id)} className="btn-action" style={{padding: '6px 12px', fontSize: '0.8rem', boxShadow: 'none'}}>Delete</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="animate-slide-up" style={{display: 'grid', gridTemplateColumns: '1fr', gap: '24px'}}>
              <div className="vibrant-card" style={{maxWidth: '100%', textAlign: 'left', boxSizing: 'border-box'}}>
                <h3 style={{marginTop: 0, fontWeight: 800, color: 'var(--dev-black)'}}>Create Staff Account</h3>
                <p style={{color: 'var(--text-muted)', marginBottom: '16px', fontWeight: 500}}>Generate logins for hotel managers and valets here. They cannot create accounts themselves.</p>
                
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

              {allVenues.map(venue => {
                const venueUsers = allUsers.filter(u => u.venueId === venue.id);
                return (
                  <div key={venue.id} className="vibrant-card" style={{maxWidth: '100%', textAlign: 'left', padding: '0', overflow: 'hidden', boxSizing: 'border-box'}}>
                    <div style={{background: '#f8fafc', padding: '16px 24px', borderBottom: '1px solid var(--card-border)'}}>
                      <h3 style={{margin: 0, fontWeight: 800, color: 'var(--dev-black)'}}>{venue.name} <span style={{color: 'var(--text-muted)', fontSize: '1rem', fontWeight: 500}}>({venue.id})</span></h3>
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
                                <div style={{fontWeight: '800', color: 'var(--dev-black)'}}>{u.email || 'Unknown Email (Legacy)'}</div>
                                <div style={{fontFamily: 'monospace', color: 'var(--text-muted)', fontSize: '0.8rem'}}>{u.uid}</div>
                              </td>
                              <td style={{fontWeight: '700', textTransform: 'capitalize', color: 'var(--dev-black)'}}>{(u.role || 'none').replace('_', ' ')}</td>
                              <td style={{display: 'flex', gap: '8px'}}>
                                <button onClick={() => handleResetPassword(u.email)} className="btn-outline" style={{padding: '6px 12px', fontSize: '0.8rem', boxShadow: 'none'}}>Reset Pass</button>
                                <button onClick={() => promptDeleteStaff(u.uid, u.email)} className="btn-action" style={{padding: '6px 12px', fontSize: '0.8rem', boxShadow: 'none'}}>Delete</button>
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

              <div className="vibrant-card" style={{ maxWidth: '100%', textAlign: 'left', background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)', color: 'white', border: '1px solid #4f46e5' }}>
  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px' }}>
    <div>
      <span style={{ color: '#f59e0b', fontWeight: 800, fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '1px' }}>100% Platform Owner Revenue</span>
      <h3 style={{ margin: '4px 0 0 0', fontSize: '1.6rem', fontWeight: 900 }}>VIP Black Card Subscriptions</h3>
    </div>
    <div style={{ textAlign: 'right' }}>
      <div style={{ fontSize: '0.8rem', color: '#cbd5e1', fontWeight: 700 }}>ACTIVE SUBSCRIBERS: {allUsers.filter(u => u.isVipMember).length}</div>
      <div style={{ fontSize: '2rem', fontWeight: 900, color: '#34d399' }}>
        ${(allUsers.filter(u => u.isVipMember).length * 49).toLocaleString()} / mo
      </div>
    </div>
  </div>
</div>
              
              {allVenues.map(venue => {
                const venueTransactions = allTickets.filter(t => t.venueId === venue.id && (t.washTransaction || t.tipTransaction));
                const washRev = venueTransactions.filter(t => t.washTransaction).reduce((acc, t) => acc + (t.washTransaction.amount || 0), 0);
                const tipRev = venueTransactions.filter(t => t.tipTransaction).reduce((acc, t) => acc + (t.tipTransaction.amount || 0), 0);
                
                let ledger = [];
                venueTransactions.forEach(t => {
                  if(t.washTransaction) ledger.push({ type: 'Car Wash', tx: t.washTransaction, vehicle: t.vehicle?.licensePlate || 'Unknown' });
                  if(t.tipTransaction) ledger.push({ type: 'Valet Tip', tx: t.tipTransaction, vehicle: t.vehicle?.licensePlate || 'Unknown' });
                });
                ledger.sort((a, b) => (b.tx?.date || 0) - (a.tx?.date || 0));

                return (
                  <div key={venue.id} className="vibrant-card" style={{maxWidth: '100%', textAlign: 'left', padding: '0', overflow: 'hidden', boxSizing: 'border-box'}}>
                    <div style={{background: '#f8fafc', padding: '16px 24px', borderBottom: '1px solid var(--card-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px'}}>
                      <h3 style={{margin: 0, fontWeight: 800, color: 'var(--dev-black)'}}>{venue.name} <span style={{color: 'var(--text-muted)', fontSize: '1rem', fontWeight: 500}}>({venue.id})</span></h3>
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
                      <div style={{overflowX: 'auto'}}>
                        <table className="luxury-table" style={{boxShadow: 'none', borderRadius: 0}}>
                          <thead><tr><th>Date & Time</th><th>Service Type</th><th>Plate</th><th>Method</th><th>Card Info</th><th>Amount</th><th>Status</th></tr></thead>
                          <tbody>
                            {ledger.map((row, i) => {
                              const { date, time } = formatTxDateTime(row.tx.date);
                              return (
                                <tr key={i}>
                                  <td style={{fontWeight: 600, color: 'var(--dev-black)'}}>{date} <span style={{color: 'var(--text-muted)', fontWeight: 500, marginLeft: '4px'}}>{time}</span></td>
                                  <td style={{fontWeight: 800, color: row.type === 'Car Wash' ? 'var(--accent-blue)' : 'var(--accent-green)'}}>{row.type}</td>
                                  <td style={{fontWeight: 700, color: 'var(--dev-black)'}}>{row.vehicle}</td>
                                  <td style={{fontWeight: 600, color: 'var(--dev-black)'}}>{row.tx.method}</td>
                                  <td style={{fontFamily: 'monospace', color: 'var(--text-muted)'}}>**** {row.tx.last4}</td>
                                  <td style={{fontWeight: 800, color: 'var(--dev-black)'}}>${row.tx.amount}.00</td>
                                  <td><span style={{background: row.tx.status === 'Done' ? '#ecfdf5' : '#fef2f2', color: row.tx.status === 'Done' ? 'var(--accent-green)' : 'var(--danger-red)', padding: '4px 12px', borderRadius: '6px', fontWeight: 800, fontSize: '0.8rem'}}>{row.tx.status}</span></td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
      
      <CustomConfirmWidget
        isOpen={devConfirm.isOpen}
        title={devConfirm.title}
        message={devConfirm.message}
        onConfirm={devConfirm.onConfirm}
        onCancel={devConfirm.onCancel}
        isDanger={devConfirm.isDanger}
        singleButton={devConfirm.singleButton}
        confirmText={devConfirm.confirmText}
      />
    </div>
  );
}

// ------------------------------------------------------------------
// WASH BAY STAFF DASHBOARD (Exclusive)
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

// ------------------------------------------------------------------
// VALET DISPATCHER DASHBOARD (With Working VIP Pass Scanner)
// ------------------------------------------------------------------
function ValetDashboardView({ parkingMap, venueId }) {
  const [tickets, setTickets] = useState([]);
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [scanInputCode, setScanInputCode] = useState('');
  const [scanError, setScanError] = useState('');
  const [registeredVipCars, setRegisteredVipCars] = useState([]);
  const [scannedVipPrefill, setScannedVipPrefill] = useState(null);

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

    // Load registered customer vehicles and strip "VIP-" unless they have an active subscription
    const unsubUsers = onValue(ref(db, 'users'), (snap) => {
      if (snap.exists()) {
        const usersObj = snap.val();
        const vipList = [];
        Object.keys(usersObj).forEach(uid => {
          const u = usersObj[uid];
          if (u.garage) {
            const isVip = Boolean(u.isVipMember);
            Object.values(u.garage).forEach(car => {
              const rawDigits = String(car.vipCode || u.vipCode || '').replace(/\D/g, '');
              vipList.push({
                ...car,
                rawCode: rawDigits,
                vipCode: isVip ? `VIP-${rawDigits}` : rawDigits,
                customerId: uid,
                ownerName: u.name || 'Guest',
                phone: u.phone || '+971 500000000',
                isVipMember: isVip
              });
            });
          }
        });
        setRegisteredVipCars(vipList);
      }
    });

    return () => { unsubscribe(); unsubUsers(); };
  }, [venueId]);

  const videoRef = useRef(null);

  const matchScannedCode = (rawText) => {
    const query = String(rawText || '').trim().toUpperCase();
    if (!query) return false;
    const digitsOnly = query.replace(/\D/g, '');

    const match = registeredVipCars.find(c =>
      (c.vipCode && c.vipCode.toUpperCase() === query) ||
      (c.rawCode && digitsOnly && c.rawCode === digitsOnly) ||
      (c.licensePlate && c.licensePlate.toUpperCase() === query)
    );

    if (match) {
      const alreadyParked = tickets.find(
        t => t.vehicle?.licensePlate && t.vehicle.licensePlate.toUpperCase() === match.licensePlate.toUpperCase()
      );
      if (alreadyParked) {
        setScanError(`⚠️ ${match.make} (${match.licensePlate}) is already parked in ${alreadyParked.parkingSpot || 'Draft'}!`);
        return true;
      }

      setShowScannerModal(false);
      setScanInputCode('');
      setScannedVipPrefill(match);
      return true;
    }
    return false;
  };

  // Live Camera QR Scanner when modal opens
  useEffect(() => {
    if (!showScannerModal) return;
    let stream = null;
    let scanInterval = null;
    let isCancelled = false;

    const startCamera = async () => {
      try {
        // Load jsQR fallback in background for browsers without native BarcodeDetector
        if (!('BarcodeDetector' in window) && !window.jsQR) {
          const script = document.createElement('script');
          script.src = 'https://cdn.jsdelivr.net/npm/jsqr@1.4.0/dist/jsQR.min.js';
          document.body.appendChild(script);
        }

        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: false
        });

        if (isCancelled) {
          stream.getTracks().forEach(t => t.stop());
          return;
        }

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute('playsinline', true);
          await videoRef.current.play();
        }

        const nativeDetector = 'BarcodeDetector' in window
          ? new window.BarcodeDetector({ formats: ['qr_code'] })
          : null;
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        scanInterval = setInterval(async () => {
          if (!videoRef.current || videoRef.current.readyState !== 4) return;
          try {
            if (nativeDetector) {
              const codes = await nativeDetector.detect(videoRef.current);
              if (codes.length > 0 && codes[0].rawValue) {
                matchScannedCode(codes[0].rawValue);
              }
            } else if (window.jsQR) {
              canvas.width = videoRef.current.videoWidth;
              canvas.height = videoRef.current.videoHeight;
              ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
              const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
              const code = window.jsQR(imgData.data, imgData.width, imgData.height);
              if (code && code.data) {
                matchScannedCode(code.data);
              }
            }
          } catch (e) { /* ignore frame read errors */ }
        }, 250);
      } catch (err) {
        setScanError('Camera permission denied or unavailable. Type pass code below.');
      }
    };

    startCamera();

    return () => {
      isCancelled = true;
      if (scanInterval) clearInterval(scanInterval);
      if (stream) stream.getTracks().forEach(t => t.stop());
    };
  }, [showScannerModal, registeredVipCars]);

  const handleVipScanLookup = (e) => {
    e.preventDefault();
    setScanError('');
    if (!matchScannedCode(scanInputCode)) {
      setScanError('No registered vehicle found with that Pass Code or Plate.');
    }
  };

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
  const requested = tickets
    .filter(t => t.status === "requested")
    .sort((a, b) => (b.isVipMember ? 1 : 0) - (a.isVipMember ? 1 : 0));
  const incomingReady = tickets.filter(t => t.status === "incoming" || t.status === "ready");
  const parked = tickets.filter(t => t.status === "parked");
  const occupiedSpots = parked.map(t => t.parkingSpot);

  return (
    <div className="app-container">
      <div className="dashboard-wrapper">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', flexWrap: 'wrap', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
            <h1 className="heading-dashboard">Dispatcher</h1>
            <button onClick={() => signOut(auth)} className="btn-outline" style={{fontSize: '0.85rem', padding: '8px 16px', boxShadow: 'none', width: 'auto'}}>Logout</button>
          </div>
          <div style={{display: 'flex', gap: '12px', flexWrap: 'wrap'}}>
            <button onClick={() => { setScanError(''); setShowScannerModal(true); }} className="btn-outline" style={{width: 'auto', background: 'white'}}>📷 Scan Guest Pass</button>
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
                {t.isVipMember && (
                  <span className="status-badge" style={{ background: '#fef3c7', color: '#b45309', border: '1px solid #f59e0b' }}>
                    👑 VIP PRIORITY #1
                  </span>
                )}
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
      
      {(draftToEdit || scannedVipPrefill) && (
        <LogArrivalModal
          onClose={() => { setDraftToEdit(null); setScannedVipPrefill(null); }}
          venueId={venueId}
          parkingMap={parkingMap}
          occupiedSpots={occupiedSpots}
          knownPlates={knownPlates}
          editingTicket={draftToEdit}
          prefillVipData={scannedVipPrefill}
        />
      )}

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

      {/* WORKING CAMERA & CODE SCANNER MODAL */}
      {showScannerModal && (
        <div className="modal-overlay">
          <div className="vibrant-card animate-scale-in" style={{maxWidth: '440px'}}>
            <h3 style={{marginTop: 0, fontWeight: 800, fontSize: '1.5rem'}}>Scan Guest Pass</h3>
            <div style={{background: '#000', height: '220px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', marginBottom: '20px', position: 'relative', overflow: 'hidden', boxShadow: 'inset 0 0 20px rgba(0,0,0,0.8)'}}>
              <video ref={videoRef} style={{ width: '100%', height: '100%', objectFit: 'cover' }} muted playsInline />
              <div style={{position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: 'var(--accent-green)', boxShadow: '0 0 15px 2px var(--accent-green)', animation: 'scanLaser 2s linear infinite', pointerEvents: 'none'}}></div>
            </div>

            {scanError && <div style={{ background: '#fef2f2', color: 'var(--danger-red)', padding: '10px', borderRadius: '8px', marginBottom: '12px', fontSize: '0.85rem', fontWeight: 700 }}>{scanError}</div>}

            <form onSubmit={handleVipScanLookup} style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <input
                type="text"
                placeholder="Pass Code (e.g. 4359) or Plate"
                className="vibrant-input"
                style={{ textTransform: 'uppercase', fontWeight: 700 }}
                value={scanInputCode}
                onChange={(e) => setScanInputCode(e.target.value)}
              />
              <button type="submit" className="btn-green" style={{ width: 'auto', padding: '0 20px' }}>Load</button>
            </form>

            {registeredVipCars.map((c, idx) => {
                  const activeTicket = tickets.find(
                    t => t.vehicle?.licensePlate && t.vehicle.licensePlate.toUpperCase() === c.licensePlate?.toUpperCase()
                  );
                  return (
                    <div
                      key={idx}
                      onClick={() => {
                        if (activeTicket) {
                          setScanError(`⚠️ ${c.make} (${c.licensePlate}) is already parked in ${activeTicket.parkingSpot || 'Draft'}!`);
                          return;
                        }
                        setShowScannerModal(false);
                        setScannedVipPrefill(c);
                      }}
                      style={{
                        padding: '8px 10px', borderRadius: '8px',
                        cursor: activeTicket ? 'not-allowed' : 'pointer',
                        opacity: activeTicket ? 0.55 : 1,
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                        fontWeight: 700, fontSize: '0.9rem', borderBottom: '1px solid #e2e8f0'
                      }}
                    >
                      <span>{c.make} {c.model} ({c.licensePlate})</span>
                      {activeTicket ? (
                        <span style={{ color: 'var(--danger-red)', fontSize: '0.8rem', fontWeight: 800 }}>
                          Parked ({activeTicket.parkingSpot || 'Draft'})
                        </span>
                      ) : (
                        <span style={{ color: c.isVipMember ? '#f59e0b' : 'var(--accent-green)', fontFamily: 'monospace', fontWeight: 800 }}>
                          {c.isVipMember ? `👑 ${c.vipCode}` : c.rawCode}
                        </span>
                      )}
                    </div>
                  );
                })}

            <button onClick={() => setShowScannerModal(false)} className="btn-outline" style={{width: '100%', padding: '14px'}}>Close Scanner</button>
          </div>
        </div>
      )}
    </div>
  );
}

// ------------------------------------------------------------------
// MASTER ADMIN DASHBOARD (For Hotel Managers)
// ------------------------------------------------------------------
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
        
        setParkedCars(allTickets.filter(t => t.status !== "retrieved").sort((a, b) => ((b.timestamps && b.timestamps.parkedAt) || 0) - ((a.timestamps && a.timestamps.parkedAt) || 0)));
        setHistory(allTickets.filter(t => t.status === "retrieved").sort((a, b) => ((b.timestamps && b.timestamps.retrievedAt) || 0) - ((a.timestamps && a.timestamps.retrievedAt) || 0)));
        
        const memory = {};
        allTickets.forEach(t => { 
          if(t.vehicle?.licensePlate && typeof t.vehicle.licensePlate === 'string') {
            memory[t.vehicle.licensePlate.toUpperCase()] = t; 
          }
        });
        setKnownPlates(memory);
      } else {
        setParkedCars([]);
        setHistory([]);
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
            <button onClick={() => signOut(auth)} className="btn-outline" style={{fontSize: '0.85rem', padding: '8px 16px', boxShadow: 'none', width: 'auto'}}>Logout</button>
          </div>
          <button onClick={() => setDraftToEdit({ id: 'new' })} className="btn-green" style={{width: 'auto', padding: '12px 32px'}}>+ Add Vehicle</button>
        </div>

        <div style={{ display: 'flex', gap: '16px', marginBottom: '24px', overflowX: 'auto', paddingBottom: '8px' }}>
          <button className={activeTab === 'operations' ? 'btn-green' : 'btn-outline'} onClick={() => setActiveTab('operations')} style={{ padding: '12px 28px', whiteSpace: 'nowrap', width: 'auto' }}>Live Operations</button>
          <button className={activeTab === 'metrics' ? 'btn-green' : 'btn-outline'} onClick={() => setActiveTab('metrics')} style={{ padding: '12px 28px', whiteSpace: 'nowrap', width: 'auto' }}>Metrics</button>
          <button className={activeTab === 'map' ? 'btn-green' : 'btn-outline'} onClick={() => setActiveTab('map')} style={{ padding: '12px 28px', whiteSpace: 'nowrap', width: 'auto' }}>Map Editor</button>
          <button className={activeTab === 'settings' ? 'btn-green' : 'btn-outline'} onClick={() => setActiveTab('settings')} style={{ padding: '12px 28px', whiteSpace: 'nowrap', width: 'auto' }}>Settings</button>
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
                    
                    const retrievedAt = (t.timestamps && t.timestamps.retrievedAt) ? t.timestamps.retrievedAt : 0;
                    const requestedAt = (t.timestamps && t.timestamps.requestedAt) ? t.timestamps.requestedAt : 0;
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
                      <input type="checkbox" checked={venueSettings.tier === 1 ? false : Boolean(venueSettings.carWashEnabled)} onChange={handleToggleWash} disabled={venueSettings.tier === 1} />
                      <span className="toggle-slider"></span>
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
// APP ROUTER (Landing Page + Customer Garage + Staff Role Access)
// ------------------------------------------------------------------
function App() {
  const [userRole, setUserRole] = useState(null);
  const [userVenueId, setUserVenueId] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [currentUid, setCurrentUid] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  
  const [activeTicketOverlay, setActiveTicketOverlay] = useState(null);
  const [authScreenMode, setAuthScreenMode] = useState(null); // null = show Landing Page
  const [globalParkingMap, setGlobalParkingMap] = useState([]);

  const searchParams = new URLSearchParams(window.location.search);
  const requestedTicketId = searchParams.get('ticket');

  useEffect(() => {
    const styleSheet = document.createElement("style");
    styleSheet.innerText = vibrantStyles;
    document.head.appendChild(styleSheet);

    if (requestedTicketId) {
      setActiveTicketOverlay(requestedTicketId);
    }

    let unsubUserProfile = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
      if (unsubUserProfile) { unsubUserProfile(); unsubUserProfile = null; }

      if (currentUser) {
        setCurrentUid(currentUser.uid);
        unsubUserProfile = onValue(ref(db, `users/${currentUser.uid}`), (snapshot) => {
          if (snapshot.exists()) {
            const userData = snapshot.val();
            setUserProfile(userData);
            setUserRole(userData.role || "customer");
            setUserVenueId(userData.venueId || "venue_001");
          } else {
            setUserRole("valet_runner");
            setUserVenueId("venue_001");
          }
          setAuthLoading(false);
        });
      } else {
        setCurrentUid(null);
        setUserProfile(null);
        setUserRole(null);
        setUserVenueId(null);
        setAuthLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubUserProfile) unsubUserProfile();
      document.head.removeChild(styleSheet);
    };
  }, [requestedTicketId]);

  useEffect(() => {
    if (!userVenueId || userRole === 'developer' || userRole === 'customer') return;
    
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

  // Trap browser Back-Swipe / Back Button so it navigates inside the app instead of exiting the site
  useEffect(() => {
    window.history.pushState({ skyValetInternal: true }, '');
    const handlePopState = () => {
      if (activeTicketOverlay && !requestedTicketId) {
        setActiveTicketOverlay(null);
        window.history.pushState({ skyValetInternal: true }, '');
      } else if (!userRole && authScreenMode) {
        setAuthScreenMode(null);
        window.history.pushState({ skyValetInternal: true }, '');
      } else if (userRole) {
        // Keep logged-in users inside their dashboard when swiping back
        window.history.pushState({ skyValetInternal: true }, '');
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [activeTicketOverlay, authScreenMode, userRole, requestedTicketId]);

  if (authLoading) return <div className="app-container center-wrapper"><div className="animate-pulse" style={{color: 'var(--accent-green)', letterSpacing: '2px', fontWeight: 800}}>AUTHENTICATING...</div></div>;
  
  // Direct QR Ticket Tracker View (from URL or Customer Garage / Landing lookup)
  if (activeTicketOverlay) {
    return (
      <GuestTicketView
        ticketId={activeTicketOverlay}
        onBack={!requestedTicketId ? () => setActiveTicketOverlay(null) : null}
      />
    );
  }
  
  // Public Visitors: Show Luxury Landing Page first, then Auth Screen when clicked
  if (!userRole) {
    if (!authScreenMode) {
      return (
        <LandingPageView
          onNavigateAuth={(mode) => setAuthScreenMode(mode)}
          onOpenTicket={(id) => setActiveTicketOverlay(id)}
        />
      );
    }
    return (
      <LoginView
        initialMode={authScreenMode}
        onBackToLanding={() => setAuthScreenMode(null)}
      />
    );
  }

  // Logged-In Routes
  if (userRole === "customer") {
    return (
      <CustomerGarageView
        userProfile={userProfile}
        uid={currentUid}
        onOpenLiveTicket={(id) => setActiveTicketOverlay(id)}
      />
    );
  }
  if (userRole === "developer") return <DeveloperView />;
  if (userRole === "master_admin") return <MasterAdminView parkingMap={globalParkingMap} venueId={userVenueId} />;
  if (userRole === "wash_team") return <WashBayView venueId={userVenueId} />;
  
  return <ValetDashboardView parkingMap={globalParkingMap} venueId={userVenueId} />;
}

export default App;