import express from 'express';
import GamificationProfile from '../models/GamificationProfile.js';
import User from '../models/User.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();
router.use(protect);

const healthArticles = [
  { id: 'h1', title: 'Bien manger au quotidien', category: 'nutrition', content: 'Adoptez une alimentation équilibrée riches en fruits, légumes et protéines.', readTime: 5 },
  { id: 'h2', title: 'L\'importance de l\'exercice physique', category: 'activité physique', content: '30 minutes d\'activité par jour réduisent les risques cardiovasculaires.', readTime: 4 },
  { id: 'h3', title: 'Gérer le stress efficacement', category: 'mental', content: 'Méditation, respiration et sommeil de qualité sont essentiels.', readTime: 6 },
  { id: 'h4', title: 'Comprendre son sommeil', category: 'sommeil', content: 'Un adulte a besoin de 7 à 9 heures de sommeil par nuit.', readTime: 3 },
  { id: 'h5', title: 'Hydratation : les bonnes pratiques', category: 'nutrition', content: 'Buvez au minimum 1.5L d\'eau par jour, davantage en cas d\'effort.', readTime: 2 }
];

const healthChallenges = [
  { id: 'c1', name: 'Marche quotidienne', description: 'Marchez 30 minutes par jour pendant 7 jours', target: 7, unit: 'jours', reward: 50, duration: '7 jours' },
  { id: 'c2', name: 'Hydratation', description: 'Buvez 8 verres d\'eau par jour pendant 5 jours', target: 5, unit: 'jours', reward: 30, duration: '5 jours' },
  { id: 'c3', name: 'Sommeil régulier', description: 'Couchez-vous avant 23h pendant 10 jours', target: 10, unit: 'jours', reward: 75, duration: '10 jours' }
];

// Get personalized recommendations
router.get('/recommendations', async (req, res) => {
  try {
    const profile = await GamificationProfile.findOne({ userId: req.user._id });
    const level = profile?.level || 1;

    const recommendations = [];
    if (level <= 2) {
      recommendations.push({ type: 'habitude', title: 'Commencez par de petites habitudes', description: 'Fixez-vous un objectif simple par semaine.', priority: 'haute' });
    }
    recommendations.push({ type: 'activité', title: 'Augmentez votre activité physique', description: 'Ajoutez 10 minutes de marche à votre routine.', priority: 'moyenne' });
    recommendations.push({ type: 'nutrition', title: 'Diversifiez votre alimentation', description: 'Incorporez une nouvelle variété de légumes cette semaine.', priority: 'moyenne' });

    if (level >= 3) {
      recommendations.push({ type: 'avancé', title: 'Suivi médical régulier', description: 'Planifiez votre prochain bilan de santé.', priority: 'haute' });
    }

    res.json({ success: true, data: { recommendations, level } });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
});

// Get active challenges
router.get('/challenges', async (req, res) => {
  try {
    let profile = await GamificationProfile.findOne({ userId: req.user._id });
    if (!profile) {
      profile = await GamificationProfile.create({ userId: req.user._id });
    }

    const activeChallenges = profile.challenges.filter(c => !c.completed && new Date(c.endDate) > new Date());

    res.json({ success: true, data: { activeChallenges, availableChallenges: healthChallenges } });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
});

// Get health articles
router.get('/articles', async (req, res) => {
  try {
    const { category, page = 1, limit = 10 } = req.query;
    let filtered = [...healthArticles];

    if (category) filtered = filtered.filter(a => a.category === category);

    const total = filtered.length;
    const start = (page - 1) * limit;
    const articles = filtered.slice(start, start + parseInt(limit));

    res.json({ success: true, data: { articles, total, page: parseInt(page), pages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
});

// List goals
router.get('/goals', async (req, res) => {
  try {
    let profile = await GamificationProfile.findOne({ userId: req.user._id });
    if (!profile) {
      profile = await GamificationProfile.create({ userId: req.user._id });
    }

    const goals = profile.challenges || [];

    res.json({ success: true, data: goals });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
});

// Create goal
router.post('/goals', async (req, res) => {
  try {
    const { name, title, description, target, reward, unit } = req.body;
    if (!name && !title || !target) {
      return res.status(400).json({ message: 'name/title et target requis.' });
    }

    let profile = await GamificationProfile.findOne({ userId: req.user._id });
    if (!profile) {
      profile = await GamificationProfile.create({ userId: req.user._id });
    }

    const goal = {
      challengeId: `custom-${Date.now()}`,
      name: name || title,
      description: description || '',
      target: Number(target),
      current: 0,
      reward: reward || 25,
      unit: unit || '',
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      completed: false
    };

    profile.challenges.push(goal);
    await profile.save();

    res.status(201).json({ success: true, data: goal });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
});

// Update goal progress
router.put('/goals/:id', async (req, res) => {
  try {
    const { progress } = req.body;
    let profile = await GamificationProfile.findOne({ userId: req.user._id });
    if (!profile) return res.status(404).json({ message: 'Profil non trouvé.' });

    const goal = profile.challenges.id(req.params.id);
    if (!goal) return res.status(404).json({ message: 'Objectif non trouvé.' });

    goal.current = Number(progress || 0);
    if (goal.current >= goal.target) {
      goal.completed = true;
      profile.points += goal.reward || 0;
      profile.level = Math.floor(profile.points / 500) + 1;
    }
    await profile.save();

    res.json({ success: true, data: goal });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
});

// Get coaching summary
router.get('/', async (req, res) => {
  try {
    const profile = await GamificationProfile.findOne({ userId: req.user._id });
    const goals = profile?.challenges || [];
    res.json({ recommendations: [], articles: healthArticles.slice(0, 3), goals, challenges: healthChallenges });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.' });
  }
});

export default router;
