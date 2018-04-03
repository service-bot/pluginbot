"use strict";

var _slicedToArray2 = require("babel-runtime/helpers/slicedToArray");

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _extends2 = require("babel-runtime/helpers/extends");

var _extends3 = _interopRequireDefault(_extends2);

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var path = require("path");

var _require = require("redux"),
    createStore = _require.createStore,
    combineReducers = _require.combineReducers,
    applyMiddleware = _require.applyMiddleware;

var saga = require("redux-saga");

var _require2 = require("redux-saga/effects"),
    take = _require2.take,
    put = _require2.put,
    actionChannel = _require2.actionChannel,
    all = _require2.all,
    call = _require2.call,
    fork = _require2.fork,
    takeEvery = _require2.takeEvery,
    flush = _require2.flush,
    select = _require2.select;

var Plugin = require("./plugin");

var _require3 = require("../actions"),
    provideService = _require3.provideService;

var consumptionChannel = require("../effects/consumptionChannel");
var pattern = function pattern(serviceType) {

    return function (action) {
        return action.type == "PROVIDE_SERVICE" && action.serviceType == serviceType;
    };
};

var PluginbotBase = function () {

    /**
     *
     * @param plugins - A hash table of Plugin Name : Plugin Object - usually built by wrapper classes.
     */

    function PluginbotBase(plugins, config) {
        (0, _classCallCheck3.default)(this, PluginbotBase);

        //todo : validate plugins
        this.plugins = plugins;
        this.serviceChannels = {};
        this.config = config;
        this.tasks = [];
    }

    (0, _createClass3.default)(PluginbotBase, [{
        key: "buildInitialChannels",
        value: /*#__PURE__*/_regenerator2.default.mark(function buildInitialChannels(consumes) {
            var _this = this;

            return _regenerator2.default.wrap(function buildInitialChannels$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            if (consumes) {
                                _context.next = 2;
                                break;
                            }

                            return _context.abrupt("return", {});

                        case 2:
                            _context.next = 4;
                            return all(consumes.reduce(function (acc, service) {
                                acc[service] = call(_this.buildConsumptionChannel.bind(_this), service);
                                return acc;
                            }, {}));

                        case 4:
                            return _context.abrupt("return", _context.sent);

                        case 5:
                        case "end":
                            return _context.stop();
                    }
                }
            }, buildInitialChannels, this);
        })
    }, {
        key: "buildConsumptionChannel",
        value: /*#__PURE__*/_regenerator2.default.mark(function buildConsumptionChannel(serviceToConsume) {
            var services, newChannel, _iteratorNormalCompletion, _didIteratorError, _iteratorError, _iterator, _step, serviceToPut;

            return _regenerator2.default.wrap(function buildConsumptionChannel$(_context2) {
                while (1) {
                    switch (_context2.prev = _context2.next) {
                        case 0:
                            _context2.next = 2;
                            return select(function (state) {
                                return state.pluginbot.services[serviceToConsume];
                            });

                        case 2:
                            services = _context2.sent;
                            _context2.next = 5;
                            return call(consumptionChannel, Plugin.serviceProvidedPattern(serviceToConsume));

                        case 5:
                            newChannel = _context2.sent;

                            if (!services) {
                                _context2.next = 33;
                                break;
                            }

                            _iteratorNormalCompletion = true;
                            _didIteratorError = false;
                            _iteratorError = undefined;
                            _context2.prev = 10;
                            _iterator = services[Symbol.iterator]();

                        case 12:
                            if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
                                _context2.next = 19;
                                break;
                            }

                            serviceToPut = _step.value;
                            _context2.next = 16;
                            return put(newChannel, provideService(serviceToConsume, serviceToPut, "pluginbot"));

                        case 16:
                            _iteratorNormalCompletion = true;
                            _context2.next = 12;
                            break;

                        case 19:
                            _context2.next = 25;
                            break;

                        case 21:
                            _context2.prev = 21;
                            _context2.t0 = _context2["catch"](10);
                            _didIteratorError = true;
                            _iteratorError = _context2.t0;

                        case 25:
                            _context2.prev = 25;
                            _context2.prev = 26;

                            if (!_iteratorNormalCompletion && _iterator.return) {
                                _iterator.return();
                            }

                        case 28:
                            _context2.prev = 28;

                            if (!_didIteratorError) {
                                _context2.next = 31;
                                break;
                            }

                            throw _iteratorError;

                        case 31:
                            return _context2.finish(28);

                        case 32:
                            return _context2.finish(25);

                        case 33:
                            return _context2.abrupt("return", newChannel);

                        case 34:
                        case "end":
                            return _context2.stop();
                    }
                }
            }, buildConsumptionChannel, this, [[10, 21, 25, 33], [26,, 28, 32]]);
        })
        /**
         *
         * @param reducers - key value object of reducers (expected input of a combineReducers.
         * @param middleware - Redux middleware to be applied to internal redux store.
         * @returns {Promise.<void>}
         */

    }, {
        key: "initialize",
        value: function initialize() {
            var _this2 = this;

            for (var _len = arguments.length, middleware = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
                middleware[_key - 1] = arguments[_key];
            }

            var reducers = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

            var self = this;
            return new Promise(function (resolve, reject) {

                var sagaMiddleware = saga.default();

                var initialState = {
                    plugins: {},
                    services: {}
                };

                //todo: handle service cancellation and plugin disable...
                var pluginbotReducer = function pluginbotReducer() {
                    var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : initialState;
                    var action = arguments[1];

                    switch (action.type) {
                        case "PLUGIN_ENABLED":
                            state.plugins[action.plugin.name] = action.plugin;
                            return state;
                        case "SERVICE_PROVIDED":
                            var services = state.services[action.serviceType];
                            //ephemeral services don't stay in store.
                            if (action.ephemeral) {
                                return state;
                            }
                            if (services) {
                                services.push(action.service);
                            } else {
                                state.services[action.serviceType] = [action.service];
                            }
                            return state;
                        default:
                            return state;

                    }
                };

                var initialReducer = combineReducers((0, _extends3.default)({}, reducers, {
                    pluginbot: pluginbotReducer
                }));

                _this2.sagaMiddleware = sagaMiddleware;
                _this2.store = createStore(initialReducer, applyMiddleware.apply(undefined, middleware.concat([sagaMiddleware])));
                _this2.runSaga = function (saga) {
                    for (var _len2 = arguments.length, args = Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
                        args[_key2 - 1] = arguments[_key2];
                    }

                    self.tasks.push(sagaMiddleware.run.apply(sagaMiddleware, [saga].concat(args)));
                };
                _this2.pluginReducers = {};
                _this2.serviceProviders = {};
                var rootSaga = {};
                var pluginsStartedSaga = {};
                var channels = {};
                var _iteratorNormalCompletion2 = true;
                var _didIteratorError2 = false;
                var _iteratorError2 = undefined;

                try {
                    var _loop = function _loop() {
                        var _step2$value = (0, _slicedToArray3.default)(_step2.value, 2),
                            pluginName = _step2$value[0],
                            plugin = _step2$value[1];

                        var pluginChannels = {};
                        if (plugin.pkgPart.consumes) {
                            plugin.pkgPart.consumes.reduce(function (acc, serviceToConsume) {
                                if (!acc[serviceToConsume]) {
                                    pluginChannels[serviceToConsume] = actionChannel(Plugin.serviceProvidedPattern(serviceToConsume));
                                }
                                return acc;
                            }, pluginChannels);
                        }

                        var pluginSaga = /*#__PURE__*/_regenerator2.default.mark(function pluginSaga(consumptionChannels) {
                            var enablePlugin;
                            return _regenerator2.default.wrap(function pluginSaga$(_context6) {
                                while (1) {
                                    switch (_context6.prev = _context6.next) {
                                        case 0:
                                            _context6.next = 2;
                                            return call(plugin.enable.bind(plugin), consumptionChannels);

                                        case 2:
                                            enablePlugin = _context6.sent;
                                            return _context6.abrupt("return", enablePlugin);

                                        case 4:
                                        case "end":
                                            return _context6.stop();
                                    }
                                }
                            }, pluginSaga, this);
                        });
                        rootSaga[pluginName] = pluginSaga;
                        channels[pluginName] = all(pluginChannels);

                        pluginsStartedSaga[pluginName] = take(Plugin.pluginEnabledPattern(pluginName));
                    };

                    for (var _iterator2 = Object.entries(_this2.plugins)[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
                        _loop();
                    }
                    //saga to initialize all plugins
                } catch (err) {
                    _didIteratorError2 = true;
                    _iteratorError2 = err;
                } finally {
                    try {
                        if (!_iteratorNormalCompletion2 && _iterator2.return) {
                            _iterator2.return();
                        }
                    } finally {
                        if (_didIteratorError2) {
                            throw _iteratorError2;
                        }
                    }
                }

                _this2.tasks.push(sagaMiddleware.run( /*#__PURE__*/_regenerator2.default.mark(function _callee() {
                    var allChannels, pluginTasks, _iteratorNormalCompletion3, _didIteratorError3, _iteratorError3, _iterator3, _step3, _step3$value, pluginName, pluginSaga;

                    return _regenerator2.default.wrap(function _callee$(_context3) {
                        while (1) {
                            switch (_context3.prev = _context3.next) {
                                case 0:
                                    _context3.next = 2;
                                    return all(channels);

                                case 2:
                                    allChannels = _context3.sent;
                                    pluginTasks = {};

                                    //start enabling all plugins

                                    _iteratorNormalCompletion3 = true;
                                    _didIteratorError3 = false;
                                    _iteratorError3 = undefined;
                                    _context3.prev = 7;
                                    _iterator3 = Object.entries(rootSaga)[Symbol.iterator]();

                                case 9:
                                    if (_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done) {
                                        _context3.next = 17;
                                        break;
                                    }

                                    _step3$value = (0, _slicedToArray3.default)(_step3.value, 2), pluginName = _step3$value[0], pluginSaga = _step3$value[1];
                                    _context3.next = 13;
                                    return fork(pluginSaga, allChannels[pluginName]);

                                case 13:
                                    pluginTasks[pluginName] = _context3.sent;

                                case 14:
                                    _iteratorNormalCompletion3 = true;
                                    _context3.next = 9;
                                    break;

                                case 17:
                                    _context3.next = 23;
                                    break;

                                case 19:
                                    _context3.prev = 19;
                                    _context3.t0 = _context3["catch"](7);
                                    _didIteratorError3 = true;
                                    _iteratorError3 = _context3.t0;

                                case 23:
                                    _context3.prev = 23;
                                    _context3.prev = 24;

                                    if (!_iteratorNormalCompletion3 && _iterator3.return) {
                                        _iterator3.return();
                                    }

                                case 26:
                                    _context3.prev = 26;

                                    if (!_didIteratorError3) {
                                        _context3.next = 29;
                                        break;
                                    }

                                    throw _iteratorError3;

                                case 29:
                                    return _context3.finish(26);

                                case 30:
                                    return _context3.finish(23);

                                case 31:

                                    resolve(self.plugins);

                                case 32:
                                case "end":
                                    return _context3.stop();
                            }
                        }
                    }, _callee, this, [[7, 19, 23, 31], [24,, 26, 30]]);
                })));

                //saga to enable plugins after initialization
                _this2.tasks.push(sagaMiddleware.run( /*#__PURE__*/_regenerator2.default.mark(function _callee3() {
                    return _regenerator2.default.wrap(function _callee3$(_context5) {
                        while (1) {
                            switch (_context5.prev = _context5.next) {
                                case 0:
                                    _context5.next = 2;
                                    return takeEvery("ENABLE_PLUGIN", /*#__PURE__*/_regenerator2.default.mark(function _callee2(action) {
                                        var channels, enableChannels, pluginTask, pluginEnabled;
                                        return _regenerator2.default.wrap(function _callee2$(_context4) {
                                            while (1) {
                                                switch (_context4.prev = _context4.next) {
                                                    case 0:
                                                        _context4.next = 2;
                                                        return call(self.buildInitialChannels.bind(self), action.plugin.pkgPart.consumes);

                                                    case 2:
                                                        channels = _context4.sent;

                                                        if (!(self.config && self.config.enable)) {
                                                            _context4.next = 7;
                                                            break;
                                                        }

                                                        enableChannels = self._getLazyChannels();
                                                        _context4.next = 7;
                                                        return call(self.config.enable, enableChannels, action.plugin.name);

                                                    case 7:
                                                        _context4.next = 9;
                                                        return fork(call, action.plugin.enable.bind(action.plugin), channels);

                                                    case 9:
                                                        pluginTask = _context4.sent;
                                                        _context4.next = 12;
                                                        return take(Plugin.pluginEnabledPattern(action.plugin.name));

                                                    case 12:
                                                        pluginEnabled = _context4.sent;


                                                        //todo : do we need this still?
                                                        action.done(pluginEnabled);

                                                    case 14:
                                                    case "end":
                                                        return _context4.stop();
                                                }
                                            }
                                        }, _callee2, this);
                                    }));

                                case 2:
                                case "end":
                                    return _context5.stop();
                            }
                        }
                    }, _callee3, this);
                })));

                // this.tasks.push(sagaMiddleware.run(function*(){
                //     yield takeEvery("INSTALL_PLUGIN", function*(action){
                //         let plugin = action.plugin;
                //         if(self.plugins[plugin.pluginName]){
                //             console.error("Plugin " + plugin.name + " is already installed + enabled");
                //
                //         }else{
                //             yield call(self._install.bind(self), plugin.plugin, plugin.pluginName)
                //         }
                //     })
                // }))
            });
        }
    }, {
        key: "_installWrapper",
        value: /*#__PURE__*/_regenerator2.default.mark(function _installWrapper(installFunction, consumes) {
            return _regenerator2.default.wrap(function _installWrapper$(_context7) {
                while (1) {
                    switch (_context7.prev = _context7.next) {
                        case 0:
                        case "end":
                            return _context7.stop();
                    }
                }
            }, _installWrapper, this);
        })
    }, {
        key: "_getLazyChannels",
        value: function _getLazyChannels() {
            var self = this;
            var channelHandler = {
                get: function get(target, name) {
                    if (target[name]) {
                        return target[name];
                    } else {
                        return (/*#__PURE__*/_regenerator2.default.mark(function _callee4() {
                                return _regenerator2.default.wrap(function _callee4$(_context8) {
                                    while (1) {
                                        switch (_context8.prev = _context8.next) {
                                            case 0:
                                                _context8.next = 2;
                                                return call(self.buildConsumptionChannel, name);

                                            case 2:
                                                target[name] = _context8.sent;
                                                return _context8.abrupt("return", target[name]);

                                            case 4:
                                            case "end":
                                                return _context8.stop();
                                        }
                                    }
                                }, _callee4, this);
                            })
                        );
                    }
                }
            };
            return new Proxy({}, channelHandler);
        }

        //todo: take in plugin object instead of parts .
        //todo: stop using done?

    }, {
        key: "_install",
        value: /*#__PURE__*/_regenerator2.default.mark(function _install(pluginFunctions, pluginName) {
            var done = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : function () {};
            return _regenerator2.default.wrap(function _install$(_context9) {
                while (1) {
                    switch (_context9.prev = _context9.next) {
                        case 0:
                            if (this.plugins[pluginName]) {
                                console.error("plugin already installed and enabled");
                                done();
                            }
                            _context9.prev = 1;

                            if (!this.config.install) {
                                _context9.next = 7;
                                break;
                            }

                            _context9.next = 5;
                            return call(this.config.install.bind(this), this._getLazyChannels(), pluginName, pluginFunctions.install);

                        case 5:
                            _context9.next = 10;
                            break;

                        case 7:
                            if (!pluginFunctions.install) {
                                _context9.next = 10;
                                break;
                            }

                            _context9.next = 10;
                            return call(pluginFunctions.install);

                        case 10:
                            _context9.next = 12;
                            return put({ type: "PLUGIN_INSTALLED", pluginName: pluginName });

                        case 12:
                            done();
                            _context9.next = 18;
                            break;

                        case 15:
                            _context9.prev = 15;
                            _context9.t0 = _context9["catch"](1);

                            done(_context9.t0);

                        case 18:
                        case "end":
                            return _context9.stop();
                    }
                }
            }, _install, this, [[1, 15]]);
        })
    }, {
        key: "_enablePlugin",
        value: function _enablePlugin(plugin) {
            var _this3 = this;

            return new Promise(function (resolve) {
                if (_this3.plugins[plugin.name]) {
                    console.error("plugin already enabled!");
                    return resolve(plugin);
                }

                _this3.plugins[plugin.name] = plugin;
                //todo : switch this to thunks?
                //todo: unify the method of installing and enabling - right now one is saga other is promise
                _this3.store.dispatch({ type: "ENABLE_PLUGIN", plugin: plugin, done: resolve });
            });
        }
    }]);
    return PluginbotBase;
}();

module.exports = PluginbotBase;