import { Address } from '@xchainjs/xchain-client'
import { observableEither as RxOE } from 'fp-ts-rxjs'
import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/lib/Option'
import { pipe } from 'fp-ts/pipeable'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

import { removeAddressPrefix } from '../../helpers/addressHelper'
import { eqOString } from '../../helpers/fp/eq'
import { Address$, XChainClient$ } from '../clients/types'

export const addressUI$: (client$: XChainClient$) => Address$ = (client$) =>
  client$.pipe(
    RxOp.mergeMap((client) =>
      FP.pipe(
        client,
        RxOE.fromOption(() => undefined),
        RxOE.map((client) =>
          FP.pipe(
            client.getAddress(),
            Rx.from,
            RxOE.rightObservable,
            RxOp.catchError(() => RxOE.left(undefined))
          )
        ),
        RxOE.flatten,
        RxOE.fold(
          () => Rx.of(O.none),
          (x) => Rx.of(O.some(x))
        )
      )
    ),
    RxOp.distinctUntilChanged(eqOString.equals),
    RxOp.shareReplay(1)
  )

export const address$: (client$: XChainClient$) => Address$ = (client$) =>
  pipe(addressUI$(client$), RxOp.map(O.map((address: Address) => removeAddressPrefix(address))))
