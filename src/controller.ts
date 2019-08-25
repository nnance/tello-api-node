import { Socket } from "dgram";
import { AddressInfo } from "net";
import { LogWriter } from "./logging";

export type Sender = (command: string) => Promise<Socket>;

export enum Direction {
    left = "l",
    right = "r",
    forward = "f",
    back = "b",
}

const commander = (log: LogWriter, socket: Socket, address: string): Sender => async (command) => {
    const { port } = socket.address() as AddressInfo;
    await new Promise((res) => {
        socket.once("message", res);
        socket.send(command, port, address);
        log(`sent ${command}`);
    });
    return socket;
};

export const initSDK = (log: LogWriter, socket: Socket, address: string) => commander(log, socket, address)("command");

export const controllerFactory = (log: LogWriter, socket: Socket, address: string) => {
    const sender = commander(log, socket, address);
    return {
        back: (cm: number) => sender(`back ${cm}`),
        disconnect: () => socket.close(),
        down: (cm: number) => sender(`down ${cm}`),
        emergency: () => sender("emergency"),
        flip: (direction: Direction) => sender(`flip ${direction}`),
        forward: (cm: number) => sender(`forward ${cm}`),
        land: () => sender("land"),
        left: (cm: number) => sender(`left ${cm}`),
        right: (cm: number) => sender(`right ${cm}`),
        rotateClockwise: (degrees: number) => sender(`cw ${degrees}`),
        rotateCounterClockwise: (degrees: number) => sender(`ccw ${degrees}`),
        stop: () => sender("stop"),
        takeOff: () => sender("takeoff"),
        up: (cm: number) => sender(`up ${cm}`),
    };
};
