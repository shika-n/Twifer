const util = require("util");
const Sessions = require("../models/sessions");

export default async function (req, res, next) {
	req.oAuthConsumer.getOAuthRequestToken(
		async function (err, requestToken, requestSecret, result) {
			if (!err && result.oauth_callback_confirmed) {
				await Sessions.insertRequestToken(req.db, req.newSessionId, requestToken, requestSecret);

				res.statusCode = 302;
				res.setHeader("Location", `https://api.twitter.com/oauth/authorize?oauth_token=${requestToken}`);
				res.setHeader("Cache-Control", "no-cache, no-store");
				res.end();
			} else {
				res.end("Error getting token: " + util.inspect(err));
			}
		}
	);
}