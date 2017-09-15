let path = require("path");
let {createStore, combineReducers, applyMiddleware} = require("redux");
let saga = require("redux-saga");
let {take, put, actionChannel, all, call} = require("redux-saga/effects");
let Plugin = require("./plugin");
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





    // buildInitialChannels(pluginConfigs){
    //     let channels = {}
    //     let self = this;
    //     return pluginConfigs.reduce((acc,pluginConfig) => {
    //         let pkg = self.getPluginPackage(pluginConfig);
    //         let servicesToConsume = pkg.consumes;
    //         if(servicesToConsume){
    //             channels[pkg.name] = servicesToConsume.reduce((serviceMap,service) => {
    //                 serviceMap[service] = actionChannel(pattern(service));
    //                 return serviceMap;
    //             }, {})
    //         }
    //         return channels;
    //     }, channels)
    // }
    /**
     *
     * @param middleware - Redux middleware to be applied to internal redux store.
     * @returns {Promise.<void>}
     */
    async initialize(...middleware){
        let sagaMiddleware = saga.default();

        //todo: handle service cancellation and plugin disable...
        let initialReducer = function(state={}, action){
            switch(action.type){
                case "PLUGIN_ENABLED" :
                    state.plugins[action.plugin.name] = action.plugin
                    return state;
                case "SERVICE_PROVIDED" :
                    let services = state.services[action.serviceType];
                    if(services){
                        services.push(action.service);
                    }else{
                        state.services[action.serviceType] = [action.service];
                    }
                    return state;
                default :
                    return state;

            }
        };


        let initialState = {
            plugins : {

            },
            services : {

            }
        };


        this.sagaMiddleware = sagaMiddleware;
        this.store = createStore(initialReducer, initialState,  applyMiddleware(...middleware, sagaMiddleware));
        this.runSaga = sagaMiddleware.run;
        this.pluginReducers = {};
        this.serviceProviders = {};
        let rootSaga = {};
        for(let [pluginName, plugin] of Object.entries(this.plugins)){
            rootSaga[pluginName] = call(plugin.initialize.bind(plugin));
        }
        sagaMiddleware.run(function*(){yield all(rootSaga)});
        this.store.dispatch({type : "START_PLUGINBOT"});

    }
    consume(channel){
        return call(this.serviceConsumer, channel)

    }
    * serviceConsumer(channel){
        let action = yield take(channel);
        return action.service;
    }

    provide(service){

    }




}




module.exports = PluginbotBase;

