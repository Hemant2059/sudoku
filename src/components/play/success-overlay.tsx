"use client";

interface SuccessOverlayProps {
  difficulty: string;
  elapsed: number;
  fmtTime: (s: number) => string;
  onPlayAgain: () => void;
}

export function SuccessOverlay({ difficulty, elapsed, fmtTime, onPlayAgain }: SuccessOverlayProps) {
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/80 dark:bg-zinc-950/80 backdrop-blur-sm rounded-xl animate-in fade-in duration-500">
      <div className="text-center p-6 bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-emerald-100 dark:border-emerald-900/30 transform scale-100 animate-in zoom-in-95 duration-300">
        <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-4">
          <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
        </div>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">Puzzle Solved!</h3>
        <p className="text-sm text-slate-500 mb-6">You completed the {difficulty} puzzle in {fmtTime(elapsed)}.</p>
        <button onClick={onPlayAgain} className="w-full h-11 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-colors shadow-lg shadow-emerald-500/25">Play Another</button>
      </div>
    </div>
  );
}
