const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
	name: String,
	username: String,
	passwordHash: String,
	fooditems: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Fooditem' }]
})

userSchema.statics.format = (user) => {
	return {
		id: user._id,
		name: user.name,
		username: user.username,
		fooditems: user.fooditems
	}
}

const User = mongoose.model('User', userSchema)

module.exports = User