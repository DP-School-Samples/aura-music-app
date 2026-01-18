import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Search, Download, HardDrive, User, Music, ChevronDown, SkipForward, SkipBack, Heart, Plus, ListMusic, LogOut, Flame, Compass, Clock } from 'lucide-react';

const YOUTUBE_API_KEY = "AIzaSyCQnyWFQms8ZgoZ5vSgC-7W3o3vC-IZHN4";

// --- PRESET DATA FOR A RICH HOME SCREEN ---
const MOODS = [
  { name: 'Chill', color: 'from-cyan-500 to-blue-600', query: 'lofi hip hop chill beats' },
  { name: 'Workout', color: 'from-orange-500 to-red-600', query: 'high energy gym music' },
  { name: 'Focus', color: 'from-emerald-500 to-teal-600', query: 'deep focus binaural beats' },
  { name: 'Dark', color: 'from-purple-900 to-black', query: 'dark techno industrial' }
];

const AuraApp = () => {
  const [authState, setAuthState] = useState('authenticated'); 
  const [view, setView] = useState('home');
  const [activeSong, setActiveSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPlayerOpen, setIsPlayerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [vault, setVault] = useState(JSON.parse(localStorage.getItem('aura_vault')) || []);
  const [history, setHistory] = useState(JSON.parse(localStorage.getItem('aura_history')) || []);
  const [playlists, setPlaylists] = useState(JSON.parse(localStorage.getItem('aura_playlists')) || []);

  const playerRef = useRef(null);
  const [isApiReady, setIsApiReady] = useState(false);

  // --- AUDIO ENGINE ---
  useEffect(() => {
    if (!window.YT) {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      document.body.appendChild(tag);
    }
    window.onYouTubeIframeAPIReady = () => {
      playerRef.current = new window.YT.Player('aura-engine', {
        height: '0', width: '0',
        playerVars: { 'autoplay': 0, 'controls': 0 },
        events: { 'onReady': () => setIsApiReady(true), 'onStateChange': (e) => { if (e.data === 0) setIsPlaying(false); } }
      });
    };
  }, []);

  useEffect(() => {
    if (!isApiReady || !activeSong) return;
    playerRef.current.loadVideoById(activeSong.id);
    if (isPlaying) playerRef.current.playVideo();
  }, [activeSong, isPlaying]);

  // --- LOGIC ---
  const handleSearch = async (query) => {
    const q = query || searchQuery;
    if (!q) return;
    try {
      const res = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=12&q=${q}&type=video&key=${YOUTUBE_API_KEY}`);
      const data = await res.json();
      const results = data.items.map(i => ({
        id: i.id.videoId,
        title: i.snippet.title,
        artist: i.snippet.channelTitle,
        cover: i.snippet.thumbnails.high.url,
        color: `hsl(${Math.random() * 360}, 70%, 60%)`
      }));
      setSearchResults(results);
      if (!query) setView('search'); // Switch to search view only if using search bar
    } catch (err) { console.error(err); }
  };

  const createPlaylist = () => {
    const name = prompt("Playlist Name?");
    if (!name) return;
    const newPlaylists = [...playlists, { name, songs: [] }];
    setPlaylists(newPlaylists);
    localStorage.setItem('aura_playlists', JSON.stringify(newPlaylists));
  };

  // --- UI FRAGMENTS ---
  const SongCard = ({ song }) => (
    <motion.div 
      whileHover={{ scale: 1.05 }} 
      onClick={() => { setActiveSong(song); setIsPlaying(true); }}
      className="min-w-[160px] md:min-w-[200px] cursor-pointer group"
    >
      <div className="relative aspect-square mb-4">
        <img src={song.cover} className="w-full h-full object-cover rounded-[2.5rem] shadow-2xl" />
        <div className="absolute inset-0 bg-black/40 rounded-[2.5rem] opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
          <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-black shadow-lg">
            <Play fill="black" size={20} className="ml-1" />
          </div>
        </div>
      </div>
      <h4 className="font-bold text-sm truncate pr-2" dangerouslySetInnerHTML={{__html: song.title}}></h4>
      <p className="text-white/40 text-xs truncate uppercase tracking-widest">{song.artist}</p>
    </motion.div>
  );

  if (authState !== 'authenticated') return <div className="bg-black min-h-screen" />; // Auth screen handled in previous step

  return (
    <div className="min-h-screen bg-[#05010a] text-white flex font-sans overflow-hidden">
      <div id="aura-engine" className="hidden"></div>
      <div className="fixed inset-0 opacity-20 blur-[150px] pointer-events-none" style={{ background: activeSong?.color || '#3b0a45' }} />

      {/* Sidebar */}
      <nav className="w-24 hidden lg:flex flex-col items-center py-12 border-r border-white/5 bg-black/40 backdrop-blur-3xl z-50">
        <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center text-black font-black italic mb-12 cursor-pointer" onClick={() => setView('home')}>A</div>
        <button onClick={() => setView('home')} className={`p-4 rounded-2xl mb-6 transition ${view === 'home' ? 'bg-white/10 text-pink-400' : 'opacity-30'}`}><Compass /></button>
        <button onClick={() => setView('vault')} className={`p-4 rounded-2xl mb-6 transition ${view === 'vault' ? 'bg-white/10 text-pink-400' : 'opacity-30'}`}><HardDrive /></button>
        <button onClick={createPlaylist} className="p-4 rounded-2xl opacity-30 hover:opacity-100"><Plus /></button>
        <button onClick={() => setAuthState('login')} className="mt-auto p-4 opacity-30 hover:text-red-400"><LogOut /></button>
      </nav>

      <main className="flex-1 overflow-y-auto custom-scrollbar relative z-10">
        {/* Sticky Search Header */}
        <header className="sticky top-0 p-8 md:p-12 pb-4 bg-gradient-to-b from-[#05010a] to-transparent z-40">
          <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
            <h1 className="text-4xl font-black italic tracking-tighter">Aura Music</h1>
            <div className="relative w-full md:w-96 group">
              <input 
                type="text" placeholder="Search world database..." 
                className="w-full bg-white/5 border border-white/10 p-4 pl-12 rounded-full outline-none focus:ring-2 ring-pink-500/50 backdrop-blur-md transition-all"
                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30 group-focus-within:opacity-100 transition-opacity" size={20} />
            </div>
          </div>
        </header>

        <div className="p-8 md:p-12 pt-0 max-w-7xl mx-auto">
          {view === 'home' ? (
            <>
              {/* Mood Pills */}
              <div className="flex gap-4 mb-12 overflow-x-auto pb-4 no-scrollbar">
                {MOODS.map(mood => (
                  <button 
                    key={mood.name} onClick={() => handleSearch(mood.query)}
                    className={`px-8 py-3 rounded-full bg-gradient-to-r ${mood.color} font-bold text-sm shadow-lg whitespace-nowrap hover:scale-105 transition-transform`}
                  >
                    {mood.name}
                  </button>
                ))}
              </div>

              {/* Big Featured Hero */}
              <section className="mb-16">
                 <div className="w-full h-64 md:h-80 rounded-[3rem] bg-gradient-to-r from-pink-600 to-purple-800 p-10 flex items-end relative overflow-hidden group">
                    <div className="absolute top-0 right-0 w-1/2 h-full opacity-30 grayscale group-hover:grayscale-0 transition-all duration-700">
                        <img src="https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=800" className="w-full h-full object-cover" />
                    </div>
                    <div className="relative z-10">
                      <h2 className="text-sm font-bold uppercase tracking-[0.5em] mb-2 opacity-70">New Release</h2>
                      <h3 className="text-5xl font-black mb-6 leading-none">Midnight <br/> Auras</h3>
                      <button onClick={() => handleSearch('trending hits 2024')} className="bg-white text-black px-8 py-3 rounded-full font-bold flex items-center gap-2 hover:bg-pink-100 transition-colors">
                        <Play size={18} fill="black" /> Listen Now
                      </button>
                    </div>
                 </div>
              </section>

              {/* Recently Played Horizontal Scroll */}
              {history.length > 0 && (
                <section className="mb-16">
                  <div className="flex items-center justify-between mb-8">
                    <h2 className="text-2xl font-black italic flex items-center gap-3"><Clock className="text-pink-500" /> Recently Played</h2>
                  </div>
                  <div className="flex gap-6 overflow-x-auto pb-6 no-scrollbar">
                    {history.map(song => <SongCard key={song.id} song={song} />)}
                  </div>
                </section>
              )}

              {/* Trending Now */}
              <section>
                <div className="flex items-center justify-between mb-8">
                  <h2 className="text-2xl font-black italic flex items-center gap-3"><Flame className="text-orange-500" /> Trending Now</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {searchResults.length > 0 ? searchResults.slice(0, 6).map(song => (
                    <div key={song.id} onClick={() => { setActiveSong(song); setIsPlaying(true); }} className="flex items-center gap-4 p-4 bg-white/5 rounded-3xl hover:bg-white/10 transition-all cursor-pointer group">
                       <img src={song.cover} className="w-16 h-16 rounded-2xl object-cover" />
                       <div className="flex-1 overflow-hidden">
                          <h4 className="font-bold truncate" dangerouslySetInnerHTML={{__html: song.title}}></h4>
                          <p className="text-xs opacity-40 uppercase">{song.artist}</p>
                       </div>
                       <Play className="opacity-0 group-hover:opacity-100 text-pink-500" size={20} fill="currentColor" />
                    </div>
                  )) : (
                    <p className="text-white/20 italic">Search for a song to see trending results...</p>
                  )}
                </div>
              </section>
            </>
          ) : (
            /* Vault / Offline View */
            <section>
              <h1 className="text-6xl font-black italic mb-12 tracking-tighter">Your Vault</h1>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
                {vault.map(song => <SongCard key={song.id} song={song} />)}
                {vault.length === 0 && <p className="col-span-full opacity-30 text-center py-20">No songs in your vault.</p>}
              </div>
            </section>
          )}
        </div>
      </main>

      {/* Floating Dynamic Player Bar */}
      <AnimatePresence>
        {activeSong && !isPlayerOpen && (
          <motion.div 
            initial={{ y: 100 }} animate={{ y: 0 }} onClick={() => setIsPlayerOpen(true)}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[92%] max-w-5xl h-24 bg-white/5 backdrop-blur-3xl border border-white/20 rounded-[3rem] z-50 flex items-center px-8 gap-6 shadow-2xl cursor-pointer hover:bg-white/10 transition-all"
          >
             <img src={activeSong.cover} className="w-14 h-14 rounded-full object-cover shadow-lg border-2 border-white/10" />
             <div className="flex-1 hidden sm:block">
                <h4 className="font-bold text-sm truncate max-w-xs" dangerouslySetInnerHTML={{__html: activeSong.title}}></h4>
                <p className="text-[10px] text-white/40 uppercase tracking-[0.2em]">{activeSong.artist}</p>
             </div>
             <div className="flex items-center gap-8 ml-auto">
                <SkipBack size={20} className="opacity-40 hover:opacity-100" />
                <button onClick={(e) => { e.stopPropagation(); setIsPlaying(!isPlaying); }} className="w-14 h-14 bg-white text-black rounded-full flex items-center justify-center shadow-lg hover:scale-105 active:scale-95 transition-all">
                  {isPlaying ? <Pause size={24} fill="black" /> : <Play size={24} fill="black" className="ml-1" />}
                </button>
                <SkipForward size={20} className="opacity-40 hover:opacity-100" />
             </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Full Player Overlay (The Reference Image Design) */}
      <AnimatePresence>
        {isPlayerOpen && activeSong && (
          <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 25 }} className="fixed inset-0 z-[100] bg-gradient-to-b from-[#ff87c3] to-[#7c3aed] flex flex-col p-8 md:p-12 items-center overflow-y-auto">
             <button onClick={() => setIsPlayerOpen(false)} className="absolute top-8 left-8 p-4 bg-white/20 rounded-full"><ChevronDown size={28} /></button>
             
             <div className="flex flex-col items-center mt-12 w-full max-w-4xl">
               <div className="relative w-64 h-64 md:w-80 md:h-80 mb-12">
                  <div className="absolute inset-0 rounded-full border-4 border-white/20 animate-spin-slow" />
                  <img src={activeSong.cover} className="w-full h-full rounded-full object-cover p-4 shadow-2xl" />
               </div>

               <div className="text-center mb-12">
                  <h2 className="text-4xl md:text-5xl font-black mb-2 tracking-tighter" dangerouslySetInnerHTML={{__html: activeSong.title}}></h2>
                  <p className="text-xl opacity-70 uppercase tracking-widest">{activeSong.artist}</p>
               </div>

               <div className="flex items-center gap-12 mb-16">
                  <SkipBack size={48} className="cursor-pointer hover:scale-110 transition-transform" />
                  <button onClick={() => setIsPlaying(!isPlaying)} className="w-28 h-28 bg-white rounded-full flex items-center justify-center text-[#7c3aed] shadow-2xl hover:scale-105 active:scale-90 transition-all">
                    {isPlaying ? <Pause size={48} fill="currentColor" /> : <Play size={48} fill="currentColor" className="ml-2" />}
                  </button>
                  <SkipForward size={48} className="cursor-pointer hover:scale-110 transition-transform" />
               </div>

               {/* Lyrics Engine */}
               <div className="w-full bg-black/20 backdrop-blur-3xl rounded-[3rem] p-10 h-64 overflow-hidden relative">
                  <motion.div animate={{ y: isPlaying ? -400 : 0 }} transition={{ duration: 50, repeat: Infinity, ease: "linear" }} className="space-y-6 pt-6">
                    <p className="text-2xl font-bold">Dreaming in neon light</p>
                    <p className="text-2xl font-bold opacity-30">The world fades out of sight</p>
                    <p className="text-2xl font-bold opacity-30">Inside the aura of the sound</p>
                    <p className="text-2xl font-bold opacity-30">We're finally found</p>
                  </motion.div>
                  <div className="absolute bottom-6 left-1/2 -translate-x-1/2 text-[10px] font-black tracking-[0.5em] opacity-40">LIVE LYRICS</div>
               </div>
             </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

createRoot(document.getElementById('root')).render(<AuraApp />);