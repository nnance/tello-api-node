import { createSocket, Socket } from "dgram";
import { AddressInfo } from "net";
import { connect } from "./listener";
import { logFactory, LogWriter } from "./logging";

const droneAddr = {
    address: "192.168.10.1",
    port: 8889,
};

const createConnection = (port = 8890): Promise<Socket> => {
    const socket = createSocket("udp4");
    return new Promise((res) => socket.bind(port, () => res(socket)));
};

const commander = (log: LogWriter, socket: Socket, address: string) => (command: string) => {
    const { port } = socket.address() as AddressInfo;
    socket.send(command, port, address);
    log(`sent ${command}`);
    return socket;
};

const initSDK = (log: LogWriter, socket: Socket, address: string) => commander(log, socket, address)("command");

const createConnector = async (log: LogWriter, port?: number, address?: string) => {
    const socket = await createConnection(port);
    connect(log, socket);
    return socket;
};

const createDrone = async (log: LogWriter, address: string, port: number) => {
    const socket = await createConnector(log, port, address);
    return initSDK(log, socket, address);
};

export const droneFactory = async (logWriter: LogWriter) => {
    const { address, port } = droneAddr;

    const logger = logFactory(logWriter, "drone", `${address}:${port}`);
    const connLogger = logFactory(logWriter, "drone", `0.0.0.0:8890`);

    const drone = await createDrone(logger, address, port);
    const sender = commander(logger, drone, address);

    await createConnector(connLogger, 8890);

    return {
        land: () => sender("land"),
        takeOff: () => sender("takeoff"),
    };
};
