import { createSocket, Socket } from "dgram";
import { flow } from "lodash";
import { AddressInfo } from "net";
import { connect } from "./listener";
import { logFactory, LogWriter } from "./logging";

const droneAddr = {
    address: "192.168.10.1",
    port: 8889,
};

const createConnection = (address = "0.0.0.0", port = 8890): Promise<Socket> => {
    const socket = createSocket("udp4");
    return new Promise((res) => socket.bind(port, () => res(socket)));
};

const createListener = (logWriter: LogWriter, socket: Socket) => {
    const { address, port } = socket.address() as AddressInfo;
    const logger = logFactory(logWriter, "drone", `${address}:${port}`);
    connect(logger, socket);
    return socket;
};

const commander = (socket: Socket) => (command: string) => {
    const { address, port } = socket.address() as AddressInfo;
    socket.send(command, port, address);
    return socket;
};

const initSDK = (socket: Socket) => commander(socket)("command");

const createConnector = async (logWriter: LogWriter, address?: string, port?: number) => {
    const socket = await createConnection(address, port);
    return createListener(logWriter, socket);
};

const createDrone = async (logWriter: LogWriter, address?: string, port?: number) => {
    const socket = await createConnector(logWriter, address, port);
    return initSDK(socket);
};

export const droneFactory = async (logWriter: LogWriter) => {
    const drone = await createDrone(logWriter, droneAddr.address, droneAddr.port);
    const sender = commander(drone);
    await createConnector(logWriter, "0.0.0.0", 8890);

    return {
        land: () => sender("land"),
        takeOff: () => sender("takeoff"),
    };
};
