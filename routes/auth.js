module.exports = function (db, express, hash) {

    var router = express.Router();

    router.get('/', function (req, res) {
        res.render('auth.hbs', {
            layout: 'auth',
            path: '',
            title: "Авторизация",
            elem: [
                {id: 'email', label: 'Email', type: 'email'},
                {id: 'password', label: 'Пароль', type: 'password'}
            ],
            buttonText: 'Войти',
            login: true,
            onsubmit: 'return signIn()'
        });
    });

    router.get('/signup', function (req, res) {
        res.render('auth.hbs', {
            layout: 'auth',
            path: '../',
            title: "Регистрация",
            elem: [
                {id: 'email', label: 'Email', type: 'email'},
                {id: 'password', label: 'Пароль', type: 'password'}
            ],
            buttonText: 'Регистрация',
            login: false,
            onsubmit: 'return signUp()'
        });
    });

    router.get('/verification', (req, res) => {
        db.query(res, "SELECT * " +
            "FROM users " +
            "WHERE hash=$1", [req.query.key])
            .then((result) => {
                if (result.length > 0) {
                    db.query(res, "update " +
                        "users  set active = 1" +
                        "WHERE hash=$1", [req.query.key])
                        .then(function () {
                            res.render('message.hbs', {
                                layout: 'message',
                                path: '../',
                                title: "Успешно",
                                titleModal: 'Активациа аккаунта',
                                textModal: 'Аккаунт успешно активирован',
                                textLink: 'Перейти к форме входа',
                                href: '/auth'
                            });
                        });
                } else {
                    res.status(404).json({"result": 'Неверная ссылка'});
                }
            });
    });

    router.get('/reset', (req, res) => {
        res.render('auth.hbs', {
            layout: 'auth',
            path: '../',
            title: "Восстановление пароля",
            elem: [
                {id: 'email', label: 'Email', type: 'email'}
            ],
            buttonText: 'Продолжить',
            login: false,
            onsubmit: 'return resetPassword()'
        });
    });

    router.get('/reset/success', (req, res) => {
        res.render('message.hbs', {
            layout: 'message',
            path: '../../',
            title: "Успешно",
            titleModal: 'Изменение пароля',
            textModal: 'Пароль успешно изменен',
            textLink: 'Перейти к форме входа',
            href: '/auth'
        });
    });

    router.use('/password', (req, res, next) => {
        var md5 = require('md5');
        let id = req.query.id;
        let min = req.query.min;
        let hash = req.query.key;
        let currentMin = Math.trunc(((Date.now() % (1000 * 60 * 60)) / (1000 * 60)));
        let currentHour = Math.trunc(Date.now() / (1000 * 60 * 60));
        if (currentMin >= min) {
            currentHour++;
        }
        if (md5(id + currentHour) === hash) {
            next();
        } else {
            res.sendStatus(404)
        }
    });

    router.get('/password', (req, res) => {
        res.render('auth.hbs', {
            layout: 'auth',
            path: '../',
            title: "Восстановление пароля",
            elem: [
                {id: 'password', label: 'Пароль', type: 'password'}
            ],
            buttonText: 'Сохранить',
            login: false,
            onsubmit: 'return newPassword()'
        });
    });


    router.post('/password', (req, res) => {
        let password = req.body.password;
        db.query(res, "update users set password = $1 " +
            "where id = $2", [hash.getPassword(password), req.query.id])
            .then(function () {
                res.sendStatus(200);
            });
    });


    return router;
};