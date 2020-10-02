const addObjectToDB = require('./functions/addObjectToDB.js')
// const setHead = require('./functions/setHead.js')

const getMongoDbContext = require('./getMongoDbContext.js')

const crypto = require('crypto')

const getBinarySize = string => Buffer.byteLength(string, 'utf8') // return Buffer.from(text).length
const getSHA1 = text => crypto.createHash('sha1').update(text).digest('hex')
const getSHA256 = text => crypto.createHash('sha256').update(text).digest('hex')

class GitGraph {
	async connect(options) {
		this.mongodb = await getMongoDbContext(options.mongodb_uri, options.mongodb_options)
	}

	close(){
		this.mongodb.client.close()
	}

	getGitLikeHash(text){
		// const type = '' // blob tree commit tag
		// const header = `${type} ${getBinarySize(text)}\0` // this is how git creates the hash
		const header = `${getBinarySize(text)}\0`
		return getSHA256(header+text)
	}
	getHash(content){
		const content_as_string = JSON.stringify(content)
		return this.getGitLikeHash(content_as_string)
	}

	async addObject(content){
		return new Promise((resolve, reject) => {
			const hash = this.getHash(content)
			addObjectToDB(this.mongodb, {
				hash,
				content,
				metadata: {
					// The metadate is only for statistics.
					// It can't contain any neccessary content-information, as it isn't in the hash.
					dateCreated: new Date(),
				},
			})
			.then(objectID => resolve(hash))
			.catch(error => reject(error))
		})
	}

	async addTree(options){
		const edges = options.edges
		const properties = options.properties

		// add edges
		const edge_hashs = []
		for (const edge of edges) {
			edge_hashs.push(await this.addObject({
				label: edge.label,
				to: edge.to,
				permissions: edge.permissions,
				properties: edge.properties,
			}))
		}

		// add tree
		return await this.addObject({
			edges: edge_hashs,
			properties: properties,
		})
	}

	async commit(options){
		return await this.addObject({
			tree: options.tree, // Hash
			parents: options.parents, // [Hash] # Hash to the parent commits
			committer: options.committer, // String
			message: options.message, // String
			timestamp: options.timestamp, // DateTime
		})
	}

	// async setHead(options){
	// 	const content = {
	// 		id: options.id,
	// 		commit: options.commit,
	// 	}
		
	// 	const hash = this.getHash(content)
	// 	await addObject({
	// 		hash,
	// 		content,
	// 	})
	// 	return hash
	// }
}

module.exports = GitGraph