let express = require("express");
let availableAnimals = ["Fred", "Carl"];
module.exports = {
    run: function* (config, provide, services) {

        const router = express.Router();
        router.get("/available-animals",(req, res) => {
            res.json(availableAnimals);
        });


        //return express route to be consumed by consumer function
        yield provide({
            expressRouter: router
        });
    }
}
