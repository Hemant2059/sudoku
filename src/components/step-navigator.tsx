"use client";

import { Badge } from "@/components/ui/badge";
import type { SolveStep } from "@/lib/types";

interface StepNavigatorProps {
  steps: SolveStep[];
  currentStep: number;
  onStepChange: (step: number) => void;
}

export function StepNavigator({ steps, currentStep, onStepChange }: StepNavigatorProps) {
  if (steps.length === 0) return null;

  const step = steps[currentStep];
  const total = steps.length;
  const hasPrev = currentStep > 0;
  const hasNext = currentStep < total - 1;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <span className="text-sm text-muted-foreground font-mono">
          Step {currentStep + 1} / {total}
        </span>
        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-blue-500 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / total) * 100}%` }}
          />
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={() => onStepChange(currentStep - 1)}
          disabled={!hasPrev}
          className="flex-1 h-9 rounded-lg border border-border bg-background text-sm font-medium hover:bg-muted disabled:opacity-40 disabled:pointer-events-none transition-colors"
        >
          ← Back
        </button>
        <button
          onClick={() => onStepChange(currentStep + 1)}
          disabled={!hasNext}
          className="flex-1 h-9 rounded-lg border border-border bg-background text-sm font-medium hover:bg-muted disabled:opacity-40 disabled:pointer-events-none transition-colors"
        >
          Next →
        </button>
        <button
          onClick={() => onStepChange(0)}
          disabled={!hasPrev}
          className="h-9 px-3 rounded-lg border border-border bg-background text-xs font-medium hover:bg-muted disabled:opacity-40 disabled:pointer-events-none transition-colors"
          title="Go to first step"
        >
          ⟪
        </button>
        <button
          onClick={() => onStepChange(total - 1)}
          disabled={!hasNext}
          className="h-9 px-3 rounded-lg border border-border bg-background text-xs font-medium hover:bg-muted disabled:opacity-40 disabled:pointer-events-none transition-colors"
          title="Go to final step"
        >
          ⟫
        </button>
      </div>

      {step && (
        <div className="p-4 rounded-lg border bg-card space-y-3">
          <div className="flex items-start gap-2">
            <Badge variant={step.isFallbackUsed ? "destructive" : "secondary"} className="shrink-0 mt-0.5">
              {step.strategyName}
            </Badge>
            {step.isFallbackUsed && (
              <Badge variant="outline" className="text-xs shrink-0 mt-0.5">fallback</Badge>
            )}
          </div>
          <p className="text-sm text-foreground">{step.description}</p>

          {step.mutations.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Changes</p>
              <div className="flex flex-wrap gap-1.5">
                {step.mutations.map((m, i) => (
                  <Badge key={i} variant="outline" className="text-xs font-mono">
                    {m.action === "SET_VALUE" ? (
                      <><span className="text-green-600 font-bold">{m.digit}</span> @ {m.cell}</>
                    ) : (
                      <><span className="text-amber-600">✕{m.digit}</span> @ {m.cell}</>
                    )}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {step.proofChain && step.proofChain.length > 0 && (
            <div className="space-y-1">
              <p className="text-xs font-medium text-muted-foreground">Reasoning chain</p>
              <div className="flex flex-wrap gap-1.5">
                {step.proofChain.map((p, i) => (
                  <Badge key={i} variant="secondary" className="text-xs font-mono">
                    {p.cell} {p.digit}
                    {p.state !== "neutral" && (
                      <span className={p.state === "trial" ? "text-blue-500" : "text-red-500"}>
                        {" "}({p.state})
                      </span>
                    )}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
