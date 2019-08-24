# tello-api-node

Tello Drone API in node.js

This project provides a typed API for programmatically flying the DJI Tello educational drone.  It provides 
capabilities that makes creating and flying missions easy with consistent behavior.

## Getting Started

This is a pure TypeScript project that requires an initial build step before running.

```
npm install && npm run build
```

To run the application:

```
npm start
```

To run with debug logs:

```
DEBUG="monitor" npm start
```

## Architecture

The project utilizes the hexagonal architecture, aka ports and adaptors.  All external I/O is modeled as an interface via ports with specific implementations via adaptors.   This allows the core of the software to be fully tested without engaging the drone.  The real adaptors like the network and the console are mocked out for testing.

### Subsystems

There are three major subsystems

#### State Monitor

The monitoring subsystem connects to the UDP port of the PC to monitor the state changes sent by the Tello drone.   It processes and interprets the telemetry data sent by the drone to understand the current state i.e. (landed, moving, hovering, etc).  It is primarily designed to be a state machine that will send an event when the drone's state changes.   It can also be used to retrieve the current state, battery life, temperature, etc.   The state monitor has the following features:

- [ ] Collects events in a queue
- [ ] Evaluates the queue for movement, hovering and landing
- [ ] Sends events when the state has changed

#### Controller

The controller subsystem connects to the drone's UPD port and sends flight commands to the drone.  Because all communication with the drone is over UPD we can't expect the communication to be reliable.  The controller has logic to monitor for a state change in the case where an acknowledgment isn't received after sending a command.  The controller depends on the state monitor to detect if the drone starts moving after a command is sent. The controller has the following features:

- [ ] Sends commands to the drone and listens for a response
- [ ] Will retry commands with a back off timer
- [ ] Detects a command has been received by monitoring for state change in the case an ack isn't received from the drone

#### Mission Command

The mission command subsystem provides an API for easily defining and flying missions.  It combines the controller to send commands to the drone and the state monitor to maintain the movement of the drone.  The mission command has the following features:

- [ ] Reliably able to string flight commands together
- [ ] Ability to insert time delays in missions

### Articles

• https://medium.com/@swalters/dji-ryze-tello-drone-gets-reverse-engineered-46a65d83e6b5
• https://developer.ibm.com/tutorials/program-ryze-dji-tello-drone-using-sdks-and-node-red/
• https://dl-cdn.ryzerobotics.com/downloads/Tello/Tello%20SDK%202.0%20User%20Guide.pdf
