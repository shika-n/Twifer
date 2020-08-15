export default function (req, res, next) {
    req.db.defQuery(
        'SELECT * \
        FROM tags'
    ).then((result) => {
        res.end(result);
    });
}