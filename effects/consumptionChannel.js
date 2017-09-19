// import { buffers } from 'redux-saga/src/internal/buffers';
let {channel} = require("redux-saga");
let {call,spawn, takeEvery, actionChannel} = require("redux-saga/effects");

function* channelPutter(channel, pattern){
    yield takeEvery(pattern, function*(action){
        channel.put(action);
    })
}

function* consumptionChannel(pattern) {
    const chan = yield call(channel);
    let putter = yield spawn(channelPutter, chan, pattern);
    return chan
}
module.exports =  consumptionChannel;

