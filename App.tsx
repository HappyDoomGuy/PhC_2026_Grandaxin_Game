import React, { useState, useEffect } from 'react';
import GameContainer from './components/GameContainer';
import blueImage from './blue.png';
import greenImage from './green.png';
import redImage from './red.png';
import targetImage from './target.png';

const App: React.FC = () => {
  const [isStarted, setIsStarted] = useState(false);
  const [showDisclaimer, setShowDisclaimer] = useState(false);
  const [checkbox1, setCheckbox1] = useState(false);
  const [checkbox2, setCheckbox2] = useState(false);
  const [sightTarget, setSightTarget] = useState(0);

  useEffect(() => {
    if (isStarted || showDisclaimer) return;
    const id = setInterval(() => {
      setSightTarget((prev) => {
        const next = Math.floor(Math.random() * 3);
        return next;
      });
    }, 1200 + Math.random() * 800);
    return () => clearInterval(id);
  }, [isStarted, showDisclaimer]);

  const handleStartClick = () => {
    setShowDisclaimer(true);
  };

  const handleDisclaimerAccept = () => {
    setShowDisclaimer(false);
    setCheckbox1(false);
    setCheckbox2(false);
    setIsStarted(true);
  };

  const canAccept = checkbox1 && checkbox2;

  return (
    <div className="w-full h-full overflow-hidden bg-[#05070a] text-slate-100 flex items-center justify-center" style={{ height: 'calc(var(--vh, 1vh) * 100)', minHeight: 0 }}>
      {/* Mobile-first Container: Forces portrait aspect ratio on desktop */}
      <div className="relative h-full w-full max-w-[500px] aspect-[9/16] bg-[#0a0f1e] shadow-2xl overflow-hidden shadow-blue-900/20">
        {/* Объединённый дисклеймер */}
        {showDisclaimer && (
          <div 
            className="absolute inset-0 flex flex-col items-center justify-start p-6 pt-8 z-50 overflow-y-auto overflow-x-hidden"
            style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #75C4E6 100%)' }}
          >
            <div className="w-full max-w-md space-y-6 flex-shrink-0">
              <h2 className="text-xl font-black text-slate-800 tracking-tight mb-4 text-center uppercase">
                ВАЖНАЯ ИНФОРМАЦИЯ!
              </h2>
              
              <div className="bg-white/90 backdrop-blur-sm border border-slate-200/80 rounded-[2rem] p-6 space-y-4 shadow-xl shadow-slate-300/30">
                <p className="font-semibold text-slate-800 mb-3">
                  Прежде чем начать, пожалуйста, внимательно ознакомьтесь с данной информацией:
                </p>
                
                <p className="text-slate-700 text-sm leading-relaxed">
                  Игра-тапер «Грандаксин может» является развлекательным приложением и создана исключительно в игровых и развлекательных целях.
                </p>
                
                <p className="text-slate-700 text-sm leading-relaxed">
                  Игра предназначена только для специалистов здравоохранения (включая, но не ограничиваясь, врачей, медсестер, фельдшеров, студентов медицинских вузов, фармацевтов, провизоров, работников аптек и т.д.).
                </p>
                
                <p className="text-slate-700 text-sm leading-relaxed">
                  <span className="font-semibold text-slate-800">Конфиденциальность.</span> Приложение не собирает, не обрабатывает и не хранит персональные данные пользователей. Весь игровой процесс является анонимным.
                </p>
                
                <p className="text-slate-700 text-sm leading-relaxed">
                  <span className="font-semibold text-slate-800">Не является медицинской услугой:</span> данная игра никоим образом не является медицинским устройством, диагностическим инструментом или средством лечения.
                </p>
                
                <p className="text-slate-700 text-sm leading-relaxed">
                  <span className="font-semibold text-slate-800">Отказ от ответственности.</span> Разработчики и правообладатели игры не несут ответственности за любые решения или действия, предпринятые пользователем на основании информации, впечатлений или ассоциаций, возникших в ходе использования данного приложения.
                </p>
                
                <p className="text-slate-700 text-sm leading-relaxed">
                  Я подтверждаю, что являюсь специалистом в сфере здравоохранения и понимаю, что Игра-тапер «Грандаксин может» носит исключительно развлекательный и игровой характер. Я осознаю, что данное приложение не является медицинским инструментом, не призывает к самолечению. Мне известно, что приложение является анонимным и не собирает мои персональные данные.
                </p>
              </div>

              <div className="space-y-4">
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={checkbox1}
                    onChange={(e) => setCheckbox1(e.target.checked)}
                    className="mt-1 w-5 h-5 min-w-[20px] min-h-[20px] flex-shrink-0 rounded border-slate-300 bg-white text-blue-600 focus:ring-blue-500 focus:ring-offset-0 accent-blue-500"
                  />
                  <span className="text-slate-700 text-sm">
                    Я ознакомился с информацией и понимаю, что игра носит исключительно развлекательный характер
                  </span>
                </label>
                
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={checkbox2}
                    onChange={(e) => setCheckbox2(e.target.checked)}
                    className="mt-1 w-5 h-5 min-w-[20px] min-h-[20px] flex-shrink-0 rounded border-slate-300 bg-white text-blue-600 focus:ring-blue-500 focus:ring-offset-0 accent-blue-500"
                  />
                  <span className="text-slate-700 text-sm">
                    Я подтверждаю, что являюсь специалистом в сфере здравоохранения
                  </span>
                </label>
              </div>

              <div className={`relative w-full ${canAccept ? 'group' : ''}`}>
                {canAccept && (
                  <div className="absolute -inset-1 bg-blue-500 rounded-2xl blur opacity-25 group-hover:opacity-60 transition duration-1000" />
                )}
                <button
                  onClick={handleDisclaimerAccept}
                  disabled={!canAccept}
                  className={`relative w-full py-5 rounded-2xl font-black text-xl shadow-xl active:scale-95 transition-all ${
                    canAccept 
                      ? 'bg-white text-slate-900' 
                      : 'bg-slate-200/80 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  Я соглашаюсь с этими условиями
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Стартовый экран */}
        {!isStarted && !showDisclaimer && (
          <div className="h-full w-full flex flex-col items-center justify-center p-8 space-y-12 animate-in fade-in duration-1000" style={{ background: 'linear-gradient(180deg, #FFFFFF 0%, #75C4E6 100%)' }}>
            <style>{`
              @keyframes float {
                0%, 100% { transform: translateY(0); }
                50% { transform: translateY(-8px); }
              }
              @keyframes sight-float {
                0%, 100% { transform: translate(-50%, -50%) translateY(0); }
                50% { transform: translate(-50%, -50%) translateY(-10px); }
              }
              .float-symptom { animation: float 3s ease-in-out infinite; }
              .sight-float { animation: sight-float 2.5s ease-in-out infinite; }
            `}</style>
            <div className="text-center space-y-4">
              <div className="relative flex items-end justify-center gap-0 mb-6 min-h-[9rem]">
                <img src={redImage} alt="Стресс" className="w-36 h-36 object-contain float-symptom translate-y-3" style={{ animationDelay: '0s', filter: 'drop-shadow(0 4px 8px rgba(59, 130, 246, 0.35)) drop-shadow(0 10px 20px rgba(30, 64, 175, 0.2))' }} />
                <img src={blueImage} alt="Тревога" className="w-36 h-36 object-contain float-symptom -translate-y-5" style={{ animationDelay: '0.4s', filter: 'drop-shadow(0 4px 8px rgba(59, 130, 246, 0.35)) drop-shadow(0 10px 20px rgba(30, 64, 175, 0.2))' }} />
                <img src={greenImage} alt="Нервозность" className="w-36 h-36 object-contain float-symptom translate-y-4" style={{ animationDelay: '0.8s', filter: 'drop-shadow(0 4px 8px rgba(59, 130, 246, 0.35)) drop-shadow(0 10px 20px rgba(30, 64, 175, 0.2))' }} />
                <img
                  src={targetImage}
                  alt=""
                  className="absolute w-36 h-36 object-contain sight-float pointer-events-none z-10 transition-all duration-500 ease-in-out"
                  style={{
                    left: sightTarget === 0 ? '16.67%' : sightTarget === 1 ? '50%' : '83.33%',
                    top: sightTarget === 0 ? '58%' : sightTarget === 1 ? '36%' : '61%',
                  }}
                />
              </div>
              <h1 className="text-5xl font-black tracking-tighter bg-clip-text text-transparent leading-tight" style={{ fontFamily: "'Comic CAT', sans-serif", backgroundImage: 'linear-gradient(to bottom, rgb(30, 41, 59), #0083C1)', WebkitBackgroundClip: 'text', backgroundClip: 'text' }}>
                ГРАНДАКСИН<span className="align-super text-3xl" style={{ fontFamily: 'Inter, system-ui, sans-serif' }}>®</span><br/>МОЖЕТ
              </h1>
            </div>

            <div className="relative group cursor-pointer w-full max-w-xs mx-auto" onClick={handleStartClick}>
               <div className="absolute -inset-1 bg-blue-500 rounded-2xl blur opacity-25 group-hover:opacity-60 transition duration-1000"></div>
               <button className="relative w-full py-4 text-white rounded-2xl font-black text-lg transition-all active:scale-95 shadow-xl" style={{ fontFamily: "'Comic CAT', sans-serif", backgroundColor: '#0083C1' }}>
                  СТАРТ
               </button>
            </div>

            <div className="text-center">
              <p className="text-black text-sm font-medium">
                Игра-тапер предназначена только для специалистов здравоохранения
              </p>
            </div>
          </div>
        )}

        {/* Игровой экран */}
        {isStarted && !showDisclaimer && (
          <GameContainer onExit={() => setIsStarted(false)} />
        )}
      </div>
    </div>
  );
};

export default App;
