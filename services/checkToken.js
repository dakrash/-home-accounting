module.exports = function (token, hash, db, res) {
    let userId = hash.decodedJWT(token).id;

    return new Promise((resolve, reject) => {
        db.query(res, "Select * from users where id = $1 and active = 1", [userId])
            .then((row) => {
                if (row.length > 0) {
                    if (hash.decodedJWT(token).exp >= Date.now()) {
                        resolve();
                    } else {
                        reject()
                    }
                } else {
                    reject()
                }
            })
    });
};