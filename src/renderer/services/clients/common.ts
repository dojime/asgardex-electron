import { Network, XChainClientFactory, XChainClientType, XChainClientParamsType } from '@xchainjs/xchain-client'
import { observableEither as RxOE } from 'fp-ts-rxjs'
import * as FP from 'fp-ts/function'
import { right, left } from 'fp-ts/lib/Either'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { eqOString } from '../../helpers/fp/eq'
import { keystoreService } from '../wallet/keystore'
import { getPhrase } from '../wallet/util'
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
  Client: XChainClientType<T>,
  clientNetwork$: Rx.Observable<Network>,
  clientParams?: ((network: Network) => XChainClientParamsType<T>) | XChainClientParamsType<T>
) => {
  const clientName = /[0-9a-z]+\.[0-9a-z]+\.(com|org|io|info)/i.exec(Client.toString())?.[0] ?? '<unknown>'
  return Rx.combineLatest([keystoreService.keystore$, clientNetwork$]).pipe(
    RxOp.map((x) => {
      console.log(`clientState(${clientName})`, x)
      return x
    }),
    RxOp.switchMap(([keystore, network]) =>
      FP.pipe(
        getPhrase(keystore),
        O.map((phrase) =>
          Rx.from(
            Client.create({
              network,
              phrase,
              ...((typeof clientParams === 'function'
                ? (clientParams as (network: Network) => XChainClientParamsType<T>)
                : () => clientParams)(network) ?? {})
            })
          )
        ),
        O.map(RxOp.map((client) => right(client))),
        O.map(
          RxOp.catchError((error) => {
            console.error(`clientState(${clientName})`, error)
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
}
