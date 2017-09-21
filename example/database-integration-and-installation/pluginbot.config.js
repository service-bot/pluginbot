let path = require("path");
const PLUGIN_TABLE = "plugins";
const DATABASE_NAME = "mydb";
const DATABASE_PATH = __dirname;
const PLUGIN_DIRECTORY = "./plugins";
const consume = require("../../effects/consume");
const {call, spawn} = require("redux-saga/effects");

const knex = require('knex')({
    client: 'sqlite3',
    connection: {
        filename: DATABASE_PATH + "/" + DATABASE_NAME
    }
});

let corePlugins = [
    {
        path: "./plugins/core-plugins/express-app",
        "port": 3001,
        "apiBaseUrl": "/api",
        "entry": path.resolve(__dirname, "./public/index.html"),
        "staticFiles": path.resolve(__dirname, "./public/")
    },
    {path: "./plugins/cats"},
    // {path: "./plugins/animals/dogs"},
    {path: "./plugins/adoption"},

    {
        path: "./plugins/core-plugins/database",
        knex : knex
    },
]
let config = async function() {
    let pluginTableExists = await knex.schema.hasTable(PLUGIN_TABLE);
    let enabledPlugins = await (pluginTableExists ? knex(PLUGIN_TABLE).where("enabled", true) : []);
    let pluginConfigs = enabledPlugins.map(plugin => ({path: plugin.path, ...plugin.config}));

    return {
        plugins: [
            ...corePlugins,
            ...pluginConfigs
        ],
        //install function gets called whenever Pluginbot.prototype.install gets called passing available services
        install: function* (services, pluginName, pluginInstall) {
            console.log("!?", services);
            console.log(services.database);
            let db = yield consume(services.database);
            console.log("!!!!");
            let trx = function () {
                db.transaction(async (trx) => {
                    await trx(PLUGIN_TABLE).insert({
                        name: pluginName,
                        path: path.resolve(PLUGIN_DIRECTORY, pluginName),
                        enabled: false
                    });
                });
            };
            yield call(trx);
            if(pluginInstall) {
                yield call(pluginInstall);
            }
        },
        enable : function*(services, pluginName){
            console.log("!!!", services, "!!!");
            let db = yield consume(services.database);
            let update = function(){
                return db(PLUGIN_TABLE).where("name", pluginName).update("enabled", true);
            }
            console.log(update);
            let res = yield call(update);
            console.log(res);
        },
        disable : function*(services, pluginName){
            let db = yield consume(services.database);
            let update = db(PLUGIN_TABLE).where("name", pluginName).update("enabled", false);
            let res = yield call(update);
            console.log(res);
        }

    };
}

//todo : find way of defining plugins through plugins so we don't have to stray of plugin-centric logic
module.exports = config();