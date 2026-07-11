import express from 'express';
import PromoCode from '../models/PromoCode.js';
import { protect, authorize } from '../middlewares/auth.js';

const router = express.Router();
router.use(protect);

// Validate a promo code (all authenticated users)
router.post('/validate', async (req, res) => {
  try {
    const { code, planType } = req.body;
    if (!code) return res.status(400).json({ message: 'Code requis.' });

    const promo = await PromoCode.findOne({ code: code.toUpperCase(), isActive: true });
    if (!promo) return res.status(404).json({ message: 'Code promo invalide ou inactif.' });

    if (promo.endDate && new Date(promo.endDate) < new Date()) {
      return res.status(400).json({ message: 'Ce code promo a expiré.' });
    }

    if (promo.maxUses && promo.usedCount >= promo.maxUses) {
      return res.status(400).json({ message: 'Ce code promo a atteint son utilisation maximale.' });
    }

    if (promo.applicablePlans && promo.applicablePlans.length > 0 && planType && !promo.applicablePlans.includes(planType)) {
      return res.status(400).json({ message: 'Ce code n\'est pas applicable à ce plan.' });
    }

    res.json({
      success: true,
      data: {
        valid: true,
        code: promo.code,
        discountType: promo.discountType,
        discountValue: promo.discountValue
      }
    });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
});

// --- Admin only routes below ---
router.use(authorize('admin'));

// List promo codes
router.get('/', async (req, res) => {
  try {
    const { isActive, page = 1, limit = 20 } = req.query;
    const query = {};
    if (isActive !== undefined) query.isActive = isActive === 'true';

    const promoCodes = await PromoCode.find(query)
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await PromoCode.countDocuments(query);

    res.json({ success: true, data: { promoCodes, total, page: parseInt(page), pages: Math.ceil(total / limit) } });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
});

// Create promo code
router.post('/', async (req, res) => {
  try {
    const { code, discountType, discountValue, maxUses, applicablePlans, startDate, endDate } = req.body;
    if (!code || !discountType || !discountValue) {
      return res.status(400).json({ message: 'code, discountType et discountValue requis.' });
    }

    const exists = await PromoCode.findOne({ code: code.toUpperCase() });
    if (exists) return res.status(400).json({ message: 'Ce code promo existe déjà.' });

    const promoCode = await PromoCode.create({
      code: code.toUpperCase(),
      discountType,
      discountValue,
      maxUses,
      applicablePlans,
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: endDate ? new Date(endDate) : null,
      createdBy: req.user._id
    });

    res.status(201).json({ success: true, data: promoCode });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
});

// Update promo code
router.put('/:id', async (req, res) => {
  try {
    const promoCode = await PromoCode.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!promoCode) return res.status(404).json({ message: 'Code promo non trouvé.' });

    res.json({ success: true, data: promoCode });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
});

// Delete promo code
router.delete('/:id', async (req, res) => {
  try {
    const promoCode = await PromoCode.findByIdAndDelete(req.params.id);
    if (!promoCode) return res.status(404).json({ message: 'Code promo non trouvé.' });

    res.json({ success: true, data: { message: 'Code promo supprimé.' } });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur.', error: error.message });
  }
});

export default router;
