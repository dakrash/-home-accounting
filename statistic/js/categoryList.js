$(document).ready(function () {

    var table = $('#datatable').DataTable({
        "ajax": "/table/category",
        'columns': [
            {'data': 'type'},
            {'data': 'nameWithParent'},
            {
                'className': 'center',
                'orderable': false,
                'defaultContent': '<button class="btn btn-custom-yellow editCategory"><i class="far fa-edit"></i></button>'
            },
            {
                'className': 'center',
                'orderable': false,
                'defaultContent': '<button class="btn btn-custom-red delCategory" ><i class="far fa-trash-alt"></i></button>'
            }
        ],
        order: [[0, 'asc'], [1, 'asc']],
        language: {
            "url": "/js/i18n/russianDatatable.json"
        }
    });


    $('#datatable tbody').on('click', '.editCategory', function () {
        var data = table.row($(this).parents('tr')).data();
        showCategoryForm(editCategory, data)
    });

    $('#datatable tbody').on('click', '.delCategory', function () {
        var data = table.row($(this).parents('tr')).data();
        myAjaxMain('GET', 'lists/category/all/'+data.coef, null)
            .then((rows) => {
                let categoryArr = [];
                var data = table.row($(this).parents('tr')).data();
                rows.forEach(function (el, i) {
                    if (el.id !== data.id && el.parent_id !== data.id) {
                        el.name = el.nameWithParent;
                        categoryArr.push(el)
                    }
                })
                let body = `
<div class="form-group">
        <label for="moveToCategory">
        Продукты и транзакции перенести в категорию:
</label>
<select id="moveToCategory" data-live-search="true">
${createOptions(categoryArr, null)}
    </select>
</div>
        <div class="form-group">
        <p class="text-white">Удалить категорию "${data.name}"?</p>
</div>
 <div class="form-group" style="text-align: center">
            <button class="btn btn-custom-red btn-100 btn-custom-ellipse" onclick="delCategory(${data.id})">Удалить</button>
</div>
        `;
                showModalEmpty('Удаление категории', body);
                $('#moveToCategory').selectpicker()
            })

    });

    $('#addCategory').click(function () {
        showCategoryForm(addCategory, false)
    })
})


function showCategoryForm(onsubmit, jsonValues) {
    if (jsonValues.coef) {
        myAjaxMain('GET', 'lists/category/parent/' + jsonValues.coef, null)
            .then((rows) => {
                let parentCategories = excludeSelf(rows, jsonValues.id)
                buildWindow(parentCategories)
            })
    } else {
        buildWindow([])
    }

    function excludeSelf(arr, id) {
        let parentCategoryArr = [];
        arr.forEach(function (el, i) {
            if (el.id !== id) {
                parentCategoryArr.push(el)
            }
        });
        return parentCategoryArr
    }

    function selectTypeOptions(val1, val2) {
        if (val1 === val2) {
            return 'selected'
        } else {
            return ''
        }
    }

    function disabledSelectCategories() {
        if (!jsonValues.coef) {
            return 'disabled'
        } else {
            return ''
        }
    }

    function disabledSelectType() {
        if (jsonValues.coef) {
            return 'disabled'
        } else {
            return ''
        }
    }

    function buildWindow(parentCategories) {
        let body = `
        <form onsubmit="return ${onsubmit}(${jsonValues.id})">
        <div class="form-group">
        <label for="nameCategory">
        Введите название категории
</label>
<input id="nameCategory" class="form-input" ${inputValue(jsonValues.name)}>
        </div>
        <div class="form-group">
        <label for="parentCategory">
        Тип категории
</label>
<select class="selectpicker" id="type" ${disabledSelectType()}>
<option></option>
<option value="1" ${selectTypeOptions(1, jsonValues.coef)}>Пополнение</option>
<option value="-1" ${selectTypeOptions(-1, jsonValues.coef)}>Списание</option>
    </select>
        </div>
        <div class="form-group">
        <label for="parentCategory">
        Родительская категория
</label>
<select class="selectpicker" id="parentCategory" data-live-search="true" ${disabledSelectCategories()}>
${createOptions(parentCategories, jsonValues.parent_id)}
    </select>
        </div>
        <div class="form-group">
    <button type="submit" class="btn btn-custom-yellow btn-custom-ellipse btn-100">Сохранить</button>
</div>
        </form>
        `;
        showModalEmpty('Категория', body);
        $('.selectpicker').selectpicker();
        $("#type").change(function () {
            $('#parentCategory').empty();
            if ($("#type").val().length > 0) {
                myAjaxMain('GET', 'lists/category/parent/' + $("#type").val(), null)
                    .then((rows) => {
                        let parentCategoryArr = excludeSelf(rows, jsonValues.id);
                        $('#parentCategory').append(createOptions(parentCategoryArr, jsonValues.parent_id));
                        $('#parentCategory').prop("disabled", false);
                        $('#parentCategory').selectpicker('refresh');

                    })
            } else {
                $('#parentCategory').prop("disabled", true);
                $('#parentCategory').selectpicker('refresh');
            }
        })
    }
}


function addCategory() {
    if ($('#nameCategory').val().length === 0) {
        showErrorAlert('Введите название категории');
    } else if ($('#type').val().length === 0) {
        showErrorAlert('Укажите тип категории');
    } else {
        let data = {nameCategory: $('#nameCategory').val(), type: $('#type').val()};
        if ($('#parentCategory ').val().length === 0)
            data.parentId = null;
        else
            data.parentId = $('#parentCategory ').val()
        actionsWithLists(data, 'category/add')
    }
    return false
}

function editCategory(id) {
    if ($('#nameCategory').val().length === 0) {
        showErrorAlert('Введите название категории');

    } else {
        let data = {nameCategory: $('#nameCategory').val()};
        if ($('#parentCategory ').val().length === 0)
            data.parentId = null
        else
            data.parentId = $('#parentCategory ').val()
        actionsWithLists(data, 'category/edit/'+id)
    }
    return false
}

function delCategory(id) {
    if ($('#moveToCategory').val().length === 0) {
        redBorder($('#moveToCategory'));
        showErrorAlert('Укажите категорию, в которую необходимо перенести продукты из удалямой категории');

    } else {
        let data = {idMoveToCategory: $('#moveToCategory').val()};
        // return false
        actionsWithLists(data, 'category/del/'+id)
    }
    return false
}