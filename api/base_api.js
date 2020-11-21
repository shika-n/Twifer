const cookie = require("cookie");
const fs = require("fs");
const mongodb = require("mongodb");
const oauth = require("oauth");
const requestIp = require("request-ip");
const urlUtil = require("url");
const util = require("util");

const Sessions = require("./models/sessions");

let appConfig = null;
let db = null;
let oAuthConsumer = null;

fs.readFile("app_config.json", "utf8", function (err, contents) {
	console.log("Config GET!");
	appConfig = JSON.parse(contents);

	const mongoClient = mongodb.MongoClient(
		`mongodb://${appConfig.db.user}:${appConfig.db.pwd}@${appConfig.db.host}:${appConfig.db.port}`,
		{
			useUnifiedTopology: true
		}
	);
	mongoClient.connect(function (err, client) {
		if (err) {
			console.log("Failed to connect to DB");
			return;
		}

		db = client.db(appConfig.db.name);
		console.log(`DB Connected! (${appConfig.db.name})`);
	});

	oAuthConsumer = newOAuthConsumer();
});

function newOAuthConsumer() {
	return new oauth.OAuth(
		"https://api.twitter.com/oauth/request_token",
		"https://twitter.com/oauth/access_token",
		appConfig.consumer.token,
		appConfig.consumer.secret,
		"1.0A",
		"http://localhost:3000/api/twitter/callback",
		"HMAC-SHA1"
	);
}

export default function (req, res, next) {
	if (oAuthConsumer == null) {
		res.end("OAuthConsumer is not ready yet. Please try again later.");
		return;
	}

	const { headers, method, url } = req;
	let body = [];
	req.on("data", (chunk) => {
		body.push(chunk);
	}).on("end", () => {
		body = Buffer.concat(body).toString();
		// at this point, `body` has the entire request body stored in it as a string

		if (body.length > 0) {
			req.body = JSON.parse(body); // body params
		}

		console.log(req.url);
		req.pathName = urlUtil.parse(req.url, true).pathname;
		req.params = urlUtil.parse(req.url, true).query; // url params
		req.ip = requestIp.getClientIp(req);
		
		if (req.headers.cookie !== undefined) {
			req.cookies = cookie.parse(req.headers.cookie);
		}

		req.db = db;
		req.appToken = appConfig.consumer;
		req.oAuthConsumer = oAuthConsumer;

		Sessions.checkSession(req, res).then((value) => {
			if (value === 1) {
				next();
			}
		}).catch((err) => {
			res.end(util.inspect(err));
		});
	});
}