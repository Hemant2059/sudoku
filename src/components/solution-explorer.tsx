"use client";

import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { SolveStep } from "@/lib/types";

interface SolutionExplorerProps {
  steps: SolveStep[];
  onStepHover: (stepIndex: number | null) => void;
  onStepClick: (stepIndex: number) => void;
}

export function SolutionExplorer({ steps, onStepHover, onStepClick }: SolutionExplorerProps) {
  const [open, setOpen] = useState(false);

  if (steps.length === 0) return null;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger
        render={
          <Button variant="outline" className="w-full">
            View Solution Steps ({steps.length})
          </Button>
        }
      />
      <SheetContent side="right" className="w-full sm:max-w-md">
        <SheetHeader>
          <SheetTitle>Step-by-Step Solution</SheetTitle>
        </SheetHeader>
        <Separator className="my-4" />
        <ScrollArea className="h-[calc(100vh-10rem)] pr-4">
          <div className="space-y-3">
            {steps.map((step) => (
              <div
                key={step.stepNumber}
                className="p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                onMouseEnter={() => onStepHover(step.stepNumber - 1)}
                onMouseLeave={() => onStepHover(null)}
                onClick={() => onStepClick(step.stepNumber - 1)}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs text-muted-foreground font-mono">
                    #{step.stepNumber}
                  </span>
                  <Badge variant={step.isFallbackUsed ? "destructive" : "secondary"}>
                    {step.strategyName}
                  </Badge>
                  {step.isFallbackUsed && (
                    <Badge variant="outline" className="text-xs">
                      fallback
                    </Badge>
                  )}
                </div>
                <p className="text-sm">{step.description}</p>
                {step.mutations.length > 0 && (
                  <div className="mt-1 flex flex-wrap gap-1">
                    {step.mutations.map((m, mi) => (
                      <Badge key={mi} variant="outline" className="text-xs font-mono">
                        {m.action === "SET_VALUE" ? "→" : "−"} {m.digit} @ {m.cell}
                      </Badge>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
