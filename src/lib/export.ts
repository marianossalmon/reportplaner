import jsPDF from 'jspdf';
import { Metrics, Language, ProjectDetails, WorkspaceVersion } from '../types';
import { t } from './i18n';
import { useWorkspaceStore } from '../store/useWorkspaceStore';
import { calculateMetrics } from './metrics';

export const exportToPDF = async (elementId: string, metrics: Metrics, lang: Language, project: ProjectDetails) => {
  const dict = t[lang];

  try {
    const parentElement = document.getElementById(elementId);
    if (!parentElement) throw new Error('Canvas container not found');

    const canvasElements = parentElement.getElementsByTagName('canvas');
    if (canvasElements.length === 0) throw new Error('Konva canvas not found');

    // Get the first canvas which is usually the visual layer in Konva
    const canvasElement = canvasElements[0];
    const imgData = canvasElement.toDataURL('image/png');
    
    // Create Landscape A4 format
    const pdf = new jsPDF('landscape', 'mm', 'a4');
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    
    // Page 1: Floor Plan & Sidebar
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(28);
    pdf.setTextColor('#2d2a26');
    pdf.text('Gebesa', 20, 25);

    // Project Info Column
    pdf.setFontSize(10);
    pdf.setTextColor('#888888');
    pdf.setFont('helvetica', 'normal');
    pdf.text(`${dict.setup.projectName}:`, 100, 18);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor('#000000');
    pdf.text(project.projectName || 'Sin título', 100, 23);

    // Advisor Info Column
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor('#888888');
    pdf.text(`${dict.setup.advisor}:`, 180, 18);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor('#000000');
    pdf.text(project.advisorName || 'Asesor', 180, 23);

    // Divider Line
    pdf.setDrawColor('#E5E7EB');
    pdf.setLineWidth(0.5);
    pdf.line(20, 30, pdfWidth - 20, 30);

    // --- LEFT SIDEBAR (Metrics) ---
    const sidebarX = 20;
    let sidebarY = 45;
    
    // Total Area
    pdf.setFontSize(24);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor('#2d2a26');
    pdf.text((project.totalArea || 0).toString(), sidebarX, sidebarY);
    pdf.setFontSize(10);
    pdf.setTextColor('#888888');
    pdf.setFont('helvetica', 'normal');
    pdf.text(dict.metrics.areaLabel, sidebarX, sidebarY + 5);
    
    sidebarY += 20;

    const mainMetrics = [
      { val: metrics.seats, label: dict.metrics.seats },
      { val: metrics.openSpace, label: dict.metrics.openSpace },
      { val: metrics.offices, label: dict.metrics.offices },
      { val: metrics.confRooms, label: dict.metrics.confRooms },
      { val: metrics.density, label: dict.metrics.density }
    ];

    mainMetrics.forEach(m => {
      pdf.setFontSize(18);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor('#2d2a26');
      pdf.text(m.val.toString(), sidebarX, sidebarY);
      
      pdf.setFontSize(10);
      pdf.setTextColor('#5A5A40');
      pdf.setFont('helvetica', 'normal');
      pdf.text(m.label, sidebarX, sidebarY + 5);
      sidebarY += 16;
    });

    sidebarY += 5;
    const progressMetrics = [
      { val: metrics.daylight, label: dict.metrics.daylight },
      { val: metrics.privacy, label: dict.metrics.privacy },
      { val: metrics.efficiency, label: dict.metrics.efficiency }
    ];

    progressMetrics.forEach(m => {
      pdf.setFontSize(9);
      pdf.setTextColor('#888888');
      pdf.setFont('helvetica', 'normal');
      pdf.text(m.label, sidebarX, sidebarY);
      
      pdf.setFontSize(9);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor('#2d2a26');
      pdf.text(`${m.val}%`, sidebarX + 35, sidebarY);

      // Draw little background bar
      pdf.setFillColor('#E5E7EB');
      pdf.rect(sidebarX, sidebarY + 2, 45, 2, 'F');
      
      // Draw progress bar
      pdf.setFillColor('#3b82f6'); // blue
      pdf.rect(sidebarX, sidebarY + 2, 45 * (m.val / 100), 2, 'F');

      sidebarY += 12;
    });

    // --- MAIN CANVAS MAP ---
    const imgProps = pdf.getImageProperties(imgData);
    const canvasAspect = imgProps.width / imgProps.height;
    
    // Bounds for map
    const startX = 80;
    const startY = 40;
    const maxWidth = pdfWidth - startX - 20; 
    const maxHeight = pdfHeight - startY - 20; 

    let drawWidth = maxWidth;
    let drawHeight = drawWidth / canvasAspect;

    if (drawHeight > maxHeight) {
      drawHeight = maxHeight;
      drawWidth = drawHeight * canvasAspect;
    }

    // Centered in right area
    const finalX = startX + (maxWidth - drawWidth) / 2;
    const finalY = startY + (maxHeight - drawHeight) / 2;

    pdf.setFillColor(248, 247, 244); 
    pdf.rect(finalX - 2, finalY - 2, drawWidth + 4, drawHeight + 4, 'F');
    pdf.setDrawColor('#E5E2DD');
    pdf.setLineWidth(1);
    pdf.rect(finalX, finalY, drawWidth, drawHeight, 'S');

    pdf.addImage(imgData, 'PNG', finalX, finalY, drawWidth, drawHeight);

    // --- Page 2: Summary ---
    pdf.addPage();
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(18);
    pdf.setTextColor('#2d2a26');
    pdf.text(dict.summary.analysis.toUpperCase(), 20, 25);
    
    pdf.setDrawColor('#E5E7EB');
    pdf.setLineWidth(0.5);
    pdf.line(20, 30, pdfWidth - 20, 30);

    const storeState = useWorkspaceStore.getState();
    const versions = storeState.versions;

    // Panel 1: Table
    pdf.setDrawColor('#E5E2DD');
    pdf.setFillColor('#F8F7F4');
    pdf.roundedRect(20, 35, pdfWidth - 40, 80, 3, 3, 'FD');

    let currentY = 45;
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor('#888888');
    pdf.text('Métrica', 25, currentY);

    const colWidth = 45;
    const startObjX = 80;
    const colors = ['#3b82f6', '#f59e0b', '#10b981', '#6366f1'];

    versions.forEach((v, i) => {
      pdf.setFillColor(colors[i % colors.length]);
      pdf.circle(startObjX + (i * colWidth) - 4, currentY - 1, 2, 'F');
      pdf.setTextColor(colors[i % colors.length]);
      pdf.text(v.name, startObjX + (i * colWidth), currentY);
    });
    
    currentY += 6;
    const mk = ['openSpace', 'offices', 'confRooms', 'density', 'daylight', 'privacy', 'efficiency'] as const;
    const names = [
      dict.metrics.openSpace, dict.metrics.offices, dict.metrics.confRooms,
      dict.metrics.density, dict.metrics.daylight, dict.metrics.privacy, dict.metrics.efficiency
    ];

    mk.forEach((key, rowIdx) => {
      pdf.setDrawColor('#E5E2DD');
      pdf.line(20, currentY - 4, pdfWidth - 20, currentY - 4);
      
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor('#2d2a26');
      pdf.text(names[rowIdx], 25, currentY);

      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor('#5A5A40');
      
      versions.forEach((v, vIdx) => {
        const vMetrics = calculateMetrics(v.elements, lang, project.totalArea || 0);
        let val = (vMetrics[key] ?? 0).toString();
        if (key === 'daylight' || key === 'privacy' || key === 'efficiency') val += '%';
        pdf.text(val, startObjX + (vIdx * colWidth), currentY);
      });
      
      currentY += 9;
    });

    // Panel 2 & 3: Charts
    const currentV = versions[0];
    const cMetrics = calculateMetrics(currentV.elements, lang, project.totalArea || 0);

    // Panel 2: Radar Chart (COMPARAR)
    pdf.setFillColor('#F8F7F4');
    pdf.roundedRect(20, 120, 120, 80, 3, 3, 'FD');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    pdf.setTextColor('#888888');
    pdf.text(dict.summary.compare.toUpperCase(), 25, 128);
    // Draw dot
    pdf.setFillColor(colors[0]);
    pdf.circle(100, 127, 2, 'F');
    pdf.setTextColor(colors[0]);
    pdf.text(currentV.name, 105, 128);

    const radarX = 80;
    const radarY = 165;
    const R = 25;
    
    // Draw 3 grid polygons
    pdf.setDrawColor('#E5E2DD');
    for(let r=1; r<=3; r++) {
      const radius = R * (r/3);
      for(let i=0; i<5; i++) {
        const a1 = (i/5)*Math.PI*2 - Math.PI/2;
        const a2 = ((i+1)/5)*Math.PI*2 - Math.PI/2;
        pdf.line(radarX + Math.cos(a1)*radius, radarY + Math.sin(a1)*radius, radarX + Math.cos(a2)*radius, radarY + Math.sin(a2)*radius);
      }
    }
    // Draw axes
    pdf.setTextColor('#A89F91');
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(8);
    const axes = [
      { name: 'Densidad', val: Math.min(1, cMetrics.density > 0 ? 10/cMetrics.density : 0) },
      { name: 'Luz Nat.', val: cMetrics.daylight/100 },
      { name: 'Privacidad', val: cMetrics.privacy/100 },
      { name: 'Eficiencia', val: cMetrics.efficiency/100 },
      { name: 'Oficinas', val: Math.min(1, cMetrics.offices/10) }
    ];
    for(let i=0; i<5; i++) {
      const a = (i/5)*Math.PI*2 - Math.PI/2;
      const x = radarX + Math.cos(a)*R;
      const y = radarY + Math.sin(a)*R;
      pdf.line(radarX, radarY, x, y);
      
      const lblXArea = radarX + Math.cos(a)*(R+8);
      const lblYArea = radarY + Math.sin(a)*(R+4);
      pdf.text(axes[i].name, lblXArea - 6, lblYArea);
    }
    
    // Draw Data Polygon
    pdf.setFillColor(colors[0]);
    pdf.setDrawColor(colors[0]);
    const pts: any = [];
    axes.forEach((axis, i) => {
      const a = (i/5)*Math.PI*2 - Math.PI/2;
      pts.push([Math.cos(a)*(R*axis.val), Math.sin(a)*(R*axis.val)]);
    });
    
    const lines = [];
    for(let i=1; i<5; i++) {
       lines.push([pts[i][0] - pts[i-1][0], pts[i][1] - pts[i-1][1]]);
    }
    // Close the polygon
    lines.push([pts[0][0] - pts[4][0], pts[0][1] - pts[4][1]]);
    
    // In jsPDF, lines are drawn starting from x, y
    pdf.lines(lines, radarX + pts[0][0], radarY + pts[0][1], [1, 1], 'S', true);
    
    // Add dots at each vertex
    pts.forEach((pt: any) => {
      pdf.setFillColor(colors[0]);
      pdf.circle(radarX + pt[0], radarY + pt[1], 1.5, 'F');
    });

    // Panel 3: Stacked Bar (DISTRIBUCIÓN DE ESPACIO)
    pdf.setFillColor('#F8F7F4');
    pdf.roundedRect(145, 120, 132, 80, 3, 3, 'FD');
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    pdf.setTextColor('#888888');
    pdf.text(dict.summary.spaceDist.toUpperCase(), 150, 128);

    pdf.setFillColor(colors[0]);
    pdf.circle(150, 145, 2, 'F');
    pdf.setTextColor(colors[0]);
    pdf.text(currentV.name, 155, 146);

    // Calculate bar widths
    const totalCap = cMetrics.seats || 1;
    const workW = ((cMetrics.openSpace + cMetrics.offices) / totalCap) * 110;
    const sharedW = ((cMetrics.seats - cMetrics.openSpace - cMetrics.offices) / totalCap) * 110;
    const amenityW = 0; // We keep this 0 for now since we didn't add amenity to metrics
    
    // Fallback if 0
    const wW = workW || 110; 
    const sW = sharedW || 0;
    const aW = amenityW || 0;

    let barX = 150;
    const barY = 155;
    // Work
    pdf.setFillColor(153, 194, 255); // light blue
    pdf.rect(barX, barY, wW, 10, 'F');
    barX += wW;
    // Shared
    pdf.setFillColor(167, 243, 208); // light green
    pdf.rect(barX, barY, sW, 10, 'F');
    barX += sW;
    // Amenity
    pdf.setFillColor(253, 230, 138); // light yellow
    pdf.rect(barX, barY, aW, 10, 'F');
    barX += aW;
    
    // Legend
    pdf.setDrawColor('#E5E2DD');
    pdf.line(150, 185, 260, 185);
    pdf.setFontSize(7);
    pdf.setTextColor('#888888');
    pdf.setFillColor(153, 194, 255); pdf.circle(162, 190, 1.5, 'F'); pdf.text('TRABAJO', 165, 191);
    pdf.setFillColor(167, 243, 208); pdf.circle(192, 190, 1.5, 'F'); pdf.text('COMPARTIDO', 195, 191);
    pdf.setFillColor(253, 230, 138); pdf.circle(232, 190, 1.5, 'F'); pdf.text('AMENIDADES', 235, 191);

    // --- Footer Disclaimer ---
    const disclaimerY = 205;
    pdf.setFont('helvetica', 'normal');
    pdf.setFontSize(6);
    pdf.setTextColor('#A89F91');

    const disclaimerEs = "La información en este informe es únicamente para fines de evaluación y no deberá utilizarse para medir ni escalar dibujos con ningún otro propósito. Todas las dimensiones se proporcionan de buena fe y se creen correctas. Sin embargo, se aclara que cualquier información en este reporte ha sido generada automáticamente basada en los datos proporcionados y Galbo no se hace responsable por su exactitud o idoneidad para un propósito particular.";
    const disclaimerEn = "The information in this report is for evaluation purposes only and shall not be used for measuring or scaling off drawings for any other purpose. All dimensions are given in good faith and are believed to be correct. However, it is clarified that any information in this report was automatically generated based on the provided data and Galbo is not responsible for its accuracy or fitness for a particular purpose.";

    const disclaimer = lang === 'en' ? disclaimerEn : disclaimerEs;
    
    // Split text to fit width
    const splitDisclaimer = pdf.splitTextToSize(disclaimer, pdfWidth - 40);
    pdf.text(splitDisclaimer, 20, disclaimerY);

    pdf.save(`workspace-report-${lang}.pdf`);
  } catch (error) {
    console.error('Error generating PDF', error);
    alert('Error exporting PDF. Please try again.');
  }
};
