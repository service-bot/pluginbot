let path = require("path");
let {createStore, combineReducers, applyMiddleware} = require("redux");
let saga = require("redux-saga");
let {take, put, actionChannel, all, call, fork, takeEvery, flush, select} = require("redux-saga/effects");
let Plugin = require("./plugin");
let {provideService} = require("../actions");
let consumptionChannel = require("../effects/consumptionChannel");
let pattern = function(serviceType) {

    return function(action) {
        return (action.type == "PROVIDE_SERVICE" && action.serviceType == serviceType);
    }
};

class PluginbotBase {
    /**
     *
     * @param plugins - A hash table of Plugin Name : Plugin Object - usually built by wrapper classes.
     */

    constructor(plugins){
        //todo : validate plugins
        this.plugins = plugins;
        this.serviceChannels = {};

        // this.pluginHandler = {
        //     get: function(target, name){
        //         if(target[name]){
        //             return target[name];
        //         }else{
        //             target[name] = self.enablePlugin(self.getPluginConfig(name));
        //             return target[name];
        //         }
        //     }
        // }

    }


    *buildInitialChannels(consumes){
        if(!consumes){
            return {};
        }

        return yield all(consumes.reduce((acc,service) => {
            acc[service] = call(this.cloneChannel.bind(this), service);
            return acc;
        }, {}));

    }

    *cloneChannel(serviceToConsume){
        let services = yield select(state => state.pluginbot.services[serviceToConsume]);
        let newChannel = yield call(consumptionChannel, Plugin.serviceProvidedPattern(serviceToConsume));
        if(services) {
            for (let serviceToPut of services) {
                yield put(newChannel, provideService(serviceToConsume, serviceToPut, "pluginbot"));
            }
        }
        return newChannel;
    }
    /**
     *
     * @param reducers - key value object of reducers (expected input of a combineReducers.
     * @param middleware - Redux middleware to be applied to internal redux store.
     * @returns {Promise.<void>}
     */
    initialize(reducers={}, ...middleware) {
        let self = this;
        return new Promise((resolve, reject) => {

            let sagaMiddleware = saga.default();

            let initialState = {
                plugins: {},
                services: {}
            };


            //todo: handle service cancellation and plugin disable...
            let pluginbotReducer = function (state = initialState, action) {
                switch (action.type) {
                    case "PLUGIN_ENABLED" :
                        state.plugins[action.plugin.name] = action.plugin
                        return state;
                    case "SERVICE_PROVIDED" :
                        let services = state.services[action.serviceType];
                        if (services) {
                            services.push(action.service);
                        } else {
                            state.services[action.serviceType] = [action.service];
                        }
                        return state;
                    default :
                        return state;

                }
            };


            let initialReducer = combineReducers({
                ...reducers,
                pluginbot: pluginbotReducer
            });


            this.sagaMiddleware = sagaMiddleware;
            this.store = createStore(initialReducer, applyMiddleware(...middleware, sagaMiddleware));
            this.runSaga = sagaMiddleware.run;
            this.pluginReducers = {};
            this.serviceProviders = {};
            let rootSaga = {};
            let pluginsStartedSaga = {}
            let channels = {};

            for (let [pluginName, plugin] of Object.entries(this.plugins)) {
                if(plugin.pkgPart.consumes){
                    plugin.pkgPart.consumes.reduce((acc, serviceToConsume) => {
                        if(!acc[serviceToConsume]){
                            acc[serviceToConsume] = actionChannel(Plugin.serviceProvidedPattern(serviceToConsume))
                        }
                        return acc;
                    }, channels);
                }

                rootSaga[pluginName] = call(plugin.initialize.bind(plugin), resolve);
                pluginsStartedSaga[pluginName] = take(Plugin.pluginEnabledPattern(pluginName));

            }
            //saga to store buffer of all services provided
            sagaMiddleware.run(function*(){
                let allChannels = yield all(channels);
                self.serviceChannels = allChannels;

                //todo: add support for unconsumed services that get added.
            })
            //saga to initialize all plugins
            sagaMiddleware.run(function* () {
                let allPlugins = yield fork(all, rootSaga);

            });
            //saga to resolve when all plugins are started
            sagaMiddleware.run(function*(){
                let allPluginsStarted = yield all(pluginsStartedSaga);
                console.log("ALL STARTED!");
                resolve(allPluginsStarted);
            })

            //saga to get new plugins after installation
            sagaMiddleware.run(function*(){
                yield takeEvery("ENABLE_PLUGIN", function*(action){
                    //start the plugin
                    let channels = yield call(self.buildInitialChannels.bind(self), action.plugin.pkgPart.consumes);
                    let pluginTask = yield fork(call, action.plugin.enable.bind(action.plugin), channels);

                    //get the plugin enabled signal
                    yield put({type: "START_PLUGINBOT"});
                    let pluginEnabled = yield take(Plugin.pluginEnabledPattern(action.plugin.name));
                    action.done(pluginEnabled);
                })
            })



            this.store.dispatch({type: "START_PLUGINBOT"});


        })
    }
    _enablePlugin(plugin) {
        return new Promise(resolve => {
            if(this.plugins[plugin.name]){
                console.error("plugin already enabled!")
                    return resolve(plugin);

            }
            this.plugins[plugin.name] = plugin;
            //todo : switch this to thunks?
            this.store.dispatch({type: "ENABLE_PLUGIN", plugin: plugin, done : resolve});
        })
    }

    buildImports(pluginPkgPart){
        let self = this;
        let imports = {};
        if(pluginPkgPart.requires && pluginPkgPart.requires.length > 0){
            pluginPkgPart.requires.reduce((acc, requirement) => {
                acc[requirement] = self.plugins[requirement]
                if(!acc[requirement]){
                    throw "import not found!";
                }
            }, imports);
        }
        return imports;
    }

}




module.exports = PluginbotBase;

