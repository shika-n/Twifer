const crypto = require("crypto");
const util = require("util");

const SESSION_LIFETIME = (1000 * 60) * 30; // 30 minutes

const ALWAYS_ALLOW_PATHS = [
	"/session/get_status",
]
const GUEST_ONLY_PATHS = [
	"/twitter/auth",
	"/twitter/callback",
]

class Sessions {
	static collection(db) {
		return db.collection("sessions");
	}

	static async find(db, sessionId, ip) {
		const result = await this.collection(db).find({
			sessionId: sessionId
		}).toArray();

		if (result.length == 1 && result[0].ip == ip) {
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
				console.log("IP does not match. Returning null.");
			} else {
				const allSessions = await this.collection(db).find({}).toArray();
				console.log("All Sessions: " + util.inspect(allSessions));

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

	static async renewToken(db, session, newSessionId) {
		const result = await this.collection(db).updateOne(
			{
				_id: session._id
			},
			{
				$set: {
					sessionId: newSessionId,
					date: Date.now()
				}
			}
		);
	}

	static async insertRequestToken(db, sessionId, requestToken, requestSecret) {
		const result = await Sessions.collection(db).updateOne(
			{
				sessionId: sessionId
			},
			{
				$set: {
					requestToken: requestToken,
					requestSecret: requestSecret,
				}
			}
		);
	}

	static async insertAccessToken(db, sessionId, accessToken, accessSecret) {
		const result = await Sessions.collection(db).updateOne(
			{
				sessionId: sessionId
			},
			{
				$set: {
					accessToken: accessToken,
					accessSecret: accessSecret,
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
		const newSessionId = crypto.createHash("sha256").update(`${req.ip}-${Date.now()}`).digest("hex");
		const cookieExist = req.cookies !== undefined && req.cookies.sessionId !== undefined && req.cookies.sessionId != "";

		let session = null;
		if (cookieExist) {
			session = await this.find(req.db, req.cookies.sessionId, req.ip);
		}

		let isGuest = true;
		if (session != null) {
			await this.renewToken(req.db, session, newSessionId);
			this.setCookie(res, newSessionId);

			if (session.accessToken != undefined && session.accessSecret != undefined) {
				isGuest = false;
			}
		} else {
			await this.insertNew(req.db, newSessionId, req.ip);
			this.setCookie(res, newSessionId);
		}

		req.newSessionId = newSessionId;

		if (isGuest) {
			const isAllowed = ALWAYS_ALLOW_PATHS.indexOf(req.pathName) > -1 || GUEST_ONLY_PATHS.indexOf(req.pathName) > -1;

			if (!isAllowed) {
				throw "Unauthorized";
			}
		} else {
			const isGuestOnly = GUEST_ONLY_PATHS.indexOf(req.pathName) > -1;

			if (isGuestOnly) {
				res.statusCode = 302;
				res.setHeader("Location", `/`);
				res.setHeader("Cache-Control", "no-cache, no-store");
				res.end();
				return 0;
			}
		}

		return 1;
	}

	static setCookie(res, newSessionId) {
		res.statusCode = 200;
		res.setHeader("Set-Cookie", `sessionId=${newSessionId}; Path=/; HttpOnly`);
	}

	static deleteCookie(res) {
		res.statusCode = 401;
		res.setHeader("Set-Cookie", "sessionId=; Path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT");
	}
}

module.exports = Sessions;
