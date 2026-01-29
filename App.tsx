import React, { useState } from 'react';
import GameContainer from './components/GameContainer';

const App: React.FC = () => {
  const [isStarted, setIsStarted] = useState(false);
  const [showDisclaimer1, setShowDisclaimer1] = useState(true);
  const [showDisclaimer2, setShowDisclaimer2] = useState(false);

  const handleDisclaimer1Accept = () => {
    setShowDisclaimer1(false);
    setShowDisclaimer2(true);
  };

  const handleDisclaimer2Accept = () => {
    setShowDisclaimer2(false);
  };

  return (
    <div className="w-full h-full overflow-hidden bg-[#05070a] text-slate-100 flex items-center justify-center" style={{ height: 'calc(var(--vh, 1vh) * 100)', minHeight: 0 }}>
      {/* Mobile-first Container: Forces portrait aspect ratio on desktop */}
      <div className="relative h-full w-full max-w-[500px] aspect-[9/16] bg-[#0a0f1e] shadow-2xl overflow-hidden shadow-blue-900/20">
        {/* Первый дисклеймер */}
        {showDisclaimer1 && (
          <div className="absolute inset-0 bg-slate-950/98 backdrop-blur-2xl flex flex-col items-center justify-start p-6 pt-8 z-50 overflow-y-auto overflow-x-hidden">
            <div className="w-full max-w-md space-y-6 flex-shrink-0">
              <h2 className="text-2xl font-black text-white mb-4 leading-tight text-center uppercase tracking-tighter">
                ВАЖНАЯ ИНФОРМАЦИЯ!
              </h2>
              
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4 text-slate-300 text-sm leading-relaxed">
                <p className="font-semibold text-white mb-3">
                  Прежде чем начать, пожалуйста, внимательно ознакомьтесь с данной информацией:
                </p>
                
                <p>
                  Игра-тапер «Грандаксин может» является развлекательным приложением и создана исключительно в игровых и развлекательных целях.
                </p>
                
                <p>
                  Игра предназначена только для специалистов здравоохранения (включая, но не ограничиваясь, врачей, медсестер, фельдшеров, студентов медицинских вузов, фармацевтов, провизоров, работников аптек и т.д.).
                </p>
                
                <p>
                  <span className="font-semibold text-white">Конфиденциальность.</span> Приложение не собирает, не обрабатывает и не хранит персональные данные пользователей. Весь игровой процесс является анонимным.
                </p>
                
                <p>
                  <span className="font-semibold text-white">Не является медицинской услугой:</span> данная игра никоим образом не является медицинским устройством, диагностическим инструментом или средством лечения.
                </p>
                
                <p>
                  <span className="font-semibold text-white">Отказ от ответственности.</span> Разработчики и правообладатели игры не несут ответственности за любые решения или действия, предпринятые пользователем на основании информации, впечатлений или ассоциаций, возникших в ходе использования данного приложения.
                </p>
              </div>

              <button
                onClick={handleDisclaimer1Accept}
                className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-lg shadow-lg active:scale-95 transition-all"
              >
                С информацией ознакомлен
              </button>
            </div>
          </div>
        )}

        {/* Второй дисклеймер */}
        {showDisclaimer2 && !showDisclaimer1 && (
          <div className="absolute inset-0 bg-slate-950/98 backdrop-blur-2xl flex flex-col items-center justify-center p-6 z-50 overflow-y-auto">
            <div className="w-full max-w-md space-y-6">
              <h2 className="text-2xl font-black text-white mb-4 leading-tight text-center uppercase tracking-tighter">
                Подтверждение
              </h2>
              
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4 text-slate-300 text-sm leading-relaxed">
                <p>
                  Я подтверждаю, что являюсь специалистом в сфере здравоохранения и понимаю, что Игра-тапер «Грандаксин может» носит исключительно развлекательный характер и игровой характер. Я осознаю, что данное приложение не является медицинским инструментом, не призывает к самолечению. Мне известно, что приложение является анонимным и не собирает мои персональные данные.
                </p>
              </div>

              <button
                onClick={handleDisclaimer2Accept}
                className="w-full py-4 bg-blue-600 text-white rounded-2xl font-black text-lg shadow-lg active:scale-95 transition-all"
              >
                Я соглашаюсь с этими условиями
              </button>
            </div>
          </div>
        )}

        {/* Стартовый экран - показывается только после принятия обоих дисклеймеров */}
        {!isStarted && !showDisclaimer1 && !showDisclaimer2 && (
          <div className="h-full w-full flex flex-col items-center justify-center p-8 space-y-12 animate-in fade-in duration-1000">
            <div className="text-center space-y-4">
              <div className="w-20 h-20 mx-auto mb-6 flex items-center justify-center">
                <div className="w-16 h-16 bg-white rounded-full shadow-lg shadow-blue-500/30 flex items-center justify-center border-2 border-slate-200 relative">
                  <div className="absolute w-full h-0.5 bg-slate-300 rotate-45"></div>
                </div>
              </div>
              <h1 className="text-5xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-b from-white to-blue-400 leading-tight">
                ГРАНДАКСИН<br/>МОЖЕТ
              </h1>
            </div>

            <div className="relative group cursor-pointer w-full" onClick={() => setIsStarted(true)}>
               <div className="absolute -inset-1 bg-blue-500 rounded-2xl blur opacity-25 group-hover:opacity-60 transition duration-1000"></div>
               <button className="relative w-full py-6 bg-white text-slate-900 rounded-2xl font-black text-xl transition-all active:scale-95 shadow-xl">
                  НАЧАТЬ ЛЕЧЕНИЕ
               </button>
            </div>

            <div className="text-center space-y-2">
              <p className="text-slate-500 text-sm font-medium">
                Защитите организм от симптомов, используя Грандаксин для их уничтожения
              </p>
              <div className="flex justify-center gap-1 opacity-50">
                <div className="w-1 h-1 rounded-full bg-blue-500 animate-bounce"></div>
                <div className="w-1 h-1 rounded-full bg-blue-500 animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-1 h-1 rounded-full bg-blue-500 animate-bounce [animation-delay:0.4s]"></div>
              </div>
            </div>
          </div>
        )}

        {/* Игровой экран */}
        {isStarted && !showDisclaimer1 && !showDisclaimer2 && (
          <GameContainer onExit={() => setIsStarted(false)} />
        )}
      </div>
    </div>
  );
};

export default App;
