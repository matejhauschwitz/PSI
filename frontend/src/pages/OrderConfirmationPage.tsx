import { useEffect, useState } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { CheckCircle, Package, MapPin, CreditCard, Calendar, ArrowRight } from 'lucide-react'
import { orderService } from '../services/api'
import { Order } from '../types'

export default function OrderConfirmationPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const { orderId } = useParams<{ orderId: string }>()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Pokud máme state z navigace, použij ho
    const state = location.state as { order?: Order } | null
    if (state?.order) {
      setOrder(state.order)
      setLoading(false)
      return
    }

    // Jinak se pokus načíst objednávku z backend
    const fetchOrder = async () => {
      try {
        const orders = await orderService.getOrders()
        // Najdi poslední objednávku
        if (orders && orders.length > 0) {
          setOrder(orders[orders.length - 1])
        }
      } catch (error) {
        console.error('Failed to load order:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchOrder()
  }, [orderId])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-stone-600">Načítání potvrzení objednávky...</div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 mb-6 text-lg">Objednávka se nepodařila načíst</div>
          <button
            onClick={() => navigate('/books')}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
          >
            Zpět na knihy
          </button>
        </div>
      </div>
    )
  }

  const currentDate = new Date().toLocaleDateString('cs-CZ', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

  // Mapuj enum cisla na nazvy
  const getPaymentMethodName = (method: string | number) => {
    const methodMap: { [key: string]: string } = {
      '1': '📦 Platba při Doručení',
      '2': '🏦 Bankovní Převod',
      '3': '💳 Karta (Online)',
      OnDelivery: '📦 Platba při Doručení',
      Transfer: '🏦 Bankovní Převod',
      OnlineCard: '💳 Karta (Online)',
    }
    return methodMap[method] || method
  }

  return (
    <div className="max-w-2xl mx-auto">
      {/* Úspěšné potvrzení */}
      <div className="bg-white rounded-lg shadow-sm border border-stone-200 p-8 mb-8 text-center">
        <div className="flex justify-center mb-6">
          <div className="bg-green-100 rounded-full p-4">
            <CheckCircle className="h-16 w-16 text-green-600" />
          </div>
        </div>

        <h1 className="text-3xl font-bold text-stone-900 mb-2">Objednávka Potvrzena! ✓</h1>
        <p className="text-stone-600 mb-6">
          Děkujeme za tvůj nákup. Tvá objednávka byla úspěšně vytvořena.
        </p>

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <p className="text-blue-900">
            <span className="font-semibold">Číslo objednávky:</span> #{order.id || 'N/A'}
          </p>
        </div>
      </div>

      {/* Detaily objednávky */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {/* Doručení */}
        <div className="bg-white rounded-lg shadow-sm border border-stone-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <MapPin className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-bold text-stone-900">Doručovací Údaje</h2>
          </div>
          <div className="space-y-2 text-stone-600">
            <p>
              <span className="font-medium text-stone-900">Stanovený čas doručení:</span>
              <br />
              3-5 pracovních dní
            </p>
            <p className="text-sm text-stone-500 mt-4">
              Sledování objednávky bude brzy k dispozici v tvém profilu.
            </p>
          </div>
        </div>

        {/* Metoda Platby */}
        <div className="bg-white rounded-lg shadow-sm border border-stone-200 p-6">
          <div className="flex items-center gap-3 mb-4">
            <CreditCard className="h-6 w-6 text-blue-600" />
            <h2 className="text-xl font-bold text-stone-900">Metoda Platby</h2>
          </div>
          <div className="space-y-2">
            <p className="text-lg font-semibold text-stone-900">{getPaymentMethodName(order.paymentMethod || '')}</p>
            <p className="text-sm text-stone-500">
              Platba bude zpracována v souladu s vybranou metodou.
            </p>
          </div>
        </div>
      </div>

      {/* Souhrn objednávky */}
      <div className="bg-stone-50 rounded-lg border border-stone-200 p-6 mb-8">
        <div className="flex items-center justify-between mb-4 pb-4 border-b border-stone-200">
          <h2 className="text-xl font-bold text-stone-900">Souhrn Objednávky</h2>
          <div className="flex items-center gap-2 text-stone-600">
            <Calendar className="h-4 w-4" />
            <span className="text-sm">{currentDate}</span>
          </div>
        </div>

        <div className="space-y-3 mb-6">
          <div className="flex justify-between text-stone-600">
            <span>Počet položek</span>
            <span className="font-medium">{order.bookIds?.length || 0}</span>
          </div>
          <div className="flex justify-between text-stone-600">
            <span>Doprava</span>
            <span className="font-medium">Zdarma</span>
          </div>
          {order.totalPrice && (
            <div className="flex justify-between pt-3 border-t border-stone-200">
              <span className="font-bold text-stone-900">Celková Cena</span>
              <span className="font-bold text-lg text-emerald-600">{order.totalPrice.toFixed(2)} Kč</span>
            </div>
          )}
        </div>
      </div>

      {/* Akce */}
      <div className="space-y-3">
        <button
          onClick={() => navigate('/profile')}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-4 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
        >
          <Package className="h-5 w-5" />
          Jít do Profilu - Sledovat Objednávku
          <ArrowRight className="h-5 w-5" />
        </button>

        <button
          onClick={() => navigate('/books')}
          className="w-full bg-stone-100 hover:bg-stone-200 text-stone-900 px-6 py-4 rounded-lg font-semibold transition-colors"
        >
          Pokračovat v Nákupu
        </button>
      </div>

      {/* Informace */}
      <div className="mt-12 bg-blue-50 rounded-lg border border-blue-200 p-6 text-center">
        <p className="text-blue-900 text-sm">
          Potvrzovací e-mail byl odeslán na tvou registrovanou e-mailovou adresu.
          <br />
          Pokud máš jakékoliv otázky, kontaktuj nás na support@knihovna.cz
        </p>
      </div>
    </div>
  )
}
