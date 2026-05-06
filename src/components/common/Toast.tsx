import { X, CheckCircle, AlertCircle, Info } from "lucide-react";
import type { ToastType } from "../../context/ToastContext";

interface ToastProps {
  toast: { id: string; message: string; type: ToastType };
  onClose: () => void;
}

const icons = {
  success: CheckCircle,
  error: AlertCircle,
  info: Info,
};

const styles = {
  success: "toast toast-success",
  error: "toast toast-error",
  info: "toast toast-info",
};

export default function Toast({ toast, onClose }: ToastProps) {
  const Icon = icons[toast.type];

  return (
    <div className={styles[toast.type]}>
      <Icon size={18} className="toast-icon" />
      <span className="toast-message">{toast.message}</span>
      <button className="toast-close" onClick={onClose}>
        <X size={16} />
      </button>
    </div>
  );
}
