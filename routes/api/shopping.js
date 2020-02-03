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
                            // res.render('lists.hbs', {
                            //     path: '../../',
                            //     title: "Семейная статистика",
                            //     rows: {
                            //         header: result[0].name,
                            //         id: idList,
                            //         categories: arrCategories
                            //     },
                            //     button: [
                            //         {id: 'addPosition', text: 'Добавить позицию', class: 'btn-custom-yellow'},
                            //         {id: 'editList', text: 'Изменить список', class: 'btn-custom-yellow'},
                            //         {id: 'delList', class: 'btn-custom-red', text: 'Удалить список'}
                            //     ],
                            //     shoppingLists: shoppingLists,
                            //     script: ['../../js/shoppingList.js', '../../js/counter.js'],
                            //     email: email
                            // })
                            // console.log(arrCategories);
                            var items = [];
                            arrCategories.forEach(category => {
                                let pos = category.items;
                                pos.forEach(item => {
                                    items.push({ id: item.idRow,
                                        productId: item.idProduct,
                                        quantity: item.quantity,
                                        comment: item.comment,
                                        check: item.checkbox})
                                })

                            })
                            // arrCategories.map(category => {
                            //     let position = category.items;
                            //     console.log(position)
                            //     return {
                            //         id: position.id,
                            //         productId: position.idProduct,
                            //         quantity: position.quantity,
                            //         comment: position.comment,
                            //         check: position.checkbox
                            //     }
                            // })
                            res.status(200).json({name: result[0].name, products: items})
                        })
                } else {
                    res.status(404).send('Список не найден')
                }
            })
        // let idList = req.params.id;
        // getList(db, idList, userId, res)
        //     .then((result) => {
        //         if (result.length > 0) {
        //             res.status(200).send(result)
        //         } else {
        //             res.status(404).send('Список не найден')
        //         }
        //     })
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
