import { createSocket, Socket } from "dgram";
import { controllerFactory, initSDK } from "./controller";
import { connect } from "./listener";
import { logFactory, LogWriter } from "./logging";

const droneAddr = {
    address: "192.168.10.1",
    port: 8889,
};

const createConnector = async (log: LogWriter, port?: number, address?: string, logThrottle?: number) => {
    const socket = createSocket("udp4");
    await new Promise((res, rej) => {
        socket.once("error", rej);
        socket.bind(port, () => res(socket));
    });
    connect(log, socket, logThrottle);
    return socket;
};

export enum Direction {
    left = "l",
    right = "r",
    forward = "f",
    back = "b",
}

export interface IDrone {
    back: (cm: number) => Promise<Socket>;
    disconnect: () => void;
    down: (cm: number) => Promise<Socket>;
    emergency: () => Promise<Socket>;
    flip: (direction: Direction) => Promise<Socket>;
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

export const droneFactory = async (logWriter: LogWriter) => {
    const { address, port } = droneAddr;

    const logger = logFactory(logWriter, "drone", `${address}:${port}`);
    const connLogger = logFactory(logWriter, "drone", `0.0.0.0:8890`);

    const drone = await createConnector(logger, port, address, 0);
    await initSDK(logger, drone, address);

    const connector = await createConnector(connLogger, 8890);
    const controller = controllerFactory(logger, drone, address);
    return Object.assign(controller, {
        disconnect: () => {
            controller.disconnect();
            connector.close();
        },
    });
};
