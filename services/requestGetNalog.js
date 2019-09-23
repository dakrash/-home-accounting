module.exports = function (db, params, res, userId) {
    var request = require('request');
    let url = `https://proverkacheka.nalog.ru:9999/v1/ofds/*/inns/*/fss/${params.fn}/operations/${params.n}/tickets/${params.i}?fiscalSign=${params.fp}&date=${params.t}&sum=${params.s * 100}`
    var options = {
        url: url
    };
    let requestGetNalogDetails = require('./requestGetNalogDetails');

    function callback(err, resp, body, checkId) {
        console.log('resp.statusCode');
        console.log(resp.statusCode);
        if (err) {
            res.status(500).send({
                result: 'Ошибка обращения к стороннему сервису, повторите запрос позже',
                err: err
            })
        } else {
            let paramsReq = [userId, new Date(), params.t, params.s, params.fn, params.i, params.fp, params.n, 0];
            if (resp.statusCode === 204) {
                paramsReq.push(1);
            } else {
                paramsReq.push(0);
            }
            paramsReq.push(0);
            if (!checkId) {
                db.query(res, 'insert into checkList(user_id, createDate, t, date, sum, fn, i, fp, n, success, remote_success, deleted) values($1, $2, $3, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id', paramsReq)
                    .then((row) => {
                        let checkId = row[0].id;
                        if (resp.statusCode === 204) {
                            requestGetNalogDetails(db, params, res, checkId)
                        } else {
                            res.status(200).json({result: [{check_id: checkId, remote_success: 0}]})
                        }
                    })
            } else {
                if (resp.statusCode === 204) {
                    db.query(res, 'update checklist set success = $1, remote_success = $2, wallet_id = $3 where id = $4', [0, 1, null, checkId])
                        .then(() => {
                            requestGetNalogDetails(db, params, res, checkId)
                        })
                } else {
                    // res.status(404).json({'result': 'Информация о чеке не найдена. Попробуйте проверить позже. Чек доступен в <a href="/history/receipts">истории чеков</a>'})
                    res.status(200).json({result: [{check_id: checkId, remote_success: 0}]})
                }
            }
        }
    }

    if (params.t && params.s && params.fn && params.i && params.fp && params.n) {
        if (params.n === '1') {
            db.query(res, 'select * from checkList where user_id = $1 and date = $2 and sum = $3 and fn = $4 and i = $5 and fp = $6 and n = $7 and deleted = $8', [userId, params.t, params.s, params.fn, params.i, params.fp, params.n, 0])
                .then((checkListId) => {
                    console.log('checkListId');
                    console.log(checkListId);
                    if (checkListId.length > 0) {
                        let checkId = checkListId[0].id;
                        // db.query(res, 'select * from checkProducts where checkList_id = $1', [checkId])
                        //     .then((checkProductsId) => {
                        if (checkListId[0].remote_success === 1) {
                            res.status(200).json({'result': [{check_id: checkId}]})
                        } else {
                            console.log('options');
                            console.log(options);
                            request(options, function (err, resp, body) {
                                callback(err, resp, body, checkId)
                            });
                        }
                        // })
                    } else {
                        request(options, callback);
                    }
                })
        } else{
            res.status(400).json({'result': 'На данный момент чеки возврата не обрабатываются'})
        }
    } else {
        res.status(400).json({'result': 'Неверные параметры чека'})
    }
}