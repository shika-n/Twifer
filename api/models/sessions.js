const crypto = require('crypto');
const util = require('util');

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
				console.log('All Sessions: ' + util.inspect(allSessions));

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

	static async checkSession(req, res) {
		const newSessionId = crypto.createHash('sha256').update(`${req.ip}-${Date.now()}`).digest('hex');

		const authPage = req.url === '/test';

		const cookieExist = req.cookies !== undefined && req.cookies.sessionId !== undefined && req.cookies.sessionId != '';

		let session = null;
		if (cookieExist) {
			session = await this.find(req.db, req.cookies.sessionId, req.ip);
		}

		if (authPage) {
			if (session != null) {
				await this.renewToken(req.db, session, newSessionId);
				this.setCookie(res, newSessionId);
			} else {
				await this.insertNew(req.db, newSessionId, req.ip);
				this.setCookie(res, newSessionId);
			}
		} else {
			if (session != null) {
				await this.renewToken(req.db, session, newSessionId);
				this.setCookie(res, newSessionId);
			} else {
				this.deleteCookie();
				throw 'Unauthorized';
			}
		}
	}

	static setCookie(res, newSessionId) {
		res.writeHead(
			200,
			{
				'Set-Cookie': `sessionId=${newSessionId}; Path=/; HttpOnly`
			}
		)
	}

	static deleteCookie(res) {
		res.writeHead(
			401,
			{
				'Set-Cookie': 'sessionId=; Path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
			}
		)
	}
}

module.exports = Sessions;
