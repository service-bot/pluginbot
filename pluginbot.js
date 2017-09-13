let path = require("path");
let Plugin = require("./src/plugin");
let PluginbotBase = require("./src/pluginbot-base");
let configBuilder = require("./src/helpers/configBuilder");

class Pluginbot extends PluginbotBase {
    /**
     *
     * @param configPath - absolute path to the configuration
     */

    static async createPluginbot(configPath){
        let pluginConfigs = (await configBuilder.buildServerConfig(configPath)).plugins;
        let plugins = {};
        for(let [pluginName, config] of Object.entries(pluginConfigs)){
            let plugin = require(path.resolve(configPath, "..",  config.path));
            plugins[pluginName] = new Plugin(plugin, config.pluginPackage, config.config)
        }

        return new PluginbotBase(plugins);

    }
}

module.exports = Pluginbot;

