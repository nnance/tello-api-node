import { createSocket, Socket } from "dgram";
import { commander, initSDK } from "./controller";
import { connect } from "./listener";
import { logFactory, LogWriter } from "./logging";

const droneAddr = {
    address: "192.168.10.1",
    port: 8889,
};

const createConnector = async (log: LogWriter, port?: number, address?: string, logThrottle?: number) => {
    const socket = createSocket("udp4");
    await new Promise((res) => socket.bind(port, () => res(socket)));
    connect(log, socket, logThrottle);
    return socket;
};

export const droneFactory = async (logWriter: LogWriter) => {
    const { address, port } = droneAddr;

    const logger = logFactory(logWriter, "drone", `${address}:${port}`);
    const connLogger = logFactory(logWriter, "drone", `0.0.0.0:8890`);

    const drone = await createConnector(logger, port, address, 0);
    const sender = commander(logger, drone, address);

    await initSDK(sender);
    await createConnector(connLogger, 8890);

    return {
        land: () => sender("land"),
        takeOff: () => sender("takeoff"),
    };
};
