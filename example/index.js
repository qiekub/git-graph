const GitGraph = require('../module/index.js')



////////////////////////////////////////////////////////////////



const secretManager = require('./secretManager.js')
const getSecretAsync = secretManager.getSecretAsync

async function example() {
	const gg = new GitGraph()

	await gg.connect({
		mongodb_uri: encodeURI(`mongodb+srv://${await getSecretAsync('mongodb_username')}:${await getSecretAsync('mongodb_password')}@${await getSecretAsync('mongodb_server_domain')}/`), // test?retryWrites=true&w=majority,
		mongodb_options: {},
	})

	const helloworld_hash = await gg.addObject({
		text: 'hello world',
	})
	const permissions_hash = await gg.addObject({
		yes: 'no',
	})

	const tree_hash = await gg.addTree({
		edges: [
			{
				label: 'name',
				to: helloworld_hash,
				permissions: permissions_hash,
				properties: {},
			},
			{
				label: 'address',
				to: helloworld_hash,
				permissions: permissions_hash,
				properties: {},
			}
		],
		properties: {
			hello: 'world',
		},
	})

	console.log('tree_hash:', tree_hash)

	// const commit_hash = await gg.commit({
	// 	tree: tree_hash,
	// 	parents: [],
	// 	committer: 'test@test.test',
	// 	message: 'a test commit',
	// 	timestamp: new Date()*1,
	// })
	// console.log('commit_hash:', commit_hash)

	gg.close()
}


console.log('starting example...')
console.log('--------------------------------')
console.log('')
example()