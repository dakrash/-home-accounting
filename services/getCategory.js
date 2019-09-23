module.exports = function (db, userId, res,) {
    return new Promise((resolve, reject) => {
        db.query(res, 'select * from category where user_id = $1 order by coef, parent_id, name', [userId])
            .then((rows) => {
                rows.forEach(function (el, i) {
                    if (el.coef === 1) {
                        el.type = 'Пополнение'
                    } else if (el.coef === -1) {
                        el.type = 'Расход'
                    }
                    if (el.parent_id) {
                        rows.forEach(function (elem, j) {
                            if (el.parent_id === elem.id) {
                                el.nameWithParent = elem.name + ' -> ' + el.name
                            }
                        })
                    } else {
                        el.nameWithParent = el.name
                    }
                });
                resolve(rows)
            })
    })
}