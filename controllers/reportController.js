const pool = require('../config/db'); // Import database connection
const PDFDocument = require('pdfkit'); // Import PDFKit for PDF generation
const excel = require('excel4node'); // Import excel4node for Excel generation

// Attendance recording controller
const exportReport = async (req, res) => {
  const { format, eventId, startDate, endDate } = req.query;
  const adminId = req.user.id;
  const role = req.user.role;
  try {
    let query = `
      SELECT u.name AS userName, e.purpose AS eventName, a.time
      FROM attendance a
      JOIN users u ON a.user_id = u.id
      JOIN events e ON a.event_id = e.id
      WHERE 1=1
    `;
    let params = [];
    if (role === 'event_admin') {
      query += ' AND e.admin_id = ?';
      params.push(adminId);
    }
    if (eventId) {
      query += ' AND a.event_id = ?';
      params.push(eventId);
    }
    if (startDate && endDate) {
      query += ' AND a.time BETWEEN ? AND ?';
      params.push(startDate, endDate);
    }
    const [rows] = await pool.query(query, params);

    if (format === 'pdf') {
      const doc = new PDFDocument(); // Create a new PDF document
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename=attendance.pdf');
      doc.pipe(res);
      doc.fontSize(16).text('Attendance Report', { align: 'center' });
      doc.moveDown();
      rows.forEach(row => {
        doc.fontSize(12).text(`${row.userName} - ${row.eventName} - ${new Date(row.time).toLocaleString()}`);
      });
      doc.end();
    } else if (format === 'xlsx') {
      const wb = new excel.Workbook();
      const ws = wb.addWorksheet('Attendance');
      ws.cell(1, 1).string('User');
      ws.cell(1, 2).string('Event');
      ws.cell(1, 3).string('Time');
      rows.forEach((row, i) => {
        ws.cell(i + 2, 1).string(row.userName);
        ws.cell(i + 2, 2).string(row.eventName);
        ws.cell(i + 2, 3).string(new Date(row.time).toLocaleString());
      });
      wb.write(res, 'attendance.xlsx');
    } else {
      res.status(400).json({ message: 'Invalid format' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Error generating report', error: error.message });
  }
};

module.exports = { exportReport };