const mongoose = require('mongoose');

const AssetSchema = new mongoose.Schema({
    name: { type: String, required: true },
    equipmentType: { type: String, enum: ['Weapon', 'Vehicle', 'Ammo', 'Consumable'], required: true },
    baseId: { type: String, required: true },
    status: { type: String, enum: ['Available', 'Assigned', 'Expended'], default: 'Available' },
    quantity: { type: Number, default: 1 }
});

const TransactionSchema = new mongoose.Schema({
    assetId: { type: mongoose.Schema.Types.ObjectId, ref: 'Asset', required: true },
    transactionType: { type: String, enum: ['Purchase', 'Transfer In', 'Transfer Out', 'Assignment', 'Expenditure'], required: true },
    fromBase: { type: String },
    toBase: { type: String },
    assignedTo: { type: String }, // Personnel name or unit
    date: { type: Date, default: Date.now },
    performedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
});

module.exports = {
    Asset: mongoose.model('Asset', AssetSchema),
    Transaction: mongoose.model('Transaction', TransactionSchema)
};
