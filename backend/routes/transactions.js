const express = require('express');
const router = express.Router();
const { Transaction } = require('../models/asset');
const { verifyToken } = require('../middleware/auth');

// @route GET /api/transactions
// @desc Get historical transactions with filters
router.get('/', verifyToken, async (req, res) => {
    try {
        const { type, equipmentType, date } = req.query;
        let filter = {};

        // Base restriction based on role
        if (req.user.role === 'Base Commander') {
            filter.$or = [
                { fromBase: req.user.baseId },
                { toBase: req.user.baseId }
            ];
        }

        if (type) filter.transactionType = type;
        
        // Handling Date Filter (Last 7 Days, Last 30 Days)
        if (date) {
            const today = new Date();
            if (date === '7days') {
                filter.date = { $gte: new Date(today.setDate(today.getDate() - 7)) };
            } else if (date === '30days') {
                filter.date = { $gte: new Date(today.setDate(today.getDate() - 30)) };
            }
        }

        // We populate the assetId to get equipmentType and asset name details
        let query = Transaction.find(filter)
            .populate({
                path: 'assetId',
                select: 'name equipmentType baseId'
            })
            .populate('performedBy', 'username role')
            .sort({ date: -1 });

        let transactions = await query;

        // In Mongoose, filtering on populated fields directly in find() requires aggregate or match. 
        // For simplicity, we can filter the array after population if equipmentType is provided.
        if (equipmentType && equipmentType !== 'All') {
            transactions = transactions.filter(t => t.assetId && t.assetId.equipmentType === equipmentType);
        }

        res.json(transactions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
