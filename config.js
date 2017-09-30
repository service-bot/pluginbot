const path = require("path");

//todo: reduce code duplication
module.exports = {
    getPluginPackage(configPath, pluginConfig){
        return require(path.resolve(configPath, "..", pluginConfig.path, "package.json"));
    },

    async buildClientPluginMap(configPath){
        let config = await require(configPath)
        if(typeof config === "function"){
            config = await config();
        }
        console.log(config, "CONFIG!");
        let pluginConfigs = config.plugins;
        let clientConfigs = pluginConfigs.reduce((acc, plugin) => {
            let pluginPackage = this.getPluginPackage(configPath, plugin)
            if (pluginPackage.pluginbot.client) {
                let pluginClientPath = path.resolve(configPath, "..", plugin.path, pluginPackage.pluginbot.client.main);
                acc[pluginPackage.name] = pluginClientPath
            }
            return acc;
        }, {});
        return clientConfigs;
    },
    async buildClientConfig(configPath){
        let config = await require(configPath);
        if(typeof config === "function"){
            config = await config();
        }

        let pluginConfigs = config.plugins;
        let clientConfigs = pluginConfigs.reduce((acc, plugin) => {
            let pluginPackage = this.getPluginPackage(configPath, plugin)
            if (pluginPackage.pluginbot.client) {
                let pluginClientPath = path.resolve(configPath, "..", plugin.path, pluginPackage.pluginbot.client.main);
                acc[pluginPackage.name] = {pluginPackage,clientConfig: plugin.client, path: plugin.path}
            }
            return acc;
        }, {});

        return {plugins : clientConfigs, config : config};
    },
    async buildServerConfig(configPath){
        let config = await require(configPath);
        if (typeof config === "function") {
            config = await config();
        }
        let pluginConfigs = config.plugins;
        let serverConfigs = pluginConfigs.reduce((acc, plugin) => {
            let pluginPackage = this.getPluginPackage(configPath, plugin)
            let pluginbot =pluginPackage.pluginbot;
            if (pluginbot) {
                let pluginServerPath = path.resolve(configPath, "..", plugin.path, (pluginbot.main || pluginbot.server.main));
                acc[pluginPackage.name] = {pluginPackage, config : plugin, path: plugin.path}
            }
            return acc;
        }, {});

        return {plugins : serverConfigs, config : config};
    }

}