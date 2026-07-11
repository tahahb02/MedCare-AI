const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const MISTRAL_API_KEY = process.env.MISTRAL_API_KEY;

const SYSTEM_PROMPT_PATIENT = `Tu es MedCare AI, un assistant médical bienveillant pour les patients.
Tu aides à comprendre les résultats d'analyses en langage simple.
Tu expliques les termes médicaux.
Tu prépares le patient pour sa consultation.
Tu ne fais JAMAIS de diagnostic final.
Tu recommandes TOUJOURS de consulter le médecin.
Tu alertes en cas de valeur critique (appeler le 15/112).
Tu fournis des conseils de nutrition et mode de vie.`;

const SYSTEM_PROMPT_DOCTOR = `Tu es MedCare AI Assistant, un outil d'aide à la décision médicale pour les médecins.
Tu aides à l'interprétation des analyses (suggestion, pas remplacement).
Tu proposes des diagnostics différentiels possibles.
Tu suggères des examens complémentaires.
Tu calcules des scores de risque (ASCVD, QRISK, CHA₂DS₂-VASc, etc).
Tu résumes les dossiers patients.
Tu vérifies les interactions médicamenteuses.`;

export const analyzeWithAI = async (prompt, role = 'patient', provider = 'openai') => {
  const systemPrompt = role === 'doctor' ? SYSTEM_PROMPT_DOCTOR : SYSTEM_PROMPT_PATIENT;

  if (provider === 'openai' && OPENAI_API_KEY) {
    try {
      const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: prompt }],
          max_tokens: 2000, temperature: 0.3
        })
      });
      const data = await res.json();
      return { text: data.choices?.[0]?.message?.content || 'Analyse non disponible', provider: 'openai' };
    } catch (e) { console.error('OpenAI error:', e.message); }
  }

  return getFallbackResponse(prompt, role);
};

const keywordResponses = {
  tension: 'La tension artérielle normale est généralement autour de 12/8 cmHg. Consultez votre médecin pour une interprétation personnalisée.',
  glycémie: 'La glycémie à jeun normale est entre 0.70 et 1.10 g/L. Demandez à votre médecin d\'interpréter vos résultats.',
  cholestérol: 'Un bon profil de cholestérol: HDL > 0.40 g/L, LDL < 1.60 g/L, triglycérides < 1.50 g/L.',
  imc: 'L\'IMC normal se situe entre 18.5 et 25. Consultez votre médecin pour un bilan personnalisé.',
  médicament: 'Pour toute question sur vos médicaments, consultez votre médecin ou pharmacien. Ne modifiez jamais un traitement sans avis médical.',
  default: 'Je suis MedCare AI, votre assistant médical. Je peux vous aider à comprendre vos résultats d\'analyses et à préparer votre consultation. Pour toute question urgente, contactez votre médecin ou le 15.'
};

export const getFallbackResponse = (prompt, role = 'patient') => {
  const lower = prompt.toLowerCase();
  for (const [key, response] of Object.entries(keywordResponses)) {
    if (key !== 'default' && lower.includes(key)) return { text: response, provider: 'fallback' };
  }
  return { text: keywordResponses.default, provider: 'fallback' };
};

export const generateDocumentAnalysis = async (documentContent, documentType) => {
  return analyzeWithAI(
    `Analyse ce document médical de type "${documentType}":\n\n${documentContent}\n\nFournis un résumé en langage simple, les paramètres clés avec leur statut (normal/attention/critique), et les actions recommandées.`,
    'patient'
  );
};

export const checkDrugInteractions = async (medications) => {
  return analyzeWithAI(
    `Vérifie les interactions médicamenteuses pour cette liste de médicaments:\n${medications.map(m => `- ${m.name} ${m.dosage} ${m.frequency}`).join('\n')}\n\nListe chaque interaction avec sa sévérité et ta recommandation.`,
    'doctor'
  );
};

export const generateDifferentialDiagnosis = async (symptoms, analyses, history) => {
  return analyzeWithAI(
    `Basé sur ces symptômes: ${symptoms.join(', ')}\nAnalyses: ${analyses}\nAntécédents: ${history}\n\nPropose des diagnostics différentiels avec probabilité et raisonnement.`,
    'doctor'
  );
};
