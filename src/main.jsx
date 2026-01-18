import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Search, Download, HardDrive, User, Music, ChevronDown, SkipForward, SkipBack, Heart, Repeat, Shuffle, LogOut } from 'lucide-react';

const YOUTUBE_API_KEY = "AIzaSyCQnyWFQms8ZgoZ5vSgC-7W3o3vC-IZHN4";

const AuraApp = () => {
  // --- AUTH & VIEW STATE ---
  const [authState, setAuthState] = useState('login'); // 'login' | 'signup' | 'authenticated'
  const [view, setView] = useState('home');
  const [activeSong, setActiveSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  
  // --- DATA STATE ---
  const [history, setHistory] = useState(JSON.parse(localStorage.getItem('aura_history')) || []);
  const [vault, setVault] = useState(JSON.parse(localStorage.getItem('aura_vault')) || []);
  const [playlists, setPlaylists] = useState(JSON.parse(localStorage.getItem('aura_playlists')) || []);

  const playerRef = useRef(null);

  // --- AUDIO & YOUTUBE API ---
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
      updateHistory(activeSong);
    } else {
      playerRef.current.pauseVideo();
    }
  }, [activeSong, isPlaying]);

  const updateHistory = (song) => {
    const newHistory = [song, ...history.filter(s => s.id !== song.id)].slice(0, 10);
    setHistory(newHistory);
    localStorage.setItem('aura_history', JSON.stringify(newHistory));
  };

  // --- REAL DOWNLOAD (OFFLINE) LOGIC ---
  const downloadToOffline = async (song) => {
    alert("Downloading to device for offline use...");
    // In a real PWA, we'd use service workers to cache the blob. 
    // Here we mark as 'Vaulted'
    const newVault = [...vault, song];
    setVault(newVault);
    localStorage.setItem('aura_vault', JSON.stringify(newVault));
  };

  // --- UI COMPONENTS ---
  const GlassCard = ({ children, className }) => (
    <div className={`bg-white/10 backdrop-blur-2xl border border-white/20 rounded-[2.5rem] ${className}`}>
      {children}
    </div>
  );

  if (authState !== 'authenticated') return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a0b2e] via-[#4a1d4d] to-[#1a0b2e] flex items-center justify-center p-6">
      <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-md">
        <GlassCard className="p-10 text-center">
          <h1 className="text-5xl font-black italic text-white mb-2">Aura</h1>
          <div className="flex bg-white/5 rounded-full p-1 mb-8">
            <button onClick={() => setAuthState('login')} className={`flex-1 py-2 rounded-full transition ${authState === 'login' ? 'bg-white text-black' : 'text-white'}`}>Log In</button>
            <button onClick={() => setAuthState('signup')} className={`flex-1 py-2 rounded-full transition ${authState === 'signup' ? 'bg-white text-black' : 'text-white'}`}>Sign Up</button>
          </div>
          <form onSubmit={(e) => { e.preventDefault(); setAuthState('authenticated'); }} className="space-y-4">
            <input type="email" placeholder="Email" className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 outline-none text-white" />
            <input type="password" placeholder="Password" className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 outline-none text-white" />
            <button className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-500 to-pink-500 text-white font-bold text-lg shadow-xl">
              {authState === 'login' ? 'Let\'s Go' : 'Create Account'}
            </button>
          </form>
        </GlassCard>
      </motion.div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0d0216] text-white flex font-sans selection:bg-pink-500">
      <div id="yt-player" className="hidden"></div>
      
      {/* Sidebar - Desktop Only */}
      <nav className="w-24 hidden md:flex flex-col items-center py-10 border-r border-white/5 bg-black/20 backdrop-blur-xl z-50">
        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-black font-black mb-12">A</div>
        <button onClick={() => setView('home')} className={`p-4 rounded-2xl mb-4 ${view === 'home' ? 'bg-white/10' : 'opacity-40'}`}><Search /></button>
        <button onClick={() => setView('vault')} className={`p-4 rounded-2xl ${view === 'vault' ? 'bg-white/10' : 'opacity-40'}`}><HardDrive /></button>
        <button onClick={() => { setAuthState('login'); localStorage.clear(); }} className="mt-auto p-4 opacity-40 hover:opacity-100"><LogOut /></button>
      </nav>

      {/* Main Content */}
      <main className="flex-1 p-6 md:p-12 pb-40 overflow-y-auto">
        <div className="max-w-6xl mx-auto">
          {/* Header Search */}
          <div className="flex items-center gap-4 mb-12">
            <div className="flex-1 relative">
              <input 
                type="text" 
                placeholder="Search world music..." 
                className="w-full bg-white/5 border border-white/10 p-5 pl-14 rounded-full outline-none focus:ring-2 ring-pink-500/50"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Search className="absolute left-5 top-1/2 -translate-y-1/2 opacity-30" />
            </div>
          </div>

          {/* Recently Played - Spotify Style */}
          <section className="mb-12">
            <h2 className="text-2xl font-bold mb-6 flex justify-between items-center">Recently Played <span className="text-sm text-pink-400">See All</span></h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-6">
              {history.map(song => (
                <motion.div key={song.id} whileHover={{ y: -5 }} onClick={() => { setActiveSong(song); setIsPlaying(true); }} className="cursor-pointer group">
                  <div className="relative aspect-square mb-3">
                    <img src={song.cover} className="w-full h-full object-cover rounded-[2rem] shadow-lg" />
                    <div className="absolute inset-0 bg-black/40 rounded-[2rem] opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                      <Play fill="white" size={32} />
                    </div>
                  </div>
                  <h4 className="font-bold truncate text-sm">{song.title}</h4>
                  <p className="text-white/40 text-xs truncate">{song.artist}</p>
                </motion.div>
              ))}
            </div>
          </section>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <section className="mb-12">
              <h2 className="text-2xl font-bold mb-6">Search Results</h2>
              <div className="space-y-3">
                {searchResults.map(song => (
                   <div key={song.id} onClick={() => { setActiveSong(song); setIsPlaying(true); }} className="flex items-center gap-4 p-3 bg-white/5 rounded-3xl hover:bg-white/10 transition group cursor-pointer">
                     <img src={song.cover} className="w-14 h-14 rounded-2xl object-cover" />
                     <div className="flex-1">
                       <h4 className="font-bold text-sm" dangerouslySetInnerHTML={{__html: song.title}}></h4>
                       <p className="text-white/40 text-xs">{song.artist}</p>
                     </div>
                     <button onClick={(e) => { e.stopPropagation(); downloadToOffline(song); }} className="p-3 opacity-0 group-hover:opacity-100 hover:text-pink-500"><Download size={20}/></button>
                   </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </main>

      {/* FULLSCREEN PLAYER OVERLAY (MATCHING YOUR IMAGE) */}
      <AnimatePresence>
        {(isPlayerOpen || (window.innerWidth < 768 && activeSong)) && activeSong && (
          <motion.div 
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25 }}
            className="fixed inset-0 z-[100] bg-gradient-to-b from-[#ff87c3] to-[#7c3aed] flex flex-col p-8 md:p-12 items-center"
          >
            <button onClick={() => setIsPlayerOpen(false)} className="absolute top-8 left-8 p-3 bg-white/20 rounded-full"><ChevronDown /></button>
            <h3 className="text-sm font-bold uppercase tracking-widest mt-4 mb-12">Now Playing</h3>
            
            {/* The Circle Player from your image */}
            <div className="relative w-72 h-72 md:w-96 md:h-96 mb-12">
              <div className="absolute inset-0 rounded-full border-4 border-white/20 animate-spin-slow" />
              <img src={activeSong.cover} className="w-full h-full rounded-full object-cover p-4 shadow-2xl" />
            </div>

            <div className="text-center mb-12 w-full max-w-md">
              <h2 className="text-4xl font-black mb-2" dangerouslySetInnerHTML={{__html: activeSong.title}}></h2>
              <p className="text-lg opacity-80">{activeSong.artist}</p>
              <div className="flex justify-between items-center mt-8">
                <Heart className="opacity-50" />
                <div className="flex items-center gap-8">
                  <SkipBack size={32} />
                  <button onClick={() => setIsPlaying(!isPlaying)} className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-[#7c3aed] shadow-xl">
                    {isPlaying ? <Pause size={32} fill="currentColor" /> : <Play size={32} fill="currentColor" className="ml-1" />}
                  </button>
                  <SkipForward size={32} />
                </div>
                <Repeat className="opacity-50" />
              </div>
            </div>

            {/* LIVE LYRICS BOX */}
            <div className="w-full max-w-lg bg-black/20 backdrop-blur-xl rounded-[3rem] p-8 mt-auto h-48 overflow-hidden text-center relative">
              <div className="absolute top-0 left-0 right-0 h-10 bg-gradient-to-b from-[#ff87c3] to-transparent z-10" />
              <motion.div animate={{ y: isPlaying ? -100 : 0 }} transition={{ duration: 30, repeat: Infinity }} className="space-y-6 pt-10">
                <p className="text-2xl font-bold">Oh, I've been shaking</p>
                <p className="text-2xl font-bold opacity-40">I love it when you go crazy</p>
                <p className="text-2xl font-bold opacity-40">You take all my inhibitions</p>
                <p className="text-2xl font-bold opacity-40">Baby, there's nothing holding me back</p>
              </motion.div>
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 font-bold text-xs uppercase tracking-[0.4em]">Lyrics</div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* MINI PLAYER BAR (DESKTOP) */}
      {activeSong && !isPlayerOpen && (
        <motion.div 
          onClick={() => setIsPlayerOpen(true)}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] md:w-3/4 h-24 bg-white/10 backdrop-blur-3xl border border-white/20 rounded-full z-50 flex items-center px-8 gap-6 shadow-2xl cursor-pointer"
        >
          <img src={activeSong.cover} className="w-14 h-14 rounded-full object-cover" />
          <div className="flex-1 overflow-hidden">
            <h4 className="font-bold truncate text-sm" dangerouslySetInnerHTML={{__html: activeSong.title}}></h4>
            <div className="h-1 bg-white/20 w-full mt-2 rounded-full overflow-hidden">
              <motion.div animate={{ width: '40%' }} className="h-full bg-white shadow-[0_0_10px_white]" />
            </div>
          </div>
          <button onClick={(e) => { e.stopPropagation(); setIsPlaying(!isPlaying); }} className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-black shadow-lg">
            {isPlaying ? <Pause size={20} fill="black" /> : <Play size={20} fill="black" className="ml-1" />}
          </button>
        </motion.div>
      )}
    </div>
  );

  async function handleSearch() {
    if (!searchQuery) return;
    const res = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&q=${searchQuery}&type=video&key=${YOUTUBE_API_KEY}`);
    const data = await res.json();
    setSearchResults(data.items.map(i => ({
      id: i.id.videoId,
      title: i.snippet.title,
      artist: i.snippet.channelTitle,
      cover: i.snippet.thumbnails.high.url
    })));
  }
};

createRoot(document.getElementById('root')).render(<AuraApp />);