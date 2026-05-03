import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, it, expect, vi } from 'vitest'
import AddressField from './AddressField'

describe('AddressField', () => {
  it('vykreslí label, input a placeholder se správnými hodnotami', () => {
    // Ověření, že komponenta správně zobrazuje label a placeholder
    render(
      <AddressField
        label="Město"
        placeholder="Zadejte město"
        value="Liberec"
        onChange={vi.fn()}
      />
    )

    expect(screen.getByText('Město')).toBeInTheDocument()
    const input = screen.getByPlaceholderText('Zadejte město')
    expect(input).toBeInTheDocument()
    expect(input).toHaveValue('Liberec')
  })

  it('zavolá onChange s kompletní hodnotou při psaní uživatele', async () => {
    const mockOnChange = vi.fn()
    const user = userEvent.setup()

    /**
     * Testovací wrapper simulující chování rodičovské komponenty.
     * Nutný pro správné fungování kontrolovaného inputu, který 
     * očekává aktualizaci prop 'value' skrze 'onChange'[cite: 2].
     */
    const TestWrapper = () => {
      const [val, setVal] = useState('')
      return (
        <AddressField
          label="Ulice"
          placeholder="Název ulice"
          value={val}
          onChange={(newVal) => {
            setVal(newVal)
            mockOnChange(newVal)
          }}
        />
      )
    }

    render(<TestWrapper />)

    const input = screen.getByPlaceholderText('Název ulice')
    
    // Simulace postupného psaní znaků
    await user.type(input, 'Ahoj')

    // Díky Wrapperu a useState se nyní 'value' správně aktualizuje
    // a poslední volání obsahuje celý řetězec[cite: 2]
    expect(mockOnChange).toHaveBeenLastCalledWith('Ahoj')
    expect(input).toHaveValue('Ahoj')
  })

  it('zavolá onChange s prázdným řetězcem při smazání obsahu', async () => {
    const mockOnChange = vi.fn()
    const user = userEvent.setup()

    const TestWrapper = () => {
      const [val, setVal] = useState('Smaž mě')
      return (
        <AddressField
          label="Test"
          placeholder="Test"
          value={val}
          onChange={(newVal) => {
            setVal(newVal)
            mockOnChange(newVal)
          }}
        />
      )
    }

    render(<TestWrapper />)
    const input = screen.getByRole('textbox')

    // Vymazání textu
    await user.clear(input)

    expect(mockOnChange).toHaveBeenLastCalledWith('')
    expect(input).toHaveValue('')
  })
})