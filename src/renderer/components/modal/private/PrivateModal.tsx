import React, { useCallback, useMemo, useEffect, useState } from 'react'

import { Form } from 'antd'
import * as FP from 'fp-ts/lib/function'
import { useIntl } from 'react-intl'

import { Input } from '../../uielements/input'
import { Label } from '../../uielements/label'
import * as Styled from './PrivateModal.style'

type Props = {
  title?: string
  visible: boolean
  invalidPassword?: boolean | string
  validatingPassword?: boolean | string
  onConfirm?: (password: string) => void
  onOk?: (password?: string) => void
  onCancel?: FP.Lazy<void>
  isSuccess?: boolean
}

export const PrivateModal: React.FC<Props> = (props): JSX.Element => {
  const {
    title,
    visible,
    invalidPassword,
    validatingPassword,
    onConfirm = FP.constVoid,
    onOk = FP.constVoid,
    onCancel = FP.constVoid,
    isSuccess
  } = props

  const intl = useIntl()

  const [password, setPassword] = useState('')
  const [confirmed, setConfirmed] = useState(false)
  const [confirmedAtLeastOnce, setConfirmedAtLeastOnce] = useState(false)

  /**
   * Call onOk on success only
   */
  useEffect(() => {
    if (isSuccess && confirmed) {
      onOk(password)
    }
  }, [isSuccess, confirmed, onOk, password])

  const onChangePasswordHandler = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setConfirmed(false)
      setPassword(e.target.value)
    },
    [setPassword]
  )

  const onConfirmCb = useCallback(() => {
    setConfirmed(true)
    setConfirmedAtLeastOnce(true)
    onConfirm(password)
  }, [onConfirm, password])

  const onOkCb = useMemo(() => (!validatingPassword ? onConfirmCb : undefined), [validatingPassword, onConfirmCb])

  return (
    <Styled.Modal
      title={intl.formatMessage({ id: title ?? 'wallet.password.confirmation' })}
      visible={visible}
      onOk={onOkCb}
      onCancel={onCancel}
      maskClosable={false}
      closable={false}
      okText={intl.formatMessage({ id: 'common.confirm' })}
      cancelText={intl.formatMessage({ id: 'common.cancel' })}>
      <Form autoComplete="off">
        <Form.Item
          className={invalidPassword ? 'has-error' : ''}
          extra={
            (validatingPassword ?? false) !== false
              ? `${intl.formatMessage({
                  id:
                    typeof validatingPassword === 'string' ? validatingPassword : 'wallet.password.confirmation.pending'
                })}...`
              : ''
          }>
          <Input
            type="password"
            typevalue="normal"
            size="large"
            value={password}
            onChange={onChangePasswordHandler}
            prefix={<Styled.LockOutlined />}
            autoComplete="off"
            autoFocus
            onPressEnter={onOkCb}
          />
          {confirmedAtLeastOnce && (invalidPassword ?? false) !== false && (
            <Label color="error" textTransform="uppercase">
              {intl.formatMessage({
                id: typeof invalidPassword === 'string' ? invalidPassword : 'wallet.password.confirmation.error'
              })}
            </Label>
          )}
        </Form.Item>
      </Form>
    </Styled.Modal>
  )
}
