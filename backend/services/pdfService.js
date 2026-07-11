import PDFDocument from 'pdfkit';

export const generatePatientPDF = (patient, profile) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: 'A4', margin: 50 });
    const chunks = [];
    doc.on('data', chunk => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    doc.fontSize(20).fillColor('#7c3aed').text('MedCare AI', { align: 'center' });
    doc.fontSize(14).fillColor('#374151').text('Dossier Médical Patient', { align: 'center' });
    doc.moveDown();

    doc.fontSize(12).fillColor('#7c3aed').text('Informations Personnelles');
    doc.fontSize(10).fillColor('#374151');
    doc.text(`Nom: ${patient.name}`);
    doc.text(`Email: ${patient.email}`);
    doc.text(`N° Dossier: ${profile?.medicalRecordNumber || 'N/A'}`);
    doc.text(`Date de naissance: ${profile?.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString('fr-FR') : 'N/A'}`);
    doc.text(`Groupe sanguin: ${profile?.bloodType || 'N/A'}`);
    doc.moveDown();

    if (profile?.allergies?.length) {
      doc.fontSize(12).fillColor('#7c3aed').text('Allergies');
      doc.fontSize(10).fillColor('#374151');
      profile.allergies.forEach(a => doc.text(`• ${a.name} (${a.severity})`));
      doc.moveDown();
    }

    if (profile?.chronicConditions?.length) {
      doc.fontSize(12).fillColor('#7c3aed').text('Conditions Chroniques');
      doc.fontSize(10).fillColor('#374151');
      profile.chronicConditions.forEach(c => doc.text(`• ${c.name} (${c.status})`));
      doc.moveDown();
    }

    if (profile?.bloodPressureHistory?.length) {
      doc.fontSize(12).fillColor('#7c3aed').text('Historique Tension Artérielle');
      doc.fontSize(10).fillColor('#374151');
      profile.bloodPressureHistory.slice(-5).forEach(bp => {
        doc.text(`${new Date(bp.date).toLocaleDateString('fr-FR')}: ${bp.systolic}/${bp.diastolic} mmHg`);
      });
      doc.moveDown();
    }

    doc.fontSize(8).fillColor('#9ca3af').text(`Généré le ${new Date().toLocaleDateString('fr-FR')} par MedCare AI`, 50, doc.page.height - 40, { align: 'center' });
    doc.end();
  });
};
