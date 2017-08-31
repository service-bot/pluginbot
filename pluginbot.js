let path = require("path");



class Pluginbot {
    constructor(configPath){
        this.configPath = configPath;
        this.plugins = {};
    }

    getPluginPackage(pluginConfig){
        return require(path.resolve(this.configPath, "..", pluginConfig.path, "package.json"));
    }

    getPluginConfig(pluginName){
        const pluginConfigs = this.config.plugins;
        let self = this;
        let plugin = pluginConfigs.find(conf => {
            return self.getPluginPackage(conf).name == pluginName;
         })
        if(!plugin){
            throw "Plugin configuration not found for: " + pluginName;
        }
        return plugin;
    }



    async initialize(){
        const self = this;
        this.config = await require(this.configPath);
        for(let pluginConfig of this.config.plugins){
            let pluginName = self.getPluginPackage(pluginConfig).name
            if(!this.plugins[pluginName]){
                try {
                    this.plugins[pluginName] = await this.enablePlugin(pluginConfig);
                }
                catch(e){
                    console.error("Error enabling plugin: " + pluginName + "\n  ", e);

                }
            }
        }
        return this.plugins;
    }

    async enablePlugin(pluginConfig){
        let pluginPackage = this.getPluginPackage(pluginConfig);
        let dependencies = pluginPackage.requires;

        let imports = {};
        if(dependencies && dependencies.length > 0){
            for(let dependency of dependencies){
                if(!this.plugins[dependency]){
                    this.plugins[dependency] = await this.enablePlugin(this.getPluginConfig(dependency));
                }
                imports[dependency] = await this.plugins[dependency];
            }
        }
        let plugin = await require(path.resolve(this.configPath, "..", pluginConfig.path, pluginPackage.main)).start(pluginConfig, imports);
        console.log("Successful enabling : " + pluginPackage.name);
        return plugin;

    }



}

module.exports = Pluginbot;

