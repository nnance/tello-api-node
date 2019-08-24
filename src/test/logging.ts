import { equal } from "assert";
import { logFactory, LogWriter } from "../logging";

describe("logging", () => {
    let args: string;
    const writer: LogWriter = (msg) => args = msg;

    afterEach(() => args = "");

    describe("when logging a message with empty env", () => {
        it("should log the message", () => {
            logFactory(writer, "logging")("test");
            equal(args, "test");
        });
    });

    describe("when logging a message with matching env", () => {
        it("should log the message", () => {
            process.env.LOG = "logging";
            logFactory(writer, "logging")("env");
            equal(args, "env");
        });
    });

    describe("when logging a message with different env", () => {
        it("should not log the message", () => {
            process.env.LOG = "test";
            logFactory(writer, "logging")("env");
            equal(args, "");
        });
    });
});
