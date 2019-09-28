import { ZBClient } from "zeebe-node";
import axios from "axios";
const heartbeat_variable = "io_zeebe_healthcheck";

const TaskAHealthcheckUrl =
  "https://hc-ping.com/20def05d-9d1d-44d5-8486-3c3d91fdffbd";

const TaskBHealthcheckUrl =
  "https://hc-ping.com/20def05d-9d1d-44d5-8486-3c3d91fdc734";

async function main() {
  const zbc = new ZBClient(); // localhost by default, or ZEEBE_GATEWAY
  await zbc.deployWorkflow("../bpmn/heartbeat.timer.bpmn");

  // Halt all running instances of the healthcheck.timer process
  await zbc.publishMessage({
    name: "heartbeat:stop",
    correlationKey: heartbeat_variable,
    variables: {},
    timeToLive: -1
  });

  // Create a single instance of the healthcheck.timer process
  await zbc.createWorkflowInstance("healthcheck.timer", {
    heartbeat_variable
  });

  zbc.createWorker(null, "task:a", (job, complete) => {
    const { variables } = job;
    // START Healthcheck logic
    const isHeartbeat = variables[heartbeat_variable];
    if (isHeartbeat) {
      axios.get(TaskAHealthcheckUrl);
      return complete.success();
    }
    // END Healthcheck logic

    // The actual Task A logic goes here
    complete.success();
  });

  zbc.createWorker(null, "task:b", (job, complete) => {
    const { variables } = job;
    // START Healthcheck logic
    const isHeartbeat = variables[heartbeat_variable];
    if (isHeartbeat) {
      axios.get(TaskBHealthcheckUrl);
      return complete.success();
    }
    // END Healthcheck logic

    // The actual Task B logic goes here
    complete.success();
  });
}

main();
