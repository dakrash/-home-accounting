module.exports = function (date) {
    function pad(number) {
        if (number < 10) {
            return '0' + number;
        }
        return number;
    }


    let newDate = new Date(date);
    let formatDate = newDate.getFullYear() + '/' + pad(newDate.getUTCMonth() + 1) + '/' + pad(newDate.getUTCDate());

    return formatDate
}