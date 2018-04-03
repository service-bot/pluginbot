"use strict";

var _slicedToArray2 = require("babel-runtime/helpers/slicedToArray");

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _regenerator = require("babel-runtime/regenerator");

var _regenerator2 = _interopRequireDefault(_regenerator);

var _classCallCheck2 = require("babel-runtime/helpers/classCallCheck");

var _classCallCheck3 = _interopRequireDefault(_classCallCheck2);

var _createClass2 = require("babel-runtime/helpers/createClass");

var _createClass3 = _interopRequireDefault(_createClass2);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _require = require("redux-saga/effects"),
    take = _require.take,
    put = _require.put,
    actionChannel = _require.actionChannel,
    all = _require.all,
    call = _require.call,
    fork = _require.fork;

var _require2 = require("../actions"),
    enablePlugin = _require2.enablePlugin,
    provideService = _require2.provideService;

var Plugin = function () {
    (0, _createClass3.default)(Plugin, null, [{
        key: "pluginEnabledPattern",
        value: function pluginEnabledPattern(pluginName) {
            return function (action) {
                return action.type == "PLUGIN_ENABLED" && action.plugin.name == pluginName;
            };
        }
    }, {
        key: "pluginInstalledPattern",
        value: function pluginInstalledPattern(pluginName) {
            return function (action) {
                return action.type == "PLUGIN_INSTALLED" && action.pluginName == pluginName;
            };
        }
    }, {
        key: "serviceProvidedPattern",
        value: function serviceProvidedPattern(serviceType) {

            return function (action) {
                return action.type == "SERVICE_PROVIDED" && action.serviceType == serviceType;
            };
        }
    }]);

    function Plugin(plugin, pluginPackage, pluginConfig, pluginPackagePart, store) {
        (0, _classCallCheck3.default)(this, Plugin);

        this.name = pluginPackage.name;
        this.pkg = pluginPackage;
        this.plugin = plugin;
        this.config = pluginConfig;
        this.pkgPart = pluginPackagePart;
        this.store = store;
    }

    (0, _createClass3.default)(Plugin, [{
        key: "provide",
        value: function provide(services) {
            var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};

            return call(Plugin.provideServices, services, this, options.ephemeral);
        }

        //todo: do we need  installation configurations?

    }, {
        key: "enable",
        value: /*#__PURE__*/_regenerator2.default.mark(function enable(channels) {
            var run;
            return _regenerator2.default.wrap(function enable$(_context) {
                while (1) {
                    switch (_context.prev = _context.next) {
                        case 0:
                            _context.next = 2;
                            return put(enablePlugin(this));

                        case 2:
                            if (!this.plugin.run) {
                                _context.next = 6;
                                break;
                            }

                            _context.next = 5;
                            return fork(this.plugin.run, this.config, this.provide, channels);

                        case 5:
                            run = _context.sent;

                        case 6:
                        case "end":
                            return _context.stop();
                    }
                }
            }, enable, this);
        })
    }], [{
        key: "provideServices",
        value: /*#__PURE__*/_regenerator2.default.mark(function provideServices(services, provider) {
            var _this = this;

            var ephemeral = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : false;

            var _iteratorNormalCompletion, _didIteratorError, _iteratorError, _loop, _iterator, _step;

            return _regenerator2.default.wrap(function provideServices$(_context3) {
                while (1) {
                    switch (_context3.prev = _context3.next) {
                        case 0:
                            _iteratorNormalCompletion = true;
                            _didIteratorError = false;
                            _iteratorError = undefined;
                            _context3.prev = 3;
                            _loop = /*#__PURE__*/_regenerator2.default.mark(function _loop() {
                                var _step$value, key, value;

                                return _regenerator2.default.wrap(function _loop$(_context2) {
                                    while (1) {
                                        switch (_context2.prev = _context2.next) {
                                            case 0:
                                                _step$value = (0, _slicedToArray3.default)(_step.value, 2), key = _step$value[0], value = _step$value[1];

                                                if (!Array.isArray(value)) {
                                                    _context2.next = 6;
                                                    break;
                                                }

                                                _context2.next = 4;
                                                return all(value.map(function (service) {
                                                    return put(provideService(key, service, provider, ephemeral));
                                                }));

                                            case 4:
                                                _context2.next = 8;
                                                break;

                                            case 6:
                                                _context2.next = 8;
                                                return put(provideService(key, value, provider));

                                            case 8:
                                            case "end":
                                                return _context2.stop();
                                        }
                                    }
                                }, _loop, _this);
                            });
                            _iterator = Object.entries(services)[Symbol.iterator]();

                        case 6:
                            if (_iteratorNormalCompletion = (_step = _iterator.next()).done) {
                                _context3.next = 11;
                                break;
                            }

                            return _context3.delegateYield(_loop(), "t0", 8);

                        case 8:
                            _iteratorNormalCompletion = true;
                            _context3.next = 6;
                            break;

                        case 11:
                            _context3.next = 17;
                            break;

                        case 13:
                            _context3.prev = 13;
                            _context3.t1 = _context3["catch"](3);
                            _didIteratorError = true;
                            _iteratorError = _context3.t1;

                        case 17:
                            _context3.prev = 17;
                            _context3.prev = 18;

                            if (!_iteratorNormalCompletion && _iterator.return) {
                                _iterator.return();
                            }

                        case 20:
                            _context3.prev = 20;

                            if (!_didIteratorError) {
                                _context3.next = 23;
                                break;
                            }

                            throw _iteratorError;

                        case 23:
                            return _context3.finish(20);

                        case 24:
                            return _context3.finish(17);

                        case 25:
                        case "end":
                            return _context3.stop();
                    }
                }
            }, provideServices, this, [[3, 13, 17, 25], [18,, 20, 24]]);
        })
    }, {
        key: "install",
        value: /*#__PURE__*/_regenerator2.default.mark(function install(pluginFunctions, pluginName, imports, done) {
            var installServices;
            return _regenerator2.default.wrap(function install$(_context4) {
                while (1) {
                    switch (_context4.prev = _context4.next) {
                        case 0:
                            _context4.prev = 0;

                            if (!pluginFunctions.install) {
                                _context4.next = 16;
                                break;
                            }

                            _context4.next = 4;
                            return call(pluginFunctions.install, imports);

                        case 4:
                            installServices = _context4.sent;

                            if (!installServices) {
                                _context4.next = 12;
                                break;
                            }

                            _context4.next = 8;
                            return call(Plugin.provideServices, installServices, pluginName);

                        case 8:
                            _context4.next = 10;
                            return take(Plugin.pluginInstalledPattern(pluginName));

                        case 10:
                            _context4.next = 14;
                            break;

                        case 12:
                            _context4.next = 14;
                            return put({ type: "PLUGIN_INSTALLED", pluginName: pluginName });

                        case 14:
                            _context4.next = 18;
                            break;

                        case 16:
                            _context4.next = 18;
                            return put({ type: "PLUGIN_INSTALLED", pluginName: pluginName });

                        case 18:
                            done();

                            _context4.next = 24;
                            break;

                        case 21:
                            _context4.prev = 21;
                            _context4.t0 = _context4["catch"](0);

                            done(_context4.t0);

                        case 24:
                        case "end":
                            return _context4.stop();
                    }
                }
            }, install, this, [[0, 21]]);
        })
    }]);
    return Plugin;
}();

module.exports = Plugin;