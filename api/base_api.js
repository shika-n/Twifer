import { stringify } from 'querystring';

const mysql = require('mysql');
const util = require('util');
const fs = require('fs');
const oauth = require('oauth');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'twift',
});

db.connect(function(err) {
    if (err) {
        throw err;
    }
    console.log('Connected to DB!');
});

db.promiseQuery = util.promisify(db.query);

let appToken = null
fs.readFile('token.json', 'utf8', function (err, contents) {
    console.log("Token GET!");
    appToken = JSON.parse(contents);
});

function oAuthConsumer() {
    console.log(appToken.consumerToken);
    console.log(appToken.consumerSecret);
    return new oauth.OAuth(
        'https://api.twitter.com/oauth/request_token',
        'https://twitter.com/oauth/access_token',
        appToken.consumerToken,
        appToken.consumerSecret,
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
        db.defQuery = defQuery
        req.db = db;
        req.appToken = appToken;
        req.oAuthConsumer = oAuthConsumer();
        
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

async function defQuery(sqlQuery) {
    try {
        const result = await db.promiseQuery(sqlQuery);

        return JSON.stringify(result, null, '\t');
    } catch (err) {
        return err;
    }
}