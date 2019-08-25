import { droneFactory } from "./drone";
import { consoleWriter } from "./logging";

const timer = (ms: number) => new Promise((res) => setTimeout(res, ms));

const main = async () => {
    const drone = await droneFactory(consoleWriter);
    await drone.takeOff();
    await drone.land();
    drone.disconnect();
};

const returnMission = async () => {
    const drone = await droneFactory(consoleWriter);
    await drone.takeOff();
    await drone.forward(120);
    await drone.rotateClockwise(180);
    await drone.forward(120);
    await drone.land();
    drone.disconnect();
};

returnMission();
