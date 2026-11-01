import React from 'react';
import { AlertTriangle } from 'lucide-react';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  isDanger?: boolean;
}

export const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy bỏ',
  isDanger = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="bg-[#041628] rounded-2xl border border-[#0e3d54] shadow-2xl max-w-md w-full p-6 animate-in zoom-in-95 duration-150 text-slate-100">
        <div className="flex items-start gap-4">
          <div
            className={`p-2.5 rounded-xl shrink-0 ${
              isDanger
                ? 'bg-rose-950/80 text-rose-400 border border-rose-800'
                : 'bg-cyan-950/80 text-cyan-400 border border-cyan-800'
            }`}
          >
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">{title}</h3>
            <p className="text-sm text-slate-400 mt-1 leading-relaxed">{message}</p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 mt-6">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-slate-300 bg-[#031526] hover:bg-[#06203a] border border-[#0e3d54] rounded-xl transition-colors cursor-pointer"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className={`px-4 py-2 text-sm font-semibold text-white rounded-xl transition-colors cursor-pointer shadow-sm ${
              isDanger
                ? 'bg-rose-600 hover:bg-rose-500 shadow-rose-950/50'
                : 'bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold shadow-cyan-950/50'
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
};
