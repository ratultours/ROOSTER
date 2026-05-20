import React, { useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import { useAppContext, products, DELIVERY_CHARGE } from '../AppContext';

export function CartAndCheckout() {
  const { 
    cart, setCart, isCartOpen, setIsCartOpen, 
    isCheckoutOpen, setIsCheckoutOpen, isSuccessOpen, setIsSuccessOpen,
    currentUser, users, getOrders, setOrders, getStats, setStats, showToast 
  } = useAppContext();

  const [checkoutForm, setCheckoutForm] = useState({
    name: '', phone: '', email: '', address: '', note: ''
  });
  const [successOrderId, setSuccessOrderId] = useState('');

  const totalQty = Object.values(cart).reduce((a: any, b: any) => a + b, 0) as number;
  const subtotal = Object.entries(cart).reduce((sum, [id, qty]) => {
    const p = products.find(x => x.id === Number(id));
    return sum + (p ? p.price * (qty as number) : 0);
  }, 0);
  const total = subtotal + DELIVERY_CHARGE;

  const changeCart = (id: number, delta: number) => {
    setCart((prev: any) => {
      const newCart = { ...prev };
      newCart[id] = (newCart[id] || 0) + delta;
      if (newCart[id] <= 0) delete newCart[id];
      return newCart;
    });
  };

  const handleOpenCheckout = () => {
    setIsCartOpen(false);
    if (currentUser) {
      const u = users[currentUser.email];
      setCheckoutForm({
        name: currentUser.name,
        email: currentUser.email,
        phone: u?.phone || '',
        address: u?.address || '',
        note: ''
      });
    }
    setIsCheckoutOpen(true);
  };

  const handlePlaceOrder = () => {
    const { name, phone, address, email, note } = checkoutForm;
    if (!name) { showToast('⚠️ Please enter your full name!'); return; }
    if (!phone || !/^01[3-9]\d{8}$/.test(phone)) { showToast('⚠️ Please enter a valid BD phone number!'); return; }
    const addrWords = address.split(/[\s,]+/).filter(w => w.length > 1);
    if (address.length < 30 || addrWords.length < 5) { showToast('⚠️ Please enter a complete address!'); return; }

    const orderId = 'ROS-' + String(Math.floor(1000 + Math.random() * 9000));
    const orderItems = Object.entries(cart).filter(([_, q]: [any, any]) => q > 0).map(([id, qty]) => {
      const p = products.find(x => x.id === Number(id))!;
      return { id: p.id, name: p.name, price: p.price, qty };
    });

    const now = new Date();
    const dateStr = now.toLocaleDateString('en-BD', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    const order = {
      id: orderId, date: dateStr, status: 'pending', items: orderItems, total,
      customer: { name, phone, email, address, note }
    };

    if (currentUser) {
      const orders = getOrders(currentUser.email);
      orders.push(order);
      setOrders(currentUser.email, orders);
      const stats = getStats(currentUser.email);
      stats.orders += 1;
      stats.items += totalQty;
      stats.spent += total;
      setStats(currentUser.email, stats);
    }

    setSuccessOrderId(orderId);
    setIsCheckoutOpen(false);
    setIsSuccessOpen(true);
  };

  const handleCloseSuccess = () => {
    setIsSuccessOpen(false);
    setCart({});
    setCheckoutForm({ name: '', phone: '', email: '', address: '', note: '' });
  };

  return (
    <>
      <div className={`float-cart-bar ${totalQty > 0 ? 'show' : ''}`} onClick={() => setIsCartOpen(true)}>
        <div className="fcb-left">
          <div className="fcb-count">{totalQty} items</div>
          <div className="fcb-label">View Cart</div>
        </div>
        <div className="fcb-price">৳{total}</div>
      </div>

      <div className={`cart-overlay ${isCartOpen ? 'open' : ''}`} onClick={() => setIsCartOpen(false)}></div>
      <div className={`cart-drawer ${isCartOpen ? 'open' : ''}`}>
        <div className="cart-handle"></div>
        <div className="cart-header">
          <div className="cart-title">
            <ShoppingBag size={22} color="#22a44e" strokeWidth={2.2} /> YOUR CART
          </div>
          <button className="cart-close" onClick={() => setIsCartOpen(false)}>✕</button>
        </div>
        
        <div className="cart-items">
          {totalQty === 0 ? (
            <div className="cart-empty">
              <div className="cart-empty-icon" style={{ display: 'flex', justifyContent: 'center' }}>
                <ShoppingBag size={64} color="#22a44e" strokeWidth={1.5} opacity={0.35} />
              </div>
              <p>Your cart is empty</p>
            </div>
          ) : (
            Object.entries(cart).map(([id, qty]) => {
              const p = products.find(x => x.id === Number(id));
              if (!p || (qty as number) <= 0) return null;
              return (
                <div key={p.id} className="cart-item">
                  <img className="cart-item-img" src={p.img} alt={p.name} onError={(e) => { (e.target as any).style.display = 'none'; }} />
                  <div className="cart-item-info">
                    <div className="cart-item-name">{p.name}</div>
                    <div className="cart-item-price">৳{p.price} × {qty as number} = ৳{p.price * (qty as number)}</div>
                  </div>
                  <div className="cart-item-qty">
                    <button className="ci-btn" onClick={() => changeCart(p.id, -1)}>−</button>
                    <div className="ci-qty">{qty as number}</div>
                    <button className="ci-btn" onClick={() => changeCart(p.id, 1)}>+</button>
                  </div>
                </div>
              )
            })
          )}
        </div>

        {totalQty > 0 && (
          <div className="cart-footer" style={{ display: 'block' }}>
            <div className="cart-summary-row"><span>Subtotal</span><span>৳{subtotal}</span></div>
            <div className="cart-summary-row"><span>Delivery Charge</span><span>৳{DELIVERY_CHARGE}</span></div>
            <div className="cart-summary-row total"><span>Total</span><span>৳{total}</span></div>
            <button className="checkout-btn" onClick={handleOpenCheckout}>Proceed to Checkout →</button>
          </div>
        )}
      </div>

      <div className={`modal-overlay ${isCheckoutOpen ? 'open' : ''}`}>
        <div className="modal">
          <div className="modal-title">📦 Checkout</div>
          <div className="form-group"><label className="form-label">Full Name</label><input className="form-input" type="text" placeholder="Enter your full name" autoComplete="name" value={checkoutForm.name} onChange={e => setCheckoutForm({...checkoutForm, name: e.target.value})} /></div>
          <div className="form-group"><label className="form-label">Phone Number</label><input className="form-input" type="tel" placeholder="01XXXXXXXXX" autoComplete="tel" value={checkoutForm.phone} onChange={e => setCheckoutForm({...checkoutForm, phone: e.target.value})} /></div>
          <div className="form-group"><label className="form-label">Email <span style={{fontWeight:500, color:"rgba(30,35,50,0.4)", fontSize:"11px", textTransform:"none", letterSpacing:0}}>(Optional)</span></label><input className="form-input" type="email" placeholder="example@email.com" autoComplete="email" value={checkoutForm.email} onChange={e => setCheckoutForm({...checkoutForm, email: e.target.value})} /></div>
          <div className="form-group"><label className="form-label">Delivery Address</label><input className="form-input" type="text" placeholder="House/Flat, Road, Area, Thana, District, Postal Code" autoComplete="street-address" value={checkoutForm.address} onChange={e => setCheckoutForm({...checkoutForm, address: e.target.value})} /></div>
          <div className="form-group"><label className="form-label">Special Instructions (Optional)</label><input className="form-input" type="text" placeholder="Any special request..." value={checkoutForm.note} onChange={e => setCheckoutForm({...checkoutForm, note: e.target.value})} /></div>
          
          <div className="payment-box">
            <div className="payment-icon">💵</div>
            <div className="payment-info">
              <div className="payment-title">Cash On Delivery</div>
              <div className="payment-sub">Pay when your order arrives · Delivery ৳{DELIVERY_CHARGE}</div>
            </div>
          </div>
          
          <div className="order-summary-mini">
            <div className="osm-title">Order Summary</div>
            <div>
              {Object.entries(cart).map(([id, qty]) => {
                const p = products.find(x => x.id === Number(id));
                if (!p || (qty as number) <= 0) return null;
                return <div key={p.id} className="osm-row"><span>{p.name} ×{qty as number}</span><span>৳{p.price * (qty as number)}</span></div>
              })}
            </div>
            <div className="osm-row"><span>Delivery Charge</span><span>৳{DELIVERY_CHARGE}</span></div>
            <div className="osm-row total"><span>Total</span><span>৳{total}</span></div>
          </div>
          
          <button className="place-order-btn" onClick={handlePlaceOrder}>Place Order</button>
          <button className="modal-back" onClick={() => { setIsCheckoutOpen(false); setIsCartOpen(true); }}>← Back to Cart</button>
        </div>
      </div>

      <div className={`success-overlay ${isSuccessOpen ? 'open' : ''}`}>
        <div className="success-box">
          <div className="success-icon">🎉</div>
          <div className="success-title">Order Placed!</div>
          <div className="success-msg">Your order has been confirmed. Our team will contact you shortly to confirm delivery.</div>
          <div className="success-order-id">ORDER #{successOrderId}</div>
          <button className="success-close" onClick={handleCloseSuccess}>Continue Shopping 🍗</button>
        </div>
      </div>
    </>
  );
}
