import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { Invoice } from "../types/invoice.types";

export const generateInvoicePDF = (invoice: Invoice): void => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // Colors
  const primaryColor: [number, number, number] = [79, 70, 229];
  const darkColor: [number, number, number] = [30, 41, 59];
  const grayColor: [number, number, number] = [100, 116, 139];

  // Header - Business Name
  doc.setFontSize(22);
  doc.setTextColor(...primaryColor);
  doc.text(invoice.business.name, 20, 25);

  // Business Info
  doc.setFontSize(9);
  doc.setTextColor(...grayColor);
  doc.text(`RUC: ${invoice.business.ruc}`, 20, 33);
  doc.text(invoice.business.address, 20, 38);
  doc.text(`Tel: ${invoice.business.phone} | Email: ${invoice.business.email}`, 20, 43);

  // Invoice Title
  doc.setFontSize(16);
  doc.setTextColor(...darkColor);
  doc.text("FACTURA ELECTRÓNICA", pageWidth - 20, 25, { align: "right" });

  // Invoice Number & Date
  doc.setFontSize(10);
  doc.setTextColor(...grayColor);
  doc.text(`No.: ${invoice.invoiceNumber}`, pageWidth - 20, 33, { align: "right" });
  doc.text(`Fecha: ${formatDate(invoice.createdAt)}`, pageWidth - 20, 38, { align: "right" });

  // Status Badge
  const statusColors: Record<string, [number, number, number]> = {
    DRAFT: [148, 163, 184],
    GENERATED: [59, 130, 246],
    SENT: [34, 197, 94],
    FAILED: [239, 68, 68],
  };
  doc.setFillColor(...(statusColors[invoice.status] || grayColor));
  doc.roundedRect(pageWidth - 45, 42, 25, 6, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(7);
  doc.text(getStatusLabel(invoice.status), pageWidth - 32.5, 46.5, { align: "center" });

  // Divider
  doc.setDrawColor(...primaryColor);
  doc.setLineWidth(0.5);
  doc.line(20, 52, pageWidth - 20, 52);

  // Client Info Box
  doc.setFillColor(248, 250, 252);
  doc.roundedRect(20, 58, pageWidth - 40, 28, 3, 3, "F");

  doc.setFontSize(11);
  doc.setTextColor(...darkColor);
  doc.text("CLIENTE", 25, 66);

  doc.setFontSize(10);
  doc.setTextColor(...darkColor);
  doc.text(`${invoice.client.firstName} ${invoice.client.lastName}`, 25, 73);
  
  doc.setFontSize(9);
  doc.setTextColor(...grayColor);
  doc.text(`RUC/CI: ${invoice.client.documentNumber}`, 25, 79);
  if (invoice.client.email) {
    doc.text(`Email: ${invoice.client.email}`, 100, 79);
  }
  if (invoice.client.phone) {
    doc.text(`Tel: ${invoice.client.phone}`, 25, 85);
  }

  // Items Table
  const tableData = invoice.items.map((item) => [
    item.name,
    item.quantity.toString(),
    formatCurrency(item.unitPrice),
    item.discount > 0 ? `-${formatCurrency(item.discount)}` : "-",
    formatCurrency(item.subtotal),
  ]);

  autoTable(doc, {
    startY: 92,
    head: [["Descripción", "Cant", "P.Unit", "Desc.", "Subtotal"]],
    body: tableData,
    theme: "striped",
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontSize: 9,
      fontStyle: "bold",
    },
    bodyStyles: {
      fontSize: 9,
      textColor: darkColor,
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252],
    },
    columnStyles: {
      0: { cellWidth: 70 },
      1: { cellWidth: 20, halign: "center" },
      2: { cellWidth: 30, halign: "right" },
      3: { cellWidth: 25, halign: "right" },
      4: { cellWidth: 35, halign: "right" },
    },
    margin: { left: 20, right: 20 },
  });

  const finalY = (doc as jsPDF & { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 10;

  // Totals
  const totalsX = pageWidth - 70;
  doc.setFontSize(10);
  doc.setTextColor(...grayColor);
  doc.text("Subtotal:", totalsX, finalY);
  doc.text("Descuento:", totalsX, finalY + 6);
  doc.text("IVA (15%):", totalsX, finalY + 12);
  
  doc.setTextColor(...darkColor);
  doc.text(formatCurrency(invoice.totals.subtotal), pageWidth - 20, finalY, { align: "right" });
  doc.text(formatCurrency(invoice.totals.discountAmount), pageWidth - 20, finalY + 6, { align: "right" });
  doc.text(formatCurrency(invoice.totals.taxAmount), pageWidth - 20, finalY + 12, { align: "right" });

  // Total Box
  doc.setFillColor(...primaryColor);
  doc.roundedRect(totalsX - 5, finalY + 18, 55, 12, 2, 2, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text("TOTAL:", totalsX, finalY + 26);
  doc.text(formatCurrency(invoice.totals.total), pageWidth - 20, finalY + 26, { align: "right" });

  // Payment Info
  const paymentY = finalY + 45;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(...darkColor);
  doc.text("FORMA DE PAGO:", 20, paymentY);

  doc.setFontSize(9);
  doc.setTextColor(...grayColor);
  
  let paymentText = "";
  switch (invoice.payment.method) {
    case "CASH":
      paymentText = `Efectivo - Recibido: ${formatCurrency(invoice.payment.cashAmount)} | Cambio: ${formatCurrency(invoice.payment.change)}`;
      break;
    case "TRANSFER":
      paymentText = `Transferencia/Dépósito - Ref: ${invoice.payment.voucherCode || "N/A"} | Monto: ${formatCurrency(invoice.payment.paid)}`;
      break;
    case "MIXED":
      paymentText = `Mixto - Efectivo: ${formatCurrency(invoice.payment.cashAmount)} | Transferencia: ${formatCurrency(invoice.payment.transferAmount)}`;
      break;
  }
  doc.text(paymentText, 20, paymentY + 7);

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(...grayColor);
  doc.text("Gracias por su preferencia!", pageWidth / 2, 270, { align: "center" });
  doc.text(`Generado el: ${new Date().toLocaleString("es-ES")}`, pageWidth / 2, 275, { align: "center" });

  // Save
  doc.save(`factura-${invoice.invoiceNumber}.pdf`);
};

const formatDate = (dateStr: string): string => {
  return new Date(dateStr).toLocaleDateString("es-ES", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

const formatCurrency = (amount: number): string => {
  return `$${Number(amount).toFixed(2)}`;
};

const getStatusLabel = (status: string): string => {
  const labels: Record<string, string> = {
    DRAFT: "Borrador",
    GENERATED: "Generada",
    SENT: "Enviada",
    FAILED: "Error",
  };
  return labels[status] || status;
};

export default generateInvoicePDF;