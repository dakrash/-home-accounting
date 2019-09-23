module.exports = function (db, express, userId) {
    let category = require("./category")(db, express, userId);
    let product = require("./product")(db, express, userId);
    let shopping = require("./shopping")(db, express, userId);
    let wallet = require("./wallet")(db, express, userId);
    let router = express.Router();
    router.use("/category", category);
    router.use("/product", product);
    router.use("/shopping", shopping);
    router.use("/wallet", wallet);
    return router
};