import jsPDF from 'jspdf';
import { Metrics, Language, ProjectDetails } from '../types';
import { t } from './i18n';
import { GEBESA_LOGO_B64 } from '../assets/gebesa-logo';

export interface VersionCanvas {
  id: string;
  name: string;
  imgData: string;
  metrics: Metrics;
}

interface LoadedImage {
  dataUrl: string;
  w: number;
  h: number;
}

async function loadImage(src: string): Promise<LoadedImage | null> {
  if (!src) return null;
  return new Promise((resolve) => {
    const img = new Image();
    img.onload = () => {
      try {
        const c = document.createElement('canvas');
        c.width  = img.naturalWidth  || 1;
        c.height = img.naturalHeight || 1;
        const ctx = c.getContext('2d');
        if (!ctx) { resolve(null); return; }
        ctx.drawImage(img, 0, 0);
        resolve({ dataUrl: c.toDataURL('image/png'), w: c.width, h: c.height });
      } catch { resolve(null); }
    };
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function drawLogoContained(
  pdf: jsPDF, img: LoadedImage,
  x: number, y: number, maxW: number, maxH: number, alignRight = false
) {
  try {
    const ratio = img.w / img.h;
    let dW = maxW, dH = dW / ratio;
    if (dH > maxH) { dH = maxH; dW = dH * ratio; }
    const drawX = alignRight ? x + maxW - dW : x;
    const drawY = y + (maxH - dH) / 2;
    pdf.addImage(img.dataUrl, 'PNG', drawX, drawY, dW, dH);
  } catch (e) { console.warn('Logo draw failed:', e); }
}

function drawHeader(
  pdf: jsPDF, W: number,
  gebesaImg: LoadedImage | null, clientImg: LoadedImage | null,
  projectName: string, advisorName: string, versionLabel: string
) {
  pdf.setFillColor(248, 247, 244);
  pdf.rect(0, 0, W, 22, 'F');
  pdf.setDrawColor(229, 226, 221);
  pdf.setLineWidth(0.3);
  pdf.line(0, 22, W, 22);

  if (gebesaImg) {
    drawLogoContained(pdf, gebesaImg, 7, 6, 36, 10, false);
  } else {
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(13);
    pdf.setTextColor(90, 90, 64);
    pdf.text('GEBESA', 9, 14);
  }

  if (clientImg) {
    drawLogoContained(pdf, clientImg, W - 43, 6, 36, 10, true);
  }

  pdf.setFont('helvetica', 'bold');
  pdf.setFontSize(9);
  pdf.setTextColor(42, 42, 30);
  pdf.text(projectName, W / 2, 8, { align: 'center' });

  pdf.setFont('helvetica', 'normal');
  pdf.setFontSize(7);
  pdf.setTextColor(120, 118, 100);
  pdf.text(advisorName, W / 2, 13, { align: 'center' });

  if (versionLabel) {
    pdf.setFillColor(90, 90, 64);
    pdf.roundedRect(W / 2 - 20, 15, 40, 6, 1.5, 1.5, 'F');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(7);
    pdf.setTextColor(255, 255, 255);
    pdf.text(versionLabel.toUpperCase(), W / 2, 19.5, { align: 'center' });
  }
}

function drawVersionPage(
  pdf: jsPDF, vc: VersionCanvas, dict: any,
  W: number, H: number,
  gebesaImg: LoadedImage | null, clientImg: LoadedImage | null,
  project: ProjectDetails
) {
  const m = vc.metrics;
  drawHeader(pdf, W, gebesaImg, clientImg, project.projectName, project.advisorName, vc.name);

  const TOP = 26, SIDE_W = 54, DIV_X = SIDE_W + 3;
  const CVS_X = DIV_X + 4, CVS_W = W - CVS_X - 5, CVS_H = H - TOP - 12;

  let sy = TOP + 4;

  const mRow = (label: string, value: string, highlight = false) => {
    if (highlight) {
      pdf.setFillColor(90, 90, 64);
      pdf.rect(4, sy - 3.5, SIDE_W - 4, 5.5, 'F');
      pdf.setFont('helvetica', 'bold'); pdf.setFontSize(6.5); pdf.setTextColor(255, 255, 255);
      pdf.text(label, 7, sy); pdf.text(value, SIDE_W - 2, sy, { align: 'right' });
    } else {
      pdf.setFont('helvetica', 'normal'); pdf.setFontSize(6.2); pdf.setTextColor(90, 90, 64);
      pdf.text(label, 7, sy);
      pdf.setFont('helvetica', 'bold'); pdf.setFontSize(6.2); pdf.setTextColor(42, 42, 30);
      pdf.text(value, SIDE_W - 2, sy, { align: 'right' });
      pdf.setDrawColor(229, 226, 221); pdf.setLineWidth(0.15);
      pdf.line(4, sy + 2, SIDE_W - 2, sy + 2);
    }
    sy += 7;
  };

  const mBar = (label: string, pct: number) => {
    pdf.setFont('helvetica', 'normal'); pdf.setFontSize(5.8); pdf.setTextColor(90, 90, 64);
    pdf.text(label, 7, sy);
    pdf.setFont('helvetica', 'bold'); pdf.setFontSize(5.8); pdf.setTextColor(42, 42, 30);
    pdf.text(`${pct}%`, SIDE_W - 2, sy, { align: 'right' });
    sy += 2.5;
    pdf.setFillColor(229, 226, 221); pdf.rect(7, sy, SIDE_W - 10, 2, 'F');
    const c = pct >= 70 ? [107, 142, 35] : pct >= 40 ? [255, 165, 0] : [220, 80, 60];
    pdf.setFillColor(c[0], c[1], c[2]); pdf.rect(7, sy, (SIDE_W - 10) * pct / 100, 2, 'F');
    sy += 7;
  };

  mRow(dict.metrics.areaLabel, `${m.area} m²`, true);
  mRow(dict.metrics.seats,     String(m.seats));
  mRow(dict.metrics.openSpace, String(m.openSpace));
  mRow(dict.metrics.offices,   String(m.offices));
  mRow(dict.metrics.confRooms, String(m.confRooms));
  mRow(dict.metrics.density,   m.density > 0 ? `${m.density}` : '—');
  sy += 2;
  mBar(dict.metrics.daylight,   m.daylight);
  mBar(dict.metrics.privacy,    m.privacy);
  mBar(dict.metrics.efficiency, m.efficiency);

  pdf.setDrawColor(229, 226, 221); pdf.setLineWidth(0.3);
  pdf.line(DIV_X, TOP, DIV_X, H - 10);

  pdf.setFillColor(250, 249, 247); pdf.rect(CVS_X, TOP, CVS_W, CVS_H, 'F');
  pdf.setDrawColor(229, 226, 221); pdf.setLineWidth(0.3);
  pdf.rect(CVS_X, TOP, CVS_W, CVS_H);

  if (vc.imgData) {
    const img = new Image();
    img.src = vc.imgData;
    const nW = img.naturalWidth || 900, nH = img.naturalHeight || 650;
    const ratio = nW / nH;
    let dW = CVS_W - 4, dH = dW / ratio;
    if (dH > CVS_H - 4) { dH = CVS_H - 4; dW = dH * ratio; }
    pdf.addImage(vc.imgData, 'PNG', CVS_X + (CVS_W - dW) / 2, TOP + (CVS_H - dH) / 2, dW, dH);
  }

  pdf.setFont('helvetica', 'normal'); pdf.setFontSize(5.5); pdf.setTextColor(160, 158, 145);
  pdf.text('gebesa.com', 7, H - 4);
  pdf.text(new Date().toLocaleDateString('es-MX'), W - 7, H - 4, { align: 'right' });
}

function drawComparisonPage(
  pdf: jsPDF, vcs: VersionCanvas[], dict: any,
  W: number, H: number,
  gebesaImg: LoadedImage | null, clientImg: LoadedImage | null,
  project: ProjectDetails, _lang: Language
) {
  drawHeader(pdf, W, gebesaImg, clientImg, project.projectName, project.advisorName, '');

  const TOP = 26;
  const colW = (W - 20) / (vcs.length + 1);

  pdf.setFillColor(42, 42, 30); pdf.rect(8, TOP, W - 16, 7, 'F');
  pdf.setFont('helvetica', 'bold'); pdf.setFontSize(7); pdf.setTextColor(255, 255, 255);
  pdf.text(dict.summary.metric, 9 + colW * 0.05, TOP + 4.5);
  vcs.forEach((vc, i) => pdf.text(vc.name, 8 + colW * (i + 1.5), TOP + 4.5, { align: 'center' }));

  const rows = [
    { label: dict.metrics.seats,                key: 'seats' },
    { label: dict.metrics.openSpace,            key: 'openSpace' },
    { label: dict.metrics.offices,              key: 'offices' },
    { label: dict.metrics.confRooms,            key: 'confRooms' },
    { label: dict.metrics.density,              key: 'density' },
    { label: `${dict.metrics.daylight} %`,      key: 'daylight' },
    { label: `${dict.metrics.privacy} %`,       key: 'privacy' },
    { label: `${dict.metrics.efficiency} %`,    key: 'efficiency' },
  ];

  rows.forEach((row, ri) => {
    const ry = TOP + 7 + ri * 7;
    if (ri % 2 === 1) { pdf.setFillColor(248, 247, 244); pdf.rect(8, ry, W - 16, 7, 'F'); }
    pdf.setDrawColor(229, 226, 221); pdf.setLineWidth(0.1); pdf.line(8, ry + 7, W - 8, ry + 7);
    pdf.setFont('helvetica', 'normal'); pdf.setFontSize(6.5); pdf.setTextColor(90, 90, 64);
    pdf.text(row.label, 9 + colW * 0.05, ry + 4.5);
    vcs.forEach((vc, vi) => {
      pdf.setFont('helvetica', 'bold'); pdf.setFontSize(6.5); pdf.setTextColor(42, 42, 30);
      pdf.text(String((vc.metrics as any)[row.key] ?? '—'), 8 + colW * (vi + 1.5), ry + 4.5, { align: 'center' });
    });
  });

  const afterTable = TOP + 7 + rows.length * 7 + 10;

  // Radar
  const cx = W * 0.27, cy = afterTable + 36, R = 28;
  const axes = [
    { label: dict.metrics.density,    key: 'density',    max: 30,  invert: true },
    { label: dict.metrics.daylight,   key: 'daylight',   max: 100, invert: false },
    { label: dict.metrics.privacy,    key: 'privacy',    max: 100, invert: false },
    { label: dict.metrics.efficiency, key: 'efficiency', max: 100, invert: false },
    { label: dict.metrics.confRooms,  key: 'confRooms',  max: 15,  invert: false },
  ];

  for (let ring = 1; ring <= 3; ring++) {
    const rr = R * ring / 3;
    const pts: number[] = [];
    axes.forEach((_, i) => {
      const a = (Math.PI * 2 * i / axes.length) - Math.PI / 2;
      pts.push(cx + Math.cos(a) * rr, cy + Math.sin(a) * rr);
    });
    pdf.setDrawColor(220, 218, 210); pdf.setLineWidth(0.15);
    for (let i = 0; i < axes.length; i++) {
      const next = (i + 1) % axes.length;
      pdf.line(pts[i*2], pts[i*2+1], pts[next*2], pts[next*2+1]);
    }
  }

  axes.forEach((ax, i) => {
    const a = (Math.PI * 2 * i / axes.length) - Math.PI / 2;
    pdf.setDrawColor(200, 198, 188); pdf.setLineWidth(0.2);
    pdf.line(cx, cy, cx + Math.cos(a) * R, cy + Math.sin(a) * R);
    pdf.setFont('helvetica', 'bold'); pdf.setFontSize(5.5); pdf.setTextColor(90, 90, 64);
    pdf.text(ax.label.substring(0, 10), cx + Math.cos(a) * (R + 7), cy + Math.sin(a) * (R + 7), { align: 'center' });
  });

  const COLORS: [number, number, number][] = [
    [90,90,64],[59,130,246],[239,68,68],[16,185,129],[245,158,11],
  ];

  vcs.forEach((vc, vi) => {
    const [r, g, b] = COLORS[vi % COLORS.length];
    const pts = axes.map((ax, i) => {
      const a = (Math.PI * 2 * i / axes.length) - Math.PI / 2;
      const raw = (vc.metrics as any)[ax.key] || 0;
      const norm = ax.invert ? Math.max(0, 1 - raw / ax.max) : Math.min(1, raw / ax.max);
      return { x: cx + Math.cos(a) * R * norm, y: cy + Math.sin(a) * R * norm };
    });
    pdf.setDrawColor(r, g, b); pdf.setLineWidth(0.9);
    for (let i = 0; i < pts.length; i++) {
      const next = (i + 1) % pts.length;
      pdf.line(pts[i].x, pts[i].y, pts[next].x, pts[next].y);
    }
  });

  // Radar legend
  const lx = cx + R + 14;
  let ly = afterTable + 8;
  pdf.setFont('helvetica', 'bold'); pdf.setFontSize(6.5); pdf.setTextColor(42, 42, 30);
  pdf.text(dict.summary.compare, lx, ly);
  ly += 5;
  vcs.forEach((vc, vi) => {
    const [r, g, b] = COLORS[vi % COLORS.length];
    pdf.setFillColor(r, g, b); pdf.rect(lx, ly - 2.5, 8, 3, 'F');
    pdf.setFont('helvetica', 'normal'); pdf.setFontSize(6); pdf.setTextColor(42, 42, 30);
    pdf.text(vc.name, lx + 10, ly);
    ly += 6;
  });

  // Bar chart
  const bx = W * 0.57;
  let by = afterTable + 8;
  const BAR_H = 10, BAR_G = 4, LBL_W = 18, AVAIL = W - bx - LBL_W - 12;

  pdf.setFont('helvetica', 'bold'); pdf.setFontSize(6.5); pdf.setTextColor(42, 42, 30);
  pdf.text(dict.summary.spaceDist, bx, by);
  by += 6;

  vcs.forEach((vc, vi) => {
    const m = vc.metrics;
    const work = m.openSpace, shared = m.confRooms + m.lounge, amenities = m.dining + m.reception;
    const total = Math.max(1, work + shared + amenities);
    const [r, g, b] = COLORS[vi % COLORS.length];
    pdf.setFont('helvetica', 'bold'); pdf.setFontSize(5.5); pdf.setTextColor(r, g, b);
    pdf.text(vc.name.substring(0, 10), bx, by + BAR_H / 2 + 1);
    let ox = bx + LBL_W;
    [
      { v: work / total,      r: 59,  g: 130, b: 246 },
      { v: shared / total,    r: 16,  g: 185, b: 129 },
      { v: amenities / total, r: 245, g: 158, b: 11  },
    ].forEach((seg) => {
      if (seg.v > 0) {
        pdf.setFillColor(seg.r, seg.g, seg.b);
        pdf.rect(ox, by, AVAIL * seg.v, BAR_H, 'F');
        ox += AVAIL * seg.v;
      }
    });
    pdf.setDrawColor(200, 198, 188); pdf.setLineWidth(0.2);
    pdf.rect(bx + LBL_W, by, AVAIL, BAR_H);
    by += BAR_H + BAR_G;
  });

  by += 2;
  [
    { label: dict.summary.work,      r: 59,  g: 130, b: 246 },
    { label: dict.summary.shared,    r: 16,  g: 185, b: 129 },
    { label: dict.summary.amenities, r: 245, g: 158, b: 11  },
  ].forEach((bl, i) => {
    const llx = bx + LBL_W + i * 30;
    pdf.setFillColor(bl.r, bl.g, bl.b); pdf.rect(llx, by, 5, 3, 'F');
    pdf.setFont('helvetica', 'normal'); pdf.setFontSize(5.5); pdf.setTextColor(90, 90, 64);
    pdf.text(bl.label, llx + 6, by + 2.5);
  });

  pdf.setFont('helvetica', 'italic'); pdf.setFontSize(5.5); pdf.setTextColor(150, 148, 135);
  const lines = pdf.splitTextToSize(dict.summary.disclaimer, W - 20);
  pdf.text(lines, W / 2, H - 7, { align: 'center' });
}

export const exportToPDF = async (
  versionCanvases: VersionCanvas[],
  lang: Language,
  project: ProjectDetails,
  mode: 'download' | 'preview' = 'download'
): Promise<string | void> => {
  if (!versionCanvases.length) throw new Error('No version data');

  const dict = t[lang];
  const pdf  = new jsPDF('landscape', 'mm', 'a4');
  const W    = pdf.internal.pageSize.getWidth();
  const H    = pdf.internal.pageSize.getHeight();

  const [gebesaImg, clientImg] = await Promise.all([
    loadImage(GEBESA_LOGO_B64),
    project.clientLogoUrl ? loadImage(project.clientLogoUrl) : Promise.resolve(null),
  ]);

  for (let i = 0; i < versionCanvases.length; i++) {
    if (i > 0) pdf.addPage();
    drawVersionPage(pdf, versionCanvases[i], dict, W, H, gebesaImg, clientImg, project);
  }

  pdf.addPage();
  drawComparisonPage(pdf, versionCanvases, dict, W, H, gebesaImg, clientImg, project, lang);

  if (mode === 'preview') {
    const blob = pdf.output('blob');
    return URL.createObjectURL(blob);
  } else {
    pdf.save(`Gebesa_Report_${project.projectName.replace(/[^a-z0-9]/gi, '_')}.pdf`);
  }
};