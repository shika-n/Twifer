export default async function (req, res, next) {
	console.log('tags fetch all');
	const result = await req.db.collection('tags').find({}).toArray();
	res.end(require('util').inspect(result));
}