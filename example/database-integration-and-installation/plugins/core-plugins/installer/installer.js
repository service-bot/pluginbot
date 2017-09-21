let consume = require("pluginbot/effects/consume");
let {take, takeEvery, call, put} = require("redux-saga/effects");
let path = require("path")
//todo: need better way of handling configurations for dynamic plugins
const PLUGIN_TABLE = "plugins";

//todo: make this cleaner.
const PLUGIN_FOLDER = path.resolve(__dirname, "../..");
module.exports = {
    run : function*(config, provide){
        console.log("YO IM STARTING!");
        yield provide({"dog" : "BIG"});
    },

    consumer : function*(config, imports, channel){
        let db = yield consume(channel.database);
        console.log("GOT A DB", db);


        yield takeEvery("ENABLE_PLUGIN", function*(action){
            db(PLUGIN_TABLE).where("name", action.pluginName).update("enabled", true);
        });
        yield takeEvery("DISABLE_PLUGIN", function*(action){
            db(PLUGIN_TABLE).where("name", action.pluginName).update("enabled", false);
        });

        while(true){

            //using take instead of consume so I can grab the plugin's name
            let pluginInstallAction = yield take(channel.pluginInstall);
            console.log("GOT PLUGIN TO INSTALL!")
            let pluginName = pluginInstallAction.provider;
            let install = pluginInstallAction.service;
            let {tablesToCreate, initialConfig} = install;
            let transaction = function(){
                console.log("HELLO!");
                return db.transaction(async (trx) => {
                    await trx(PLUGIN_TABLE).insert({
                        name : pluginName,
                        path : path.resolve(PLUGIN_FOLDER, pluginName),
                        enabled : false
                    });

                    for(let {tableName, createFunction} of tablesToCreate){
                        await trx.schema.createTable(tableName,createFunction);

                    }
                })
            }
            yield call(transaction);
            console.log("TABLES CREATED!");
            yield put({type: "PLUGIN_INSTALLED", pluginName: pluginName});


        }
    },
    install : function*(imports){
        //todo : when implement reusable channels don't take the import
        console.log("MA IMPortS!");
        let db = imports.database.services.database;
        let transaction = function(){
            console.log("HELLO!");
            return db.transaction(trx => {
                return trx.schema.createTableIfNotExists(PLUGIN_TABLE, function(table){
                    table.increments();
                    table.string("name");
                    table.string("path");
                    table.jsonb("config");
                    table.boolean("enabled");
                    table.timestamps();
                }).then(table => {
                    console.log(table);
                    return trx(PLUGIN_TABLE).insert({
                        name : "installer",
                        config : {},
                        enabled : true,
                        path : __dirname
                    });
                })

            })
        }

        let tableCreated = yield call(transaction);
        console.log("TABLE CREATED", tableCreated);
    }
}