module.exports = function (db, express, userId) {
    let router = express.Router();
    let getList = require('../../services/getList');
    let getLists = require('../../services/getShoppingLists');


    let position = require('./position')(db, express)

    router.use('/position', position);

    router.get('/', function (req, res, next) {
        getLists(db, res, userId)
            .then((rows) => {
                res.status(200).send({'result': rows})
            })
    })

    router.get('/getName/:id', function (req, res, next) {
        let idList = req.params.id;
        getList(db, idList, userId, res)
            .then((rows) => {
                res.status(200).send({'result': [{name: rows[0].name}]})
            })
    })

    router.post('/upCheckboxVal', function (req, res, next) {
        let values = req.body.values;
        values.forEach(function (el, i) {
            updateCheckboxes(el)
                .then(() => {
                    if (!values[i + 1]) {
                        res.status(200).send({'result': [{message: 'OK'}]})
                    }
                })
        })


        function updateCheckboxes(el) {
            return new Promise((resolve) => {
                db.query(res, 'update shopping_list_product set checkbox = $1, updatedate = $2 where id = $3', [el.val, new Date(), el.id])
                    .then((rows) => {
                        resolve()
                    })
            })
        }
    })

    router.post('/add', function (req, res, next) {
        console.log('test shopping add');
        let nameList = req.body.nameList;
        db.query(res, 'insert into shopping_list(user_id, name, createdate) values($1, $2, $3)', [userId, nameList, new Date()])
            .then((rows) => {
                res.status(200).send({'result': [{message: 'OK'}]})
            })
    })


    router.post('/edit/:id', function (req, res, next) {
        let idList = req.params.id;
        let nameList = req.body.nameList;

        db.query(res, 'update shopping_list set name = $1, updatedate = $2 where id = $3', [nameList, new Date(), idList])
            .then((rows) => {
                res.status(200).send({'result': [{message: 'OK'}]})
            })
    })

    router.post('/del/:id', function (req, res, next) {
        let idList = req.params.id;
        db.query(res, 'delete from shopping_list_product where shopping_list_id = $1', [idList])
            .then((rows) => {
                db.query(res, 'delete from shopping_list where id = $1', [idList])
                    .then((rows) => {
                        res.status(200).send({'result': [{message: 'OK'}]})
                    })
            })
    })

    return router
}