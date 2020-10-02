const mongodb = require('mongodb')
const MongoClient = mongodb.MongoClient
const ObjectID = mongodb.ObjectID

const _ContextChache_ = {}

function getMongoDbContext(mongodb_uri, mongodb_options){
	return new Promise(async (resolve,reject)=>{
		if (_ContextChache_.mongodb) {
			resolve(_ContextChache_.mongodb)
		}else{
			if (!mongodb_uri) {
				reject('probably no mongodb rights')
			}else{
				MongoClient.connect(mongodb_uri,{
					useNewUrlParser: true,
					useUnifiedTopology: true,
					...mongodb_options,
				}).then(mongodb_client => {
					const names = {
						dbs: {
							Git: 'Git',
						},
						collections: {
							Objects: 'Objects',
						}
					}

					const dbs = {
						Git: mongodb_client.db(names.dbs.Git),
					}
					const collections = {
						Objects: dbs.Git.collection(names.collections.Objects),
					}

					_ContextChache_.mongodb = {
						client: mongodb_client,
						ObjectID: ObjectID,

						names,
						dbs,
						collections,
					}
	
					resolve(_ContextChache_.mongodb)
				}).catch(error=>{
					console.error(error)
					reject('could not connect to mongodb')
				})
			}
		}
	})
}

module.exports = getMongoDbContext