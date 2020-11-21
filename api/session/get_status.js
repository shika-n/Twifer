const Sessions = require("../models/sessions");

export default async function (req, res, next) {
	Sessions.find(req.db, req.cookies.sessionId, req.ip).then((value) => {
		if (value === 1) {
			res.end("true");
		} else {
			res.end("false");
		}
	}).catch((error) => {
		res.end("false");
	});
}