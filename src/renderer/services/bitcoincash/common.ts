import { ClientUrl, NodeAuth } from '@xchainjs/xchain-bitcoincash'
import { Network as ClientNetwork } from '@xchainjs/xchain-client'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { envOrDefault } from '../../helpers/envHelper'
import { network$ } from '../app/service'
import * as C from '../clients'
import { GetExplorerAddressUrl$ } from '../clients'
import { Client$ } from './types'

/**
 * Bitcoin Cash network depending on selected `Network`
 */
const clientNetwork$: Rx.Observable<ClientNetwork> = network$.pipe(
  RxOp.map((network) => {
    // In case of 'chaosnet' + 'mainnet` we stick on `mainnet`
    if (network === 'chaosnet') return 'mainnet'
    return network
  })
)

const HASKOIN_API_URL: ClientUrl = {
  testnet: envOrDefault(process.env.REACT_APP_HASKOIN_TESTNET_URL, 'https://api.haskoin.com/bchtest'),
  mainnet: envOrDefault(process.env.REACT_APP_HASKOIN_MAINNET_URL, 'https://api.haskoin.com/bch')
}

const NODE_URL: ClientUrl = {
  testnet: envOrDefault(process.env.REACT_APP_BCH_NODE_TESTNET_URL, 'https://testnet.bch.thorchain.info'),
  mainnet: envOrDefault(process.env.REACT_APP_BCH_NODE_MAINNET_URL, 'https://bch.thorchain.info')
}

const NODE_AUTH: NodeAuth = {
  password: envOrDefault(process.env.REACT_APP_BCH_NODE_PASSWORD, 'password'),
  username: envOrDefault(process.env.REACT_APP_BCH_NODE_USERNAME, 'thorchain')
}

/**
 * Stream to create an observable Client depending on existing phrase in keystore
 *
 * Whenever a phrase has been added to keystore, a new Client will be created.
 * By the other hand: Whenever a phrase has been removed, the client is set to `none`
 * A Client will never be created as long as no phrase is available
 */
const clientState$ = C.clientState(
  'BCH',
  clientNetwork$,
  Rx.of({
    haskoinUrl: HASKOIN_API_URL,
    nodeUrl: NODE_URL,
    nodeAuth: NODE_AUTH
  })
)

const client$: Client$ = clientState$.pipe(RxOp.map(C.getClient), RxOp.shareReplay(1))

/**
 * Helper stream to provide "ready-to-go" state of latest `Client`, but w/o exposing the client
 * It's needed by views only.
 */
const clientViewState$: Rx.Observable<C.ClientStateForViews> = clientState$.pipe(RxOp.map(C.getClientStateForViews))

/**
 * BCH `Address`
 */
const address$: C.Address$ = C.address$(client$)

/**
 * BCH `Address`
 */
const addressUI$: C.Address$ = C.addressUI$(client$)

/**
 * Explorer url
 */
const explorerUrl$: C.ExplorerUrl$ = C.explorerUrl$(client$)

/**
 * Explorer tx url
 */
const getExplorerTxUrl$: C.GetExplorerTxUrl$ = C.getExplorerTxUrl$(client$)

/**
 * Explorer address url
 */
const getExplorerAddressUrl$: GetExplorerAddressUrl$ = C.getExplorerAddressUrl$(client$)

export { address$, addressUI$, client$, clientViewState$, explorerUrl$, getExplorerTxUrl$, getExplorerAddressUrl$ }
