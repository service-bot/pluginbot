let path = require("path");
let {createStore, combineReducers, applyMiddleware} = require("redux");
let saga = require("redux-saga");
let {buffers} = require('redux-saga');
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

    constructor(plugins, config){
        //todo : validate plugins
        this.plugins = plugins;
        this.serviceChannels = {};
        this.config = config;
        this.tasks = [];

    }


    *buildInitialChannels(consumes){
        if(!consumes){
            return {};
        }

        return yield all(consumes.reduce((acc,service) => {
            acc[service] = call(this.buildConsumptionChannel.bind(this), service);
            return acc;
        }, {}));

    }

    *buildConsumptionChannel(serviceToConsume){
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
                services: {},
            };


            //todo: handle service cancellation and plugin disable...
            let pluginbotReducer = function (state = initialState, action) {
                switch (action.type) {
                    case "PLUGIN_ENABLED" :
                        state.plugins[action.plugin.name] = action.plugin
                        return state;
                    case "SERVICE_PROVIDED" :
                        let services = state.services[action.serviceType];
                        //ephemeral services don't stay in store.
                        if(action.ephemeral){
                            return state;
                        }
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
            this.runSaga = function(saga, ...args){
                self.tasks.push(sagaMiddleware.run(saga, ...args));
            };
            this.pluginReducers = {};
            this.serviceProviders = {};
            let rootSaga = {};
            let pluginsStartedSaga = {}
            let channels = {};
            for (let [pluginName, plugin] of Object.entries(this.plugins)) {
                let pluginChannels = {};
                if(plugin.pkgPart.consumes){
                    plugin.pkgPart.consumes.reduce((acc, serviceToConsume) => {
                        if(!acc[serviceToConsume]){
                            pluginChannels[serviceToConsume] = actionChannel(Plugin.serviceProvidedPattern(serviceToConsume), buffers.expanding());
                        }
                        return acc;
                    }, pluginChannels);
                }

                let pluginSaga = function*(consumptionChannels){
                    let enablePlugin = yield call(plugin.enable.bind(plugin), consumptionChannels);
                    return enablePlugin;

                };
                rootSaga[pluginName] = pluginSaga;
                channels[pluginName] = all(pluginChannels);

                pluginsStartedSaga[pluginName] = take(Plugin.pluginEnabledPattern(pluginName));

            }
            //saga to initialize all plugins
            this.tasks.push(sagaMiddleware.run(function* () {

                //start buffering  all service channels
                let allChannels = yield all(channels);
                let pluginTasks = {}

                //start enabling all plugins
                for(let [pluginName, pluginSaga] of Object.entries(rootSaga)){
                    pluginTasks[pluginName] = yield fork(pluginSaga, allChannels[pluginName]);
                }

                resolve(self.plugins);

            }));

            //saga to enable plugins after initialization
            this.tasks.push(sagaMiddleware.run(function*(){
                yield takeEvery("ENABLE_PLUGIN", function*(action){
                    //start the plugin
                    let channels = yield call(self.buildInitialChannels.bind(self), action.plugin.pkgPart.consumes);
                    if(self.config && self.config.enable){
                        let enableChannels = self._getLazyChannels();
                        yield call(self.config.enable, enableChannels, action.plugin.name);
                    }
                    let pluginTask = yield fork(call, action.plugin.enable.bind(action.plugin), channels);

                    //wait the plugin enabled signal
                    let pluginEnabled = yield take(Plugin.pluginEnabledPattern(action.plugin.name));

                    //todo : do we need this still?
                    action.done(pluginEnabled);
                })
            }))

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
        })
    }

    *_installWrapper(installFunction, consumes){

    }
    _getLazyChannels(){
        let self = this;
        let channelHandler = {
            get: function(target, name){
                if(target[name]){
                    return target[name];
                }else{
                    return function*(){
                        target[name] = yield call(self.buildConsumptionChannel, name);
                        return target[name];
                    };
                }
            }
        };
        return (new Proxy({}, channelHandler));
    }

    //todo: take in plugin object instead of parts .
    //todo: stop using done?
    *_install(pluginFunctions, pluginName, done=()=>{}){
        if(this.plugins[pluginName]){
            console.error("plugin already installed and enabled");
            done();
        }
        try {

            if (this.config.install) {


                yield call(this.config.install.bind(this), this._getLazyChannels() , pluginName, pluginFunctions.install);
            } else if(pluginFunctions.install) {
                yield call(pluginFunctions.install);
            }
            yield put({type: "PLUGIN_INSTALLED", pluginName: pluginName});
            done();
        }catch(error){
            done(error);
        }
    }


    _enablePlugin(plugin) {
        return new Promise(resolve => {
            if(this.plugins[plugin.name]){
                console.error("plugin already enabled!")
                    return resolve(plugin);

            }

            this.plugins[plugin.name] = plugin;
            //todo : switch this to thunks?
            //todo: unify the method of installing and enabling - right now one is saga other is promise
            this.store.dispatch({type: "ENABLE_PLUGIN", plugin: plugin, done : resolve});
        })
    }
}




module.exports = PluginbotBase;

