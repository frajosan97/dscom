// resources/js/context/CartContext.js
import { createContext, useContext, useState, useEffect } from 'react'

const CartContext = createContext()

export function CartProvider({ children }) {
    const [cartItems, setCartItems] = useState([])

    // Load from localStorage (client-side only)
    useEffect(() => {
        const savedCart = localStorage.getItem('cart')
        if (savedCart) {
            setCartItems(JSON.parse(savedCart))
        }
    }, [])

    // Save to localStorage whenever cart changes
    useEffect(() => {
        localStorage.setItem('cart', JSON.stringify(cartItems))
    }, [cartItems])

    const addToCart = (product) => {
        setCartItems((prevItems) => {
            const existingItem = prevItems.find((item) => item.id === product.id)
            if (existingItem) {
                return prevItems.map((item) =>
                    item.id === product.id
                        ? { ...item, quantity: item.quantity + (product.quantity || 1) }
                        : item
                )
            }
            return [...prevItems, { ...product, quantity: product.quantity || 1 }]
        })
    }

    const removeFromCart = (productId) => {
        setCartItems((prevItems) => prevItems.filter((item) => item.id !== productId))
    }

    const updateQuantity = (productId, newQuantity) => {
        if (newQuantity < 1) return
        setCartItems((prevItems) =>
            prevItems.map((item) =>
                item.id === productId ? { ...item, quantity: newQuantity } : item
            )
        )
    }

    const clearCart = () => {
        setCartItems([])
    }

    const cartTotal = cartItems.reduce(
        (total, item) => total + item.price * item.quantity,
        0
    )

    const itemCount = cartItems.reduce(
        (count, item) => count + item.quantity,
        0
    )

    return (
        <CartContext.Provider
            value={{
                cartItems,
                addToCart,
                removeFromCart,
                updateQuantity,
                clearCart,
                cartTotal,
                itemCount,
            }}
        >
            {children}
        </CartContext.Provider>
    )
}

export function useCart() {
    const context = useContext(CartContext)
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider')
    }
    return context
}