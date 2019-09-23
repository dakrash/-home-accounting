$(document).ready(function () {
    receiptId = $('table[data-id]').attr('data-id');
    elemForChange = $('#forChange');
    $('.selectpicker').selectpicker();

    $('.selectpicker').change(function (e) {
        let thisSelect = $(e.target);
        let rowIndex = thisSelect.attr('data-rowId');
        let type = thisSelect.attr('data-type');
        if (thisSelect.val()) {
            thisSelect.closest('tr').addClass('tr-on')
        } else {
            if (!$('.selectpicker[data-rowId = ' + rowIndex + ']:not([data-type="' + type + '"])').val()) {
                thisSelect.closest('tr').removeClass('tr-on')
            }
        }
    });

    eventsCounter($('.qty'));

    $('[data-act = "success"]').click(function () {
        checkPositionData(successReceipt)
    });

    $('[data-act = "cancel"]').click(function () {
        ajaxReceipt('/cancel')
    })

    $('[data-act = "save"]').click(function () {
        checkPositionData(function () {
            ajaxReceipt('/save', getPositionsData())
        })
    })

    $('[data-act = "refreshState"]').click(function () {
        refreshState(receiptId)
    })
    $('[data-act = "del"]').click(function () {
        let body = `
        <div class="form-group">
        <p class="text-white">Вы действительно хотите удалить чек?</p>
</div>
 <div class="form-group" style="text-align: center">
            <button class="btn btn-custom-red btn-custom-ellipse btn-100" onclick="ajaxReceipt('/del')">Удалить</button>
</div>
        `;
        showModalEmpty('Удаление продукта', body);
    })
});

function refreshState(id) {
    myAjaxMain('GET', 'receipts/' + id + '/state')
        .then((result) => {
            // location.reload()
            console.log(result);
            console.log(result[0].remote_success);
            if (result[0].remote_success) {
                showModalText('Проведение чека', 'Для проведения чека необходимо выбрать продукты или категории для всех позиций чека', function () {
                    location.reload()
                })
            } else {
                showErrorAlert('Информация о чеке не найдена')
            }
        })
}

function checkPositionData(funcSuccess) {
    if (getPositionsData()) {
        funcSuccess()
    } else {
        showErrorAlert('Выберите продукты или категории на все позиции чека')
    }
}

let receiptId;
let elemForChange;

function getPositionsData() {
    let allRows = $('tr[data-rowId]');

    function productElem(rowId) {
        return $(`.selectpicker[data-type = "product"][data-rowId = "${rowId}"]`);
    }

    function counterElem(rowId) {
        return $(`.count[data-rowId = "${rowId}"]`);
    }

    function categoryElem(rowId) {
        return $(`.selectpicker[data-type = "category"][data-rowId = "${rowId}"]`);
    }

    let data = {positions: []};

    for (let i = 0; i < allRows.length; i++) {
        let rowId = $(allRows[i]).attr('data-rowId');
        data.positions.push({id: rowId});
        let dataIndex = data.positions.length - 1;
        if (productElem(rowId).val()) {
            let productId = productElem(rowId).val();
            let quantity = counterElem(rowId).val();
            data.positions[dataIndex].productId = productId;
            data.positions[dataIndex].quantity = quantity
        } else if (categoryElem(rowId).val()) {
            let categoryId = categoryElem(rowId).val();
            data.positions[dataIndex].categoryId = categoryId;
        } else {
            return false
        }
    }
    return data
}

function getWalletId() {
    if (!$('#wallets').val()) {
        showErrorAlert('Укажите кошелек')
        return false
    } else {
        return $('#wallets').val()
    }
}


function successReceipt() {
    if (getWalletId()) {
        let data = getPositionsData();
        data.walletId = getWalletId();
        ajaxReceipt('/success', data)
    }
    return false
}


function ajaxReceipt(url, data) {
    myAjaxMain('POST', 'receipts/' + receiptId + url, data)
        .then(() => {
            closeModalWindow();
            elemForChange.empty();
            let body =
                `<div class="row justify-content-center">
                    <div class="col-auto">
                        <i class="far fa-check-circle" style="font-size: 80px; color: green"></i>
                    </div>
                </div>
                <div class="mt-3 row justify-content-center">
                    <div class="col-auto">
                        <label>
                            Успешно. Перейти в <a class="yellow-color" href="/history/receipts">историю чеков</a>
                        </label>
                    </div>
                </div>`;
            elemForChange.append(body)
        })
}