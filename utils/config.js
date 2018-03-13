if (process.env.NODE_ENV !== 'production') {
	require('dotenv').config()
}

let dbUrl = process.env.MONGO_URI
let port = process.env.PORT

module.exports = {
	dbUrl,
	port
}