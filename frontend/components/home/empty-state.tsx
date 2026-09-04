import { SearchX } from "lucide-react";

export function EmptyState({ message = "Nothing here yet." }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-md border border-hairline bg-canvas-elevated px-6 py-12 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-full border border-hairline bg-canvas">
        <SearchX className="h-5 w-5 text-mute" aria-hidden />
      </div>
      <p className="text-[14px] text-body">{message}</p>
    </div>
  );
}