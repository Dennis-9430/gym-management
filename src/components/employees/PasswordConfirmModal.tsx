import { useState } from "react";
import { Lock, Eye, EyeOff } from "lucide-react";

interface PasswordConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (password: string) => void;
  title?: string;
  description?: string;
}

const PasswordConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = "Confirmar acción",
  description = "Ingresa tu contraseña para confirmar este cambio",
}: PasswordConfirmModalProps) => {
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError("La contraseña es obligatoria");
      return;
    }
    onConfirm(password);
  };

  const handleClose = () => {
    setPassword("");
    setError(null);
    setShowPassword(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <style>{`
        .password-modal-overlay {
          position: fixed;
          inset: 0;
          z-index: 600;
          background-color: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(4px);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 16px;
        }
        .password-modal {
          background: var(--color-bg-primary, #fff);
          border-radius: 18px;
          border: 1px solid var(--color-border, #e2e8f0);
          box-shadow: 0 24px 48px rgba(15, 23, 42, 0.18);
          width: 100%;
          max-width: 360px;
          position: relative;
          animation: modalIn 250ms ease forwards;
        }
        .password-modal-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          padding: 28px 24px 0;
          text-align: center;
        }
        .password-modal-icon {
          width: 56px;
          height: 56px;
          background: linear-gradient(135deg, var(--color-primary, #2563eb) 0%, var(--color-primary-dark, #1e3a8a) 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          margin-bottom: 12px;
        }
        .password-modal-title {
          font-size: 1.25rem;
          font-weight: 600;
          margin: 0 0 4px;
          color: var(--color-text-primary, #1e293b);
        }
        .password-modal-desc {
          font-size: 0.875rem;
          color: var(--color-text-secondary, #64748b);
          margin: 0 0 16px;
        }
        .password-modal-body {
          padding: 0 24px 20px;
        }
        .password-modal-body .form-group label {
          display: block;
          font-size: 0.875rem;
          font-weight: 500;
          margin-bottom: 6px;
          color: var(--color-text-primary, #1e293b);
        }
        .password-modal-input-wrap {
          position: relative;
          display: flex;
          align-items: center;
        }
        .password-modal-input-wrap input {
          width: 100%;
          padding: 10px 40px 10px 12px;
          border: 1px solid var(--color-border, #e2e8f0);
          border-radius: 8px;
          font-size: 0.9375rem;
          background: var(--color-bg-primary, #fff);
          color: var(--color-text-primary, #1e293b);
        }
        .password-modal-input-wrap input:focus {
          outline: none;
          border-color: var(--color-primary, #2563eb);
          box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
        }
        .password-modal-toggle {
          position: absolute;
          right: 8px;
          background: transparent;
          border: none;
          color: var(--color-text-secondary, #64748b);
          cursor: pointer;
          padding: 4px;
          display: flex;
          border-radius: 4px;
        }
        .password-modal-toggle:hover {
          background: var(--color-bg-secondary, #f1f5f9);
        }
        .password-modal .form-error {
          color: var(--color-error, #dc2626);
          font-size: 0.8125rem;
          margin-top: 6px;
        }
        .password-modal-footer {
          padding: 0 24px 24px;
          display: flex;
          gap: 12px;
          justify-content: center;
        }
        .password-modal-footer button {
          flex: 1;
          max-width: 140px;
          padding: 10px 16px;
          border-radius: 8px;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }
        .password-modal-footer .btn-cancel {
          background: var(--color-bg-secondary, #f1f5f9);
          border: 1px solid var(--color-border, #e2e8f0);
          color: var(--color-text-primary, #1e293b);
        }
        .password-modal-footer .btn-cancel:hover {
          background: var(--color-bg-tertiary, #e2e8f0);
        }
        .password-modal-footer .btn-confirm {
          background: var(--color-primary, #2563eb);
          border: 1px solid var(--color-primary, #2563eb);
          color: white;
        }
        .password-modal-footer .btn-confirm:hover {
          background: var(--color-primary-dark, #1d4ed8);
        }
        @media (max-width: 480px) {
          .password-modal {
            max-width: 100%;
          }
          .password-modal-header {
            padding: 24px 16px 0;
          }
          .password-modal-icon {
            width: 48px;
            height: 48px;
          }
          .password-modal-body {
            padding: 0 16px 16px;
          }
          .password-modal-footer {
            padding: 0 16px 16px;
            flex-direction: column-reverse;
          }
          .password-modal-footer button {
            max-width: 100%;
          }
        }
      `}</style>
      <div className="password-modal-overlay">
        <div className="password-modal" onClick={(e) => e.stopPropagation()}>
          <div className="password-modal-header">
            <div className="password-modal-icon">
              <Lock size={22} />
            </div>
            <h3 className="password-modal-title">{title}</h3>
            {description && <p className="password-modal-desc">{description}</p>}
          </div>
          <form onSubmit={handleSubmit}>
            <div className="password-modal-body">
              <div className="form-group">
                <label>Tu contraseña</label>
                <div className="password-modal-input-wrap">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setError(null);
                    }}
                    placeholder="Ingresa tu contraseña"
                    autoFocus
                  />
                  <button
                    type="button"
                    className="password-modal-toggle"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                {error && <p className="form-error">{error}</p>}
              </div>
            </div>
            <div className="password-modal-footer">
              <button type="button" className="btn-cancel" onClick={handleClose}>
                Cancelar
              </button>
              <button type="submit" className="btn-confirm">
                Confirmar
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default PasswordConfirmModal;