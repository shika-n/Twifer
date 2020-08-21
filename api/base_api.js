const cookie = require('cookie');
const crypto = require('crypto');
const fs = require('fs');
const mongodb = require('mongodb');
const oauth = require('oauth');
const requestIp = require('request-ip');
const urlUtil = require('url');
const util = require('util');

const Sessions = require('./models/sessions');

let appConfig = null;
let db = null;

fs.readFile('appConfig.json', 'utf8', function (err, contents) {
	console.log('Config GET!');
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
});

function oAuthConsumer() {
	console.log('ConsumerToken: ' + appConfig.consumer.token);
	console.log('ConsumerSecret: ' + appConfig.consumer.secret);
	return new oauth.OAuth(
		'https://api.twitter.com/oauth/request_token',
		'https://twitter.com/oauth/access_token',
		appConfig.consumer.token,
		appConfig.consumer.secret,
		'1.0A',
		'http://localhost:3000/api/twitter/callback',
		'HMAC-SHA1'
	);
}

export default function (req, res, next) {
	const { headers, method, url } = req;
	let body = [];
	req.on('data', (chunk) => {
		body.push(chunk);
	}).on('end', () => {
		body = Buffer.concat(body).toString();
		// at this point, `body` has the entire request body stored in it as a string

		if (body.length > 0) {
			req.body = body;
		}

		req.params = urlUtil.parse(req.url, true).query;
		req.ip = requestIp.getClientIp(req);
		
		if (req.headers.cookie !== undefined) {
			req.cookies = cookie.parse(req.headers.cookie);
		}

		req.db = db;
		req.appToken = appConfig.consumer;
		req.oAuthConsumer = oAuthConsumer;

		getNewToken(req, res).then(() => {
			next();
		}).catch((err) => {
			res.end(util.inspect(err));
		});
	});
}

async function getNewToken(req, res) {
	const newToken = crypto.createHash('sha256').update(`${req.ip}-${Date.now()}`).digest('hex');
	console.log('Cookies: ' + util.inspect(req.cookies));
	if (req.cookies === undefined || req.cookies.sessionId === undefined || req.cookies.sessionId == '') {
		await Sessions.insertNew(req.db, newToken, req.ip);
		
		res.writeHead(
			200,
			{
				'Set-Cookie': `sessionId=${newToken}; Path=/; HttpOnly`
			}
		)
	} else {
		const session = await Sessions.find(req.db, req.cookies.sessionId, req.ip);
		console.log('Found session: ' + util.inspect(session));

		if (session == null) {
			res.writeHead(
				401,
				{
					'Set-Cookie': 'sessionId=; Path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT'
				}
			)
			throw 'Unauthorized';
		} else {
			await Sessions.renewToken(req.db, session, newToken);

			res.writeHead(
				200,
				{
					'Set-Cookie': `sessionId=${newToken}; Path=/; HttpOnly`
				}
			)
		}
	}
}