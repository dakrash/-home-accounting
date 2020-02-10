module.exports = function (db, express, userId) {
    let router = express.Router();
    let getCheck = require('../../services/getCheckProducts');
    let updateStateReceipt = require('../../services/updateStateReceipt');
    let requestGetNalog = require('../../services/requestGetNalog');
    let refreshCheckPosiions = require('../../services/refreshCheckPosition');

    router.get('/:check_id', function (req, res) {
        getCheck(db, req.params.check_id, res)
            .then((row) => {
                res.json({'result': row})
            })
            .catch(() => {
                res.sendStatus(404)
            });
    });

    router.get('/:check_id/app', function (req, res) {
        getCheck(db, req.params.check_id, res)
            .then((rows) => {
                res.json(rows)
            })
            .catch(() => {
                res.sendStatus(404)
            });
    });

    router.post('/:check_id/success', function (req, res) {
        let checkId = req.params.check_id;
        let walletId = req.body.walletId;
        let checkPositions = req.body.positions;
        refreshCheckPosiions(db, res, checkPositions)
            .then(() => {
                updateStateReceipt(db, res, checkId, 1, walletId)
                    .then(() => {
                        res.status(200).send({result: [{message: 'OK'}]})
                    })
            })
    });


    router.post('/:check_id/cancel', function (req, res) {
        let checkId = req.params.check_id;
        updateStateReceipt(db, res, checkId, 0)
            .then(() => {
                res.status(200).send({result: [{message: 'OK'}]})
            })
    });

    router.post('/:check_id/del', function (req, res) {
        let checkId = req.params.check_id;
        db.query(res, 'update checklist set deleted = $1, updatedate = $2 where id = $3', [1, new Date(), checkId])
            .then(() => {
                res.status(200).json({result: [{message: 'OK'}]})
            })
    });

    router.post('/:check_id/save', function (req, res) {
        let checkPositions = req.body.positions;
        refreshCheckPosiions(db, res, checkPositions)
            .then(() => {
                res.status(200).send({result: [{message: 'OK'}]})
            })
    });

    router.get('/:check_id/state', function (req, res) {
        let checkId = req.params.check_id;
        db.query(res, 'select * from checklist where id = $1', [checkId])
            .then((result) => {
                let params = {
                    t: result[0].t,
                    s: result[0].sum,
                    fn: result[0].fn,
                    i: result[0].i,
                    fp: result[0].fp,
                    n: result[0].n
                };
                requestGetNalog(db, params, res, userId)
            })

    });


    router.get('/', function (req, res) {
        let params = {
            t: req.query.t,
            s: req.query.s,
            fn: req.query.fn,
            i: req.query.i,
            fp: req.query.fp,
            n: req.query.n
        };
        requestGetNalog(db, params, res, userId)
    });

    return router
}
