module.exports = function (rows) {
    function pad(number) {
        if (number < 10) {
            return '0' + number;
        }
        return number;
    }

    rows.forEach(function (el, i) {
        let date = new Date(el.date);
        let createDate = new Date(el.createdate);
        el.date = date.getFullYear() + '/' + pad(date.getUTCMonth() + 1) + '/' + pad(date.getUTCDate());
        el.createdate = createDate.getFullYear() + '/' + pad(createDate.getUTCMonth() + 1) + '/' + pad(createDate.getUTCDate());
        el.href = '/history/receipts/' + el.id;
        // if (el.remote_success === 0) {
        //     el.button.push({text: 'Обновить статус', function: `refreshState(${el.id})`})
        // } else
        if (el.remote_success === 1) {
            el.remote_state = 1;
        }
        if (el.success === 1) {
            el.state = 1
        }
    });

    return rows
}