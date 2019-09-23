var nodemailer = require('nodemailer');
var transporter = nodemailer.createTransport({
    host: 'smtp.beget.com',
    port: 465,
    auth: {
        user: 'no-reply@dkrash.ru',
        pass: 'zdbUj0VzM'
    }
});

module.exports = function (email, subject, text) {
    transporter.sendMail({
        from: 'no-reply@dkrash.ru',
        to: email,
        subject: subject,
        text: text
    });
};