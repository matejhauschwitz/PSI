import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import AddressSection from './AddressSection'
import type { Address } from '../types'

describe('AddressSection', () => {
    const mockAddress: Address = {
        streetAddress: 'Vodičkova 1',
        city: 'Praha',
        zip: '11000',
        country: 'Česká republika'
    }

    const defaultProps = {
        title: 'Fakturační adresa',
        address: mockAddress,
        onChange: vi.fn()
    }

    beforeEach(() => {
        vi.clearAllMocks()
    })

    it('vykreslí titulek a všechny hodnoty adresy', () => {
        render(<AddressSection {...defaultProps} />)

        // Kontrola titulku
        expect(screen.getByText(/Fakturační adresa/i)).toBeInTheDocument()

        // Kontrola hodnot v polích přes placeholdery
        expect(screen.getByPlaceholderText('Ulice')).toHaveValue('Vodičkova 1')
        expect(screen.getByPlaceholderText('Město')).toHaveValue('Praha')
        expect(screen.getByPlaceholderText('PSČ')).toHaveValue('11000')
        expect(screen.getByPlaceholderText('Země')).toHaveValue('Česká republika')
    })

    it('správně ošetří stav, kdy je adresa undefined (fallback na prázdné stringy)[cite: 16]', () => {
        render(<AddressSection {...defaultProps} address={undefined} />)

        // Všechna pole by měla být prázdná, nikoliv null nebo undefined[cite: 16]
        expect(screen.getByPlaceholderText('Ulice')).toHaveValue('')
        expect(screen.getByPlaceholderText('Město')).toHaveValue('')
        expect(screen.getByPlaceholderText('PSČ')).toHaveValue('')
        expect(screen.getByPlaceholderText('Země')).toHaveValue('')
    })

    it('zavolá onChange se správným klíčem při změně ulice[cite: 16]', () => {
        render(<AddressSection {...defaultProps} />)

        const input = screen.getByPlaceholderText('Ulice')
        fireEvent.change(input, { target: { value: 'Nová Ulice 5' } })

        expect(defaultProps.onChange).toHaveBeenCalledWith('streetAddress', 'Nová Ulice 5')
    })

    it('zavolá onChange se správným klíčem při změně města[cite: 16]', () => {
        render(<AddressSection {...defaultProps} />)

        const input = screen.getByPlaceholderText('Město')
        fireEvent.change(input, { target: { value: 'Brno' } })

        expect(defaultProps.onChange).toHaveBeenCalledWith('city', 'Brno')
    })

    it('zavolá onChange se správným klíčem při změně PSČ[cite: 16]', () => {
        render(<AddressSection {...defaultProps} />)

        const input = screen.getByPlaceholderText('PSČ')
        fireEvent.change(input, { target: { value: '60200' } })

        expect(defaultProps.onChange).toHaveBeenCalledWith('zip', '60200')
    })

    it('zavolá onChange se správným klíčem při změně země[cite: 16]', () => {
        render(<AddressSection {...defaultProps} />)

        const input = screen.getByPlaceholderText('Země')
        fireEvent.change(input, { target: { value: 'Slovensko' } })

        expect(defaultProps.onChange).toHaveBeenCalledWith('country', 'Slovensko')
    })
})