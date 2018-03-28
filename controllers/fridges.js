const fridgeRouter = require('express').Router()
const Fridge = require('../models/fridge')
const jwt = require('jsonwebtoken')
const User = require('../models/user')
const Fooditem = require('../models/fooditem')

fridgeRouter.get('/', async (request, response) => {
	try {
		const fridges = await Fridge.find({ }).populate('users', { name: 1, _id: 1 })

		response.status(200).json(fridges.map(Fridge.format))
	} catch (exception) {
		console.log(exception)
		response.status(500).send({ error: 'Something went wrong' })
	}
})

fridgeRouter.get('/user/:id', async (request, response) => {
	try {
		const user = await User.findById(request.params.id)

		if (!user) {
			return response.status(400).send({ error: `Malformatted id: ${request.params.id}` })
		}

		const fridges = await Fridge.find({ _id: {$in: user.fridges } })

		response.status(200).json(fridges.map(Fridge.format))
	} catch (exception) {
		console.log(exception)
		response.status(500).send({ error: 'Something went wrong' })
	}
})

fridgeRouter.post('/', async (request, response) => {
	try {
		const token = request.token
		const decodedToken = jwt.verify(token, process.env.SECRET)

		if (!token || !decodedToken.id) {
			return response.status(401).send({ error: 'Missing or invalid token' })
		}

		const user = await User.findById(decodedToken.id)

		const fridge = new Fridge({
			name: request.body.name,
			users: [user._id],
			fooditems: []
		})

		const saved = await fridge.save()
		user.fridges = user.fridges.concat(saved._id)

		if (!user.defaultFridge) {
			user.defaultFridge = fridge._id
		}

		await user.save()

		response.status(201).json(Fridge.format(saved))		
	} catch (exception) {
		console.log(exception)
		response.status(500).send({ error: 'Something went wrong' })
	}
})

fridgeRouter.delete('/:id', async (request, response) => {
	try {
		const token = request.token
		const decodedToken = jwt.verify(token, process.env.SECRET)

		if (!token || !decodedToken.id) {
			return response.status(401).send({ error: 'Missing or invalid token' })
		}

		const toBeRemoved = await Fridge.findById(request.params.id)

		if (!toBeRemoved) {
			return response.status(400).send({ error: `Malformatted id: ${request.params.id}` })
		}

		const fridgeUser = toBeRemoved.users.find(f => f.toString() === decodedToken.id.toString())
		if (!fridgeUser) {
			return response.status(401).send({ error: 'Not authorised' })
		}

		toBeRemoved.users.forEach(async (u) => {
			const user = await User.findById(u)
			user.fridges = user.fridges.filter(f => f.toString() !== toBeRemoved._id.toString())

			if (user.defaultFridge.toString() === toBeRemoved._id.toString()) {
				user.defaultFridge = null
			}

			await user.save()
		})

		toBeRemoved.fooditems.forEach(async (f) => {
			await Fooditem.findByIdAndRemove(f)
		})

		await Fridge.findByIdAndRemove(toBeRemoved._id)

		response.status(204).end()
	} catch (exception) {
		console.log(exception)
		response.status(500).send({ error: 'Something went wrong' })
	}
})

module.exports = fridgeRouter