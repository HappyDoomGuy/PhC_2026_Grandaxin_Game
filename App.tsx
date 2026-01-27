
import React, { useState } from 'react';
import GameContainer from './components/GameContainer';

const App: React.FC = () => {
  const [isStarted, setIsStarted] = useState(false);

  return (
    <div className="h-screen w-screen overflow-hidden bg-[#05070a] text-slate-100 flex items-center justify-center">
      {/* Mobile-first Container: Forces portrait aspect ratio on desktop */}
      <div className="relative h-full w-full max-w-[500px] aspect-[9/16] bg-[#0a0f1e] shadow-2xl overflow-hidden shadow-blue-900/20">
        {!isStarted ? (
          <div className="h-full w-full flex flex-col items-center justify-center p-8 space-y-12 animate-in fade-in duration-1000">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 to-indigo-600 rounded-3xl flex items-center justify-center shadow-lg shadow-blue-500/30 mb-6 rotate-12">
                <span className="text-white font-black text-4xl">P</span>
              </div>
              <h1 className="text-6xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-blue-400 leading-tight">
                PILL<br/>DEFENSE
              </h1>
              <p className="text-blue-400 font-bold tracking-widest uppercase text-xs">Уничтожитель Симптомов v1.1</p>
            </div>

            <div className="relative group cursor-pointer w-full" onClick={() => setIsStarted(true)}>
               <div className="absolute -inset-1 bg-blue-500 rounded-2xl blur opacity-25 group-hover:opacity-60 transition duration-1000"></div>
               <button className="relative w-full py-6 bg-white text-slate-900 rounded-2xl font-black text-xl transition-all active:scale-95 shadow-xl">
                  НАЧАТЬ ЛЕЧЕНИЕ
               </button>
            </div>

            <div className="text-center space-y-2">
              <p className="text-slate-500 text-sm font-medium">
                Нажмите на коробку с таблетками, чтобы запустить антитела
              </p>
              <div className="flex justify-center gap-1 opacity-50">
                <div className="w-1 h-1 rounded-full bg-blue-500 animate-bounce"></div>
                <div className="w-1 h-1 rounded-full bg-blue-500 animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-1 h-1 rounded-full bg-blue-500 animate-bounce [animation-delay:0.4s]"></div>
              </div>
            </div>
          </div>
        ) : (
          <GameContainer onExit={() => setIsStarted(false)} />
        )}
      </div>
    </div>
  );
};

export default App;
