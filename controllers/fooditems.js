const fooditemsRouter = require('express').Router()
const Fooditem = require('../models/fooditem')
const User = require('../models/user')
const jwt = require('jsonwebtoken')
const Fridge = require('../models/fridge')

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

		if (!body.amount || !body.unit) {
			return response.status(400).send({
				error: 'Amount and unit must be set'
			})
		}

		const fridge = await Fridge.findById(body.fridge)
		const fridgeUser = fridge.users.find(u => u._id.toString() === decodedToken.id.toString())

		if (!fridgeUser) {
			return response.status(401).send({ error: 'Not authorised' })
		}

		let bought = body.bought
		if (!bought) {
			bought = new Date()
		}

		const fooditem = new Fooditem({
			name: body.name,
			amount: body.amount,
			unit: body.unit,
			bought: bought,
			opened: body.opened,
			user: body.fridge
		})

		const saved = await fooditem.save()

		fridge.fooditems = fridge.fooditems.concat(saved._id)
		await fridge.save()

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

		const fridge = await Fridge.findById(toBeRemoved.fridge)
		const fridgeUser = fridge.users.find(u => u._id.toString() === decodedToken.id.toString())

		if (!fridgeUser) {
			return response.status(401).send({ error: 'Not authorised' })
		}

		fridge.fooditems = fridge.fooditems.filter(f => f.toString() !== toBeRemoved._id.toString())

		await fridge.save()
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

		const fridge = await Fridge.findById(oldItem.fridge)
		const fridgeUser = fridge.users.find(u => u._id.toString() === decodedToken.id.toString())

		if (!fridgeUser) {
			return response.status(401).send({ error: 'Not authorised' })
		}

		const updatedItem = {
			name: body.name,
			amount: body.amount,
			unit: body.unit,
			bought: body.bought,
			opened: body.opened,
			fridge: body.fridge
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