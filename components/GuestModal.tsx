
import React from 'react';

interface GuestCounterProps {
  label: string;
  sublabel: string;
  count: number;
  onIncrement: () => void;
  onDecrement: () => void;
}

const GuestCounter: React.FC<GuestCounterProps> = ({ label, sublabel, count, onIncrement, onDecrement }) => (
  <div className="flex items-center justify-between py-6 first:pt-0 last:pb-0">
    <div className="flex flex-col">
      <span className="font-bold text-neutral-800">{label}</span>
      <span className="text-sm text-neutral-500">{sublabel}</span>
    </div>
    <div className="flex items-center gap-4">
      <button
        onClick={(e) => { e.stopPropagation(); onDecrement(); }}
        disabled={count === 0}
        className={`w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center transition ${count === 0 ? 'opacity-20 cursor-not-allowed' : 'hover:border-black active:scale-90'}`}
      >
        <svg viewBox="0 0 32 32" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="4"><path d="M2 16h28" /></svg>
      </button>
      <span className="text-neutral-800 w-4 text-center">{count}</span>
      <button
        onClick={(e) => { e.stopPropagation(); onIncrement(); }}
        className="w-8 h-8 rounded-full border border-neutral-300 flex items-center justify-center hover:border-black transition active:scale-90"
      >
        <svg viewBox="0 0 32 32" className="w-3 h-3" fill="none" stroke="currentColor" strokeWidth="4"><path d="M2 16h28M16 2v28" /></svg>
      </button>
    </div>
  </div>
);

interface GuestModalProps {
  counts: { adults: number; children: number; infants: number; pets: number };
  setCounts: React.Dispatch<React.SetStateAction<{ adults: number; children: number; infants: number; pets: number }>>;
}

const GuestModal: React.FC<GuestModalProps> = ({ counts, setCounts }) => {
  const updateCount = (type: keyof typeof counts, delta: number) => {
    setCounts(prev => ({ ...prev, [type]: Math.max(0, prev[type] + delta) }));
  };

  return (
    <div className="absolute top-20 right-0 w-[90vw] max-w-[400px] bg-white rounded-[32px] shadow-2xl z-50 p-6 md:p-8 border border-neutral-100 animate-in fade-in slide-in-from-top-2" onClick={(e) => e.stopPropagation()}>
      <GuestCounter
        label="Adults" sublabel="Ages 13 or above" count={counts.adults}
        onIncrement={() => updateCount('adults', 1)} onDecrement={() => updateCount('adults', -1)}
      />
      <div className="h-[1px] bg-neutral-100 w-full my-2"></div>
      <GuestCounter
        label="Children" sublabel="Ages 2–12" count={counts.children}
        onIncrement={() => updateCount('children', 1)} onDecrement={() => updateCount('children', -1)}
      />
      <div className="h-[1px] bg-neutral-100 w-full my-2"></div>
      <GuestCounter
        label="Infants" sublabel="Under 2" count={counts.infants}
        onIncrement={() => updateCount('infants', 1)} onDecrement={() => updateCount('infants', -1)}
      />

    </div>
  );
};

export default GuestModal;
