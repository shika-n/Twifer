const SESSION_LIFETIME = (1000 * 60) * 30; // 30 minutes

class Sessions {
	static collection(db) {
		return db.collection('sessions');
	}

	static async find(db, sessionId, ip) {
		const result = await this.collection(db).find({
			sessionId: sessionId
		}).toArray();

		if (result.length == 1 && result.ip == db.ip) {
			const session = result[0];

			if (Date.now() - session.date > SESSION_LIFETIME) {
				console.log(`SessionId ${sessionId} has expired by ${Date.now() - session.date}ms`);
				await this.collection(db).deleteMany({
					sessionId: sessionId
				});
				return null;
			}

			return result[0];
		} else {
			if (result.length == 1) {
				console.log('IP does not match. Returning null.');
			} else {
				const allSessions = await this.collection(db).find({}).toArray();
				console.log('All Sessions: ' + require('util').inspect(allSessions));

				console.log(`There are ${result.length} sessionIds found. Returning null.`);
			}

			await this.collection(db).deleteMany({
				sessionId: sessionId
			});
			return null;
		}
	}
	
	static async insertNew(db, sessionId, ip) {
		const result = await this.collection(db).insertOne({
			sessionId: sessionId,
			ip: ip,
			date: Date.now()
		});
	}

	static async renewToken(db, session, sessionId) {
		const result = await this.collection(db).updateOne(
			{
				_id: session._id
			},
			{
				$set: {
					sessionId: sessionId,
					date: Date.now()
				}
			}
		);
	}

	static async cleanUp(db) {
		const result = await this.collection(db).deleteMany({
			date: {
				$lt: Date.now() - SESSION_LIFETIME
			}
		});
		return `Cleaned ${result.result.n} sessions`;
	}
}

module.exports = Sessions;
