module.exports = function (db, express, userId) {

    let router = express.Router();

    let getProductList = require('../services/getProductList');
    let getCategory = require('../services/getCategory');
    let getWalletList = require('../services/getWalletList');

    router.get('/product', function (req, res) {
        getProductList(db, userId, res)
            .then((rows) => {
                let result = {};
                rows.forEach(function (el, i) {
                    if (el.parentcategoryname) {
                        el.categoryNameWithParent = el.parentcategoryname + ' -> ' + el.category_name
                    } else {
                        el.categoryNameWithParent = el.category_name
                    }
                });
                result.data = rows;
                res.status(200).send(result)
            })
    });

    router.get('/category', function (req, res) {
        getCategory(db, userId, res)
            .then((rows) => {
                let result = {};

                result.data = rows;
                res.status(200).send(result)
            })
    });

    router.get('/wallet', function (req, res) {
        getWalletList(db, res, userId)
            .then((rows) => {
                let result = {};
                result.data = rows;
                res.status(200).send(result)
            })
    });

    return router
}