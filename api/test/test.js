export default function (req, res, next) {
	let result = '';
	if (req.body != null) {
		result += `body: ${JSON.stringify(req.body)}\n`;
	}

	result += `params: ${JSON.stringify(req.params)}\n`;
	result += `ip: ${req.ip}\n`;

	result += `headers: ${require('util').inspect(req.headers)}\n`;

	res.end(result);
}