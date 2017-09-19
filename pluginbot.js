let path = require("path");
let Plugin = require("./src/plugin");
let PluginbotBase = require("./src/pluginbot-base");
let configBuilder = require("./config");

class Pluginbot extends PluginbotBase {
    /**
     *
     * @param configPath - absolute path to the configuration
     */
    constructor(plugins){
        super(plugins);
    }
    static buildPlugin(pluginPath){
        let pluginPkg = require(path.resolve(pluginPath, "package.json"));
        let pluginPkgPart = pluginPkg.pluginbot.server || pluginPkg.pluginbot;
        let plugin = require(path.resolve(pluginPath, pluginPkg.pluginbot.main || pluginPkg.pluginbot.server.main));
        let pluginName = pluginPkg.name;
        return {plugin, pluginPkgPart, pluginPkg, pluginName};
    }

    installPlugin(pluginPath) {
        console.log("INSTALLIN PLUGIN at ", pluginPath);
        let self = this;
        return new Promise((resolve, reject) => {
            let callback = function(error=null, done=null){
                if(error){
                    console.error("Error installing plugin: ", error);
                    reject(error);
                }else{
                    resolve(done);
                }
            };
            let store = this.store;
            let {plugin, pluginPkgPart, pluginPkg, pluginName} = Pluginbot.buildPlugin(pluginPath);
            if(this.plugins[pluginName]){
                console.warn("plugin " + pluginName + " already installed");
                return resolve("plugin already installed");
            }
            let imports = this.buildImports(pluginPkgPart);
            console.log("INSTALLING PLUGIN: ", pluginName);
            //todo : switch this to thunk?
            this.runSaga(Plugin.install, plugin, pluginName, imports, callback);
        })
    }

    enablePlugin(pluginPath, config){
            let {plugin, pluginPkgPart, pluginPkg, pluginName} = Pluginbot.buildPlugin(pluginPath);
            return this._enablePlugin(new Plugin(plugin, pluginPkg, config, pluginPkgPart, this.buildImports(pluginPkgPart)));
    }
    static async createPluginbot(configPath){
        let pluginConfigs = (await configBuilder.buildServerConfig(configPath)).plugins;
        let plugins = {};
        for(let [pluginName, config] of Object.entries(pluginConfigs)){
            let pluginPackagePart = config.pluginPackage.pluginbot.server || config.pluginPackage.pluginbot
            let plugin = require(path.resolve(configPath, "..",  config.path, (config.pluginPackage.pluginbot.main || config.pluginPackage.pluginbot.server.main) ));
            plugins[pluginName] = new Plugin(plugin, config.pluginPackage, config.config, pluginPackagePart)
        }

        return (new Pluginbot(plugins));

    }

}

module.exports = Pluginbot;

