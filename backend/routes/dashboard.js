const express = require('express');
const router = express.Router();
const { Asset, Transaction } = require('../models/asset');
const { verifyToken } = require('../middleware/auth');

// @route GET /api/dashboard
router.get('/', verifyToken, async (req, res) => {
    try {
        const { base, equipmentType, date } = req.query;
        let assetFilter = {};
        let txFilter = {};
        
        // RBAC: Base Commanders are fixed to their base
        if (req.user.role === 'Base Commander') {
            assetFilter.baseId = req.user.baseId;
            txFilter.$or = [{ fromBase: req.user.baseId }, { toBase: req.user.baseId }];
        } else if (base && base !== 'All') {
            assetFilter.baseId = base;
            txFilter.$or = [{ fromBase: base }, { toBase: base }, { baseId: base }];
        }

        if (equipmentType && equipmentType !== 'All') {
            assetFilter.equipmentType = equipmentType;
        }

        // Date filter is only applicable to Transaction events natively (history)
        // But for dashboard "Net movement", we can limit transactions by date.
        if (date && date !== 'All') {
            const today = new Date();
            if (date === '7days') txFilter.date = { $gte: new Date(today.setDate(today.getDate() - 7)) };
            if (date === '30days') txFilter.date = { $gte: new Date(today.setDate(today.getDate() - 30)) };
        }

        const assets = await Asset.find(assetFilter);
        
        // Populate assetId to filter transactions by equipmentType safely
        let transactions = await Transaction.find(txFilter).populate('assetId');

        if (equipmentType && equipmentType !== 'All') {
            transactions = transactions.filter(t => t.assetId && t.assetId.equipmentType === equipmentType);
        }

        // Dashboard Metrics
        const assignedAssets = assets.filter(a => a.status === 'Assigned').length;
        const expendedAssets = assets.filter(a => a.status === 'Expended').length;

        const purchases = transactions.filter(t => t.transactionType === 'Purchase').length;
        const transfersIn = transactions.filter(t => t.toBase === (base && base !== 'All' ? base : req.user.baseId)).length;
        const transfersOut = transactions.filter(t => t.fromBase === (base && base !== 'All' ? base : req.user.baseId)).length;
        const assignments = transactions.filter(t => t.transactionType === 'Assignment').length;
        const expenditures = transactions.filter(t => t.transactionType === 'Expenditure').length;
        
        // If Admin looking globally, Transfers zero out internal net movement.
        const isAdminGlobal = req.user.role === 'Admin' && (!base || base === 'All');
        const netMovement = purchases + (isAdminGlobal ? 0 : (transfersIn - transfersOut)) - expenditures;

        res.json({
            totalAssets: assets.length,
            assignedCount: assignedAssets,
            expendedCount: expendedAssets,
            netMovement: netMovement,
            breakdown: {
                purchases,
                transfersIn,
                transfersOut,
                assignments,
                expenditures
            }
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
