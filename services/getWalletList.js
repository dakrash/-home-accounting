module.exports = function (db, res, userId) {
    return new Promise((resolve) => {
        // db.query(res, 'select w.*, coalesce((sum(c.sum))*(-1), 0) as balance from wallets as w left join checklist as c on c.wallet_id = w.id and c.deleted = $1 where w.user_id = $2 and w.deleted = $3 group by c.wallet_id, w.id', [0, userId, 0])
        //     .then((rows) => {
        //         console.log('wallets');
        //         console.log(rows);
        //         resolve(rows)
        //     })
        db.query(res,
            'select w.id, w.name, w.firstBalance, (w.firstBalance + coalesce(t1.balance, 0)+coalesce(t2.balance, 0)) as balance from '+
        'wallets as w '+
        'left join '+
        '(select o.wallet_id, coalesce(sum((coalesce(ct1.coef, ct2.coef)*t.sum)), 0) as balance '+
        'from operations as o '+
        'left join transactions as t on t.operation_id = o.id and t.deleted = 0 '+
        'left join products as p on t.product_id = p.id '+
        'left join category as ct1 on p.category_id = ct1.id '+
        'left join category as ct2 on t.category_id = ct2.id '+
        'where o.deleted = $1 '+
        'group by o.wallet_id) '+
        'as t1 on w.id = t1.wallet_id '+
        'left join '+
        '(select wallet_id, coalesce((sum(sum))*(-1), 0) as balance '+
        'from checklist '+
        'where deleted = $1 and success = $2 '+
        'group by wallet_id) '+
        'as t2 on w.id = t2.wallet_id '+
        'where w.user_id = $3 and w.deleted = $1',[0,1, userId])
            .then((rows) => {
                console.log('wallets');
                console.log(rows);
                resolve(rows)
            })
    })
};