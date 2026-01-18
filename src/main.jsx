import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipForward, SkipBack, Search, Download, CheckCircle, X, Heart } from 'lucide-react';

// --- STYLES (Tailwind + Custom Animations) ---
const glassStyle = "bg-white/10 backdrop-blur-xl border border-white/20 shadow-2xl";

const AuraApp = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [songs, setSongs] = useState([]);
  const [activeSong, setActiveSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState({});
  const audioRef = useRef(null);

  // 1. SEARCH FUNCTION (Path A: Search any song)
  // Note: Using a public proxy for demonstration. 
  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery) return;
    
    // Simulate a global search (In a production app, you'd fetch from a YouTube/Spotify API Wrapper)
    const mockResults = [
      { id: '1', title: searchQuery + " (Remix)", artist: "Global Artist", cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800", color: "#6366f1" },
      { id: '2', title: searchQuery, artist: "Popular Artist", cover: "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=800", color: "#ec4899" },
      { id: '3', title: searchQuery + " - Live", artist: "Verified Artist", cover: "https://images.unsplash.com/photo-1459749411177-042180ce673c?w=800", color: "#06b6d4" }
    ];
    setSongs(mockResults);
  };

  // 2. DOWNLOAD/OFFLINE LOGIC (Path B: Local Storage)
  const toggleDownload = (id) => {
    setIsDownloaded(prev => ({ ...prev, [id]: !prev[id] }));
    // In a real PWA, this would trigger a Service Worker to cache the audio file
    alert("Song added to offline vault!");
  };

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-cyan-500/30">
      {/* Dynamic Liquid Background */}
      <div 
        className="fixed inset-0 transition-all duration-1000 opacity-20 blur-[120px]"
        style={{ backgroundColor: activeSong?.color || '#1e1e1e' }}
      />

      {/* Header & Search */}
      <nav className="relative z-10 p-8 flex flex-col items-center">
        <h1 className="text-4xl font-black tracking-tighter mb-8 bg-gradient-to-r from-white to-gray-500 bg-clip-text text-transparent">AURA</h1>
        <form onSubmit={handleSearch} className="relative w-full max-w-xl">
          <input 
            type="text" 
            placeholder="Search any song, artist, or album..." 
            className={`w-full p-5 pl-14 rounded-full outline-none transition-all ${glassStyle} focus:ring-2 ring-white/30`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-white/50" />
        </form>
      </nav>

      {/* Results Grid */}
      <main className="relative z-10 px-8 pb-32 max-w-6xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {songs.map(song => (
            <motion.div 
              key={song.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`p-4 rounded-3xl cursor-pointer ${glassStyle} flex items-center gap-4`}
              onClick={() => { setActiveSong(song); setIsPlaying(true); }}
            >
              <motion.img layoutId={`art-${song.id}`} src={song.cover} className="w-20 h-20 rounded-2xl object-cover" />
              <div className="flex-1">
                <h3 className="font-bold text-lg leading-tight">{song.title}</h3>
                <p className="text-white/50">{song.artist}</p>
              </div>
              <button 
                onClick={(e) => { e.stopPropagation(); toggleDownload(song.id); }}
                className="p-2 hover:bg-white/10 rounded-full transition-colors"
              >
                {isDownloaded[song.id] ? <CheckCircle className="text-cyan-400" /> : <Download size={20} />}
              </button>
            </motion.div>
          ))}
        </div>
      </main>

      {/* Liquid Player Transition */}
      <AnimatePresence>
        {activeSong && (
          <motion.div 
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={`fixed inset-0 z-50 flex flex-col items-center justify-center p-8 bg-black/40 backdrop-blur-3xl`}
          >
            <button onClick={() => setActiveSong(null)} className="absolute top-10 right-10 p-3 bg-white/10 rounded-full">
              <X />
            </button>

            <motion.img 
              layoutId={`art-${activeSong.id}`}
              src={activeSong.cover}
              className="w-72 h-72 md:w-96 md:h-96 rounded-[50px] shadow-[0_40px_80px_rgba(0,0,0,0.7)] mb-12"
            />

            <div className="text-center max-w-md">
              <h2 className="text-4xl font-bold mb-2">{activeSong.title}</h2>
              <p className="text-xl text-white/60 mb-12">{activeSong.artist}</p>
              
              <div className="flex items-center justify-center gap-10">
                <SkipBack size={32} className="cursor-pointer hover:text-cyan-400 transition-colors" />
                <motion.button 
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-black shadow-xl"
                >
                  {isPlaying ? <Pause size={40} fill="black" /> : <Play size={40} fill="black" className="ml-2" />}
                </motion.button>
                <SkipForward size={32} className="cursor-pointer hover:text-cyan-400 transition-colors" />
              </div>
              
              <div className="mt-12 flex items-center gap-4 w-full">
                <span className="text-xs text-white/40">0:45</span>
                <div className="h-1.5 flex-1 bg-white/10 rounded-full overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "35%" }}
                    className="h-full bg-white"
                  />
                </div>
                <span className="text-xs text-white/40">3:20</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const container = document.getElementById('root');
const root = createRoot(container);
root.render(<AuraApp />);