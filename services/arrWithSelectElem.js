module.exports = function (arr, val) {
    let copyarr = JSON.parse(JSON.stringify(arr));
    let fl = 0
    copyarr.forEach(function (elem, j) {
        if (elem.id === val) {
            elem.select = 'selected';
            fl++
        }
    });
    return {arr: copyarr, fl: fl}
}