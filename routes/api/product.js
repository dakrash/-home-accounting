module.exports = function (db, express, userId) {
    let router = express.Router();
    let getProductList = require("../../services/getProductList");

    router.get('/', function (req, res, next) {
        getProductList(db, userId, res)
            .then((rows) => {
                res.status(200).json({'result': rows})
            })
    });

    router.post('/add', function (req, res, next) {
        let nameProduct = req.body.nameProduct;
        let categoryId = req.body.categoryId;
        let unit = req.body.unit;
        db.query(res, 'select * from products where category_id = $1 and name = $2 and unit = $3', [categoryId, nameProduct, unit])
            .then((row) => {
                if (row.length > 0) {
                    res.status(409).json({'result': 'Продукт должен быть уникальным в своей категории'})
                } else {
                    db.query(res, 'INSERT INTO products(createDate, user_id, name, category_id, unit) values ($1, $2, $3, $4, $5)', [new Date(), userId, nameProduct, categoryId, unit])
                        .then(() => {
                            res.status(200).json({'result': [{'message': 'ОК'}]})
                        })
                }
            })
    });

    router.post('/edit/:productId', function (req, res, next) {
            let productId = req.params.productId;
            let nameProduct = req.body.nameProduct;
            let categoryId = req.body.categoryId;
            let unit = req.body.unit;
            db.query(res, 'select * from products where category_id = $1 and name = $2 and unit = $3 and id != $4', [categoryId, nameProduct, unit, productId])
                .then((row) => {
                    if (row.length > 0) {
                        res.status(409).json({'result': 'Продукт должен быть уникальным в своей категории'})
                    } else {
                        db.query(res, 'update products set updateDate = $1, user_id = $2, name = $3, category_id = $4, unit = $5 where id = $6', [new Date(), userId, nameProduct, categoryId, unit, productId])
                            .then(() => {
                                res.status(200).json({'result': [{'message': 'ОК'}]})
                            })
                    }
                })
        }
    );

    router.get('/includeInLists/:productId', function (req, res) {
        let productId = req.params.productId;
        db.query(res, 'select sl.name from shopping_list_product as slp join shopping_list as sl on sl.id = slp.shopping_list_id where slp.product_id = $1', [productId])
            .then((rows) => {
                res.status(200).send({result: rows})
            })
    })

    router.post('/del/:productId', function (req, res, next) {
            let productId = req.params.productId;
            db.query(res, 'select category_id from products where id = $1', [productId])
                .then((category) => {
                    db.query(res, 'update transactions set product_id = $1, quantity = $1, category_id = $2 where product_id = $3', [null, category[0].category_id, productId])
                        .then(() => {
                            db.query(res, 'update checkproducts set product_id = $1, product_quantity = $1, category_id = $2 where product_id = $3', [null, category[0].category_id, productId])
                                .then(() => {
                                    db.query(res, 'delete from shopping_list_product where product_id = $1', [productId])
                                        .then(() => {
                                            db.query(res, 'delete from products where id = $1', [productId])
                                                .then((row) => {
                                                    res.status(200).json({'result': [{'message': 'ОК'}]})
                                                })
                                        })
                                })

                        })
                })
        }
    );


    return router


}