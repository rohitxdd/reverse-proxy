import { Command } from 'commander';
import { parseYAMLConfig, validateConfig } from './config';
import os from 'os'
import { createServer } from './server';

async function main() {
    const program = new Command();
    program.option("-c, --config <path>").parse()
    const options = program.opts()
    if (!options.config) process.exit(0);
    const res = await parseYAMLConfig(options.config)
    const result = await validateConfig(res)
    await createServer({ port: result.server.listen, workerCount: result.server.workers ?? os.cpus.length, config: result })
}

main()

