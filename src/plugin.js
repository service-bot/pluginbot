let {take, put, actionChannel, all, call} = require("redux-saga/effects");

const actions = {
    enablePlugin : (plugin) => ({type : "PLUGIN_ENABLED", plugin}),
    provideService : (serviceType, service, provider) => ({type : "SERVICE_PROVIDED", serviceType, service, provider})
}

let pattern = function(serviceType) {

    return function(action) {
        return (action.type == "SERVICE_PROVIDED" && action.serviceType == serviceType);
    }
};

let pluginStartedPattern = function(pluginName) {
    return function (action) {
        return (action.type == "PLUGIN_ENABLED" && action.plugin.name == pluginName);
    }
}





module.exports = class Plugin{

    constructor(plugin, pluginPackage, pluginConfig, pluginPackagePart){
        this.name = pluginPackage.name;
        this.pkg = pluginPackage;
        this.plugin = plugin;
        this.config = pluginConfig;
        this.imports = {};
        this.services = {};
        this.pkgPart = pluginPackagePart;


    }
    *initialize(){
        let channels = {}

        //build channels to consume.
        console.log("INITIAL")
        if(this.pkgPart.consumes) {
            for (let serviceToConsume of this.pkgPart.consumes) {
                channels[serviceToConsume] = yield actionChannel(pattern(serviceToConsume));
            }
        }
        yield take("START_PLUGINBOT");
        if(this.pkgPart.requires && this.pkgPart.requires.length > 0){
            console.log(this.name + " WAITING FOR DEPENDENCIES...");
            let dependencyEffects = {}
            for(let dependency of this.pkgPart.requires){
                dependencyEffects[dependency] = take(pluginStartedPattern(dependency));
            }
            let dependencies = yield all(dependencyEffects);

            for(let [key, value] of Object.entries(dependencies)){
                this.imports[key] = value.plugin;
            }
        }

        if(this.plugin.start) {
            console.log("STARTING FUNCTION EXISTS!");
            this.services = yield call(this.plugin.start, this.config, this.imports);
        }
        yield put(actions.enablePlugin(this));
        console.log("STARTED PLUGIN! " + this.name);
        for(let [key, value] of Object.entries(this.services)){
            if(Array.isArray(value)){
                yield all(value.map(service => put(actions.provideService(key, service, this))))
            }else {
                yield put(actions.provideService(key, value, this));
            }
        }
        if(this.plugin.consumer) {
            let consume = yield this.plugin.consumer(this.config, this.imports, channels);
            console.log(this.name + " DONE CONSUMING!");
        }
    }

}