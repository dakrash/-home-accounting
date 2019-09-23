$(document).ready(function () {
    var table = $('#datatable').DataTable({
        "ajax": "/table/wallet",
        'columns': [
            {'data': 'name'},
            {'data': 'firstbalance'},
            {'data': 'balance'},
            {
                'className': 'center',
                'orderable': false,
                'defaultContent': '<button class="btn btn-custom-yellow editWallet"><i class="far fa-edit"></i></button>'
            },
            {
                'className': 'center',
                'orderable': false,
                'defaultContent': '<button class="btn btn-custom-red delWallet"><i class="far fa-trash-alt"></i></button>'
            }
        ],
        order: [0, 'asc'],
        language: {
            "url": "/js/i18n/russianDatatable.json"
        }
    });

    $('#datatable tbody').on('click', '.editWallet', function () {
        var data = table.row($(this).parents('tr')).data();
        showWalletForm(editWallet, data)
    });

    $('#datatable tbody').on('click', '.delWallet', function () {
        var data = table.row($(this).parents('tr')).data();
        let body = `
        <div class="form-group">
            <p class="text-white">Удалить кошелек "${data.name}"?</p>
        </div>
        <div class="form-group" style="text-align: center">
            <button class="btn btn-custom-red btn-custom-ellipse btn-100" onclick="delWallet(${data.id})">Удалить</button>
        </div>
        `;
        showModalEmpty('Удаление кошелька', body);
    });

    $('#addWallet').click(function () {
        showWalletForm(addWallet, false)
    })

})

function showWalletForm(onsubmit, jsonValues) {
    let body = `
        <form onsubmit="return ${onsubmit}(${jsonValues.id})">
        <div class="form-group">
        <label for="nameWallet">
        Введите название кошелька
</label>
<input id="nameWallet" class="form-input" ${inputValue(jsonValues.name)}>
        </div>
        <div class="form-group">
        <label for="firstBalanceWallet">
         Первоначальный баланс
</label>
<input id="firstBalanceWallet" class="form-input" ${inputValue(jsonValues.firstbalance)}>
        </div>
        <div class="form-group">
    <button type="submit" class="btn btn-custom-yellow btn-custom-ellipse btn-100">Сохранить</button>
</div>
        </form>
        `;
    showModalEmpty('Кошелек', body);
    inputNumberKeydownWithNegative($('#firstBalanceWallet'))
}

function getWalletData() {
    if ($('#nameWallet').val().length === 0) {
        showErrorAlert('Введите название кошелька');
        redBorder($('#nameWallet'));
        return false
    } else if ($('#firstBalanceWallet').val().length === 0 && parseFloat($('#firstBalanceWallet').val()) !== NaN) {
        showErrorAlert('Укажите первоначальный баланс');
        return false
    } else {
        // console.log(parseFloat($('#firstBalanceWallet').val()));
        return {name: $('#nameWallet').val(), firstBalance: parseFloat($('#firstBalanceWallet').val())}
        // return false
    }

}

function addWallet() {
    if (getWalletData()) {
        actionsWithLists(getWalletData(), 'wallet/add')
    }
    return false
}


function editWallet(id) {
    if (getWalletData()) {
        actionsWithLists(getWalletData(), 'wallet/edit/' + id)
    }
    return false
}

function delWallet(id) {
    actionsWithLists({}, 'wallet/del/' + id)
}