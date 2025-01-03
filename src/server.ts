import cluster, { Worker } from "cluster";
import { ConfigSchemaType } from "./configSchema";
import http from "node:http";

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
      const w = cluster.fork({
        config: JSON.stringify(config.config),
        workerId: index + 1,
      });
      w.on("message", function (data) {
        console.log(data);
      });
      console.log(`worker ${index + 1}`);
    }
    const server = http.createServer(function (req, res) {
      console.log(Object.values(cluster.workers!).length);
    });
    server.listen(config.config.server.listen);
  } else {
    const { config, workerId } = process.env;
    const validConfig = JSON.parse(config!) as ConfigSchemaType;
    console.log(`worker node ${workerId}`);
  }
}
