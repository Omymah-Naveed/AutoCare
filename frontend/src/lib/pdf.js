import { jsPDF } from 'jspdf'
import autoTable from 'jspdf-autotable'

function money(value) {
  return `Rs ${Number(value || 0).toLocaleString('en-PK')}`
}

export function generateServiceReportPDF(booking, user = {}) {
  const doc = new jsPDF()
  const red = [225, 29, 46]
  const dark = [11, 15, 25]
  const muted = [100, 116, 139]
  const services = booking.services?.length
    ? booking.services
    : [{ serviceName: booking.serviceTitle, amount: booking.amount }]
  const customerName = user.name || booking.user?.name || booking.name || booking.customerName || 'AutoCare Customer'
  const email = user.email || booking.user?.email || booking.email || '—'
  const phone = booking.phone || '—'
  const car = `${booking.carTypeLabel || booking.carSubType || 'Car'} · ${booking.model || booking.carModel || '—'}`
  const isCancelled = booking.status === 'Cancelled'

  doc.setFillColor(...dark)
  doc.rect(0, 0, 210, 297, 'F')
  doc.setTextColor(245, 247, 251)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(22)
  doc.text('AutoCare', 18, 24)
  doc.setTextColor(...red)
  doc.text('Service Report', 18, 39)
  doc.setTextColor(203, 213, 225)
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.text('Booking Summary · Estimated Amount · Payment pending at studio', 18, 47)

  doc.setFontSize(10)
  doc.setTextColor(...muted)
  doc.text(`Booking ID: #${booking.id || booking.bookingId || '—'}`, 138, 23)
  doc.text(`Generated: ${new Date().toLocaleDateString('en-GB')}`, 138, 30)

  doc.setDrawColor(51, 65, 85)
  doc.line(18, 57, 192, 57)
  doc.setTextColor(...red)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(11)
  doc.text('CUSTOMER & VEHICLE', 18, 70)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.setTextColor(203, 213, 225)
  doc.text(`Name: ${customerName}`, 18, 82)
  doc.text(`Email: ${email}`, 18, 90)
  doc.text(`Phone: ${phone}`, 18, 98)
  doc.text(`Vehicle: ${car}`, 110, 82)
  doc.text(`Date: ${booking.date || '—'}`, 110, 90)
  doc.text(`Time: ${booking.time || booking.timeSlot || '—'}`, 110, 98)

  autoTable(doc, {
    startY: 115,
    head: [['Service', 'Amount']],
    body: services.map((service) => [service.serviceName || service.title || 'Service', money(service.amount)]),
    theme: 'grid',
    styles: { fillColor: [17, 24, 39], textColor: [203, 213, 225], lineColor: [51, 65, 85], fontSize: 10, cellPadding: 5 },
    headStyles: { fillColor: red, textColor: [255, 255, 255], fontStyle: 'bold' },
    columnStyles: { 1: { halign: 'right' } },
  })

  const finalY = doc.lastAutoTable.finalY + 15
  doc.setFillColor(22, 32, 51)
  doc.roundedRect(18, finalY, 174, 27, 4, 4, 'F')
  doc.setTextColor(203, 213, 225)
  doc.setFontSize(10)
  doc.text('Total estimated amount', 27, finalY + 11)
  doc.setTextColor(...red)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(15)
  doc.text(money(booking.amount), 181, finalY + 12, { align: 'right' })
  doc.setFontSize(10)
  doc.setTextColor(...muted)
  doc.setFont('helvetica', 'normal')
  doc.text('Booking status', 27, finalY + 21)
  doc.setFillColor(...(isCancelled ? [127, 29, 29] : [30, 41, 59]))
  doc.roundedRect(145, finalY + 5, 38, 16, 3, 3, 'F')
  doc.setTextColor(...(isCancelled ? [254, 202, 202] : [226, 232, 240]))
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(9)
  doc.text(booking.status || 'Pending', 164, finalY + 15, { align: 'center' })

  if (isCancelled) {
    doc.setTextColor(248, 113, 113)
    doc.setFont('helvetica', 'bold')
    doc.text('CANCELLED — This booking was cancelled before service.', 18, finalY + 39)
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.text(`Reason: ${booking.cancellationReason || 'Cancelled by customer.'}`, 18, finalY + 47)
  }

  doc.setTextColor(...muted)
  doc.setFontSize(9)
  doc.text(isCancelled ? 'Cancellation recorded for your complete AutoCare service history.' : 'Thank you for choosing AutoCare. Built for cars. Driven by care.', 18, 282)
  doc.text('AutoCare Studio · Gulberg III, Lahore', 18, 289)
  doc.save(`AutoCare-${booking.id || booking.bookingId || 'service-report'}.pdf`)
}

export function generateAdminOverviewPDF({ stats, recentBookings = [] }) {
  const doc = new jsPDF()
  const red = [225, 29, 46]
  doc.setFillColor(11, 15, 25)
  doc.rect(0, 0, 210, 297, 'F')
  doc.setTextColor(245, 247, 251)
  doc.setFont('helvetica', 'bold')
  doc.setFontSize(22)
  doc.text('AutoCare', 18, 24)
  doc.setTextColor(...red)
  doc.text('Admin Overview Report', 18, 39)
  doc.setTextColor(148, 163, 184)
  doc.setFont('helvetica', 'normal')
  doc.setFontSize(10)
  doc.text(`Generated: ${new Date().toLocaleDateString('en-GB')}`, 18, 48)
  doc.text('Workshop performance summary', 18, 55)

  autoTable(doc, {
    startY: 70,
    head: [['Metric', 'Value']],
    body: [
      ['Total bookings', stats.total],
      ['Pending requests', stats.pending],
      ['Confirmed bookings', stats.confirmed],
      ['Completed services', stats.completed],
      ['Completed revenue', money(stats.revenue)],
      ['Scheduled today', stats.today],
    ],
    theme: 'grid',
    styles: { fillColor: [17, 24, 39], textColor: [203, 213, 225], lineColor: [51, 65, 85], fontSize: 10, cellPadding: 5 },
    headStyles: { fillColor: red, textColor: [255, 255, 255], fontStyle: 'bold' },
  })

  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 16,
    head: [['Booking', 'Customer', 'Date', 'Status', 'Amount']],
    body: recentBookings.map((booking) => [booking.id || booking.bookingId, booking.name || booking.customerName, booking.date || '—', booking.status || 'Pending', money(booking.amount)]),
    theme: 'grid',
    styles: { fillColor: [17, 24, 39], textColor: [203, 213, 225], lineColor: [51, 65, 85], fontSize: 9, cellPadding: 4 },
    headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255], fontStyle: 'bold' },
  })
  doc.setTextColor(100, 116, 139)
  doc.setFontSize(9)
  doc.text('AutoCare Studio · Internal administration report', 18, 285)
  doc.save(`AutoCare-admin-overview-${new Date().toISOString().slice(0, 10)}.pdf`)
}
