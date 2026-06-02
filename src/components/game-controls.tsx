"use client";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { Difficulty, GameStatus } from "@/lib/types";

interface GameControlsProps {
  difficulty: Difficulty;
  onDifficultyChange: (d: Difficulty) => void;
  onNewGame: () => void;
  onSolve: () => void;
  onCheck: () => void;
  onErase: () => void;
  onPencilModeToggle: () => void;
  pencilMode: boolean;
  status: GameStatus;
  cluesCount?: number;
  numMoves?: number;
  loading?: boolean;
}

export function GameControls({
  difficulty,
  onDifficultyChange,
  onNewGame,
  onSolve,
  onCheck,
  onErase,
  onPencilModeToggle,
  pencilMode,
  status,
  cluesCount,
  numMoves,
  loading,
}: GameControlsProps) {
  return (
    <div className="flex flex-col gap-4 w-full">
      <div className="flex flex-wrap items-center gap-2">
        <Select
          value={difficulty}
          onValueChange={(v) => onDifficultyChange(v as Difficulty)}
          disabled={loading}
        >
          <SelectTrigger className="w-[130px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="easy">Easy</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="hard">Hard</SelectItem>
            <SelectItem value="expert">Expert</SelectItem>
          </SelectContent>
        </Select>

        <Button onClick={onNewGame} disabled={loading} variant="default">
          New Game
        </Button>

        <Button onClick={onCheck} disabled={loading || status !== "playing"} variant="outline">
          Check
        </Button>

        <Button onClick={onSolve} disabled={loading || status !== "playing"} variant="secondary">
          Solve
        </Button>
      </div>

      <Separator />

      <div className="flex flex-wrap items-center gap-2">
        <Button
          onClick={onPencilModeToggle}
          variant={pencilMode ? "default" : "outline"}
          size="sm"
        >
          {pencilMode ? "Pencil ON" : "Pencil OFF"}
        </Button>

        <Button onClick={onErase} disabled={loading} variant="outline" size="sm">
          Erase
        </Button>

        {status === "solved" && (
          <Badge variant="default" className="bg-green-600">Solved!</Badge>
        )}
        {status === "checking" && <Badge variant="secondary">Checking...</Badge>}
        {status === "error" && <Badge variant="destructive">Error</Badge>}

        <div className="ml-auto flex items-center gap-3 text-sm text-muted-foreground">
          {cluesCount !== undefined && <span>Clues: {cluesCount}</span>}
          {numMoves !== undefined && <span>Moves: {numMoves}</span>}
        </div>
      </div>
    </div>
  );
}


