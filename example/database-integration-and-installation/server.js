const CONFIG_PATH = "./pluginbot.config"
let path = require("path");
let Pluginbot = require("../../../pluginbot");


let startPluginbot = async function(){
    console.log("STARTING PLUGINBOT!");
    try{
    let pb = await Pluginbot.createPluginbot(path.resolve(__dirname, CONFIG_PATH));
    console.log("initializing pluginbot")

        await pb.initialize()
        return pb;

    }catch(err){
        console.error(err);
    };

}

module.exports = startPluginbot();


