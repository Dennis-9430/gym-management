import type { Person } from "./person.types";

export type DocumentType = "CEDULA" | "PASSPORT" | "DNI";
export type MemberShipStatus = "ACTIVE" | "EXPIRED" | "NONE" | "PENDING";
export interface ClientForm extends Person {
  name?: string;
  id: number;
  documentType: DocumentType;
  documentNumber: string;

  firstName: string;
  lastName: string;

  phone?: string;
  email?: string;
  address?: string;

  emergencyContact?: string;
  emergencyPhone?: string;

  notes?: string;

  createdAt?: Date;

  memberShip: string;

  memberShipStartDate: Date;
  memberShipEndDate: Date;

  memberShipStatus: MemberShipStatus;

  fingerPrint: boolean;
}
export interface ClientProps {
  client: ClientForm;
}
