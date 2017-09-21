let {take, put, actionChannel, all, call} = require("redux-saga/effects");
let {provideService } = require("../actions");

function provide(service){
    return call(serviceConsumer, channel)

}
function* serviceConsumer(channel){

    let action = yield take(channel);
    return action.service;
}

module.exports=consume;