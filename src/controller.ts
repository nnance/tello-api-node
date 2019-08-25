import { Socket } from "dgram";
import { AddressInfo } from "net";
import { LogWriter } from "./logging";

export type Sender = (command: string) => void;

export const commander = (log: LogWriter, socket: Socket, address: string): Sender => (command) => {
    const { port } = socket.address() as AddressInfo;
    socket.send(command, port, address);
    log(`sent ${command}`);
    return socket;
};

export const initSDK = (sender: Sender) => sender("command");
