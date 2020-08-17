export default async function (req, res, next) {
    console.log('tags fetch all');
    const result = await req.defQuery('tags', {});
    res.end(result);
}