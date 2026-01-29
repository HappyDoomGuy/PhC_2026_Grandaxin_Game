
import React, { useEffect, useRef, useState } from 'react';
import blueImage from '../blue.png';
import greenImage from '../green.png';
import redImage from '../red.png';
import packImage from '../pack.png';

// Image paths mapping
const imagePaths: { [key: string]: string } = {
  'blue.png': blueImage,
  'green.png': greenImage,
  'red.png': redImage
};

interface GameObject {
  x: number;
  y: number;
  radius: number;
  vx: number;
  vy: number;
  type: 'pill' | 'symptom' | 'particle';
  color?: string;
  id: number;
  health: number;
  maxHealth: number;
  life?: number;
  isBoss?: boolean;
  side?: 'left' | 'right';
  imageSrc?: string;
}

const GameContainer: React.FC<{ onExit: () => void }> = ({ onExit }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const backgroundCanvasRef = useRef<HTMLCanvasElement>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const boxAreaRef = useRef<HTMLDivElement>(null);
  const tapAreaRef = useRef<HTMLDivElement>(null);
  const lastInteractionRef = useRef<{ type: 'touch' | 'mouse' | null; time: number }>({ type: null, time: 0 });
  
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [integrity, setIntegrity] = useState(100);
  const [gameOver, setGameOver] = useState(false);
  
  // Reload Mechanic States
  const [pillsInPack, setPillsInPack] = useState(20);
  const [isReloading, setIsReloading] = useState(false);
  const [reloadPhase, setReloadPhase] = useState<'idle' | 'exiting' | 'entering'>('idle');
  const [imgError, setImgError] = useState(false);
  
  // Statistics
  const [totalPillsUsed, setTotalPillsUsed] = useState(0);
  const [symptomsEliminated, setSymptomsEliminated] = useState({ blue: 0, green: 0, red: 0 });

  const objectsRef = useRef<GameObject[]>([]);
  const scoreRef = useRef(0);
  const levelRef = useRef(1);
  const integrityRef = useRef(100);
  const gameOverRef = useRef(false);
  const lastSpawnRef = useRef(0);
  const nextIdRef = useRef(0);
  const [isPulsing, setIsPulsing] = useState(false);
  const [boxOffsetX, setBoxOffsetX] = useState(0);
  const savedBoxOffsetXRef = useRef(0);
  
  // Stars for space background
  const starsRef = useRef<Array<{ x: number; y: number; z: number; speed: number }>>([]);
  
  // Symptom images
  const symptomImagesRef = useRef<{ [key: string]: HTMLImageElement }>({});

  useEffect(() => {
    scoreRef.current = score;
    levelRef.current = level;
    integrityRef.current = integrity;
    gameOverRef.current = gameOver;
  }, [score, level, integrity, gameOver]);


  // Space background animation
  useEffect(() => {
    const backgroundCanvas = backgroundCanvasRef.current;
    const container = containerRef.current;
    if (!backgroundCanvas || !container) return;
    
    const ctx = backgroundCanvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      backgroundCanvas.width = container.clientWidth;
      backgroundCanvas.height = container.clientHeight;
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    resize();

    // Initialize stars
    const initStars = () => {
      starsRef.current = [];
      const starCount = 200;
      for (let i = 0; i < starCount; i++) {
        starsRef.current.push({
          x: Math.random() * backgroundCanvas.width,
          y: Math.random() * backgroundCanvas.height,
          z: Math.random() * 1000,
          speed: 0.5 + Math.random() * 2
        });
      }
    };
    initStars();

    let animationId: number;
    const update = () => {
      // Очищаем canvas прозрачным цветом, чтобы не перекрывать фон
      ctx.clearRect(0, 0, backgroundCanvas.width, backgroundCanvas.height);
      
      // Рисуем темный фон только если нужно
      ctx.fillStyle = 'rgba(10, 15, 30, 0.3)';
      ctx.fillRect(0, 0, backgroundCanvas.width, backgroundCanvas.height);

      const stars = starsRef.current;
      for (let i = 0; i < stars.length; i++) {
        const star = stars[i];
        
        // Move star towards camera
        star.z -= star.speed;
        
        // If star is too close, reset it
        if (star.z <= 0) {
          star.x = Math.random() * backgroundCanvas.width;
          star.y = Math.random() * backgroundCanvas.height;
          star.z = 1000;
        }
        
        // Calculate star position with perspective
        const x = (star.x - backgroundCanvas.width / 2) * (400 / star.z) + backgroundCanvas.width / 2;
        const y = (star.y - backgroundCanvas.height / 2) * (400 / star.z) + backgroundCanvas.height / 2;
        const radius = Math.max(0.5, (1 - star.z / 1000) * 3);
        const opacity = Math.max(0.3, 1 - star.z / 1000);
        
        // Draw star trail for fast stars first
        if (star.speed > 1.5) {
          const prevX = (star.x - backgroundCanvas.width / 2) * (400 / (star.z + star.speed * 10)) + backgroundCanvas.width / 2;
          const prevY = (star.y - backgroundCanvas.height / 2) * (400 / (star.z + star.speed * 10)) + backgroundCanvas.height / 2;
          ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.5})`;
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(prevX, prevY);
          ctx.lineTo(x, y);
          ctx.stroke();
        }
        
        // Draw star
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      }

      animationId = requestAnimationFrame(update);
    };

    animationId = requestAnimationFrame(update);
    
    return () => {
      cancelAnimationFrame(animationId);
      resizeObserver.disconnect();
    };
  }, []);


  const resetGame = () => {
    objectsRef.current = [];
    scoreRef.current = 0;
    levelRef.current = 1;
    integrityRef.current = 100;
    gameOverRef.current = false;
    lastSpawnRef.current = performance.now();
    setScore(0);
    setLevel(1);
    setIntegrity(100);
    setGameOver(false);
    setPillsInPack(20);
    setIsReloading(false);
    setReloadPhase('idle');
    setBoxOffsetX(0);
    setTotalPillsUsed(0);
    setSymptomsEliminated({ blue: 0, green: 0, red: 0 });
  };

  const playSound = (type: 'shoot' | 'pop' | 'bossHit' | 'leak' | 'reload') => {
    try {
      if (!audioCtxRef.current) {
        audioCtxRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      const ctx = audioCtxRef.current!;
      if (ctx.state === 'suspended') ctx.resume();

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      if (type === 'shoot') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
      } else if (type === 'pop') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(200, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(500, ctx.currentTime + 0.05);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
      } else if (type === 'leak') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(120, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(40, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
      } else if (type === 'bossHit') {
        osc.type = 'square';
        osc.frequency.setValueAtTime(150, ctx.currentTime);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
      } else if (type === 'reload') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(200, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(600, ctx.currentTime + 0.5);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
      }
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.3);
    } catch (e) {}
  };

  const createParticles = (x: number, y: number, color: string, count: number = 8) => {
    for (let i = 0; i < count; i++) {
      objectsRef.current.push({
        id: nextIdRef.current++,
        x, y,
        radius: 2 + Math.random() * 3,
        vx: (Math.random() - 0.5) * 6,
        vy: (Math.random() - 0.5) * 6,
        type: 'particle',
        color,
        health: 0,
        maxHealth: 0,
        life: 1.0
      });
    }
  };

  const spawnSymptom = (width: number, height: number) => {
    const currentLevel = levelRef.current;
    const side = Math.random() > 0.5 ? 'left' : 'right';
    
    // Рандомно выбираем изображение симптома
    const symptomTypes = ['blue.png', 'green.png', 'red.png'];
    const imageSrc = symptomTypes[Math.floor(Math.random() * symptomTypes.length)];
    
    const roll = Math.random();
    let radius, health, speedMult, color;
    
    if (roll < 0.5) { // Small & Fast
      radius = 12 + Math.random() * 4;
      health = 1;
      speedMult = 1.4 + Math.random() * 0.4;
      color = '#4de6ff'; // Cyan
    } else if (roll < 0.85) { // Medium
      radius = 22 + Math.random() * 5;
      health = 2;
      speedMult = 0.9 + Math.random() * 0.3;
      color = '#4dff88'; // Green
    } else { // Large & Slow
      radius = 38 + Math.random() * 8;
      health = 3;
      speedMult = 0.5 + Math.random() * 0.2;
      color = '#ff4dff'; // Pink/Purple
    }

    const startX = side === 'left' ? -radius : width + radius;
    const startY = 80 + Math.random() * (height * 0.45);
    const baseSpeed = (0.8 + Math.random() * 1.0) * (1 + currentLevel * 0.06);
    const vx = (side === 'left' ? baseSpeed : -baseSpeed) * speedMult;

    objectsRef.current.push({
      id: nextIdRef.current++,
      x: startX,
      y: startY,
      radius,
      vx,
      vy: 0,
      type: 'symptom',
      color,
      health,
      maxHealth: health,
      side,
      imageSrc
    });
  };

  const triggerReload = () => {
    if (isReloading) return;
    
    // Сохраняем текущую позицию коробки перед перезарядкой
    savedBoxOffsetXRef.current = boxOffsetX;
    setIsReloading(true);
    setReloadPhase('exiting');
    playSound('reload');
    
    // Анимация выхода - 600ms (одинаковая с entering)
    const animationDuration = 600;
    
    setTimeout(() => {
      setPillsInPack(20);
      // Восстанавливаем позицию перед entering
      setBoxOffsetX(savedBoxOffsetXRef.current);
      // Минимальная задержка для применения изменений
      setTimeout(() => {
        setReloadPhase('entering');
        
        // Анимация входа - 600ms (одинаковая с exiting)
        setTimeout(() => {
          // Сначала переходим в idle, но оставляем isReloading true для плавного перехода
          setReloadPhase('idle');
          // Убираем isReloading после небольшой задержки для завершения анимации
          setTimeout(() => {
            setIsReloading(false);
          }, 50);
        }, animationDuration);
      }, 16); // Один кадр для применения изменений
    }, animationDuration);
  };

  const shootPill = (originX: number) => {
    if (gameOverRef.current || isReloading) return;
    
    if (pillsInPack <= 0) {
      triggerReload();
      return;
    }

    // Увеличиваем счетчик использованных таблеток ДО уменьшения количества
    setTotalPillsUsed(prev => prev + 1);

    setPillsInPack(prev => {
      const next = prev - 1;
      if (next === 0) {
        setTimeout(triggerReload, 100);
      }
      return next;
    });

    setIsPulsing(true);
    playSound('shoot');
    setTimeout(() => setIsPulsing(false), 100);

    const canvas = canvasRef.current;
    if (!canvas) return;

    objectsRef.current.push({
      id: nextIdRef.current++,
      x: originX,
      y: canvas.height - 120,
      radius: 10,
      vx: 0,
      vy: -20,
      type: 'pill',
      health: 1,
      maxHealth: 1
    });
  };

  const handleBoxInteraction = (e: React.MouseEvent | React.TouchEvent) => {
    if (gameOverRef.current || isReloading) return;
    
    const container = containerRef.current;
    const boxArea = boxAreaRef.current;
    if (!container || !boxArea) return;

    const containerRect = container.getBoundingClientRect();
    const boxAreaRect = boxArea.getBoundingClientRect();
    let clientX: number;

    if ('touches' in e) {
      clientX = e.touches[0].clientX;
    } else {
      clientX = (e as React.MouseEvent).clientX;
    }

    const relativeX = clientX - containerRect.left;
    // Вычисляем смещение относительно центра области коробки
    const boxAreaCenterX = boxAreaRect.left + boxAreaRect.width / 2;
    let offsetX = clientX - boxAreaCenterX;
    
    // Ограничиваем максимальное смещение, чтобы коробка могла двигаться почти до краев экрана
    // Используем ширину контейнера, а не области коробки
    const maxOffset = (containerRect.width / 2) - 60; // 60px - минимальный отступ от края
    offsetX = Math.max(-maxOffset, Math.min(maxOffset, offsetX));
    
    // Вычисляем текущую позицию коробки
    const currentOffsetX = boxOffsetX;
    const distanceToTravel = Math.abs(offsetX - currentOffsetX);
    
    // Приблизительная ширина коробки (изображение коробки примерно 60-80px)
    const boxHalfWidth = 35; // Половина ширины коробки
    
    // Вычисляем, когда край коробки достигнет точки тапа
    // transition duration = 100ms для перемещения коробки
    let shootDelay = 100; // Базовая задержка (когда центр достигнет точки)
    
    if (distanceToTravel > 0) {
      // Вычисляем расстояние, которое должен пройти центр, чтобы край достиг точки тапа
      // Если тап справа: центр должен быть в (точка тапа - boxHalfWidth)
      // Если тап слева: центр должен быть в (точка тапа + boxHalfWidth)
      const direction = offsetX > currentOffsetX ? 1 : -1;
      const edgeTargetOffset = offsetX - (direction * boxHalfWidth);
      const edgeDistance = Math.abs(edgeTargetOffset - currentOffsetX);
      
      // Если край уже достиг точки тапа (расстояние очень мало), выстрел сразу
      if (edgeDistance < 5) {
        shootDelay = 0;
      } else {
        // Вычисляем задержку пропорционально расстоянию до края
        // transition = 100ms для полного расстояния, вычисляем для расстояния до края
        const totalDistance = distanceToTravel;
        const progressToEdge = Math.min(1, edgeDistance / totalDistance);
        shootDelay = 100 * progressToEdge;
      }
    } else {
      // Если коробка уже на месте, выстрел сразу
      shootDelay = 0;
    }
    
    // Плавно перемещаем коробку к точке тапа
    setBoxOffsetX(offsetX);
    
    // Выполняем выстрел когда край коробки достигнет точки тапа
    setTimeout(() => {
      shootPill(relativeX);
    }, Math.max(0, Math.min(100, shootDelay)));
  };

  // Load symptom images
  useEffect(() => {
    const imageNames = ['blue.png', 'green.png', 'red.png'];
    imageNames.forEach(name => {
      const img = new Image();
      img.src = imagePaths[name];
      img.onload = () => {
        symptomImagesRef.current[name] = img;
      };
    });
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = container.clientWidth;
      canvas.height = container.clientHeight;
    };
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);
    resize();

    let animationId: number;
    const update = (time: number) => {
      if (gameOverRef.current) {
        animationId = requestAnimationFrame(update);
        return;
      }

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      const currentScore = scoreRef.current;
      const newLevel = Math.floor(currentScore / 250) + 1;
      if (newLevel !== levelRef.current) setLevel(newLevel);

      const spawnRate = Math.max(400, 1600 - levelRef.current * 100);
      if (time - lastSpawnRef.current > spawnRate) {
        spawnSymptom(canvas.width, canvas.height);
        lastSpawnRef.current = time;
      }

      // Прозрачный фон, чтобы видеть звезды
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgba(10, 15, 30, 0.7)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      const objects = objectsRef.current;
      for (let i = objects.length - 1; i >= 0; i--) {
        const obj = objects[i];
        
        let currentVX = obj.vx;
        let currentVY = obj.vy;
        if (obj.type === 'symptom') {
          currentVY = Math.sin(time / 350 + obj.id) * 1.5;
        }
        
        obj.x += currentVX;
        obj.y += currentVY;

        if (obj.type === 'particle') {
          obj.life! -= 0.025;
          if (obj.life! <= 0) {
            objects.splice(i, 1);
            continue;
          }
        }

        if (obj.type === 'pill') {
          for (let j = objects.length - 1; j >= 0; j--) {
            const target = objects[j];
            if (target.type === 'symptom') {
              const dx = obj.x - target.x;
              const dy = obj.y - target.y;
              const dist = Math.sqrt(dx*dx + dy*dy);
              if (dist < obj.radius + target.radius) {
                target.health -= 1;
                createParticles(obj.x, obj.y, target.color || '#fff', target.health <= 0 ? 12 : 5);
                objects.splice(i, 1); 
                if (target.health <= 0) {
                  playSound('pop');
                  setScore(s => s + (target.maxHealth * 10));
                  
                  // Увеличиваем счетчик устраненных симптомов по типу
                  if (target.imageSrc) {
                    if (target.imageSrc === 'blue.png') {
                      setSymptomsEliminated(prev => ({ ...prev, blue: prev.blue + 1 }));
                    } else if (target.imageSrc === 'green.png') {
                      setSymptomsEliminated(prev => ({ ...prev, green: prev.green + 1 }));
                    } else if (target.imageSrc === 'red.png') {
                      setSymptomsEliminated(prev => ({ ...prev, red: prev.red + 1 }));
                    }
                  }
                  
                  objects.splice(j, 1); 
                } else {
                  playSound('bossHit');
                }
                break;
              }
            }
          }
        }

        if (obj.type === 'pill') {
          drawPill(ctx, obj.x, obj.y, obj.radius);
        } else if (obj.type === 'symptom') {
          drawSymptom(ctx, obj, time);
        } else if (obj.type === 'particle') {
          ctx.save();
          ctx.globalAlpha = obj.life!;
          ctx.fillStyle = obj.color!;
          ctx.beginPath(); ctx.arc(obj.x, obj.y, obj.radius, 0, Math.PI * 2); ctx.fill();
          ctx.restore();
        }

        if (obj.y < -100) objects.splice(i, 1); 
        
        if (obj.type === 'symptom') {
          const leaked = (obj.side === 'left' && obj.x > canvas.width + obj.radius) || 
                         (obj.side === 'right' && obj.x < -obj.radius);
          if (leaked) {
            playSound('leak');
            const damage = obj.maxHealth * 8;
            const newIntegrity = Math.max(0, integrityRef.current - damage);
            setIntegrity(newIntegrity);
            integrityRef.current = newIntegrity;
            objects.splice(i, 1);
            if (newIntegrity <= 0) {
              setGameOver(true);
              gameOverRef.current = true;
            }
          }
        }
      }

      animationId = requestAnimationFrame(update);
    };

    const drawPill = (ctx: CanvasRenderingContext2D, x: number, y: number, r: number) => {
      ctx.save();
      ctx.shadowColor = 'rgba(255,255,255,0.6)';
      ctx.shadowBlur = 12;
      const grad = ctx.createRadialGradient(x-r/3, y-r/3, r/10, x, y, r);
      grad.addColorStop(0, '#ffffff');
      grad.addColorStop(1, '#d0d0d0');
      ctx.fillStyle = grad;
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
      ctx.restore();
    };

    const drawSymptom = (ctx: CanvasRenderingContext2D, obj: GameObject, time: number) => {
      const { x, y, radius: r, color, health, maxHealth, imageSrc } = obj;
      ctx.save();
      
      // Если есть изображение, рисуем его
      if (imageSrc && symptomImagesRef.current[imageSrc]) {
        const img = symptomImagesRef.current[imageSrc];
        const size = r * 2;
        
        // Добавляем свечение
        ctx.shadowColor = color!;
        ctx.shadowBlur = maxHealth > 1 ? 20 : 12;
        
        // Рисуем изображение
        ctx.drawImage(img, x - size / 2, y - size / 2, size, size);
      } else {
        // Fallback на старую отрисовку, если изображение не загружено
        ctx.shadowColor = color!;
        ctx.shadowBlur = maxHealth > 1 ? 20 : 12;
        
        const grad = ctx.createRadialGradient(x, y, r * 0.2, x, y, r);
        grad.addColorStop(0, color!);
        grad.addColorStop(0.8, color + '66');
        grad.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = grad;

        ctx.beginPath();
        const points = maxHealth === 3 ? 12 : maxHealth === 2 ? 8 : 6;
        for (let i = 0; i < points; i++) {
          const angle = (i / points) * Math.PI * 2;
          const off = Math.sin(time / 200 + i) * (maxHealth * 2.5);
          const px = x + Math.cos(angle) * (r + off);
          const py = y + Math.sin(angle) * (r + off);
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.fill();
      }
      
      ctx.restore();
    };

    animationId = requestAnimationFrame(update);
    return () => {
      cancelAnimationFrame(animationId);
      resizeObserver.disconnect();
    };
  }, [isReloading]);

  return (
    <div ref={containerRef} className="relative w-full h-full select-none touch-none bg-[#0a0f1e] overflow-hidden">
      <canvas ref={backgroundCanvasRef} className="absolute inset-0 block w-full h-full z-0" />
      <canvas ref={canvasRef} className="absolute inset-0 block w-full h-full z-[1]" />
      
      {/* Bio-Integrity bar at the very top */}
      <div className="absolute top-0 left-0 w-full h-2 bg-slate-900/50 border-b border-white/5 overflow-hidden backdrop-blur-sm relative z-10">
        <div 
          className={`h-full transition-all duration-300 ${integrity > 50 ? 'bg-emerald-500' : integrity > 20 ? 'bg-amber-500' : 'bg-red-500 shadow-[0_0_20px_rgba(239,68,68,0.5)]'}`}
          style={{ width: `${integrity}%` }}
        />
        <div className="absolute top-3 left-2 text-[8px] font-black text-white/50 uppercase tracking-[0.2em]">Био-Целостность: {integrity}%</div>
      </div>

      <div className="absolute top-2 left-0 w-full flex flex-col gap-2 px-3 pointer-events-none z-10">
        <div className="flex justify-between items-center gap-2">
          <div className="bg-slate-900/80 backdrop-blur-xl px-3 py-1.5 rounded-xl border border-white/10 shadow-2xl">
            <p className="text-[8px] text-blue-400 uppercase font-black tracking-widest">Счет</p>
            <p className="text-lg font-mono font-bold text-white tracking-tighter">{score.toString().padStart(5, '0')}</p>
          </div>
          
          <div className="bg-blue-600/30 backdrop-blur-md px-2.5 py-1 rounded-full border border-blue-500/40">
             <p className="text-[8px] text-blue-300 font-bold uppercase tracking-widest">Уровень {level}</p>
          </div>
          
          <button 
            onClick={onExit}
            className="p-2 bg-white/5 rounded-xl border border-white/10 text-white/50 hover:text-white pointer-events-auto active:scale-90 transition-all backdrop-blur-md relative z-20"
          >
            <span className="text-base font-bold">✕</span>
          </button>
        </div>
      </div>

      {/* Control Area with Pack Mechanic */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 w-[85%] z-10">
        {/* Animated Pack Wrapper */}
        <div ref={boxAreaRef} className="relative w-full flex items-center justify-center overflow-visible" style={{ minHeight: '80px' }}>
          <div 
            className={`inline-block flex items-center justify-center border border-white/20 ${
              reloadPhase === 'exiting' ? 'opacity-0' : 
              reloadPhase === 'entering' ? 'opacity-0' : 
              'opacity-100'
            }`}
            style={{ 
              transitionProperty: 'all',
              transitionDuration: (reloadPhase === 'exiting' || reloadPhase === 'entering' || (reloadPhase === 'idle' && isReloading)) ? '600ms' : '100ms',
              transitionTimingFunction: (reloadPhase === 'exiting' || reloadPhase === 'entering' || (reloadPhase === 'idle' && isReloading)) ? 'ease-in-out' : 'ease-out',
              transform: (() => {
                if (reloadPhase === 'exiting') {
                  return 'translateX(-150%) rotate(-15deg)';
                }
                if (reloadPhase === 'entering') {
                  // Начинаем с той же позиции, что и exiting заканчивается, но с другой стороны
                  return 'translateX(150%) rotate(15deg)';
                }
                // В состоянии idle применяем смещение и другие трансформации
                const scale = isPulsing && !isReloading ? 0.9 : 1;
                const translateY = isPulsing && !isReloading ? '8px' : '0px';
                return `translateX(${boxOffsetX}px) translateY(${translateY}) scale(${scale})`;
              })()
            }}
          >
            <div className="relative flex items-center justify-center">
              
              {!imgError ? (
                <img 
                  src={packImage} 
                  alt="Pill Pack" 
                  draggable="false"
                  onDragStart={(e) => e.preventDefault()}
                  onError={() => setImgError(true)}
                  className={`max-h-20 w-auto object-contain drop-shadow-[0_15px_35px_rgba(0,0,0,0.6)] select-none ${isReloading ? 'blur-[1px] grayscale-[0.3]' : ''}`}
                />
              ) : (
                /* High-fidelity CSS Fallback Pack */
                <div className={`w-auto h-20 bg-white rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.5)] border-b-[6px] border-slate-200 overflow-hidden flex flex-col justify-center px-6 relative ${isReloading ? 'grayscale' : ''}`}>
                   <div className="absolute top-0 right-0 w-24 h-full bg-blue-600/10 skew-x-[-12deg] translate-x-12"></div>
                   <div className="z-10">
                     <div className="text-slate-900 font-black text-2xl leading-none tracking-tighter uppercase mb-1">АНТИДОТ</div>
                     <div className="flex items-center gap-2">
                        <div className="h-[2px] w-8 bg-blue-600"></div>
                        <span className="text-blue-600 text-[9px] font-black uppercase tracking-[0.2em]">20 Капсул</span>
                     </div>
                   </div>
                   <div className="absolute right-6 top-1/2 -translate-y-1/2 w-10 h-10 border-2 border-slate-100 rounded-full flex items-center justify-center">
                      <div className="w-5 h-5 bg-blue-500 rounded-full animate-pulse"></div>
                   </div>
                </div>
              )}
              
              {isReloading && (
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-20">
                  <div className="w-8 h-8 border-4 border-white border-t-transparent rounded-full animate-spin shadow-lg mb-2"></div>
                  <span className="bg-blue-600/80 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-widest backdrop-blur-md">Загрузка упаковки</span>
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center justify-center mt-4 px-2">
          <div className="flex items-center gap-1.5">
            {[...Array(20)].map((_, i) => (
              <div 
                key={i} 
                className={`w-3 h-3 rounded-full border border-white/10 transition-all duration-500 ${i < pillsInPack ? 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.4)]' : 'bg-white/5'}`} 
              />
            ))}
          </div>
        </div>
      </div>

      {/* Full screen tap area - коробка двигается только по горизонтали */}
      <div 
        ref={tapAreaRef}
        onMouseDown={handleBoxInteraction}
        onTouchStart={handleBoxInteraction}
        onTouchEnd={(e) => e.preventDefault()}
        className="absolute inset-0 w-full h-full z-[15] cursor-pointer"
        style={{ 
          pointerEvents: gameOver || isReloading ? 'none' : 'auto',
          backgroundColor: 'transparent',
          touchAction: 'manipulation'
        }}
      />

      <style>{`
        @keyframes slideIn {
          from { transform: translateX(100%) rotate(15deg); opacity: 0; }
          to { transform: translateX(0) rotate(0); opacity: 1; }
        }
        @keyframes slideInSlow {
          from { transform: translateX(100%) rotate(15deg); opacity: 0; }
          to { transform: translateX(0) rotate(0); opacity: 1; }
        }
      `}</style>

      {gameOver && (
        <div 
          className="absolute inset-0 flex flex-col items-center justify-center p-8 text-center z-50 animate-in fade-in duration-500 overflow-y-auto"
          style={{ background: 'linear-gradient(135deg, #75C4E6 0%, #CAE8FA 100%)' }}
        >
          <h2 className="text-xl font-black text-slate-800 tracking-tight mb-4 w-full max-w-md">Счет игры «Грандаксин может»</h2>

          <div className="bg-white/90 backdrop-blur-sm border border-slate-200/80 rounded-[2rem] p-6 mb-6 w-full space-y-4 shadow-xl shadow-slate-300/30">
            <div>
              <div className="text-5xl font-mono font-bold text-slate-800 tracking-tighter">{score}</div>
            </div>
            
            <div className="border-t border-slate-200 pt-4 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-slate-600 text-xs font-semibold uppercase tracking-wider">Использовано таблеток:</span>
                <span className="text-slate-800 font-mono font-bold text-lg">{totalPillsUsed}</span>
              </div>
              
              <div className="flex justify-between items-center">
                <span className="text-slate-600 text-xs font-semibold uppercase tracking-wider">Использовано пачек:</span>
                <span className="text-slate-800 font-mono font-bold text-lg">{Math.ceil(totalPillsUsed / 20)}</span>
              </div>
              
              <div className="border-t border-slate-200 pt-3">
                <p className="text-slate-600 text-xs font-semibold uppercase tracking-wider mb-2">Устранено симптомов:</p>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      <span className="text-slate-700 text-sm font-medium">Тревога:</span>
                    </div>
                    <span className="text-slate-800 font-mono font-bold">{symptomsEliminated.blue}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500"></div>
                      <span className="text-slate-700 text-sm font-medium">Нервозность:</span>
                    </div>
                    <span className="text-slate-800 font-mono font-bold">{symptomsEliminated.green}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-red-500"></div>
                      <span className="text-slate-700 text-sm font-medium">Стресс:</span>
                    </div>
                    <span className="text-slate-800 font-mono font-bold">{symptomsEliminated.red}</span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-slate-200">
                    <span className="text-slate-700 text-sm font-bold">Всего:</span>
                    <span className="text-slate-800 font-mono font-bold text-lg">{symptomsEliminated.blue + symptomsEliminated.green + symptomsEliminated.red}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button 
            onClick={resetGame}
            className="w-full py-5 bg-slate-700 hover:bg-slate-800 text-white rounded-2xl font-bold text-lg shadow-lg active:scale-[0.98] transition-all border border-slate-600/50"
          >
            Продолжить игру
          </button>
        </div>
      )}
    </div>
  );
};

export default GameContainer;
