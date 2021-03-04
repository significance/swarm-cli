import { FeedReader, FeedWriter } from '@ethersphere/bee-js/dist/feed'
import { Topic } from '@ethersphere/bee-js/dist/feed/topic'
import Wallet from 'ethereumjs-wallet'
import { Option } from 'furious-commander'
import { exit } from 'process'
import { getWalletFromIdentity } from '../../service/identity'
import { Identity } from '../../service/identity/types'
import { RootCommand } from '../root-command'

export class FeedCommand extends RootCommand {
  @Option({ key: 'identity', describe: 'Name of the identity', required: true })
  public identity!: string

  @Option({ key: 'topic', describe: 'Feed topic', required: true })
  public topic!: string

  @Option({ key: 'password', describe: 'Password for the wallet' })
  public password!: string

  @Option({ key: 'hash-topic', type: 'boolean', describe: 'Hash the topic to 32 bytes' })
  public hashTopic!: boolean

  protected async getFeedWriter(): Promise<FeedWriter> {
    const wallet = await this.getWallet()
    const topic = this.getTopic()

    return this.bee.makeFeedWriter('sequence', topic, wallet.getPrivateKey())
  }

  protected async getFeedReader(): Promise<FeedReader> {
    const wallet = await this.getWallet()
    const topic = this.getTopic()

    return this.bee.makeFeedReader('sequence', topic, wallet.getAddressString())
  }

  private getTopic(): string | Topic {
    if (!this.hashTopic) {
      this.enforceValidHexTopic()
    }

    return this.hashTopic ? this.bee.makeFeedTopic(this.topic) : this.topic
  }

  private async getWallet(): Promise<Wallet> {
    const identity = this.getIdentity()
    const wallet = await getWalletFromIdentity(identity, this.password)

    return wallet
  }

  private enforceValidHexTopic(): void {
    const hasCorrectLength = this.topic.startsWith('0x') ? this.topic.length === 66 : this.topic.length === 64
    const hasCorrectPattern = new RegExp(/^(0x)?[a-f0-9]+$/g).test(this.topic)

    if (!hasCorrectLength || !hasCorrectPattern) {
      this.console.error('Error parsing topic!')
      this.console.log('You can have it hashed to 32 bytes by passing the --hash-topic option.')
      this.console.log('To provide the 32 bytes, please specify it in lower case hexadecimal format.')
      this.console.log('The 0x prefix may be omitted.')
      exit(1)
    }
  }

  private getIdentity(): Identity {
    const identity = this.commandConfig.config.identities[this.identity]

    if (!identity) {
      this.console.error(`Invalid identity name: '${this.identity}'`)

      exit(1)
    }

    return identity
  }
}
