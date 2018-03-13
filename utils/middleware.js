const tokenExtractor = (request, response, next) => {
	const auth = request.get('authorization')
	let token = null

	if (auth && auth.toLowerCase().startsWith('bearer ')) {
		token = auth.substring(7)
	}

	request.token = token
	next()
}

module.exports = { tokenExtractor }