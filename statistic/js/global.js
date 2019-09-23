$(document).ready(function () {


    $('.dropdown-submenu a.test').on("click", function (e) {
        $(this).next('ul').toggle();
        e.stopPropagation();
        e.preventDefault();
    });


    $('#createShoppingList').click(function () {
        showListForm(createShoppingList, false)
    })
});

function actionsWithLists(data, path) {
    myAjaxMain('POST', 'lists/' + path, data)
        .then(() => {
            location.reload();
        });
}

function createShoppingList() {
    let name = $('#nameList').val();
    if (name.length === 0) {
        redBorder($('#nameList'));
        showErrorAlert('Введите название списка')

    } else {
        let data = {nameList: name}
        actionsWithLists(data, 'shopping/add')
    }
    return false
}

function showListForm(onsubmit, name) {
    let body = `<form onsubmit="return ${onsubmit}()">
            <div class="form-group">
            <label for="nameList">
            Наименование списка
        </label>
        <input id="nameList" class="form-input" ${inputValue(name)}>
            </div>
            <div class="form-group">
            <button type="submit" class="btn btn-custom-yellow btn-custom-ellipse btn-100">Сохранить</button>
            </div>
            </form>`;
    showModalEmpty("Cписок", body)
}


function inputValue(val) {
    if (val !== null && val !== undefined && val.length !== 0) {
        return `value = "${val}"`
    } else
        return ''
}


function redBorder(elem) {
    elem.attr('style', 'border: 3px solid red');
    elem.keypress(function () {
        elem.removeAttr('style')
    });
    elem.change(function () {
        elem.removeAttr('style')
    })
}

function showErrorAlert(text) {
    showAlert('alert-danger', text)
}

function showSuccessAlert(text) {
    showAlert('alert-success', text)
}

function showAlert(alertClass, text) {
    let alert = `<div class="alert ${alertClass}" role="alert" style="position: fixed; top:5px; right: 5px;z-index: 999999">
                           ${text}
                        </div>`;
    $('body').append(alert);
    setTimeout(function () {
        $('.alert').alert('close')
    }, 3000);
}

function myAjaxLogin(url, body) {
    return ajax('POST', `/api/auth/${url}`, body)
}

function myAjaxAbsURL(type, url, body, header) {
    return ajax(type, `${url}`, body, header)
}

function myAjaxMain(type, url, body) {
    return ajax(type, `/api/main/${url}`, body, true)
}

function ajax(type, url, body, header) {
    $.blockUI({
        css: {
            padding: '20px 0',
            borderRadius: '20px'
        }, message:
            '<img src="//cdnjs.cloudflare.com/ajax/libs/semantic-ui/0.16.1/images/loader-large.gif" /><br/>' +
            'Ожидайте...'
    });
    return new Promise((resolve, reject) => {
        $.ajax({
            type: type,
            url: url,
            contentType: 'application/json; charset=utf-8',
            beforeSend: function (request) {
                if (header)
                    if (localStorage.getItem('homeAccounting'))
                        request.setRequestHeader("Authority", JSON.parse(localStorage.getItem('homeAccounting')).token);
                    else
                        window.location = "/auth";
                else
                    return true
            },
            data: JSON.stringify(body),
            error: function (err) {
                $.unblockUI();
                console.log(err);
                if (err.status === 401) {
                    window.location = "/auth"
                } else {
                    if (err.responseJSON)
                        showErrorAlert(err.responseJSON.result);
                    else
                        showErrorAlert('Ошибка сервера');
                    reject(err)
                }
            },
            success: function (result) {
                $.unblockUI();
                console.log(result);
                resolve(result.result)
            }
        });
    })
}


function setCookie(name, value, options) {
    options = options || {};

    var expires = options.expires;

    if (typeof expires == "number" && expires) {
        var d = new Date();
        d.setTime(d.getTime() + expires * 1000);
        expires = options.expires = d;
    }
    if (expires && expires.toUTCString) {
        options.expires = expires.toUTCString();
    }

    value = encodeURIComponent(value);

    var updatedCookie = name + "=" + value;

    for (var propName in options) {
        updatedCookie += "; " + propName;
        var propValue = options[propName];
        if (propValue !== true) {
            updatedCookie += "=" + propValue;
        }
    }

    document.cookie = updatedCookie;
}

function deleteCookie(name) {
    setCookie(name, "", {
        expires: -1
    })
}

function showModalText(header, text, eventHide) {
    if (eventHide)
        showModalEmpty(header, `<div class="text-center yellow-color"><p>${text}</p></div>`, eventHide)
    else {
        showModalEmpty(header, `<div class="text-center yellow-color"><p>${text}</p></div>`)
    }
}

function closeModalWindow() {
    if ($('#centralModal')) {
        $('#centralModal').modal('hide');
    }
}

function showModalEmpty(header, body, eventHide) {
    if ($('#centralModal')) {
        $('#centralModal').remove();
    }
    let window = `<div class="modal fade" id="centralModal" tabindex="-1" role="dialog"
                             aria-hidden="true">
                             <div class="modal-dialog modal-notify modal-success" role="document">
                               <div class="modal-content">
                                 <div class="modal-header active-back">
                                   <p class="lead text-white" style="margin-bottom: 0;
">${header}</p>
                                   <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                                     <span aria-hidden="true" class="text-white">&times;</span>
                                   </button>
                                 </div>
                                 <div class="modal-body active-back">
                                   ${body}
                                 </div>
                               </div>
                             </div>
                           </div>`;
    $('body').append(window);
    $('#centralModal').modal();
    if (eventHide)
        $('#centralModal').on('hide.bs.modal', eventHide)
}

function createOptions(rowsData, id) {
    let res = '<option></option>';
    for (let i = 0; i < rowsData.length; i++) {
        if (rowsData[i].id !== id)
            res += '<option value="' + rowsData[i].id + '">' + rowsData[i].name + '</option>'
        else
            res += '<option value="' + rowsData[i].id + '" selected>' + rowsData[i].name + '</option>'
    }
    return res
}


function inputNumberKeydown(elem) {
    numberKeydown(elem, false)
}

function inputNumberKeydownWithNegative(elem) {
    numberKeydown(elem, true)
}


function numberKeydown(elem, negative) {
    elem.keydown(function (e) {
        // Allow: backspace, delete, tab, escape, enter and .
        if ($.inArray(e.keyCode, [46, 8, 9, 27, 13]) !== -1 ||
            // Allow: Ctrl+A
            (e.keyCode === 65 && e.ctrlKey === true) ||
            // Allow: home, end, left, right
            (e.keyCode >= 35 && e.keyCode <= 39)) {
            // let it happen, don't do anything
            return;
        }
        if ((negative && !e.shiftKey && e.keyCode === 189) || (!e.shiftKey && e.keyCode === 190)) {
            return
        }
        // Ensure that it is a number and stop the keypress
        if ((e.shiftKey || (e.keyCode < 48 || e.keyCode > 57)) && (e.keyCode < 96 || e.keyCode > 105)) {
            e.preventDefault();
        }
    });
}