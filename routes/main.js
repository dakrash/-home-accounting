module.exports = function (db, app, hash, express) {
    let checkToken = require('../services/checkToken');
    let getCategory = require('../services/getCategory');
    let getProductList = require('../services/getProductList');
    let getCheckProducts = require('../services/getCheckProducts');
    let getCheckToDisplay = require('../services/getCheckToDisplay');
    let getList = require('../services/getList');
    let getListData = require('../services/getListData');
    let getDateAnStatesReceipts = require('../services/getDateAndStatesReceipt');
    let getDataTransactions = require('../services/getDataTransactions');
    let getWalletList = require('../services/getWalletList');
    let formatDate = require('../services/formatDate');
    let arrWithSelectElem = require('../services/arrWithSelectElem');
    let token;
    let email;
    let userId;
    let shoppingLists;


    app.use(function (req, res, next) {
        if (req.cookies.token) {
            token = req.cookies.token;
            checkToken(token, hash, db, res)
                .then(() => {
                    email = hash.decodedJWT(token).email;
                    userId = hash.decodedJWT(token).id;
                    db.query(res, 'select id, name from shopping_list where user_id = $1 order by name', [userId])
                        .then((rows) => {
                            shoppingLists = rows;
                            let tables = require('./tables')(db, express, userId);
                            app.use('/table', tables);
                            next()
                        })
                })
                .catch((err) => {
                    if (err) {
                        res.status(500).send('Ошибка подключения к базе данных')
                    } else {
                        res.redirect('/auth')
                    }
                })
        } else
            res.redirect('/auth')
    });


    app.get('/', function (req, res) {
        res.render('start.hbs', {
            path: '',
            title: "Семейная статистика",
            shoppingLists: shoppingLists,
            email: email
        })
    });

    app.get('/receipts', function (req, res) {
        res.render('createReceipt.hbs', {
            path: '../',
            title: "Семейная статистика",
            script: ['../js/createReceipt.js'],
            email: email,
            shoppingLists: shoppingLists,
            elem: [
                {
                    id: 'qr-code',
                    label: 'Введите текст отсканироваонного QR-кода с чека или <a class="btn btn-custom-yellow btn-custom-ellipse" href="/qr_scaner">Сканировать QR-code</a>',
                    type: 'text'
                }
            ],
            buttonText: 'Получить подробную информацию',
            onsubmit: 'return getTransaction($("#qr-code"))'
        })
    });

    app.get('/refill', function (req, res) {
        getCategory(db, userId, res)
            .then((categories) => {
                getWalletList(db, res, userId)
                    .then((wallets) => {
                        let resultCategories = [];
                        categories.forEach(function (el, i) {
                            if (el.coef === 1) {
                                resultCategories.push(el)
                            }
                        });
                        res.render('transactions.hbs', {
                            path: '../',
                            title: "Семейная статистика",
                            categories: resultCategories,
                            type: {categories: true},
                            script: ['../js/createTransaction.js'],
                            wallets: wallets,
                            email: email,
                            shoppingLists: shoppingLists
                        })
                    })
            })
    });

    app.get('/expense', function (req, res) {
        getCategory(db, userId, res)
            .then((categories) => {
                getProductList(db, userId, res)
                    .then((products) => {
                        getWalletList(db, res, userId)
                            .then((wallets) => {
                                let resultCategories = [];
                                categories.forEach(function (el, i) {
                                    if (el.coef === -1) {
                                        resultCategories.push(el)
                                    }
                                });
                                console.log(products);
                                res.render('transactions.hbs', {
                                    path: '../',
                                    title: "Семейная статистика",
                                    products: products,
                                    categories: resultCategories,
                                    wallets: wallets,
                                    type: {products: true},
                                    script: ['../js/createTransaction.js', '../js/counter.js'],
                                    email: email,
                                    shoppingLists: shoppingLists
                                })
                            })
                    })
            })
    });

    app.get('/history/transactions/:id', function (req, res, next) {
        let id = req.params.id;
        db.query(res, 'select * from operations where id = $1 and deleted != $2', [id, 1])
            .then((row) => {
                if (row.length > 0) {
                    db.query(res, 'select t.*, coalesce(ct1.coef, ct2.coef) as coef ' +
                        'from transactions as t ' +
                        'left join products as p on t.product_id = p.id ' +
                        'left join category as ct1 on p.category_id = ct1.id ' +
                        'left join category as ct2 on t.category_id = ct2.id ' +
                        'where t.deleted != $2 and t.operation_id = $1 group by t.id, ct1.coef, ct2.coef', [id, 1])
                        .then((transactions) => {
                            getWalletList(db, res, userId)
                                .then((wallets) => {
                                    getCategory(db, userId, res)
                                        .then((categories) => {
                                            let renderParams = {
                                                path: '../../',
                                                title: "Семейная статистика",
                                                script: ['../../js/createTransaction.js', '../../js/counter.js'],
                                                email: email,
                                                wallets: arrWithSelectElem(wallets, row[0].wallet_id).arr,
                                                shoppingLists: shoppingLists,
                                                date: formatDate(row[0].date),
                                                idTransaction: id,
                                                comment: row[0].comment
                                            };
                                            if (transactions[0].coef === -1) {
                                                renderParams.type = {products: true};
                                                getProductList(db, userId, res)
                                                    .then((products) => {
                                                        let resultCategories = [];
                                                        categories.forEach(function (el, i) {
                                                            if (el.coef === -1) {
                                                                resultCategories.push(el)
                                                            }
                                                        });
                                                        products.forEach(function (el, i) {
                                                            el.id = el.product_id
                                                        })
                                                        transactions.forEach(function (el, i) {
                                                            el.type = {};
                                                            if (el.category_id) {
                                                                el.type.categories = true
                                                            } else if (el.product_id) {
                                                                el.type.products = true
                                                            }
                                                            el.products = arrWithSelectElem(products, el.product_id).arr;
                                                            el.categories = arrWithSelectElem(resultCategories, el.category_id).arr;
                                                        })
                                                        renderParams.elemsTransaction = transactions;
                                                        res.render('transactions.hbs', renderParams)
                                                    })
                                            } else if (transactions[0].coef === 1) {
                                                renderParams.type = {categories: true};
                                                let resultCategories = [];
                                                categories.forEach(function (el, i) {
                                                    if (el.coef === 1) {
                                                        resultCategories.push(el)
                                                    }
                                                });
                                                transactions.forEach(function (el, i) {
                                                    el.type = {};
                                                    el.type.categories = true;
                                                    el.categories = arrWithSelectElem(resultCategories, el.category_id).arr;
                                                    // el.categories.push({id:111, select:'selected', nameWithParent:'lalala'})
                                                    console.log('el.categories');
                                                    console.log(el.categories)
                                                })
                                                renderParams.elemsTransaction = transactions;
                                                res.render('transactions.hbs', renderParams)
                                            }
                                        })
                                })
                        })
                } else {
                    res.sendStatus(404)
                }
            })
    });

    app.get('/receipts/:check_id', function (req, res) {
        let checkId = req.params.check_id;
        db.query(res, 'select * from checklist where id = $1 and deleted = $2', [checkId, 0])
            .then((result) => {
                if (result.length > 0) {
                    if (result[0].success !== 1) {
                        getCheckProducts(db, checkId, res)
                            .then((row) => {
                                getCheckToDisplay(row, db, res, userId)
                                    .then((rows) => {
                                        getWalletList(db, res, userId)
                                            .then((wallets) => {
                                                res.render('createReceipt.hbs', {
                                                    path: '../',
                                                    title: "Семейная статистика",
                                                    script: ['../js/createReceipt.js', '../js/actionWithReceipts.js', '../../js/counter.js'],
                                                    id: req.params.check_id,
                                                    email: email,
                                                    shoppingLists: shoppingLists,
                                                    receipt: getDateAnStatesReceipts(result)[0],
                                                    items: rows.items,
                                                    totalSum: Math.round(rows.totalSum * 100) / 100,
                                                    elem: [
                                                        {
                                                            id: 'qr-code',
                                                            label: 'Введите текст отсканироваонного QR-кода с чека или <a class="btn btn-custom-yellow btn-custom-ellipse" href="/qr_scaner">Сканировать QR-code</a>',
                                                            type: 'text'
                                                        }
                                                    ],
                                                    wallets: wallets,
                                                    buttonText: 'Получить подробную информацию',
                                                    onsubmit: 'return getTransaction($("#qr-code"))'
                                                })
                                            })
                                    })
                            })
                    } else {
                        res.status(422).send('Чек уже проведен. Перейти к <a href="/history/receipts">истории транзакций</a>')
                    }
                } else {
                    res.sendStatus(404)
                }
            })
    });


    app.get('/qr_scaner', function (req, res) {
        res.sendfile('views/qrScaner.html')
    });


    app.get('/lists/products', function (req, res) {
        res.render('lists.hbs', {
            path: '../../',
            title: "Семейная статистика",
            cols: ['Категория', 'Продукт', 'Единица измерения', '', ''],
            button: [{id: 'addProduct', text: 'Добавить позицию', class: 'btn-custom-yellow'}],
            shoppingLists: shoppingLists,
            script: ['../../js/productList.js'],
            email: email
        })
    });

    app.get('/lists/categories', function (req, res) {
        res.render('lists.hbs', {
            path: '../../',
            title: "Семейная статистика",
            cols: ['Тип', 'Наименование', '', ''],
            button: [{id: 'addCategory', text: 'Добавить категорию', class: 'btn-custom-yellow'}],
            shoppingLists: shoppingLists,
            script: ['../../js/categoryList.js'],
            email: email
        })
    });

    app.get('/lists/wallets', function (req, res) {
        res.render('lists.hbs', {
            path: '../../',
            title: "Семейная статистика",
            cols: ['Наименование', 'Первоначальный баланс', 'Текущий баланс', '', ''],
            button: [{id: 'addWallet', text: 'Добавить кошелек', class: 'btn-custom-yellow'}],
            shoppingLists: shoppingLists,
            script: ['../../js/walletList.js'],
            email: email
        })
    });

    app.get('/lists/shopping/:id', function (req, res, next) {
        let idList = req.params.id;
        getList(db, idList, userId, res)
            .then((result) => {
                if (result.length > 0) {
                    getListData(res, db, idList)
                        .then((arrCategories) => {
                            res.render('lists.hbs', {
                                path: '../../',
                                title: "Семейная статистика",
                                rows: {
                                    header: result[0].name,
                                    id: idList,
                                    categories: arrCategories
                                },
                                button: [
                                    {id: 'addPosition', text: 'Добавить позицию', class: 'btn-custom-yellow'},
                                    {id: 'editList', text: 'Изменить список', class: 'btn-custom-yellow'},
                                    {id: 'delList', class: 'btn-custom-red', text: 'Удалить список'}
                                ],
                                shoppingLists: shoppingLists,
                                script: ['../../js/shoppingList.js', '../../js/counter.js'],
                                email: email
                            })
                        })
                } else {
                    res.status(404).send('Список не найден')
                }
            })
    });


    app.get('/history/receipts', function (req, res, next) {
        db.query(res, 'select c.*, w.name as wallet_name from checklist as c left join wallets as w on w.id = c.wallet_id where c.user_id = $1 and c.deleted = $2', [userId, 0])
            .then((rows) => {
                rows.forEach(function (el, i) {
                    el.date = formatDate(el.date);
                    el.createdate = formatDate(el.createdate);
                    el.href = '/history/receipts/' + el.id;
                    if (el.remote_success === 1) {
                        el.remote_state = 1;
                    }
                    if (el.success === 1) {
                        el.state = 1
                    }
                });
                res.render('history.hbs', {
                    path: '../../',
                    title: "Семейная статистика",
                    receipts: {items: rows},
                    shoppingLists: shoppingLists,
                    script: ['../../js/receiptHistory.js'],
                    email: email
                })
            })
    });

    app.get('/history/transactions', function (req, res, next) {
        getDataTransactions(db, res, userId)
            .then((rows) => {
                rows.forEach(function (el, i) {
                    el.date = formatDate(el.date);
                    el.createdate = formatDate(el.createdate);
                    el.href = '/history/transactions/' + el.id
                });
                res.render('history.hbs', {
                    path: '../../',
                    title: "Семейная статистика",
                    transactions: {items: rows},
                    shoppingLists: shoppingLists,
                    script: ['../../js/transactionsHistory.js'],
                    email: email
                })

            })
    });


    app.get('/history/receipts/:check_id', function (req, res, next) {
        let checkId = req.params.check_id;
        db.query(res, 'select * from checklist where id = $1 and deleted = $2', [checkId, 0])
            .then((result) => {
                if (result.length > 0) {
                    getCheckProducts(db, checkId, res)
                        .then((row) => {
                            getCheckToDisplay(row, db, res, userId)
                                .then((rows) => {
                                    getWalletList(db, res, userId)
                                        .then((wallets) => {
                                            let view;
                                            let resultWallets = wallets;
                                            if (result[0].success === 0) {
                                                view = 'scanReceipts.hbs'
                                            } else if (result[0].success === 1) {
                                                view = 'successReceipts.hbs';
                                                resultWallets = arrWithSelectElem(wallets, result[0].wallet_id).arr
                                            }
                                            res.render(view, {
                                                path: '../../',
                                                title: "Семейная статистика",
                                                script: ['../../js/createReceipt.js', '../../js/actionWithReceipts.js', '../../js/counter.js'],
                                                id: checkId,
                                                email: email,
                                                receipt: getDateAnStatesReceipts(result)[0],
                                                categories: rows.categories,
                                                shoppingLists: shoppingLists,
                                                items: rows.items,
                                                wallets: resultWallets,
                                                totalSum: Math.round(rows.totalSum * 100) / 100,
                                            })
                                        })
                                })
                        })

                } else {
                    res.sendStatus(404)
                }
            })
    })

};