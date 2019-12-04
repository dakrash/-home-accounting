module.exports = function (db, express, userId) {
    let getCategory = require("../../services/getCategory");
    let router = express.Router();

    router.get('/', function (req, res, next) {
        getCategory(db, userId, res)
            .then((rows) => {
                // rows.forEach(function (el, i) {
                //     if (el.parent_id) {
                //         rows.forEach(function (elem, j) {
                //             if (el.parent_id === elem.id) {
                //                 el.nameWithParent = elem.name + ' -> ' + el.name
                //             }
                //         })
                //     } else {
                //         el.nameWithParent = el.name
                //     }
                // });
                res.status(200).json({'result': rows})
            })
    });

    router.get('/all/:coef', function (req, res, next) {
        let coef = req.params.coef;
        getCategory(db, userId, res)
            .then((rows) => {
                let result = [];
                rows.forEach(function (el, i) {
                    if (el.coef.toString() === coef) {
                        if (el.parent_id) {
                            rows.forEach(function (elem, j) {
                                if (el.parent_id === elem.id) {
                                    el.nameWithParent = elem.name + ' -> ' + el.name
                                }
                            })
                        } else {
                            el.nameWithParent = el.name
                        }
                        result.push(el)
                    }
                });
                res.status(200).json({'result': result})
            })
    });

    router.get('/parent/:coef', function (req, res, next) {
        let coef = req.params.coef;
        getCategory(db, userId, res)
            .then((rows) => {
                let result = [];
                rows.forEach(function (el, i) {
                    if (el.coef.toString() === coef && el.parent_id === null) {
                        if (el.parent_id) {
                            rows.forEach(function (elem, j) {
                                if (el.parent_id === elem.id) {
                                    el.nameWithParent = elem.name + ' -> ' + el.name
                                }
                            })
                        } else {
                            el.nameWithParent = el.name
                        }
                        result.push(el)
                    }
                });
                res.status(200).json({'result': result})
            })
    });

    router.get('/parent/', function (req, res, next) {
        db.query(res, 'Select * from category where user_id = $1 and parent_id isnull', [userId])
            .then((rows) => {
                res.status(200).json({'result': rows})
            })
    });

    router.post('/add', function (req, res, next) {
        console.log("add category");
        let nameCategory = req.body.nameCategory;
        let parentId = req.body.parentId;
        let type = req.body.type;
        db.query(res, 'select * from category where user_id = $1 and name = $2 and coef = $3', [userId, nameCategory, type])
            .then((row) => {
                if (row.length > 0) {
                    res.status(409).json({'result': 'Категория должна быть уникальной'})
                } else {
                    db.query(res, 'INSERT INTO category(createDate, user_id, name, parent_id, coef) values ($1, $2, $3, $4, $5)', [new Date(), userId, nameCategory, parentId, type])
                        .then(() => {
                            res.status(200).json({'result': [{'message': 'ОК'}]})
                        })
                }
            })
    });

    router.post('/edit/:idCategory', function (req, res, next) {
        let idCategory = req.params.idCategory;
        let nameCategory = req.body.nameCategory;
        let parentId = req.body.parentId;
        db.query(res, 'select * from category where user_id = $1 and name = $2 and id != $3', [userId, nameCategory, idCategory])
            .then((row) => {
                if (row.length > 0) {
                    res.status(409).json({'result': 'Наименование категории должно быть уникальным'})
                } else {
                    // if(parentId != null){}
                    db.query(res, 'select * from category where parent_id = $1', [idCategory])
                        .then((childCategories) => {
                            if((parentId !== null && childCategories.length === 0) || parentId == null){
                                db.query(res, 'update category set updateDate = $1, name = $2, parent_id = $3 where id = $4', [new Date(), nameCategory, parentId, idCategory])
                                    .then(() => {
                                        res.status(200).json({'result': [{'message': 'ОК'}]})
                                    })
                            } else{
                                res.status(400).json({'result': "Невозможно создать несколько уровней ролительских категорий"})
                            }
                        })

                }
            })
    });

    router.post('/del/:idCategory', function (req, res) {
        let idCategory = req.params.idCategory;
        let idMoveToCategory = req.body.idMoveToCategory;
        db.query(res, 'update shopping_list_product as sl set category_id = $1 from category as c where (c.id = $2 or c.parent_id = $2) and sl.category_id = c.id', [idMoveToCategory, idCategory])
            .then((row) => {
                db.query(res, 'update products as p set category_id = $1 from category as c where (c.id = $2 or c.parent_id = $2) and p.category_id = c.id', [idMoveToCategory, idCategory])
                    .then(() => {
                        db.query(res, 'update transactions as t set category_id = $1 from category as c where (c.id = $2 or c.parent_id = $2) and t.category_id = c.id', [idMoveToCategory, idCategory])
                            .then(() => {
                                db.query(res, 'delete from category where id = $1 or parent_id = $1', [idCategory])
                                    .then(() => {
                                        res.status(200).json({'result': [{'message': 'ОК'}]})

                                    })
                            })
                    })
            })
    })

    return router
}