const mongodb = require('mongodb');
const util = require('util');
const fs = require('fs');
const oauth = require('oauth');

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
        }

        console.log('DB Connected!');
        db = client.db(appConfig.db.name);
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

        req.params = getParams(req.url);
        req.db = db;
        req.defQuery = defQuery;
        req.appToken = appConfig.consumer;
        req.oAuthConsumer = oAuthConsumer;
        
        next();
    });
}

function getParams(url) {
    let params = {};

    let splittedUrl = url.split('?');
    if (splittedUrl.length == 2) {
        splittedUrl[1].split('&').forEach(element => {
            let splittedParam = element.split('=');
            if (splittedParam.length == 2) {
                params[splittedParam[0]] = splittedParam[1];
            }
        });
    }

    return params;
}

async function defQuery(collection, query) {
    try {
        const result = await db.collection(collection).find(query).toArray();

        return JSON.stringify(result, null, '\t');
    } catch (err) {
        return util.inspect(err);
    }
}