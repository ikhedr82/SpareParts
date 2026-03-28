import { Injectable } from '@nestjs/common';
import * as PDFDocument from 'pdfkit';
import { createWriteStream, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

@Injectable()
export class InvoiceGeneratorService {
  private readonly invoiceDir = join(process.cwd(), 'public', 'invoices');

  constructor() {
    if (!existsSync(this.invoiceDir)) {
      mkdirSync(this.invoiceDir, { recursive: true });
    }
  }

  async generateInvoicePdf(invoice: any): Promise<string> {
    const filename = `${invoice.invoiceNumber}.pdf`;
    const filePath = join(this.invoiceDir, filename);
    const doc = new PDFDocument({ size: 'A4', margin: 50 });

    doc.pipe(createWriteStream(filePath));

    // Header
    doc
      .fillColor('#444444')
      .fontSize(20)
      .text('Partivo SaaS Invoice', 110, 57)
      .fontSize(10)
      .text('123 Enterprise St, Cairo, Egypt', 200, 65, { align: 'right' })
      .text('Cairo, EG, 12345', 200, 80, { align: 'right' })
      .moveDown();

    // Line separator
    doc.strokeColor('#aaaaaa').lineWidth(1).moveTo(50, 110).lineTo(550, 110).stroke();

    // Invoice details
    doc
      .fontSize(10)
      .text(`Invoice Number: ${invoice.invoiceNumber}`, 50, 130)
      .text(`Invoice Date: ${new Date(invoice.createdAt).toLocaleDateString()}`, 50, 145)
      .text(`Tenant: ${invoice.tenant.name}`, 300, 130)
      .text(`Status: ${invoice.status}`, 300, 145)
      .moveDown();

    // Summary lines (Subtotal, VAT, Total)
    this.generateTableSummary(doc, 200, 'Subtotal:', `${invoice.subtotal} ${invoice.currency}`);
    const vatPercent = invoice.subtotal > 0 ? ((Number(invoice.taxAmount) / Number(invoice.subtotal)) * 100).toFixed(0) : '0';
    this.generateTableSummary(doc, 220, `VAT (${vatPercent}%):`, `${invoice.taxAmount} ${invoice.currency}`);
    
    doc.font('Helvetica-Bold');
    this.generateTableSummary(doc, 240, 'Total Amount:', `${invoice.amount} ${invoice.currency}`);
    doc.font('Helvetica');

    // Table Header
    const tableTop = 280; // Adjusted tableTop to accommodate new summary lines
    doc
      .fontSize(10)
      .text('Description', 50, tableTop)
      .text('Quantity', 250, tableTop)
      .text('Unit Cost', 350, tableTop)
      .text('Line Total', 450, tableTop);

    doc.strokeColor('#aaaaaa').lineWidth(1).moveTo(50, tableTop + 15).lineTo(550, tableTop + 15).stroke();

    // Table Content (One plan line)
    const item = {
      description: `Partivo SaaS Subscription - ${invoice.subscription.plan.name}`,
      quantity: 1,
      cost: invoice.amount,
      total: invoice.amount,
    };

    const position = tableTop + 30;
    doc
      .text(item.description, 50, position)
      .text(item.quantity.toString(), 250, position)
      .text(`${invoice.currency} ${item.cost}`, 350, position)
      .text(`${invoice.currency} ${item.total}`, 450, position);

    doc.strokeColor('#aaaaaa').lineWidth(1).moveTo(50, position + 15).lineTo(550, position + 15).stroke();

    // Footer
    doc
      .fontSize(10)
      .text('Payment is due within 7 days. Thank you for your business.', 50, 700, { align: 'center', width: 500 });

    doc.end();

    return `/public/invoices/${filename}`;
  }

  private generateTableRow(doc: any, y: number, item: string, description: string, unitCost: string, quantity: string, lineTotal: string) {
    doc
      .fontSize(10)
      .text(item, 50, y)
      .text(description, 150, y)
      .text(unitCost, 280, y, { width: 90, align: 'right' })
      .text(quantity, 370, y, { width: 90, align: 'right' })
      .text(lineTotal, 480, y, { align: 'right' });
  }

  private generateTableSummary(doc: any, y: number, label: string, value: string) {
    doc
      .fontSize(10)
      .text(label, 380, y, { width: 90, align: 'right' })
      .text(value, 480, y, { align: 'right' });
  }
}
