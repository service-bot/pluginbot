let {take, put, actionChannel, all, call} = require("redux-saga/effects");
const GeneratorFunction = (function*(){}).constructor;


function* serviceConsumer(channel){
    console.log(channel);
    if(channel instanceof GeneratorFunction){
        channel = yield call(channel);
    }
    let action = yield take(channel);
    return action.service;
}


let consume = function(channel, options){
    return call(serviceConsumer, channel)

}



    module.exports=consume;