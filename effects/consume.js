let {take, put, actionChannel, all, call} = require("redux-saga/effects");

function consume(channel){
    return call(this.serviceConsumer, channel)

}
function* serviceConsumer(channel){

    let action = yield take(channel);
    return action.service;
}

module.exports=consume;