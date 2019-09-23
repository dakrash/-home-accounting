$(document).ready(function () {
    list.id = $('label[data-id]').attr('data-id');
    localStorage.removeItem('homeAccountingListState' + list.id);
    $('#editList').click(function () {
        myAjaxMain('GET', 'lists/shopping/getName/' + list.id, null, true)
            .then((result) => {
                showListForm(editList, result[0].name)
            })

    })

    $('#delList').click(function () {
        myAjaxMain('GET', 'lists/shopping/getName/' + list.id, null, true)
            .then((result) => {
                let body = `
        <div class="form-group">
        <p class="text-white">Удалить список "${result[0].name}"?</p>
</div>
 <div class="form-group" style="text-align: center">
            <button class="btn btn-custom-red btn-100 btn-custom-ellipse" onclick="delList()">Удалить</button>
</div>
        `;
                showModalEmpty('Удаление списка', body);
            })
    })

    $('#addPosition').click(function () {
        showAddPositionShoppingForm(addPosition, false)
    })


    $(`input[type="checkbox"]`).click(addCheckboxEvent)

    $('button[data-act = "edit"]').click(function (e) {
        let idRow = $(e.target).closest('[data-idRow]').attr('data-idRow');
        myAjaxMain('GET', 'lists/shopping/position/' + list.id + '/row/' + idRow)
            .then((rows) => {
                showAddPositionShoppingForm(editPosition, rows[0], idRow)
            })
    })

    $('button[data-act = "del"]').click(function (e) {
        let idRow = $(e.target).closest('[data-idRow]').attr('data-idRow');
        let positionName = $(e.target).closest('[data-name]').attr('data-name');
        let body = `
        <div class="form-group">
        <p class="text-white">Удалить позицию "${positionName}"?</p>
</div>
 <div class="form-group" style="text-align: center">
            <button class="btn btn-custom-red btn-custom-ellipse btn-100" onclick="delPosition(${idRow})">Удалить</button>
</div>
        `;
        showModalEmpty('Удаление продукта', body);
    })
});

function delPosition(id) {
    actionsWithLists({}, 'shopping/position/' + list.id + '/row/' + id + '/del')
    return false
}


function editPosition(id) {
    if ($('#products').val().length === 0 && $('#productName').val().length === 0) {
        showErrorAlert('Выберите продукт или введите своё название')
    } else if (parseFloat($('#productQuantity').val()) < minValue || parseFloat($('#productQuantity').val()) > maxValue) {
        showErrorAlert('Неккоректное количество продукта')
    } else {
        let data = {
            id: $('#products').val(),
            name: $('#productName').val(),
            categoryId: $('#category').val(),
            quantity: $('#productQuantity').val(),
            comment: $('#productComment').val()
        };
        actionsWithLists(data, 'shopping/position/' + list.id + '/row/' + id + '/edit')
    }
    return false
}

function addCheckboxEvent(e) {
    let box = $(e.target);
    let group = box.closest('.list-group');
    let idRow = box.closest('[data-idRow]').attr('data-idRow');
    let item = box.closest('.list-group-item');
    let val;
    if (box.closest('[type="checkbox"]').is(":checked")) {
        val = 1;
        item.addClass('checkbox-on')
    } else {
        val = 0;
        item.removeClass('checkbox-on')
    }
    let data = {values: [{id: idRow, val: val}]};

    if (localStorage.getItem('homeAccountingListState')) {
        let localValues = JSON.parse(localStorage.getItem('homeAccountingListState')).items
        for (var key in localValues) {
            if (key !== idRow) {
                data.values.push({id: key, val: localValues[key]})
            }
        }
    }
    myAjaxMain('POST', 'lists/shopping/upCheckboxVal', data)
        .then(() => {
            localStorage.removeItem('homeAccountingListState');
        })
        .catch(() => {
            let currentDataChangeList;
            if (localStorage.getItem('homeAccountingListState') && JSON.parse(localStorage.getItem('homeAccountingListState')).id === list.id) {
                currentDataChangeList = JSON.parse(localStorage.getItem('homeAccountingListState'));
            } else {
                currentDataChangeList = {id: list.id}
            }
            localStorage.removeItem('homeAccountingListState');

            if (!currentDataChangeList.items) {
                currentDataChangeList.items = {}
            }

            currentDataChangeList.items[idRow] = val;
            var serialObj = JSON.stringify(currentDataChangeList); //сериализуем его
            localStorage.setItem('homeAccountingListState', serialObj);
        })
}


function showAddPositionShoppingForm(onsubmit, jsonValues, rowId) {
    myAjaxMain('GET', 'lists/product', null)
        .then((rowsProduct) => {
            myAjaxMain('GET', 'lists/category/all/-1', null)
                .then((rowsCategory) => {
                    function allOptionsProduct() {
                        let res = '<option></option>';
                        rowsProduct.forEach(function (el, i) {
                            if (jsonValues.product_id === el.product_id)
                                res += `<option value="${el.product_id}" selected>${el.product_name}, ${el.unit_name}</option>`
                            else
                                res += `<option value="${el.product_id}">${el.product_name}, ${el.unit_name}</option>`
                        });
                        return res
                    }

                    function allOptionsCategory() {
                        let res = '<option></option>';
                        rowsCategory.forEach(function (el, i) {
                            if (jsonValues.category_id === el.id)
                                res += `<option value="${el.id}" selected>${el.nameWithParent}</option>`
                            else
                                res += `<option value="${el.id}">${el.nameWithParent}</option>`
                        });
                        return res
                    }



                    let comment = '';
                    if (jsonValues.comment) {
                        comment = jsonValues.comment
                    }

                    let body = `<form onsubmit="return ${onsubmit}(${rowId})">
            <div class="form-group">
            <label for="productName" class="form-text">
            Выберите продукт:
        </label>
        
        <select id="products" data-live-search="true">
 ${allOptionsProduct()}
</select>
</div>
<div class="form-group">
<label class="form-text">
            Или введите своё наименование и выберите категорию:
        </label>
<div class="row">
<div class="col">
<input class="form-input" id="productName" ${inputValue(jsonValues.product_name)}>
</div>
<div class="col">
<select id="category" data-live-search="true">
 ${allOptionsCategory()}
</select>
</div>
</div>
</div>
            <div class="form-group">
            <label class="form-text">Количество:</label>
            <div class="row">
            ${counter(jsonValues.quantity)}
      </div>
            </div>
            <div class="form-group">
            <label class="form-text">Комментарий:</label>
            <textarea id="productComment" class="form-input" rows="3">${comment}</textarea>
</div>
            <div class="form-group">
            <button type="submit" class="btn btn-custom-yellow btn-100 btn-custom-ellipse">Сохранить</button>
            </div>
            </form>`;
                    showModalEmpty("Новая позиция", body);
                    eventsCounter($('.qty'));
                    $('#products').selectpicker();
                    $('#category').selectpicker();
                });
        })

}


var list = {};
var minValue;
var maxValue;

function editList() {
    let name = $('#nameList').val();
    if (name.length === 0) {
        redBorder($('#nameList'));
        showErrorAlert('Введите название списка');

    } else {
        let data = {nameList: name};
        actionsWithLists(data, 'shopping/edit/' + list.id)
    }
    return false
}


function delList() {
    myAjaxMain('POST', 'lists/shopping/del/' + list.id, {})
        .then(() => {
            window.location = '/'
        })
}

function addPosition() {
    if ($('#products').val().length === 0 && $('#productName').val().length === 0) {
        showErrorAlert('Выберите продукт или введите своё название')
    } else if (parseFloat($('#productQuantity').val()) < minValue || parseFloat($('#productQuantity').val()) > maxValue) {
        showErrorAlert('Неккоректное количество продукта')
    } else {
        let data = {
            id: $('#products').val(),
            name: $('#productName').val(),
            categoryId: $('#category').val(),
            quantity: $('#productQuantity').val(),
            comment: $('#productComment').val()
        };
        actionsWithLists(data, 'shopping/position/' + list.id + '/add')
    }
    return false
}

