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

	const helloworld_hash = await gg.addTree({
		content: {
			text: 'hello world',
		}
	})
	const permissions_hash = await gg.addTree({
		content: {
			yes: 'no',
		}
	})

	const tree_hash = await gg.addTree({
		content: {
			hello: 'world',
		},
		relations: [
			{
				label: 'name',
				toHash: helloworld_hash,
				permissions: permissions_hash,
				content: {},
				edges: [],
			},
			{
				label: 'address',
				// toHash: helloworld_hash,
				// toContent: {
				// 	text: 'hello world',
				// },
				toDoc: {
					content: {
						text: 'hello world',
					},
				},
				permissions: permissions_hash,
				content: {},
				edges: [],
			}
		],
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