const express = require('express');
const router = express.Router();
const { Asset, Transaction } = require('../models/asset');
const { verifyToken, authorizeRoles } = require('../middleware/auth');

// @route POST /api/purchases
// @desc Record a new asset purchase
// @access Admin, Logistics Officer
router.post('/', verifyToken, authorizeRoles(['Admin', 'Logistics Officer']), async (req, res) => {
    try {
        const { name, equipmentType, baseId, quantity } = req.body;
        
        const newAsset = new Asset({
            name,
            equipmentType,
            baseId,
            quantity: quantity || 1
        });
        await newAsset.save();

        const transaction = new Transaction({
            assetId: newAsset._id,
            transactionType: 'Purchase',
            toBase: baseId,
            performedBy: req.user.id
        });
        await transaction.save();

        res.status(201).json({ message: "Asset purchased successfully", asset: newAsset });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// @route GET /api/purchases
// @desc Get all assets (closing balance) for dashboard
router.get('/', verifyToken, async (req, res) => {
    try {
        let filter = {};
        if (req.user.role === 'Base Commander') filter.baseId = req.user.baseId;
        
        const assets = await Asset.find(filter);
        res.json(assets);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
