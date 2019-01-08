// import { buffers } from 'redux-saga/src/internal/buffers';
let {channel, buffers} = require("redux-saga");
let {call, spawn, takeEvery, actionChannel} = require("redux-saga/effects");

function* channelPutter(channel, pattern){
    yield takeEvery(pattern, function*(action){
        channel.put(action);
    })
}

function* consumptionChannel(pattern) {
    console.log("ma patty cake", pattern)
    const chan = yield call(channel, buffers.expanding());
    let putter = yield spawn(channelPutter, chan, pattern);
    return chan
}
module.exports =  consumptionChannel;

