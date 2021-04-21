import { Network as ClientNetwork } from '@xchainjs/xchain-binance'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { network$ } from '../app/service'
import * as C from '../clients'
import { Address$, ExplorerUrl$, GetExplorerTxUrl$, GetExplorerAddressUrl$ } from '../clients/types'
import { ClientStateForViews } from '../clients/types'
import { getClient, getClientStateForViews } from '../clients/utils'
import { Client$ } from './types'

/**
 * Binance network depending on `Network`
 */
const clientNetwork$: Rx.Observable<ClientNetwork> = network$.pipe(
  RxOp.mergeMap((network) => {
    if (network === 'testnet') return Rx.of('testnet' as const)
    // chaosnet + mainnet are using Binance mainnet url
    return Rx.of('mainnet' as const)
  })
)

/**
 * Stream to create an observable Client depending on existing phrase in keystore
 *
 * Whenever a phrase has been added to keystore, a new Client will be created.
 * By the other hand: Whenever a phrase has been removed, the client is set to `none`
 * A Client will never be created as long as no phrase is available
 */
const clientState$ = C.clientState('BNB', clientNetwork$)

const client$: Client$ = clientState$.pipe(RxOp.map(getClient), RxOp.shareReplay(1))

/**
 * Helper stream to provide "ready-to-go" state of latest `Client`, but w/o exposing the client
 * It's needed by views only.
 */
const clientViewState$: Rx.Observable<ClientStateForViews> = clientState$.pipe(RxOp.map(getClientStateForViews))

/**
 * Current `Address` depending on selected network
 */
const address$: Address$ = C.address$(client$)

/**
 * Current `Address` depending on selected network
 */
const addressUI$: Address$ = C.addressUI$(client$)

/**
 * Explorer url depending on selected network
 */
const explorerUrl$: ExplorerUrl$ = C.explorerUrl$(client$)

/**
 * Explorer url depending on selected network
 */
const getExplorerTxUrl$: GetExplorerTxUrl$ = C.getExplorerTxUrl$(client$)

/**
 * Explorer url depending on selected network
 */
const getExplorerAddressUrl$: GetExplorerAddressUrl$ = C.getExplorerAddressUrl$(client$)

export {
  client$,
  clientState$,
  clientViewState$,
  address$,
  addressUI$,
  explorerUrl$,
  getExplorerTxUrl$,
  getExplorerAddressUrl$
}
