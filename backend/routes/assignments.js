const express = require('express');
const router = express.Router();
const { Asset, Transaction } = require('../models/asset');
const { verifyToken, authorizeRoles } = require('../middleware/auth');

// @route POST /api/assignments
// @desc Assign asset or record expenditure
// @access Admin, Logistics Officer, Base Commander
router.post('/', verifyToken, authorizeRoles(['Admin', 'Logistics Officer', 'Base Commander']), async (req, res) => {
    try {
        const { assetId, type, assignedTo } = req.body; // type: 'Assignment' or 'Expenditure'
        
        const asset = await Asset.findById(assetId);
        if (!asset) return res.status(404).json({ message: "Asset not found" });

        // If expenditure, we might mark as Expended or reduce quantity.
        // For simplicity, we update status.
        asset.status = type === 'Expenditure' ? 'Expended' : 'Assigned';
        await asset.save();

        const transaction = new Transaction({
            assetId: asset._id,
            transactionType: type,
            fromBase: asset.baseId,
            assignedTo: assignedTo,
            performedBy: req.user.id
        });
        await transaction.save();

        res.status(200).json({ message: `${type} recorded successfully`, asset });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
