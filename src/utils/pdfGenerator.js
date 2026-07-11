const openPrintWindow = (htmlContent) => {
  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    alert('Veuillez autoriser les popups pour générer le PDF.');
    return;
  }
  printWindow.document.write(htmlContent);
  printWindow.document.close();
  printWindow.focus();
  setTimeout(() => printWindow.print(), 500);
};

const baseStyles = `
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 40px; color: #1a1a1a; line-height: 1.6; }
    h1 { color: #0d9488; border-bottom: 2px solid #0d9488; padding-bottom: 8px; font-size: 22px; }
    h2 { color: #0f766e; font-size: 16px; margin-top: 20px; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px; }
    .logo { font-size: 24px; font-weight: bold; color: #0d9488; }
    .meta { text-align: right; font-size: 13px; color: #666; }
    table { width: 100%; border-collapse: collapse; margin: 12px 0; }
    th, td { border: 1px solid #ddd; padding: 8px 12px; text-align: left; font-size: 13px; }
    th { background-color: #f0fdfa; color: #0f766e; font-weight: 600; }
    .badge { display: inline-block; padding: 2px 10px; border-radius: 12px; font-size: 12px; font-weight: 600; }
    .badge-green { background: #dcfce7; color: #166534; }
    .badge-red { background: #fee2e2; color: #991b1b; }
    .badge-yellow { background: #fef9c3; color: #854d0e; }
    .section { margin: 16px 0; padding: 12px; background: #f8fafc; border-radius: 8px; }
    .footer { margin-top: 32px; padding-top: 12px; border-top: 1px solid #ddd; font-size: 11px; color: #999; text-align: center; }
    @media print { body { margin: 20px; } }
  </style>
`;

export const generatePatientPDF = (patientData) => {
  const {
    firstName = '', lastName = '', dateOfBirth = '', gender = '',
    bloodType = '', phone = '', email = '', address = '',
    medicalHistory = [], allergies = [], currentMedications = [],
    emergencyContact = {}
  } = patientData;

  const html = `
    <!DOCTYPE html>
    <html lang="fr">
    <head><meta charset="UTF-8"><title>Fiche Patient - ${firstName} ${lastName}</title>${baseStyles}</head>
    <body>
      <div class="header">
        <div>
          <div class="logo">MedCare AI</div>
          <div>Fiche Patient</div>
        </div>
        <div class="meta">
          <div>Date: ${new Date().toLocaleDateString('fr-FR')}</div>
          <div>Réf: PAT-${Date.now().toString(36).toUpperCase()}</div>
        </div>
      </div>

      <h1>${firstName} ${lastName}</h1>

      <div class="section">
        <h2>Informations Personnelles</h2>
        <table>
          <tr><td><strong>Nom complet</strong></td><td>${lastName} ${firstName}</td></tr>
          <tr><td><strong>Date de naissance</strong></td><td>${dateOfBirth || 'N/A'}</td></tr>
          <tr><td><strong>Sexe</strong></td><td>${gender || 'N/A'}</td></tr>
          <tr><td><strong>Groupe sanguin</strong></td><td>${bloodType || 'N/A'}</td></tr>
          <tr><td><strong>Téléphone</strong></td><td>${phone || 'N/A'}</td></tr>
          <tr><td><strong>Email</strong></td><td>${email || 'N/A'}</td></tr>
          <tr><td><strong>Adresse</strong></td><td>${address || 'N/A'}</td></tr>
        </table>
      </div>

      ${allergies.length ? `
      <div class="section">
        <h2>Allergies</h2>
        <p>${allergies.join(', ')}</p>
      </div>` : ''}

      ${currentMedications.length ? `
      <div class="section">
        <h2>Médicaments Actuels</h2>
        <ul>${currentMedications.map(m => `<li>${typeof m === 'string' ? m : m.name || m}</li>`).join('')}</ul>
      </div>` : ''}

      ${medicalHistory.length ? `
      <div class="section">
        <h2>Antécédents Médicaux</h2>
        <table>
          <tr><th>Date</th><th>Diagnostic</th><th>Notes</th></tr>
          ${medicalHistory.map(h => `
            <tr>
              <td>${h.date || 'N/A'}</td>
              <td>${h.diagnosis || h.condition || 'N/A'}</td>
              <td>${h.notes || ''}</td>
            </tr>
          `).join('')}
        </table>
      </div>` : ''}

      ${emergencyContact.name ? `
      <div class="section">
        <h2>Contact d'Urgence</h2>
        <table>
          <tr><td><strong>Nom</strong></td><td>${emergencyContact.name}</td></tr>
          <tr><td><strong>Lien</strong></td><td>${emergencyContact.relationship || 'N/A'}</td></tr>
          <tr><td><strong>Téléphone</strong></td><td>${emergencyContact.phone || 'N/A'}</td></tr>
        </table>
      </div>` : ''}

      <div class="footer">
        Document généré par MedCare AI — ${new Date().toLocaleDateString('fr-FR')} — Confidentiel
      </div>
    </body></html>
  `;

  openPrintWindow(html);
};

export const generatePrescriptionPDF = (prescriptionData) => {
  const {
    patientName = '', doctorName = '', date = '',
    medications = [], diagnosis = '', notes = '',
    doctorSpecialty = '', doctorPhone = ''
  } = prescriptionData;

  const html = `
    <!DOCTYPE html>
    <html lang="fr">
    <head><meta charset="UTF-8"><title>Ordonnance - ${patientName}</title>${baseStyles}</head>
    <body>
      <div class="header">
        <div>
          <div class="logo">MedCare AI</div>
          <div>Ordonnance Médicale</div>
        </div>
        <div class="meta">
          <div>Date: ${date || new Date().toLocaleDateString('fr-FR')}</div>
          <div>Dr. ${doctorName}</div>
          ${doctorSpecialty ? `<div>${doctorSpecialty}</div>` : ''}
          ${doctorPhone ? `<div>${doctorPhone}</div>` : ''}
        </div>
      </div>

      <h1>Ordonnance</h1>

      <div class="section">
        <h2>Patient</h2>
        <p><strong>${patientName}</strong></p>
      </div>

      ${diagnosis ? `
      <div class="section">
        <h2>Diagnostic</h2>
        <p>${diagnosis}</p>
      </div>` : ''}

      <div class="section">
        <h2>Prescriptions</h2>
        <table>
          <tr><th>Médicament</th><th>Dosage</th><th>Fréquence</th><th>Durée</th><th>Instructions</th></tr>
          ${medications.map(m => `
            <tr>
              <td><strong>${m.name || m}</strong></td>
              <td>${m.dosage || '—'}</td>
              <td>${m.frequency || '—'}</td>
              <td>${m.duration || '—'}</td>
              <td>${m.instructions || ''}</td>
            </tr>
          `).join('')}
        </table>
      </div>

      ${notes ? `
      <div class="section">
        <h2>Notes</h2>
        <p>${notes}</p>
      </div>` : ''}

      <div class="footer">
        Document généré par MedCare AI — ${new Date().toLocaleDateString('fr-FR')} — Ordonnance valable 30 jours
      </div>
    </body></html>
  `;

  openPrintWindow(html);
};

export const generateLabReportPDF = (documentData) => {
  const {
    patientName = '', doctorName = '', date = '',
    labName = '', results = [], summary = '',
    reportTitle = 'Rapport de Laboratoire'
  } = documentData;

  const getStatusBadge = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'normal' || s === 'normal' || s === 'élevé' || s === 'bas') {
      return `<span class="badge badge-green">Normal</span>`;
    }
    if (s === 'élevé' || s === 'anormal' || s === 'haut') {
      return `<span class="badge badge-red">Élevé</span>`;
    }
    if (s === 'bas' || s === 'inférieur') {
      return `<span class="badge badge-yellow">Bas</span>`;
    }
    return `<span class="badge badge-green">${status || 'N/A'}</span>`;
  };

  const html = `
    <!DOCTYPE html>
    <html lang="fr">
    <head><meta charset="UTF-8"><title>${reportTitle} - ${patientName}</title>${baseStyles}</head>
    <body>
      <div class="header">
        <div>
          <div class="logo">MedCare AI</div>
          <div>${reportTitle}</div>
        </div>
        <div class="meta">
          <div>Date: ${date || new Date().toLocaleDateString('fr-FR')}</div>
          ${labName ? `<div>Laboratoire: ${labName}</div>` : ''}
          ${doctorName ? `<div>Prescrit par: Dr. ${doctorName}</div>` : ''}
        </div>
      </div>

      <h1>${reportTitle}</h1>

      <div class="section">
        <h2>Patient</h2>
        <p><strong>${patientName}</strong></p>
      </div>

      ${results.length ? `
      <div class="section">
        <h2>Résultats</h2>
        <table>
          <tr><th>Analyse</th><th>Résultat</th><th>Unité</th><th>Valeurs Réf.</th><th>Statut</th></tr>
          ${results.map(r => `
            <tr>
              <td><strong>${r.name || r.test || 'N/A'}</strong></td>
              <td>${r.value || r.result || 'N/A'}</td>
              <td>${r.unit || ''}</td>
              <td>${r.referenceRange || r.reference || ''}</td>
              <td>${getStatusBadge(r.status)}</td>
            </tr>
          `).join('')}
        </table>
      </div>` : ''}

      ${summary ? `
      <div class="section">
        <h2>Résumé</h2>
        <p>${summary}</p>
      </div>` : ''}

      <div class="footer">
        Document généré par MedCare AI — ${new Date().toLocaleDateString('fr-FR')} — Résultats à interpréter cliniquement
      </div>
    </body></html>
  `;

  openPrintWindow(html);
};
