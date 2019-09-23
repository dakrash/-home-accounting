$(document).ready(function () {
    var table = $('#datatable').DataTable({
        "ajax": "/table/product",
        'columns': [
            {'data': 'categoryNameWithParent'},
            {'data': 'product_name'},
            {'data': 'unit_name'},
            {
                'className': 'center',
                'orderable': false,
                'defaultContent': '<button class="btn btn-custom-yellow editProduct"><i class="far fa-edit"></i></button>'
            },
            {
                'className': 'center',
                'orderable': false,
                'defaultContent': '<button class="btn btn-custom-red delProduct"><i class="far fa-trash-alt"></i></button>'
            }
        ],
        order: [[0, 'asc'], [1, 'asc']],
        language: {
            "url": "/js/i18n/russianDatatable.json"
        }
    });


    $('#datatable tbody').on('click', '.editProduct', function () {
        var data = table.row($(this).parents('tr')).data();
        showProductForm(editProduct, data)
    });

    $('#datatable tbody').on('click', '.delProduct', function () {
        var data = table.row($(this).parents('tr')).data();
        myAjaxMain('GET', 'lists/product/includeInLists/' + data.product_id, null)
            .then((rows) => {
                function printListsName() {
                    let res = ''
                    if (rows.length > 0) {
                        res += ' Он удалится из списков: ';
                        rows.forEach(function (el, i) {
                            res += '"' + el.name + '"';
                            if (rows[i + 1])
                                res += ', ';

                        });
                    }
                    return res
                }

                let body = `
        <div class="form-group">
        <p class="text-white">Удалить продукт "${data.product_name}"?${printListsName()}</p>
</div>
 <div class="form-group" style="text-align: center">
            <button class="btn btn-custom-red btn-custom-ellipse btn-100" onclick="delProduct(${data.product_id})">Удалить</button>
</div>
        `;
                showModalEmpty('Удаление продукта', body);
            })
    });

    $('#addProduct').click(function () {
        showProductForm(addProduct, false)
    })
});

var unitList = ["л", "кг", "шт."];

function showProductForm(onsubmit, jsonValues) {
    // var data = table.row($(this).parents('tr')).data();
    myAjaxMain('GET', 'lists/category/all/-1').then((result) => {
        function parseCategories() {
            let arr = result;
            let id = jsonValues.category_id;
            let res = '';
            res += '<option></option>';

            arr.forEach(function (el, i) {
                if (el.id === id)
                    res += '<option value="' + el.id + '" selected>' + el.nameWithParent + '</option>';
                else
                    res += '<option value="' + el.id + '">' + el.nameWithParent + '</option>'
            });

            return res
        }

        function parseUnit() {
            let res = '';
            res += '<option></option>'
            unitList.forEach(function (el, i) {
                if (el === jsonValues.unit_name)
                    res += '<option value="' + el + '" selected>' + el + '</option>'
                else
                    res += '<option value="' + el + '">' + el + '</option>'
            });
            return res
        }


        let body = `
        <form onsubmit="return ${onsubmit}(${jsonValues.product_id})">
        <div class="form-group">
        <label for="nameProduct">
        Наименование продукта
</label>
<input id="nameProduct" class="form-input" ${inputValue(jsonValues.product_name)}>
</div>
<div class="form-group">
<label for="categoryId">
        Категория
</label>
<select id="categoryId" data-live-search="true">
${parseCategories()}
    </select>
</div>
    <div class="form-group">
    <label for="unitId">
        Единица измерения
</label>
<select id="unit" data-live-search="true">
${parseUnit()}
    </select>
        </div>
        <div class="form-group">
    <button type="submit" class="btn btn-custom-ellipse btn-custom-yellow btn-100">Сохранить</button>
</div>
        </form>
        `;
        showModalEmpty('Продукт', body);
        $('#categoryId').selectpicker();
        $('#unit').selectpicker();
    });
}

function getProductData() {
    if ($('#nameProduct').val().length === 0) {
        showErrorAlert('Введите название продукта');
        redBorder($('#nameProduct'));
        return false
    } else if ($('#categoryId').val().length === 0) {
        showErrorAlert('Укажите категорию');
        return false
    } else if ($('#unit').val().length === 0) {
        showErrorAlert('Укажите единицу измерения');
        return false
    } else {
        return {
            nameProduct: $('#nameProduct').val(),
            categoryId: $('#categoryId').val(),
            unit: $('#unit').val()
        };
    }
}


function addProduct() {
    if (getProductData())
        actionsWithLists(getProductData(), 'product/add');
    return false
}

function editProduct(productId) {
    if (getProductData())
        actionsWithLists(getProductData(), 'product/edit/' + productId);
    return false
}

function delProduct(productId) {
    actionsWithLists({}, 'product/del/' + productId)
}


