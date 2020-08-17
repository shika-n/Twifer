//const util = require('util');

export default function (req, res, next) {
    console.log('Auth');
    console.log('consumerToken: ' + req.appToken.token);
    console.log('consumerSecret: ' + req.appToken.secret);
    
    req.oAuthConsumer().getOAuthRequestToken(
        function (err, oAuthToken, oAuthSecret, result) {
            if (err) {
                res.end('Error getting token: ' + util.inspect(err));
            } else {
                console.log('oAuthToken: ' + oAuthToken);
                console.log('oAuthSecret: ' + oAuthSecret);
                res.writeHeader(
                    302,
                    {
                        Location: `https://api.twitter.com/oauth/authorize?oauth_token=${oAuthToken}`,
                        "Cache-Control": "no-cache, no-store"
                    }
                );
                res.end();
            }
        }
    );
}