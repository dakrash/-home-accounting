$(document).ready(function () {
    if (localStorage.getItem('homeAccountingListState')) {
        let data = {values: []};
        let localValues = JSON.parse(localStorage.getItem('homeAccountingListState')).items
        for (var key in localValues) {
            data.values.push({id: key, val: localValues[key]})
        }
        myAjaxMain('POST', 'lists/shopping/upCheckboxVal', data)
            .then(() => {
                localStorage.removeItem('homeAccountingListState');
                location.reload()
            })
    }

    $('#exit').click(function () {
        localStorage.removeItem('homeAccounting');
        deleteCookie('token');
        window.location = "/auth";
    });
});
