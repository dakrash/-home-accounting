const hash = require('../services/hash');

module.exports = function(express, app, db) {

    var auth = require('./auth')(db, express, hash);

    var main = require('./api/main')(db, express, hash);

    var apiAuth = require('./api/auth')(db, express, hash);

    app.use('/auth', auth);

    app.use('/api/auth', apiAuth);

    app.use('/api/main', main);

    require('./main')(db, app, hash, express);

};

