import React, { useMemo } from 'react'

import { SyncOutlined } from '@ant-design/icons'
import * as RD from '@devexperts/remote-data-ts'
import * as FP from 'fp-ts/lib/function'
import * as O from 'fp-ts/lib/Option'
import { useObservableState } from 'observable-hooks'
import { useIntl } from 'react-intl'
import * as Rx from 'rxjs'

import { Footer } from '../../components/footer'
import { Header } from '../../components/header/Header'
import { PasswordModal } from '../../components/modal/password'
import { Button } from '../../components/uielements/button'
import { useMidgardContext } from '../../contexts/MidgardContext'
import { useWalletContext } from '../../contexts/WalletContext'
import { envOrDefault } from '../../helpers/envHelper'
import { PinRequestState } from '../../services/wallet/types'
import { View } from '../View'
import { ViewRoutes } from '../ViewRoutes'
import * as Styled from './AppView.style'

export const AppView: React.FC = (): JSX.Element => {
  const intl = useIntl()

  const {
    service: { apiEndpoint$, reloadApiEndpoint }
  } = useMidgardContext()

  const apiEndpoint = useObservableState(apiEndpoint$, RD.initial)

  const renderMidgardAlert = useMemo(() => {
    const description = (
      <>
        <Styled.ErrorDescription>
          {intl.formatMessage({ id: 'midgard.error.byzantine.description' })}
        </Styled.ErrorDescription>
        <Button onClick={reloadApiEndpoint} typevalue="outline" color="error">
          <SyncOutlined />
          {intl.formatMessage({ id: 'common.reload' })}
        </Button>
      </>
    )

    return (
      <Styled.Alert
        type="error"
        message={intl.formatMessage({ id: 'midgard.error.byzantine.title' })}
        description={description}
      />
    )
  }, [intl, reloadApiEndpoint])

  const renderMidgardError = useMemo(() => {
    const empty = () => <></>
    return FP.pipe(
      apiEndpoint,
      RD.fold(empty, empty, () => renderMidgardAlert, empty)
    )
  }, [apiEndpoint, renderMidgardAlert])

  // State for visibility of Modal to enter hardware wallet pin
  const { pinService } = useWalletContext()

  const pinRequestState = useObservableState<PinRequestState>(pinService.pinRequestState$, O.none)

  const renderPinModal = useMemo(() => {
    if (!O.isSome(pinRequestState)) return <></>
    const pinRequest = pinRequestState.value
    return (
      <PasswordModal
        title={pinRequest.title}
        onSuccess={(pin: string) => {
          pinRequest.resolve(pin)
        }}
        onClose={() => {
          pinRequest.resolve(null)
        }}
        validatePassword$={(pin: string) =>
          Rx.from(
            (async () => {
              if (!pinRequest.validator) return RD.success(undefined)
              const validator = ((x, y) => (x instanceof RegExp ? (z: string) => x.test(z) || y : x))(
                pinRequest.validator,
                pinRequest.validationFailed
              )
              try {
                const result = await validator(pin)
                if (result === true) return RD.success(undefined)
                throw result
              } catch (e) {
                return RD.failure(e instanceof Error ? e : new Error(String(e)))
              }
            })()
          )
        }
      />
    )
  }, [pinRequestState])

  return (
    <Styled.AppWrapper>
      <Styled.AppLayout>
        <Header />
        <View>
          {renderMidgardError}
          <ViewRoutes />
          {renderPinModal}
        </View>
        <Footer commitHash={envOrDefault($COMMIT_HASH, '')} isDev={$IS_DEV} />
      </Styled.AppLayout>
    </Styled.AppWrapper>
  )
}
