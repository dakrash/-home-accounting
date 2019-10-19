module.exports = function (db, express, hash) {

    let router = express.Router();

    let userId;

    let checkToken = require('../../services/checkToken');


    router.use(function (req, res, next) {
        let token = req.header('Authority');
        userId = hash.decodedJWT(token).id;
        checkToken(token, hash, db, res)
            .then(() => {
                console.log('api');
                console.log(req.url);
                var lists = require('./lists')(db, express, userId);
                let receipts = require('./receipts')(db, express, userId);
                let transactions = require('./transactions')(db, express, userId);
                router.use('/lists', lists);
                router.use('/receipts', receipts);
                router.use('/transactions', transactions);
                next()
            })
            .catch(() => {
                res.status(401).json({'result': 'unauthorized'})
            });
    });

    router.get('/profileData', function (req, res) {
        db.query(res, "Select email from users where id=$1", [userId])
            .then((row) => {
                if (row.length > 0) {
                    res.json({'result': [{'email': row[0].email}]})
                } else {
                    res.status(404).json({'result': 'Ошибка авторизации'})
                }
            })
    });


    return router

}
;