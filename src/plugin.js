let {take, put, actionChannel, all, call, fork} = require("redux-saga/effects");

const actions = {
    enablePlugin : (plugin) => ({type : "PLUGIN_ENABLED", plugin}),
    provideService : (serviceType, service, provider) => ({type : "SERVICE_PROVIDED", serviceType, service, provider}),
}



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


    constructor(plugin, pluginPackage, pluginConfig, pluginPackagePart, imports={}){
        this.name = pluginPackage.name;
        this.pkg = pluginPackage;
        this.plugin = plugin;
        this.config = pluginConfig;
        this.imports = imports;
        this.pkgPart = pluginPackagePart;


    }

    static *provideServices(services, provider){
        for(let [key, value] of Object.entries(services)){
            if(Array.isArray(value)){
                yield all(value.map(service => put(actions.provideService(key, service, provider))))
            }else {
                yield put(actions.provideService(key, value, provider));
            }
        }
    }

    *provide(services){
        Plugin.provideServices(services, this)
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
        // if(this.plugin.start) {
        //     this.services = yield call(this.plugin.start, this.config, this.imports);
        // }
        yield put(actions.enablePlugin(this));
        console.log("STARTED PLUGIN! " + this.name);
        // yield call(Plugin.provideServices, this.services, this);
        if(this.plugin.run) {
            let run = yield fork(this.plugin.run, this.config, this.provide, channels);
        }
    }



    // *initialize(){
    //     let channels = {}
    //
    //     //build channels to consume.
    //     if(this.pkgPart.consumes) {
    //         for (let serviceToConsume of this.pkgPart.consumes) {
    //             channels[serviceToConsume] = yield actionChannel(Plugin.serviceProvidedPattern(serviceToConsume));
    //         }
    //     }
    //     this.channels = channels;
    //     let imports = {};
    //     let dependencyEffects = {}
    //     let dependencyChannel = {};
    //
    //     //todo: clean this part up!
    //     if(this.pkgPart.requires && this.pkgPart.requires.length > 0){
    //         for(let dependency of this.pkgPart.requires){
    //             dependencyEffects[dependency] = take(yield actionChannel(Plugin.pluginEnabledPattern(dependency)));
    //         }
    //         console.log(this.name, " Dependencies to wait for: ", this.pkgPart.requires);
    //         let dependencies = yield all(dependencyEffects);
    //
    //         for(let [key, value] of Object.entries(dependencies)){
    //             imports[key] = value.plugin;
    //         }
    //
    //     }else{
    //         yield take("START_PLUGINBOT");
    //     }
    //
    //     yield call(this.enable.bind(this), channels);
    //
    //
    //     return this;
    // }









}
module.exports = Plugin;