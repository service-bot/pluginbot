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
            let pluginPackagePart = config.pluginPackage.pluginbot.server || config.pluginPackage.pluginbot
            let plugin = require(path.resolve(configPath, "..",  config.path, (config.pluginPackage.pluginbot.main || config.pluginPackage.pluginbot.server.main) ));
            plugins[pluginName] = new Plugin(plugin, config.pluginPackage, config.config, pluginPackagePart)
        }

        return new PluginbotBase(plugins);

    }
}

module.exports = Pluginbot;

