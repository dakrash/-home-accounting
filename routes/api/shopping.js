module.exports = function (db, express, userId) {
    let router = express.Router();
    let getList = require('../../services/getList');
    let getLists = require('../../services/getShoppingLists');
    let getListData = require('../../services/getListData');


    let position = require('./position')(db, express);

    router.use('/position', position);

    router.get('/', function (req, res, next) {
        getLists(db, res, userId)
            .then((rows) => {
                res.status(200).send({'result': rows})
            })
    })

    router.get('/newRoute', function (req, res, next) {
        getLists(db, res, userId)
            .then((rows) => {
                res.status(200).send(rows)
            })
    })


    router.get('/newRoute/:id', function (req, res, next) {
        let idList = req.params.id;
        getList(db, idList, userId, res)
            .then((result) => {
                if (result.length > 0) {
                    res.status(200).send(result)
                } else {
                    res.status(404).send('Список не найден')
                }
            })
    });

    router.get('/newRoute/:id/app', function (req, res, next) {
        let idList = req.params.id;
        getList(db, idList, userId, res)
            .then((result) => {
                if (result.length > 0) {
                    getListData(res, db, idList)
                        .then((arrCategories) => {
                            var items = [];
                            arrCategories.forEach(category => {
                                category.subcategories.forEach((subc, j) => {
                                    let pos = subc.items;
                                    pos.forEach(item => {
                                        items.push({ id: item.idRow,
                                            productId: item.idProduct,
                                            productName: item.name,
                                            productUnit: item.unit,
                                            categoryId: subc.id,
                                            categoryName: subc.name,
                                            quantity: item.quant,
                                            comment: item.comment,
                                            check: item.checkbox ? true : false})
                                    })
                                });
                                let pos = category.items;
                                pos.forEach(item => {
                                    items.push({ id: item.idRow,
                                        productId: item.idProduct,
                                        productName: item.name,
                                        productUnit: item.unit,
                                        categoryId: category.id,
                                        categoryName: category.name,
                                        quantity: item.quant,
                                        comment: item.comment,
                                        check: item.checkbox ? true : false})
                                })

                            })
                            res.status(200).json(items)
                        })
                } else {
                    res.status(404).send('Список не найден')
                }
            })
    });

    router.get('/getName/:id', function (req, res, next) {
        let idList = req.params.id;
        getList(db, idList, userId, res)
            .then((rows) => {
                res.status(200).send({'result': [{name: rows[0].name}]})
            })
    });

    router.get('/getName/:id/app', function (req, res, next) {
        let idList = req.params.id;
        getList(db, idList, userId, res)
            .then((rows) => {
                res.status(200).send({'name': rows[0].name})
            })
    })

    router.post('/upCheckboxVal', function (req, res, next) {
        let values = req.body.values;
        values.forEach(function (el, i) {
            updateCheckboxes(el, res)
                .then(() => {
                    if (!values[i + 1]) {
                        res.status(200).send({'result': [{message: 'OK'}]})
                    }
                })
        })
    })

        router.post('/upCheckboxVal/app', function (req, res, next) {
            let values = req.body.values;
            values.forEach(function (el, i) {
                el = JSON.parse(el);
                updateCheckboxes(el, res)
                    .then(() => {
                        if (!values[i + 1]) {
                            res.status(200).send({'result': 'OK'})
                        }
                    })
            })
        })


        function updateCheckboxes(el, res) {
            return new Promise((resolve) => {
                db.query(res, 'update shopping_list_product set checkbox = $1, updatedate = $2 where id = $3', [el.val ? 1 : 0, new Date(), el.id])
                    .then((rows) => {
                        resolve()
                    })
            })
        }
    // })

    router.post('/add', function (req, res, next) {
        let nameList = req.body.nameList;
        db.query(res, 'insert into shopping_list(user_id, name, createdate) values($1, $2, $3)', [userId, nameList, new Date()])
            .then((rows) => {
                res.status(200).send({'result': [{message: 'OK'}]})
            })
    })

    router.post('/add/app', function (req, res, next) {
        let nameList = req.body.nameList;
        db.query(res, 'insert into shopping_list(user_id, name, createdate) values($1, $2, $3) returning id', [userId, nameList, new Date()])
            .then((rows) => {
                res.status(200).json({result : rows[0].id})
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

    router.post('/edit/:id/app', function (req, res, next) {
        let idList = req.params.id;
        let nameList = req.body.nameList;

        db.query(res, 'update shopping_list set name = $1, updatedate = $2 where id = $3', [nameList, new Date(), idList])
            .then((rows) => {
                res.status(200).send({'result': 'OK'})
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

    router.post('/del/:id/app', function (req, res, next) {
        let idList = req.params.id;
        db.query(res, 'delete from shopping_list_product where shopping_list_id = $1', [idList])
            .then((rows) => {
                db.query(res, 'delete from shopping_list where id = $1', [idList])
                    .then((rows) => {
                        res.status(200).send({'result': 'OK'})
                    })
            })
    })

    return router
}
