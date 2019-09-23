module.exports = function (db, express, userId) {
    let router = express.Router();

    router.post('/add', function (req, res) {
        let date = req.body.date;
        let items = req.body.items;
        let wallet = req.body.wallet;
        let comment = req.body.comment;

        db.query(res, 'insert into operations(createdate, wallet_id, date, deleted, comment) values($1, $2, $3, $4, $5) returning id', [new Date, wallet, date, 0, comment])
            .then((row) => {
                let id = row[0].id;
                insertTransaction(id, items, 0)
                    .then(() => {
                        res.status(200).json({result: [{message: 'OK'}]})
                    })
            });

        function insertTransaction(id, arr, i) {
            return new Promise((resolve) => {
                let transactionData = arr[i];
                let query = 'insert into transactions(operation_id, sum, deleted, createdate, ';
                let params = [id, transactionData.summ, 0, new Date()];
                if (transactionData.productId) {
                    query += 'product_id, quantity)';
                    params.push(transactionData.productId, transactionData.quantity)
                } else {
                    query += 'category_id)';
                    params.push(transactionData.categoryId)
                }
                query += ' values(';
                params.forEach(function (el, j) {
                    query += '$' + (j + 1);
                    if (params[j + 1] !== undefined)
                        query += ', ';
                    else
                        query += ')'
                });
                db.query(res, query, params)
                    .then(() => {
                        i++;
                        if (arr[i]) {
                            insertTransaction(id, arr, i)
                                .then(() => {
                                    resolve()
                                })
                        } else {
                            resolve()
                        }
                    })
            })
        }
    });

    router.post('/del/:id', function(req, res){
        let id = req.params.id;
        db.query(res, 'update transactions set deleted = $1 where operation_id = $2', [1, id])
            .then(() =>{
                db.query(res, 'update operations set deleted = $1 where id = $2', [1, id])
                    .then(() => {
                        res.status(200).json({result:[{message:'OK'}]})
                    })
            })
    })

    router.post('/edit/:id', function (req, res) {
        let id = req.params.id;
        let date = req.body.date;
        let items = req.body.items;
        let wallet = req.body.wallet;
        let comment = req.body.comment;


        db.query(res, 'update operations set createdate = $1, wallet_id = $2, date = $3, comment = $4 where id = $5', [new Date, wallet, date, comment, id])
            .then((row) => {
                db.query(res, 'select * from transactions where operation_id = $1 and deleted !=$2', [id, 1])
                    .then((transactions) => {
                        let forDel = [];
                        let forUpdate = [];
                        let forInsert = [];
                        transactions.forEach(function (el) {
                            let fl = 0;
                            items.forEach(function (elem, j) {
                                if (elem.id) {
                                    if (el.id.toString() === elem.id.toString()) {
                                        forUpdate.push(elem);
                                        fl++
                                    }
                                }
                            });
                            if (fl === 0) {
                                forDel.push(el)
                            }
                        });
                        items.forEach(function (elem, j) {
                            if (!elem.id) {
                                forInsert.push(elem);

                            }
                        });
                        if (forUpdate.length > 0) {
                            updateTransaction(forUpdate, 0)
                                .then(() => {
                                    if (forInsert.length > 0) {
                                        insertTransaction(forInsert, 0)
                                            .then(() => {
                                                if (forDel.length > 0) {
                                                    deleteTransaction(forDel, 0)
                                                        .then(() => {
                                                            res.status(200).json({result: [{message: 'OK'}]})
                                                        })
                                                } else {
                                                    res.status(200).json({result: [{message: 'OK'}]})
                                                }
                                            })
                                    } else if (forDel.length > 0) {
                                        deleteTransaction(forDel, 0)
                                            .then(() => {
                                                res.status(200).json({result: [{message: 'OK'}]})
                                            })
                                    } else {
                                        res.status(200).json({result: [{message: 'OK'}]})
                                    }
                                })
                        } else if (forInsert.length > 0) {
                            insertTransaction(forInsert, 0)
                                .then(() => {
                                    if (forDel.length > 0) {
                                        deleteTransaction(forDel, 0)
                                            .then(() => {
                                                res.status(200).json({result: [{message: 'OK'}]})
                                            })
                                    } else {
                                        res.status(200).json({result: [{message: 'OK'}]})
                                    }
                                })
                        } else if (forDel.length > 0) {
                            deleteTransaction(forDel, 0)
                                .then(() => {
                                    res.status(200).json({result: [{message: 'OK'}]})
                                })
                        }
                    })

            });


        function updateTransaction(arr, i) {
            return new Promise((resolve) => {
                let transactionData = arr[i];
                let query = 'update transactions set sum = $1, updatedate = $2, ';
                let params = [transactionData.summ, new Date()];
                if (transactionData.productId) {
                    params.push(transactionData.productId);
                    query += 'product_id = $' + params.length;
                    params.push(transactionData.quantity);
                    query += ', quantity = $' + params.length;
                    params.push(null);
                    query += ', category_id = $' + params.length;
                } else {
                    params.push(transactionData.categoryId);
                    query += 'category_id = $' + params.length;
                    params.push(null);
                    query += ', product_id = $' + params.length;
                    params.push(null);
                    query += ', quantity = $' + params.length;
                }
                params.push(transactionData.id);
                query += ' where id = $' + params.length;
                db.query(res, query, params)
                    .then(() => {
                        i++;;
                        if (arr[i]) {
                            return updateTransaction(arr, i)
                                .then(() => {
                                    resolve()
                                })
                        } else {
                            resolve()
                        }
                    })
            })
        }

        function insertTransaction(arr, i) {
            return new Promise((resolve) => {
                let transactionData = arr[i];
                let query = 'insert into transactions(operation_id, sum, deleted, createdate, ';
                let params = [id, transactionData.summ, 0, new Date()];
                if (transactionData.productId) {
                    query += 'product_id, quantity)';
                    params.push(transactionData.productId, transactionData.quantity)
                } else {
                    query += 'category_id)';
                    params.push(transactionData.categoryId)
                }
                query += ' values(';
                params.forEach(function (el, j) {
                    query += '$' + (j + 1);
                    if (params[j + 1] !== undefined)
                        query += ', ';
                    else
                        query += ')'
                });
                db.query(res, query, params)
                    .then(() => {
                        i++;
                        if (arr[i]) {
                            return insertTransaction(arr, i)
                                .then(() => {
                                    resolve()
                                })
                        } else {
                            resolve()
                        }
                    })
            })
        }

        function deleteTransaction(arr, i) {
            return new Promise((resolve) => {
                let transactionData = arr[i];
                let query = 'update transactions set deleted = $1, updatedate = $2 where id = $3';
                let params = [1, new Date(), transactionData.id];
                db.query(res, query, params)
                    .then(() => {
                        i++;
                        if (arr[i]) {
                            return deleteTransaction(arr, i)
                                .then(() => {
                                    resolve()
                                })
                        } else {
                            resolve()
                        }
                    })
            })
        }

    });

    return router
}