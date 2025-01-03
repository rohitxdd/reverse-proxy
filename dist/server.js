"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createServer = createServer;
const cluster_1 = __importDefault(require("cluster"));
const node_http_1 = __importDefault(require("node:http"));
function createServer(configData) {
    return __awaiter(this, void 0, void 0, function* () {
        const { config, port, workerCount } = configData;
        if (cluster_1.default.isPrimary) {
            console.log("Master cluster is up");
            console.log(workerCount);
            for (let index = 0; index < workerCount; index++) {
                cluster_1.default.fork({
                    config: JSON.stringify(config),
                    workerId: index + 1,
                });
                console.log(`worker ${index + 1}`);
            }
            const server = node_http_1.default.createServer(function (req, res) {
                const len = Object.values(cluster_1.default.workers).length;
                const workerIndex = Math.floor(Math.random() * len);
                const w = Object.values(cluster_1.default.workers)[workerIndex];
                const payload = {
                    requestType: "HTTP",
                    headers: req.headers,
                    body: null,
                    url: req.url,
                };
                w.send(JSON.stringify(payload));
                w.on("message", (message) => {
                    const parsedMsg = JSON.parse(message);
                    res.statusCode = parsedMsg.statusCode;
                    if (parsedMsg.isError) {
                        res.write(parsedMsg.errorMessage);
                    }
                    else {
                        res.write(parsedMsg.data);
                    }
                    res.end();
                });
            });
            server.listen(port, () => console.log(`rev proxy is listening at ${port}`));
        }
        else {
            const { config, workerId } = process.env;
            const validConfig = JSON.parse(config);
            const { upstreams, rules } = validConfig.server;
            console.log(`worker node ${workerId}`);
            process.on("message", function (d) {
                const payload = JSON.parse(d);
                const rule = rules.find((e) => {
                    const regex = new RegExp(`^${e.path}.*$`);
                    return regex.test(payload.url);
                });
                const upstream = upstreams.find((u) => u.id == (rule === null || rule === void 0 ? void 0 : rule.upstreams[0]));
                if (!rule || !upstream) {
                    const res = {
                        statusCode: 401,
                        isError: true,
                        errorMessage: "No rules Found",
                    };
                    process.send(JSON.stringify(res));
                    return;
                }
                else {
                    const result = {
                        statusCode: 200,
                        isError: false,
                        data: "",
                    };
                    const request = node_http_1.default.request({ host: upstream.url, path: payload.url, method: "GET" }, (res) => {
                        let body = "";
                        res.on("data", (chunk) => {
                            body += chunk;
                        });
                        res.on("end", () => {
                            process.send(JSON.stringify(Object.assign(Object.assign({}, result), { data: body })));
                        });
                    });
                    request.end();
                }
            });
        }
    });
}
