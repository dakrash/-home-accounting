module.exports = function (db, res, checkId, success, walletId) {
    return new Promise((resolve) => {
        let query = 'update checklist set success = $1, updatedate = $2';
        let params = [success, new Date()];
        if (walletId) {
            params.push(walletId)
        } else {
            params.push(null)
        }
        query += ', wallet_id = $' + params.length;
        params.push(checkId);
        query += ' where id = $' + params.length;
        db.query(res, query, params)
            .then(() => {
                resolve()
            })
    })
}