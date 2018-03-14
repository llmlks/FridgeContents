const fooditemsRouter = require('express').Router()
const Fooditem = require('../models/fooditem')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

fooditemsRouter.get('/', async (request, response) => {
	try {
		const fooditems = await Fooditem.find({ })

		response.status(200).json(fooditems.map(Fooditem.format))
	} catch (exception) {
		console.log(exception)
		response.status(500).send({ error: 'Something went wrong' })
	}
})

fooditemsRouter.post('/', async (request, response) => {
	try {
		const token = request.token
		const decodedToken = jwt.verify(token, process.env.SECRET)
		const body = request.body

		if (!token || !decodedToken.id) {
			return response.status(400).send({ error: 'Missing or invalid token' })
		}

		if (!body.name) {
			return response.status(400).send({ error: 'Name must be defined' })
		}

		if (!body.weight && !body.volume && !body.pieces) {
			return response.status(400).send({
				error: 'At least one measurement must be set to a positive value'
			})
		}

		const user = await User.findById(decodedToken.id)

		const fooditem = new Fooditem({
			name: body.name,
			weight: body.weight,
			volume: body.volume,
			pieces: body.pieces,
			user: user._id
		})

		const saved = await fooditem.save()

		user.fooditems = user.fooditems.concat(saved._id)
		await user.save()

		response.status(201).json(Fooditem.format(saved))
	} catch (exception) {
		if (exception.name === 'JsonWebTokenError') {
			response.status(401).send({ error: exception.message })
		} else {
			console.log(exception)
			response.status(500).send({ error: 'Something went wrong' })
		}
	}
})

fooditemsRouter.delete('/:id', async (request, response) => {
	try {
		const token = request.token
		const decodedToken = jwt.verify(token, process.env.SECRET)

		if (!token || !decodedToken.id) {
			return response.status(401).send({ error: 'Missing or invalid token' })
		}

		const toBeRemoved = await Fooditem.findById(request.params.id)

		if (!toBeRemoved) {
			return response.status(400).send({ error: `Malformatted id: ${request.params.id}` })
		}

		if (toBeRemoved.user.toString() !== decodedToken.id.toString()) {
			return response.status(401).send({ error: 'Not authorised' })
		}

		const user = await User.findById(toBeRemoved.user)
		user.fooditems = user.fooditems.filter(f => f.toString() !== toBeRemoved._id.toString())

		await user.save()
		await toBeRemoved.remove()

		response.status(204).end()
	} catch (exception) {
		if (exception.name === 'JsonWebTokenError') {
			response.status(401).send({ error: exception.message })
		} else {
			console.log(exception)
			response.status(500).send({ error: 'Something went wrong' })
		}
	}
})

fooditemsRouter.put('/:id', async (request, response) => {
	try {
		const token = request.token
		const decodedToken = jwt.verify(token, process.env.SECRET)

		if (!token || !decodedToken.id) {
			return response.status(401).send({ error: 'Missing or invalid token' })
		}

		const body = request.body
		const oldItem = await Fooditem.findById(request.params.id)

		if (!oldItem) {
			return response.status(400).send({ error: `Malformatted id: ${request.params.id}` })
		}

		if (oldItem.user.toString() !== decodedToken.id.toString()) {
			return response.status(401).send({ error: 'Not authorised' })
		}

		const updatedItem = {
			name: body.name,
			weight: body.weight,
			volume: body.volume,
			pieces: body.pieces,
			user: oldItem.user
		}

		const options = { new: true }
		const newItem = await Fooditem.findByIdAndUpdate(oldItem._id, updatedItem, options)

		response.status(200).json(Fooditem.format(newItem))
	} catch (exception) {
		console.log(exception)
		response.status(500).send({ error: 'Something went wrong' })
	}
})

module.exports = fooditemsRouter