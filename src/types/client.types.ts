export type DocumentType = "CEDULA" | "PASSPORT" | "DNI";

export interface ClientForm {
  documentType: DocumentType;
  documentNumber: string;

  firstName: string;
  lastName: string;

  phone: string;
  email: string;
  address: string;

  emergencyContact: string;
  emergencyPhone: string;

  notes: string;
  createdAt: Date;
}
