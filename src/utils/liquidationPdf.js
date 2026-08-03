import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'
import { C } from '../theme'
import { fmtMoney } from './financeFormat'
import { ROLE_LABELS } from './financeDefaults'

const PAGE_W = 595.28
const MARGIN = 40

const MONTH_NAMES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre']
const monthLabel = (monthKey) => {
  const [y, m] = monthKey.split('-').map(Number)
  return `${MONTH_NAMES[m - 1]} ${y}`
}

function drawHeader(doc, title, subtitle) {
  doc.setFillColor(C.bg)
  doc.rect(0, 0, PAGE_W, 110, 'F')

  doc.setTextColor(C.gold)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.text('BULL PARTNERS', MARGIN, 34)

  doc.setFillColor(C.red)
  doc.roundedRect(PAGE_W - MARGIN - 130, 22, 130, 20, 3, 3, 'F')
  doc.setTextColor('#FFFFFF')
  doc.setFontSize(8)
  doc.text('CONFIDENCIAL — USO INTERNO', PAGE_W - MARGIN - 65, 34, { align: 'center' })

  doc.setTextColor('#FFFFFF')
  doc.setFontSize(20)
  doc.setFont('helvetica', 'bold')
  doc.text(title, MARGIN, 68)

  doc.setTextColor(C.muted)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'normal')
  doc.text(subtitle, MARGIN, 88)

  doc.setFillColor(C.gold)
  doc.rect(0, 108, PAGE_W, 3, 'F')
}

function drawFooter(doc, page, totalPages) {
  const h = doc.internal.pageSize.getHeight()
  doc.setFillColor(C.gold)
  doc.rect(0, h - 26, PAGE_W, 3, 'F')
  doc.setTextColor(C.muted)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text(`Página ${page} de ${totalPages}`, PAGE_W / 2, h - 12, { align: 'center' })
  doc.setTextColor(C.red)
  doc.setFont('helvetica', 'bold')
  doc.text('CONFIDENCIAL — NO DISTRIBUIR', PAGE_W / 2, h - 4, { align: 'center' })
}

function sectionTitle(doc, text, y) {
  doc.setFillColor(C.gold)
  doc.rect(MARGIN, y - 9, 4, 12, 'F')
  doc.setTextColor(C.bg)
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.text(text.toUpperCase(), MARGIN + 10, y)
  return y + 20
}

function statCard(doc, x, y, w, label, value, highlight) {
  doc.setFillColor(highlight ? C.bg : '#F2F4F6')
  doc.setDrawColor(highlight ? C.gold : '#DDE3E8')
  doc.roundedRect(x, y, w, 46, 4, 4, 'FD')
  doc.setTextColor(highlight ? C.gold : C.muted)
  doc.setFontSize(8)
  doc.setFont('helvetica', 'normal')
  doc.text(label.toUpperCase(), x + w / 2, y + 16, { align: 'center' })
  doc.setTextColor(highlight ? C.gold : C.bg)
  doc.setFontSize(13)
  doc.setFont('helvetica', 'bold')
  doc.text(value, x + w / 2, y + 33, { align: 'center' })
}

export function buildLiquidacionPdf(calc, roleAssignments) {
  const doc = new jsPDF({ unit: 'pt', format: 'a4' })
  const subtitle = `${calc.clientName} · ${monthLabel(calc.month)}`

  // ---- Page 1 ----
  drawHeader(doc, 'Reporte Interno — Liquidación de Comisiones', subtitle)
  let y = 150
  y = sectionTitle(doc, 'Métricas del período', y)

  const stats = [
    ['Facturación Total', fmtMoney(calc.facturacionTotal), false],
    ['Inversión Pub.', fmtMoney(calc.inversionPub), false],
    ['Base Comisionable', fmtMoney(calc.baseComisionable), true],
    ['ROAS', `${calc.roas.toFixed(1)}x`, false],
    ['Leads Generados', String(calc.leadsGenerados), false],
    ['Nº de Ventas', String(calc.numVentas), false],
    ['% de Cierre', `${calc.tasaCierre.toFixed(1)}%`, false],
    ['Facturación Recurrente', fmtMoney(calc.facturacionRecurrentes), false],
  ]
  const cardW = (PAGE_W - MARGIN * 2 - 3 * 10) / 4
  stats.forEach(([label, value, hl], i) => {
    const col = i % 4
    const row = Math.floor(i / 4)
    statCard(doc, MARGIN + col * (cardW + 10), y + row * 56, cardW, label, value, hl)
  })
  y += 56 * 2 + 20

  y = sectionTitle(doc, 'Ventas del período', y)
  const ventasRows = [...calc.ventasNuevas.map((v) => ({ ...v, recurrente: false })), ...calc.ventasRecurrentes.map((v) => ({ ...v, recurrente: true }))]
    .sort((a, b) => (a.fecha || '').localeCompare(b.fecha || ''))
  autoTable(doc, {
    startY: y,
    margin: { left: MARGIN, right: MARGIN },
    head: [['Fecha', 'Nombre del cliente', 'Celular', 'Ad Name', 'Tipo', 'Facturación']],
    body: ventasRows.map((v) => [v.fecha, v.nombre, v.celular, v.adName, v.recurrente ? 'Recurrente' : 'Nueva', fmtMoney(v.monto)]),
    headStyles: { fillColor: C.bg, textColor: '#FFFFFF', fontSize: 8 },
    styles: { fontSize: 8, cellPadding: 5 },
    columnStyles: { 5: { halign: 'right' } },
  })

  drawFooter(doc, 1, 2)

  // ---- Page 2 ----
  doc.addPage()
  drawHeader(doc, 'Reporte Interno — Liquidación de Comisiones', subtitle)
  y = 150
  y = sectionTitle(doc, 'Desglose de comisión', y)

  doc.setTextColor(C.bg)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text(`Facturación ventas nuevas: ${fmtMoney(calc.facturacionNuevas)}   —   Inversión pub.: ${fmtMoney(calc.inversionPub)}   —   Base comisionable: ${fmtMoney(calc.baseComisionable)}`, MARGIN, y)
  y += 20

  autoTable(doc, {
    startY: y,
    margin: { left: MARGIN, right: MARGIN },
    head: [['Tramo (ventas nuevas)', 'Base aplicada', '%', 'Subtotal']],
    body: calc.comisionNuevas.breakdown.map((b) => [`${fmtMoney(b.min)} – ${fmtMoney(b.max)}`, fmtMoney(b.baseAplicada), `${(b.rate * 100).toFixed(1)}%`, fmtMoney(b.monto)]),
    headStyles: { fillColor: C.bg, textColor: '#FFFFFF', fontSize: 8 },
    styles: { fontSize: 8, cellPadding: 5 },
    columnStyles: { 3: { halign: 'right' } },
  })
  y = doc.lastAutoTable.finalY + 16

  if (calc.recurrenciaActiva) {
    doc.setFontSize(10)
    doc.text(`Comisión ventas recurrentes: ${fmtMoney(calc.facturacionRecurrentes)} × ${(calc.recurrenciaPct * 100).toFixed(1)}% = ${fmtMoney(calc.comisionRecurrente)}`, MARGIN, y)
    y += 18
  }

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(12)
  doc.text(`COMISIÓN TOTAL A COBRAR: ${fmtMoney(calc.comisionTotal)}`, MARGIN, y)
  y += 26

  y = sectionTitle(doc, 'Distribución interna del equipo', y)
  autoTable(doc, {
    startY: y,
    margin: { left: MARGIN, right: MARGIN },
    head: [['Tramo', 'Base aplicada', '% Equipo', 'Subtotal']],
    body: calc.equipoBull.breakdown.map((b) => [`${fmtMoney(b.min)} – ${fmtMoney(b.max)}`, fmtMoney(b.baseAplicada), `${(b.rate * 100).toFixed(1)}%`, fmtMoney(b.monto)]),
    headStyles: { fillColor: C.bg, textColor: '#FFFFFF', fontSize: 8 },
    styles: { fontSize: 8, cellPadding: 5 },
    columnStyles: { 3: { halign: 'right' } },
  })
  y = doc.lastAutoTable.finalY + 16

  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text(`FONDO TOTAL DEL EQUIPO: ${fmtMoney(calc.fondoEquipo)}   (Fondo de Bull: ${fmtMoney(calc.fondoBull)})`, MARGIN, y)
  y += 22

  autoTable(doc, {
    startY: y,
    margin: { left: MARGIN, right: MARGIN },
    head: [['Rol', 'Nombre', '%', 'Monto']],
    body: roleAssignments
      .filter((a) => a.collaboratorId)
      .map((a) => [ROLE_LABELS[a.role] || a.role, a.collaboratorName, `${(a.pct * 100).toFixed(1)}%`, fmtMoney(a.monto)]),
    headStyles: { fillColor: C.bg, textColor: '#FFFFFF', fontSize: 8 },
    styles: { fontSize: 8, cellPadding: 5 },
    columnStyles: { 3: { halign: 'right' } },
  })

  drawFooter(doc, 2, 2)

  return doc
}

export function downloadLiquidacionPdf(calc, roleAssignments) {
  const doc = buildLiquidacionPdf(calc, roleAssignments)
  doc.save(`Liquidacion_${calc.clientName.replace(/\s+/g, '_')}_${calc.month}.pdf`)
}
