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

        req.params = getParams(req.url)
        
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