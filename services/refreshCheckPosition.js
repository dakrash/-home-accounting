module.exports = function (db, res, checkPositionsData) {

    return new Promise((resolve) => {
        let i = 0;

        function getQueryAndParams(elemData) {
            let query = 'update checkproducts set ';
            let params = [];
            console.log(elemData);
            if (elemData.productId || elemData.categoryId) {
                if (elemData.productId) {
                    params.push(null);
                    query += 'category_id = $' + params.length + ', ';
                    params.push(elemData.productId);
                    query += 'product_id = $' + params.length + ', ';
                    params.push(elemData.quantity);
                    query += 'product_quantity = $' + params.length
                } else if (elemData.categoryId) {
                    params.push(null);
                    query += 'product_id = $' + params.length + ', ';
                    params.push(null);
                    query += 'product_quantity = $' + params.length + ', ';
                    params.push(elemData.categoryId);
                    query += 'category_id = $' + params.length
                }
                params.push(elemData.id);
                query += ' where id = $' + params.length;
                console.log(query);
                return {query: query, params: params}
            } else {
                return false
            }
        }


        updateRows();

        function updateRows() {
            if (getQueryAndParams(checkPositionsData[i])) {
                let data = getQueryAndParams(checkPositionsData[i]);
                db.query(res, data.query, data.params)
                    .then(() => {
                        i++;
                        if (checkPositionsData[i]) {
                            data = getQueryAndParams(checkPositionsData[i]);
                            updateRows()

                        } else {
                            resolve()
                        }
                    })
            } else {
                res.status(400).json({result: 'Неверные параметры запроса'});
            }
        }
    })


};