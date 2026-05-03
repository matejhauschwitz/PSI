import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi } from 'vitest'
import BookDetailHeader from './BookDetailHeader'
import { BrowserRouter } from 'react-router-dom'
import type { Book } from '../types'

// Mock the react-router-dom hook
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('BookDetailHeader', () => {
  const mockBook: Book = {
    id: 1,
    title: 'Test Title',
    author: 'Test Author',
    description: 'Test Description',
    price: 250,
    genre: 'Fantasy',
    rating: 4.5,
    totalRatings: 100,
    publicationYear: 2023,
    pageCount: 300,
    coverImageUrl: 'http://test.com/image.jpg'
  }

  // Helper to wrap component in router because of useNavigate usage[cite: 11]
  const renderWithRouter = (ui: React.ReactElement) => {
    return render(<BrowserRouter>{ui}</BrowserRouter>)
  }

  it('renders all book details correctly', () => {
    renderWithRouter(
      <BookDetailHeader
        book={mockBook}
        isFavourite={false}
        onToggleFavourite={vi.fn()}
        onAddToCart={vi.fn()}
        isAuthenticated={true}
      />
    )

    expect(screen.getByText('Test Title')).toBeInTheDocument()
    expect(screen.getByText('od Test Author')).toBeInTheDocument()
    expect(screen.getByText('Test Description')).toBeInTheDocument()
    expect(screen.getByText('250 Kč')).toBeInTheDocument()
    expect(screen.getByText('Fantasy')).toBeInTheDocument()
    expect(screen.getByText('4.5')).toBeInTheDocument()
    expect(screen.getByText('(100)')).toBeInTheDocument()
    expect(screen.getByText('2023')).toBeInTheDocument()
    expect(screen.getByText('300')).toBeInTheDocument()
    
    const image = screen.getByRole('img', { name: 'Test Title' })
    expect(image).toHaveAttribute('src', 'http://test.com/image.jpg')
  })

  it('renders fallback when cover image is missing', () => {
    const bookWithoutImage = { ...mockBook, coverImageUrl: undefined }
    renderWithRouter(
      <BookDetailHeader
        book={bookWithoutImage}
        isFavourite={false}
        onToggleFavourite={vi.fn()}
        onAddToCart={vi.fn()}
        isAuthenticated={true}
      />
    )

    expect(screen.getByText('Bez obálky')).toBeInTheDocument()
    expect(screen.queryByRole('img')).not.toBeInTheDocument()
  })

  it('calls onToggleFavourite when heart button is clicked', async () => {
    const mockToggle = vi.fn()
    const user = userEvent.setup()
    
    renderWithRouter(
      <BookDetailHeader
        book={mockBook}
        isFavourite={false}
        onToggleFavourite={mockToggle}
        onAddToCart={vi.fn()}
        isAuthenticated={true}
      />
    )

    // The button doesn't have text, but we can find it contextually or by the icon inside it. 
    // In this case, we'll grab the button containing the Heart icon (it's the only button without text besides 'Zpět na knihy')
    const buttons = screen.getAllByRole('button')
    // buttons[0] is 'Zpět na knihy', buttons[1] is the heart button
    await user.click(buttons[1])

    expect(mockToggle).toHaveBeenCalledTimes(1)
  })

  it('shows "Do košíku" button when authenticated and calls onAddToCart', async () => {
    const mockAdd = vi.fn()
    const user = userEvent.setup()
    
    renderWithRouter(
      <BookDetailHeader
        book={mockBook}
        isFavourite={false}
        onToggleFavourite={vi.fn()}
        onAddToCart={mockAdd}
        isAuthenticated={true} // Authenticated user
      />
    )

    const cartButton = screen.getByText('Do košíku')
    expect(cartButton).toBeInTheDocument()
    
    await user.click(cartButton)
    expect(mockAdd).toHaveBeenCalledTimes(1)
  })

  it('shows "Pro nákup se přihlašte" when not authenticated and navigates to login', async () => {
    const user = userEvent.setup()
    
    renderWithRouter(
      <BookDetailHeader
        book={mockBook}
        isFavourite={false}
        onToggleFavourite={vi.fn()}
        onAddToCart={vi.fn()}
        isAuthenticated={false} // Unauthenticated user
      />
    )

    const loginButton = screen.getByText('Pro nákup se přihlašte')
    expect(loginButton).toBeInTheDocument()
    
    await user.click(loginButton)
    expect(mockNavigate).toHaveBeenCalledWith('/login')
  })

  it('navigates back when "Zpět na knihy" is clicked', async () => {
    const user = userEvent.setup()
    
    renderWithRouter(
      <BookDetailHeader
        book={mockBook}
        isFavourite={false}
        onToggleFavourite={vi.fn()}
        onAddToCart={vi.fn()}
        isAuthenticated={true}
      />
    )

    const backButton = screen.getByText('Zpět na knihy')
    await user.click(backButton)
    
    expect(mockNavigate).toHaveBeenCalledWith(-1)
  })
})