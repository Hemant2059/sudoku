"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogClose,
} from "@/components/ui/dialog";

interface CompletedDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CompletedDialog({ open, onOpenChange }: CompletedDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>Puzzle Completed!</DialogTitle>
          <DialogDescription>
            No more hints needed — the puzzle is fully solved. Great work!
          </DialogDescription>
        </DialogHeader>
        <div className="flex justify-end">
          <DialogClose
            render={
              <button className="h-9 px-4 rounded-xl bg-purple-600 text-white text-xs font-bold hover:bg-purple-700 transition-colors">
                OK
              </button>
            }
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
