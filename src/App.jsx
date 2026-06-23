import React, { useState, useEffect } from 'react';

export default function App() {
  const [timeText, setTimeText] = useState('');
  const [dateText, setDateText] = useState('');
  const [showCaregiver, setShowCaregiver] = useState(false);

  const [reminder, setReminder] = useState(() => {
    return localStorage.getItem('echo_reminder') || "Your daughter Sarah is coming to visit at 4:00 PM.";
  });
  const [inputNote, setInputNote] = useState(reminder);

  useEffect(() => {
    const updateDateTime = () => {
      const now = new Date();
      const hour = now.getHours();
      let period = 'Day';
      if (hour >= 5 && hour < 12) period = 'Morning';
      else if (hour >= 12 && hour < 17) period = 'Afternoon';
      else if (hour >= 17 && hour < 21) period = 'Evening';
      else period = 'Night';

      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
      setTimeText(`It is ${days[now.getDay()]} ${period}.`);
      setDateText(now.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }));
    };

    updateDateTime();
    const interval = setInterval(updateDateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleSpeak = (e) => {
    // Prevent double-triggering if they click the button specifically
    if (e) e.stopPropagation(); 
    
    window.speechSynthesis.cancel();
    const textToSpeak = `Good day. ${timeText}. Today is ${dateText}. The weather outside is warm and clear. Here is your message for today: ${reminder}. You are safe, and everything is okay.`;
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = 0.75; // Perfectly paced for clear hearing
    window.speechSynthesis.speak(utterance);
  };

  const saveNote = (e) => {
    e.preventDefault();
    setReminder(inputNote);
    localStorage.setItem('echo_reminder', inputNote);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0f24] via-[#0f172a] to-[#020617] text-slate-100 flex flex-col font-sans antialiased selection:bg-emerald-500 selection:text-slate-950">
      
      {/* HEADER BAR */}
      <header className="border-b border-indigo-950/40 p-5 bg-slate-950/40 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-3">
            <span className="text-3xl animate-bounce duration-1000">🧠</span>
            <h1 className="text-2xl font-black tracking-wider bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
              EchoLane
            </h1>
          </div>
          
          <button 
            onClick={() => setShowCaregiver(!showCaregiver)}
            className={`text-xs px-4 py-2 rounded-full font-bold uppercase tracking-wider transition-all border duration-300 ${
              showCaregiver 
                ? 'bg-rose-500/20 text-rose-300 border-rose-500/40 shadow-lg shadow-rose-950/20' 
                : 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30 hover:bg-indigo-500/20'
            }`}
          >
            {showCaregiver ? '🔒 Close Caregiver Settings' : '⚙️ Open Caregiver Portal'}
          </button>
        </div>
      </header>

      {/* MAIN VIEW */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-6 flex flex-col lg:flex-row gap-8 justify-center items-center my-auto transition-all duration-500">
        
        {/* PATIENT VIEW (Clicking anywhere triggers voice guidance) */}
        <section 
          onClick={() => handleSpeak()}
          className={`w-full ${showCaregiver ? 'lg:w-2/3' : 'max-w-3xl'} bg-slate-900/40 p-8 md:p-14 rounded-[2rem] border border-indigo-500/10 shadow-2xl shadow-indigo-950/50 backdrop-blur-xl space-y-10 flex flex-col justify-between transition-all duration-500 relative overflow-hidden group cursor-pointer hover:border-emerald-500/20 active:scale-[0.99]`}
        >
          
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px] pointer-events-none group-hover:bg-emerald-500/10 transition-colors duration-500"></div>
          
          <div className="space-y-4">
            <div className="flex justify-between items-start">
              <span className="text-xs font-black tracking-widest text-emerald-400/80 uppercase px-3 py-1 bg-emerald-500/10 rounded-md inline-block">
                Your Daily Anchor
              </span>
              {/* ACCESSIBILITY TIP */}
              <span className="text-xs text-slate-500 font-medium hidden sm:inline-block">💡 Click anywhere to listen</span>
            </div>
            
            <h2 className="text-5xl md:text-7xl font-black tracking-tight text-white leading-none drop-shadow-sm">
              {timeText || "Loading..."}
            </h2>
            
            {/* UPDATED DATE & WEATHER BLOCK */}
            <div className="flex flex-wrap items-center gap-3 text-xl md:text-2xl text-slate-400 font-medium tracking-wide">
              <span>{dateText}</span>
              <span className="text-slate-600 hidden sm:inline">•</span>
              <span className="text-emerald-400/90 bg-slate-950/40 px-3 py-0.5 rounded-xl border border-slate-800 text-lg flex items-center gap-1.5">
                🌤️ 24°C · Clear & Warm
              </span>
            </div>
          </div>

          <div className="bg-slate-950/70 p-6 md:p-10 rounded-2xl border border-indigo-500/5 relative shadow-inner">
            <span className="text-xs font-bold tracking-widest text-indigo-400/60 uppercase block mb-3 font-mono">
              Caregiver Note
            </span>
            <p className="text-2xl md:text-4xl font-extrabold text-teal-300 leading-relaxed drop-shadow-md">
              "{reminder}"
            </p>
          </div>

          {/* MASSIVE AUDIO BUTTON FOR PATIENT */}
          <button 
            onClick={handleSpeak}
            className="w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-2xl py-6 rounded-2xl transition-all duration-300 shadow-xl shadow-emerald-950/40 hover:shadow-emerald-500/20 flex items-center justify-center gap-4 hover:tracking-wide"
          >
            <span className="text-3xl animate-pulse">🔊</span> Click to Hear This Aloud
          </button>
        </section>

        {/* CAREGIVER DASHBOARD */}
        {showCaregiver && (
          <section className="w-full lg:w-1/3 bg-slate-900/80 p-6 rounded-2xl border border-rose-500/20 shadow-xl space-y-5 animate-fadeIn backdrop-blur-lg">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
              <span className="text-xl">👩‍⚕️</span>
              <h3 className="text-lg font-bold text-slate-200">
                Caregiver Control Panel
              </h3>
            </div>
            
            <p className="text-xs text-slate-400 leading-relaxed">
              This panel simulator lets you edit what your patient sees remotely. Updates deploy immediately to the wall panel.
            </p>
            
            <form onSubmit={saveNote} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-indigo-300 uppercase tracking-wider mb-2 font-mono">
                  Active Notice Text
                </label>
                <textarea 
                  value={inputNote}
                  onChange={(e) => setInputNote(e.target.value)}
                  rows={4}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 transition-colors duration-200 resize-none font-medium focus:ring-1 focus:ring-emerald-500/20"
                  placeholder="Enter message or schedule..."
                />
              </div>
              
              <button 
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-sm font-bold py-3.5 rounded-xl transition duration-200 shadow-lg shadow-indigo-950 border border-indigo-400/20 active:scale-95"
              >
                📡 Push Update to Device
              </button>
            </form>
          </section>
        )}

      </main>
    </div>
  );
}