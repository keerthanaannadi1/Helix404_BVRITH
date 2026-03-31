/**
 * ============================================================
 *  BVRIT WEEKLY REPORT — EXPORT ENGINE
 *  Replicates the EXACT official BVRIT weekly report format
 *  Usage: node exportService.js   (runs demo with sample data)
 *  In Express: const { generateWeeklyDocx } = require('./exportService')
 * ============================================================
 *
 *  INSTALL:  npm install docx
 *
 *  FUNCTION EXPORTED:
 *    generateWeeklyDocx(reportData) → Promise<Buffer>
 *    generateMonthlyDocx(reportsArray) → Promise<Buffer>
 *    generateYearlyDocx(reportsArray) → Promise<Buffer>
 *
 *  HOW TO USE IN EXPRESS ROUTE:
 *    const buf = await generateWeeklyDocx(reportData);
 *    res.setHeader('Content-Disposition', 'attachment; filename="WeeklyReport.docx"');
 *    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
 *    res.send(buf);
 */

'use strict';

const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  AlignmentType, BorderStyle, WidthType, ShadingType, VerticalAlign,
  Header, Footer, PageBreak
} = require('docx');
const fs = require('fs');

// ─── Page & margin constants (A4 portrait, 1cm margins) ───────────────────────
// A4: 11906 × 16838 DXA.  Margins: top/bottom 720 (0.5in), left/right 900 (0.625in)
const PAGE_W    = 11906;
const MARGIN_LR = 900;
const MARGIN_TB = 720;
const CONTENT_W = PAGE_W - MARGIN_LR * 2;   // 10106 DXA — full content width

// ─── Borders ──────────────────────────────────────────────────────────────────
const bSingle  = (color = '000000', size = 4) => ({ style: BorderStyle.SINGLE, size, color });
const bNone    = () => ({ style: BorderStyle.NONE,   size: 0, color: 'FFFFFF' });
const allBord  = (c = '000000', s = 4) => ({ top: bSingle(c,s), bottom: bSingle(c,s), left: bSingle(c,s), right: bSingle(c,s) });
const noBord   = () => ({ top: bNone(), bottom: bNone(), left: bNone(), right: bNone() });

// ─── Typography helpers ────────────────────────────────────────────────────────
const run = (text, opts = {}) => new TextRun({
  text: String(text ?? ''),
  font:   opts.font   ?? 'Times New Roman',
  size:   opts.size   ?? 20,          // half-points: 20 = 10pt, 24 = 12pt
  bold:   opts.bold   ?? false,
  color:  opts.color  ?? '000000',
  italics: opts.italic ?? false,
});

const para = (children, opts = {}) => new Paragraph({
  alignment: opts.align ?? AlignmentType.LEFT,
  spacing:   opts.spacing ?? { before: 0, after: 0, line: 276 },
  children:  Array.isArray(children) ? children : [children],
  indent:    opts.indent,
});

const centerPara = (children, opts = {}) => para(children, { ...opts, align: AlignmentType.CENTER });

// ─── Table cell helpers ────────────────────────────────────────────────────────
function cell(content, widthDXA, opts = {}) {
  const text = String(content ?? '');
  const lines = text.split('\n');
  const paragraphs = lines.map(line => new Paragraph({
    alignment: opts.align ?? AlignmentType.CENTER,
    spacing: { before: 0, after: 0 },
    children: [run(line, { size: opts.fontSize ?? 20, bold: opts.bold ?? false, color: opts.color ?? '000000' })]
  }));
  return new TableCell({
    borders:       opts.borders ?? allBord(),
    width:         { size: widthDXA, type: WidthType.DXA },
    shading:       opts.shading ? { fill: opts.shading, type: ShadingType.CLEAR } : undefined,
    margins:       { top: 60, bottom: 60, left: 100, right: 100 },
    verticalAlign: VerticalAlign.CENTER,
    rowSpan:       opts.rowSpan,
    columnSpan:    opts.colSpan,
    children:      paragraphs,
  });
}

function headerCell(text, widthDXA, colSpan) {
  return new TableCell({
    borders:    allBord(),
    width:      { size: widthDXA, type: WidthType.DXA },
    columnSpan: colSpan,
    margins:    { top: 60, bottom: 60, left: 100, right: 100 },
    verticalAlign: VerticalAlign.CENTER,
    children: [new Paragraph({
      alignment: AlignmentType.CENTER,
      spacing: { before: 0, after: 0 },
      children: [run(text, { bold: true, size: 20 })]
    })]
  });
}

// ─── Empty rows for sections with no data ─────────────────────────────────────
function emptyRows(colWidths, count = 2) {
  return Array.from({ length: count }, () =>
    new TableRow({
      children: colWidths.map(w => new TableCell({
        borders: allBord(),
        width: { size: w, type: WidthType.DXA },
        margins: { top: 60, bottom: 60, left: 100, right: 100 },
        children: [new Paragraph({ spacing: { before: 0, after: 0 }, children: [run('  ')] })]
      }))
    })
  );
}

function blankPara(lines = 1) {
  return Array.from({ length: lines }, () =>
    new Paragraph({ spacing: { before: 0, after: 0 }, children: [run('')] })
  );
}

// ─── Section label  "1. General Points ..." ───────────────────────────────────
function sectionLabel(num, text) {
  return new Paragraph({
    spacing: { before: 160, after: 80 },
    children: [run(`${num}. ${text}`, { bold: true, size: 22 })]
  });
}

function subLabel(text) {
  return new Paragraph({
    spacing: { before: 120, after: 60 },
    indent: { left: 440 },
    children: [run(text, { bold: true, size: 20 })]
  });
}

// ═════════════════════════════════════════════════════════════════════════════
//  SECTION TABLE BUILDERS — each mirrors the exact column layout in the PDF
// ═════════════════════════════════════════════════════════════════════════════

// ── 2. Faculty Joined / Relieved ─────────────────────────────────────────────
//  S.No | Name of Faculty | Department | Designation | Date of Joining | Date of Relieving
function buildFacultyJoinedTable(entries = []) {
  const cols = [600, 2200, 1700, 1700, 1600, 1700]; // sum = 9500 ≈ CONTENT_W capped
  // adjust last to fit perfectly
  const total = cols.reduce((a,b) => a+b, 0);
  const diff  = CONTENT_W - total;
  cols[cols.length-1] += diff;

  const headerRow = new TableRow({ children: [
    headerCell('S. No',              cols[0]),
    headerCell('Name of the Faculty',cols[1]),
    headerCell('Department',         cols[2]),
    headerCell('Designation',        cols[3]),
    headerCell('Date of Joining',    cols[4]),
    headerCell('Date of Relieving',  cols[5]),
  ]});

  const dataRows = entries.length > 0
    ? entries.map((e, i) => new TableRow({ children: [
        cell(i+1,                   cols[0]),
        cell(e.facultyName ?? '',   cols[1], { align: AlignmentType.LEFT }),
        cell(e.department  ?? '',   cols[2]),
        cell(e.designation ?? '',   cols[3]),
        cell(formatDate(e.dateOfJoining)   ?? '', cols[4]),
        cell(formatDate(e.dateOfRelieving) ?? '', cols[5]),
      ]}))
    : emptyRows(cols, 2);

  return new Table({ width: { size: CONTENT_W, type: WidthType.DXA }, columnWidths: cols, rows: [headerRow, ...dataRows] });
}

// ── 3. Faculty Achievements ───────────────────────────────────────────────────
//  S.No | Name of Faculty Member(s) | Department | Details of Achievement | Date
function buildFacultyAchievementsTable(entries = []) {
  const cols = [600, 2700, 1600, 3606, 1600];
  const total = cols.reduce((a,b)=>a+b,0);
  cols[cols.length-1] += CONTENT_W - total;

  const headerRow = new TableRow({ children: [
    headerCell('S. No',                    cols[0]),
    headerCell('Name of the Faculty\nMember (S)', cols[1]),
    headerCell('Department',               cols[2]),
    headerCell('Details of the Achievement', cols[3]),
    headerCell('Date',                     cols[4]),
  ]});

  const dataRows = entries.length > 0
    ? entries.map((e,i) => new TableRow({ children: [
        cell(i+1,               cols[0]),
        cell(e.facultyName??'', cols[1], { align: AlignmentType.LEFT }),
        cell(e.department ??'', cols[2]),
        cell(e.details    ??'', cols[3], { align: AlignmentType.LEFT }),
        cell(formatDate(e.date)??'', cols[4]),
      ]}))
    : emptyRows(cols, 2);

  return new Table({ width:{size:CONTENT_W,type:WidthType.DXA}, columnWidths:cols, rows:[headerRow,...dataRows] });
}

// ── 4. Student Achievements ───────────────────────────────────────────────────
//  S.No | Name of Student(s) | Roll.No | Department | Details of Achievement | Date
function buildStudentAchievementsTable(entries = []) {
  const cols = [600, 2200, 1600, 1600, 2506, 1600];
  const total = cols.reduce((a,b)=>a+b,0);
  cols[cols.length-1] += CONTENT_W - total;

  const headerRow = new TableRow({ children: [
    headerCell('S. No',                  cols[0]),
    headerCell('Name of the Student (S)',cols[1]),
    headerCell('Roll. No',               cols[2]),
    headerCell('Department',             cols[3]),
    headerCell('Details of\nAchievement',cols[4]),
    headerCell('Date',                   cols[5]),
  ]});

  const dataRows = entries.length > 0
    ? entries.map((e,i) => new TableRow({ children: [
        cell(i+1,               cols[0]),
        cell(e.studentName??'', cols[1], { align:AlignmentType.LEFT }),
        cell(e.rollNo     ??'', cols[2]),
        cell(e.department ??'', cols[3]),
        cell(e.details    ??'', cols[4], { align:AlignmentType.LEFT }),
        cell(formatDate(e.date)??'', cols[5]),
      ]}))
    : emptyRows(cols, 2);

  return new Table({ width:{size:CONTENT_W,type:WidthType.DXA}, columnWidths:cols, rows:[headerRow,...dataRows] });
}

// ── 5. Department Achievements ────────────────────────────────────────────────
//  S.No | Details of Achievement | Date
function buildDeptAchievementsTable(entries = []) {
  const cols = [600, 7906, 1600];
  const total = cols.reduce((a,b)=>a+b,0);
  cols[1] += CONTENT_W - total;

  const headerRow = new TableRow({ children: [
    headerCell('S. No',                  cols[0]),
    headerCell('Details of Achievement', cols[1]),
    headerCell('Date',                   cols[2]),
  ]});

  const dataRows = entries.length > 0
    ? entries.map((e,i) => new TableRow({ children: [
        cell(i+1,              cols[0]),
        cell(e.details??'',   cols[1], { align:AlignmentType.LEFT }),
        cell(formatDate(e.date)??'', cols[2]),
      ]}))
    : emptyRows(cols, 2);

  return new Table({ width:{size:CONTENT_W,type:WidthType.DXA}, columnWidths:cols, rows:[headerRow,...dataRows] });
}

// ── 6. Faculty Events Conducted ───────────────────────────────────────────────
//  S.No | Name of Event | Dept | Resource Person | Coordinator | No.Faculty | Date(s)
function buildFacultyEventsTable(entries = []) {
  const cols = [520, 1900, 1300, 1800, 1500, 1086, 1300];
  // Note: header row 1 has merged columns per the PDF format
  const total = cols.reduce((a,b)=>a+b,0);
  cols[cols.length-1] += CONTENT_W - total;

  const headerRow = new TableRow({ children: [
    headerCell('S. No',                       cols[0]),
    headerCell('Name of the Event\n(Workshop / FDP / STTPs)', cols[1]),
    headerCell('Department',                  cols[2]),
    headerCell('Details of Resource Person /\nGuest Invited', cols[3]),
    headerCell('Name of the\nCoordinator',    cols[4]),
    headerCell('No. of Faculty\nParticipated',cols[5]),
    headerCell('Date (s)\n(From – To)',       cols[6]),
  ]});

  const dataRows = entries.length > 0
    ? entries.map((e,i) => new TableRow({ children: [
        cell(i+1,                    cols[0]),
        cell(e.eventName??'',        cols[1], { align:AlignmentType.LEFT }),
        cell(e.department??'',       cols[2]),
        cell(e.resourcePerson??'',   cols[3], { align:AlignmentType.LEFT }),
        cell(e.coordinator??'',      cols[4], { align:AlignmentType.LEFT }),
        cell(e.facultyCount??'',     cols[5]),
        cell(formatDateRange(e.dateFrom,e.dateTo), cols[6]),
      ]}))
    : emptyRows(cols, 2);

  return new Table({ width:{size:CONTENT_W,type:WidthType.DXA}, columnWidths:cols, rows:[headerRow,...dataRows] });
}

// ── 7 & 8. Student Events / Non-Tech Events ───────────────────────────────────
//  S.No | Name of Workshop/Event | Dept | Resource Person | Coordinator | Students | Date(s)
function buildStudentEventsTable(entries = []) {
  const cols = [520, 1900, 1300, 1800, 1500, 1086, 1300];
  const total = cols.reduce((a,b)=>a+b,0);
  cols[cols.length-1] += CONTENT_W - total;

  const headerRow = new TableRow({ children: [
    headerCell('S. No',                     cols[0]),
    headerCell('Name of the\n(Workshop / Event /\nGuest Lecture - Topic Name)', cols[1]),
    headerCell('Department',                cols[2]),
    headerCell('Details of Resource\nPerson / Guest Invited', cols[3]),
    headerCell('Name of the\nCoordinator',  cols[4]),
    headerCell('No. of\nStudents\nParticipated', cols[5]),
    headerCell('Date (s)\n(From – To)',     cols[6]),
  ]});

  const dataRows = entries.length > 0
    ? entries.map((e,i) => new TableRow({ children: [
        cell(i+1,                  cols[0]),
        cell(e.eventName??'',      cols[1], { align:AlignmentType.LEFT }),
        cell(e.department??'',     cols[2]),
        cell(e.resourcePerson??'', cols[3], { align:AlignmentType.LEFT }),
        cell(e.coordinator??'',    cols[4], { align:AlignmentType.LEFT }),
        cell(e.studentsCount??'',  cols[5]),
        cell(formatDateRange(e.dateFrom,e.dateTo), cols[6]),
      ]}))
    : emptyRows(cols, 2);

  return new Table({ width:{size:CONTENT_W,type:WidthType.DXA}, columnWidths:cols, rows:[headerRow,...dataRows] });
}

// ── 9. Industry / College Visits ──────────────────────────────────────────────
//  S.No | Industry Name & Location | Dept | Coordinator | No.Students | Date(s)
function buildIndustryVisitsTable(entries = []) {
  const cols = [600, 2700, 1600, 1900, 1506, 1800];
  const total = cols.reduce((a,b)=>a+b,0);
  cols[cols.length-1] += CONTENT_W - total;

  const headerRow = new TableRow({ children: [
    headerCell('S.\nNo',                       cols[0]),
    headerCell('Name of the Industry\nand Location', cols[1]),
    headerCell('Department',                   cols[2]),
    headerCell('Name of the\nCoordinator',     cols[3]),
    headerCell('No. of Students\nParticipated',cols[4]),
    headerCell('Date(s) (From – To)',          cols[5]),
  ]});

  const dataRows = entries.length > 0
    ? entries.map((e,i) => new TableRow({ children: [
        cell(i+1,                   cols[0]),
        cell(`${e.industryName??''}\n${e.location??''}`, cols[1], { align:AlignmentType.LEFT }),
        cell(e.department??'',      cols[2]),
        cell(e.coordinator??'',     cols[3], { align:AlignmentType.LEFT }),
        cell(e.studentsCount??'',   cols[4]),
        cell(formatDateRange(e.dateFrom,e.dateTo), cols[5]),
      ]}))
    : emptyRows(cols, 2);

  return new Table({ width:{size:CONTENT_W,type:WidthType.DXA}, columnWidths:cols, rows:[headerRow,...dataRows] });
}

// ── 10. Hackathons / External Events ─────────────────────────────────────────
//  S.No | Event Name | Conducted By | Mentor Details | No.Students | Date(s)
function buildHackathonsTable(entries = []) {
  const cols = [600, 2400, 1900, 1900, 1306, 1800];
  const total = cols.reduce((a,b)=>a+b,0);
  cols[cols.length-1] += CONTENT_W - total;

  const headerRow = new TableRow({ children: [
    headerCell('S.\nNo',          cols[0]),
    headerCell('Name of the Event /\nHackathon', cols[1]),
    headerCell('Conducted by',    cols[2]),
    headerCell('Mentor\nDetails', cols[3]),
    headerCell('No. of\nStudents\nParticipated', cols[4]),
    headerCell('Date(s) (From – To)', cols[5]),
  ]});

  const dataRows = entries.length > 0
    ? entries.map((e,i) => new TableRow({ children: [
        cell(i+1,                   cols[0]),
        cell(e.eventName??'',       cols[1], { align:AlignmentType.LEFT }),
        cell(e.conductedBy??'',     cols[2], { align:AlignmentType.LEFT }),
        cell(e.mentorDetails??'',   cols[3], { align:AlignmentType.LEFT }),
        cell(e.studentsCount??'',   cols[4]),
        cell(formatDateRange(e.dateFrom,e.dateTo), cols[5]),
      ]}))
    : emptyRows(cols, 2);

  return new Table({ width:{size:CONTENT_W,type:WidthType.DXA}, columnWidths:cols, rows:[headerRow,...dataRows] });
}

// ── 11. Faculty FDP / Certifications ─────────────────────────────────────────
//  S.No | Faculty Name | Dept | Workshop/FDP Name | Organized By | Date(s)
function buildFacultyFDPTable(entries = []) {
  const cols = [600, 2200, 1600, 2400, 1606, 1600];
  const total = cols.reduce((a,b)=>a+b,0);
  cols[cols.length-1] += CONTENT_W - total;

  const headerRow = new TableRow({ children: [
    headerCell('S. No',                    cols[0]),
    headerCell('Name of the\nFaculty Member (s)', cols[1]),
    headerCell('Department',               cols[2]),
    headerCell('Name of the Workshop /\nFDP / Certification etc', cols[3]),
    headerCell('Organized\nby',            cols[4]),
    headerCell('Date (s)\n(From – To)',    cols[5]),
  ]});

  const dataRows = entries.length > 0
    ? entries.map((e,i) => new TableRow({ children: [
        cell(i+1,                  cols[0]),
        cell(e.facultyName??'',   cols[1], { align:AlignmentType.LEFT }),
        cell(e.department??'',    cols[2]),
        cell(e.workshopName??'',  cols[3], { align:AlignmentType.LEFT }),
        cell(e.organizedBy??'',   cols[4], { align:AlignmentType.LEFT }),
        cell(formatDateRange(e.dateFrom,e.dateTo), cols[5]),
      ]}))
    : emptyRows(cols, 2);

  return new Table({ width:{size:CONTENT_W,type:WidthType.DXA}, columnWidths:cols, rows:[headerRow,...dataRows] });
}

// ── 12. Faculty Visits ────────────────────────────────────────────────────────
//  S.No | Faculty Name | Dept | Institution Visited – Location | Date(s)
function buildFacultyVisitsTable(entries = []) {
  const cols = [600, 2400, 1600, 4006, 1500];
  const total = cols.reduce((a,b)=>a+b,0);
  cols[cols.length-1] += CONTENT_W - total;

  const headerRow = new TableRow({ children: [
    headerCell('S. No',                           cols[0]),
    headerCell('Name of the Faculty Member (s)',   cols[1]),
    headerCell('Department',                       cols[2]),
    headerCell('Name of the Colleges / Industry etc Visited – Location', cols[3]),
    headerCell('Date (s)\n(From – To)',            cols[4]),
  ]});

  const dataRows = entries.length > 0
    ? entries.map((e,i) => new TableRow({ children: [
        cell(i+1,                         cols[0]),
        cell(e.facultyName??'',          cols[1], { align:AlignmentType.LEFT }),
        cell(e.department??'',           cols[2]),
        cell(`${e.visitedInstitution??''} – ${e.location??''}`, cols[3], { align:AlignmentType.LEFT }),
        cell(formatDateRange(e.dateFrom,e.dateTo), cols[4]),
      ]}))
    : emptyRows(cols, 2);

  return new Table({ width:{size:CONTENT_W,type:WidthType.DXA}, columnWidths:cols, rows:[headerRow,...dataRows] });
}

// ── 13. Patents Published ─────────────────────────────────────────────────────
//  S.No | Faculty Name | Patent Title | Application No | Publication Date
function buildPatentsTable(entries = []) {
  const cols = [600, 2600, 3206, 1800, 1900];
  const total = cols.reduce((a,b)=>a+b,0);
  cols[cols.length-1] += CONTENT_W - total;

  const headerRow = new TableRow({ children: [
    headerCell('S. No',                   cols[0]),
    headerCell('Name of the Faculty Member (s)', cols[1]),
    headerCell('Patent Title',            cols[2]),
    headerCell('Application .No',         cols[3]),
    headerCell('Publication Date',        cols[4]),
  ]});

  const dataRows = entries.length > 0
    ? entries.map((e,i) => new TableRow({ children: [
        cell(i+1,                      cols[0]),
        cell(e.facultyName??'',       cols[1], { align:AlignmentType.LEFT }),
        cell(e.patentTitle??'',       cols[2], { align:AlignmentType.LEFT }),
        cell(e.applicationNo??'',     cols[3]),
        cell(formatDate(e.publicationDate)??'', cols[4]),
      ]}))
    : emptyRows(cols, 2);

  return new Table({ width:{size:CONTENT_W,type:WidthType.DXA}, columnWidths:cols, rows:[headerRow,...dataRows] });
}

// ── 14. VEDIC Programs — Students ────────────────────────────────────────────
//  S.No | Program Name | Dept | No.Students | Date(s) | VEDIC Centre
function buildVedicStudentsTable(entries = []) {
  const cols = [600, 2800, 1600, 1700, 1806, 1600];
  const total = cols.reduce((a,b)=>a+b,0);
  cols[cols.length-1] += CONTENT_W - total;

  const headerRow = new TableRow({ children: [
    headerCell('S. No',                   cols[0]),
    headerCell('Name of the\nProgram',    cols[1]),
    headerCell('Department',              cols[2]),
    headerCell('No. of Students\nParticipated', cols[3]),
    headerCell('Date (s)\n(From – To)',   cols[4]),
    headerCell('VEDIC Hyd /\nVEDIC B\'lore', cols[5]),
  ]});

  const dataRows = entries.length > 0
    ? entries.map((e,i) => new TableRow({ children: [
        cell(i+1,                     cols[0]),
        cell(e.programName??'',      cols[1], { align:AlignmentType.LEFT }),
        cell(e.department??'',       cols[2]),
        cell(e.studentsCount??'',    cols[3]),
        cell(formatDateRange(e.dateFrom,e.dateTo), cols[4]),
        cell(e.center??'',           cols[5]),
      ]}))
    : emptyRows(cols, 2);

  return new Table({ width:{size:CONTENT_W,type:WidthType.DXA}, columnWidths:cols, rows:[headerRow,...dataRows] });
}

// ── 14. VEDIC Programs — Faculty ─────────────────────────────────────────────
//  S.No | Faculty Name | Dept | Workshop/FDP | In assoc. with | Date(s) | Centre
function buildVedicFacultyTable(entries = []) {
  const cols = [520, 1800, 1300, 1700, 1700, 1486, 1600];
  const total = cols.reduce((a,b)=>a+b,0);
  cols[cols.length-1] += CONTENT_W - total;

  const headerRow = new TableRow({ children: [
    headerCell('S. No',                      cols[0]),
    headerCell('Name of the\nFaculty Member (s)', cols[1]),
    headerCell('Department',                 cols[2]),
    headerCell('Name of the\nworkshop /\nFDP etc', cols[3]),
    headerCell('In\nassociation\nwith (if any)', cols[4]),
    headerCell('Date (s)\n(From – To)',      cols[5]),
    headerCell('VEDIC\nHyd /\nVEDIC\nB\'lore', cols[6]),
  ]});

  const dataRows = entries.length > 0
    ? entries.map((e,i) => new TableRow({ children: [
        cell(i+1,                    cols[0]),
        cell(e.facultyName??'',     cols[1], { align:AlignmentType.LEFT }),
        cell(e.department??'',      cols[2]),
        cell(e.workshopName??'',    cols[3], { align:AlignmentType.LEFT }),
        cell(e.association??'',     cols[4], { align:AlignmentType.LEFT }),
        cell(formatDateRange(e.dateFrom,e.dateTo), cols[5]),
        cell(e.center??'',          cols[6]),
      ]}))
    : emptyRows(cols, 2);

  return new Table({ width:{size:CONTENT_W,type:WidthType.DXA}, columnWidths:cols, rows:[headerRow,...dataRows] });
}

// ── 15. Placements ────────────────────────────────────────────────────────────
//  S.No | Company Name | Dept | No.Students Placed | Package
function buildPlacementsTable(entries = []) {
  const cols = [600, 3200, 1900, 2406, 2000];
  const total = cols.reduce((a,b)=>a+b,0);
  cols[cols.length-1] += CONTENT_W - total;

  const headerRow = new TableRow({ children: [
    headerCell('S. No',                     cols[0]),
    headerCell('Name of the Company',       cols[1]),
    headerCell('Department',                cols[2]),
    headerCell('No. of Students Placed',    cols[3]),
    headerCell('Package',                   cols[4]),
  ]});

  const dataRows = entries.length > 0
    ? entries.map((e,i) => new TableRow({ children: [
        cell(i+1,                      cols[0]),
        cell(e.companyName??'',       cols[1], { align:AlignmentType.LEFT }),
        cell(e.department??'',        cols[2]),
        cell(e.studentsPlaced??'',    cols[3]),
        cell(e.package??'',           cols[4]),
      ]}))
    : emptyRows(cols, 2);

  return new Table({ width:{size:CONTENT_W,type:WidthType.DXA}, columnWidths:cols, rows:[headerRow,...dataRows] });
}

// ── 16. MoUs Signed ───────────────────────────────────────────────────────────
//  S.No | Organization | Date of Signing | MoU Validity | Purpose
function buildMoUsTable(entries = []) {
  const cols = [600, 3000, 1600, 1600, 3306];
  const total = cols.reduce((a,b)=>a+b,0);
  cols[cols.length-1] += CONTENT_W - total;

  const headerRow = new TableRow({ children: [
    headerCell('S. No',                              cols[0]),
    headerCell('Name of the Organization with\nwhom MoU was signed', cols[1]),
    headerCell('Date of Signing',                    cols[2]),
    headerCell('MoU Validity',                       cols[3]),
    headerCell('Purpose of\nMoU (Main Point)',       cols[4]),
  ]});

  const dataRows = entries.length > 0
    ? entries.map((e,i) => new TableRow({ children: [
        cell(i+1,                      cols[0]),
        cell(e.organizationName??'',  cols[1], { align:AlignmentType.LEFT }),
        cell(formatDate(e.signingDate)??'', cols[2]),
        cell(e.validity??'',          cols[3]),
        cell(e.purpose??'',           cols[4], { align:AlignmentType.LEFT }),
      ]}))
    : emptyRows(cols, 2);

  return new Table({ width:{size:CONTENT_W,type:WidthType.DXA}, columnWidths:cols, rows:[headerRow,...dataRows] });
}

// ── 17. Skill Development Programs ───────────────────────────────────────────
//  S.No | Program Name | Faculty Coordinator | Topic & Faculty | No.Students | Sessions
function buildSkillDevTable(entries = []) {
  const cols = [600, 2000, 2000, 2400, 1306, 1800];
  const total = cols.reduce((a,b)=>a+b,0);
  cols[cols.length-1] += CONTENT_W - total;

  const headerRow = new TableRow({ children: [
    headerCell('S. No',                     cols[0]),
    headerCell('Name of the\nProgram',      cols[1]),
    headerCell('Faculty\nCoordinator',      cols[2]),
    headerCell('Topic and Faculty\nHandled',cols[3]),
    headerCell('No. of\nStudents',          cols[4]),
    headerCell('No. of\nSessions',          cols[5]),
  ]});

  const dataRows = entries.length > 0
    ? entries.map((e,i) => new TableRow({ children: [
        cell(i+1,                    cols[0]),
        cell(e.programName??'',     cols[1], { align:AlignmentType.LEFT }),
        cell(e.coordinator??'',     cols[2], { align:AlignmentType.LEFT }),
        cell(e.topic??'',           cols[3], { align:AlignmentType.LEFT }),
        cell(e.studentsCount??'',   cols[4]),
        cell(e.sessions??'',        cols[5]),
      ]}))
    : emptyRows(cols, 2);

  return new Table({ width:{size:CONTENT_W,type:WidthType.DXA}, columnWidths:cols, rows:[headerRow,...dataRows] });
}

// ═════════════════════════════════════════════════════════════════════════════
//  DOCUMENT HEADER — replicates the BVRIT letterhead exactly
// ═════════════════════════════════════════════════════════════════════════════
function buildDocumentHeader(weekStart, weekEnd, department) {
  return [
    // Institution name block (centered, bold, matches official format)
    centerPara([run('BVRIT HYDERABAD College of Engineering for Women', { bold: true, size: 26 })],
      { spacing: { before: 0, after: 40 } }),
    centerPara([run('(UGC Autonomous Institution | Approved by AICTE | Affiliated to JNTUH)', { size: 18 })],
      { spacing: { before: 0, after: 40 } }),
    centerPara([run('(NAAC Accredited – A Grade | NBA Accredited B. Tech. (EEE, ECE & CSE))', { size: 18 })],
      { spacing: { before: 0, after: 40 } }),
    centerPara([run('Bachupally, Hyderabad -500 090', { size: 18 })],
      { spacing: { before: 0, after: 80 } }),
    centerPara([run('Weekly Report', { bold: true, size: 22 })],
      { spacing: { before: 0, after: 140 } }),

    // Week duration + department line
    para([
      run('Week Duration: ', { bold: false, size: 20 }),
      run(formatWeekRange(weekStart, weekEnd), { bold: false, size: 20, color: 'FF0000' }),
    ], { spacing: { before: 0, after: 60 } }),

    para([
      run('Name of the Department: ', { size: 20 }),
      run(department ?? 'EEE / ECE / CSE / IT / CSE (AI&ML) / BSH', { size: 20 }),
    ], { spacing: { before: 0, after: 160 } }),
  ];
}

// ═════════════════════════════════════════════════════════════════════════════
//  MAIN EXPORT FUNCTION
// ═════════════════════════════════════════════════════════════════════════════
/**
 * generateWeeklyDocx
 * @param {Object} reportData - shape shown in SAMPLE_DATA below
 * @returns {Promise<Buffer>}
 */
async function generateWeeklyDocx(reportData) {
  const {
    weekStart, weekEnd, department,
    generalPoints            = [],
    facultyJoined            = [],
    facultyAchievements      = [],
    studentAchievements      = [],
    departmentAchievements   = [],
    facultyEvents            = [],
    studentEvents            = [],
    nonTechEvents            = [],
    industryVisits           = [],
    hackathons               = [],
    facultyFDP               = [],
    facultyVisits            = [],
    patents                  = [],
    vedicStudents            = [],
    vedicFaculty             = [],
    placements               = [],
    mous                     = [],
    skillDevelopment         = [],
  } = reportData;

  const children = [
    // ── Header ──────────────────────────────────────────────────────────────
    ...buildDocumentHeader(weekStart, weekEnd, department),

    // ── 1. General Points ────────────────────────────────────────────────────
    sectionLabel('1', 'General Points (like conduction of Parent Teacher Meeting, Department Meeting etc)'),
    ...( generalPoints.length > 0
      ? generalPoints.map(g => para([run(`• ${g.content}`, { size: 20 })], { spacing:{before:40,after:40} }))
      : [para([run('  ')], { spacing:{before:60,after:60} }), para([run('  ')], { spacing:{before:60,after:60} })]
    ),

    // ── 2. Faculty Joined / Relieved ─────────────────────────────────────────
    sectionLabel('2', 'Faculty Joined / Relieved'),
    buildFacultyJoinedTable(facultyJoined),

    // ── ACHIEVEMENTS banner ──────────────────────────────────────────────────
    ...blankPara(1),
    centerPara([run('ACHIEVEMENTS', { bold: true, size: 22, color: 'FF0000' })],
      { spacing: { before: 120, after: 120 } }),

    // ── 3. Faculty Achievements ──────────────────────────────────────────────
    sectionLabel('3', 'Faculty Achievements (Awards received / Invited for Guest Lecture/ Reviewer /Jury /etc..)'),
    buildFacultyAchievementsTable(facultyAchievements),

    // ── 4. Student Achievements ──────────────────────────────────────────────
    sectionLabel('4', 'Student Achievements'),
    buildStudentAchievementsTable(studentAchievements),

    // ── 5. Department Achievements ───────────────────────────────────────────
    sectionLabel('5', 'Department Achievements'),
    buildDeptAchievementsTable(departmentAchievements),

    // ── EVENTS CONDUCTED banner ──────────────────────────────────────────────
    ...blankPara(1),
    centerPara([run('EVENTS CONDUCTED', { bold: true, size: 22 })],
      { spacing: { before: 120, after: 120 } }),

    // ── 6. Faculty Events ────────────────────────────────────────────────────
    sectionLabel('6', 'Faculty Events - Conducted (FDPs / Workshops / STTPs etc)'),
    buildFacultyEventsTable(facultyEvents),

    // ── 7. Student Events ────────────────────────────────────────────────────
    sectionLabel('7', 'Student Events - Conducted (Technical Events / Workshops / Guest Lecture etc)'),
    buildStudentEventsTable(studentEvents),

    // ── 8. Non Technical Events ──────────────────────────────────────────────
    sectionLabel('8', 'Non Technical Events conducted'),
    buildStudentEventsTable(nonTechEvents),

    // ── 9. Industry / College Visits ─────────────────────────────────────────
    sectionLabel('9', 'Industry/Colleges Visit'),
    buildIndustryVisitsTable(industryVisits),

    // ── 10. Hackathons ───────────────────────────────────────────────────────
    sectionLabel('10', 'Details of Students took part in various Hackathons / Events (Only participation)'),
    buildHackathonsTable(hackathons),

    // ── 11. Faculty FDP / Certifications ─────────────────────────────────────
    sectionLabel('11', 'Faculty attended FDPs / Technical Workshops / STTPS / Orientation course / Certification\n(NPTEL / EDX / Industry /Coursera etc)'),
    buildFacultyFDPTable(facultyFDP),

    // ── 12. Faculty Visits ───────────────────────────────────────────────────
    sectionLabel('12', 'Faculty Visits'),
    buildFacultyVisitsTable(facultyVisits),

    // ── 13. Patents ──────────────────────────────────────────────────────────
    sectionLabel('13', 'Patents Published'),
    buildPatentsTable(patents),

    // ── 14. VEDIC Programs ───────────────────────────────────────────────────
    sectionLabel('14', 'VEDIC Programs'),
    subLabel('Students'),
    buildVedicStudentsTable(vedicStudents),
    ...blankPara(1),
    subLabel('Faculty Members'),
    buildVedicFacultyTable(vedicFaculty),

    // ── 15. Placements ───────────────────────────────────────────────────────
    sectionLabel('15', 'Placements -'),
    buildPlacementsTable(placements),

    // ── 16. MoUs ────────────────────────────────────────────────────────────
    sectionLabel('16', "MoU's Signed"),
    buildMoUsTable(mous),

    // ── 17. Skill Development ────────────────────────────────────────────────
    sectionLabel('17', 'Skill Development Programs (Domain Specific Training / GATE etc)'),
    buildSkillDevTable(skillDevelopment),

    ...blankPara(2),
  ];

  const doc = new Document({
    styles: {
      default: { document: { run: { font: 'Times New Roman', size: 20 } } }
    },
    sections: [{
      properties: {
        page: {
          size:   { width: PAGE_W, height: 16838 },   // A4
          margin: { top: MARGIN_TB, right: MARGIN_LR, bottom: MARGIN_TB, left: MARGIN_LR }
        }
      },
      children,
    }]
  });

  return Packer.toBuffer(doc);
}

// ─── Monthly: aggregate multiple weeks ────────────────────────────────────────
async function generateMonthlyDocx(reportsArray, month, year, department) {
  // Merge all section arrays from each week
  const merged = mergeReports(reportsArray);
  const label  = `${getMonthName(month)} ${year}`;
  return generateWeeklyDocx({
    ...merged,
    weekStart: `01-${String(month).padStart(2,'0')}-${year}`,
    weekEnd:   `${lastDay(month,year)}-${String(month).padStart(2,'0')}-${year}`,
    department: department ?? merged.department,
    _title: `Monthly Report — ${label}`,
  });
}

// ─── Yearly: aggregate all weeks of the year ──────────────────────────────────
async function generateYearlyDocx(reportsArray, year, department) {
  const merged = mergeReports(reportsArray);
  return generateWeeklyDocx({
    ...merged,
    weekStart: `01-01-${year}`,
    weekEnd:   `31-12-${year}`,
    department: department ?? merged.department,
    _title: `Annual Report — ${year}`,
  });
}

// ─── Merge helper ─────────────────────────────────────────────────────────────
function mergeReports(reports) {
  const keys = ['generalPoints','facultyJoined','facultyAchievements','studentAchievements',
    'departmentAchievements','facultyEvents','studentEvents','nonTechEvents','industryVisits',
    'hackathons','facultyFDP','facultyVisits','patents','vedicStudents','vedicFaculty',
    'placements','mous','skillDevelopment'];
  const out = { department: reports[0]?.department };
  for (const k of keys) out[k] = reports.flatMap(r => r[k] ?? []);
  return out;
}

// ─── Date helpers ─────────────────────────────────────────────────────────────
function formatDate(d) {
  if (!d) return '';
  const dt = new Date(d);
  if (isNaN(dt)) return String(d);
  return `${String(dt.getDate()).padStart(2,'0')}-${String(dt.getMonth()+1).padStart(2,'0')}-${dt.getFullYear()}`;
}

function formatDateRange(from, to) {
  if (!from) return '';
  if (!to)   return formatDate(from);
  return `${formatDate(from)} to\n${formatDate(to)}`;
}

function formatWeekRange(start, end) {
  if (!start) return '';
  if (!end)   return formatDate(start);
  const s = new Date(start), e = new Date(end);
  const months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
  return `${s.getDate()}${ordinal(s.getDate())} ${months[s.getMonth()]} to ${e.getDate()}${ordinal(e.getDate())} ${months[e.getMonth()]}`;
}

function ordinal(n) {
  const s = ['th','st','nd','rd'], v = n%100;
  return s[(v-20)%10] ?? s[v] ?? s[0];
}

function getMonthName(m) {
  return ['','January','February','March','April','May','June','July','August','September','October','November','December'][m];
}

function lastDay(m, y) {
  return new Date(y, m, 0).getDate();
}

// ═════════════════════════════════════════════════════════════════════════════
//  SAMPLE DATA — matches the uploaded BVRIT weekly report PDF exactly
// ═════════════════════════════════════════════════════════════════════════════
const SAMPLE_DATA = {
  weekStart:   '2026-03-23',
  weekEnd:     '2026-03-28',
  department:  'CSE (AI&ML)',

  generalPoints: [],   // empty in the sample — leaves blank lines

  facultyJoined: [
    { facultyName: 'Dr.M.Pallavi', department: 'CSE(AI&ML)', designation: 'Assistant Professor', dateOfJoining: '2026-03-23', dateOfRelieving: null },
  ],

  facultyAchievements: [],  // empty in sample

  studentAchievements: [
    { studentName: 'Ms.P.Madhuri',  rollNo: '22WH1A6622', department: 'CSE(AI&ML)', details: 'Secured AIR-27587 in GATE CS', date: '2026-03-19' },
    { studentName: 'Ms.G.Vaishnavi',rollNo: '22WH1A6658', department: 'CSE(AI&ML)', details: 'Secured AIR-33516 in GATE CS', date: '2026-03-19' },
    { studentName: 'Ms.M.Srijani',  rollNo: '23WH1A6610', department: 'CSE(AI&ML)', details: 'Secured AIR-27580 in GATE CS', date: '2026-03-19' },
  ],

  departmentAchievements: [],

  facultyEvents:  [],
  studentEvents:  [],
  nonTechEvents:  [],
  industryVisits: [],

  hackathons: [
    { eventName: "OU International Women's Conference", conductedBy: 'Osmania University', mentorDetails: '-', studentsCount: '1\n(24wh1a6633)', dateFrom: '2026-03-24', dateTo: '2026-03-26' },
    { eventName: 'Hawkins Lab Workshop', conductedBy: 'GDGOC GRIET', mentorDetails: 'Ms.Sayan Mondal', studentsCount: '1\n(24wh1a6621)', dateFrom: '2026-03-25', dateTo: '2026-03-26' },
  ],

  facultyFDP:    [],
  facultyVisits: [],
  patents:       [],
  vedicStudents: [],
  vedicFaculty:  [],

  placements: [
    { companyName: 'Deloitte',  department: 'CSE(AI&ML)', studentsPlaced: 1,  package: '4 LPA'   },
    { companyName: 'HCL Tech',  department: 'CSE(AI&ML)', studentsPlaced: 11, package: '4.5 LPA' },
  ],

  mous: [],

  skillDevelopment: [
    { programName: "MLOP's", coordinator: 'Ms.K.Lalitha Kumari',    topic: 'Assessment',                                        studentsCount: '14\n(2nd yr)', sessions: 8 },
    { programName: 'BFSI',   coordinator: 'Ms.B.Shanmukha Priya',   topic: 'Behavioral learning and introduction to Fintech terminologies.', studentsCount: '23\n(2nd yr)', sessions: 8 },
    { programName: 'AI for Kiran', coordinator: 'Ms.Shruthi',        topic: 'Introduction to Prompt Engineering',                studentsCount: 18,             sessions: 3 },
    { programName: 'Juniper',     coordinator: 'Ms.E.G.Padmavathi', topic: 'Connecting to a secure shell.',                     studentsCount: '5\n(2nd yr)',  sessions: 3 },
  ],
};

// ─── Run demo when executed directly ─────────────────────────────────────────
if (require.main === module) {
  (async () => {
    console.log('Generating BVRIT Weekly Report DOCX...');
    const buf = await generateWeeklyDocx(SAMPLE_DATA);
    const out = '/mnt/user-data/outputs/BVRIT_WeeklyReport_DEMO.docx';
    fs.writeFileSync(out, buf);
    console.log('✅ Done →', out);
  })();
}

module.exports = { generateWeeklyDocx, generateMonthlyDocx, generateYearlyDocx };
