// controllers/ticketController.js
import PDFDocument from 'pdfkit';
import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import archiver from 'archiver';
import { Order, Ticket } from '../model/schema.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


export const downloadTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const userId = req.user.id;

    // Find ticket with populated data
    const ticket = await Ticket.findById(ticketId)
      .populate('event', 'title startDate venue image')
      .populate('user', 'name email')
      .populate({
        path: 'event',
        populate: {
          path: 'venue',
          select: 'name address city'
        }
      });

    if (!ticket) {
      return res.status(404).json({
        success: false,
        message: 'Ticket not found'
      });
    }

    // Check if user owns the ticket
    if (ticket.user._id.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to download this ticket'
      });
    }

    // Generate QR code data
    const qrData = JSON.stringify({
      ticketId: ticket._id,
      ticketCode: ticket.ticketCode,
      eventId: ticket.event._id,
      userId: ticket.user._id,
      timestamp: new Date().toISOString()
    });

    // Generate QR code as base64
    const qrCodeBase64 = await QRCode.toDataURL(qrData);

    // Create PDF document
    const doc = new PDFDocument({
      size: 'A4',
      margin: 50,
      info: {
        Title: `Ticket - ${ticket.event.title}`,
        Author: 'EventTicketing System',
        Subject: `Event Ticket for ${ticket.event.title}`
      }
    });

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename="Ticket-${ticket.ticketCode}.pdf"`);

    doc.pipe(res);

    addTicketDesign(doc, ticket, qrCodeBase64);
    doc.end();

  } catch (error) {
    console.error('Download ticket error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error downloading ticket'
    });
  }
};


export const downloadOrderTickets = async (req, res) => {
  try {
    const { orderId } = req.params;
    const userId = req.user.id;

    // Find order with tickets
    const order = await Order.findById(orderId)
      .populate('event', 'title startDate')
      .populate({
        path: 'tickets',
        populate: [
          {
            path: 'event',
            select: 'title startDate venue image',
            populate: {
              path: 'venue',
              select: 'name address city'
            }
          },
          {
            path: 'user',
            select: 'name email'
          }
        ]
      });

    if (!order) {
      return res.status(404).json({
        success: false,
        message: 'Order not found'
      });
    }

    // Check if user owns the order
    if (order.user.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to download these tickets'
      });
    }
   
    const archive = archiver('zip', {
      zlib: { level: 9 }
    });

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="Tickets-Order-${order.orderNumber}.zip"`);

    archive.pipe(res);

    // Generate PDF for each ticket and add to archive
    for (const ticket of order.tickets) {
      const pdfBuffer = await generateTicketPDF(ticket);
      archive.append(pdfBuffer, { name: `Ticket-${ticket.ticketCode}.pdf` });
    }

    archive.finalize();

  } catch (error) {
    console.error('Download order tickets error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error downloading tickets'
    });
  }
};

// Helper function to generate PDF buffer
const generateTicketPDF = async (ticket) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Generate QR code
      const qrData = JSON.stringify({
        ticketId: ticket._id,
        ticketCode: ticket.ticketCode,
        eventId: ticket.event._id,
        userId: ticket.user._id
      });
      
      const qrCodeBase64 = await QRCode.toDataURL(qrData);

      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks = [];

      doc.on('data', chunk => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));

      addTicketDesign(doc, ticket, qrCodeBase64);

      doc.end();
    } catch (error) {
      reject(error);
    }
  });
};

const addTicketDesign = (doc, ticket, qrCodeBase64) => {
  const { event, user, ticketType, price, ticketCode } = ticket;
  const eventDate = new Date(event.startDate);
  

  doc.rect(0, 0, doc.page.width, doc.page.height)
    .fillColor('#f0fdf4')
    .fill();

  doc.fontSize(28).font('Helvetica-Bold').fillColor('#15803d')
    .text('EVENT TICKET', 50, 50, { align: 'center' });

  doc.moveTo(50, 90).lineTo(doc.page.width - 50, 90)
    .lineWidth(2).strokeColor('#15803d').stroke();

  doc.fontSize(22).font('Helvetica-Bold').fillColor('#000')
    .text(event.title, 50, 120, { align: 'center', width: doc.page.width - 100 });

  const boxY = 180;
  const boxWidth = doc.page.width - 100;
  const boxHeight = 250;

  doc.roundedRect(50, boxY, boxWidth, boxHeight, 10)
    .fillColor('#ffffff')
    .fill()
    .strokeColor('#d1fae5')
    .lineWidth(2)
    .stroke();

  doc.fontSize(12).font('Helvetica').fillColor('#6b7280')
    .text('EVENT DETAILS', 70, boxY + 30);

  doc.fontSize(14).font('Helvetica-Bold').fillColor('#000')
    .text('Date:', 70, boxY + 60);
  doc.fontSize(12).font('Helvetica').fillColor('#374151')
    .text(eventDate.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }), 70, boxY + 80);

  doc.fontSize(14).font('Helvetica-Bold').fillColor('#000')
    .text('Time:', 70, boxY + 110);
  doc.fontSize(12).font('Helvetica').fillColor('#374151')
    .text(eventDate.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    }), 70, boxY + 130);

  if (event.venue) {
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#000')
      .text('Venue:', 70, boxY + 160);
    doc.fontSize(12).font('Helvetica').fillColor('#374151')
      .text(event.venue.name, 70, boxY + 180, { width: 200 });
    doc.fontSize(10).fillColor('#6b7280')
      .text(`${event.venue.address || ''}, ${event.venue.city || ''}`, 70, boxY + 200);
  }

  const rightColumnX = 300;

  doc.fontSize(12).font('Helvetica').fillColor('#6b7280')
    .text('TICKET DETAILS', rightColumnX, boxY + 30);

  // Ticket Code
  doc.fontSize(14).font('Helvetica-Bold').fillColor('#000')
    .text('Ticket Code:', rightColumnX, boxY + 60);
  doc.fontSize(16).font('Helvetica-Bold').fillColor('#15803d')
    .text(ticketCode, rightColumnX, boxY + 80);

  // Ticket Type
  doc.fontSize(14).font('Helvetica-Bold').fillColor('#000')
    .text('Ticket Type:', rightColumnX, boxY + 110);
  doc.fontSize(12).font('Helvetica').fillColor('#374151')
    .text(ticketType.toUpperCase(), rightColumnX, boxY + 130);

  // Price
  doc.fontSize(14).font('Helvetica-Bold').fillColor('#000')
    .text('Price:', rightColumnX, boxY + 160);
  doc.fontSize(16).font('Helvetica-Bold').fillColor('#15803d')
    .text(`$${price.toFixed(2)}`, rightColumnX, boxY + 180);

  // Attendee
  doc.fontSize(14).font('Helvetica-Bold').fillColor('#000')
    .text('Attendee:', rightColumnX, boxY + 210);
  doc.fontSize(12).font('Helvetica').fillColor('#374151')
    .text(user.name, rightColumnX, boxY + 230);

  // QR Code
  const qrSize = 120;
  const qrX = (doc.page.width - qrSize) / 2;
  const qrY = boxY + boxHeight + 40;

  // QR Code background
  doc.roundedRect(qrX - 10, qrY - 10, qrSize + 20, qrSize + 20, 10)
    .fillColor('#ffffff')
    .fill();

  // Convert base64 to image buffer and embed
  const qrBuffer = Buffer.from(qrCodeBase64.split(',')[1], 'base64');
  
  try {
    doc.image(qrBuffer, qrX, qrY, { 
      width: qrSize, 
      height: qrSize,
      fit: [qrSize, qrSize],
      align: 'center',
      valign: 'center'
    });
  } catch (error) {
    console.error('Error embedding QR code:', error);
    // Fallback: Draw a placeholder square
    doc.rect(qrX, qrY, qrSize, qrSize)
      .fillColor('#e5e7eb')
      .fill()
      .strokeColor('#9ca3af')
      .stroke();
    
    doc.fontSize(10).fillColor('#6b7280')
      .text('QR Code', qrX, qrY + qrSize/2 - 5, { 
        width: qrSize, 
        align: 'center' 
      });
  }

  // Scan instruction
  doc.fontSize(10).font('Helvetica').fillColor('#6b7280')
    .text('Scan QR code at entrance', qrX, qrY + qrSize + 20, {
      width: qrSize,
      align: 'center'
    });

  // Footer
  const footerY = qrY + qrSize + 60;
  
  doc.fontSize(10).font('Helvetica').fillColor('#6b7280')
    .text('Terms & Conditions:', 50, footerY);
  
  const terms = [
    '• This ticket is non-transferable and non-refundable',
    '• Please arrive 30 minutes before the event starts',
    '• Valid ID required for entry',
    '• Management reserves the right to refuse admission'
  ];
  
  terms.forEach((term, index) => {
    doc.fontSize(8).fillColor('#9ca3af')
      .text(term, 50, footerY + 15 + (index * 15));
  });

  doc.save();
  doc.opacity(0.05);
  doc.fontSize(60).font('Helvetica-Bold').fillColor('#000')
    .text(ticketCode, 50, doc.page.height / 2, {
      width: doc.page.width - 100,
      align: 'center',
      angle: 45
    });
  doc.restore();

  doc.save();
  doc.translate(doc.page.width - 100, 100);
  doc.rotate(-45);
  doc.fontSize(20).font('Helvetica-Bold').fillColor('#15803d')
    .text('VALID', -40, -10);
  doc.restore();
};