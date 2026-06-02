"use client";

interface PauseOverlayProps {
  elapsed: number;
  fmtTime: (s: number) => string;
  onResume: () => void;
}

export function PauseOverlay({ elapsed, fmtTime, onResume }: PauseOverlayProps) {
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/80 dark:bg-zinc-950/80 backdrop-blur-sm rounded-xl animate-in fade-in duration-200">
      <div className="text-center p-6">
        <div className="w-16 h-16 bg-slate-100 dark:bg-zinc-800 text-slate-500 dark:text-slate-400 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        </div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-1">Paused</h3>
        <p className="text-sm text-slate-500 mb-2">{fmtTime(elapsed)}</p>
        <button onClick={onResume} className="h-10 px-6 rounded-xl bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-sm font-bold hover:bg-slate-800 dark:hover:bg-white transition-colors">
          Resume
        </button>
      </div>
    </div>
  );
}
