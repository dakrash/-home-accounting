module.exports = function (db, userId, res) {
    return new Promise((resolve, reject) => {
        db.query(res, `select
        c.id as category_id,
        c.name as category_name,
        cc.name as parentCategoryName,
        p.id as product_id,
        p.name as product_name,
        p.unit as unit_name,
        coalesce(cc.name || ' -> ', '')  || c.name as nameWithParent
        from category as c
        join products as p on c.id = p.category_id
        left join category as cc on c.parent_id = cc.id
        where c.user_id = $1
        order by nameWithParent, p.name, p.unit
        `, [userId])
            .then((rows) => {
                resolve(rows)
            })
    })
}