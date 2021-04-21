import * as FP from 'fp-ts/function'
import * as O from 'fp-ts/lib/Option'

import { observableState } from '../../helpers/stateHelper'
import { PinRequestOpts, PinRequestState, PinService } from './types'

const { get$: getPinRequest$, get: getPinRequest, set: setPinRequest } = observableState<PinRequestState>(O.none)

const requestPin = (opts: PinRequestOpts): Promise<string | null> => {
  cancelPinRequest()
  const out: Promise<string | null> = new Promise((resolve, reject) => {
    setPinRequest(O.some({ ...opts, resolve, reject }))
  })
  out.finally(() => setPinRequest(O.none))
  return out
}

const cancelPinRequest = () => {
  const oldPinRequest = getPinRequest()
  setPinRequest(O.none)
  FP.pipe(
    oldPinRequest,
    O.fold(
      () => {},
      ({ resolve }) => resolve(null)
    )
  )
}

export const pinService: PinService = {
  pinRequestState$: getPinRequest$,
  requestPin,
  cancelPinRequest
}
