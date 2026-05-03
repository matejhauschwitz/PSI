import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { MemoryRouter } from 'react-router-dom'
import AdminPage from './AdminPage'
import { adminService } from '../services/adminService'
import toast from 'react-hot-toast'

// --- MOCKY ---
const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
    const actual = await vi.importActual('react-router-dom')
    return {
        ...actual,
        useNavigate: () => mockNavigate,
    }
})

// Místo vi.mock pro adminService používáme dole bezpečnější vi.spyOn

vi.mock('react-hot-toast', () => ({
    default: {
        success: vi.fn(),
        error: vi.fn(),
    },
}))

vi.mock('../components/UserForm', () => ({
    default: ({ onSubmit, onCancel }: any) => (
        <div data-testid="user-form-mock">
            <button onClick={() => onSubmit({ userName: 'test' })}>Submit New</button>
            <button onClick={onCancel}>Cancel</button>
        </div>
    )
}))

vi.mock('../components/BookForm', () => ({
    default: ({ onSubmit }: any) => (
        <div data-testid="book-form-mock">
            <button onClick={() => onSubmit({ title: 'Kniha' })}>Submit New</button>
        </div>
    )
}))

describe('AdminPage', () => {
    const user = userEvent.setup()

    beforeEach(() => {
        vi.clearAllMocks()
        vi.spyOn(window, 'confirm').mockImplementation(() => true)

        // --- vi.spyOn MÍSTO vi.mocked ---
        // Tímto bezpečně podvrhneme metody přímo na naimportovaném objektu
        vi.spyOn(adminService, 'getUsers').mockResolvedValue([
            { id: 1, userName: 'admin', name: 'Admin', email: 'a@a.cz', role: 1 }
        ])
        vi.spyOn(adminService, 'getOrders').mockResolvedValue([
            { id: 101, userName: 'user', totalPrice: 500, status: 0, created: '2026-05-01T10:00:00Z' }
        ])
        vi.spyOn(adminService, 'getBooks').mockResolvedValue([
            { id: 201, title: 'Kniha', authors: 'Autor', price: 300, isbn13: '123456789' }
        ])
        vi.spyOn(adminService, 'getAuditLogs').mockResolvedValue([
            { id: 301, userName: 'admin', logType: 1, createdDate: '2026-05-01T10:00:00Z' }
        ])

        // Musíme podvrhnout i akce, aby se při testech nevolalo reálné API a test nespadl
        vi.spyOn(adminService, 'deleteUser').mockResolvedValue(undefined)
        vi.spyOn(adminService, 'deleteOrder').mockResolvedValue(undefined)
        vi.spyOn(adminService, 'deleteBook').mockResolvedValue(undefined)
        vi.spyOn(adminService, 'updateOrderStatus').mockResolvedValue(undefined)
        vi.spyOn(adminService, 'createUser').mockResolvedValue(undefined)
        vi.spyOn(adminService, 'updateUser').mockResolvedValue(undefined)
        vi.spyOn(adminService, 'createBook').mockResolvedValue(undefined)
        vi.spyOn(adminService, 'updateBook').mockResolvedValue(undefined)
    })

    const renderComponent = () => render(
        <MemoryRouter>
            <AdminPage />
        </MemoryRouter>
    )

    it('přesměruje na domovskou stránku, pokud selže ověření admina', async () => {
        vi.spyOn(adminService, 'getUsers').mockRejectedValueOnce(new Error('Unauthorized'))
        renderComponent()

        await waitFor(() => {
            expect(mockNavigate).toHaveBeenCalledWith('/')
        })
    })

    it('načte a zobrazí uživatele ve výchozím stavu (Users tab)', async () => {
        renderComponent()

        expect(screen.getByText('Administrace')).toBeInTheDocument()
        await waitFor(() => {
            expect(screen.getByText('admin')).toBeInTheDocument()
            expect(screen.getByText('a@a.cz')).toBeInTheDocument()
        })
    })

    it('přepíná taby a načítá správná data', async () => {
        renderComponent()

        await user.click(screen.getByText('Objednávky'))
        await waitFor(() => {
            expect(adminService.getOrders).toHaveBeenCalled()
            expect(screen.getByText('101')).toBeInTheDocument()
        })

        await user.click(screen.getByText('Knihy'))
        await waitFor(() => {
            expect(adminService.getBooks).toHaveBeenCalled()
            expect(screen.getByText('Kniha')).toBeInTheDocument()
        })

        await user.click(screen.getByText('Audit Log'))
        await waitFor(() => {
            expect(adminService.getAuditLogs).toHaveBeenCalled()
            expect(screen.getByText('301')).toBeInTheDocument()
        })
    })

    it('smaže uživatele po potvrzení', async () => {
        renderComponent()

        await waitFor(() => screen.getByText('admin'))

        const deleteBtns = screen.getAllByText('Smazat')
        await user.click(deleteBtns[0])

        expect(window.confirm).toHaveBeenCalledWith('Opravdu chcete smazat?')
        expect(adminService.deleteUser).toHaveBeenCalledWith(1)
        await waitFor(() => {
            expect(toast.success).toHaveBeenCalledWith('Odstraněno')
        })
    })

    it('nezavolá smazání, pokud uživatel nepotvrdí dialog', async () => {
        vi.spyOn(window, 'confirm').mockImplementation(() => false)
        renderComponent()

        await waitFor(() => screen.getByText('admin'))

        const deleteBtns = screen.getAllByText('Smazat')
        await user.click(deleteBtns[0])

        expect(adminService.deleteUser).not.toHaveBeenCalled()
    })

    it('zobrazí chybový toast, pokud API pro smazání selže', async () => {
        vi.spyOn(adminService, 'deleteUser').mockRejectedValueOnce(new Error('Network error'))
        renderComponent()

        await waitFor(() => screen.getByText('admin'))
        const deleteBtns = screen.getAllByText('Smazat')
        await user.click(deleteBtns[0])

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('Chyba při odstraňování')
        })
    })

    it('změní status objednávky', async () => {
        renderComponent()
        await user.click(screen.getByText('Objednávky'))

        let selects: HTMLElement[] = []
        await waitFor(() => {
            selects = screen.getAllByRole('combobox')
            expect(selects.length).toBeGreaterThan(0)
        })

        await user.selectOptions(selects[0], '2')

        expect(adminService.updateOrderStatus).toHaveBeenCalledWith(101, 2)
        await waitFor(() => {
            expect(toast.success).toHaveBeenCalledWith('Status aktualizován')
        })
    })

    it('filtruje audit logy po kliknutí na tlačítko Filtrovat', async () => {
        renderComponent()
        await user.click(screen.getByText('Audit Log'))

        await waitFor(() => {
            expect(screen.getByPlaceholderText('Filtrovat userName...')).toBeInTheDocument()
        })

        await user.type(screen.getByPlaceholderText('Filtrovat userName...'), 'testuser')
        await user.click(screen.getByText('Filtrovat'))

        await waitFor(() => {
            expect(adminService.getAuditLogs).toHaveBeenCalledWith('', 'testuser', '', '')
        })
    })

    it('otevře detail audit logu a zobrazí zformátovaný JSON', async () => {
        renderComponent();

        const auditTab = screen.getByRole('button', { name: /Audit Log/i });
        await user.click(auditTab);

        const table = await screen.findByRole('table');

        const rows = within(table).getAllByRole('row');
        
        await user.click(rows[1]);

        await waitFor(() => {
            expect(screen.getByText(/Detail auditu/i)).toBeInTheDocument();
        });

        expect(screen.getByText(/Nové hodnoty/i)).toBeInTheDocument();
    });

    it('smaže objednávku a knihu po potvrzení', async () => {
        renderComponent();

        // Čekáme na zmizení loadingu a vykreslení tabulky
        await waitFor(() => expect(screen.queryByText('Načítám...')).not.toBeInTheDocument());

        // Smazání objednávky
        await user.click(screen.getByRole('button', { name: 'Objednávky' }));
        await waitFor(() => expect(screen.getByText('101')).toBeInTheDocument());
        const deleteOrderBtn = screen.getAllByText('Smazat')[0];
        await user.click(deleteOrderBtn);
        expect(adminService.deleteOrder).toHaveBeenCalledWith(101);

        // Smazání knihy
        await user.click(screen.getByRole('button', { name: 'Knihy' }));
        await waitFor(() => expect(screen.getByText('Kniha')).toBeInTheDocument());
        const deleteBookBtn = screen.getAllByText('Smazat')[0];
        await user.click(deleteBookBtn);
        expect(adminService.deleteBook).toHaveBeenCalledWith(201);
    });

    it('otevře modal pro přidání uživatele', async () => {
        renderComponent()
        await waitFor(() => screen.getByText('admin'))

        await user.click(screen.getByRole('button', { name: 'Přidat uživatele' }))

        expect(screen.getByTestId('user-form-mock')).toBeInTheDocument()
        expect(screen.getByRole('heading', { name: 'Přidat uživatele' })).toBeInTheDocument()
    })

    it('přidá nového uživatele a zobrazí success toast', async () => {
        renderComponent()
        await waitFor(() => screen.getByText('admin'))

        await user.click(screen.getByRole('button', { name: 'Přidat uživatele' }))
        await user.click(screen.getByText('Submit New'))

        expect(adminService.createUser).toHaveBeenCalledWith({ userName: 'test' })
        await waitFor(() => {
            expect(toast.success).toHaveBeenCalledWith('Uživatel přidán')
        })
    })

    it('zobrazí chybový toast při selhání přidání uživatele', async () => {
        vi.spyOn(adminService, 'createUser').mockRejectedValueOnce(new Error('Error'))
        renderComponent()
        await waitFor(() => screen.getByText('admin'))

        await user.click(screen.getByRole('button', { name: 'Přidat uživatele' }))
        await user.click(screen.getByText('Submit New'))

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('Chyba při ukládání uživatele')
        })
    })

    it('zavře modal po kliknutí na Cancel ve formuláři uživatele', async () => {
        renderComponent()
        await waitFor(() => screen.getByText('admin'))

        await user.click(screen.getByRole('button', { name: 'Přidat uživatele' }))
        expect(screen.getByTestId('user-form-mock')).toBeInTheDocument()

        await user.click(screen.getByText('Cancel'))

        await waitFor(() => {
            expect(screen.queryByTestId('user-form-mock')).not.toBeInTheDocument()
        })
    })

    it('otevře editační modal uživatele po kliknutí na řádek', async () => {
        renderComponent()
        await waitFor(() => screen.getByText('admin'))

        await user.click(screen.getByText('admin'))

        await waitFor(() => {
            expect(screen.getByRole('heading', { name: 'Upravit uživatele' })).toBeInTheDocument()
            expect(screen.getByTestId('user-form-mock')).toBeInTheDocument()
        })
    })

    it('zavře modal klávesou Escape', async () => {
        renderComponent()
        await waitFor(() => screen.getByText('admin'))

        await user.click(screen.getByRole('button', { name: 'Přidat uživatele' }))
        expect(screen.getByTestId('user-form-mock')).toBeInTheDocument()

        await user.keyboard('{Escape}')

        await waitFor(() => {
            expect(screen.queryByTestId('user-form-mock')).not.toBeInTheDocument()
        })
    })

    it('otevře modal pro přidání knihy', async () => {
        renderComponent()
        await user.click(screen.getByRole('button', { name: 'Knihy' }))
        await waitFor(() => screen.getByText('Kniha'))

        await user.click(screen.getByRole('button', { name: 'Přidat knihu' }))

        expect(screen.getByTestId('book-form-mock')).toBeInTheDocument()
        expect(screen.getByRole('heading', { name: 'Přidat knihu' })).toBeInTheDocument()
    })

    it('přidá novou knihu a zobrazí success toast', async () => {
        renderComponent()
        await user.click(screen.getByRole('button', { name: 'Knihy' }))
        await waitFor(() => screen.getByText('Kniha'))

        await user.click(screen.getByRole('button', { name: 'Přidat knihu' }))
        await user.click(screen.getByText('Submit New'))

        expect(adminService.createBook).toHaveBeenCalledWith({ title: 'Kniha' })
        await waitFor(() => {
            expect(toast.success).toHaveBeenCalledWith('Kniha přidána')
        })
    })

    it('zobrazí chybový toast při selhání přidání knihy', async () => {
        vi.spyOn(adminService, 'createBook').mockRejectedValueOnce(new Error('Error'))
        renderComponent()
        await user.click(screen.getByRole('button', { name: 'Knihy' }))
        await waitFor(() => screen.getByText('Kniha'))

        await user.click(screen.getByRole('button', { name: 'Přidat knihu' }))
        await user.click(screen.getByText('Submit New'))

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('Chyba při ukládání knihy')
        })
    })

    it('otevře editační modal knihy po kliknutí na řádek', async () => {
        renderComponent()
        await user.click(screen.getByRole('button', { name: 'Knihy' }))
        await waitFor(() => screen.getByText('Kniha'))

        await user.click(screen.getByText('Kniha'))

        await waitFor(() => {
            expect(screen.getByRole('heading', { name: 'Upravit knihu' })).toBeInTheDocument()
            expect(screen.getByTestId('book-form-mock')).toBeInTheDocument()
        })
    })

    it('zobrazí chybový toast při selhání aktualizace statusu objednávky', async () => {
        vi.spyOn(adminService, 'updateOrderStatus').mockRejectedValueOnce(new Error('Error'))
        renderComponent()
        await user.click(screen.getByRole('button', { name: 'Objednávky' }))

        let selects: HTMLElement[] = []
        await waitFor(() => {
            selects = screen.getAllByRole('combobox')
            expect(selects.length).toBeGreaterThan(0)
        })

        await user.selectOptions(selects[0], '2')

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('Chyba při aktualizaci statusu')
        })
    })

    it('zobrazí chybový toast při selhání načítání dat', async () => {
        vi.spyOn(adminService, 'getOrders').mockRejectedValueOnce(new Error('Error'))
        renderComponent()
        await user.click(screen.getByRole('button', { name: 'Objednávky' }))

        await waitFor(() => {
            expect(toast.error).toHaveBeenCalledWith('Chyba při načítání dat')
        })
    })

    it('zobrazí role uživatelů správně', async () => {
        vi.spyOn(adminService, 'getUsers').mockResolvedValue([
            { id: 1, userName: 'admin', name: 'Admin User', email: 'a@a.cz', role: 1 },
            { id: 2, userName: 'normaluser', name: 'Regular User', email: 'u@u.cz', role: 0 },
        ])
        renderComponent()

        await waitFor(() => {
            expect(screen.getByText('Admin')).toBeInTheDocument()
            expect(screen.getByText('User')).toBeInTheDocument()
        })
    })

    it('zobrazí správně formátovanou cenu v tabulce objednávek', async () => {
        renderComponent()
        await user.click(screen.getByRole('button', { name: 'Objednávky' }))

        await waitFor(() => {
            expect(screen.getByText('500.00 Kč')).toBeInTheDocument()
        })
    })

    it('zobrazí audit log detail s parsovanými JSON hodnotami', async () => {
        vi.spyOn(adminService, 'getAuditLogs').mockResolvedValue([
            {
                id: 301,
                userName: 'admin',
                logType: 1,
                createdDate: '2026-05-01T10:00:00Z',
                original: '{"name":"Old"}',
                updated: '{"name":"New"}',
            }
        ])
        renderComponent()
        await user.click(screen.getByRole('button', { name: 'Audit Log' }))

        const table = await screen.findByRole('table')
        const rows = within(table).getAllByRole('row')
        await user.click(rows[1])

        await waitFor(() => {
            expect(screen.getByText(/Původní hodnoty/i)).toBeInTheDocument()
            expect(screen.getByText(/Nové hodnoty/i)).toBeInTheDocument()
        })
    })

    it('zobrazí "Žádná data" v audit logu, pokud original a updated jsou prázdné', async () => {
        vi.spyOn(adminService, 'getAuditLogs').mockResolvedValue([
            { id: 302, userName: 'admin', logType: 1, createdDate: '2026-05-01T10:00:00Z' }
        ])
        renderComponent()
        await user.click(screen.getByRole('button', { name: 'Audit Log' }))

        const table = await screen.findByRole('table')
        const rows = within(table).getAllByRole('row')
        await user.click(rows[1])

        await waitFor(() => {
            expect(screen.getAllByText('Žádná data').length).toBeGreaterThanOrEqual(2)
        })
    })
})