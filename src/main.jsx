import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Search, Download, CheckCircle, HardDrive, User, Music, LogIn, ChevronDown, X, LogOut } from 'lucide-react';

const YOUTUBE_API_KEY = "AIzaSyCQnyWFQms8ZgoZ5vSgC-7W3o3vC-IZHN4";

const AuraApp = () => {
  // --- STATE ---
  const [isAuthenticated, setIsAuthenticated] = useState(localStorage.getItem('aura_auth') === 'true');
  const [view, setView] = useState('home');
  const [searchQuery, setSearchQuery] = useState("");
  const [songs, setSongs] = useState([]);
  const [activeSong, setActiveSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [vault, setVault] = useState(JSON.parse(localStorage.getItem('aura_vault')) || []);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false); // For full-screen player
  
  const playerRef = useRef(null);

  // --- YOUTUBE ENGINE ---
  useEffect(() => {
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    document.body.appendChild(tag);
    window.onYouTubeIframeAPIReady = () => {
      playerRef.current = new window.YT.Player('yt-player', {
        height: '0', width: '0',
        events: { 'onStateChange': (e) => { if (e.data === 0) setIsPlaying(false); } }
      });
    };
  }, []);

  useEffect(() => {
    if (!playerRef.current || !activeSong) return;
    if (isPlaying) {
      playerRef.current.loadVideoById(activeSong.id);
      playerRef.current.playVideo();
    } else {
      playerRef.current.pauseVideo();
    }
  }, [activeSong, isPlaying]);

  // --- HANDLERS ---
  const handleLogin = (e) => {
    e.preventDefault();
    setIsAuthenticated(true);
    localStorage.setItem('aura_auth', 'true');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    localStorage.removeItem('aura_auth');
    setActiveSong(null);
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery) return;
    try {
      const res = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=15&q=${searchQuery}&type=video&key=${YOUTUBE_API_KEY}`);
      const data = await res.json();
      setSongs(data.items.map(item => ({
        id: item.id.videoId,
        title: item.snippet.title,
        artist: item.snippet.channelTitle,
        cover: item.snippet.thumbnails.high.url,
        color: `hsl(${Math.random() * 360}, 70%, 50%)`
      })));
    } catch (err) { alert("API Error. Check console."); }
  };

  const toggleVault = (song) => {
    const isSaved = vault.some(s => s.id === song.id);
    const newVault = isSaved ? vault.filter(s => s.id !== song.id) : [...vault, song];
    setVault(newVault);
    localStorage.setItem('aura_vault', JSON.stringify(newVault));
  };

  // --- LOGIN UI ---
  if (!isAuthenticated) return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-6 font-sans">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md p-10 rounded-[3rem] bg-white/5 border border-white/10 backdrop-blur-3xl text-center shadow-2xl">
        <div className="w-20 h-20 bg-white rounded-3xl mx-auto mb-8 flex items-center justify-center text-black text-4xl font-black italic shadow-[0_0_30px_rgba(255,255,255,0.3)]">A</div>
        <h1 className="text-4xl font-black mb-2 tracking-tighter text-white">Aura Music</h1>
        <p className="text-white/40 mb-10">Experience the world's music, unified.</p>
        <form onSubmit={handleLogin} className="space-y-4 text-left">
          <input type="email" placeholder="Email" required className="w-full p-5 rounded-2xl bg-white/5 border border-white/10 outline-none focus:ring-2 ring-white/20" />
          <input type="password" placeholder="Password" required className="w-full p-5 rounded-2xl bg-white/5 border border-white/10 outline-none focus:ring-2 ring-white/20" />
          <button type="submit" className="w-full p-5 rounded-2xl bg-white text-black font-bold text-lg hover:scale-[1.02] active:scale-95 transition-all">Enter Aura</button>
        </form>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#020202] text-white flex overflow-hidden font-sans">
      <div id="yt-player" className="hidden"></div>
      
      {/* Liquid Aura Background */}
      <div className="fixed inset-0 opacity-20 blur-[120px] transition-all duration-1000" style={{ backgroundColor: activeSong?.color || '#1e1e1e' }} />

      {/* Sidebar Navigation */}
      <nav className="w-24 border-r border-white/5 bg-black/40 backdrop-blur-2xl flex flex-col items-center py-12 gap-10 z-50">
        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-black font-black italic shadow-lg cursor-pointer" onClick={() => setView('home')}>A</div>
        <button onClick={() => setView('home')} className={`p-4 rounded-2xl transition-all ${view === 'home' ? 'bg-white/10 text-white' : 'text-white/30 hover:text-white'}`}><Search /></button>
        <button onClick={() => setView('vault')} className={`p-4 rounded-2xl transition-all ${view === 'vault' ? 'bg-white/10 text-white' : 'text-white/30 hover:text-white'}`}><HardDrive /></button>
        <button onClick={handleLogout} className="mt-auto p-4 text-white/30 hover:text-red-400 transition-colors"><LogOut /></button>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-12 pb-40 z-10">
        <header className="mb-12">
          <h1 className="text-6xl font-black italic tracking-tighter mb-8">{view === 'home' ? 'DISCOVER' : 'THE VAULT'}</h1>
          {view === 'home' && (
            <form onSubmit={handleSearch} className="max-w-2xl relative group">
              <input 
                type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} 
                placeholder="Search any song..." 
                className="w-full bg-white/5 border border-white/10 p-6 pl-16 rounded-full outline-none focus:ring-4 ring-white/5 text-xl backdrop-blur-lg transition-all" 
              />
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-white transition-colors" />
            </form>
          )}
        </header>

        <div className="grid gap-4">
          {(view === 'home' ? songs : vault).map(song => (
            <motion.div 
              key={song.id} 
              whileHover={{ x: 10, background: 'rgba(255,255,255,0.05)' }} 
              onClick={() => { setActiveSong(song); setIsPlaying(true); }}
              className={`p-4 rounded-3xl flex items-center gap-6 cursor-pointer group ${activeSong?.id === song.id ? 'bg-white/10' : ''}`}
            >
              <img src={song.cover} className="w-20 h-20 rounded-2xl object-cover shadow-2xl" />
              <div className="flex-1">
                <h3 className="text-xl font-bold truncate max-w-md" dangerouslySetInnerHTML={{__html: song.title}}></h3>
                <p className="text-white/40 font-medium uppercase tracking-widest text-xs">{song.artist}</p>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); toggleVault(song); }} 
                className={`p-4 rounded-2xl transition-all ${vault.some(s => s.id === song.id) ? 'text-cyan-400 bg-cyan-400/10' : 'text-white/10 hover:text-white hover:bg-white/10'}`}
              >
                {vault.some(s => s.id === song.id) ? <CheckCircle /> : <Download />}
              </button>
            </motion.div>
          ))}
        </div>
      </main>

      {/* DYNAMIC PLAYER BAR */}
      <AnimatePresence>
        {activeSong && (
          <motion.div 
            initial={{ y: 200 }} animate={{ y: 0 }} 
            className="fixed bottom-8 left-32 right-8 h-24 bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[2.5rem] z-50 flex items-center px-8 gap-8 cursor-pointer shadow-2xl overflow-hidden"
            onClick={() => setIsPlayerOpen(true)}
          >
            <div className="absolute inset-0 opacity-10 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-pulse" />
            <img src={activeSong.cover} className="w-14 h-14 rounded-2xl shadow-lg relative z-10" />
            <div className="flex-1 overflow-hidden relative z-10">
              <h4 className="font-bold truncate" dangerouslySetInnerHTML={{__html: activeSong.title}}></h4>
              <p className="text-xs text-white/40 uppercase tracking-widest">{activeSong.artist}</p>
            </div>
            <div className="flex items-center gap-6 relative z-10" onClick={e => e.stopPropagation()}>
              <button onClick={() => setIsPlaying(!isPlaying)} className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-black hover:scale-105 active:scale-95 transition-all shadow-xl">
                {isPlaying ? <Pause fill="black" size={24} /> : <Play fill="black" size={24} className="ml-1" />}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FULLSCREEN PLAYER OVERLAY */}
      <AnimatePresence>
        {isPlayerOpen && activeSong && (
          <motion.div 
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 200 }}
            className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center p-12 text-center"
          >
            <div className="fixed inset-0 opacity-40 blur-[150px]" style={{ backgroundColor: activeSong.color }} />
            <button onClick={() => setIsPlayerOpen(false)} className="absolute top-10 right-10 p-4 bg-white/10 rounded-full hover:bg-white/20 transition-all z-[110]"><ChevronDown size={32} /></button>
            
            <motion.img 
              layoutId={`art-${activeSong.id}`} 
              src={activeSong.cover} 
              className="w-80 h-80 md:w-[450px] md:h-[450px] rounded-[4rem] shadow-[0_50px_100px_rgba(0,0,0,0.8)] z-10 mb-12 border border-white/10" 
            />

            <div className="z-10 max-w-2xl">
              <h2 className="text-5xl font-black mb-4 tracking-tighter" dangerouslySetInnerHTML={{__html: activeSong.title}}></h2>
              <p className="text-2xl text-white/40 mb-12 font-medium tracking-wide uppercase">{activeSong.artist}</p>
              
              <div className="flex items-center justify-center gap-12">
                <button onClick={() => setIsPlaying(!isPlaying)} className="w-32 h-32 bg-white rounded-full flex items-center justify-center text-black hover:scale-110 active:scale-90 transition-all shadow-[0_0_50px_rgba(255,255,255,0.2)]">
                  {isPlaying ? <Pause size={48} fill="black" /> : <Play size={48} fill="black" className="ml-2" />}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

createRoot(document.getElementById('root')).render(<AuraApp />);