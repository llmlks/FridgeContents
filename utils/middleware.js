const tokenExtractor = (request, response, next) => {
	const auth = request.get('authorization')
	let token = null

	if (auth && auth.toLowerCase().startsWith('bearer ')) {
		token = auth.substring(7)
	}

	request.token = token
	next()
}

const logger = (request, response, next) => {
	console.log('Method:', request.method)
	console.log('Path:', request.path)
	console.log('Body:', request.body)
	console.log('------------------------')
	next()
}

module.exports = { tokenExtractor, logger }