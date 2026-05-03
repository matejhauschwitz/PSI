import { render, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import ProfileFormHeader from './ProfileFormHeader'
import type { User } from '../types'

describe('ProfileFormHeader', () => {
  const mockUser: User = {
    id: 1,
    userName: 'testuser',
    name: 'Jan Novák',
    email: 'jan@novak.cz',
    isMale: true,
    birthDay: '1990-05-15T00:00:00.000Z',
    processData: true
  }

  const defaultProps = {
    user: mockUser,
    onNameChange: vi.fn(),
    onEmailChange: vi.fn(),
    onGenderChange: vi.fn(),
    onBirthdayChange: vi.fn(),
    onProcessDataChange: vi.fn()
  }

  beforeEach(() => {
    vi.clearAllMocks()
  })

  const getInputs = (container: HTMLElement) => {
    const inputs = container.querySelectorAll('input')
    const select = container.querySelector('select')
    return {
      username: inputs[0],
      name: inputs[1],
      email: inputs[2],
      gender: select,
      birthday: inputs[3],
      checkbox: inputs[4]
    }
  }

  it('vykreslí základní údaje z předaného uživatele', () => {
    const { container } = render(<ProfileFormHeader {...defaultProps} />)
    const elements = getInputs(container)

    expect(elements.username).toHaveValue('testuser')
    expect(elements.name).toHaveValue('Jan Novák')
    expect(elements.email).toHaveValue('jan@novak.cz')
    expect(elements.gender).toHaveValue('male')
    expect(elements.birthday).toHaveValue('1990-05-15')
    expect(elements.checkbox).toBeChecked()
  })

  it('zavolá onNameChange při změně pole Jméno', () => {
    const { container } = render(<ProfileFormHeader {...defaultProps} />)
    const elements = getInputs(container)

    fireEvent.change(elements.name, { target: { value: 'Petr' } })

    expect(defaultProps.onNameChange).toHaveBeenCalledWith('Petr')
  })

  it('zavolá onEmailChange při změně pole Email[cite: 13]', () => {
    const { container } = render(<ProfileFormHeader {...defaultProps} />)
    const elements = getInputs(container)

    fireEvent.change(elements.email, { target: { value: 'petr@test.cz' } })

    expect(defaultProps.onEmailChange).toHaveBeenCalledWith('petr@test.cz')
  })

  it('zavolá onGenderChange při změně pohlaví[cite: 13]', () => {
    const { container } = render(<ProfileFormHeader {...defaultProps} />)
    const elements = getInputs(container)

    fireEvent.change(elements.gender!, { target: { value: 'female' } })

    expect(defaultProps.onGenderChange).toHaveBeenCalledWith('female')
  })

  it('zavolá onBirthdayChange při změně data[cite: 13]', () => {
    const { container } = render(<ProfileFormHeader {...defaultProps} />)
    const elements = getInputs(container)

    fireEvent.change(elements.birthday, { target: { value: '1995-10-20' } })

    expect(defaultProps.onBirthdayChange).toHaveBeenCalledWith('1995-10-20')
  })

  it('zavolá onProcessDataChange při kliknutí na checkbox[cite: 13]', () => {
    const { container } = render(<ProfileFormHeader {...defaultProps} />)
    const elements = getInputs(container)

    fireEvent.click(elements.checkbox)

    // Původní hodnota byla true, takže click volá změnu na false[cite: 13]
    expect(defaultProps.onProcessDataChange).toHaveBeenCalledWith(false)
  })

  it('zvládne prázdného uživatele[cite: 13]', () => {
    const emptyUser = {} as User
    const { container } = render(<ProfileFormHeader {...defaultProps} user={emptyUser} />)
    const elements = getInputs(container)

    expect(elements.username).toHaveValue('')
    expect(elements.name).toHaveValue('')
    expect(elements.email).toHaveValue('')
  })
})