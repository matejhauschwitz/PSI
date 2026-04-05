import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { CreditCard } from 'lucide-react'
import toast from 'react-hot-toast'
import { useCart } from '../context/CartContext'
import { orderService, userService } from '../services/api'
import CartItems from './CartItems'
import PaymentMethodSelector from './PaymentMethodSelector'
import ShippingAddressForm, { type ShippingAddress } from './ShippingAddressForm'
import OrderSummary from './OrderSummary'
import type { Order } from '../types'

export default function Cart() {
  const navigate = useNavigate()
  const { cartItems, removeFromCart, clearCart, getCartTotal } = useCart()
  const [loading, setLoading] = useState(false)
  const [address, setAddress] = useState<ShippingAddress>({
    streetAddress: '',
    city: '',
    zip: '',
    country: '',
  })
  const [paymentMethod, setPaymentMethod] = useState('OnlineCard')

  const totalPrice = getCartTotal()

  const handleRemove = (bookId: number) => {
    removeFromCart(bookId)
  }

  const validateAddress = (): boolean => {
    if (!address.streetAddress || !address.city || !address.zip || !address.country) {
      toast.error('Prosím vyplň všechny údaje o adrese')
      return false
    }
    return true
  }

  const validateUserProfile = async (): Promise<boolean> => {
    const user = await userService.getUserDetail()
    const missingData: string[] = []

    if (!user.address?.streetAddress) missingData.push('domovní adresa')
    if (!user.billingAddress?.streetAddress) missingData.push('fakturační adresa')
    if (user.isMale === undefined || user.isMale === null) missingData.push('pohlaví')
    if (!user.birthDay) missingData.push('datum narození')
    if (!user.processData) missingData.push('souhlas se zpracováním dat')

    if (missingData.length > 0) {
      const message = `Prosím doplň v profilu: ${missingData.join(', ')}`
      toast.error(message)
      navigate('/profile')
      return false
    }
    return true
  }

  const getPaymentMethodValue = (): number => {
    const paymentMethodMap: { [key: string]: number } = {
      OnlineCard: 3,
      Transfer: 2,
      OnDelivery: 1,
    }
    return paymentMethodMap[paymentMethod]
  }

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault()

    if (cartItems.length === 0) {
      toast.error('Košík je prázdný')
      return
    }

    if (!validateAddress()) return

    const token = localStorage.getItem('jwt_token')
    if (!token) {
      toast.error('Prosím přihlaš se pro nákup')
      navigate('/auth')
      return
    }

    setLoading(true)

    try {
      if (!(await validateUserProfile())) {
        setLoading(false)
        return
      }

      const response = await orderService.createOrder({
        bookIds: cartItems.map(item => item.id || 0),
        paymentMethod: getPaymentMethodValue(),
      } as unknown as Order)

      const orderId = response.data
      clearCart()

      const order: Order = {
        id: orderId,
        bookIds: cartItems.map(item => item.id || 0),
        paymentMethod: paymentMethod,
        totalPrice: totalPrice,
        status: 'Pending',
      }

      navigate('/order-confirmation', {
        state: { order },
        replace: true,
      })
    } catch (error: any) {
      console.error('Checkout failed:', error)
      const errorMessage =
        error.response?.data?.message || error.message || 'Nákup se nezdařil. Zkus to prosím znovu.'
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-stone-900 mb-8">Tvůj Košík</h1>

      {cartItems.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-stone-200 p-12 text-center">
          <p className="text-stone-500 text-lg mb-6">Tvůj košík je prázdný.</p>
          <button
            onClick={() => navigate('/')}
            className="bg-emerald-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
          >
            Pokračovat v nákupu
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Položky v košíku */}
          <div className="lg:col-span-2">
            <CartItems items={cartItems} onRemove={handleRemove} />
          </div>

          {/* Souhrn objednávky a formulář */}
          <div>
            <div className="bg-white rounded-lg shadow-sm border border-stone-200 p-6 sticky top-24">
              <h2 className="text-xl font-bold text-stone-900 mb-6">Souhrn Objednávky</h2>

              <OrderSummary itemsCount={cartItems.length} totalPrice={totalPrice} />

              <form onSubmit={handleCheckout} className="space-y-6">
                <PaymentMethodSelector value={paymentMethod} onChange={setPaymentMethod} />

                <ShippingAddressForm
                  address={address}
                  onChange={(field, value) => setAddress({ ...address, [field]: value })}
                />

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex items-center justify-center gap-2 bg-stone-900 hover:bg-black text-white px-6 py-4 rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <CreditCard className="h-5 w-5" />
                  {loading ? 'Zpracování...' : 'Potvrdit nákup'}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
