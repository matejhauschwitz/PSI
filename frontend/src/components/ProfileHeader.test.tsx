// ProfileHeader.test.tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import ProfileHeader from './ProfileHeader'
import type { User } from '../types'

describe('ProfileHeader', () => {
    const mockUser: User = {
        id: 1,
        name: 'Jan Novák',
        userName: 'jannovak',
        email: 'jan@example.com',
    }

    it('vykreslí všechny uživatelské informace a správnou iniciálu', () => {
        render(<ProfileHeader user={mockUser} />)

        expect(screen.getByText('Jan Novák')).toBeInTheDocument()
        expect(screen.getByText('@jannovak')).toBeInTheDocument()
        expect(screen.getByText('jan@example.com')).toBeInTheDocument()

        // Iniciála by měla být 'J' z 'Jan Novák'
        expect(screen.getByText('J')).toBeInTheDocument()
    })

    it('zobrazí zástupný text "Uživatel" a iniciálu z userName, pokud chybí jméno', () => {
        const userWithoutName = { ...mockUser, name: undefined }

        // Tady je ta změna: as unknown as User
        render(<ProfileHeader user={userWithoutName as unknown as User} />)

        expect(screen.getByText('Uživatel')).toBeInTheDocument()
        // Iniciála by měla být 'J' z 'jannovak'
        expect(screen.getByText('J')).toBeInTheDocument()
    })

    it('zobrazí výchozí iniciálu "U", pokud chybí jméno i userName', () => {
        const minimalUser = { id: 1 }

        // Tady také použijeme as unknown as User
        render(<ProfileHeader user={minimalUser as unknown as User} />)

        expect(screen.getByText('Uživatel')).toBeInTheDocument()
        expect(screen.getByText('U')).toBeInTheDocument()
    })
    
    it('nevykreslí email, pokud není k dispozici', () => {
        const userWithoutEmail = { ...mockUser, email: undefined }
        render(<ProfileHeader user={userWithoutEmail as User} />)

        // Zkontrolujeme, že se element s mailem nikde nenachází
        expect(screen.queryByText('jan@example.com')).not.toBeInTheDocument()
    })
})