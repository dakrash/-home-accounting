$(document).ready(function () {
    inputNumberKeydown($('[data-type="summ"]'));
    let config = {
        format: 'yyyy/mm/dd',
        todayHighlight: true,
        autoclose: true,
        language: 'ru'
    };
    $('#datepicker').datepicker(config)
        .on('changeDate', function (e) {
            console.log(e);
            if (e.date > new Date()) {
                $('#datepicker').datepicker('update', new Date());
                showErrorAlert('Невозможно установить будущий день')
            }
        });
    typeTransaction = $('[data-typeTransaction]').attr('data-typeTransaction');
    rowsIndex = parseInt($('[data-row]:last').attr('data-row'));

    if (typeTransaction === 'expense') {
        eventsCounter($('.qty'))
    }

    for (let i = 1; i < $('select[data-type="category"]:first').find('option').length; i++) {
        let el = $($('select[data-type="category"]:first').find('option')[i]);
        optionCategories += '<option value="' + el.attr('value') + '">' + el.html() + '</option>'
    }

    for (let i = 1; i < $('select[data-type="product"]:first').find('option').length; i++) {
        let el = $($('select[data-type="product"]:first').find('option')[i]);
        optionProducts += '<option value="' + el.attr('value') + '">' + el.html() + '</option>'
    }
    console.log(optionCategories);
    console.log(optionProducts);
    $('[data-type="associate"]').change(changeAssociate);
    $('#addRow').click(function () {
        $('#elemsTransaction').append(getRow());
        $('.selectpicker').selectpicker();
        if (typeTransaction === 'expense') {
            eventsCounter($('[data-row="' + rowsIndex + '"] .qty'))
        }
        inputNumberKeydown($('[data-row="' + rowsIndex + '"] [data-type="summ"]'));
        $('[data-row="' + rowsIndex + '"] [data-type="associate"]').change(changeAssociate);
        $('[data-row="' + rowsIndex + '"] [data-act="del"]').click(delRow)
    });
    $('[data-act="delRow"]').click(delRow);
    $('[data-act="success"]').click(function (e) {
        if (createDataTransaction()) {
            pullReq('add', createDataTransaction());
        }
    });
    $('[data-act="save"]').click(function (e) {
        if (createDataTransaction()) {
            pullReq('edit/' + $('[data-idTransaction]').attr('data-idTransaction'), createDataTransaction())
        }
    })

    $('[data-act="del"]').click(function (e) {
        let body = `
        <div class="form-group">
        <p class="text-white">Удалить данную транзакцию?</p>
</div>
 <div class="form-group" style="text-align: center">
            <button class="btn btn-custom-red btn-custom-ellipse btn-100" onclick="pullReq('del/' + $('[data-idTransaction]').attr('data-idTransaction'), {})">Удалить</button>
</div>
        `;
        showModalEmpty('Удаление продукта', body);
    })

});

function createDataTransaction() {
    let result = {};
    let date = $('#datepicker').val();
    if (!date) {
        showErrorAlert('Укажите дату');
        return false
    } else {
        let wallet = $('#wallets').val();
        if (!wallet) {
            showErrorAlert('Укажите кошелек');
            return false
        } else {
            let elems = $('[data-row]');
            result.date = date;
            result.comment = $('#comment').val();
            result.wallet = wallet;
            result.type = typeTransaction;
            result.items = [];
            let fl = 0;
            if (elems.length > 0) {
                for (let i = 0; i < elems.length; i++) {
                    let el = $(elems[i]);
                    let typeAssociate = el.find('[data-type="associate"]').val();
                    let thisData = {};
                    let summ = el.find('[data-type="summ"]').val();
                    if (parseFloat(summ) === 0) {
                        showErrorAlert('Все суммы должны быть больше нуля');
                        fl++;
                        break;
                    } else {
                        thisData.summ = parseFloat(summ);
                        let id = el.attr('data-id');
                        if (id)
                            thisData.id = id;
                        if (typeAssociate === 'product') {
                            let productId = el.find('[data-type="product"]').val();
                            if (!productId) {
                                showErrorAlert('Поле "Продукт" обязательно для заполнения');
                                fl++;
                                break
                            } else {
                                let quantity = parseFloat(el.find('[data-type="quantity"]').val());
                                thisData.productId = productId;
                                thisData.quantity = quantity;
                            }
                        } else if (typeAssociate === 'category') {
                            let categoryId = el.find('[data-type="category"]').val();
                            if (!categoryId) {
                                showErrorAlert('Поле "Категория" обязательно для заполнения');
                                fl++;
                                break
                            } else {
                                thisData.categoryId = categoryId;
                            }
                        }
                    }
                    result.items.push(thisData)
                }
                if (fl === 0)
                    return result;
                else
                    return false
            }
            else{
                showErrorAlert('Невозможно сохранить пустую транзакцию');
                return false
            }
        }
    }
}



function changeAssociate(e) {

    let rowNumb = $(e.target).parents('[data-row]').attr('data-row');
    $('[data-row = "' + rowNumb + '"] [data-type = "product"]').closest('[data-type = "col"]').toggleClass('hidden')
    $('[data-row = "' + rowNumb + '"] [data-type = "category"]').closest('[data-type = "col"]').toggleClass('hidden')
    $('[data-row = "' + rowNumb + '"] [data-type="quantity"]').closest('[data-type = "col"]').toggleClass('hidden')
    // $('[data-row = "' + rowNumb + '"] [data-type = "category"]').toggleClass('hidden')
}

function delRow(e) {
    $(e.target).parents('[data-row]').remove();
}

let rowsIndex;

let optionCategories = '<option></option>';
let optionProducts = '<option></option>';
let typeTransaction;


function getRow() {
    rowsIndex++;

    function optionsTypeAssociate() {
        let result = '';
        if (typeTransaction === 'expense') {
            result += '<option value="product">Продукт</option>'
        }
        result += '<option value="category">Категория</option>';
        return result
    }

    function productsAndCategoriesCols() {
        if (typeTransaction === 'refill') {
            return `
            <div data-type="col" class="col-12 col-sm-6 col-md-4 col-lg">
            <label>Выберите категорию</label>
            <select data-type="category" class="selectpicker">
                ${optionCategories}
            </select>
        </div>
            `
        } else {
            return `
            <div data-type="col" class="col-12 col-sm-6 col-md-3 col-lg">
            <label>Выберите продукт</label>
            <select data-type="product" class="selectpicker">\
                ${optionProducts}
            </select>
        </div>
        <div data-type="col" class="col-12 col-sm-6 col-md-3 col-lg qty">
            <label>Укажите количество</label>
            <div class="row">
                <div class="col-auto" style="padding-right: 0 !important;">
                <span class="minus btn-custom-yellow btn-number" disabled="disabled" data-type="minus"
                      data-field="quant[${rowsIndex}]">-</span>
                </div>
                <div class="col">
                    <input data-type="quantity" type="text" name="quant[${rowsIndex}]" class="input-number count" value="1" min="1" max="100">
                </div>
                <div class="col-auto" style="padding-left: 0 !important;">
                    <span class="plus btn-custom-yellow btn-number" data-type="plus" data-field="quant[${rowsIndex}]">+</span>
                </div>
            </div>
        </div>

        <div data-type="col" class="col-12 col-sm-6 col-md-4 col-lg hidden">
            <label>Выберите категорию</label>
            <select data-type="category" class="selectpicker">
                <option></option>
                ${optionCategories}
            </select>
        </div>
            `
        }
    }


    return `
    <div data-row="${rowsIndex}" class="row mb-5">
        <div data-type="col" class="col-12 col-sm-6 col-md-3 col-lg">
            <label>Тип ассоциирования</label>
            <select class="selectpicker" data-type="associate">
                ${optionsTypeAssociate()}
            </select>
        </div>
        ${productsAndCategoriesCols()}
        <div data-type="col" class="col-12 col-sm-6 col-md">
            <label>Укажите сумму</label>
            <input data-type="summ" type="text" class="input-number count" value="0">

        </div>
        <div data-type="col" class="col-12 col-md-auto" style="text-align: center">
            <i class="fas fa-times" data-act="del" style="color: red; line-height: 65px; font-size: 20px; cursor: pointer"></i>
        </div>
    </div>
`
}

function pullReq(url, body) {
    console.log(body);
    myAjaxMain('POST', '/transactions/' + url, body)
        .then(() => {
            closeModalWindow();
            $('#elemForChange').empty();
            let body =
                `<div class="row justify-content-center">
                    <div class="col-auto">
                        <i class="far fa-check-circle" style="font-size: 80px; color: green"></i>
                    </div>
                </div>
                <div class="mt-3 row justify-content-center">
                    <div class="col-auto">
                        <label>
                            Успешно. Перейти в <a class="yellow-color" href="/history/transactions">историю транзакций</a>
                        </label>
                    </div>
                </div>`;
            $('#elemForChange').append(body)
        })
}
