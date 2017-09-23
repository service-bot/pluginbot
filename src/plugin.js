let {take, put, actionChannel, all, call, fork} = require("redux-saga/effects");
let {enablePlugin, provideService} = require("../actions");


class Plugin {
    static pluginEnabledPattern(pluginName) {
        return function (action) {
            return (action.type == "PLUGIN_ENABLED" && action.plugin.name == pluginName);
        }
    }
    static pluginInstalledPattern(pluginName) {
        return function (action) {
            return (action.type == "PLUGIN_INSTALLED" && action.pluginName == pluginName);
        }
    }
    static serviceProvidedPattern(serviceType){

            return function(action) {
                return (action.type == "SERVICE_PROVIDED" && action.serviceType == serviceType);
            }

    }


    constructor(plugin, pluginPackage, pluginConfig, pluginPackagePart){
        this.name = pluginPackage.name;
        this.pkg = pluginPackage;
        this.plugin = plugin;
        this.config = pluginConfig;
        this.pkgPart = pluginPackagePart;


    }

    static *provideServices(services, provider){
        for(let [key, value] of Object.entries(services)){
            if(Array.isArray(value)){
                yield all(value.map(service => put(provideService(key, service, provider))))
            }else {
                yield put(provideService(key, value, provider));
            }
        }
    }

    provide(services){
        console.log("Providing serv!");
        return call(Plugin.provideServices, services, this)
    }

    //todo: do we need  installation configurations?
    static *install(pluginFunctions, pluginName, imports, done){
        try {
            if (pluginFunctions.install) {
                let installServices = yield call(pluginFunctions.install, imports);
                if(installServices) {
                    yield call(Plugin.provideServices, installServices, pluginName);
                    yield take(Plugin.pluginInstalledPattern(pluginName))
                }else{
                    yield put({type: "PLUGIN_INSTALLED", pluginName: pluginName});

                }
            } else {
                yield put({type: "PLUGIN_INSTALLED", pluginName: pluginName});
            }
            console.log("PLUGIN INSTALLED!", pluginName);
            done();

        }catch(error){
            done(error);
        }
    }


    *enable(channels){
        yield put(enablePlugin(this));
        console.log("STARTED PLUGIN " + this.name, this.plugin);
        if(this.plugin.run) {
            let run = yield fork(this.plugin.run, this.config, this.provide, channels);
        }
    }

}
module.exports = Plugin;