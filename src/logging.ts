export type LogWriter = (msg: string) => void;
export type Logger = (writer: LogWriter, module: string, prefix?: string) => LogWriter;

// tslint:disable-next-line:no-console
export const consoleWriter: LogWriter = console.log;

// tslint:disable-next-line:no-empty
export const voidWriter: LogWriter = (msg) => {};

export const logFactory: Logger = (writer, module, prefix = "") => (msg) => {
    if (!process.env.LOG || process.env.LOG === module) {
        writer(`${prefix} - ${msg}`);
    }
};
