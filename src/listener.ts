/**
 * listens for drone events and logs them
 */
import { EventEmitter } from "events";
import { throttle } from "lodash";
import { LogWriter } from "./logging";

export const errorHandler = (log: LogWriter) => (err: Error | null, bytes: number) => {
    if (err) {
        log(`server error:\n${err.stack}`);
    }
};

const messageHandler = (log: LogWriter) => (msg: string) => {
    log(`server got: ${msg}`);
};

const listeningHandler = (log: LogWriter) => () => {
    log(`server listening`);
};

export const stateParser = (state: string) => {
    const splitKeyVal = (key: string) => key.split(":");
    const stateObj = (key: string) => ({ [splitKeyVal(key)[0]]: splitKeyVal(key)[1]});
    const isKey = (val: string) => val.length > 0;
    const addKey = (acc: {}, key: string) => Object.assign(acc, stateObj(key));

    return state.split(";").filter(isKey).reduce(addKey, {});
};

export type StateListener = (state: {}) => void;

export const connect = (logger: LogWriter, emitter: EventEmitter, logThrottle = 2000, listener?: StateListener) => {
    // drone sends hundreds of messages per minute so this handler will throttle them to only send on defined interval
    const msgThrottler = throttle(messageHandler(logger), logThrottle);

    emitter.on("message", msgThrottler);
    emitter.on("error", errorHandler(logger));
    emitter.on("listening", listeningHandler(logger));

    if (listener) {
        emitter.on("message", (msg: string) => listener(stateParser(msg)));
    }
};
