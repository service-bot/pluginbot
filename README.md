# Pluginbot 
Lightweight, unopinionated plugin framework - create extremely extensible and scalable apps using a service-based architecture.

<img src="https://img.shields.io/badge/stability-experimental-red.svg">[![Gitter](https://badges.gitter.im/service-bot/pluginbot.svg)](https://gitter.im/service-bot/pluginbot?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge)

### Overview
At a high level - pluginbot is an app framework that consists of plugins which can provide/consume services. To define a plugin you define a function which provide services and a function that can consume services, consumption happens in the form of a redux-saga so your plugin can wait around for your desired service to be provided which elmiminates dependency chains entirely since your plugin will pause execution until the service it needs becomes available. 

This architecture allows for a highly extensible application because a plugin that adds functionality would just provide services other plugins consume (or consume services other plugins provide) - for example a plugin could provide new routes to be consumed by a router plugin or a plugin could provide UI components such as navigation-menus which would be rendered by a navigation-menu consumer. 


#### Configuration
In order for plugins to run, they have to be declared in a configuration 
which will contain at a minimum the path of the plugin. Here you would define
environment specific data.

Configuration can either be json or a js file that exports an object/Promise that resolves to an object 

The plugins array represents the enabled plugins in a pluginbot instance.




```js
// ./config.js

//path should be relative to the config file location, or absolute, can refer to NPM modules as well
module.exports = {
        plugins: [
            {"path": "express-app", "apiBaseUrl" : "/api", "port" : 3001},
            {"path": "./route-provider", "port": 3001},
            ],
};
```


#### Plugin Interface  
A plugin consists of a module which exports a generator function, each plugin takes the form of a [redux-saga](https://redux-saga.js.org/) meaning
they can wait for specific events to happens or services to be provided by other plugins before running their own code.

```js

// ./express-app/express-app.js

//take used for consumption
let express = require("express");
const consume = require("pluginbot/effects/consume");
module.exports = {
    /**
    * This function is a saga which can consume or provide services and represents a plugin's lifecycle
    * 
    * @param config {Object.<string, Object.<string, *>>} 
    * - Keys the config option name to the config's value defined in the Pluginbot configuration
    *  
    * @param provide {function(Object)} -  provide services, key servicename value service, returns effect
    *
    * @param services {Object.<string, Channel>} -  
    * keyed by service name, value is a channel that can be consumed for a service 
    */    
    run : function*(config, provide, services){
        const app = express();
        const router = express.Router();
        
        app.use(config.apiBaseUrl, router);
        app.listen(config.port);
        
        //provide expressApp and baseRouter which can now be consumed by other plugins
        yield provide({
            expressApp: app,
            baseRouter: router
        });
        
        //loop pauses when it hits a yield
        while(true){
            //wait around for new expressRouter services to be provided
            let newRoute = yield consume(services.expressRouter);
            
            //add new route to the api router
            router.use(newRoute);
        }
    }  
}
```

Now if I wanted to create a plugin which adds a new route to my app all I need to do is provide an expressRoute service

```javascript
// ./hello-world/hello-world.js
module.exports = {
    run : function*(config, provide, services){
        const router = require("express").Router();
        
        //would be called by GET /api/hello-world
        router.get("/hello-world", (req, res) => {
            res.json({hello : "world"});
        });
                
        //provide expressRouter to be used by the app's router
        yield provide({
            expressRouter: router
        });
        
    }
}
```



 
#### package.json
In order for a pluginbot plugin to be considered valid it requires a pluginbot 
section to be defined in the package.json. For a basic definition you just need 
to define where the entry point to your plugin is and the services the plugin consumes (if any)
```js
// ./express-app/package.json
{
    "name": "express-app",
    "version": "0.0.1",
    "private": true,
    "pluginbot": {
        "main" : "express-app.js", 
        "consumes": ["expressRoute"]
    }
}
```
### Starting Pluginbot
To start pluginbot on the server, just call createPluginbot and initialize it

```javascript
// ./app.js
const CONFIG_PATH = "./config.js"
let path = require("path");
let Pluginbot = require("pluginbot");
//pass full path to createPluginbot
Pluginbot.createPluginbot(path.resolve(__dirname, CONFIG_PATH))
.then(pluginbot => pluginbot.initialize())
.catch(e => {
    console.error(e);
});

```


### Advanced
##### Client
see [pluginbot-react](https://github.com/service-bot/pluginbot-react)


###Credit
