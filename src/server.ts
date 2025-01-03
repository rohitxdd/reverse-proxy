import cluster, { Worker } from "cluster";
import { ConfigSchemaType } from "./configSchema";
import http from "node:http";
import { WorkerMessageType, WorkerReplyType } from "./server-schema";
import { date } from "zod";

interface CreateServerConfig {
  port: number;
  workerCount: number;
  config: ConfigSchemaType;
}

export async function createServer(configData: CreateServerConfig) {
  const { config, port, workerCount } = configData;
  if (cluster.isPrimary) {
    console.log("Master cluster is up");
    console.log(workerCount);
    for (let index = 0; index < workerCount; index++) {
      cluster.fork({
        config: JSON.stringify(config),
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
        const parsedMsg: WorkerReplyType = JSON.parse(message);
        res.statusCode = parsedMsg.statusCode;
        if (parsedMsg.isError) {
          res.write(parsedMsg.errorMessage);
        } else {
          res.write(parsedMsg.data);
        }
        res.end();
      });
    });
    server.listen(port, () => console.log(`rev proxy is listening at ${port}`));
  } else {
    const { config, workerId } = process.env;
    const validConfig = JSON.parse(config!) as ConfigSchemaType;
    const { upstreams, rules } = validConfig.server;
    console.log(`worker node ${workerId}`);
    process.on("message", function (d: string) {
      const payload = JSON.parse(d) as WorkerMessageType;

      const rule = rules.find((e) => {
        const regex = new RegExp(`^${e.path}.*$`);
        return regex.test(payload.url);
      });

      const upstream = upstreams.find((u) => u.id == rule?.upstreams[0]);

      if (!rule || !upstream) {
        const res: WorkerReplyType = {
          statusCode: 401,
          isError: true,
          errorMessage: "No rules Found",
        };
        process.send!(JSON.stringify(res));
        return;
      } else {
        const result: WorkerReplyType = {
          statusCode: 200,
          isError: false,
          data: "",
        };

        const request = http.request(
          { host: upstream.url, path: payload.url, method: "GET" },
          (res) => {
            let body = "";
            res.on("data", (chunk) => {
              body += chunk;
            });
            res.on("end", () => {
              process.send!(JSON.stringify({ ...result, data: body }));
            });
          }
        );
        request.end();
      }
    });
  }
}
