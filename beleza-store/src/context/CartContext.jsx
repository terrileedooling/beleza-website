// CartContext.js
import { createContext, useContext, useState, useEffect } from "react";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const DELIVERY_FEE = 150;

  // Load cart from localStorage on first load
  const [cart, setCart] = useState(() => {
    const saved = localStorage.getItem("cart");
    return saved ? JSON.parse(saved) : [];
  });

  // Sync cart to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  // Safe price parser
  const parsePrice = (priceString) => {
    if (typeof priceString === "number") return priceString;
    return parseFloat(priceString.replace(/[R,\s]/g, ""));
  };

  // Add new item or increase quantity
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

  // Update quantity
  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return;
    setCart((prev) =>
      prev.map((item) => (item.id === id ? { ...item, quantity: newQuantity } : item))
    );
  };

  const removeFromCart = (id) => setCart((prev) => prev.filter((item) => item.id !== id));
  const clearCart = () => setCart([]);

  // Totals
  const cartTotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
  const finalTotal = cartTotal + DELIVERY_FEE;

  // Save order to Firestore
  const saveOrder = async (customer) => {
    if (cart.length === 0) throw new Error("Cart is empty");

    try {
      const docRef = await addDoc(collection(db, "orders"), {
        items: cart,
        subtotal: cartTotal,
        deliveryFee: DELIVERY_FEE,
        finalTotal,
        status: "pending",
        customer,
        createdAt: serverTimestamp(),
      });
      console.log("Order saved with ID:", docRef.id);
      return docRef.id;
    } catch (err) {
      console.error("Failed to save order:", err);
      throw err;
    }
  };

  // PayFast checkout
  const checkoutPayFast = async (customer) => {
    if (cart.length === 0) return alert("Your cart is empty!");

    const merchantId = "10044048"; // sandbox ID
    const merchantKey = "krt3i2fyzql4y"; // sandbox key
    const returnUrl = `${window.location.origin}/success`;
    const cancelUrl = `${window.location.origin}/cancel`;
    const itemName = `Order ${new Date().getTime()}`;
    const amount = finalTotal.toFixed(2);

    try {
      await saveOrder(customer); // save order first
      clearCart();

      let query = `merchant_id=${merchantId}&merchant_key=${merchantKey}`;
      query += `&return_url=${encodeURIComponent(returnUrl)}`;
      query += `&cancel_url=${encodeURIComponent(cancelUrl)}`;
      query += `&item_name=${encodeURIComponent(itemName)}`;
      query += `&amount=${amount}`;
      query += `&name_first=${encodeURIComponent(customer.name)}`;
      query += `&email_address=${encodeURIComponent(customer.email)}`;

      console.log("Redirecting to PayFast sandbox...");
      console.log("Query:", query);

      window.location.href = `https://sandbox.payfast.co.za/eng/process?${query}`;
    } catch (err) {
      console.error("Checkout failed:", err);
      alert("Failed to process order. Check console for details.");
    }
  };

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
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);