import type { ReactNode } from "react";
import { X } from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  showCloseButton?: boolean;
}

const Modal = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = "md",
  showCloseButton = true,
}: ModalProps) => {
  if (!isOpen) return null;

  const sizeClasses = {
    sm: "modal-sm",
    md: "modal-md",
    lg: "modal-lg",
    xl: "modal-xl",
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className={`modal ${sizeClasses[size]}`}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || showCloseButton) && (
          <div className="modal-header">
            <div className="modal-header-content">
              {title && <h3 className="modal-title">{title}</h3>}
              {description && <p className="modal-description">{description}</p>}
            </div>
            {showCloseButton && (
              <button type="button" className="modal-close" onClick={onClose}>
                <X size={18} />
              </button>
            )}
          </div>
        )}
        <div className="modal-body">{children}</div>
      </div>
    </div>
  );
};

export default Modal;
