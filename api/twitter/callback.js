export default function (req, res, next) {
	console.log('callback');
	console.log('RequestToken: ' + req.body.oauth_token);
	console.log('Verifier: ' + req.body.oauth_verifier);
	res.end('callback called!');
}