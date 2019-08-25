import { droneFactory } from "./drone";
import { consoleWriter } from "./logging";

const timer = (ms: number) => new Promise((res) => setTimeout(res, ms));

const main = async () => {
    const drone = await droneFactory(consoleWriter);
    drone.takeOff();
    await timer(8000);
    drone.land();
};

main();
