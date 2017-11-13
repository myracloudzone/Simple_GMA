module.exports = function (app, cb) {
    var express = require('express');
    var path = require('path');
    var util = require('util');
    var passport = require('passport');
    var SessionStore = require('express-mysql-session');
    var i18n = require("i18n");
    var fs = require('fs');
    var sprintf = require('sprintf-js').sprintf;
    var _ = require('lodash');
    var config1 = require('./scripts/config.json');
    var webServer = require('./scripts/web_socket.js');
    var encryptionService = require("./lib/EncryptionDecryption.js");
    var pathPrefix = '/service';
    var logger = require('./scripts/logger.js');
    var compression = require('compression')
    var moment = require('moment');

    var proxy = require('path-prefix-proxy')(pathPrefix);
    app.use(pathPrefix, proxy);
    app.use(proxy.denyUnproxied);
    var bodyParser = require('body-parser')

    var isVersionUpdate = process.env.npm_config_isVersionUpdate;
    if(isVersionUpdate == null) {
    	isVersionUpdate = process.env.isVersionUpdate;
    }
    if(isVersionUpdate != null && isVersionUpdate == 'true') {
    	var version_update = require('./scripts/db_update.js');
    }

    

    /* Started WebSocket Server */
    webServer.startWebSocketServer();

    i18n.configure({
        locales: ['en', 'de'],
        directory: __dirname + '/locales'
    });


    var appname = path.basename(process.argv[1], '.js').toLowerCase();
    var log = require('winston');
    log.configure({
        transports: [new(log.transports.File)({
            filename: 'somefile.log'
        })]
    });

    // Our routes and controllers have access to "app",
    // so give them access to the log and config objects.
    config = {}
    app.log = log;
    app.config = config;


    config.bookshelf = config1.connConfig;
    app.set('port', process.env.PORT || config.port || 3000);
    app.set('views', path.join(__dirname, 'views'));
    app.engine('html', require('ejs').renderFile);

    app.use('/services', express);
    app.use(function (req, res, next) {
        if (req.url.indexOf('/auth/login') < 0  && req.url.indexOf('/auth/logout') < 0 ) {
            authenticatUserSession(req, res, next);
        } else {
            handleRequest(req, res, next);
        }
    });

    app.use(bodyParser.urlencoded({
    	  extended: true
    	}));


    // CORS
    app.use(function (req, res, next) {
        res.header('Access-Control-Allow-Origin', req.headers.origin);
        res.header('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Final-Length, Offset, Content-Range, Content-Disposition, server_url, account, uuid');
        res.header('Access-Control-Allow-Credentials', 'true');
        if (req.method == 'OPTIONS') {
            res.send(200);
        } else {
            next();
        }
    });

    app.use(express.json());
    app.use(express.urlencoded());
    app.use(express.methodOverride());
    app.use(compression())

    app.use(i18n.init);

    app.use(express.cookieParser());
    app.use(express.bodyParser());
    //app.use(express.session({ store: SessionStore,secret: 'keyboard cat', resave: false, saveUninitialized: false,  cookie: {  httpOnly: false,secure: false }}));
    app.use(express.session({
        cookie: {
            maxAge: 36000000,
            httpOnly: false
        },
        secret: 'MySecret'
    }));
    app.use(passport.initialize());
    app.use(passport.session());

    app.use(function (req, res, next) {
        app.__ = res.__;
        next();
    });


    app.use(app.router);
    app.use(express.static(path.join(__dirname, 'public')));

    // Page not found errors
    app.use(function (req, res, next) {
        log.error("page not found: %s", req.url);
        res.send(app.__('Page not found'), 404);
    });

    // Server errors
    app.use(function (err, req, res, next) {
        if (err.noStackTrace)
            log.error("handled server error: status: %d: ",
                err.status || 500, err.message);
        else
            log.error("handled server error: status: %d: ",
                err.status || 500, err.stack, err);
        res.send(err.message, err.status || 500);
    });
    //app.use(fileUpload());

    // Initialize Bookshelf.
    if (process.env.SQL_TRACE == "1") config.bookshelf.debug = true;
    if (process.env.SQL_TRACE == "0") config.bookshelf.debug = false;

    // bring in Bookshelf!
    var knex = require('knex')(config.bookshelf);
    //var Bookshelf = require('bookshelf')( knex );
    // Bookshelf.DB = Bookshelf.initialize( config.bookshelf );
    var bookshelf = require('bookshelf')(knex);
    var Bookshelf = require('bookshelf');
    Bookshelf.DB = bookshelf;
    bookshelf.plugin('pagination')
    app.set('schema', bookshelf);

    /*
     * Add the registry plugin to handle table relations definitions without
     * curcular dependencies.
     */
    Bookshelf.DB.plugin('registry');
    // THIS FIXES A BUG IN BS MODEL RESOLUTION VISA the registry plugin!!
    Bookshelf.DB.model('_unused', {});
    Bookshelf.DB.collection('_unused', {});
    /*
     * Add the visibility plugin to hide model fields on toJSON, and
     * virtuals to synth "name" on User from first_name and last_name.
     */
    Bookshelf.DB.plugin('visibility');
    Bookshelf.DB.plugin('virtuals');

    // Warn the user if they are running against the production
    // database...
    if (process.env.NODE_ENV) {
        var banner = require('ascii-banner');
        banner.write('Warning')
            .color('red')
            .after('>You are running against the ' + process.env.NODE_ENV.toUpperCase() + ' database<', 'red')
            .after('>This is OK, but bee careful!!!<', 'green')
            .out();
    }

    var queryDebugMode = config1.queryDebugMode


    handleRequest = function (req, res, next) {
        var jsonp = res.jsonp;
        res.jsonp = function (obj) {
            if (req.param('fmt') == 'xml') {
                try {
                    var o = JSON.parse(JSON.stringify(obj));
                    body = xml.render(o);
                    body = body.replace(/count\+tail/g, 'count_tail');
                    res.header('Content-Type', 'text/xml');
                    return res.send(body);
                } catch (err) {
                    return next(err);
                }
            } else {
                return jsonp.call(res, obj);
            }
        };
        res.sendError = function (statusCode, err) {
            return res.status(statusCode).send(err.message);
        }
        next();
    }

    authenticatUserSession = function (req, res, next) {
        if (req.headers.uuid == null || req.headers.uuid == '' || req.headers.uuid == undefined) {
            res.status(403).send();
            return;
        }
        schema = app.get('schema');
        console.log(req.headers)
        schema.model('UserSession').forge().where({
            uuid: req.headers.uuid,
            active: 1,
            accountId : req.headers.account
        }).query(function (qb) {
            qb.debug(false)
        }).fetch().then(function (data) {
            if (data) {
                var userSession = data.toJSON();
                var dumpUserSession = _.clone(userSession);
                currentTime = moment().unix();
                differenceTime = (currentTime - userSession.lasthit);
                if (differenceTime < 72000000) {
                    req.session = {
                        'uuid': userSession.uuid
                    };
                    req.headers.accountId = userSession.accountId;
                    userSession.lasthit = moment().unix();
                    var isEqual = _.isEqual(userSession, dumpUserSession);
                    if (!isEqual) {
                        data.save(userSession, {
                            method: 'update',
                            patch: true,
                            require: false
                        }).then(function (result) {
                            handleRequest(req, res, next);
                        }).catch(function (err) {
                            return logger.logResponse(403, "Session Expired", err, res, req);
                        })
                    } else {
                        handleRequest(req, res, next);
                    }
                } else {
                    userSession.active = 0;
                    data.save(userSession, {
                        method: 'update',
                        patch: true,
                        require: false
                    }).then(function (result) {
                        return logger.logResponse(403, "Session Expired", "Session Expired.", res, req);
                    }).catch(function (err) {
                        return logger.logResponse(403, "Session Expired", err, res, req);
                    })
                }
            } else {
                return logger.logResponse(403, "Session Expired", "Session Expired.", res, req);
            }
        }).catch(function (err) {
            return logger.logResponse(403, "Session Expired", err, res, req);
        })
    }
    cb();
};
