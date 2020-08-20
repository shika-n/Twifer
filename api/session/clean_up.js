const Sessions = require('../models/sessions');

export default async function (req, res, next) {
	Sessions.cleanUp(req.db).then((result) => {
		res.end(result);
	});
}