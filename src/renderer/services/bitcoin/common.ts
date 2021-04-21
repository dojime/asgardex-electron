import { Network as ClientNetwork } from '@xchainjs/xchain-client'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { network$ } from '../app/service'
import * as C from '../clients'
import { GetExplorerAddressUrl$ } from '../clients'
import { Client$ } from './types'

/**
 * Bitcoin network depending on selected `Network`
 */
const clientNetwork$: Rx.Observable<ClientNetwork> = network$.pipe(
  RxOp.map((network) => {
    // In case of 'chaosnet' + 'mainnet` we stick on `mainnet`
    if (network === 'chaosnet') return 'mainnet'

    return network
  })
)

/**
 * Stream to create an observable Client depending on existing phrase in keystore
 *
 * Whenever a phrase has been added to keystore, a new Client will be created.
 * By the other hand: Whenever a phrase has been removed, the client is set to `none`
 * A Client will never be created as long as no phrase is available
 */
const clientState$ = C.clientState('BTC', clientNetwork$)

const client$: Client$ = clientState$.pipe(RxOp.map(C.getClient), RxOp.shareReplay(1))

/**
 * Helper stream to provide "ready-to-go" state of latest `Client`, but w/o exposing the client
 * It's needed by views only.
 */
const clientViewState$: Rx.Observable<C.ClientStateForViews> = clientState$.pipe(RxOp.map(C.getClientStateForViews))

/**
 * BTC `Address`
 */
const address$: C.Address$ = C.address$(client$)

/**
 * BTC `Address`
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
const getExplorerAddressUrl$: GetExplorerAddressUrl$ = C.getExplorerAddressUrl$(client$)

export { client$, clientViewState$, address$, addressUI$, explorerUrl$, getExplorerTxUrl$, getExplorerAddressUrl$ }
