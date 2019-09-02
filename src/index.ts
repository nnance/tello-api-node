import { IFlightController } from "./controller";
import { droneFactory } from "./drone";
import { consoleWriter } from "./logging";

const timer = (ms: number) => new Promise((res) => setTimeout(res, ms));

const main = async (drone: IFlightController) => {
    await drone.takeOff();
    await drone.land();
    drone.disconnect();
};

const returnMission = async (drone: IFlightController) => {
    await drone.takeOff();
    await drone.forward(120);
    await drone.rotateClockwise(180);
    await drone.forward(120);
    await drone.rotateClockwise(180);
    await drone.land();
};

const missionRunner = async (mission: (drone: IFlightController) => Promise<void>) => {
    let drone;
    try {
        drone = await droneFactory(consoleWriter);
        await mission(drone);
    } catch (error) {
        if (error) {
            // tslint:disable-next-line:no-console
            console.error(error);
        }
    } finally {
        if (drone) {
            drone.disconnect();
        }
    }
};

missionRunner(returnMission);
