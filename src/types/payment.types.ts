export type PaymentMethod = "CASH" | "TRANSFER";

export interface Service {
  id: number;
  name: string;
  price: number;
}
export const services: Service[] = [
  { id: 1, name: "Pago Diario Gym", price: 2 },
  { id: 2, name: "Pago Caminadora", price: 1.5 },
  { id: 3, name: "Mensualidad", price: 25 },
  { id: 4, name: "Quincenal", price: 15 },
];
