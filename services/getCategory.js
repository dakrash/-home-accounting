module.exports = function (db, userId, res,) {
    return new Promise((resolve, reject) => {
        db.query(res, 'select c1.*, coalesce(c2.name || \' -> \', \'\')  || c1.name as nameWithParent from category as c1 left join category as c2 on c1.parent_id = c2.id where c1.user_id = $1 order by c1.coef, nameWithParent, c1.parent_id, c1.name', [userId])
            .then((rows) => {
                rows.forEach(function (el, i) {
                    if (el.coef === 1) {
                        el.type = 'Пополнение'
                    } else if (el.coef === -1) {
                        el.type = 'Расход'
                    }
                });
                resolve(rows)
            })
    })
}