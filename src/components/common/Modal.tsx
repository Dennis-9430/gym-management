import type { ReactNode, CSSProperties } from "react";
import { X } from "lucide-react";

/* Modal reutilizable con titulo y contenido */
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  showCloseButton?: boolean;
  centered?: boolean;
}

const SIZES: Record<string, CSSProperties> = {
  sm: { maxWidth: 500, width: "95vw" },
  md: { maxWidth: 700, width: "95vw" },
  lg: { maxWidth: 900, width: "95vw" },
  xl: { maxWidth: 1100, width: "98vw" },
};

const backdropStyle: CSSProperties = {
  position: "fixed",
  inset: 0,
  background: "rgba(15, 23, 42, 0.55)",
  display: "grid",
  placeItems: "center",
  zIndex: 400,
  padding: 16,
};

const modalBaseStyle: CSSProperties = {
  background: "var(--color-bg-primary)",
  borderRadius: 18,
  border: "1px solid var(--color-border)",
  boxShadow: "0 24px 48px rgba(15, 23, 42, 0.18)",
  display: "flex",
  flexDirection: "column",
  overflow: "hidden",
  maxHeight: "90vh",
};

const Modal = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = "md",
  showCloseButton = true,
  centered = false,
}: ModalProps) => {
  if (!isOpen) return null;

  const modalStyle: CSSProperties = {
    ...modalBaseStyle,
    ...SIZES[size],
    ...(centered ? { maxHeight: "50vh" } : {}),
  };

  return (
    <div style={backdropStyle} onClick={onClose}>
      <div
        style={modalStyle}
        onClick={(e) => e.stopPropagation()}
      >
        {(title || showCloseButton) && (
          <div
            style={{
              padding: "20px 24px",
              borderBottom: "1px solid var(--color-border)",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 16,
            }}
          >
            <div>
              {title && (
                <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>
                  {title}
                </h3>
              )}
              {description && (
                <p
                  style={{
                    margin: "4px 0 0",
                    fontSize: 14,
                    color: "var(--color-text-muted)",
                  }}
                >
                  {description}
                </p>
              )}
            </div>
            {showCloseButton && (
              <button
                type="button"
                onClick={onClose}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: "var(--color-text-muted)",
                  padding: 4,
                  borderRadius: 6,
                  display: "grid",
                  placeItems: "center",
                  flexShrink: 0,
                }}
              >
                <X size={18} />
              </button>
            )}
          </div>
        )}
        <div
          style={{
            padding: "20px 24px",
            overflowY: "auto",
            flex: 1,
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;
