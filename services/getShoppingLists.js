module.exports = function (db, res, userId) {
    return new Promise((resolve, reject) => {
        db.query(res, 'select id, name from shopping_list where user_id = $1 order by name', [userId])
            .then((lists) => {
                return resolve(lists)
            })
    })
}