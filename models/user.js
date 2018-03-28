const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
	name: String,
	username: String,
	passwordHash: String,
	fridges: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Fridge' }],
	defaultFridge: { type: mongoose.Schema.Types.ObjectId, ref: 'Fridge' }
})

userSchema.statics.format = (user) => {
	return {
		id: user._id,
		name: user.name,
		username: user.username,
		fridges: user.fridges,
		defaultFridge: user.defaultFridge
	}
}

const User = mongoose.model('User', userSchema)

module.exports = User