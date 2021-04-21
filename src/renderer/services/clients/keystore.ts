import { Client as BNBClient } from '@xchainjs/xchain-binance'
import { Client as BTCClient } from '@xchainjs/xchain-bitcoin'
import { Client as BCHClient } from '@xchainjs/xchain-bitcoincash'
import { XChainClient, XChainClientParams, XChainClientFactory } from '@xchainjs/xchain-client'
import { Client as ETHClient } from '@xchainjs/xchain-ethereum'
import { Client as LTCClient } from '@xchainjs/xchain-litecoin'
import { Client as THORClient } from '@xchainjs/xchain-thorchain'
import { Chain } from '@xchainjs/xchain-util'
import * as FP from 'fp-ts/function'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { keystoreService } from '../wallet/keystore'
import { getPhrase } from '../wallet/util'

type ClientUnlockParams = string
type ClientParams = XChainClientParams<ClientUnlockParams>
type Client = XChainClient<ClientUnlockParams>
type ClientFactory = XChainClientFactory<Client, ClientParams, ClientUnlockParams>

const ClientFactories: Partial<Record<Chain, ClientFactory>> = {
  BNB: BNBClient,
  BTC: BTCClient,
  BCH: BCHClient,
  ETH: ETHClient,
  LTC: LTCClient,
  THOR: THORClient
}

const clientFactories$ = Rx.of(ClientFactories)

const unlockParams$ = keystoreService.keystore$.pipe(RxOp.map((keystoreState) => FP.pipe(getPhrase(keystoreState))))

export { ClientFactories, clientFactories$, unlockParams$ }
