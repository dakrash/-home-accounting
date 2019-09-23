module.exports = function(db, res, query, params) {
    return new Promise((resolve, reject) => {
        db.query(query, params)
            .then((result) => {
                resolve(result)
            })
            .catch((err) => {
                console.log(err);
                res.status(500).send({result:'Ошибка при обращении к базе данных', error:err})
            })
    })
}