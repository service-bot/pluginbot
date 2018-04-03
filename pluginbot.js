let path = require("path");
let Plugin = require("./dist/plugin");
let PluginbotBase = require("./dist/pluginbot-base");
let configBuilder = require("./config");

class Pluginbot extends PluginbotBase {
    /**
     *
     * @param configPath - absolute path to the configuration
     */
    constructor(plugins, config){
        super(plugins, config);
    }
    static buildPlugin(pluginPath){
        let pluginPkg = require(path.resolve(pluginPath, "package.json"));
        let pluginPkgPart = pluginPkg.pluginbot.server || pluginPkg.pluginbot;
        let plugin = require(path.resolve(pluginPath, pluginPkg.pluginbot.main || pluginPkg.pluginbot.server.main));
        let pluginName = pluginPkg.name;
        return {plugin, pluginPkgPart, pluginPkg, pluginName};
    }

    installPlugin(pluginPath) {
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

                return resolve("plugin " + pluginName + " already enabled");
            }
            // let imports = this.buildImports(pluginPkgPart);

            //todo : switch this to thunk instead of callback?
            this.runSaga(this._install.bind(this), plugin, pluginName, callback);
        })
    }

    enablePlugin(pluginPath, config){
            let {plugin, pluginPkgPart, pluginPkg, pluginName} = Pluginbot.buildPlugin(pluginPath);
            return this._enablePlugin(new Plugin(plugin, pluginPkg, config, pluginPkgPart));
    }
    static async createPluginbot(configPath){
        let config = (await configBuilder.buildServerConfig(configPath));
        let pluginConfigs = config.plugins;
        let pluginBotConfig = config.config;
        let plugins = {};
        for(let [pluginName, config] of Object.entries(pluginConfigs)){
            let pluginPackagePart = config.pluginPackage.pluginbot.server || config.pluginPackage.pluginbot
            let plugin = require(path.resolve(configPath, "..",  config.path, (config.pluginPackage.pluginbot.main || config.pluginPackage.pluginbot.server.main) ));
            plugins[pluginName] = new Plugin(plugin, config.pluginPackage, config.config, pluginPackagePart)
        }
        return (new Pluginbot(plugins, pluginBotConfig));

    }

}

module.exports = Pluginbot;

