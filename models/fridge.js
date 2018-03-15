const mongoose = require('mongoose')

const fridgeSchema = new mongoose.Schema({
	name: String,
	users: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
	fooditems: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Fooditem' }]
})

fridgeSchema.statics.format = (fridge) => {
	return {
		id: fridge._id,
		name: fridge.name,
		users: fridge.users,
		fooditems: fridge.fooditems
	}
}

const Fridge = mongoose.model('Fridge', fridgeSchema)

module.exports = Fridge