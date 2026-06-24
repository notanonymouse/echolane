import React, { useState, useEffect } from 'react';

export default function App() {
  const [timeText, setTimeText] = useState('');
  const [dateText, setDateText] = useState('');
  const [showCaregiver, setShowCaregiver] = useState(false);

  // Caregiver Text Reminder State
  const [reminder, setReminder] = useState(() => {
    return localStorage.getItem('echo_reminder') || "Your daughter Sarah is coming to visit at 4:00 PM.";
  });
  const [inputNote, setInputNote] = useState(reminder);

  // NEW FEATURE: Medication Tracking State
  const [medsTaken, setMedsTaken] = useState(() => {
    return localStorage.getItem('echo_meds_taken') === 'true';
  });
  const [medsTime, setMedsTime] = useState(() => {
    return localStorage.getItem('echo_meds_time') || '';
  });

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
    if (e) e.stopPropagation(); 
    
    window.speechSynthesis.cancel();
    
    let medStatusText = "You have not taken your morning medicine yet. Please remember to check the button below.";
    if (medsTaken) {
      medStatusText = `Your morning medicine was successfully taken at ${medsTime}.`;
    }

    const textToSpeak = `Good day. ${timeText}. Today is ${dateText}. The weather outside is warm and clear. ${medStatusText} Here is your personal message: ${reminder}. You are safe, and everything is okay.`;
    
    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.rate = 0.75; 
    window.speechSynthesis.speak(utterance);
  };

  const saveNote = (e) => {
    e.preventDefault();
    setReminder(inputNote);
    localStorage.setItem('echo_reminder', inputNote);
  };

  // NEW FEATURE: Toggle medication status and lock in the timestamps
  const handleMedCheck = (e) => {
    e.stopPropagation(); // Stop from reading the whole card aloud
    if (!medsTaken) {
      const currentTime = new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      setMedsTaken(true);
      setMedsTime(currentTime);
      localStorage.setItem('echo_meds_taken', 'true');
      localStorage.setItem('echo_meds_time', currentTime);
      
      // Auditory confirmation for patient safety
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(`Medicine confirmed taken at ${currentTime}. Thank you.`);
      utterance.rate = 0.8;
      window.speechSynthesis.speak(utterance);
    } else {
      // Allow undoing from clicking again
      setMedsTaken(false);
      setMedsTime('');
      localStorage.setItem('echo_meds_taken', 'false');
      localStorage.removeItem('echo_meds_time');
    }
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
        
        {/* PATIENT DASHBOARD SCREEN */}
        <section 
          onClick={() => handleSpeak()}
          className={`w-full ${showCaregiver ? 'lg:w-2/3' : 'max-w-3xl'} bg-slate-900/40 p-8 md:p-12 rounded-[2rem] border border-indigo-500/10 shadow-2xl shadow-indigo-950/50 backdrop-blur-xl space-y-8 flex flex-col justify-between transition-all duration-500 relative overflow-hidden group cursor-pointer hover:border-emerald-500/20 active:scale-[0.99]`}
        >
          {/* Ambient Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-[80px] pointer-events-none group-hover:bg-emerald-500/10 transition-colors duration-500"></div>
          
          {/* Time & Orientation Block */}
          <div className="space-y-3">
            <div className="flex justify-between items-start">
              <span className="text-xs font-black tracking-widest text-emerald-400/80 uppercase px-3 py-1 bg-emerald-500/10 rounded-md inline-block">
                Your Daily Anchor
              </span>
              <span className="text-xs text-slate-500 font-medium hidden sm:inline-block">💡 Tap screen to speak everything</span>
            </div>
            
            <h2 className="text-5xl md:text-6xl font-black tracking-tight text-white leading-none drop-shadow-sm">
              {timeText || "Loading..."}
            </h2>
            
            <div className="flex flex-wrap items-center gap-3 text-lg md:text-xl text-slate-400 font-medium tracking-wide">
              <span>{dateText}</span>
              <span className="text-slate-600 hidden sm:inline">•</span>
              <span className="text-emerald-400/90 bg-slate-950/40 px-3 py-0.5 rounded-xl border border-slate-800 text-base flex items-center gap-1.5">
                🌤️ 24°C · Clear & Warm
              </span>
            </div>
          </div>

          {/* Caregiver Text Message Section */}
          <div className="bg-slate-950/70 p-5 md:p-8 rounded-2xl border border-indigo-500/5 shadow-inner">
            <span className="text-xs font-bold tracking-widest text-indigo-400/60 uppercase block mb-2 font-mono">
              Caregiver Note
            </span>
            <p className="text-xl md:text-3xl font-extrabold text-teal-300 leading-relaxed">
              "{reminder}"
            </p>
          </div>

          {/* TWO-COLUMN MICRO UTILITIES */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* NEW ENHANCEMENT: MEDICATION CHECK-IN CARD */}
            <div 
              onClick={handleMedCheck}
              className={`p-5 rounded-2xl border transition-all duration-300 flex flex-col justify-between h-36 ${
                medsTaken 
                  ? 'bg-emerald-500/10 border-emerald-500/30 shadow-lg shadow-emerald-950/20' 
                  : 'bg-slate-950/40 border-slate-800 hover:border-amber-500/30'
              }`}
            >
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">Morning Treatment</span>
                <p className="text-lg font-bold text-white mt-1">Have you taken your pills?</p>
              </div>
              {medsTaken ? (
                <div className="flex items-center gap-2 text-emerald-400 font-black text-sm uppercase font-mono bg-emerald-500/10 px-3 py-1.5 rounded-xl w-fit border border-emerald-500/20">
                  ✅ Taken at {medsTime}
                </div>
              ) : (
                <div className="text-amber-400 font-bold text-xs uppercase font-mono bg-amber-500/10 px-3 py-1.5 rounded-xl w-fit border border-amber-500/20 animate-pulse">
                  💊 Tap to Mark as Taken
                </div>
              )}
            </div>

            {/* NEW ENHANCEMENT: EMERGENCY ONE-TOUCH QUICK DIAL CARD */}
            <a 
              href="tel:5551234567"
              onClick={(e) => e.stopPropagation()} // Stop voice engine from firing
              className="p-5 rounded-2xl border bg-slate-950/40 border-slate-800 hover:border-sky-500/30 transition-all flex flex-col justify-between h-36 group/call"
            >
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">Immediate Help</span>
                <p className="text-lg font-bold text-white mt-1">Need to speak with family?</p>
              </div>
              <div className="flex items-center gap-2 text-sky-400 font-black text-sm uppercase font-mono bg-sky-500/10 px-3 py-1.5 rounded-xl w-fit border border-sky-500/20 group-hover/call:bg-sky-500 group-hover/call:text-slate-950 transition-all duration-300">
                📞 Call Daughter Sarah
              </div>
            </a>

          </div>

          {/* MAIN MASSIVE AUDIO SPEAKER BUTTON */}
          <button 
            onClick={handleSpeak}
            className="w-full bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-black text-xl md:text-2xl py-5 rounded-2xl transition-all duration-300 shadow-xl shadow-emerald-950/40 hover:shadow-emerald-500/20 flex items-center justify-center gap-4 hover:tracking-wide"
          >
            <span className="text-2xl animate-pulse">🔊</span> Click to Hear Everything Aloud
          </button>
        </section>

        {/* CAREGIVER DASHBOARD INPUT DRAWER */}
        {showCaregiver && (
          <section className="w-full lg:w-1/3 bg-slate-900/80 p-6 rounded-2xl border border-rose-500/20 shadow-xl space-y-5 animate-fadeIn backdrop-blur-lg">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
              <span className="text-xl">👩‍⚕️</span>
              <h3 className="text-lg font-bold text-slate-200">Caregiver Control Panel</h3>
            </div>
            
            <p className="text-xs text-slate-400 leading-relaxed">
              Remote administration dashboard. Use this tool to send active updates down to the patient bedside screen display.
            </p>
            
            <form onSubmit={saveNote} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-indigo-300 uppercase tracking-wider mb-2 font-mono">
                  Active Screen Reminder Text
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
                📡 Push Notice to Display
              </button>
            </form>
          </section>
        )}

      </main>
    </div>
  );
}