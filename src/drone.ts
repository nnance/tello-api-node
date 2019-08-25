import { createSocket } from "dgram";
import { controllerFactory, initSDK } from "./controller";
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
