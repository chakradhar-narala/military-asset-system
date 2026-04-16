const express = require('express');
const router = express.Router();
const { Asset, Transaction } = require('../models/asset');
const { verifyToken, authorizeRoles } = require('../middleware/auth');

// @route POST /api/transfers
// @desc Transfer asset between bases
// @access Admin, Logistics Officer
router.post('/', verifyToken, authorizeRoles(['Admin', 'Logistics Officer']), async (req, res) => {
    try {
        const { assetId, toBase } = req.body;
        
        const asset = await Asset.findById(assetId);
        if (!asset) return res.status(404).json({ message: "Asset not found" });

        const fromBase = asset.baseId;
        asset.baseId = toBase;
        await asset.save();

        const transaction = new Transaction({
            assetId: asset._id,
            transactionType: 'Transfer Out',
            fromBase: fromBase,
            toBase: toBase,
            performedBy: req.user.id
        });
        await transaction.save();

        // For tracking "Net Movement", we log the receiving side too if needed, 
        // but here one transaction captures the move. 
        // We'll treat "Transfer In" as implicit for the toBase.

        res.status(200).json({ message: "Asset transferred successfully", asset });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
