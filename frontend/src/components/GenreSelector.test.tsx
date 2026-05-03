// GenreSelector.test.tsx
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import GenreSelector from './GenreSelector'

describe('GenreSelector', () => {
  const genres = ['Sci-fi', 'Fantasy', 'Horor', 'Drama']

  it('vykreslí všechny dostupné žánry a označí ty vybrané', () => {
    render(
      <GenreSelector 
        genres={genres} 
        selected={['Fantasy', 'Drama']} 
        onToggle={vi.fn()} 
      />
    )

    expect(screen.getByText('Sci-fi')).toBeInTheDocument()
    
    // Vybrané mají prefix (předponu) s checkmarkem a mezerou
    expect(screen.getByText('✓ Fantasy')).toBeInTheDocument()
    expect(screen.getByText('✓ Drama')).toBeInTheDocument()
    
    // Zkontrolujeme stylování (částečně, podle classy) - Fantasy má např bg-blue-600
    const fantasyBtn = screen.getByText('✓ Fantasy')
    expect(fantasyBtn).toHaveClass('bg-blue-600')
  })

  it('zavolá onToggle se správným žánrem při kliknutí', async () => {
    const mockOnToggle = vi.fn()
    const user = userEvent.setup()

    render(
      <GenreSelector 
        genres={genres} 
        selected={[]} 
        onToggle={mockOnToggle} 
      />
    )

    const scifiButton = screen.getByText('Sci-fi')
    await user.click(scifiButton)

    expect(mockOnToggle).toHaveBeenCalledTimes(1)
    expect(mockOnToggle).toHaveBeenCalledWith('Sci-fi')
  })
})