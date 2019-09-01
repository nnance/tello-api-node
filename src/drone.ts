import { createSocket } from "dgram";
import { controllerFactory, IFlightController, initSDK } from "./controller";
import { connect } from "./listener";
import { logFactory, LogWriter } from "./logging";

export { IFlightController, FlightDirection } from "./controller";

export const droneTimeout = 10000;

const droneAddr = {
    address: "192.168.10.1",
    port: 8889,
};

const createConnector = async (log: LogWriter, port?: number, address?: string, logThrottle?: number) => {
    const socket = createSocket("udp4");
    await new Promise((res, rej) => {
        socket.once("error", rej);
        const timeoutId = setTimeout(() => {
            socket.removeAllListeners();
            socket.close();
            rej();
        }, droneTimeout);
        socket.once("listening", () => {
            clearTimeout(timeoutId);
            res(socket);
        });
        socket.bind(port);
    });
    connect(log, socket, logThrottle);
    return socket;
};

export const droneFactory = async (logWriter: LogWriter): Promise<IFlightController> => {
    const { address, port } = droneAddr;

    const logger = logFactory(logWriter, "drone", `${address}:${port}`);
    const connLogger = logFactory(logWriter, "drone", `0.0.0.0:8890`);

    logger("connecting to drone");
    const drone = await createConnector(logger, port, address, 0);
    logger("initializing SDK");
    await initSDK(logger, drone, address);

    logger("connecting to drone state port");
    const stateConnector = await createConnector(connLogger, 8890);

    logger("creating controller");
    const controller = controllerFactory(logger, drone, address);
    return Object.assign(controller, {
        disconnect: () => {
            controller.disconnect();
            stateConnector.removeAllListeners();
            stateConnector.close();
        },
    });
};
