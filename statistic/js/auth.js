function reqAuth(arr, path, succ, err) {
    let data = {user: {email: $('#email'), password: $('#password')}};
    let fl = 0;

    arr.forEach(function (el, i) {
        let elem = $(`#${el}`);
        if (elem.val().length > 0) {
            if (el === 'email')
                data.user.email = elem.val();
            else if (el === 'password')
                data.user.password = elem.val();
        } else {
            redBorder(elem);
            fl++
        }
    });

    if (fl === 0) {
        myAjaxLogin(path, data)
            .then((result) => {
                succ(result[0])
            })
            .catch(function () {
                if (err)
                    err();
            })
    }
    return false
}


function signIn() {
    return reqAuth(['email', 'password'], 'signin', success);

    function success(result) {
        var obj = {
            email: result.email,
            token: result.token,
        };

        var serialObj = JSON.stringify(obj); //сериализуем его
        localStorage.setItem('homeAccounting', serialObj);

        window.location = '/';
    }
}

function resetPassword() {
    return reqAuth(['email'], 'resetPassword', success);

    function success(result) {
        showModalText('Восстановление пароля', 'Для восстановления пароля перейдите по ссылке, отправленной в письме на указанный электронный адрес.')
    }
}

function signUp() {
    function success(result) {
        showModalText('Регистрация', 'Для завершения регистрации перейдите по ссылке, отправленной в письме на указанный электронный адрес.')
    }

    function error() {
        redBorder($('#email'));
    }

    return reqAuth(['email', 'password'], 'signup', success, error)

}

function newPassword() {
    let data = {password: $('#password').val()};
    myAjaxAbsURL('POST', window.location, data, false).then((result) => {
        window.location = '/auth/reset/success'
    });
    return false
}