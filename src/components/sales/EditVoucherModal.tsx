/* Modal para editar voucher y comprobante */
import { useState, useRef, useEffect } from "react";
import { X, Upload, Loader2, CheckCircle } from "lucide-react";
import { updateVoucherAPI } from "../../services/sales.service";
import type { SaleRecord } from "../../types/sales.types";

interface EditVoucherModalProps {
  isOpen: boolean;
  onClose: () => void;
  sale: SaleRecord | null;
  onSave: () => void;
}

const EditVoucherModal = ({ isOpen, onClose, sale, onSave }: EditVoucherModalProps) => {
  const [voucherCode, setVoucherCode] = useState("");
  const [voucherImage, setVoucherImage] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (sale) {
      setVoucherCode(sale.voucherCode || "");
      setVoucherImage(sale.voucherImage || "");
    }
  }, [sale]);

  if (!isOpen || !sale) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setVoucherImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // Extraer solo la parte base64 si es muy larga
      const imageBase64 = voucherImage.includes(",") ? voucherImage.split(",")[1] : voucherImage;
      await updateVoucherAPI(sale.id.toString(), voucherCode.trim() || undefined, imageBase64 || undefined);
      onSave();
      onClose();
    } catch (error) {
      console.error("Error guardando:", error);
    } finally {
      setLoading(false);
    }
  };

  const modalStyle: React.CSSProperties = {
  width: 530,
  maxWidth: 530,
  minWidth: 530,
  height: "auto",
  maxHeight: "none",
  overflow: "visible",
  display: "block",
};

const headerStyle: React.CSSProperties = {
  padding: "14px 20px",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const bodyStyle: React.CSSProperties = {
  padding: "16px 20px",
  overflow: "visible",
};

const footerStyle: React.CSSProperties = {
  padding: "12px 20px",
  display: "flex",
  gap: "10px",
  justifyContent: "flex-end",
};

return (
    <div className="pos-modal-backdrop" onClick={onClose}>
      <div className="pos-modal edit-voucher-modal" style={modalStyle} onClick={(e) => e.stopPropagation()}>
        <div className="pos-modal-header" style={headerStyle}>
          <h3 style={{ margin: 0, fontSize: 16 }}>Editar Voucher</h3>
          <button type="button" className="pos-modal-close" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div className="pos-modal-body" style={bodyStyle}>
          <div className="voucher-field" style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 14, fontWeight: 500, color: "#64748b", marginBottom: 6 }}>Codigo de Voucher / Referencia</label>
            <input
              type="text"
              value={voucherCode}
              onChange={(e) => setVoucherCode(e.target.value)}
              placeholder="Ej: TRF-001, DEP-123456"
              style={{ width: "100%", padding: "10px 12px", border: "1px solid #e2e8f0", borderRadius: 6, fontSize: 14, background: "#fff" }}
            />
          </div>

          <div className="voucher-field" style={{ marginBottom: 14 }}>
            <label style={{ display: "block", fontSize: 14, fontWeight: 500, color: "#64748b", marginBottom: 6 }}>Comprobante (imagen)</label>
            <input
              type="file"
              ref={fileInputRef}
              accept="image/*"
              onChange={handleFileChange}
              style={{ display: "none" }}
            />
            <div 
              className="voucher-image-upload" 
              onClick={() => fileInputRef.current?.click()}
              style={{ width: "100%", height: 160, border: "2px dashed #e2e8f0", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", overflow: "hidden", background: "#f8fafc" }}
            >
              {voucherImage ? (
                <img src={voucherImage} alt="Comprobante" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
              ) : sale.voucherImage ? (
                <img src={sale.voucherImage} alt="Comprobante actual" style={{ width: "100%", height: "100%", objectFit: "contain" }} />
              ) : (
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, color: "#94a3b8" }}>
                  <Upload size={32} />
                  <span style={{ fontSize: 13 }}>Subir imagen</span>
                </div>
              )}
            </div>
            {voucherImage && (
              <button
                type="button"
                onClick={() => setVoucherImage("")}
                style={{ marginTop: 8, padding: "6px 12px", background: "transparent", border: "1px solid #ef4444", color: "#ef4444", borderRadius: 4, fontSize: 12, cursor: "pointer" }}
              >
                Quitar imagen
              </button>
            )}
          </div>
        </div>

        <div className="pos-modal-footer" style={footerStyle}>
          <button 
            type="button" 
            onClick={handleSave} 
            disabled={loading}
            style={{ 
              display: "inline-flex", 
              alignItems: "center", 
              justifyContent: "center", 
              gap: 8, 
              padding: "10px 16px", 
              borderRadius: 6, 
              fontSize: 14, 
              fontWeight: 500, 
              cursor: loading ? "not-allowed" : "pointer", 
              border: "none", 
              background: loading ? "#94a3b8" : "#4f46e5", 
              color: "#fff",
              opacity: loading ? 0.5 : 1
            }}
          >
            {loading ? <Loader2 size={18} className="spin" /> : <CheckCircle size={18} />}
            Guardar
          </button>
          <button 
            type="button" 
            onClick={onClose}
            style={{ 
              display: "inline-flex", 
              alignItems: "center", 
              justifyContent: "center", 
              gap: 8, 
              padding: "10px 16px", 
              borderRadius: 6, 
              fontSize: 14, 
              fontWeight: 500, 
              cursor: "pointer", 
              border: "1px solid #e2e8f0", 
              background: "#f1f5f9", 
              color: "#475569"
            }}
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditVoucherModal;