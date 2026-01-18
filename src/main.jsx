import React, { useState } from 'react';
import ReactDOM from 'react-dom/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, SkipBack, SkipForward, X, Search, Home, Library, Heart } from 'lucide-react';

// --- DATA: Sample Songs ---
const SONGS = [
  { id: 1, title: "Luminescent", artist: "Aura Flow", cover: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=800", color: "#6366f1" },
  { id: 2, title: "Neon Nights", artist: "Cyberwave", cover: "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=800", color: "#ec4899" },
  { id: 3, title: "Deep Focus", artist: "Solaris", cover: "https://images.unsplash.com/photo-1459749411177-042180ce673c?w=800", color: "#10b981" },
  { id: 4, title: "After Hours", artist: "The Midnight", cover: "https://images.unsplash.com/photo-1557672172-298e090bd0f1?w=800", color: "#f59e0b" },
];

// --- COMPONENT: Player Screen ---
function Player({ song, onClose }) {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/90 backdrop-blur-3xl p-8"
    >
      <button onClick={onClose} className="absolute top-12 right-10 p-3 hover:bg-white/10 rounded-full transition-colors">
        <X size={32} />
      </button>

      {/* SHARED ELEMENT: The Image */}
      <motion.img
        layoutId={`art-${song.id}`}
        src={song.cover}
        className="w-72 h-72 md:w-96 md:h-96 rounded-[40px] shadow-2xl mb-12 object-cover"
        transition={{ type: "spring", stiffness: 200, damping: 25 }}
      />

      <motion.div 
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="text-center w-full max-w-md"
      >
        <h1 className="text-4xl font-bold mb-2 tracking-tight">{song.title}</h1>
        <p className="text-xl text-white/50 mb-10">{song.artist}</p>
        
        {/* Progress Bar */}
        <div className="w-full h-1 bg-white/10 rounded-full mb-10 relative overflow-hidden">
           <motion.div 
            initial={{ x: "-100%" }}
            animate={{ x: "-30%" }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="absolute inset-0 bg-white" 
           />
        </div>

        <div className="flex items-center justify-center gap-10">
          <SkipBack size={36} className="text-white/80 hover:text-white cursor-pointer" />
          <motion.div 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="w-20 h-20 bg-white rounded-full flex items-center justify-center text-black shadow-xl"
          >
            <Play size={36} fill="black" />
          </motion.div>
          <SkipForward size={36} className="text-white/80 hover:text-white cursor-pointer" />
        </div>
      </motion.div>
    </motion.div>
  );
}

// --- COMPONENT: Main App ---
function App() {
  const [activeSong, setActiveSong] = useState(null);

  return (
    <div className="min-h-screen bg-[#050505] text-white font-sans selection:bg-indigo-500">
      {/* Liquid Background Effect */}
      <div 
        className="fixed inset-0 transition-colors duration-1000 opacity-20 blur-[120px] pointer-events-none"
        style={{ backgroundColor: activeSong?.color || '#312e81' }}
      />

      {/* Sidebar (Desktop) / Bottom Nav (Mobile) */}
      <nav className="fixed bottom-0 w-full md:left-0 md:top-0 md:w-24 h-20 md:h-full bg-black/40 border-t md:border-t-0 md:border-r border-white/10 flex md:flex-col items-center justify-around md:justify-center gap-8 z-40 backdrop-blur-md">
        <Home size={28} className="text-white" />
        <Search size={28} className="text-white/40 hover:text-white cursor-pointer" />
        <Library size={28} className="text-white/40 hover:text-white cursor-pointer" />
        <Heart size={28} className="text-white/40 hover:text-white cursor-pointer" />
      </nav>

      <main className="md:ml-24 p-6 md:p-12 max-w-5xl mx-auto pb-32">
        <header className="mb-12">
          <h2 className="text-sm uppercase tracking-widest text-white/40 mb-2">Made for You</h2>
          <h1 className="text-5xl font-black italic">Aura Music</h1>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {SONGS.map((song) => (
            <motion.div
              key={song.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveSong(song)}
              className="group relative overflow-hidden flex items-center gap-6 p-4 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all cursor-pointer"
            >
              <motion.img
                layoutId={`art-${song.id}`}
                src={song.cover}
                className="w-20 h-20 rounded-2xl object-cover shadow-lg"
              />
              <div className="flex-1">
                <h3 className="text-xl font-bold">{song.title}</h3>
                <p className="text-white/40 font-medium">{song.artist}</p>
              </div>
              <div className="opacity-0 group-hover:opacity-100 transition-opacity bg-white text-black p-3 rounded-full mr-2">
                <Play size={20} fill="black" />
              </div>
            </motion.div>
          ))}
        </div>
      </main>

      <AnimatePresence>
        {activeSong && (
          <Player song={activeSong} onClose={() => setActiveSong(null)} />
        )}
      </AnimatePresence>
    </div>
  );
}

// --- RENDER ---
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);