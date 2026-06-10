---
name: generating-pdf-files
description: Generate PDF documents from HTML templates, React components, or programmatic layouts using Puppeteer, PDFKit, jsPDF, or React-PDF. Use when the user mentions PDF, generate PDF, invoice, report, certificate, export to PDF, download PDF, or print-ready document.
---

# PDF Generation

## When to use
- Generating invoices, receipts, or billing documents
- Exporting reports, dashboards, or data tables to PDF
- Creating certificates, letters, or contracts
- Client-side PDF download from browser
- Server-side batch PDF generation
- Converting HTML/CSS layouts to print-ready PDFs

## Library Selection

| Library | Best For | Runs On | Fidelity | Weight |
|---------|----------|---------|----------|--------|
| **Puppeteer** | Complex HTML/CSS → PDF | Server | Perfect (headless Chrome) | Heavy |
| **PDFKit** | Programmatic layouts, high volume | Server | Manual positioning | Light |
| **jsPDF** | Simple client-side export | Browser | Basic | Light |
| **@react-pdf/renderer** | React-based documents | Both | Component-based | Medium |

**Decision rule:** Use Puppeteer if you already have HTML templates. Use PDFKit for high-volume server generation. Use jsPDF for quick browser downloads. Use React-PDF if your app is React.

## Workflow
1. **Choose library** based on table above and project constraints
2. **Design template** — HTML/CSS for Puppeteer; component tree for React-PDF; coordinate layout for PDFKit
3. **Implement generation** — see patterns below
4. **Configure output** — page size, margins, headers/footers
5. **Test** — visual diff against expected output, check file size
6. **Serve** — API endpoint (server) or download trigger (client)

## Patterns

### Puppeteer (HTML → PDF)
```typescript
import puppeteer from 'puppeteer';

async function htmlToPdf(html: string): Promise<Buffer> {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  await page.setContent(html, { waitUntil: 'networkidle0' });
  const pdf = await page.pdf({
    format: 'A4',
    margin: { top: '1cm', right: '1cm', bottom: '1cm', left: '1cm' },
    printBackground: true,
  });
  await browser.close();
  return Buffer.from(pdf);
}
```

### PDFKit (Programmatic)
```typescript
import PDFDocument from 'pdfkit';

function createInvoice(data: InvoiceData): Promise<Buffer> {
  return new Promise((resolve) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks: Buffer[] = [];
    doc.on('data', (c) => chunks.push(c));
    doc.on('end', () => resolve(Buffer.concat(chunks)));

    doc.fontSize(20).text('Invoice', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Bill To: ${data.customer}`);
    doc.text(`Total: $${data.total.toFixed(2)}`);
    doc.end();
  });
}
```

### jsPDF (Browser)
```typescript
import { jsPDF } from 'jspdf';

function downloadPdf() {
  const doc = new jsPDF();
  doc.setFontSize(20);
  doc.text('Report Title', 20, 30);
  doc.setFontSize(12);
  doc.text('Generated on: ' + new Date().toLocaleDateString(), 20, 45);
  doc.save('report.pdf');
}
```

### React-PDF
```tsx
import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: { padding: 30 },
  title: { fontSize: 24, marginBottom: 10 },
});

const MyDoc = ({ data }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      <Text style={styles.title}>{data.title}</Text>
      <Text>Date: {data.date}</Text>
    </Page>
  </Document>
);

// Generate buffer: const blob = await pdf(<MyDoc data={data} />).toBlob();
```

### API Endpoint (Next.js)
```typescript
export async function GET(req: NextRequest) {
  const pdfBuffer = await htmlToPdf(renderTemplate(data));
  return new NextResponse(pdfBuffer, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="document.pdf"',
    },
  });
}
```

## Page Configuration Defaults
| Setting | Default |
|---------|---------|
| Size | A4 (210 × 297mm) |
| Margins | 1cm all sides |
| Font | Helvetica 12pt |
| Background | Print enabled |
| DPI | 150 (screen) / 300 (print) |

## Checklist
- [ ] Library chosen based on use case (see table)
- [ ] Template renders correctly before PDF conversion
- [ ] Page size and margins configured
- [ ] Fonts embedded (custom fonts bundled, not linked)
- [ ] Images use absolute URLs or embedded base64
- [ ] File size reasonable (< 5MB for typical documents)
- [ ] API endpoint sets `Content-Type: application/pdf`
- [ ] `Content-Disposition` header set for downloads
- [ ] Puppeteer: browser instance closed after generation (no leaks)
- [ ] Tested with edge cases: long tables, page breaks, empty data
