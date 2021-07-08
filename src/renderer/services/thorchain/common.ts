import { Client, ClientUrl } from '@xchainjs/xchain-thorchain'
import { right, left } from 'fp-ts/lib/Either'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import { Observable, Observer } from 'rxjs'
import { map, mergeMap, shareReplay } from 'rxjs/operators'

import { clientNetwork$ } from '../app/service'
import * as C from '../clients'
import { getClient } from '../clients/utils'
import { keystoreService } from '../wallet/keystore'
import { getPhrase } from '../wallet/util'
import { Client$, ClientState } from './types'

/**
 * Get the client url.
 *
 * @returns {ClientUrl} The client url (both mainnet and testnet) for thorchain.
 */
const getDefaultClientUrl = (): ClientUrl => {
  return {
    testnet: {
      node: 'http://18.159.71.230:1317',
      rpc: 'http://18.159.71.230:26657'
    },
    mainnet: {
      node: 'https://thornode.thorchain.info',
      rpc: 'https://rpc.thorchain.info'
    }
  }
}

/**
 * Stream to create an observable ThorchainClient depending on existing phrase in keystore
 *
 * Whenever a phrase is added to keystore, a new ThorchainClient will be created.
 * By the other hand: Whenever a phrase is removed, the client will be set to `none`
 * A ThorchainClient will never be created if a phrase is not available
 */
const clientState$ = Rx.combineLatest([keystoreService.keystore$, clientNetwork$]).pipe(
  mergeMap(
    ([keystore, network]) =>
      new Observable((observer: Observer<ClientState>) => {
        const client: ClientState = FP.pipe(
          getPhrase(keystore),
          O.chain((phrase) => {
            try {
              const client = new Client({
                clientUrl: getDefaultClientUrl(),
                network,
                phrase
              })
              return O.some(right(client)) as ClientState
            } catch (error) {
              console.error('Failed to create THOR client', error)
              return O.some(left(error)) as ClientState
            }
          })
        )
        observer.next(client)
      })
  )
)

const client$: Client$ = clientState$.pipe(map(getClient), shareReplay(1))

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
