export default function (req, res, next) {
    if (req.body != null) {
        res.end('test: ' + JSON.stringify(req.body));
    } else {
        res.end('test: ' + req.params.id);
    }
}