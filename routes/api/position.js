module.exports = function (db, express) {
    let router = express.Router();

    router.get('/:idList/row/:idRow', function (req, res) {
        let idRow = req.params.idRow;
        db.query(res, 'select * from shopping_list_product where id = $1', [idRow])
            .then((rows) => {
                if (rows.length > 0)
                    res.status(200).send({result: rows})
                else
                    res.status(404).send({result: 'Продукт не найден'})
            })
    })

    router.post('/:idList/row/:idRow/edit', function (req, res) {
        let idRow = req.params.idRow;
        let productId = req.body.id;
        let productName = req.body.name;
        let productCategoryId = req.body.categoryId;
        let productQuantity = req.body.quantity;
        let productComment = req.body.comment;
        let reqText = 'update shopping_list_product set updatedate = $1, quantity = $2, comment = $3, ';
        let params = [new Date(), productQuantity];

        function numbParam() {
            return params.length + 1
        }

        if (productComment) {
            params.push(productComment)
        } else {
            params.push(null)
        }

        if (productId) {
            reqText += 'product_id = $' + numbParam() + ', ';
            params.push(productId);
            reqText += 'product_name = $' + numbParam() + ', ';
            params.push(null);
            reqText += 'category_id = $' + numbParam() + '';
            params.push(null)
        } else if (productName) {
            reqText += 'product_id = $' + numbParam() + ', ';
            params.push(null);
            if (productCategoryId) {
                reqText += 'category_id = $' + numbParam() + ', ';
                params.push(productCategoryId)
            }
            reqText += 'product_name = $' + numbParam();
            params.push(productName)
        }

        reqText += ' where id = $' + numbParam();
        params.push(idRow)
        db.query(res, reqText, params)
            .then((rows) => {
                res.status(200).send({'result': [{message: 'OK'}]})
            })
    })

    router.post('/:idList/row/:idRow/del', function (req, res) {
        let idRow = req.params.idRow;
        db.query(res, 'delete from shopping_list_product where id = $1', [idRow])
            .then(() => {
                res.status(200).send({result:[{message:'OK'}]})
            })
    });

    router.post('/:idList/add', function (req, res) {
        let idList = req.params.idList;
        let productId = req.body.id;
        let productName = req.body.name;
        let productCategoryId = req.body.categoryId;
        let productQuantity = req.body.quantity;
        let productComment = req.body.comment;
        let reqText = 'insert into shopping_list_product(checkbox, createdate, shopping_list_id, quantity, ';
        let params = [0, new Date(), idList, productQuantity];

        if (productComment) {
            reqText += 'comment, ';
            params.push(productComment)
        }
        if (productId) {
            reqText += 'product_id)';
            params.push(productId)
        } else if (productName) {
            if (productCategoryId) {
                reqText += 'category_id, ';
                params.push(productCategoryId)
            }
            reqText += 'product_name)';
            params.push(productName)
        }
        reqText += ' values(';
        params.forEach(function (el, i) {
            if (i !== 0)
                reqText += ', ';
            reqText += '$' + (i + 1);
        })
        reqText += ')';
        db.query(res, reqText, params)
            .then((rows) => {
                res.status(200).send({'result': [{message: 'OK'}]})
            })
    })

    return router
}