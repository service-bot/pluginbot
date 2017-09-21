let express = require("express");
let path = require("path");
let {take} = require("redux-saga/effects");
let consume = require("pluginbot/effects/consume")
module.exports  = {

    run : function*(config, provide, services){
        console.log("!");
        const app = express();
        const router = express.Router();

        app.use(express.static(config.staticFiles));
        app.use(config.apiBaseUrl, router);
        app.get('*', function (req, res) {
            res.sendFile(config.entry);
        });
        app.listen(config.port);
        yield provide({
            expressApp: app,
            baseRouter: router
        });

        while(true){
            console.log("WAITIN FOR ROUTES");
            let newRoute = yield consume(services.expressRouter);
            router.use(newRoute);
            console.log("new route added : ", newRoute);
        }
    }
};