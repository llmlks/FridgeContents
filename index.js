const http = require('http')
const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const cors = require('cors')
const mongoose = require('mongoose')
const config = require('./utils/config')
const fooditemsRouter = require('./controllers/fooditems')
const usersRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')
const middleware = require('./utils/middleware')

const connectDB = async () => {
	try {
		await mongoose.connect(config.dbUrl)
		console.log('Connected to database', config.dbUrl)
	} catch (exception) {
		console.log(exception)
	}
}

connectDB()
mongoose.Promise = global.Promise

app.use(bodyParser.json())
app.set('json spaces', 4)
app.use(cors())
app.use(express.static('build'))
app.use(middleware.tokenExtractor)
app.use('/api/fooditems', fooditemsRouter)
app.use('/api/users', usersRouter)
app.use('/api/login', loginRouter)

app.listen(config.port, () => {
	console.log(`Server running on port ${config.port}`)
})