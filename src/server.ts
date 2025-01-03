import cluster, { Worker } from "cluster";
import { ConfigSchemaType } from "./configSchema";
import http from "node:http";
import { WorkerMessageType } from "./server-schema";

interface CreateServerConfig {
  port: number;
  workerCount: number;
  config: ConfigSchemaType;
}

export async function createServer(config: CreateServerConfig) {
  if (cluster.isPrimary) {
    console.log("Master cluster is up");
    console.log(config.workerCount);
    for (let index = 0; index < config.workerCount; index++) {
      cluster.fork({
        config: JSON.stringify(config.config),
        workerId: index + 1,
      });
      console.log(`worker ${index + 1}`);
    }
    const server = http.createServer(function (req, res) {
      const len = Object.values(cluster.workers!).length;
      const workerIndex = Math.floor(Math.random() * len);
      const w: Worker = Object.values(cluster.workers!)[workerIndex]!;

      const payload: WorkerMessageType = {
        requestType: "HTTP",
        headers: req.headers,
        body: null,
        url: req.url as string,
      };

      w.send(JSON.stringify(payload));

      w.on("message", (message) => {
        res.statusCode = 200;
        res.write(message);
        res.end();
      });
    });
    server.listen(config.config.server.listen, () =>
      console.log("rev proxy is listening")
    );
  } else {
    const { config, workerId } = process.env;
    const validConfig = JSON.parse(config!) as ConfigSchemaType;
    console.log(`worker node ${workerId}`);
    process.on("message", function (d) {
      process.send!(`Message from ${workerId}`);
    });
  }
}
