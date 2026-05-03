// StatsBanner.test.tsx
import { render, screen } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import StatsBanner from './StatsBanner'

describe('StatsBanner', () => {
    it('zobrazí statistiky se správným formátováním čísel, když není načítání', () => {
        render(
            <StatsBanner
                totalBooks={12345}
                totalGenres={50}
                totalUsers={9876543}
                loading={false}
            />
        )

        // formátování přidává oddělovače tisíců (záleží na locales, ale '12 345' nebo '12,345' atp.)
        // Místo přesného formátu můžeme hledat část nebo se spolehnout na to string conversion
        const bookStat = screen.getByText((12345).toLocaleString())
        const userStat = screen.getByText((9876543).toLocaleString())
        
        expect(bookStat).toBeInTheDocument()
        expect(screen.getByText('50')).toBeInTheDocument()
        expect(userStat).toBeInTheDocument()

        expect(screen.getByText('Knih v katalogu')).toBeInTheDocument()
    })

    it('zobrazí zástupné znaky (pomlčky) během načítání', () => {
        render(
            <StatsBanner
                totalBooks={100}
                totalGenres={10}
                totalUsers={1000}
                loading={true}
            />
        )

        // Měli by tam být 3 pomlčky
        const placeholders = screen.getAllByText('—')
        expect(placeholders).toHaveLength(3)

        // Neměly by tam být konkrétní hodnoty
        expect(screen.queryByText('100')).not.toBeInTheDocument()
    })
})