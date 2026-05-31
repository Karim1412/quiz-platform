/**
 * Quiz export utilities.
 * Generates downloadable PDF and DOCX files from MCQ data.
 */

// ---------------------------------------------------------------------------
// PDF export — jsPDF
// ---------------------------------------------------------------------------
export async function exportAsPDF(title, mcqs) {
  const { jsPDF } = await import('jspdf');

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });

  const PAGE_W   = doc.internal.pageSize.getWidth();
  const PAGE_H   = doc.internal.pageSize.getHeight();
  const MARGIN   = 20;
  const CONTENT_W = PAGE_W - MARGIN * 2;

  let y = MARGIN;

  const checkPageBreak = (needed = 10) => {
    if (y + needed > PAGE_H - MARGIN) {
      doc.addPage();
      y = MARGIN;
    }
  };

  // ── Header bar ──────────────────────────────────────────────────────────
  doc.setFillColor(15, 44, 30);           // forest-900
  doc.rect(0, 0, PAGE_W, 18, 'F');
  doc.setTextColor(253, 246, 227);        // parchment-100
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('QuizCraft', MARGIN, 12);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  doc.text(dateStr, PAGE_W - MARGIN, 12, { align: 'right' });

  y = 26;

  // ── Title ────────────────────────────────────────────────────────────────
  doc.setTextColor(15, 44, 30);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(20);
  doc.text(title, MARGIN, y);
  y += 6;

  // Gold underline
  doc.setDrawColor(201, 162, 39);
  doc.setLineWidth(0.8);
  doc.line(MARGIN, y, MARGIN + 80, y);
  y += 6;

  doc.setTextColor(107, 103, 96);
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`${mcqs.length} question${mcqs.length !== 1 ? 's' : ''}`, MARGIN, y);
  y += 10;

  // ── Questions ────────────────────────────────────────────────────────────
  const optionColors = {
    A: [220, 240, 228],
    B: [235, 245, 255],
    C: [255, 250, 235],
    D: [248, 235, 255],
  };

  mcqs.forEach((mcq, idx) => {
    const qLines = doc.splitTextToSize(`${idx + 1}. ${mcq.question}`, CONTENT_W);
    const optionLinesList = ['A', 'B', 'C', 'D'].map(opt =>
      doc.splitTextToSize(`${opt}.  ${mcq[opt]}`, CONTENT_W - 12)
    );
    const blockH = qLines.length * 6 + optionLinesList.reduce((s, l) => s + l.length * 5 + 3, 0) + 12;

    checkPageBreak(blockH);

    // Question card background
    doc.setFillColor(250, 249, 246);
    doc.roundedRect(MARGIN - 3, y - 4, CONTENT_W + 6, blockH - 2, 2, 2, 'F');
    doc.setDrawColor(232, 228, 218);
    doc.setLineWidth(0.3);
    doc.roundedRect(MARGIN - 3, y - 4, CONTENT_W + 6, blockH - 2, 2, 2, 'S');

    // Question number pill
    doc.setFillColor(15, 44, 30);
    doc.circle(MARGIN + 3, y - 0.5, 3.5, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.text(`${idx + 1}`, MARGIN + 3, y + 0.8, { align: 'center' });

    // Question text
    doc.setTextColor(26, 25, 23);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.text(qLines, MARGIN + 9, y);
    y += qLines.length * 6 + 3;

    // Options
    ['A', 'B', 'C', 'D'].forEach((opt, oi) => {
      const lines = optionLinesList[oi];
      const optH = lines.length * 5 + 3;
      const [r, g, b] = optionColors[opt];
      doc.setFillColor(r, g, b);
      doc.roundedRect(MARGIN + 4, y - 2, CONTENT_W - 8, optH, 1.5, 1.5, 'F');

      doc.setTextColor(15, 44, 30);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.text(opt, MARGIN + 8, y + lines.length * 2.5 - 0.5);

      doc.setTextColor(26, 25, 23);
      doc.setFont('helvetica', 'normal');
      doc.text(lines, MARGIN + 14, y);
      y += optH + 2;
    });

    y += 6;
  });

  // ── Answer Key ───────────────────────────────────────────────────────────
  doc.addPage();
  y = MARGIN;

  doc.setFillColor(15, 44, 30);
  doc.rect(0, 0, PAGE_W, 18, 'F');
  doc.setTextColor(253, 246, 227);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(13);
  doc.text('Answer Key', MARGIN, 12);

  y = 28;
  doc.setTextColor(15, 44, 30);
  doc.setFontSize(16);
  doc.text(title, MARGIN, y);
  y += 8;
  doc.setDrawColor(201, 162, 39);
  doc.line(MARGIN, y, MARGIN + 60, y);
  y += 8;

  // Grid layout: 5 columns
  const COL_W = CONTENT_W / 5;
  const answerColors = { A: [34, 197, 94], B: [59, 130, 246], C: [234, 179, 8], D: [168, 85, 247] };

  mcqs.forEach((mcq, idx) => {
    const col = idx % 5;
    const row = Math.floor(idx / 5);
    const cx  = MARGIN + col * COL_W + COL_W / 2;
    const cy  = y + row * 20;

    checkPageBreak(20);

    doc.setFillColor(245, 242, 235);
    doc.roundedRect(MARGIN + col * COL_W + 1, cy - 7, COL_W - 2, 16, 2, 2, 'F');

    doc.setTextColor(107, 103, 96);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(`Q${idx + 1}`, cx, cy - 1, { align: 'center' });

    const [ar, ag, ab] = answerColors[mcq.answer] ?? [15, 44, 30];
    doc.setTextColor(ar, ag, ab);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(mcq.answer, cx, cy + 6, { align: 'center' });
  });

  // ── Footer on all pages ──────────────────────────────────────────────────
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setTextColor(180, 177, 170);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(`Generated by QuizCraft  •  Page ${p} of ${totalPages}`, PAGE_W / 2, PAGE_H - 8, { align: 'center' });
  }

  doc.save(`${sanitizeFilename(title)}.pdf`);
}

// ---------------------------------------------------------------------------
// DOCX export — docx library
// ---------------------------------------------------------------------------
export async function exportAsDOCX(title, mcqs) {
  const [{ Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle, TableRow, TableCell, Table, WidthType, ShadingType }] = await Promise.all([
    import('docx'),
  ]);
  const { saveAs } = await import('file-saver');

  const OPTION_COLORS = { A: 'DCF0E4', B: 'EBF5FF', C: 'FFFAEB', D: 'F8EBFF' };

  const children = [
    // Title
    new Paragraph({
      children: [new TextRun({ text: title, bold: true, size: 40, color: '0f2c1e', font: 'Georgia' })],
      spacing: { after: 120 },
    }),
    new Paragraph({
      children: [
        new TextRun({ text: `${mcqs.length} Questions  •  Generated by QuizCraft`, size: 18, color: '6b6760' }),
      ],
      spacing: { after: 360 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: 'C9A227', space: 1 } },
    }),

    // Questions
    ...mcqs.flatMap((mcq, idx) => [
      new Paragraph({
        children: [
          new TextRun({ text: `${idx + 1}.  `, bold: true, size: 22, color: '0f2c1e' }),
          new TextRun({ text: mcq.question, bold: true, size: 22, color: '1a1917' }),
        ],
        spacing: { before: 240, after: 80 },
      }),

      new Table({
        width: { size: 100, type: WidthType.PERCENTAGE },
        rows: [['A', 'B'], ['C', 'D']].map(row =>
          new TableRow({
            children: row.map(opt =>
              new TableCell({
                width: { size: 50, type: WidthType.PERCENTAGE },
                shading: { type: ShadingType.CLEAR, fill: OPTION_COLORS[opt] },
                margins: { top: 80, bottom: 80, left: 120, right: 120 },
                children: [
                  new Paragraph({
                    children: [
                      new TextRun({ text: `${opt}.  `, bold: true, size: 20, color: '0f2c1e' }),
                      new TextRun({ text: mcq[opt], size: 20, color: '1a1917' }),
                    ],
                  }),
                ],
              })
            ),
          })
        ),
        borders: {
          top:    { style: BorderStyle.NONE },
          bottom: { style: BorderStyle.NONE },
          left:   { style: BorderStyle.NONE },
          right:  { style: BorderStyle.NONE },
          insideH: { style: BorderStyle.NONE },
          insideV: { style: BorderStyle.NONE },
        },
      }),
    ]),

    // Answer Key section
    new Paragraph({ children: [], spacing: { before: 480 } }),
    new Paragraph({
      children: [new TextRun({ text: 'Answer Key', bold: true, size: 32, color: '0f2c1e', font: 'Georgia' })],
      spacing: { after: 160 },
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: 'C9A227', space: 1 } },
    }),

    new Table({
      width: { size: 100, type: WidthType.PERCENTAGE },
      rows: chunk(mcqs, 5).map(rowMcqs =>
        new TableRow({
          children: rowMcqs.map((mcq, ci) =>
            new TableCell({
              width: { size: 20, type: WidthType.PERCENTAGE },
              shading: { type: ShadingType.CLEAR, fill: 'F5F2EB' },
              margins: { top: 80, bottom: 80, left: 120, right: 120 },
              children: [
                new Paragraph({
                  alignment: AlignmentType.CENTER,
                  children: [
                    new TextRun({ text: `Q${mcqs.indexOf(rowMcqs[ci]) + 1}`, size: 16, color: '6b6760', break: 0 }),
                    new TextRun({ text: `\n${mcq.answer}`, bold: true, size: 24, color: '1f5038', break: 1 }),
                  ],
                }),
              ],
            })
          ),
        })
      ),
      borders: {
        top:    { style: BorderStyle.NONE },
        bottom: { style: BorderStyle.NONE },
        left:   { style: BorderStyle.NONE },
        right:  { style: BorderStyle.NONE },
        insideH: { style: BorderStyle.SINGLE, size: 2, color: 'E8E4DA' },
        insideV: { style: BorderStyle.SINGLE, size: 2, color: 'E8E4DA' },
      },
    }),
  ];

  const doc = new Document({
    sections: [{
      properties: { page: { margin: { top: 1080, bottom: 1080, left: 1080, right: 1080 } } },
      children,
    }],
  });

  const blob = await Packer.toBlob(doc);
  saveAs(blob, `${sanitizeFilename(title)}.docx`);
}

// ---------------------------------------------------------------------------
// JSON export
// ---------------------------------------------------------------------------
export function exportAsJSON(title, mcqs) {
  const payload = { title, generated_at: new Date().toISOString(), questions: mcqs };
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = `${sanitizeFilename(title)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
function sanitizeFilename(name) {
  return name.replace(/[^a-z0-9_\-\s]/gi, '').replace(/\s+/g, '_').slice(0, 60) || 'quiz';
}

function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}
