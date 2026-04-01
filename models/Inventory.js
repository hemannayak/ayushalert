import mongoose from 'mongoose';

const InventorySchema = new mongoose.Schema({
  hospital_id: { type: String, required: true, index: true },
  item_name: { type: String, required: true },
  category: { type: String, enum: ['Medicine', 'PPE', 'Fluid', 'Equipment'], default: 'Medicine' },
  stock_count: { type: Number, default: 0 },
  unit: { type: String, default: 'Units' },
  min_threshold: { type: Number, default: 100 },
  
  // Logistics Expansion
  invoice_id: { type: String },
  intake_stock: { type: Number },
  intake_time: { type: Date, default: Date.now },
  unit_cost: { type: Number },
  total_amount: { type: Number },
  
  last_updated: { type: Date, default: Date.now }
});

export default mongoose.models.Inventory || mongoose.model('Inventory', InventorySchema);
