const usersRouter = require('express').Router()
const bcrypt = require('bcrypt')
const User = require('../models/user')

usersRouter.get('/', async (request, response) => {
	try {
		const users = await User.find({ })

		response.status(200).json(users.map(User.format))
	} catch (exception) {
		console.log(exception)
		response.status(500).send({ error: 'Something went wrong' })
	}
})

usersRouter.post('/', async (request, response) => {
	try {
		const body = request.body

		const usernameTaken = await User.findOne({ username: body.username })
		if (usernameTaken) {
			return response.status(400).send({ error: 'Username has been taken' })
		}

		if (!body.password || body.password.length < 8) {
			return response.status(400).send({ error: 'Password must contain at least 8 characters' })
		}

		const saltRounds = 10
		const passwordHash = await bcrypt.hash(body.password, saltRounds)

		const user = new User({
			name: body.name,
			username: body.username,
			passwordHash,
			fridges: []
		})

		const saved = await user.save()

		response.status(201).json(User.format(saved))
	} catch (exception) {
		console.log(exception)
		response.status(500).send({ error: 'Something went wrong' })
	}
})

module.exports = usersRouter