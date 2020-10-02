

function objectExists(mongodb, objectID){
	return new Promise((resolve, reject) => {
		let toReturn = false

		mongodb.collections.Objects.findOne({
			_id: objectID,
		})
		.then(result => {
			if (!!result) {
				toReturn = true
			}
		})
		.catch(error => console.log(error))
		.finally(()=>{
			resolve(toReturn)
		})
	})
}

function addObjectToDB(mongodb, content){
	return new Promise(async (resolve, reject) => {
		const objectID = content.hash

		if (await objectExists(mongodb, objectID)) {
			resolve(objectID)
		}else{
			mongodb.collections.Objects.insertOne({
				_id: objectID,
				content: content.content,
				metadata: content.metadata,
			})
			.then(result => {
				if (!!result.insertedId) {
					resolve(objectID)
				}else{
					reject('Could not insert a new edge.')
				}
			})
			.catch(error => reject(error))
		}
	})
}

module.exports = addObjectToDB