function getTransaction(elem) {
    let qrCode = elem.val();

    if (qrCode.length > 0) {
        myAjaxMain('GET', 'receipts?' + qrCode).then((result) => {
            window.location = '/receipts/' + result[0].check_id
        });
    } else {
        redBorder(elem);
        showErrorAlert('Введите текст отсканированного QR-кода')
    }
    return false
}