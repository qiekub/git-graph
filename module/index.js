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
		// add relations
		const relations = options.relations || []
		const relation_hashs = []
		for (const relation of relations) {
			const newRelationHash = await this.addTree({
				...relation,
				type: 'relation',
			})
			if (!!newRelationHash) {
				relation_hashs.push(newRelationHash)
			}
		}


		// add node (it's called a tree in git)
		const type = (options.type === 'relation' ? 'relation' : 'node')

		const newObject = {
			type,
			content: options.content,
			relations: relation_hashs,
		}
		if (type === 'relation') {
			newObject.label = options.label
			newObject.permissions = options.permissions

			// get toHash if not givin
			let toHash = options.toHash
			if (!(!!toHash)) {
				if (options.toContent) {
					toHash = await this.addTree({
						content: options.toContent,
					})
				} else if (options.toDoc) {
					toHash = await this.addTree(options.toDoc)
				}
			}
			newObject.toHash = toHash
		}

		// add the object
		let newObjectHash = null
		try {
			newObjectHash = await this.addObject(newObject)
		} catch (error) {
			console.error(error)
		}
		return newObjectHash
	}

	async commit(options){
		return await this.addTree({
			content: {
				node: options.node, // tree: options.tree, // Hash
				parents: options.parents, // [Hash] # Hash to the parent commits
				committer: options.committer, // String
				message: options.message, // String
				timestamp: options.timestamp, // DateTime
			},
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