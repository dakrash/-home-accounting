module.exports = function (db, express, hash) {

    var router = express.Router();
    let sentEmail = require('../../config/nodemailer');
    var user;
    let link = 'https://dkrash.ru/auth/';
    var md5 = require('md5');

    router.use(function (req, res, next) {
        console.log('auth');
        user = req.body.user;
        next();
    });

    router.post('/signin', (req, res) => {
        console.log('signin');
        let wrongAuth = function (text) {
            res.status(400).json({"result": text});
        };

        db.query(res, "SELECT * " +
            "FROM users " +
            "WHERE email=$1 and active = 1", [user.email])
            .then((result) => {
                if (result.length > 0) {
                    let hashUser = result[0].password;
                    if (hash.checkPassword(user.password, hashUser)) {
                        res.cookie('token', hash.toAuthJSON(result[0].id, user.email).token, {expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)})
                        res.status(200).send({result:[hash.toAuthJSON(result[0].id, user.email)]});
                    } else {
                        wrongAuth('Неверный пароль')
                    }
                } else {
                    wrongAuth("Неверный email");
                }
            })
    });

    router.post('/signup', (req, res, next) => {
        db.query(res, "SELECT * " +
            "FROM users " +
            "WHERE email=$1", [user.email])
            .then((result) => {
                if (result.length > 0)
                    res.status(400).json({"result": 'Пользователь с таким email уже существует'});
                else
                    next();
            })
    });

    router.post('/signup', (req, res) => {
        console.log('signup');
        db.query(res, "insert into users(email, password, hash, active) " +
            "values($1, $2, $3, $4)", [user.email, hash.getPassword(user.password), md5(user.email), 0])
            .then(() => {

                let linkSignup = link + 'verification?key=' + md5(user.email);
                console.log('linkSignup')
                console.log(linkSignup)
                sentEmail(user.email, 'Подтверждение учетной записи', 'Для подтверждение учетной записи перейдите по ссылке ' + linkSignup);
                res.status(200).json({'result': [{message:"OK"}]});
            });

    });


    router.post('/resetPassword', (req, res) => {
        db.query(res, "select id from users " +
            "where email = $1 and active = 1", [user.email]).then((result) => {
            if (result.length > 0) {
                let userId = result[0].id;
                let min = Math.trunc(((Date.now() % (1000 * 60 * 60)) / (1000 * 60)));
                let hour = Math.trunc(Date.now() / (1000 * 60 * 60)) + 1;
                let linkReset = link + 'password?id=' + userId + '&min=' + min + '&key=' + md5(userId.toString() + hour.toString());
                sentEmail(user.email, 'Сброс пароля', 'Для сброса текущего пароля перейдите по ссылке ' + linkReset);
                res.status(200).json({'result': [{message:"OK"}]});
            } else {
                res.status(400).json({"result": 'Пользователя с таким email не существует'})
            }
        });
    });


    return router
};