import { Socket } from "dgram";
import { AddressInfo } from "net";
import { logFactory, LogWriter } from "./logging";

export type Sender = (command: string, timeout?: number) => Promise<Socket>;

const commandSender = (log: LogWriter, socket: Socket, address: string, command: string) => {
    const { port } = socket.address() as AddressInfo;
    socket.send(command, port, address, () => log(`sent ${command}`));
};

const commander = (log: LogWriter, socket: Socket, address: string): Sender => async (command, timeout?: number) => {
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
                log("command timed out");
                if (command === "command") {
                    disconnectSocket(log, socket);
                    rej();
                } else {
                    res();
                }
            }, timeout);
        }
        commandSender(log, socket, address, command);
    });
    return socket;
};

export const disconnectSocket = (log: LogWriter, socket: Socket) => {
    log("disconnecting socket");
    socket.removeAllListeners();
    socket.close();
};

export const initSDK = (log: LogWriter, socket: Socket, address: string) => {
    return commander(log, socket, address)("command", 10000);
};

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

export const controllerFactory = (logWriter: LogWriter, socket: Socket, address: string): IFlightController => {
    const controllerLogger = logFactory(logWriter, "controller");
    controllerLogger("creating controller");
    const sender = commander(controllerLogger, socket, address);
    return {
        back: (cm: number, timeout?: number) => sender(`back ${cm}`, timeout),
        disconnect: () => disconnectSocket(controllerLogger, socket),
        down: (cm: number, timeout?: number) => sender(`down ${cm}`, timeout),
        emergency: () => sender("emergency"),
        flip: (direction: FlightDirection, timeout?: number) => sender(`flip ${direction}`, timeout),
        forward: (cm: number, timeout?: number) => sender(`forward ${cm}`, timeout),
        land: (timeout?: number) => sender("land", timeout),
        left: (cm: number, timeout?: number) => sender(`left ${cm}`, timeout),
        right: (cm: number, timeout?: number) => sender(`right ${cm}`, timeout),
        rotateClockwise: (degrees: number, timeout?: number) => sender(`cw ${degrees}`, timeout),
        rotateCounterClockwise: (degrees: number, timeout?: number) => sender(`ccw ${degrees}`, timeout),
        stop: (timeout?: number) => sender("stop", timeout),
        takeOff: (timeout?: number) => sender("takeoff", timeout),
        up: (cm: number, timeout?: number) => sender(`up ${cm}`, timeout),
    };
};
