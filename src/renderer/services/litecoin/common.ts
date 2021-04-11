import { Network as ClientNetwork } from '@xchainjs/xchain-client'
import { Client, NodeAuth } from '@xchainjs/xchain-litecoin'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { envOrDefault } from '../../helpers/envHelper'
import { network$ } from '../app/service'
import * as C from '../clients'
import { Client$ } from './types'

/**
 * Litecoin network depending on selected `Network`
 */
const clientNetwork$: Rx.Observable<ClientNetwork> = network$.pipe(
  RxOp.map((network) => {
    // In case of 'chaosnet' + 'mainnet` we stick on `mainnet`
    if (network === 'chaosnet') return 'mainnet'

    return network
  })
)

const LTC_NODE_TESTNET_URL = envOrDefault(
  process.env.REACT_APP_LTC_NODE_TESTNET_URL,
  'https://testnet.ltc.thorchain.info'
)
const LTC_NODE_MAINNET_URL = envOrDefault(process.env.REACT_APP_LTC_NODE_MAINNET_URL, 'https://ltc.thorchain.info')

const NODE_AUTH: NodeAuth = {
  password: envOrDefault(process.env.REACT_APP_LTC_NODE_PASSWORD, 'password'),
  username: envOrDefault(process.env.REACT_APP_LTC_NODE_USERNAME, 'thorchain')
}
/**
 * Stream to create an observable Client depending on existing phrase in keystore
 *
 * Whenever a phrase is added to keystore, a new Client will be created.
 * By the other hand: Whenever a phrase is removed, the client will be set to `none`
 * A Client will never be created if a phrase is not available
 */
const clientState$ = C.clientState(Client, clientNetwork$, (network) => ({
  nodeUrl: network === 'mainnet' ? LTC_NODE_MAINNET_URL : LTC_NODE_TESTNET_URL,
  nodeAuth: NODE_AUTH
}))

const client$: Client$ = clientState$.pipe(RxOp.map(C.getClient), RxOp.shareReplay(1))

/**
 * `Address`
 */
const address$: C.Address$ = C.address$(client$)

/**
 * `Address`
 */
const addressUI$: C.Address$ = C.addressUI$(client$)

/**
 * Explorer url depending on selected network
 */
const explorerUrl$: C.ExplorerUrl$ = C.explorerUrl$(client$)

/**
 * Explorer url depending on selected network
 */
const getExplorerTxUrl$: C.GetExplorerTxUrl$ = C.getExplorerTxUrl$(client$)

/**
 * Explorer url depending on selected network
 */
const getExplorerAddressUrl$: C.GetExplorerAddressUrl$ = C.getExplorerAddressUrl$(client$)

export { client$, clientState$, address$, addressUI$, explorerUrl$, getExplorerTxUrl$, getExplorerAddressUrl$ }
