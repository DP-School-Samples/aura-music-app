import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipForward, SkipBack, Search, Download, CheckCircle, X, User, HardDrive, Music, Volume2 } from 'lucide-react';

const AuraApp = () => {
  // --- 1. GLOBAL STATE & ACCOUNTS ---
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('aura_user')) || null);
  const [view, setView] = useState('home'); // 'home' | 'vault' | 'settings'
  const [searchQuery, setSearchQuery] = useState("");
  const [songs, setSongs] = useState([]);
  const [activeSong, setActiveSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [vault, setVault] = useState(JSON.parse(localStorage.getItem('aura_vault')) || []);
  
  const audioRef = useRef(new Audio());

  // --- 2. THE AUDIO ENGINE (Real Streaming) ---
  useEffect(() => {
    if (activeSong) {
      // Logic: In a real app, this URL would come from a YouTube/SoundCloud API
      audioRef.current.src = activeSong.url; 
      audioRef.current.load();
      if (isPlaying) audioRef.current.play().catch(() => console.log("User must interact first"));
    }
  }, [activeSong]);

  useEffect(() => {
    if (isPlaying) audioRef.current.play();
    else audioRef.current.pause();
  }, [isPlaying]);

  // --- 3. SEARCH LOGIC (Simulating "Any Song in the World") ---
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery) return;
    
    // This is where you connect to a music API. For now, we generate results based on your query.
    const results = [
      { 
        id: btoa(searchQuery + '1'), 
        title: searchQuery, 
        artist: "Top Artist", 
        cover: `https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800`, 
        color: "#6366f1", 
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" 
      },
      { 
        id: btoa(searchQuery + '2'), 
        title: searchQuery + " (Aura Radio)", 
        artist: "Verified Artist", 
        cover: `https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=800`, 
        color: "#ec4899", 
        url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" 
      }
    ];
    setSongs(results);
  };

  // --- 4. THE VAULT (Offline Logic) ---
  const toggleVault = (song) => {
    const exists = vault.find(s => s.id === song.id);
    let newVault;
    if (exists) {
      newVault = vault.filter(s => s.id !== song.id);
    } else {
      newVault = [...vault, { ...song, savedAt: Date.now() }];
    }
    setVault(newVault);
    localStorage.setItem('aura_vault', JSON.stringify(newVault));
  };

  const handleLogin = () => {
    const newUser = { name: "Pro Listener", avatar: "https://api.dicebear.com/7.x/bottts/svg?seed=Aura" };
    setUser(newUser);
    localStorage.setItem('aura_user', JSON.stringify(newUser));
  };

  return (
    <div className="min-h-screen bg-[#020202] text-white font-sans overflow-hidden flex">
      {/* Background Aura */}
      <div 
        className="fixed inset-0 opacity-20 blur-[140px] transition-all duration-1000"
        style={{ backgroundColor: activeSong?.color || '#111' }}
      />

      {/* NAV SIDEBAR */}
      <nav className="w-20 md:w-24 border-r border-white/5 bg-black/40 backdrop-blur-xl flex flex-col items-center py-10 gap-10 z-50">
        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-black font-black italic shadow-lg shadow-white/10">A</div>
        <button onClick={() => setView('home')} className={`p-3 rounded-2xl transition-all ${view === 'home' ? 'bg-white/10 text-white' : 'text-white/30 hover:text-white'}`}><Search /></button>
        <button onClick={() => setView('vault')} className={`p-3 rounded-2xl transition-all ${view === 'vault' ? 'bg-white/10 text-white' : 'text-white/30 hover:text-white'}`}><HardDrive /></button>
        <div className="mt-auto flex flex-col gap-6">
          {user ? (
            <img src={user.avatar} className="w-10 h-10 rounded-full border border-white/20" alt="profile" />
          ) : (
            <button onClick={handleLogin} className="text-white/30 hover:text-white"><User /></button>
          )}
        </div>
      </nav>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto p-6 md:p-12 pb-32 z-10">
        {view === 'home' ? (
          <div className="max-w-5xl mx-auto">
            <header className="mb-12">
              <h2 className="text-sm uppercase tracking-[0.3em] text-white/40 font-bold mb-2">Global Search</h2>
              <h1 className="text-5xl font-black tracking-tighter italic">DISCOVER</h1>
            </header>

            <form onSubmit={handleSearch} className="mb-16 relative group">
              <input 
                type="text"
                placeholder="Search any song in the world..."
                className="w-full bg-white/5 border border-white/10 p-6 pl-16 rounded-[2rem] outline-none focus:ring-4 ring-white/5 transition-all text-xl backdrop-blur-md"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-white transition-colors" />
            </form>

            <div className="grid gap-4">
              {songs.map(song => (
                <SongRow 
                  key={song.id} 
                  song={song} 
                  isActive={activeSong?.id === song.id}
                  onPlay={() => { setActiveSong(song); setIsPlaying(true); }}
                  onVault={() => toggleVault(song)}
                  isSaved={vault.some(s => s.id === song.id)}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="max-w-5xl mx-auto">
             <header className="mb-12">
              <h2 className="text-sm uppercase tracking-[0.3em] text-cyan-400 font-bold mb-2">Local Storage</h2>
              <h1 className="text-5xl font-black tracking-tighter italic">YOUR VAULT</h1>
            </header>
            <div className="grid gap-4">
              {vault.length > 0 ? vault.map(song => (
                <SongRow 
                  key={song.id} 
                  song={song} 
                  isActive={activeSong?.id === song.id}
                  onPlay={() => { setActiveSong(song); setIsPlaying(true); }}
                  onVault={() => toggleVault(song)}
                  isSaved={true}
                />
              )) : (
                <div className="p-20 border-2 border-dashed border-white/5 rounded-[3rem] text-center">
                  <Music className="mx-auto text-white/10 mb-4" size={48} />
                  <p className="text-white/30 italic">No songs downloaded for offline use yet.</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* DYNAMIC PLAYER BAR */}
      <AnimatePresence>
        {activeSong && (
          <motion.div 
            initial={{ y: 150, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-4xl h-24 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] z-[100] flex items-center px-8 gap-8 shadow-2xl"
          >
            <img src={activeSong.cover} className="w-14 h-14 rounded-2xl shadow-lg" />
            <div className="flex-1 overflow-hidden">
              <h4 className="font-bold truncate">{activeSong.title}</h4>
              <p className="text-xs text-white/40 truncate uppercase tracking-widest">{activeSong.artist}</p>
            </div>
            
            <div className="hidden md:flex items-center gap-8">
              <SkipBack className="cursor-pointer hover:text-white transition-colors text-white/60" />
              <button 
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-black shadow-xl shadow-white/5 hover:scale-105 active:scale-95 transition-all"
              >
                {isPlaying ? <Pause size={24} fill="black" /> : <Play size={24} fill="black" className="ml-1" />}
              </button>
              <SkipForward className="cursor-pointer hover:text-white transition-colors text-white/60" />
            </div>

            <div className="flex items-center gap-4 ml-auto">
              <Volume2 size={20} className="text-white/40" />
              <div className="w-24 h-1 bg-white/10 rounded-full hidden sm:block">
                <div className="w-3/4 h-full bg-white/60 rounded-full" />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const SongRow = ({ song, onPlay, onVault, isSaved, isActive }) => (
  <motion.div 
    whileHover={{ x: 10, backgroundColor: 'rgba(255,255,255,0.05)' }}
    className={`flex items-center gap-6 p-4 rounded-3xl transition-all cursor-pointer group ${isActive ? 'bg-white/10 border border-white/10' : 'border border-transparent'}`}
    onClick={onPlay}
  >
    <div className="relative">
      <img src={song.cover} className="w-16 h-16 rounded-2xl object-cover shadow-xl" />
      {isActive && isPlaying && (
        <div className="absolute inset-0 bg-black/40 rounded-2xl flex items-center justify-center">
          <div className="flex gap-1 items-end h-4">
             <motion.div animate={{ height: [4, 16, 4] }} transition={{ repeat: Infinity, duration: 0.5 }} className="w-1 bg-white" />
             <motion.div animate={{ height: [16, 4, 16] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-1 bg-white" />
             <motion.div animate={{ height: [8, 16, 8] }} transition={{ repeat: Infinity, duration: 0.4 }} className="w-1 bg-white" />
          </div>
        </div>
      )}
    </div>
    <div className="flex-1">
      <h3 className={`font-bold text-lg ${isActive ? 'text-white' : 'text-white/80'}`}>{song.title}</h3>
      <p className="text-white/40 text-sm font-semibold tracking-wide uppercase">{song.artist}</p>
    </div>
    <button 
      onClick={(e) => { e.stopPropagation(); onVault(); }}
      className={`p-3 rounded-2xl transition-all ${isSaved ? 'text-cyan-400 bg-cyan-400/10' : 'text-white/20 hover:text-white hover:bg-white/5'}`}
    >
      {isSaved ? <CheckCircle size={22} /> : <Download size={22} />}
    </button>
  </motion.div>
);

createRoot(document.getElementById('root')).render(<AuraApp />);