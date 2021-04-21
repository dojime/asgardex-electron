import React from 'react'

import { Story, Meta } from '@storybook/react'

import { PrivateModal } from './PrivateModal'

export const StoryDefault: Story = () => (
  <PrivateModal title="Password confirmation" visible invalidPassword validatingPassword={false} />
)
StoryDefault.storyName = 'default'

export const StoryInvalid: Story = () => (
  <PrivateModal title="Password confirmation" visible invalidPassword validatingPassword={false} />
)
StoryInvalid.storyName = 'invalid'

export const StoryValidating: Story = () => (
  <PrivateModal title="Password confirmation" visible invalidPassword={false} validatingPassword />
)
StoryValidating.storyName = 'validating'

const meta: Meta = {
  component: PrivateModal,
  title: 'Components/Modal/Private',
  decorators: [
    (S: Story) => (
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          width: '300px'
        }}>
        <S />
      </div>
    )
  ]
}

export default meta
