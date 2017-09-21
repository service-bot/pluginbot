let {take, put, actionChannel, all, call} = require("redux-saga/effects");
const GeneratorFunction = (function*(){}).constructor;

function consume(channel){
    return call(serviceConsumer, channel)

}

function* serviceConsumer(channel){
    console.log(channel);
    if(channel instanceof GeneratorFunction){
        channel = yield call(channel);
    }
    let action = yield take(channel);
    return action.service;
}

module.exports=consume;