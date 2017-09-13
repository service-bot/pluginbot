const path = require("path");
module.exports = {
    getPluginPackage(configPath, pluginConfig){
        return require(path.resolve(configPath, "..", pluginConfig.path, "package.json"));
    },

    buildClientPluginMap(configPath){
        let config = require(configPath);
        let pluginConfigs = config.plugins;
        let clientConfigs = pluginConfigs.reduce((acc, plugin) => {
            let pluginPackage = this.getPluginPackage(configPath, plugin)
            if (pluginPackage.client) {
                let pluginClientPath = path.resolve(configPath, "..", plugin.path, pluginPackage.client);
                acc[pluginPackage.name] = pluginClientPath
            }
            return acc;
        }, {});
        return clientConfigs;
    },
    buildClientConfig(configPath){
        let config = Promise.resolve(require(configPath));
        let pluginConfigs = config.plugins;
        let clientConfigs = pluginConfigs.reduce((acc, plugin) => {
            let pluginPackage = this.getPluginPackage(configPath, plugin)
            if (pluginPackage.client) {
                let pluginClientPath = path.resolve(configPath, "..", plugin.path, pluginPackage.client);
                acc[pluginPackage.name] = {pluginPackage,clientConfig: plugin.client, path: plugin.path}
            }
            return acc;
        }, {});

        return {plugins : clientConfigs};
    },
    async buildServerConfig(configPath){
        let config = await require(configPath);
        let pluginConfigs = config.plugins;
        let serverConfigs = pluginConfigs.reduce((acc, plugin) => {
            let pluginPackage = this.getPluginPackage(configPath, plugin)
            if (pluginPackage.main) {
                let pluginServerPath = path.resolve(configPath, "..", plugin.path, pluginPackage.main);
                acc[pluginPackage.name] = {pluginPackage, config : plugin, path: plugin.path}
            }
            return acc;
        }, {});

        return {plugins : serverConfigs};
    }

}