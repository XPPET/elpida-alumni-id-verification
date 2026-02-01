import React, { useState, useRef, useEffect } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Download, GraduationCap, User, Award, Camera, CheckCircle, Database, ShieldCheck } from 'lucide-react';
import { toPng } from 'html-to-image';

import logo from './assets/logo.png';

function App() {
  const [name, setName] = useState('');
  const [year, setYear] = useState('2024');
  const [memberType, setMemberType] = useState('Μέλος');
  const [email, setEmail] = useState('');
  const [image, setImage] = useState(null);
  const [status, setStatus] = useState('idle');
  const [membersList, setMembersList] = useState([]);
  const fileInputRef = useRef(null);
  const csvInputRef = useRef(null);

  useEffect(() => {
    const savedMembers = localStorage.getItem('elpida_members');
    if (savedMembers) {
      setMembersList(JSON.parse(savedMembers));
    }
  }, []);

  const handleCSVUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      const rows = text.split('\n');
      const parsedMembers = rows.slice(2)
        .filter(row => row.trim() !== '')
        .map(row => {
          const columns = row.split(/[,;]/);
          return {
            name: `${columns[1]} ${columns[0]}`.trim().replace(/"/g, ''),
            email: columns[2]?.trim().replace(/"/g, '').toLowerCase() || ''
          };
        })
        .filter(m => m.name.length > 3);
      setMembersList(parsedMembers);
      localStorage.setItem('elpida_members', JSON.stringify(parsedMembers));
      alert(`Επιτυχής εισαγωγή ${parsedMembers.length} μελών!`);
    };
    reader.readAsText(file, 'UTF-8');
    e.target.value = null;
  };

  const handleVerify = () => {
    // Rule C: Manual Admin Override
    if (email === "ADMIN_ELPIDA") {
      setStatus('verified');
      return;
    }

    // Rule D: Role-Based Email Workflow
    const restrictedRoles = ["Πρόεδρος", "Αντιπρόεδρος", "Επίτιμο Μέλος"];
    if (restrictedRoles.includes(memberType)) {
      const subject = encodeURIComponent(`Verification Request: ${memberType} - ${name}`);
      const body = encodeURIComponent(`Please verify the following member:\n\nName: ${name}\nRole: ${memberType}\nYear: ${year}\nEmail: ${email}`);
      window.location.href = `mailto:official.ceobusinessmail@gmail.com?subject=${subject}&body=${body}`;
      alert("This role requires manual verification. An email draft has been opened for you.");
      return;
    }

    // Rule A & B: Database Matching & Collision Handling
    const searchName = name.trim().toLowerCase();
    const matches = membersList.filter(user => user.name.toLowerCase() === searchName);

    if (matches.length > 1) {
      const userEmail = prompt(`Βρέθηκαν ${matches.length} μέλη με αυτό το όνομα. Παρακαλώ εισάγετε το Email σας για ταυτοποίηση:`);
      if (matches.some(m => m.email === userEmail?.trim().toLowerCase())) {
        setStatus('verified');
      } else {
        alert("Το email δεν ταιριάζει με κανένα μέλος.");
      }
    } else if (matches.length === 1) {
      setStatus('verified');
    } else {
      alert("Δεν βρέθηκε στη λίστα.");
    }
  };

  const downloadCard = () => {
    const node = document.getElementById('alumni-card');
    toPng(node, { pixelRatio: 2 }).then((dataUrl) => {
      const link = document.createElement('a');
      link.download = `elpida-id.png`;
      link.href = dataUrl;
      link.click();
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 font-sans">

      {/* ADMIN TOOLBAR */}
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={() => {
            const pass = prompt("Admin Password:");
            if (pass === "123") setTimeout(() => csvInputRef.current.click(), 200);
          }}
          className="bg-white p-3 rounded-full shadow-lg border border-blue-100 flex items-center gap-2 text-[10px] font-black uppercase text-blue-900"
        >
          <Database size={16} /> Update List
        </button>
        <input type="file" hidden ref={csvInputRef} accept=".csv" onChange={handleCSVUpload} />
      </div>

      <div className="text-center mb-10">
        <h1 className="text-4xl font-black text-[#730202] tracking-tighter uppercase italic">Alumni ID Engine</h1>
        <p className="text-[#730202]/80 font-bold tracking-[0.4em] text-[10px] mt-2">ΣΥΛΛΟΓΟΣ ΑΠΟΦΟΙΤΩΝ ΕΚΠΑΙΔΕΥΤΗΡΙΑ ΕΛΠΙΔΑ</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-10 w-full max-w-5xl items-center justify-center">
        {/* Form Panel */}
        <div className="bg-white p-8 rounded-[2rem] shadow-xl w-full lg:w-[400px] space-y-4">
          <input type="text" placeholder="Full Name" className="w-full bg-slate-50 p-4 rounded-xl border" onChange={(e) => setName(e.target.value)} />
          <input type="text" placeholder="Email" className="w-full bg-slate-50 p-4 rounded-xl border" onChange={(e) => setEmail(e.target.value)} />
          <div className="grid grid-cols-2 gap-4">
            <select className="p-4 bg-slate-50 rounded-xl border font-bold" onChange={(e) => setYear(e.target.value)}>
              {Array.from({ length: 47 }, (_, i) => 2026 - i).map(y => <option key={y} value={y}>{y}</option>)}
            </select>
            <select className="p-4 bg-slate-50 rounded-xl border font-bold" onChange={(e) => setMemberType(e.target.value)}>
              <option>Μέλος</option><option>Πρόεδρος</option><option>Αντιπρόεδρος</option><option>Ταμίας</option><option>Γραμματέας</option><option>Επίτιμο Μέλος</option>
            </select>
          </div>
          <button onClick={() => fileInputRef.current.click()} className="w-full py-3 border-2 border-dashed rounded-xl font-bold text-slate-400">
            {image ? "Photo Loaded" : "Upload Photo"}
          </button>
          <input type="file" hidden ref={fileInputRef} onChange={(e) => {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.onloadend = () => setImage(reader.result);
            reader.readAsDataURL(file);
          }} accept="image/*" />
          <button onClick={handleVerify} className="w-full bg-[#730202] text-[#F2EFDF] py-4 rounded-xl font-black uppercase tracking-widest hover:bg-[#5a0101] transition-colors">Verify Membership</button>
        </div>

        {/* Card Preview */}
        <div className="flex flex-col items-center gap-6">
          <div id="alumni-card" className="w-[450px] h-[260px] bg-[#730202] rounded-[24px] p-6 text-white relative shadow-2xl overflow-hidden border-4 border-[#F2EFDF] flex flex-col justify-between">
            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#F2EFDF] opacity-5 rounded-full -mr-20 -mt-20 blur-3xl pointer-events-none"></div>

            {/* Header: Title Left, Logo Right */}
            <div className="flex justify-between items-start z-10 w-full">
              <div className="flex flex-col gap-1">
                <span className="text-[8px] font-black text-[#F2EFDF] tracking-[0.2em] uppercase opacity-90">Official Identity</span>
                <h2 className="text-lg font-black leading-tight uppercase text-white tracking-wide max-w-[250px]">
                  ΣΥΛΛΟΓΟΣ ΑΠΟΦΟΙΤΩΝ <br />
                  ΕΚΠΑΙΔΕΥΤΗΡΙΑ ΕΛΠΙΔΑ
                </h2>
              </div>
              <div className="w-14 h-14 bg-white/95 rounded-full p-1.5 flex items-center justify-center shadow-md border border-[#F2EFDF]/50">
                <img src={logo} alt="Logo" className="w-full h-full object-contain" />
              </div>
            </div>

            {/* Middle: Photo & Name */}
            <div className="flex gap-5 items-center z-10 w-full pl-2">
              <div className="w-[88px] h-[88px] rounded-full border-[3px] border-[#F2EFDF] bg-[#5a0101] overflow-hidden flex items-center justify-center shrink-0 shadow-lg relative group">
                {image ? <img src={image} className="w-full h-full object-cover" /> : <User size={40} className="text-[#F2EFDF] opacity-40" />}
              </div>
              <div className="flex flex-col justify-center min-w-0">
                <h3 className="text-[22px] font-black uppercase leading-none mb-1.5 text-[#F2EFDF] drop-shadow-sm truncate pr-2">{name || "YOUR NAME"}</h3>
                <div className="flex items-center gap-2 text-[#F2EFDF] font-bold uppercase text-[9px] tracking-wider bg-black/20 px-3 py-1 rounded-md border border-[#F2EFDF]/20 w-fit">
                  <Award size={12} /> {memberType}
                </div>
              </div>
            </div>

            {/* Footer: Details & Status */}
            <div className="flex justify-between items-end z-10 w-full border-t border-[#F2EFDF]/20 pt-3 mt-1">
              <div className="flex flex-col gap-1">
                <div className="flex flex-col">
                  <span className="text-[7px] font-bold text-[#F2EFDF] opacity-80 uppercase leading-none mb-0.5">Year of Graduation</span>
                  <span className="text-lg font-black italic text-[#F2EFDF] tracking-tighter uppercase leading-none">{year}</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                {status === 'verified' ?
                  <div className="text-[#730202] bg-[#F2EFDF] px-4 py-1.5 rounded-full font-black text-[10px] uppercase flex items-center gap-1.5 shadow-lg border border-white/50">
                    <CheckCircle size={12} strokeWidth={3} /> VERIFIED
                  </div>
                  :
                  <div className="text-[#F2EFDF] font-black text-[9px] tracking-[0.2em] opacity-80 italic border border-[#F2EFDF]/40 px-3 py-1 rounded-md">
                    OFFICIAL ID
                  </div>
                }
              </div>
            </div>
          </div>
          <button onClick={downloadCard} disabled={!name} className="flex items-center gap-2 text-[#730202] font-black uppercase text-[10px] tracking-[0.3em] bg-[#F2EFDF] px-8 py-4 rounded-full shadow-lg border-2 border-[#730202]/10 hover:scale-105 transition-all active:scale-95 disabled:opacity-50 disabled:hover:scale-100">
            <Download size={18} /> Export PNG ID
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;