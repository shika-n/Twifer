const sys = require('sys');

export default function (req, res, next) {
    console.log('Auth');
    console.log(req.cookies);
    console.log(req.signedCookies)
    req.oAuthConsumer.getOAuthRequestToken(
        function (err, token, secret, result) {
            if (err) {
                res.end('Error getting token: ' + sys.inspect(err));
            } else {
                console.log('Token: ' + token);
                console.log('Secret: ' + secret);

                res.writeHead(301, { Location: 'https://api.twitter.com/oauth/authorize?oauth_token=' + token });
                res.end();
            }
        }
    );
}