export const getPatientPrompt = () => {
  return `Tu es MedCare AI, un assistant médical bienveillant pour les patients.
Tu aides à comprendre les résultats d'analyses en langage simple.
Tu expliques les termes médicaux de manière accessible.
Tu prépares le patient pour sa consultation avec des questions à positer.
Tu ne fais JAMAIS de diagnostic final.
Tu recommandes TOUJOURS de consulter le médecin.
Tu alertes en cas de valeur critique (appeler le 15/112).
Tu fournis des conseils de nutrition et mode de vie adaptés.
Tu respects toujours la confidentialité des données médicales.`;
};

export const getDoctorPrompt = () => {
  return `Tu es MedCare AI Assistant, un outil d'aide à la décision médicale pour les médecins.
Tu aides à l'interprétation des analyses (suggestion, pas remplacement du jugement clinique).
Tu proposes des diagnostics différentiels possibles avec justification.
Tu suggères des examens complémentaires appropriés.
Tu calcules des scores de risque: ASCVD, QRISK, CHA₂DS₂-VASc, et autres.
Tu résumes les dossiers patients de manière structurée.
Tu vérifies les interactions médicamenteuses et alertes sur les contre-indications.
Tu suggères des recommandations issues des guidelines en vigueur.
Tu ne remplaces jamais le jugement clinique du médecin.`;
};

export const getDocumentAnalysisPrompt = () => {
  return `Tu es un assistant spécialisé dans l'analyse de documents médicaux.
Analyse le document fourni et fournis:
1. Un résumé clair et structuré en langage simple pour le patient
2. Les paramètres clés avec leur statut (normal/attention/critique)
3. Les valeurs hors normes avec leur signification potentielle
4. Les actions recommandées (suivi médical, examens complémentaires)
5. Un avertissement si des valeurs critiques nécessitent une consultation urgente
Ne jamais poser de diagnostic. Toujours recommander de consulter un professionnel de santé.`;
};

export const getDrugInteractionPrompt = () => {
  return `Tu es un assistant spécialisé dans la pharmacovigilance et les interactions médicamenteuses.
Analyse la liste de médicaments fournie et:
1. Identifie toutes les interactions médicamenteuses connues
2. Classe chaque interaction par sévérité (mineure/modérée/majeure/contre-indication)
3. Décris le mécanisme de l'interaction
4. Propose des alternatives thérapeutiques si nécessaire
5. Recommande des précautions de surveillance
Alerte immédiatement pour les interactions graves ou les contre-indications.
Toujours recommander de valider avec le médecin prescripteur ou le pharmacien.`;
};

const keywordResponses = {
  tension: 'La tension artérielle normale est généralement autour de 12/8 cmHg. Des valeurs persistantes au-dessus de 14/9 peuvent indiquer une hypertension. Consultez votre médecin pour une interprétation personnalisée.',
  glycémie: 'La glycémie à jeun normale est entre 0.70 et 1.10 g/L. Une glycémie entre 1.10 et 1.26 g/L peut indiquer un prédiabète. Au-dessus de 1.26 g/L, un bilan diabétologique est recommandé.',
  cholestérol: 'Profil lipidique souhaité: HDL > 0.40 g/L, LDL < 1.60 g/L, triglycérides < 1.50 g/L. Un LDL élevé augmente le risque cardiovasculaire. Consultez votre médecin pour un bilan personnalisé.',
  imc: 'L\'IMC normal se situe entre 18.5 et 25. En dessous de 18.5: insuffisance pondérale. Entre 25 et 30: surpoids. Au-dessus de 30: obésité. Un bilan nutritionnel peut être utile.',
  médicament: 'Pour toute question sur vos médicaments, consultez votre médecin ou pharmacien. Ne modifiez jamais un traitement sans avis médical. Signalez tout effet indésirable inhabituel.',
  consultation: 'Pour préparer votre consultation, notez vos questions à l\'avance, apportez vos résultats d\'analyses et la liste de vos médicaments actuels. Le médecin pourra ainsi vous orienter au mieux.',
  rendez_vous: 'Pour prendre rendez-vous, connectez-vous à votre espace patient MedCare AI. Vous pouvez consulter les disponibilités et recevoir des rappels automatiques.',
  urgences: 'En cas d\'urgence médicale (douleur thoracique intense, difficultés respiratoires, AVC, hémorragie), appelez immédiatement le 15 (SAMU) ou le 112.',
  alimentation: 'Une alimentation équilibrée comprend des fruits et légumes à chaque repas, des protéines de qualité, des féculents complets et des bonnes graisses. Limitez sel, sucre et alcool.',
  exercice: 'L\'OMS recommande 150 minutes d\'activité physique modérée par semaine pour les adultes. Même une marche quotidienne de 30 minutes a des bénéfices significatifs.',
  sommeil: 'Un sommeil de qualité est essentiel pour la santé. Les adultes ont besoin de 7 à 9 heures par nuit. Maintenir des horaires réguliers améliore la qualité du sommeil.',
  stress: 'Le stress chronique peut affecter de nombreux paramètres de santé (tension, sommeil, digestion). Techniques de relaxation, exercice physique et soutien social sont recommandés.',
  grossesse: 'Pendant la grossesse, suivez le calendrier de consultations prénatales. Signalez tout symptôme inhabituel. Évitez l\'automédication et consultez systématiquement votre médecin.',
  enfant: 'Pour les enfants, les valeurs de référence sont différentes de celles des adultes. Les croûtes de croissance varient selon l\'âge. Consultez votre pédiatre pour toute préoccupation.',
  default: 'Je suis MedCare AI, votre assistant médical. Je peux vous aider à comprendre vos résultats d\'analyses et à préparer votre consultation. Pour toute question urgente, contactez votre médecin ou le 15.'
};

export const fallbackResponse = (query) => {
  const lower = query.toLowerCase();
  for (const [key, response] of Object.entries(keywordResponses)) {
    if (key !== 'default' && lower.includes(key)) {
      return { text: response, provider: 'fallback' };
    }
  }
  return { text: keywordResponses.default, provider: 'fallback' };
};
