module.exports = function (db, res, userId) {
    return new Promise((resolve, reject) => {
        db.query(res,


            // 'select o.id, o.type, o.createdate, o.date, o.comment, w.name as wallet_name, sum(t.sum) as sum ' +
            // 'from operations as o ' +
            // 'join wallets as w on o.wallet_id = w.id and w.user_id = $1 ' +
            // 'left join transactions as t on t.operation_id = o.id and t.deleted !=$2 ' +
            // 'left join category as c on c.id = t. ' +
            // 'where o.deleted != $2 group by o.id, o.type, o.createdate, o.date, o.comment, w.name'
            //
            //

        'select o.id, o.createdate, o.date, o.comment, w.name as wallet_name, coalesce(ct1.coef, ct2.coef) as coef, sum(t.sum) as sum '+
        'from operations as o '+
        'join wallets as w on o.wallet_id = w.id and w.user_id = $1 '+
        'left join transactions as t on t.operation_id = o.id and t.deleted !=$2 '+
        'left join products as p on t.product_id = p.id '+
        'left join category as ct1 on p.category_id = ct1.id '+
        'left join category as ct2 on t.category_id = ct2.id '+
        'where o.deleted != $2 group by o.id, o.createdate, o.date, o.comment, w.name, ct1.coef, ct2.coef', [userId, 1])
            .then((rows) => {
                console.log(rows);
                rows.forEach(function (el, i) {
                    if (el.coef === -1) {
                        el.type = 'Списание'
                    } else if (el.coef === 1) {
                        el.type = 'Пополнение'
                    }
                });
                resolve(rows)
            })
    })
}