import { createContext, useContext, useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const DELIVERY_FEE = 150;

  // Payment methods configuration (can be moved to admin settings later)
  const [paymentMethods, setPaymentMethods] = useState({
    payfast: true,
    eft: true,
    payjustnow: false, // Set to true when approved
    payflex: false      // Set to true when approved
  });

  // Load cart from localStorage
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem("cart");
    return saved ? JSON.parse(saved) : [];
  });

  // Sync to localStorage
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // Parse price safely
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
        // Dual status system
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
      // Save order with paymentStatus = "unpaid" initially
      // Success page will update to "paid"
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
      window.location.href = `https://sandbox.payfast.co.za/eng/process?${query}`;
  
    } catch (err) {
      console.error("Checkout failed:", err);
      alert("Failed to process order. Please try again.");
    }
  };

  // EFT Checkout
  const checkoutEFT = async (customerDetails) => {
    try {
      // Create order in Firestore - USE 'cart' not 'cartItems'
      const orderData = {
        ...customerDetails,
        items: cart,  // FIXED: was 'cartItems', should be 'cart'
        subtotal: cartTotal,
        deliveryFee: DELIVERY_FEE,
        finalTotal: finalTotal,
        paymentMethod: 'eft',
        status: 'pending_payment',
        createdAt: new Date().toISOString(),
        orderNumber: `ORD-${Date.now()}`
      };

      const orderRef = await addDoc(collection(db, "orders"), orderData);
      const orderId = orderRef.id;

      // Send WhatsApp message with bank details
      const whatsappMessage = `*BELEZA Professional - EFT Payment Instructions*

                                Order #: ${orderId.slice(0, 8)}
                                Amount Due: R${finalTotal.toFixed(2)}
                                  
                                *Bank Transfer Details:*
                                Bank: First National Bank (FNB)
                                Account Name: Beleza Professional Pty Ltd
                                Account Number: 628 789 456 12
                                Branch Code: 250655
                                Reference: BELEZA-${orderId.slice(0, 8)}
                                  
                                *Steps to complete payment:*
                                1. Transfer the exact amount using above details
                                2. Use the reference number exactly as shown
                                3. Send proof of payment to orders@beleza.co.za
                                4. Your order will be processed within 24 hours
                                  
                                Thank you for shopping with Beleza Professional!`;

      // Encode message for URL
      const encodedMessage = encodeURIComponent(whatsappMessage);
      const phoneNumber = customerDetails.phone.replace(/\D/g, ''); // Remove non-digits

      // Clear cart BEFORE redirecting
      clearCart();

      // Open WhatsApp in new tab
      window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank');

      // Redirect to EFT instructions page
      window.location.href = `/eft-instructions/${orderId}`;

    } catch (error) {
      console.error("EFT checkout error:", error);
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
    if (paymentMethods.payfast) available.push({ id: 'payfast', name: 'Credit Card / PayFast', icon: 'fab fa-cc-visa' });
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