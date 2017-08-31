module.exports = {
    plugins : [
        {path : "./goodplugin", "config1" : "hello"},
        {path : "./depend1", "config2" : "hello"},
        {path : "depend3", "config2" : "hello"},

        // {path : "./depend2", "config3" : "hello"},
        {path : "core", "config2" : "ok"}],
    install : function(pluginPath){
        console.log("installin");
        return "Good"
    },
    uninstall : function(plugin){
        console.log("uninstallin");
        return "uninstalled";

    },
    enable : function(plugin){
        console.log("enabled");
        return "enabled";

    },
    disable : function(plugin) {
        console.log("disabled");
        return "disabled";
    }

}