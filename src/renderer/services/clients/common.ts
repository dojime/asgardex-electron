import { Network, XChainClientFactory, XChainClientType, XChainClientParamsType } from '@xchainjs/xchain-client'
import { Chain } from '@xchainjs/xchain-util'
import { observableEither as RxOE } from 'fp-ts-rxjs'
import * as FP from 'fp-ts/function'
import { right, left } from 'fp-ts/lib/Either'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { eqOString } from '../../helpers/fp/eq'
// import { clientFactories$, unlockParams$ } from './keystore'
import { clientFactories$, unlockParams$ } from './hdwallet'
import { ClientState, ExplorerUrl$, GetExplorerAddressUrl$, GetExplorerTxUrl$, XChainClient$ } from './types'

export const explorerUrl$: (client$: XChainClient$) => ExplorerUrl$ = (client$) =>
  client$.pipe(
    RxOp.map(O.map((client) => client.getExplorerUrl())),
    RxOp.distinctUntilChanged(eqOString.equals),
    RxOp.shareReplay(1)
  )

export const getExplorerTxUrl$: (client$: XChainClient$) => GetExplorerTxUrl$ = (client$) =>
  client$.pipe(RxOp.map(O.map((client) => client.getExplorerTxUrl)), RxOp.shareReplay(1))

export const getExplorerAddressUrl$: (client$: XChainClient$) => GetExplorerAddressUrl$ = (client$) =>
  client$.pipe(RxOp.map(O.map((client) => client.getExplorerAddressUrl)), RxOp.shareReplay(1))

export const clientState = <T extends XChainClientFactory<any, any, any>>( // eslint-disable-line @typescript-eslint/no-explicit-any
  chain: Chain,
  clientNetwork$: Rx.Observable<Network>,
  clientParams$?: Rx.Observable<XChainClientParamsType<T>>
) =>
  Rx.combineLatest([clientFactories$, unlockParams$, clientNetwork$, clientParams$ ?? Rx.of({})]).pipe(
    RxOp.switchMap(([clientFactories, unlockParams, network, clientParams]) =>
      FP.pipe(
        unlockParams,
        O.map((unlockParams) =>
          Rx.from(
            (async () => {
              const out = clientFactories[chain]
              if (!out) throw new Error(`no client found for ${chain}`)
              return out.create({
                network,
                unlock: unlockParams,
                ...clientParams
              })
            })()
          )
        ),
        O.map(RxOp.map((client) => right(client))),
        O.map(
          RxOp.catchError((error) => {
            console.error(`clientState(${chain})`, error)
            return Rx.of(left(error))
          })
        ),
        RxOE.fromOption(() => undefined),
        RxOE.fold(
          () => Rx.of(O.none as ClientState<XChainClientType<T>>),
          RxOp.map((x) => O.some(x) as ClientState<XChainClientType<T>>)
        )
      )
    )
  )
