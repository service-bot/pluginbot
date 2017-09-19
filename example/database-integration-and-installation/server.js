const CONFIG_PATH = "./pluginbot.config"
let path = require("path");
let Pluginbot = require("../../../pluginbot");


let startPluginbot = async function(){
    console.log("STARTING PLUGINBOT!");
    let pb = await Pluginbot.createPluginbot(path.resolve(__dirname, CONFIG_PATH));
    console.log("initializing pluginbot")
    try{
        await pb.initialize()
    }catch(err){
        console.error(err);
    };
    return pb;

}

module.exports = startPluginbot();


