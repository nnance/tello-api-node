import { deepEqual, equal, notEqual } from "assert";

import { EventEmitter } from "events";
import { connect, stateParser } from "../listener";
import { logFactory, LogWriter } from "../logging";

const droneStatus = "pitch:0;roll:0;yaw:0;vgx:0;vgy:0;vgz:0;templ:86;temph:88;tof:10;h:0;bat:19;baro:-24.59;time:0;agx:9.00;agy:-6.00;agz:-1000.00;";
const droneStatusObj = {
    agx: "9.00",
    agy: "-6.00",
    agz: "-1000.00",
    baro: "-24.59",
    bat: "19",
    h: "0",
    pitch: "0",
    roll: "0",
    temph: "88",
    templ: "86",
    time: "0",
    tof: "10",
    vgx: "0",
    vgy: "0",
    vgz: "0",
    yaw: "0",
};

let spy: string;
const logger = logFactory((msg) => spy = msg, "listener");
const emitter = new EventEmitter();
connect(logger, emitter);

describe("Listener", () => {
    beforeEach(() => {
        spy = "";
    });

    describe("stateParser", () => {
        const parsed = stateParser(droneStatus);
        it("should return the same value", () => {
            equal(Object.keys(parsed).length, Object.keys(droneStatusObj).length);
        });
    });

    describe("when connecting", () => {
        it("should log listening", () => {
            emitter.emit("listening");
            notEqual(spy.length, 0);
        });
    });

    describe("when receiving an error", () => {
        it("should log the error", () => {
            emitter.emit("error", "error");
            notEqual(spy.length, 0);
        });
    });

    describe("when connecting with a custom listener", () => {
        it("should call the listener", () => {
            let stateSpy = {};
            connect(logger, emitter, (state) => stateSpy = state);
            emitter.emit("message", droneStatus);
            deepEqual(stateSpy, droneStatusObj);
        });
    });
});
