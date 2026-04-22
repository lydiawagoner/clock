/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Settings, X, Palette, MapPin, Globe2, ChevronRight } from 'lucide-react';

interface TimeZoneConfig {
  id: string;
  label: string;
  zone: string;
  city: string;
  utc: string;
  color: string; // Base color hex
}

const DEFAULT_ZONES: TimeZoneConfig[] = [
  {
    id: 'pacific',
    label: 'Pacific Time',
    zone: 'America/Los_Angeles',
    city: 'Los Angeles, CA',
    utc: 'UTC -08:00',
    color: '#0f172a',
  },
  {
    id: 'eastern',
    label: 'Eastern Time',
    zone: 'America/New_York',
    city: 'New York City, NY',
    utc: 'UTC -05:00',
    color: '#0a1120',
  },
  {
    id: 'saopaulo',
    label: 'Brasília Time',
    zone: 'America/Sao_Paulo',
    city: 'São Paulo, BR',
    utc: 'UTC -03:00',
    color: '#0d1e1c',
  },
];

const COMMON_ZONES = [
  { name: 'Pacific', value: 'America/Los_Angeles', utc: 'UTC -08:00' },
  { name: 'Eastern', value: 'America/New_York', utc: 'UTC -05:00' },
  { name: 'Greenwich', value: 'UTC', utc: 'UTC +00:00' },
  { name: 'Central Europe', value: 'Europe/Paris', utc: 'UTC +01:00' },
  { name: 'Brasília', value: 'America/Sao_Paulo', utc: 'UTC -03:00' },
  { name: 'Tokyo', value: 'Asia/Tokyo', utc: 'UTC +09:00' },
  { name: 'Sydney', value: 'Australia/Sydney', utc: 'UTC +11:00' },
];

const THEME_COLORS = [
  '#080808', '#0f172a', '#0a1120', '#0d1e1c', '#151619', 
  '#1a1a1a', '#020617', '#052e16', '#2e1065', '#450a0a'
];

const ClockCard = ({ config, time }: { config: TimeZoneConfig; time: Date }) => {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: config.zone,
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });

  const parts = formatter.formatToParts(time);
  const hour = parts.find(p => p.type === 'hour')?.value;
  const minute = parts.find(p => p.type === 'minute')?.value;
  const dayPeriod = parts.find(p => p.type === 'dayPeriod')?.value;

  const timeStr = `${hour}:${minute}`;

  return (
    <motion.div
      layout
      className="relative flex-1 flex flex-col justify-center items-center border-r last:border-r-0 border-white/5 transition-all duration-700 overflow-hidden h-screen md:h-auto min-h-[400px]"
      style={{ backgroundColor: config.color }}
    >
      {/* Dynamic Glow based on color brightness */}
      <div className="absolute inset-0 bg-radial-at-t from-white/10 to-transparent pointer-events-none" />
      
      <div className="z-10 text-center flex flex-col items-center">
        <span className="block text-[10px] tracking-[0.5em] uppercase font-bold text-white/30 mb-8">
          {config.label}
        </span>
        
        <div className="relative group cursor-default">
          <div className="flex flex-col items-center">
            <h1 className="text-[110px] md:text-[130px] font-black text-white/10 leading-none tracking-tighter select-none transition-transform duration-700 group-hover:scale-105">
              {timeStr}
            </h1>
            <span className="text-xs font-bold uppercase tracking-[0.4em] mt-2 text-white/40">
              {dayPeriod}
            </span>
          </div>

          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <h1 className="text-[110px] md:text-[130px] font-black text-white/60 leading-none tracking-tighter pointer-events-none">
              {timeStr}
            </h1>
            <span className="text-xs font-bold uppercase tracking-[0.4em] mt-2 opacity-0">
              {dayPeriod}
            </span>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center">
          <p className="text-xl md:text-2xl font-light text-white/80 tracking-tight">
            {config.city}
          </p>
          <p className="text-[10px] font-mono text-white/10 mt-2 tracking-[0.3em] uppercase">
            {config.utc}
          </p>
        </div>
      </div>

      <div className="absolute bottom-16 w-1 h-12 bg-white/20 rounded-full" />
    </motion.div>
  );
};

export default function App() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [zones, setZones] = useState<TimeZoneConfig[]>(DEFAULT_ZONES);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const updateZone = (id: string, updates: Partial<TimeZoneConfig>) => {
    setZones(prev => prev.map(z => z.id === id ? { ...z, ...updates } : z));
  };

  return (
    <div id="immersive-clock-root" className="fixed inset-0 bg-black flex flex-col md:flex-row overflow-hidden font-sans">
      
      {/* Global Overlays */}
      <div className="absolute top-0 left-0 w-full h-24 bg-gradient-to-b from-black to-transparent pointer-events-none opacity-60 z-20" />
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black to-transparent pointer-events-none opacity-40 z-20" />

      {/* Control Toggle */}
      <button 
        onClick={() => setIsSettingsOpen(true)}
        className="absolute top-12 left-12 z-30 flex items-center gap-3 group"
      >
        <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-white group-hover:text-black transition-all">
          <Settings size={14} />
        </div>
        <span className="text-[10px] font-mono uppercase tracking-[0.2em] text-white/40 group-hover:text-white transition-colors">Configuration Panel</span>
      </button>

      {/* Dynamic Zone Panels */}
      <main className="flex flex-col md:flex-row flex-1 h-full w-full">
        <AnimatePresence>
          {zones.map((tz) => (
            <ClockCard key={tz.id} config={tz} time={currentTime} />
          ))}
        </AnimatePresence>
      </main>

      {/* Settings Drawer */}
      <AnimatePresence>
        {isSettingsOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsSettingsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[90]"
            />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-[#0a0a0a] border-l border-white/10 z-[100] p-8 flex flex-col shadow-2xl"
            >
              <div className="flex justify-between items-center mb-12">
                <div className="flex items-center gap-3">
                  <Globe2 size={20} className="text-white/80" />
                  <h2 className="text-sm uppercase tracking-[0.4em] font-semibold text-white">System Control</h2>
                </div>
                <button onClick={() => setIsSettingsOpen(false)} className="w-10 h-10 rounded-full hover:bg-white/10 flex items-center justify-center transition-colors text-white">
                  <X size={20} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto space-y-8 pr-2 custom-scrollbar">
                {zones.map(zone => (
                  <div key={zone.id} className="p-6 rounded-2xl bg-white/[0.03] border border-white/20 space-y-6">
                    <div className="flex justify-between items-center">
                      <span className="text-[10px] uppercase tracking-[0.3em] font-bold text-white/60">{zone.id} CONFIG</span>
                      <div className="w-1.5 h-1.5 rounded-full bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.7)]" />
                    </div>

                    <div className="space-y-4">
                      <div>
                        <label className="text-[10px] uppercase tracking-widest text-slate-300 font-semibold block mb-2">Identify City</label>
                        <div className="relative group">
                          <MapPin size={12} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40 group-focus-within:text-white transition-colors" />
                          <input 
                            type="text" 
                            value={zone.city}
                            onChange={(e) => updateZone(zone.id, { city: e.target.value })}
                            className="w-full bg-white/5 border border-white/30 rounded-lg py-3 px-10 text-sm font-medium text-white focus:outline-none focus:border-white/60 focus:bg-white/10 transition-all"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[10px] uppercase tracking-widest text-slate-300 font-semibold block mb-2">Select Temporal Zone</label>
                        <select 
                          value={zone.zone}
                          onChange={(e) => {
                            const found = COMMON_ZONES.find(c => c.value === e.target.value);
                            if (found) updateZone(zone.id, { zone: found.value, utc: found.utc, label: `${found.name} Time` });
                          }}
                          className="w-full bg-white/5 border border-white/30 rounded-lg py-3 px-4 text-sm font-medium text-white focus:outline-none focus:border-white/60 focus:bg-white/10 transition-all appearance-none cursor-pointer"
                        >
                          {COMMON_ZONES.map(cz => (
                            <option key={cz.value} value={cz.value} className="bg-[#0a0a0a] text-white">{cz.name} ({cz.utc})</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="text-[10px] uppercase tracking-widest text-slate-300 font-semibold block mb-3">Atmospheric Tone</label>
                        <div className="flex flex-wrap gap-3">
                          {THEME_COLORS.map(color => (
                            <button
                              key={color}
                              onClick={() => updateZone(zone.id, { color })}
                              style={{ backgroundColor: color }}
                              className={`w-8 h-8 rounded-full border-2 transition-all hover:scale-110 ${zone.color === color ? 'border-white scale-110' : 'border-transparent'}`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-8 mt-auto border-t border-white/10">
                <p className="text-[9px] uppercase tracking-[0.4em] text-white/10 text-center">
                  Universal Temporal Reference Engine v4.2 // Verified Stable
                </p>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
