module.exports = function(db, idList, userId, res){
    return new Promise((resolve, reject) => {
        db.query(res, 'select * from shopping_list where id = $1 and user_id = $2', [idList, userId])
            .then((result) => {
                resolve(result)
            })
    })
}


