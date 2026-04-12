import React from "react";
import { useCart } from "../context/CartContext";
import "../styles/admin-payment-settings.css";

const AdminPaymentSettings = () => {
  const { paymentMethods, togglePaymentMethod } = useCart();

  const paymentMethodConfig = [
    { id: 'payfast', name: 'PayFast (Credit Card)', icon: 'fab fa-cc-visa', description: 'Instant card payments via PayFast' },
    { id: 'eft', name: 'EFT (Bank Transfer)', icon: 'fas fa-university', description: 'Manual bank transfer with order verification' },
    { id: 'payjustnow', name: 'PayJustNow', icon: 'fab fa-paypal', description: 'Pay in 3 interest-free installments (Coming Soon)' },
    { id: 'payflex', name: 'PayFlex', icon: 'fas fa-credit-card', description: 'Pay in 4 interest-free installments (Coming Soon)' }
  ];

  const handleToggle = (methodId, currentStatus) => {
    if (methodId === 'payjustnow' || methodId === 'payflex') {
      if (!currentStatus && !window.confirm(`Enable ${methodId.toUpperCase()}? Make sure you have been approved by ${methodId.toUpperCase()} first.`)) {
        return;
      }
    }
    togglePaymentMethod(methodId, !currentStatus);
  };

  return (
    <div className="payment-settings">
      <h3>Payment Methods Configuration</h3>
      <p className="settings-description">Enable or disable payment methods for your store</p>
      
      <div className="payment-methods-list">
        {paymentMethodConfig.map(method => (
          <div key={method.id} className="payment-method-item">
            <div className="method-info">
              <i className={method.icon}></i>
              <div>
                <h4>{method.name}</h4>
                <p>{method.description}</p>
              </div>
            </div>
            <label className="toggle-switch">
              <input
                type="checkbox"
                checked={paymentMethods[method.id] || false}
                onChange={() => handleToggle(method.id, paymentMethods[method.id])}
              />
              <span className="toggle-slider"></span>
            </label>
          </div>
        ))}
      </div>
      
      <div className="settings-note">
        <i className="fas fa-info-circle"></i>
        <p>Changes are saved automatically. Disabled methods won't appear in checkout.</p>
      </div>
    </div>
  );
};

export default AdminPaymentSettings;