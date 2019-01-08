module.exports = {
        enablePlugin : (plugin) => ({type : "PLUGIN_ENABLED", plugin}),
        provideService : (serviceType, service, provider, ephemeral) => ({type : "SERVICE_PROVIDED", serviceType, service, provider, ephemeral}),
};