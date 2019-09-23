module.exports = function (db, express, userId) {
    let router = express.Router();

    let getWalletList = require('../../services/getWalletList');

    router.get('/', function (req, res) {
        getWalletList(db, res, userId)
            .then((rows) => {
                res.status(200).send({result: rows})
            })
    });

    router.post('/add', function (req, res) {
        let name = req.body.name;
        let firstBalance = req.body.firstBalance;
        db.query(res, 'select * from wallets where name = $1 and user_id = $2 and deleted = $3', [name, userId, 0])
            .then((row) => {
                if (row.length > 0) {
                    res.status(409).json({'result': 'Название кошелька должно быть уникальным'})
                } else {
                    db.query(res, 'insert into wallets(firstBalance, name, user_id, createdate, deleted) values($1, $2, $3, $4, $5)', [firstBalance, name, userId, new Date(), 0])
                        .then(() => {
                            res.status(200).send({result: [{message: 'OK'}]})
                        })
                }
            })
    });

    router.post('/edit/:id', function (req, res) {
        let name = req.body.name;
        let id = req.params.id;
        let firstBalance = req.body.firstBalance;
        db.query(res, 'select * from wallets where name = $1 and user_id = $2 and id != $3 and deleted = $3', [name, userId, id, 0])
            .then((row) => {
                if (row.length > 0) {
                    res.status(409).json({'result': 'Название кошелька должно быть уникальным'})
                } else {
                    db.query(res, 'update wallets set name = $1, updatedate = $2, firstBalance = $3  where id = $4', [name, new Date(), firstBalance, id])
                        .then(() => {
                            res.status(200).send({result: [{message: 'OK'}]})
                        })
                }
            })
    });

    router.post('/del/:id', function (req, res) {
        let id = req.params.id
        db.query(res, 'update checklist set deleted = $1 where wallet_id = $2', [1, id])
            .then((row) => {
                db.query(res, 'update operations set deleted = $1 where wallet_id = $2', [1, id])
                    .then(() => {
                        db.query(res, 'update wallets set deleted = $1 where id = $2', [1, id])
                            .then(() => {
                                res.status(200).send({result: [{message: 'OK'}]})
                            })
                    })
            })
    });

    return router
}