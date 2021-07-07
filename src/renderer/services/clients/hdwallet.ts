import { ElectronKeepKeyAdapter } from '@xchainjs/hdwallet-keepkey-electron'
import { ClientFactories, createKeepKeyWallet } from '@xchainjs/xchain-hdwallet'
// import { hdwallet } from '@xchainjs/xchain-client'
// import { ClientFactories, createNativeWallet } from '@xchainjs/xchain-hdwallet'
// import { observableEither as RxOE } from 'fp-ts-rxjs'
// import * as E from 'fp-ts/lib/Either'
// import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import * as Rx from 'rxjs'
import * as RxOp from 'rxjs/operators'

// import { keystoreService } from '../wallet/keystore'
import { pinService } from '../wallet/pin'
// import { getPhrase } from '../wallet/util'

const clientFactories$ = Rx.of(ClientFactories)

const unlockParams$ = Rx.from(
  createKeepKeyWallet({
    adapterType: ElectronKeepKeyAdapter,
    getPin: async (): Promise<string> => {
      const out = await pinService.requestPin({
        title: 'Enter PIN',
        validator: /^[0-9]+$/,
        validationFailed: 'Bad PIN'
      })
      if (out === null) throw new Error('pin entry cancelled')
      return out
    },
    getPassphrase: async (): Promise<string> => {
      const out = await pinService.requestPin({ title: 'Enter Passphrase' })
      if (out === null) throw new Error('passphrase entry cancelled')
      return out
    }
  })
).pipe(RxOp.map((wallet) => O.some({ wallet })))

// const unlockParams$ = keystoreService.keystore$.pipe(
//   RxOp.map((keystoreState) => getPhrase(keystoreState)),
//   RxOp.map(RxOE.fromOption(FP.constVoid)),
//   RxOp.switchAll(),
//   RxOE.map((mnemonic) => Rx.from(createNativeWallet({ mnemonic }))),
//   RxOE.map(RxOp.map((wallet) => ({ wallet }))),
//   RxOE.map(RxOp.map((x) => E.right(x))),
//   RxOE.flatten,
//   RxOE.fold(
//     () => Rx.of(O.none),
//     (x: hdwallet.ClientUnlockParams) => Rx.of(O.some(x))
//   )
// )

export { ClientFactories, clientFactories$, unlockParams$ }
