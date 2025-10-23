import { useEffect, useRef } from "react";

interface ReportModalProps {
  open: boolean;
  content: string;
  onClose: () => void;
}

export function ReportModal({ open, content, onClose }: ReportModalProps) {
  const dialogRef = useRef<HTMLDialogElement | null>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      dialog.showModal();
    }
    if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  const handleDownload = () => {
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = "structural-report.txt";
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <dialog
      ref={dialogRef}
      className="w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-0 shadow-2xl backdrop:bg-slate-900/40 backdrop:backdrop-blur"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
    >
      <form method="dialog" className="flex flex-col gap-4 p-5">
        <header className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Structural Analysis Report
            </h2>
            <p className="text-xs text-slate-500">
              Export a snapshot of the current design inputs and calculations.
            </p>
          </div>
          <button
            type="button"
            aria-label="Close"
            onClick={onClose}
            className="rounded-full border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-500 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            Close
          </button>
        </header>
        <textarea
          readOnly
          value={content}
          className="h-72 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs leading-relaxed text-slate-700 focus:outline-none"
        />
        <div className="flex flex-col gap-2 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>Reports are generated instantly using the current model state.</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(content)}
              className="rounded-full border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 focus:outline-none focus:ring-2 focus:ring-primary"
            >
              Copy
            </button>
            <button
              type="button"
              onClick={handleDownload}
              className="rounded-full bg-primary px-4 py-2 text-xs font-semibold text-white shadow hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            >
              Download
            </button>
          </div>
        </div>
      </form>
    </dialog>
  );
}
