const mongoose = require('mongoose')

const fooditemSchema = new mongoose.Schema({
	name: String,
	weight: Number,
	volume: Number,
	pieces: Number,
	user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
})

fooditemSchema.statics.format = (fooditem) => {
	return {
		id: fooditem._id,
		name: fooditem.name,
		weight: fooditem.weight,
		volume: fooditem.volume,
		pieces: fooditem.pieces,
		user: fooditem.user
	}
}

const Fooditem = mongoose.model('Fooditem', fooditemSchema)

module.exports = Fooditem