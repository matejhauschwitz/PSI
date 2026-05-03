import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { BrowserRouter } from 'react-router-dom'
import Cart from './Cart'
import * as CartContext from '../context/CartContext'
import { orderService, userService } from '../services/api'
import { fireEvent } from '@testing-library/react'
import toast from 'react-hot-toast'

// --- Mock Setup ---
const mockNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom')
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    }
})

vi.mock('../services/api', () => ({
    userService: {
        getUserDetail: vi.fn(),
    },
    orderService: {
        createOrder: vi.fn(),
    },
}))

vi.mock('react-hot-toast', () => ({
    default: {
        error: vi.fn(),
        success: vi.fn(),
    },
}))

// We need to mock child components to simplify the main Cart tests
// and avoid dealing with their internal validation/rendering complexities in this scope
vi.mock('./CartItems', () => ({
    default: ({ items, onRemove }: any) => (
        <div data-testid="mock-cart-items">
            {items.map((i: any) => (
                <div key={i.id}>
                    {i.title} <button onClick={() => onRemove(i.id)}>Odstranit</button>
                </div>
            ))}
        </div>
    )
}))

vi.mock('./PaymentMethodSelector', () => ({
    default: ({ value, onChange }: any) => (
        <select data-testid="mock-payment" value={value} onChange={(e) => onChange(e.target.value)}>
            <option value="OnlineCard">Karta</option>
            <option value="Transfer">Převod</option>
            <option value="OnDelivery">Dobírka</option>
        </select>
    )
}))

vi.mock('./ShippingAddressForm', () => ({
    default: ({ address, onChange }: any) => (
        <div data-testid="mock-address-form">
            <input
                data-testid="street"
                value={address.streetAddress}
                onChange={(e) => onChange('streetAddress', e.target.value)}
            />
            <input
                data-testid="city"
                value={address.city}
                onChange={(e) => onChange('city', e.target.value)}
            />
            <input
                data-testid="zip"
                value={address.zip}
                onChange={(e) => onChange('zip', e.target.value)}
            />
            <input
                data-testid="country"
                value={address.country}
                onChange={(e) => onChange('country', e.target.value)}
            />
        </div>
    )
}))

vi.mock('./OrderSummary', () => ({
    default: ({ itemsCount, totalPrice, paymentMethod }: any) => (
        <div data-testid="mock-order-summary">
            Items: {itemsCount}, Total: {totalPrice}, Payment: {paymentMethod}
        </div>
    )
}))

describe('Cart Component', () => {
    const mockCartItems = [
        { id: 1, title: 'Book 1', price: 100 },
        { id: 2, title: 'Book 2', price: 200 },
    ]
    const mockClearCart = vi.fn()
    const mockRemoveFromCart = vi.fn()
    const mockGetCartTotal = vi.fn().mockReturnValue(300)

    const mockValidUser = {
        address: { streetAddress: 'Test 1', city: 'Test City', zip: '12345', country: 'CZ' },
        billingAddress: { streetAddress: 'Test 1' },
        isMale: true,
        birthDay: '2000-01-01',
        processData: true,
    }

    beforeEach(() => {
        vi.clearAllMocks()
        localStorage.clear()

        // Default Context Mock
        vi.spyOn(CartContext, 'useCart').mockReturnValue({
            cartItems: mockCartItems as any,
            removeFromCart: mockRemoveFromCart,
            clearCart: mockClearCart,
            getCartTotal: mockGetCartTotal,
            cartCount: 2,
            addToCart: vi.fn(),
        })
    })

    const renderCart = () => render(
        <BrowserRouter>
            <Cart />
        </BrowserRouter>
    )

    it('vykreslí prázdný košík, pokud neobsahuje položky[cite: 15]', () => {
        vi.spyOn(CartContext, 'useCart').mockReturnValue({
            cartItems: [],
            removeFromCart: mockRemoveFromCart,
            clearCart: mockClearCart,
            getCartTotal: () => 0,
            cartCount: 0,
            addToCart: vi.fn()
        })

        renderCart()
        expect(screen.getByText('Tvůj košík je prázdný.')).toBeInTheDocument()
        expect(screen.getByText('Pokračovat v nákupu')).toBeInTheDocument()
    })

    it('načte adresu uživatele do formuláře při mountování komponenty[cite: 15]', async () => {
        localStorage.setItem('jwt_token', 'fake-token')
        vi.mocked(userService.getUserDetail).mockResolvedValueOnce(mockValidUser as any)

        renderCart()

        await waitFor(() => {
            expect(userService.getUserDetail).toHaveBeenCalled()
            expect(screen.getByTestId('street')).toHaveValue('Test 1')
            expect(screen.getByTestId('city')).toHaveValue('Test City')
        })
    })

    it('zobrazí chybu, pokud uživatel není přihlášený při checkoutu[cite: 15]', async () => {
        const user = userEvent.setup()
        renderCart() // localStorage is clear

        // Fill minimum required local fields
        await user.click(screen.getByRole('checkbox')) // processData
        await user.type(screen.getByTestId('street'), 'A')
        await user.type(screen.getByTestId('city'), 'B')
        await user.type(screen.getByTestId('zip'), 'C')
        await user.type(screen.getByTestId('country'), 'D')

        const submitBtn = screen.getByText('Potvrdit nákup')
        await user.click(submitBtn)

        expect(toast.error).toHaveBeenCalledWith('Prosím přihlaš se pro nákup')
        expect(mockNavigate).toHaveBeenCalledWith('/auth')
    })

    it('zobrazí chybu, pokud chybí data v profilu, a přesměruje', async () => {
        localStorage.setItem('jwt_token', 'fake-token')
        const user = userEvent.setup()

        const invalidUser = { ...mockValidUser, billingAddress: null, isMale: undefined }
        // První volání v useEffectu, druhé uvnitř validateUserProfile
        vi.mocked(userService.getUserDetail)
            .mockResolvedValueOnce(invalidUser as any)
            .mockResolvedValueOnce(invalidUser as any)

        renderCart()

        // Nejdříve počkáme na dokončení useEffectu (načte se ulice)
        await waitFor(() => expect(screen.getByTestId('street')).toHaveValue('Test 1'))

        // Zkontrolujeme, jestli useEffect checkbox už zaškrtl (což by z mockValidUser měl)
        const checkbox = screen.getByRole('checkbox') as HTMLInputElement
        if (!checkbox.checked) {
            await user.click(checkbox)
        }

        const submitBtn = screen.getByText('Potvrdit nákup')
        await user.click(submitBtn)

        expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('fakturační adresa'))
        expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('pohlaví'))
        expect(mockNavigate).toHaveBeenCalledWith('/profile')
    })

    it('úspěšně vytvoří objednávku a přesměruje na potvrzení[cite: 15]', async () => {
        localStorage.setItem('jwt_token', 'fake-token')
        const user = userEvent.setup()

        vi.mocked(userService.getUserDetail).mockResolvedValue(mockValidUser as any)
        vi.mocked(orderService.createOrder).mockResolvedValueOnce({ data: 999 } as any)

        renderCart()

        // Form setup
        await waitFor(() => expect(screen.getByTestId('street')).toHaveValue('Test 1'))
        const checkbox = screen.getByRole('checkbox')
        // Wait for the useEffect to set it to true from mockValidUser, if it didn't, click it
        await waitFor(() => {
            if (!(checkbox as HTMLInputElement).checked) {
                fireEvent.click(checkbox)
            }
        })

        const submitBtn = screen.getByText('Potvrdit nákup')
        await user.click(submitBtn)

        // Verification
        expect(orderService.createOrder).toHaveBeenCalledWith({
            bookIds: [1, 2],
            paymentMethod: 3, // 3 is OnlineCard mapping
        })

        expect(mockClearCart).toHaveBeenCalled()

        expect(mockNavigate).toHaveBeenCalledWith('/order-confirmation', {
            replace: true,
            state: {
                order: {
                    id: 999,
                    bookIds: [1, 2],
                    paymentMethod: 'OnlineCard',
                    status: 'Pending',
                    totalPrice: 303, // 300 * 1.01 (OnlineCard surcharge logic in component)
                }
            }
        })
    })

    it('odebere položku při kliknutí na odstranit v child komponentě[cite: 15]', async () => {
        const user = userEvent.setup()
        renderCart()

        const removeButtons = screen.getAllByText('Odstranit')
        await user.click(removeButtons[0]) // Remove first book (id: 1)

        expect(mockRemoveFromCart).toHaveBeenCalledWith(1)
    })

    it('zachytí chybu v useEffectu při selhání API pro adresu (řádek 48)', async () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });
        localStorage.setItem('jwt_token', 'fake-token');
        vi.mocked(userService.getUserDetail).mockRejectedValueOnce(new Error('API Error'));

        renderCart();

        await waitFor(() => {
            expect(consoleSpy).toHaveBeenCalledWith('Error loading user address:', expect.any(Error));
        });
        consoleSpy.mockRestore();
    });

    it('zobrazí chybu, pokud je adresa neúplná při checkoutu (řádky 61-62, 115-116)', async () => {
        const user = userEvent.setup();
        localStorage.setItem('jwt_token', 'fake-token');
        vi.mocked(userService.getUserDetail).mockResolvedValue(mockValidUser as any);

        renderCart();
        await waitFor(() => expect(screen.getByTestId('street')).toHaveValue('Test 1'));

        // Vymažeme jedno povinné pole
        await user.clear(screen.getByTestId('city'));

        const submitBtn = screen.getByText('Potvrdit nákup');
        await user.click(submitBtn);

        expect(toast.error).toHaveBeenCalledWith('Prosím vyplň všechny údaje o adrese');
    });

    it('zobrazí chybu, pokud není zaškrtnut souhlas se zpracováním dat (řádky 105-106)', async () => {
        const user = userEvent.setup();
        localStorage.setItem('jwt_token', 'fake-token');
        // Uživatel, který v profilu nemá souhlas
        vi.mocked(userService.getUserDetail).mockResolvedValue({ ...mockValidUser, processData: false } as any);

        renderCart();
        await waitFor(() => expect(screen.getByTestId('street')).toHaveValue('Test 1'));

        // Pokud by byl checkbox náhodou zaškrtnut, odškrtneme ho
        const checkbox = screen.getByRole('checkbox') as HTMLInputElement;
        if (checkbox.checked) await user.click(checkbox);

        const submitBtn = screen.getByText('Potvrdit nákup');
        await user.click(submitBtn);

        expect(toast.error).toHaveBeenCalledWith('Prosím souhlaste se zpracováním osobních údajů');
    });

    it('zobrazí toast chybu, pokud selže vytvoření objednávky na straně serveru (řádky 162-165)', async () => {
        const user = userEvent.setup();
        localStorage.setItem('jwt_token', 'fake-token');
        vi.mocked(userService.getUserDetail).mockResolvedValue(mockValidUser as any);

        // Simulace chyby s response zprávou
        vi.mocked(orderService.createOrder).mockRejectedValueOnce({
            response: { data: { message: 'Chyba serveru při platbě' } }
        });

        renderCart();
        await waitFor(() => expect(screen.getByTestId('street')).toHaveValue('Test 1'));

        const submitBtn = screen.getByText('Potvrdit nákup');
        await user.click(submitBtn);

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('Chyba serveru při platbě');
        });
    });

    it('přesměruje na hlavní stránku při kliknutí na tlačítko v prázdném košíku (řádek 179)', async () => {
        const user = userEvent.setup();
        vi.spyOn(CartContext, 'useCart').mockReturnValue({
            cartItems: [],
            removeFromCart: vi.fn(),
            clearCart: vi.fn(),
            getCartTotal: () => 0,
            cartCount: 0,
            addToCart: vi.fn()
        });

        renderCart();
        const backBtn = screen.getByText('Pokračovat v nákupu');
        await user.click(backBtn);

        expect(mockNavigate).toHaveBeenCalledWith('/');
    });

    it('pokryje různé platební metody pro výpočet dopravy (řádky 132-143)', async () => {
        const user = userEvent.setup();
        localStorage.setItem('jwt_token', 'fake-token');
        vi.mocked(userService.getUserDetail).mockResolvedValue(mockValidUser as any);
        vi.mocked(orderService.createOrder).mockResolvedValue({ data: 777 } as any);

        renderCart();
        await waitFor(() => expect(screen.getByTestId('street')).toHaveValue('Test 1'));

        const paymentSelect = screen.getByTestId('mock-payment');

        // Test Dobírky (OnDelivery - přidává 50 Kč)
        await user.selectOptions(paymentSelect, 'OnDelivery');
        await user.click(screen.getByText('Potvrdit nákup'));
        expect(mockNavigate).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
            state: { order: expect.objectContaining({ totalPrice: 350 }) } // 300 + 50
        }));

        // Test Převodu (Transfer - cena beze změny)
        await user.selectOptions(paymentSelect, 'Transfer');
        await user.click(screen.getByText('Potvrdit nákup'));
        expect(mockNavigate).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
            state: { order: expect.objectContaining({ totalPrice: 300 }) }
        }));
    });
})