/* Modal para registrar pago manual de un tenant */
import { useState, useEffect } from "react";
import { X, AlertCircle, DollarSign, CreditCard } from "lucide-react";
import type { SubscriptionPlan, PaymentMethod, ManualPaymentRequest } from "../../types/adminTenant.types";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (data: ManualPaymentRequest) => Promise<void>;
  currentPlan?: SubscriptionPlan;
}

const PLAN_PRICES: Record<SubscriptionPlan, number> = {
  BASIC: 20,
  PREMIUM: 30,
};

const MONTHS_OPTIONS = [1, 3, 6, 12];

const METHOD_OPTIONS: { value: PaymentMethod; label: string }[] = [
  { value: "CASH", label: "Efectivo" },
  { value: "TRANSFER", label: "Transferencia" },
  { value: "OTHER", label: "Otro" },
];

export const ManualPaymentModal = ({ isOpen, onClose, onConfirm, currentPlan }: Props) => {
  const [plan, setPlan] = useState<SubscriptionPlan>(currentPlan || "BASIC");
  const [months, setMonths] = useState(1);
  const [amount, setAmount] = useState(PLAN_PRICES[plan]);
  const [method, setMethod] = useState<PaymentMethod>("CASH");
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [showConfirm, setShowConfirm] = useState(false);

  // Auto-calcular monto cuando cambia plan o meses
  useEffect(() => {
    setAmount(PLAN_PRICES[plan] * months);
  }, [plan, months]);

  // Resetear estado al abrir
  useEffect(() => {
    if (isOpen) {
      setPlan(currentPlan || "BASIC");
      setMonths(1);
      setAmount(PLAN_PRICES[currentPlan || "BASIC"]);
      setMethod("CASH");
      setReference("");
      setNotes("");
      setError("");
      setShowConfirm(false);
      setIsSubmitting(false);
    }
  }, [isOpen, currentPlan]);

  if (!isOpen) return null;

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    if (!isNaN(val) && val >= 0) {
      setAmount(val);
    }
  };

  const handleSubmit = async () => {
    setError("");
    setIsSubmitting(true);
    try {
      await onConfirm({
        plan,
        months,
        amount,
        currency: "USD",
        method,
        reference: reference.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al registrar el pago");
    } finally {
      setIsSubmitting(false);
      setShowConfirm(false);
    }
  };

  return (
    <div style={overlayStyle} onClick={onClose}>
      <div style={modalStyle} onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div style={headerStyle}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <DollarSign size={20} />
            <h3 style={{ margin: 0, fontSize: 18, fontWeight: 600 }}>Registrar Pago Manual</h3>
          </div>
          <button onClick={onClose} style={closeBtnStyle} aria-label="Cerrar">
            <X size={20} />
          </button>
        </div>

        {/* Confirmation step */}
        {showConfirm ? (
          <div style={{ padding: "20px 24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16, color: "#eab308" }}>
              <AlertCircle size={24} />
              <span style={{ fontWeight: 600, fontSize: 16 }}>Confirmar pago</span>
            </div>
            <p style={{ margin: 0, color: "#475569", lineHeight: 1.6 }}>
              Vas a registrar un pago manual y activar/renovar este tenant. Esta acción quedará registrada.
            </p>
            <div style={summaryStyle}>
              <SummaryRow label="Plan" value={plan} />
              <SummaryRow label="Meses" value={`${months}`} />
              <SummaryRow label="Monto" value={`$${amount.toFixed(2)} USD`} />
              <SummaryRow label="Método" value={METHOD_OPTIONS.find((m) => m.value === method)?.label || method} />
              {reference && <SummaryRow label="Referencia" value={reference} />}
              {notes && <SummaryRow label="Notas" value={notes} />}
            </div>
            {error && <div style={errorStyle}>{error}</div>}
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 20 }}>
              <button onClick={() => setShowConfirm(false)} style={cancelBtnStyle}>
                Cancelar
              </button>
              <button onClick={handleSubmit} disabled={isSubmitting} style={confirmBtnStyle}>
                {isSubmitting ? "Procesando..." : "Confirmar pago y activar"}
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Form */}
            <div style={{ padding: "20px 24px", display: "flex", flexDirection: "column", gap: 16 }}>
              {/* Plan */}
              <div>
                <label style={labelStyle}>Plan</label>
                <div style={{ display: "flex", gap: 8 }}>
                  {(["BASIC", "PREMIUM"] as SubscriptionPlan[]).map((p) => (
                    <button
                      key={p}
                      onClick={() => setPlan(p)}
                      style={{
                        ...planBtnStyle,
                        backgroundColor: plan === p ? "#3b82f6" : "#f1f5f9",
                        color: plan === p ? "#fff" : "#475569",
                      }}
                    >
                      {p === "BASIC" ? "BASIC - $20/mes" : "PREMIUM - $30/mes"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Months */}
              <div>
                <label style={labelStyle}>Meses</label>
                <div style={{ display: "flex", gap: 8 }}>
                  {MONTHS_OPTIONS.map((m) => (
                    <button
                      key={m}
                      onClick={() => setMonths(m)}
                      style={{
                        ...planBtnStyle,
                        minWidth: 50,
                        backgroundColor: months === m ? "#3b82f6" : "#f1f5f9",
                        color: months === m ? "#fff" : "#475569",
                      }}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              {/* Amount */}
              <div>
                <label style={labelStyle}>Monto (USD)</label>
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={handleAmountChange}
                  style={inputStyle}
                />
              </div>

              {/* Method */}
              <div>
                <label style={labelStyle}>Método de pago</label>
                <div style={{ display: "flex", gap: 8 }}>
                  {METHOD_OPTIONS.map((m) => (
                    <button
                      key={m.value}
                      onClick={() => setMethod(m.value)}
                      style={{
                        ...planBtnStyle,
                        backgroundColor: method === m.value ? "#3b82f6" : "#f1f5f9",
                        color: method === m.value ? "#fff" : "#475569",
                      }}
                    >
                      {m.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reference */}
              <div>
                <label style={labelStyle}>
                  Referencia{" "}
                  <span style={{ fontWeight: 400, color: "#94a3b8" }}>(opcional)</span>
                </label>
                <input
                  type="text"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder={
                    method === "TRANSFER"
                      ? "Número de comprobante o referencia bancaria"
                      : "Número de referencia"
                  }
                  style={inputStyle}
                />
              </div>

              {/* Notes */}
              <div>
                <label style={labelStyle}>
                  Notas{" "}
                  <span style={{ fontWeight: 400, color: "#94a3b8" }}>(opcional)</span>
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Notas adicionales..."
                  rows={3}
                  style={{ ...inputStyle, resize: "vertical", fontFamily: "inherit" }}
                />
              </div>

              {error && <div style={errorStyle}>{error}</div>}

              <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 4 }}>
                <button onClick={onClose} style={cancelBtnStyle}>
                  Cancelar
                </button>
                <button onClick={() => setShowConfirm(true)} style={submitBtnStyle}>
                  <CreditCard size={16} />
                  Continuar
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

/* --- Styled components --- */

const SummaryRow = ({ label, value }: { label: string; value: string }) => (
  <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0" }}>
    <span style={{ color: "#64748b", fontSize: 14 }}>{label}</span>
    <span style={{ fontWeight: 600, fontSize: 14 }}>{value}</span>
  </div>
);

const overlayStyle: React.CSSProperties = {
  position: "fixed",
  inset: 0,
  backgroundColor: "rgba(0,0,0,0.5)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  zIndex: 1000,
};

const modalStyle: React.CSSProperties = {
  backgroundColor: "#fff",
  borderRadius: 12,
  width: "90%",
  maxWidth: 520,
  maxHeight: "90vh",
  overflow: "auto",
  boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
};

const headerStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  padding: "16px 24px",
  borderBottom: "1px solid #e2e8f0",
};

const closeBtnStyle: React.CSSProperties = {
  background: "none",
  border: "none",
  cursor: "pointer",
  padding: 4,
  color: "#64748b",
  display: "flex",
  alignItems: "center",
};

const labelStyle: React.CSSProperties = {
  display: "block",
  fontSize: 13,
  fontWeight: 600,
  color: "#334155",
  marginBottom: 6,
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  border: "1px solid #cbd5e1",
  borderRadius: 8,
  fontSize: 14,
  outline: "none",
  boxSizing: "border-box",
};

const planBtnStyle: React.CSSProperties = {
  padding: "8px 16px",
  border: "none",
  borderRadius: 8,
  fontSize: 13,
  fontWeight: 600,
  cursor: "pointer",
  transition: "all 0.15s",
};

const summaryStyle: React.CSSProperties = {
  marginTop: 16,
  padding: "12px 16px",
  backgroundColor: "#f8fafc",
  borderRadius: 8,
  border: "1px solid #e2e8f0",
};

const errorStyle: React.CSSProperties = {
  marginTop: 12,
  padding: "10px 14px",
  backgroundColor: "#fef2f2",
  border: "1px solid #fecaca",
  borderRadius: 8,
  color: "#dc2626",
  fontSize: 14,
};

const cancelBtnStyle: React.CSSProperties = {
  padding: "10px 20px",
  border: "1px solid #cbd5e1",
  borderRadius: 8,
  backgroundColor: "#fff",
  color: "#475569",
  fontSize: 14,
  fontWeight: 500,
  cursor: "pointer",
};

const submitBtnStyle: React.CSSProperties = {
  padding: "10px 20px",
  border: "none",
  borderRadius: 8,
  backgroundColor: "#3b82f6",
  color: "#fff",
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
  display: "flex",
  alignItems: "center",
  gap: 6,
};

const confirmBtnStyle: React.CSSProperties = {
  padding: "10px 24px",
  border: "none",
  borderRadius: 8,
  backgroundColor: "#22c55e",
  color: "#fff",
  fontSize: 14,
  fontWeight: 600,
  cursor: "pointer",
};
