import React, { useState, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Pause, Search, Download, CheckCircle, HardDrive, User, Music } from 'lucide-react';

const YOUTUBE_API_KEY = "AIzaSyCQnyWFQms8ZgoZ5vSgC-7W3o3vC-IZHN4"; // Get this from Google Cloud Console

const AuraApp = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [songs, setSongs] = useState([]);
  const [activeSong, setActiveSong] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [vault, setVault] = useState(JSON.parse(localStorage.getItem('aura_vault')) || []);
  const [view, setView] = useState('home');
  
  const playerRef = useRef(null); // Ref for YouTube Player

  // Initialize YouTube IFrame API
  useEffect(() => {
    const tag = document.createElement('script');
    tag.src = "https://www.youtube.com/iframe_api";
    document.body.appendChild(tag);

    window.onYouTubeIframeAPIReady = () => {
      playerRef.current = new window.YT.Player('yt-player', {
        height: '0',
        width: '0',
        events: {
          'onStateChange': (event) => {
            if (event.data === window.YT.PlayerState.ENDED) setIsPlaying(false);
          }
        }
      });
    };
  }, []);

  // Control Playback
  useEffect(() => {
    if (!playerRef.current || !activeSong) return;
    if (isPlaying) {
      playerRef.current.loadVideoById(activeSong.id);
      playerRef.current.playVideo();
    } else {
      playerRef.current.pauseVideo();
    }
  }, [activeSong, isPlaying]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery) return;
    
    try {
      const res = await fetch(`https://www.googleapis.com/youtube/v3/search?part=snippet&maxResults=10&q=${searchQuery}&type=video&key=${YOUTUBE_API_KEY}`);
      const data = await res.json();
      
      const results = data.items.map(item => ({
        id: item.id.videoId,
        title: item.snippet.title,
        artist: item.snippet.channelTitle,
        cover: item.snippet.thumbnails.high.url,
        color: "#" + Math.floor(Math.random()*16777215).toString(16) // Random aura color
      }));
      setSongs(results);
    } catch (err) {
      alert("Search failed. Check your API Key!");
    }
  };

  const toggleVault = (song) => {
    const isSaved = vault.some(s => s.id === song.id);
    const newVault = isSaved ? vault.filter(s => s.id !== song.id) : [...vault, song];
    setVault(newVault);
    localStorage.setItem('aura_vault', JSON.stringify(newVault));
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans flex overflow-hidden">
      {/* Hidden Player */}
      <div id="yt-player" className="hidden"></div>

      {/* Sidebar */}
      <nav className="w-20 border-r border-white/5 bg-black/50 backdrop-blur-xl flex flex-col items-center py-10 gap-8 z-50">
        <button onClick={() => setView('home')} className={view === 'home' ? "text-white" : "text-white/30"}><Search /></button>
        <button onClick={() => setView('vault')} className={view === 'vault' ? "text-white" : "text-white/30"}><HardDrive /></button>
      </nav>

      {/* Main UI */}
      <main className="flex-1 p-8 overflow-y-auto pb-40 relative">
        <div className="fixed inset-0 opacity-10 blur-[100px]" style={{ backgroundColor: activeSong?.color || '#111' }} />
        
        <header className="relative mb-10">
          <h1 className="text-4xl font-black italic mb-6">AURA SEARCH</h1>
          <form onSubmit={handleSearch} className="relative max-w-2xl">
            <input 
              type="text" 
              className="w-full bg-white/5 border border-white/10 p-5 rounded-2xl outline-none"
              placeholder="Song, Artist, or Mood..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
        </header>

        <div className="grid gap-4 relative">
          {(view === 'home' ? songs : vault).map(song => (
            <div 
              key={song.id} 
              onClick={() => { setActiveSong(song); setIsPlaying(true); }}
              className="flex items-center gap-4 p-4 bg-white/5 rounded-2xl hover:bg-white/10 transition-all cursor-pointer group"
            >
              <img src={song.cover} className="w-16 h-16 rounded-xl object-cover" />
              <div className="flex-1">
                <h3 className="font-bold truncate max-w-xs">{song.title}</h3>
                <p className="text-sm text-white/40">{song.artist}</p>
              </div>
              <button onClick={(e) => { e.stopPropagation(); toggleVault(song); }} className="p-2 opacity-0 group-hover:opacity-100">
                {vault.some(s => s.id === song.id) ? <CheckCircle className="text-green-400" /> : <Download />}
              </button>
            </div>
          ))}
        </div>
      </main>

      {/* Floating Player */}
      <AnimatePresence>
        {activeSong && (
          <motion.div initial={{ y: 100 }} animate={{ y: 0 }} className="fixed bottom-6 left-28 right-8 h-20 bg-white/10 backdrop-blur-2xl rounded-3xl flex items-center px-6 gap-4 border border-white/10 shadow-2xl">
            <img src={activeSong.cover} className="w-12 h-12 rounded-lg" />
            <div className="flex-1 overflow-hidden">
              <h4 className="font-bold truncate text-sm">{activeSong.title}</h4>
            </div>
            <button onClick={() => setIsPlaying(!isPlaying)} className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center">
              {isPlaying ? <Pause fill="black" /> : <Play fill="black" className="ml-1" />}
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

createRoot(document.getElementById('root')).render(<AuraApp />);