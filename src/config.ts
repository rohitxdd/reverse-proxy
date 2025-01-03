import fs from "node:fs/promises"
import {parse} from "yaml"
import { rootConfigSchema } from "./configSchema"


export async function parseYAMLConfig(filePath : string) : Promise<string>{
    const configFileContent = await fs.readFile(filePath, "utf-8")
    const configJSON = parse(configFileContent)
    return JSON.stringify(configJSON)
}

export async function validateConfig(configStr:string) {
    const validatedConfig = await rootConfigSchema.parseAsync(JSON.parse(configStr))
    return validatedConfig
}