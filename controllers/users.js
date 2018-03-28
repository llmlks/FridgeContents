const usersRouter = require('express').Router()
const bcrypt = require('bcrypt')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

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

usersRouter.put('/:id', async (request, response) => {
	try {
		const token = request.token
		const decodedToken = jwt.verify(token, process.env.SECRET)

		if (!token || !decodedToken.id) {
			return response.status(401).send({ error: 'Missing or invalid token' })
		}

		const body = request.body
		const oldUser = await User.findById(request.params.id)

		if (!oldUser) {
			return response.status(400).send({ error: `Malformatted id: ${request.params.id}` })
		}

		if (oldUser._id.toString() !== decodedToken.id.toString()) {
			return response.status(401).send({ error: 'Not authorised' })
		}

		const updatedUser = {
			name: body.name,
			username: body.username,
			passwordHash: oldUser.passwordHash,
			fridges: oldUser.fridges,
			defaultFridge: body.defaultFridge
		}

		const options = { new: true }
		const newUser = await User.findByIdAndUpdate(oldUser._id, updatedUser, options)

		response.status(200).json(User.format(newUser))
	} catch (exception) {
		console.log(exception)
		response.status(500).send({ error: 'Something went wrong' })
	}
})

module.exports = usersRouter