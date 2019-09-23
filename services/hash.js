var bcrypt = require('bcrypt');
var jwt = require('jsonwebtoken');
const secretWord = 'becon';


const hash = {
    getPassword: function (password) {
        const saltRounds = 10;
        return bcrypt.hashSync(password, saltRounds);
    },

    checkPassword: function (password, hash) {
        return bcrypt.compareSync(password, hash);
    },

    generateJWT: function (id, email) {
        let expirationDate = Date.now();
        expirationDate += 30 * 24 * 60 * 60 * 1000;

        return jwt.sign({
            id: id,
            email: email,
            exp: expirationDate,
        }, secretWord);
    },

    decodedJWT: function(jwtCod){
        return jwt.verify(jwtCod, secretWord);
    },

    toAuthJSON: function (id, email) {
        return {
            email: email,
            token: hash.generateJWT(id, email)
        };
    }
};

module.exports = hash;