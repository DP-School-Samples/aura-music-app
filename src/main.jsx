import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Search, Download, HardDrive, User, Music, ChevronDown, SkipForward, SkipBack, Heart, Repeat, LogOut, X } from 'lucide-react';

const YOUTUBE_API_KEY = "AIzaSyCQnyWFQms8ZgoZ5vSgC-7W3o3vC-IZHN4";

const AuraApp = () => {
  const [authState, setAuthState] = useState('login'); 
  const [view, setView] = useState('home');
  const [activeSong, setActiveSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [vault, setVault] = useState(JSON.parse(localStorage.getItem('aura_vault')) || []);
  const [history, setHistory] = useState(JSON.parse(localStorage.getItem('aura_history')) || []);

  const playerRef = useRef(null);
  const [isApiReady, setIsApiReady] = useState(false);

  // --- YOUTUBE PLAYER INITIALIZATION ---
  useEffect(() => {
    // Load script only once
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    }

    window.onYouTubeIframeAPIReady = () => {
      playerRef.current = new window.YT.Player('aura-engine', {
        height: '0',
        width: '0',
        playerVars: { 'autoplay': 0, 'controls': 0, 'origin': window.location.origin },
        events: {
          'onReady': () => setIsApiReady(true),
          'onStateChange': (event) => {
            if (event.data === window.YT.PlayerState.ENDED) setIsPlaying(false);
          },
          'onError': (e) => console.error("YT Error:", e)
        }
      });
    };
  }, []);

  // --- PLAYBACK CONTROL ---
  useEffect(() => {
    if (!isApiReady || !activeSong || !playerRef.current) return;

    // Load new song if activeSong changes
    const currentVideoId = playerRef.current.getVideoData?.().video_id;
    if (activeSong.id !== currentVideoId) {
      playerRef.current.cueVideoById(activeSong.id);
    }

    if (isPlaying) {
      playerRef.current.playVideo();
      // Add to history
      const newHistory = [activeSong, ...history.filter(s => s.id !== activeSong.id)].slice(0, 6);
      setHistory(newHistory);
      localStorage.setItem('aura_history', JSON.stringify(newHistory));
    } else {
      playerRef.current.pauseVideo();
    }
  }, [activeSong, isPlaying, isApiReady]);

  const handleSearch = async (e) => {
    if (e) e.preventDefault();
    if (!searchQuery) return;
    try {
      const res = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&q=${searchQuery}&type=video&key=${YOUTUBE_API_KEY}`);
      const data = await res.json();
      setSearchResults(data.items.map(i => ({
        id: i.id.videoId,
        title: i.snippet.title,
        artist: i.snippet.channelTitle,
        cover: i.snippet.thumbnails.high.url,
        color: `hsl(${Math.random() * 360}, 70%, 60%)`
      })));
    } catch (err) {
      alert("Search failed. Check API Key quota.");
    }
  };

  const toggleVault = (song) => {
    const exists = vault.find(s => s.id === song.id);
    const newVault = exists ? vault.filter(s => s.id !== song.id) : [...vault, song];
    setVault(newVault);
    localStorage.setItem('aura_vault', JSON.stringify(newVault));
  };

  // --- UI RENDER ---
  if (authState !== 'authenticated') {
    return (
      <div className="min-h-screen bg-[#0d0216] flex items-center justify-center p-6 text-white font-sans">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-900/40 to-pink-900/40 animate-pulse" />
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md z-10 bg-white/10 backdrop-blur-3xl p-10 rounded-[3rem] border border-white/20 shadow-2xl">
          <h1 className="text-5xl font-black italic mb-8 text-center">Aura</h1>
          <div className="flex bg-white/5 rounded-full p-1 mb-6">
            <button onClick={() => setAuthState('login')} className={`flex-1 py-3 rounded-full transition ${authState === 'login' ? 'bg-white text-black font-bold' : ''}`}>Log In</button>
            <button onClick={() => setAuthState('signup')} className={`flex-1 py-3 rounded-full transition ${authState === 'signup' ? 'bg-white text-black font-bold' : ''}`}>Sign Up</button>
          </div>
          <form onSubmit={(e) => { e.preventDefault(); setAuthState('authenticated'); }} className="space-y-4">
            <input type="email" placeholder="Email Address" required className="w-full p-5 rounded-2xl bg-white/5 border border-white/10 outline-none focus:ring-2 ring-pink-500" />
            <input type="password" placeholder="Password" required className="w-full p-5 rounded-2xl bg-white/5 border border-white/10 outline-none focus:ring-2 ring-pink-500" />
            <button type="submit" className="w-full py-5 rounded-2xl bg-gradient-to-r from-pink-500 to-purple-600 font-bold text-xl shadow-lg hover:shadow-pink-500/20 transition-all active:scale-95">Enter Experience</button>
          </form>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05010a] text-white flex font-sans overflow-hidden">
      {/* The Hidden Engine */}
      <div id="aura-engine" className="hidden"></div>

      {/* Sidebar Navigation */}
      <nav className="w-24 hidden md:flex flex-col items-center py-10 border-r border-white/5 bg-black/40 backdrop-blur-2xl z-50">
        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-black font-black italic mb-12 shadow-xl">A</div>
        <button onClick={() => setView('home')} className={`p-4 rounded-2xl mb-4 transition ${view === 'home' ? 'bg-white/10 text-pink-400' : 'opacity-40'}`}><Search /></button>
        <button onClick={() => setView('vault')} className={`p-4 rounded-2xl transition ${view === 'vault' ? 'bg-white/10 text-pink-400' : 'opacity-40'}`}><HardDrive /></button>
        <button onClick={() => setAuthState('login')} className="mt-auto p-4 opacity-40 hover:text-red-400 transition-colors"><LogOut /></button>
      </nav>

      {/* Main App */}
      <main className="flex-1 p-6 md:p-12 pb-40 overflow-y-auto relative">
        <div className="fixed inset-0 opacity-20 blur-[120px] pointer-events-none transition-all duration-1000" style={{ backgroundColor: activeSong?.color || '#3b0a45' }} />

        {/* Home View */}
        {view === 'home' && (
          <div className="max-w-6xl mx-auto relative z-10">
            <h1 className="text-6xl font-black italic mb-8 tracking-tighter">AURA</h1>
            <form onSubmit={handleSearch} className="relative max-w-2xl mb-12">
              <input 
                type="text" placeholder="What do you want to hear?" 
                className="w-full bg-white/5 border border-white/10 p-6 pl-16 rounded-[2rem] outline-none focus:ring-2 ring-pink-500 transition-all text-xl"
                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Search className="absolute left-6 top-1/2 -translate-y-1/2 opacity-30" />
            </form>

            {/* History Row */}
            {history.length > 0 && (
              <section className="mb-12">
                <h2 className="text-xl font-bold opacity-40 uppercase tracking-widest mb-6">Recently Played</h2>
                <div className="grid grid-cols-2 md:grid-cols-6 gap-6">
                  {history.map(song => (
                    <motion.div key={song.id} whileHover={{ y: -5 }} onClick={() => { setActiveSong(song); setIsPlaying(true); }} className="cursor-pointer group">
                      <img src={song.cover} className="aspect-square object-cover rounded-[2rem] mb-3 shadow-lg group-hover:shadow-pink-500/20 transition-all" />
                      <h4 className="font-bold text-sm truncate">{song.title}</h4>
                    </motion.div>
                  ))}
                </div>
              </section>
            )}

            {/* Search Results */}
            <div className="grid gap-4">
              {searchResults.map(song => (
                <div key={song.id} onClick={() => { setActiveSong(song); setIsPlaying(true); }} className="flex items-center gap-6 p-4 bg-white/5 rounded-[2rem] hover:bg-white/10 transition-all cursor-pointer group">
                  <img src={song.cover} className="w-20 h-20 rounded-3xl object-cover shadow-xl" />
                  <div className="flex-1 overflow-hidden">
                    <h4 className="font-bold text-lg truncate" dangerouslySetInnerHTML={{__html: song.title}}></h4>
                    <p className="text-white/40 text-sm uppercase tracking-widest">{song.artist}</p>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); toggleVault(song); }} className="p-4 rounded-2xl hover:bg-pink-500/20 transition-colors">
                    {vault.some(s => s.id === song.id) ? <CheckCircle className="text-pink-400" /> : <Download className="opacity-40" />}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Vault View */}
        {view === 'vault' && (
          <div className="max-w-6xl mx-auto relative z-10">
            <h1 className="text-6xl font-black italic mb-12 tracking-tighter">OFFLINE</h1>
            <div className="grid gap-4">
              {vault.length > 0 ? vault.map(song => (
                 <div key={song.id} onClick={() => { setActiveSong(song); setIsPlaying(true); }} className="flex items-center gap-6 p-4 bg-white/5 rounded-[2rem] hover:bg-white/10 transition-all cursor-pointer">
                    <img src={song.cover} className="w-20 h-20 rounded-3xl object-cover" />
                    <div className="flex-1">
                      <h4 className="font-bold text-lg truncate" dangerouslySetInnerHTML={{__html: song.title}}></h4>
                      <p className="text-white/40 text-sm uppercase tracking-widest">{song.artist}</p>
                    </div>
                    <HardDrive className="text-pink-400" />
                 </div>
              )) : <p className="text-white/20 text-xl italic">Nothing saved in your vault yet.</p>}
            </div>
          </div>
        )}
      </main>

      {/* Floating Mini Player (For Desktop/Mobile) */}
      <AnimatePresence>
        {activeSong && !isPlayerOpen && (
          <motion.div 
            initial={{ y: 100 }} animate={{ y: 0 }} onClick={() => setIsPlayerOpen(true)}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[90%] max-w-4xl h-24 bg-white/10 backdrop-blur-3xl border border-white/20 rounded-full z-50 flex items-center px-8 gap-6 shadow-2xl cursor-pointer hover:bg-white/[0.15] transition-all"
          >
            <img src={activeSong.cover} className="w-14 h-14 rounded-full object-cover shadow-lg" />
            <div className="flex-1">
              <h4 className="font-bold text-sm truncate" dangerouslySetInnerHTML={{__html: activeSong.title}}></h4>
              <div className="h-1 bg-white/10 w-full mt-2 rounded-full overflow-hidden">
                 {isPlaying && <motion.div initial={{ width: 0 }} animate={{ width: '100%' }} transition={{ duration: 180 }} className="h-full bg-pink-500 shadow-[0_0_10px_#ec4899]" />}
              </div>
            </div>
            <button onClick={(e) => { e.stopPropagation(); setIsPlaying(!isPlaying); }} className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-black shadow-xl">
               {isPlaying ? <Pause fill="black" /> : <Play fill="black" className="ml-1" />}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Fullscreen Player (The Image UI) */}
      <AnimatePresence>
        {isPlayerOpen && activeSong && (
          <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25 }} className="fixed inset-0 z-[100] bg-gradient-to-b from-[#ff87c3] to-[#7c3aed] flex flex-col p-8 items-center overflow-hidden">
            <button onClick={() => setIsPlayerOpen(false)} className="absolute top-10 left-10 p-4 bg-white/20 rounded-full hover:bg-white/30 transition-all"><ChevronDown size={32} /></button>
            <h3 className="text-sm font-black tracking-[0.3em] uppercase mt-4 mb-16">Now Playing</h3>
            
            <div className="relative w-72 h-72 md:w-96 md:h-96 mb-16">
               <div className="absolute inset-0 rounded-full border-[6px] border-white/20 animate-spin-slow" />
               <img src={activeSong.cover} className="w-full h-full rounded-full object-cover p-5 shadow-2xl relative z-10" />
               {isPlaying && <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="absolute -inset-4 bg-white/10 rounded-full blur-2xl -z-0" />}
            </div>

            <div className="text-center w-full max-w-xl z-10">
              <h2 className="text-4xl md:text-5xl font-black mb-4 tracking-tighter" dangerouslySetInnerHTML={{__html: activeSong.title}}></h2>
              <p className="text-xl opacity-70 mb-12 uppercase tracking-widest">{activeSong.artist}</p>
              
              <div className="flex items-center justify-between px-10 mb-12">
                <SkipBack size={40} className="opacity-50 hover:opacity-100 cursor-pointer" />
                <button onClick={() => setIsPlaying(!isPlaying)} className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-[#7c3aed] shadow-2xl hover:scale-110 active:scale-95 transition-all">
                  {isPlaying ? <Pause size={40} fill="currentColor" /> : <Play size={40} fill="currentColor" className="ml-2" />}
                </button>
                <SkipForward size={40} className="opacity-50 hover:opacity-100 cursor-pointer" />
              </div>

              {/* Live Lyrics Engine */}
              <div className="bg-black/20 backdrop-blur-xl rounded-[3rem] p-10 h-64 overflow-hidden relative">
                 <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-[#ff87c3]/30 to-transparent pointer-events-none" />
                 <motion.div animate={{ y: isPlaying ? -500 : 0 }} transition={{ duration: 60, repeat: Infinity, ease: "linear" }} className="space-y-8 pt-10">
                    <p className="text-2xl font-black opacity-100">I love the way you feel</p>
                    <p className="text-2xl font-black opacity-30">The shadows on the wall</p>
                    <p className="text-2xl font-black opacity-30">I'm caught inside a dream</p>
                    <p className="text-2xl font-black opacity-30">I don't want to wake up at all</p>
                    <p className="text-2xl font-black opacity-30">Every beat is like a heartbeat</p>
                    <p className="text-2xl font-black opacity-30">Synchronized with your aura</p>
                 </motion.div>
                 <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-xs font-bold tracking-[0.5em] opacity-40">LYRICS</div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

createRoot(document.getElementById('root')).render(<AuraApp />);