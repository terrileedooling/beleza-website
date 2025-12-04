import { createContext, useContext, useState } from "react";

const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);

  // SAFE price parser (handles R, spaces, commas)
  const parsePrice = (priceString) => {
    if (typeof priceString === "number") return priceString;
    return parseFloat(priceString.replace(/[R,\s,]/g, ""));
  };

  // Add new item OR increase quantity
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

      return [
        ...prev,
        { ...product, price: parsePrice(product.price), quantity },
      ];
    });
  };

  // SAFE quantity update
  const updateQuantity = (id, newQuantity) => {
    if (newQuantity < 1) return;

    setCart((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeFromCart = (id) =>
    setCart((prev) => prev.filter((item) => item.id !== id));

  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.price * item.quantity,
    0
  );

  // PAYFAST checkout
  const checkoutPayFast = () => {
    if (cart.length === 0) return alert("Your cart is empty!");

    const merchantId = "10044048";
    const merchantKey = "krt3i2fyzql4y";
    const returnUrl = `${window.location.origin}/success`;
    const cancelUrl = `${window.location.origin}/cancel`;

    let query = `merchant_id=${merchantId}&merchant_key=${merchantKey}&return_url=${encodeURIComponent(
      returnUrl
    )}&cancel_url=${encodeURIComponent(cancelUrl)}`;

    cart.forEach((item, index) => {
      query += `&item_name[${index}]=${encodeURIComponent(
        item.name
      )}&amount[${index}]=${item.price.toFixed(
        2
      )}&quantity[${index}]=${item.quantity}`;
    });

    query += `&amount=${cartTotal.toFixed(2)}`;
    query += `&name_first=Customer&email_address=customer@example.com`;

    window.location.href = `https://sandbox.payfast.co.za/eng/process?${query}`;
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
        checkoutPayFast,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => useContext(CartContext);
