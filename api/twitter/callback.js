const util = require("util");
const Sessions = require("../models/sessions");

export default async function (req, res, next) {
	const session = await Sessions.find(req.db, req.newSessionId, req.ip);
	
	if (session !== null) {
		const requestToken = req.params.oauth_token;
		const accessVerifier = req.params.oauth_verifier;

		if (session.requestToken == requestToken) {
			req.oAuthConsumer.getOAuthAccessToken(requestToken, session.requestSecret, accessVerifier,
				async function (err, accessToken, accessSecret, result) {
					if (!err) {
						await Sessions.insertAccessToken(req.db, req.newSessionId, accessToken, accessSecret);
						
						res.statusCode = 302;
						res.setHeader("Location", `/`);
						res.setHeader("Cache-Control", "no-cache, no-store");
						res.end();
					} else {
						res.end("Error getting access token: " + util.inspect(err));
					}
				}
			)
		} else {
			res.end("Token does not match");
		}
	} else {
		res.end("Invalid session");
	}

}