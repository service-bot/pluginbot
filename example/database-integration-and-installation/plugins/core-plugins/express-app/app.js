let express = require("express");
let path = require("path");
let {take} = require("redux-saga/effects");
let consume = require("pluginbot/effects/consume")
module.exports  = {
    start : function (config, imports) {
        return new Promise(resolve => {
            const app = express();
            const router = express.Router();

            app.use(express.static(config.staticFiles));
            app.use(config.apiBaseUrl, router);
            app.get('*', function (req, res) {
                res.sendFile(config.entry);
            });

            app.listen(config.port, function () {
                console.log(`Example app listening on port ${config.port}!`)
                resolve( {
                    expressApp: app,
                    baseRouter: router
                })
            });

            //return express route to be consumed by consumer function
        })
    },
    consumer : function*(config, imports, services){
        let router = yield consume(services.baseRouter);
        while(true){
            let newRoute = yield consume(services.expressRouter);
            router.use(newRoute);
            console.log("new route added: ", newRoute);
        }
    }
};