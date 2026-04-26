// /* @refresh skip */
import { createContext, useContext, useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const DELIVERY_FEE = 150;

  const [paymentMethods, setPaymentMethods] = useState({
    payfast: true,
    eft: true,
    payjustnow: false, // Set to true when approved
    payflex: false      // Set to true when approved
  });

  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem("cart");
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);


  const parsePrice = (priceString) => {
    if (typeof priceString === "number") return priceString;
    return parseFloat(priceString.replace(/[R,\s]/g, ""));
  };

  // Add item
  const addToCart = (product, quantity = 1) => {
    setCart((prev) => {
      const exists = prev.find((item) => item.id === product.id);
      if (exists) {
        return prev.map((item) =>
          item.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { ...product, price: parsePrice(product.price), quantity }];
    });
  };

  // Update qty
  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return;
    setCart((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity: newQuantity } : item))
    );
  };

  // Remove, clear cart
  const removeFromCart = (id) => setCart((prev) => prev.filter((item) => item.id !== id));
  const clearCart = () => setCart([]);

  // Totals
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const finalTotal = cartTotal + DELIVERY_FEE;

  // Save order to Firestore with dual statuses
  const saveOrder = async (customer, paymentMethod, paymentStatus = "unpaid", fulfillmentStatus = "pending") => {
    if (cart.length === 0) throw new Error("Cart is empty");

    try {
      const docRef = await addDoc(collection(db, "orders"), {
        items: cart,
        subtotal: cartTotal,
        deliveryFee: DELIVERY_FEE,
        finalTotal,
        paymentStatus: paymentStatus,     // unpaid, paid, refunded, failed
        fulfillmentStatus: fulfillmentStatus, // pending, processing, shipped, delivered, cancelled
        paymentMethod: paymentMethod,
        customer: {
          ...customer,
          paymentMethod: paymentMethod
        },
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      return docRef.id;
    } catch (err) {
      console.error("Failed to save order:", err);
      throw err;
    }
  };

  // PayFast checkout
  const checkoutPayFast = async (customer) => {
    if (cart.length === 0) return alert("Your cart is empty!");
  
    const merchantId = import.meta.env.VITE_MERCHANT_ID;
    const merchantKey = import.meta.env.VITE_MERCHANT_KEY;
    const returnUrl = `${window.location.origin}/success`;
    const cancelUrl = `${window.location.origin}/cancel`;
    const itemName = `Order from BELEZA`;
  
    try {
      const orderId = await saveOrder(customer, "PayFast", "unpaid", "pending");
  
      // Build PayFast query
      let query = `merchant_id=${merchantId}`;
      query += `&merchant_key=${merchantKey}`;
      query += `&return_url=${encodeURIComponent(returnUrl)}`;
      query += `&cancel_url=${encodeURIComponent(cancelUrl)}`;
      query += `&m_payment_id=${orderId}`;
      query += `&item_name=${encodeURIComponent(itemName)}`;
      query += `&amount=${finalTotal.toFixed(2)}`;
      query += `&name_first=${encodeURIComponent(customer.name.split(' ')[0] || '')}`;
      query += `&email_address=${encodeURIComponent(customer.email)}`;
      
      // Store order ID as backup
      localStorage.setItem('lastOrderId', orderId);
      sessionStorage.setItem('pendingOrderId', orderId);
      
      // Clear cart
      clearCart();
      
      // Redirect to PayFast
      window.location.href = `${import.meta.env.VITE_PAYFAST_URL}${query}`;
  
    } catch (err) {
      console.error("Checkout failed:", err);
      alert("Failed to process order. Please try again.");
    }
  };

  // EFT Checkout 
  const checkoutEFT = async (customerDetails) => {
    if (cart.length === 0) {
      alert("Your cart is empty!");
      return;
    }

    try {
      // Validate required fields
      if (!customerDetails.name || !customerDetails.email || !customerDetails.phone || !customerDetails.address) {
        alert("Please fill in all required fields");
        return;
      }

      // Use the same saveOrder function that PayFast uses
      const orderId = await saveOrder(customerDetails, "EFT", "unpaid", "pending");

      console.log("EFT Order created:", orderId);

      // Clear cart
      clearCart();

      // Redirect to EFT instructions page
      window.location.href = `/eft-instructions/${orderId}`;

    } catch (error) {
      console.error("EFT checkout error:", error);
      alert("Failed to process order. Please try again.");
      throw error;
    }
  };

  // PayJustNow checkout (placeholder - implement when approved)
  const checkoutPayJustNow = async (customer) => {
    alert("PayJustNow coming soon! We'll notify you when this payment method is available.");
  };

  // PayFlex checkout (placeholder - implement when approved)
  const checkoutPayFlex = async (customer) => {
    alert("PayFlex coming soon! We'll notify you when this payment method is available.");
  };

  // Get available payment methods for checkout
  const getAvailablePaymentMethods = () => {
    const available = [];
    if (paymentMethods.payfast) available.push({ id: 'payfast', name: 'Bank Card / PayFast', icon: 'fab fa-cc-visa' });
    if (paymentMethods.eft) available.push({ id: 'eft', name: 'EFT (Bank Transfer)', icon: 'fas fa-university' });
    if (paymentMethods.payjustnow) available.push({ id: 'payjustnow', name: 'PayJustNow', icon: 'fab fa-paypal' });
    if (paymentMethods.payflex) available.push({ id: 'payflex', name: 'PayFlex', icon: 'fas fa-credit-card' });
    return available;
  };

  // Toggle payment methods (for admin settings)
  const togglePaymentMethod = (method, enabled) => {
    setPaymentMethods(prev => ({ ...prev, [method]: enabled }));
    localStorage.setItem('paymentMethods', JSON.stringify({ ...paymentMethods, [method]: enabled }));
  };

  // Load payment methods from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem('paymentMethods');
    if (saved) {
      setPaymentMethods(JSON.parse(saved));
    }
  }, []);

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQuantity,
        removeFromCart,
        clearCart,
        cartTotal,
        finalTotal,
        DELIVERY_FEE,
        checkoutPayFast,
        checkoutEFT,
        checkoutPayJustNow,
        checkoutPayFlex,
        getAvailablePaymentMethods,
        paymentMethods,
        togglePaymentMethod
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);