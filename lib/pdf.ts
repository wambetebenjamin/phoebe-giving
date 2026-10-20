import { jsPDF } from "jspdf";
import type { Gift, Settings } from "./types";
import { formatDate, kes } from "./format";

const FUND_LABEL: Record<string, string> = {
  tithe: "Tithe",
  offering: "Offering",
  building: "Building Fund",
  missions: "Missions Fund",
  benevolence: "Benevolence Fund",
};

export function buildReceipt(gift: Gift, settings?: Partial<Settings>) {
  const doc = new jsPDF();
  const church = settings?.churchName || "Phoebe Community Church";
  doc.setFillColor(76, 123, 203);
  doc.rect(0, 0, 210, 32, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Phoebe Giving", 16, 14);
  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.text("Giving receipt", 16, 23);
  doc.setTextColor(33, 37, 41);
  doc.setFontSize(12);
  doc.text(church, 16, 46);
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 80);
  const rows: [string, string][] = [
    ["Reference", gift.ref],
    ["Date", formatDate(gift.createdAt)],
    ["Giver", gift.name],
    ["Phone", gift.phone],
    ["Email", gift.email || "Not supplied"],
    ["Fund", FUND_LABEL[gift.fund] || gift.fund],
    ["Frequency", gift.frequency === "one-time" ? "One time" : gift.frequency],
    ["Payment", gift.payment === "mpesa" ? "M-Pesa" : "Card"],
    ["Amount", kes(gift.amount)],
    ["Status", "Confirmed"],
  ];
  let y = 58;
  rows.forEach(([label, value]) => {
    doc.setFont("helvetica", "bold");
    doc.setTextColor(24, 90, 70);
    doc.text(label, 16, y);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(33, 37, 41);
    doc.text(value, 62, y);
    y += 9;
  });
  doc.setFontSize(9);
  doc.setTextColor(90, 90, 90);
  doc.text("Every gift tracked. Every purpose served.", 16, y + 8);
  doc.text("This receipt is issued by Phoebe Community Church for the giver's records.", 16, y + 14);
  if (settings?.mpesaPaybill) {
    doc.text(`Paybill ${settings.mpesaPaybill}`, 16, y + 20);
  }
  return doc;
}

export function buildStatement(name: string, year: number, gifts: Gift[], settings?: Partial<Settings>) {
  const doc = new jsPDF();
  doc.setFillColor(24, 165, 119);
  doc.rect(0, 0, 210, 28, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.text(`${year} giving statement`, 16, 18);
  doc.setTextColor(33, 37, 41);
  doc.setFontSize(11);
  doc.text(settings?.churchName || "Phoebe Community Church", 16, 40);
  doc.setFont("helvetica", "normal");
  doc.text(name, 16, 48);
  const total = gifts.reduce((sum, gift) => sum + gift.amount, 0);
  doc.text(`Total given: ${kes(total)}`, 16, 56);
  let y = 70;
  doc.setFont("helvetica", "bold");
  doc.text("Date", 16, y);
  doc.text("Fund", 52, y);
  doc.text("Reference", 110, y);
  doc.text("Amount", 160, y);
  y += 6;
  doc.setFont("helvetica", "normal");
  gifts.forEach((gift) => {
    if (y > 270) {
      doc.addPage();
      y = 20;
    }
    doc.text(formatDate(gift.createdAt), 16, y);
    doc.text(FUND_LABEL[gift.fund] || gift.fund, 52, y);
    doc.text(gift.ref, 110, y);
    doc.text(kes(gift.amount), 160, y);
    y += 7;
  });
  return doc;
}
