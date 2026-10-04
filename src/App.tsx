import { useState, useEffect, useCallback, useRef } from 'react';

// Types
type TimerMode = 'focus' | 'shortBreak' | 'longBreak';

interface TimerSettings {
  focus: number;
  shortBreak: number;
  longBreak: number;
  longBreakInterval: number;
}

interface DailyStats {
  date: string;
  focusSessions: number;
  totalFocusMinutes: number;
  sessions: { mode: TimerMode; duration: number; completedAt: string }[];
}

// Constants
const DEFAULT_SETTINGS: TimerSettings = {
  focus: 25,
  shortBreak: 5,
  longBreak: 15,
  longBreakInterval: 4,
};

const MODE_LABELS: Record<TimerMode, string> = {
  focus: 'Concentration',
  shortBreak: 'Pause courte',
  longBreak: 'Pause longue',
};

const MODE_COLORS: Record<TimerMode, string> = {
  focus: '#e74c3c',
  shortBreak: '#27ae60',
  longBreak: '#2980b9',
};

// Utility functions
function getTodayKey(): string {
  return new Date().toISOString().split('T')[0];
}

function loadStats(): Record<string, DailyStats> {
  try {
    const data = localStorage.getItem('pomodoro-stats');
    return data ? JSON.parse(data) : {};
  } catch {
    return {};
  }
}

function saveStats(stats: Record<string, DailyStats>): void {
  localStorage.setItem('pomodoro-stats', JSON.stringify(stats));
}

function loadSettings(): TimerSettings {
  try {
    const data = localStorage.getItem('pomodoro-settings');
    return data ? JSON.parse(data) : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

function saveSettings(settings: TimerSettings): void {
  localStorage.setItem('pomodoro-settings', JSON.stringify(settings));
}

function formatTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

// Main App Component
export default function App() {
  const [settings, setSettings] = useState<TimerSettings>(loadSettings);
  const [mode, setMode] = useState<TimerMode>('focus');
  const [timeLeft, setTimeLeft] = useState(settings.focus * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [sessionsCompleted, setSessionsCompleted] = useState(0);
  const [stats, setStats] = useState<Record<string, DailyStats>>(loadStats);
  const [showSettings, setShowSettings] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);
  const elapsedBeforePauseRef = useRef<number>(0);

  const totalTime = settings[mode] * 60;
  const progress = ((totalTime - timeLeft) / totalTime) * 100;
  const todayStats = stats[getTodayKey()] || { date: getTodayKey(), focusSessions: 0, totalFocusMinutes: 0, sessions: [] };

  // Update body class for background
  useEffect(() => {
    document.body.className = '';
    document.body.classList.add(
      mode === 'focus' ? 'focus-mode' : mode === 'shortBreak' ? 'short-break-mode' : 'long-break-mode'
    );
  }, [mode]);

  // Timer logic
  useEffect(() => {
    if (isRunning) {
      startTimeRef.current = Date.now();
      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(intervalRef.current!);
            setIsRunning(false);
            handleTimerComplete();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning]);

  const handleTimerComplete = useCallback(() => {
    const today = getTodayKey();
    const currentStats = { ...stats };
    const dayStats = currentStats[today] || { date: today, focusSessions: 0, totalFocusMinutes: 0, sessions: [] };

    dayStats.sessions.push({
      mode,
      duration: settings[mode],
      completedAt: new Date().toISOString(),
    });

    if (mode === 'focus') {
      dayStats.focusSessions += 1;
      dayStats.totalFocusMinutes += settings.focus;
      const newCount = sessionsCompleted + 1;
      setSessionsCompleted(newCount);

      // Auto switch to break
      if (newCount % settings.longBreakInterval === 0) {
        setMode('longBreak');
        setTimeLeft(settings.longBreak * 60);
      } else {
        setMode('shortBreak');
        setTimeLeft(settings.shortBreak * 60);
      }
    } else {
      setMode('focus');
      setTimeLeft(settings.focus * 60);
    }

    currentStats[today] = dayStats;
    setStats(currentStats);
    saveStats(currentStats);

    // Play notification sound
    playNotification();
  }, [mode, settings, sessionsCompleted, stats]);

  const playNotification = () => {
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      oscillator.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      oscillator.frequency.value = 800;
      oscillator.type = 'sine';
      gainNode.gain.value = 0.3;
      oscillator.start();
      setTimeout(() => {
        oscillator.frequency.value = 1000;
        setTimeout(() => {
          oscillator.frequency.value = 1200;
          setTimeout(() => {
            oscillator.stop();
            audioCtx.close();
          }, 200);
        }, 200);
      }, 200);
    } catch (e) {
      // Audio not supported
    }
  };

  const handleStart = () => setIsRunning(true);
  const handlePause = () => setIsRunning(false);
  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(settings[mode] * 60);
    elapsedBeforePauseRef.current = 0;
  };

  const switchMode = (newMode: TimerMode) => {
    setIsRunning(false);
    setMode(newMode);
    setTimeLeft(settings[newMode] * 60);
  };

  const updateSettings = (key: keyof TimerSettings, value: number) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    saveSettings(newSettings);
    if (key === mode && !isRunning) {
      setTimeLeft(value * 60);
    }
  };

  // SVG circle calculations
  const radius = 140;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-8 text-white relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-50%] left-[-50%] w-[200%] h-[200%] opacity-10">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-white/5 blur-3xl"></div>
          <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-white/5 blur-3xl"></div>
        </div>
      </div>

      {/* Header */}
      <header className="text-center mb-8 fade-in relative z-10">
        <h1 className="text-3xl md:text-4xl font-bold tracking-tight mb-2">
          🍅 Pomodoro Focus
        </h1>
        <p className="text-white/60 text-sm">Restez concentré, travaillez efficacement</p>
      </header>

      {/* Mode Tabs */}
      <div className="flex gap-2 mb-8 fade-in relative z-10">
        {(['focus', 'shortBreak', 'longBreak'] as TimerMode[]).map((m) => (
          <button
            key={m}
            onClick={() => switchMode(m)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${mode === m
              ? 'bg-white/20 text-white shadow-lg scale-105'
              : 'text-white/50 hover:text-white/80 hover:bg-white/5'
              }`}
          >
            {MODE_LABELS[m]}
          </button>
        ))}
      </div>

      {/* Timer Circle */}
      <div className="relative mb-8 fade-in">
        <svg width="320" height="320" className="transform -rotate-90">
          {/* Background circle */}
          <circle
            cx="160"
            cy="160"
            r={radius}
            fill="none"
            stroke="rgba(255,255,255,0.1)"
            strokeWidth="6"
          />
          {/* Progress circle */}
          <circle
            cx="160"
            cy="160"
            r={radius}
            fill="none"
            stroke={MODE_COLORS[mode]}
            strokeWidth="6"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            className="timer-ring"
            style={{ filter: `drop-shadow(0 0 10px ${MODE_COLORS[mode]}40)` }}
          />
        </svg>

        {/* Timer display */}
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-6xl md:text-7xl font-light tracking-wider tabular-nums">
            {formatTime(timeLeft)}
          </span>
          <span className="text-white/50 text-sm mt-2 uppercase tracking-widest">
            {MODE_LABELS[mode]}
          </span>
        </div>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-4 mb-8 fade-in relative z-10">
        <button
          onClick={handleReset}
          className="w-12 h-12 rounded-full glass-card flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-all btn-glow"
          title="Réinitialiser"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3 12a9 9 0 1 1 9 9 9.75 9.75 0 0 1-6.74-2.74L3 21" />
            <path d="M3 3v7h7" />
          </svg>
        </button>

        <button
          onClick={isRunning ? handlePause : handleStart}
          className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-lg transition-all duration-300 hover:scale-105 btn-glow"
          style={{ backgroundColor: MODE_COLORS[mode] + 'cc' }}
        >
          {isRunning ? (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <rect x="6" y="4" width="4" height="16" rx="1" />
              <rect x="14" y="4" width="4" height="16" rx="1" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
              <polygon points="6,3 20,12 6,21" />
            </svg>
          )}
        </button>

        <button
          onClick={() => {
            const nextMode: TimerMode = mode === 'focus' ? 'shortBreak' : 'focus';
            switchMode(nextMode);
          }}
          className="w-12 h-12 rounded-full glass-card flex items-center justify-center text-white/70 hover:text-white hover:bg-white/10 transition-all btn-glow"
          title="Sauter"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="5,4 15,12 5,20" fill="currentColor" />
            <line x1="19" y1="5" x2="19" y2="19" />
          </svg>
        </button>
      </div>

      {/* Session counter */}
      <div className="flex items-center gap-2 mb-6 fade-in relative z-10">
        {Array.from({ length: settings.longBreakInterval }).map((_, i) => (
          <div
            key={i}
            className={`w-3 h-3 rounded-full transition-all duration-300 ${i < (sessionsCompleted % settings.longBreakInterval)
              ? 'bg-white shadow-lg shadow-white/30'
              : 'bg-white/20'
              }`}
          />
        ))}
        <span className="text-white/40 text-xs ml-2">
          {sessionsCompleted % settings.longBreakInterval}/{settings.longBreakInterval}
        </span>
      </div>

      {/* Bottom buttons */}
      <div className="flex gap-3 fade-in relative z-10">
        <button
          onClick={() => setShowStats(!showStats)}
          className="px-4 py-2 rounded-full glass-card text-white/70 hover:text-white text-sm transition-all btn-glow"
        >
          📊 Statistiques
        </button>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="px-4 py-2 rounded-full glass-card text-white/70 hover:text-white text-sm transition-all btn-glow"
        >
          ⚙️ Paramètres
        </button>
      </div>

      {/* Stats Panel */}
      {showStats && (
        <div className="mt-6 glass-card rounded-2xl p-6 w-full max-w-md fade-in relative z-10">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            📊 Statistiques du jour
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-3xl font-bold text-red-400">{todayStats.focusSessions}</div>
              <div className="text-white/50 text-xs mt-1">Sessions focus</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400">{todayStats.totalFocusMinutes}</div>
              <div className="text-white/50 text-xs mt-1">Minutes totales</div>
            </div>
          </div>
          {todayStats.sessions.length > 0 && (
            <div className="mt-4 border-t border-white/10 pt-4">
              <h4 className="text-sm text-white/60 mb-2">Historique du jour</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {todayStats.sessions.slice().reverse().map((session, i) => (
                  <div key={i} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      <span
                        className="w-2 h-2 rounded-full"
                        style={{ backgroundColor: MODE_COLORS[session.mode] }}
                      ></span>
                      {MODE_LABELS[session.mode]}
                    </span>
                    <span className="text-white/40">
                      {session.duration} min •{' '}
                      {new Date(session.completedAt).toLocaleTimeString('fr-FR', {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {todayStats.sessions.length === 0 && (
            <p className="text-white/40 text-sm text-center mt-4">
              Aucune session aujourd'hui. Commencez à vous concentrer ! 🎯
            </p>
          )}
        </div>
      )}

      {/* Settings Panel */}
      {showSettings && (
        <div className="mt-6 glass-card rounded-2xl p-6 w-full max-w-md fade-in relative z-10">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            ⚙️ Paramètres
          </h3>
          <div className="space-y-4">
            <SettingRow
              label="Concentration (min)"
              value={settings.focus}
              onChange={(v) => updateSettings('focus', v)}
              min={1}
              max={120}
            />
            <SettingRow
              label="Pause courte (min)"
              value={settings.shortBreak}
              onChange={(v) => updateSettings('shortBreak', v)}
              min={1}
              max={30}
            />
            <SettingRow
              label="Pause longue (min)"
              value={settings.longBreak}
              onChange={(v) => updateSettings('longBreak', v)}
              min={1}
              max={60}
            />
            <SettingRow
              label="Interval pause longue"
              value={settings.longBreakInterval}
              onChange={(v) => updateSettings('longBreakInterval', v)}
              min={2}
              max={10}
            />
          </div>
          <button
            onClick={() => {
              setSettings(DEFAULT_SETTINGS);
              saveSettings(DEFAULT_SETTINGS);
              setTimeLeft(DEFAULT_SETTINGS[mode] * 60);
            }}
            className="mt-4 w-full py-2 rounded-lg bg-white/10 text-white/70 hover:text-white hover:bg-white/15 text-sm transition-all"
          >
            Réinitialiser les paramètres
          </button>
        </div>
      )}

      {/* Footer */}
      <footer className="mt-8 text-white/30 text-xs relative z-10">
        Technique Pomodoro - 25 min de travail, 5 min de pause
      </footer>
    </div>
  );
}

// Setting Row Component
function SettingRow({
  label,
  value,
  onChange,
  min,
  max,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
}) {
  return (
    <div className="flex items-center justify-between">
      <label className="text-sm text-white/70">{label}</label>
      <div className="flex items-center gap-2">
        <button
          onClick={() => onChange(Math.max(min, value - 1))}
          className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:bg-white/20 transition-all text-sm"
        >
          −
        </button>
        <span className="w-8 text-center text-sm font-medium tabular-nums">{value}</span>
        <button
          onClick={() => onChange(Math.min(max, value + 1))}
          className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-white/70 hover:bg-white/20 transition-all text-sm"
        >
          +
        </button>
      </div>
    </div>
  );
}