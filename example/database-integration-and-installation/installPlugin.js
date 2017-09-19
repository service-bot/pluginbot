const PLUGIN_TO_INSTALL = "./plugins/core-plugins/installer";
const path = require("path");
let installPlugin = async function() {
    try {
        let pb = await require("./server");
        await pb.installPlugin(path.resolve(__dirname, PLUGIN_TO_INSTALL));
        await pb.enablePlugin(path.resolve(__dirname, PLUGIN_TO_INSTALL));

    }catch(e){
        console.error(e);
    }
};

installPlugin();