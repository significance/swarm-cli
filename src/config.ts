import { IOption } from 'furious-commander/dist/option'
import { Upload } from './command/upload'
import { Identity } from './command/identity'
import { VerbosityLevel } from './command/root-command/command-log'

export const beeApiUrl: IOption<string> = {
  key: 'bee-api-url',
  default: 'http://localhost:1633',
  describe: 'URL of the Bee-client API',
} as const

export const configFolder: IOption<string> = {
  key: 'config-folder',
  describe: 'Path of the configuration files that the CLI uses',
}

export const verbosity: IOption<string> = {
  key: 'verbosity',
  alias: 'v',
  describe: 'Print console messages in the given relevance level',
  choices: [...Object.keys(VerbosityLevel)],
  default: String(VerbosityLevel.Verbose),
}

export const optionParameters: IOption<unknown>[] = [beeApiUrl, configFolder, verbosity]

export const rootCommandClasses = [Upload, Identity]
