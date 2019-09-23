module.exports = function (db, params, res, id) {
    var request = require('request');
    let url = `https://proverkacheka.nalog.ru:9999/v1/inns/*/kkts/*/fss/${params.fn}/tickets/${params.i}?fiscalSign=${params.fp}&sendToEmail=no`
    var options = {
        url: url,
        headers: {
            'Device-Id': 'noneOrRealId',
            'Device-OS': 'Adnroid 5.1',
            'Authorization': 'Basic Kzc5MDYxNTIyOTUyOjg2NDc4MA=='
        }
    };

    request(options, function (error, response, body) {
        callback(error, response, body, id)
    })

    function callback(error, response, body, checkId) {
        // console.log('response');
        // console.log(response);
        if (response.statusCode === 202) {
            request(options, function (error, response, body) {
                callback(error, response, body, checkId)
            })
        } else if (response.statusCode === 200) {
            let arrParam = [];
            let values = '';
            let x = 1;
            JSON.parse(body).document.receipt.items.forEach(function (el, i) {
                values += '($' + x;
                x++;

                let params = [checkId, el.name, el.quantity, el.price / 100, el.sum / 100];

                params.forEach(function (elem) {
                    arrParam.push(elem);
                });


                for (let j = 1; j < params.length; j++) {
                    values += ', $' + x;
                    x++;
                }

                values += ')';
                if (i + 1 < JSON.parse(body).document.receipt.items.length) {
                    values += ', ';
                }

            });
            db.query(res, 'insert into checkProducts(checkList_id, name, quantity, price, sum) values ' + values, arrParam)
                .then(() => {
                    res.status(200).json({'result': [{check_id: checkId, remote_success: 1}]})
                })

        } else {
            if (response.statusCode === 406 || response.statusCode === 451) {
                let jsonText;
                if (response.statusCode === 406) {
                    jsonText = 'Чек не найден или истек срок давности чека';
                } else if (response.statusCode === 451) {
                    jsonText = 'Нет доступа по юридическим причинам';
                }
                db.query(res, 'update checklist set remote_success = $1, updatedate = $2 where id = $3', [0, new Date(), checkId])
                    .then(() => {
                        res.status(response.statusCode).json({'result': jsonText, 'satusCode': response.statusCode})
                    })
            } else {
                res.status(response.statusCode).json({'result': 'Ошибка сервера', 'satusCode': response.statusCode})
            }
        }
    }
}