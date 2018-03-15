const mongoose = require('mongoose')

const fooditemSchema = new mongoose.Schema({
	name: String,
	amount: Number,
	unit: String,
	bought: Date,
	opened: Date,
	fridge: { type: mongoose.Schema.Types.ObjectId, ref: 'Fridge' }
})

fooditemSchema.statics.format = (fooditem) => {
	return {
		id: fooditem._id,
		name: fooditem.name,
		amount: fooditem.amount,
		unit: fooditem.unit,
		bought: fooditem.bought,
		fridge: fooditem.fridge
	}
}

const Fooditem = mongoose.model('Fooditem', fooditemSchema)

module.exports = Fooditem