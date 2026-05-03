import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import UserForm from './UserForm'

describe('UserForm', () => {
  const mockUser = {
    userName: 'admin_test',
    name: 'Admin Adminovič',
    email: 'admin@test.cz',
    role: 1
  }

  const mockSubmit = vi.fn()
  const mockCancel = vi.fn()

  it('vykreslí formulář s daty uživatele', () => {
    const { container } = render(
      <UserForm user={mockUser} onSubmit={mockSubmit} onCancel={mockCancel} />
    )

    expect(container.querySelector('input[name="userName"]')).toHaveValue('admin_test')
    expect(container.querySelector('input[name="name"]')).toHaveValue('Admin Adminovič')
    expect(container.querySelector('input[name="email"]')).toHaveValue('admin@test.cz')
    expect(container.querySelector('select[name="role"]')).toHaveValue('1')
  })

  it('vykreslí prázdný formulář s výchozími hodnotami, pokud uživatel není předán', () => {
    const { container } = render(<UserForm onSubmit={mockSubmit} onCancel={mockCancel} />)

    expect(container.querySelector('input[name="userName"]')).toHaveValue('')
    expect(container.querySelector('select[name="role"]')).toHaveValue('0')
  })

  it('zavolá onCancel při kliknutí na tlačítko Zrušit', () => {
    render(<UserForm onSubmit={mockSubmit} onCancel={mockCancel} />)
    
    fireEvent.click(screen.getByText('Zrušit'))
    expect(mockCancel).toHaveBeenCalledTimes(1)
  })

  it('aktualizuje stav a zavolá onSubmit s novými daty', () => {
    const { container } = render(<UserForm onSubmit={mockSubmit} onCancel={mockCancel} />)

    const nameInput = container.querySelector('input[name="name"]')!
    const roleSelect = container.querySelector('select[name="role"]')!

    fireEvent.change(nameInput, { target: { value: 'Nové Jméno', name: 'name' } })
    fireEvent.change(roleSelect, { target: { value: '1', name: 'role' } })

    fireEvent.submit(container.querySelector('form')!)

    expect(mockSubmit).toHaveBeenCalledWith({
      userName: '',
      name: 'Nové Jméno',
      email: '',
      role: 1
    })
  })

  it('změní roli z Admina na Usera a odešle číslo', () => {
    const { container } = render(
      <UserForm user={mockUser} onSubmit={mockSubmit} onCancel={mockCancel} />
    )

    const roleSelect = container.querySelector('select[name="role"]')!
    fireEvent.change(roleSelect, { target: { value: '0', name: 'role' } })

    fireEvent.submit(container.querySelector('form')!)

    // Role musí být číslo 0, nikoliv string "0"
    expect(mockSubmit).toHaveBeenCalledWith(expect.objectContaining({ role: 0 }))
  })
})