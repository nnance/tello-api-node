import { Socket } from "dgram";
import { AddressInfo } from "net";
import { LogWriter } from "./logging";

export type Sender = (command: string) => Promise<Socket>;

const commandSender = (log: LogWriter, socket: Socket, address: string, command: string) => {
    const { port } = socket.address() as AddressInfo;
    socket.send(command, port, address, () => log(`sent ${command}`));
};

const commander = (log: LogWriter, socket: Socket, address: string, timeout?: number): Sender => async (command) => {
    await new Promise((res, rej) => {
        let timeoutId: NodeJS.Timeout;
        socket.once("error", rej);
        socket.once("message", () => {
            if (timeoutId) {
                clearTimeout(timeoutId);
            }
            res();
        });
        if (timeout) {
            timeoutId = setTimeout(() => {
                socket.removeAllListeners();
                socket.close();
                rej();
            }, timeout);
        }
        commandSender(log, socket, address, command);
    });
    return socket;
};

export const initSDK = (log: LogWriter, socket: Socket, address: string) => commander(log, socket, address, 10000)("command");

export enum FlightDirection {
    left = "l",
    right = "r",
    forward = "f",
    back = "b",
}

export interface IFlightController {
    back: (cm: number) => Promise<Socket>;
    disconnect: () => void;
    down: (cm: number) => Promise<Socket>;
    emergency: () => Promise<Socket>;
    flip: (direction: FlightDirection) => Promise<Socket>;
    forward: (cm: number) => Promise<Socket>;
    land: () => Promise<Socket>;
    left: (cm: number) => Promise<Socket>;
    right: (cm: number) => Promise<Socket>;
    rotateClockwise: (degrees: number) => Promise<Socket>;
    rotateCounterClockwise: (degrees: number) => Promise<Socket>;
    stop: () => Promise<Socket>;
    takeOff: () => Promise<Socket>;
    up: (cm: number) => Promise<Socket>;
}

export const controllerFactory = (log: LogWriter, socket: Socket, address: string): IFlightController => {
    const sender = commander(log, socket, address);
    return {
        back: (cm: number) => sender(`back ${cm}`),
        disconnect: () => {
            socket.removeAllListeners();
            socket.close();
        },
        down: (cm: number) => sender(`down ${cm}`),
        emergency: () => sender("emergency"),
        flip: (direction: FlightDirection) => sender(`flip ${direction}`),
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
