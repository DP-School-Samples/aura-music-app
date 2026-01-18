import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, SkipForward, SkipBack, Search, Download, CheckCircle, X, User, HardDrive } from 'lucide-react';

const AuraApp = () => {
  // --- STATE ---
  const [user, setUser] = useState(JSON.parse(localStorage.getItem('aura_user')) || null);
  const [searchQuery, setSearchQuery] = useState("");
  const [songs, setSongs] = useState([]);
  const [activeSong, setActiveSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [offlineVault, setOfflineVault] = useState(JSON.parse(localStorage.getItem('aura_vault')) || []);
  const [view, setView] = useState('home'); // 'home' or 'vault'
  
  const audioRef = useRef(new Audio());

  // --- AUDIO LOGIC ---
  useEffect(() => {
    if (activeSong) {
      audioRef.current.src = activeSong.url; // This would be the real MP3 link
      if (isPlaying) audioRef.current.play().catch(e => console.log("Audio block: Need user interaction"));
    }
  }, [activeSong]);

  useEffect(() => {
    isPlaying ? audioRef.current.play() : audioRef.current.pause();
  }, [isPlaying]);

  // --- ACCOUNT LOGIC ---
  const handleLogin = () => {
    const fakeUser = { name: "Listener", id: "123", avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Aura" };
    setUser(fakeUser);
    localStorage.setItem('aura_user', JSON.stringify(fakeUser));
  };

  // --- DOWNLOAD/OFFLINE LOGIC ---
  const saveToVault = (song) => {
    const updatedVault = [...offlineVault, song];
    setOfflineVault(updatedVault);
    localStorage.setItem('aura_vault', JSON.stringify(updatedVault));
    alert(`${song.title} saved to your local vault!`);
  };

  // --- SEARCH LOGIC (Path A: Search any song) ---
  const handleSearch = async (e) => {
    e.preventDefault();
    // Simulate fetching from a global database
    const results = [
      { id: '1', title: "After Hours", artist: "The Weeknd", cover: "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17?w=800", color: "#8b0000", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3" },
      { id: '2', title: "Levitating", artist: "Dua Lipa", cover: "https://images.unsplash.com/photo-1493225255756-d9584f8606e9?w=800", color: "#1e3a8a", url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3" }
    ];
    setSongs(results);
  };

  return (
    <div className="min-h-screen text-white relative bg-[#050505] overflow-x-hidden">
      <div className="fixed inset-0 opacity-20 blur-[120px] transition-all duration-1000" style={{ backgroundColor: activeSong?.color || '#121212' }} />

      {/* Sidebar Navigation */}
      <nav className="fixed left-0 top-0 bottom-0 w-20 bg-white/5 backdrop-blur-md border-r border-white/10 flex flex-col items-center py-8 gap-10 z-20">
        <div className="font-black text-xl italic tracking-tighter">A</div>
        <button onClick={() => setView('home')} className={view === 'home' ? "text-white" : "text-white/40"}><Search /></button>
        <button onClick={() => setView('vault')} className={view === 'vault' ? "text-white" : "text-white/40"}><HardDrive /></button>
        <div className="mt-auto">
          {user ? <img src={user.avatar} className="w-10 h-10 rounded-full" /> : <button onClick={handleLogin}><User /></button>}
        </div>
      </nav>

      <main className="ml-20 p-8">
        {view === 'home' ? (
          <section className="max-w-5xl mx-auto">
            <h1 className="text-5xl font-black mb-12 tracking-tight">Explore</h1>
            <form onSubmit={handleSearch} className="mb-12">
              <input 
                type="text" placeholder="Search world database..." 
                className="w-full bg-white/5 border border-white/10 p-6 rounded-2xl outline-none focus:ring-2 ring-white/20"
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
            <div className="grid gap-4">
              {songs.map(song => (
                <SongCard key={song.id} song={song} onPlay={() => setActiveSong(song)} onSave={() => saveToVault(song)} />
              ))}
            </div>
          </section>
        ) : (
          <section className="max-w-5xl mx-auto">
            <h1 className="text-5xl font-black mb-12 tracking-tight">Your Vault</h1>
            <div className="grid gap-4">
              {offlineVault.length > 0 ? offlineVault.map(song => (
                <SongCard key={song.id} song={song} onPlay={() => setActiveSong(song)} isSaved={true} />
              )) : <p className="text-white/40 italic">Your offline vault is empty.</p>}
            </div>
          </section>
        )}
      </main>

      {/* Floating Mini Player */}
      <AnimatePresence>
        {activeSong && (
          <motion.div 
            initial={{ y: 100 }} animate={{ y: 0 }}
            className="fixed bottom-6 left-24 right-6 h-24 bg-white/10 backdrop-blur-2xl border border-white/20 rounded-3xl flex items-center px-6 gap-6 z-30"
          >
            <img src={activeSong.cover} className="w-14 h-14 rounded-xl shadow-lg" />
            <div className="flex-1">
              <h4 className="font-bold leading-none mb-1">{activeSong.title}</h4>
              <p className="text-xs text-white/40 uppercase tracking-widest">{activeSong.artist}</p>
            </div>
            <div className="flex items-center gap-6">
              <SkipBack className="cursor-pointer" />
              <button onClick={() => setIsPlaying(!isPlaying)} className="w-12 h-12 bg-white rounded-full flex items-center justify-center text-black">
                {isPlaying ? <Pause size={20} fill="black" /> : <Play size={20} fill="black" className="ml-1" />}
              </button>
              <SkipForward className="cursor-pointer" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const SongCard = ({ song, onPlay, onSave, isSaved }) => (
  <motion.div 
    whileHover={{ x: 10 }}
    className="flex items-center gap-5 p-4 bg-white/5 rounded-2xl border border-transparent hover:border-white/10 cursor-pointer group"
    onClick={onPlay}
  >
    <img src={song.cover} className="w-16 h-16 rounded-xl object-cover shadow-md" />
    <div className="flex-1">
      <h3 className="font-bold text-lg">{song.title}</h3>
      <p className="text-white/40 text-sm font-medium uppercase tracking-wider">{song.artist}</p>
    </div>
    {!isSaved && (
      <button onClick={(e) => { e.stopPropagation(); onSave(); }} className="p-3 opacity-0 group-hover:opacity-100 transition-opacity">
        <Download size={20} />
      </button>
    )}
  </motion.div>
);

createRoot(document.getElementById('root')).render(<AuraApp />);