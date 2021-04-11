import { Network as ClientNetwork } from '@xchainjs/xchain-client'
import { Client } from '@xchainjs/xchain-thorchain'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { Network } from '../../../shared/api/types'
import { network$ } from '../app/service'
import * as C from '../clients'
import { getClient } from '../clients/utils'
import { Client$ } from './types'

const toThorNetwork = (network: Network) => {
  // In case of 'chaosnet' + 'mainnet` we stick on `mainnet`
  if (network === 'chaosnet') return 'mainnet'
  return network
}

/**
 * Thorchain network depending on selected `Network`
 */
const clientNetwork$: Rx.Observable<ClientNetwork> = network$.pipe(RxOp.map(toThorNetwork))

/**
 * Stream to create an observable Client depending on existing phrase in keystore
 *
 * Whenever a phrase is added to keystore, a new Client will be created.
 * By the other hand: Whenever a phrase is removed, the client will be set to `none`
 * A Client will never be created if a phrase is not available
 */
const clientState$ = C.clientState(Client, clientNetwork$)

const client$: Client$ = clientState$.pipe(RxOp.map(getClient), RxOp.shareReplay(1))

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

export {
  toThorNetwork,
  client$,
  clientState$,
  address$,
  addressUI$,
  explorerUrl$,
  getExplorerTxUrl$,
  getExplorerAddressUrl$
}
