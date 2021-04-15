
export const trimmer = (req, res, next) => {
    if (req.method === 'POST') {
        const temp = {};
        for (let [key, value] of Object.entries(req.body)) {
            key = (key).trim();
            if (isNaN(value)) {
                temp[key] = (value).trim();
            } else {
                temp[key] = (value).toString();
            }
            
        }
        req.body = temp;
    }

    if (req.method == 'GET' || req.method == 'DELETE' ) {
        const temp = {};
        for (let [key, value] of Object.entries(req.query)) {
            key = (key).trim();
            if (isNaN(value)) {
                temp[key] = (value).trim();
            } else {
                temp[key] = ((value).toString()).trim();
            }
            
        }
        req.query = temp;
    }
    
    next();
}
