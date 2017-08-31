const CONFIG_PATH = "./config"
let path = require("path");
let Pluginbot = require("../pluginbot");
let pb = new Pluginbot(path.resolve(__dirname, CONFIG_PATH));

pb.initialize().then(plugins => {
    console.log("PLUGINS ENABLED:\n\n", plugins);
}).catch(e => {
    console.error(e);
})


