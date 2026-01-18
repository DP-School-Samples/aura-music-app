import React, { useState, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipForward, SkipBack, Search, Download, CheckCircle, X, Heart } from 'lucide-react';

const glassStyle = "bg-white/5 backdrop-blur-2xl border border-white/10 shadow-2xl";

const AuraApp = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [songs, setSongs] = useState([
    { id: '1', title: "Starlight", artist: "Muse", cover: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=800", color: "#3b82f6" },
    { id: '2', title: "Blinding Lights", artist: "The Weeknd", cover: "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=800", color: "#ef4444" }
  ]);
  const [activeSong, setActiveSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isDownloaded, setIsDownloaded] = useState({});

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery) return;
    // Real Spotify/YouTube API integration would go here
    const results = [
      { id: Date.now(), title: searchQuery, artist: "Global Artist", cover: "https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=800", color: "#8b5cf6" },
      { id: Date.now()+1, title: searchQuery + " (Aura Mix)", artist: "Verified Creator", cover: "https://images.unsplash.com/photo-1459749411177-042180ce673c?w=800", color: "#06b6d4" }
    ];
    setSongs(results);
  };

  return (
    <div className="min-h-screen text-white relative">
      {/* Liquid Background */}
      <div 
        className="fixed inset-0 transition-all duration-1000 opacity-30 blur-[120px]"
        style={{ backgroundColor: activeSong?.color || '#1e1e1e' }}
      />

      {/* Search Header */}
      <header className="relative z-10 pt-12 px-6 flex flex-col items-center">
        <motion.h1 
          initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}
          className="text-5xl font-black mb-8 tracking-tighter"
        >
          AURA
        </motion.h1>
        <form onSubmit={handleSearch} className="w-full max-w-2xl relative">
          <input 
            type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search any song in the world..." 
            className={`w-full p-6 pl-16 rounded-full outline-none transition-all ${glassStyle} focus:ring-2 ring-white/20 text-lg`}
          />
          <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-white/40" />
        </form>
      </header>

      {/* Song List */}
      <main className="relative z-10 p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
        {songs.map(song => (
          <motion.div 
            key={song.id} layoutId={`card-${song.id}`}
            onClick={() => { setActiveSong(song); setIsPlaying(true); }}
            className={`p-4 rounded-[2rem] cursor-pointer flex items-center gap-5 ${glassStyle} hover:bg-white/10 transition-colors`}
          >
            <motion.img layoutId={`art-${song.id}`} src={song.cover} className="w-20 h-20 rounded-2xl object-cover shadow-lg" />
            <div className="flex-1">
              <h3 className="font-bold text-xl">{song.title}</h3>
              <p className="text-white/40">{song.artist}</p>
            </div>
            <button 
              onClick={(e) => { e.stopPropagation(); setIsDownloaded({...isDownloaded, [song.id]: true}); }}
              className="p-3 rounded-full hover:bg-white/10"
            >
              {isDownloaded[song.id] ? <CheckCircle className="text-green-400" /> : <Download size={20} />}
            </button>
          </motion.div>
        ))}
      </main>

      {/* Fullscreen Player */}
      <AnimatePresence>
        {activeSong && (
          <motion.div 
            initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }}
            transition={{ type: "spring", damping: 30, stiffness: 200 }}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-3xl p-8 flex flex-col items-center justify-center"
          >
            <button onClick={() => setActiveSong(null)} className="absolute top-10 right-10 p-4 bg-white/5 rounded-full"><X /></button>
            
            <motion.img 
              layoutId={`art-${activeSong.id}`} src={activeSong.cover} 
              className="w-80 h-80 md:w-[450px] md:h-[450px] rounded-[60px] shadow-2xl mb-12 border border-white/10" 
            />

            <div className="text-center w-full max-w-lg">
              <h2 className="text-5xl font-bold mb-3 tracking-tight">{activeSong.title}</h2>
              <p className="text-2xl text-white/40 mb-12">{activeSong.artist}</p>
              
              <div className="flex items-center justify-between px-10 mb-12">
                <SkipBack size={40} className="hover:text-white/60 cursor-pointer" />
                <motion.button 
                  whileTap={{ scale: 0.9 }} onClick={() => setIsPlaying(!isPlaying)}
                  className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-black"
                >
                  {isPlaying ? <Pause size={48} fill="black" /> : <Play size={48} fill="black" className="ml-2" />}
                </motion.button>
                <SkipForward size={40} className="hover:text-white/60 cursor-pointer" />
              </div>

              <div className="flex items-center gap-4 text-xs text-white/30 font-mono">
                <span>0:45</span>
                <div className="h-1.5 flex-1 bg-white/10 rounded-full overflow-hidden">
                  <motion.div initial={{ width: 0 }} animate={{ width: '45%' }} className="h-full bg-white" />
                </div>
                <span>3:30</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

createRoot(document.getElementById('root')).render(<AuraApp />);