export const calculateHealthScore = ({ sleepHours = 7, sleepQuality = 3, mood = 3, painLevel = 0, energyLevel = 3, exerciseMinutes = 0, waterIntake = 4, stressLevel = 3, medicationAdherence = 100 }) => {
  const components = [
    { name: 'sommeil', weight: 0.2, score: Math.min(100, (sleepHours / 8) * 50 + (sleepQuality / 5) * 50) },
    { name: 'humeur', weight: 0.15, score: (mood / 5) * 100 },
    { name: 'activité_physique', weight: 0.2, score: Math.min(100, (exerciseMinutes / 45) * 100) },
    { name: 'douleur', weight: 0.15, score: Math.max(0, 100 - (painLevel / 10) * 100) },
    { name: 'énergie', weight: 0.1, score: (energyLevel / 5) * 100 },
    { name: 'hydratation', weight: 0.1, score: Math.min(100, (waterIntake / 8) * 100) },
    { name: 'adhérence_médicaments', weight: 0.1, score: medicationAdherence }
  ];

  const totalScore = components.reduce((sum, c) => sum + c.score * c.weight, 0);
  return { score: Math.round(totalScore), components };
};

export const getScoreLabel = (score) => {
  if (score >= 80) return { label: 'Excellent', color: 'green' };
  if (score >= 60) return { label: 'Bon', color: 'yellow' };
  if (score >= 40) return { label: 'Moyen', color: 'orange' };
  return { label: 'À améliorer', color: 'red' };
};
