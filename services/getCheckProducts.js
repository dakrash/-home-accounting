module.exports = function (db, check_id, res) {
    return new Promise((resolve, reject) => {
        db.query(res, 'SELECT cp.* from checkProducts as cp join checklist as cl on cl.id = cp.checkList_id where cp.checkList_id = $1 and cl.deleted = $2', [check_id, 0])
            .then((row) => {
                row.forEach(function (el, i) {
                    el.price = parseFloat(el.price);
                    el.sum = parseFloat(el.sum);
                    el.quantity = parseFloat(el.quantity);
                });
                resolve(row)
            })
    })
};