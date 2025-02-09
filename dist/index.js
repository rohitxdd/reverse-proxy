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
const commander_1 = require("commander");
const config_1 = require("./config");
const os_1 = __importDefault(require("os"));
const server_1 = require("./server");
function main() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        const program = new commander_1.Command();
        program.option("-c, --config <path>").parse();
        const options = program.opts();
        if (!options.config)
            process.exit(0);
        const res = yield (0, config_1.parseYAMLConfig)(options.config);
        const result = yield (0, config_1.validateConfig)(res);
        yield (0, server_1.createServer)({ port: result.server.listen, workerCount: (_a = result.server.workers) !== null && _a !== void 0 ? _a : os_1.default.cpus.length, config: result });
    });
}
main();
