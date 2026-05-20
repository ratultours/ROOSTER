import React, { useState } from 'react';
import { ShoppingBag } from 'lucide-react';
import { useAppContext, products, DELIVERY_CHARGE } from '../AppContext';

export function CartAndCheckout() {
  const { 
    cart, setCart, isCartOpen, setIsCartOpen, 
    isCheckoutOpen, setIsCheckoutOpen, isSuccessOpen, setIsSuccessOpen,
    currentUser, users, saveUsersState, getOrders, setOrders, getStats, setStats, showToast 
  } = useAppContext();

  const [checkoutForm, setCheckoutForm] = useState({
    name: '', phone: '', email: '', address: '', note: ''
  });
  const [successOrderId, setSuccessOrderId] = useState('');
  const [isConfirmed, setIsConfirmed] = useState(false);

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
    } else {
      setCheckoutForm({
        name: '',
        email: '',
        phone: '',
        address: '',
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
    if (!isConfirmed) { showToast('⚠️ Please confirm your order details!'); return; }

    const orderId = 'ROS-' + String(Math.floor(1000 + Math.random() * 9000));
    const orderItems = Object.entries(cart).filter(([_, q]: [any, any]) => q > 0).map(([id, qty]) => {
      const p = products.find(x => x.id === Number(id))!;
      return { id: p.id, name: p.name, price: p.price, qty };
    });

    const now = new Date();
    const dateStr = now.toLocaleDateString('en-BD', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    const order = {
      id: orderId, date: dateStr, status: 'pending', items: orderItems, total,
      timestamp: Date.now(),
      customer: { name, phone, email, address, note },
      isGuest: !currentUser
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

      const u = users[currentUser.email];
      if (u && (!u.address || u.address.trim() !== address.trim())) {
        const newUsers = { ...users };
        newUsers[currentUser.email] = { ...u, address: address.trim() };
        saveUsersState(newUsers);
        showToast('📍 Delivery address saved as default!');
      }
    } else {
      // Capture guest order globally
      const allGuestOrders = JSON.parse(localStorage.getItem('rooster_guest_orders') || '[]');
      allGuestOrders.push(order);
      localStorage.setItem('rooster_guest_orders', JSON.stringify(allGuestOrders));
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
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            {totalQty > 0 && (
              <button 
                onClick={() => setCart({})}
                style={{ fontSize: '11px', fontWeight: 800, color: '#c0150a', background: 'rgba(232,35,10,0.1)', border: '1px solid rgba(232,35,10,0.2)', padding: '4px 8px', borderRadius: '4px', cursor: 'pointer' }}
              >
                CLEAR
              </button>
            )}
            <button className="cart-close" onClick={() => setIsCartOpen(false)}>✕</button>
          </div>
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
        <div className="modal" style={{ paddingTop: currentUser ? '24px' : '16px' }}>
          {!currentUser && (
            <div style={{ background: 'rgba(212,168,0,0.1)', border: '1px solid rgba(212,168,0,0.3)', color: '#8a6a00', padding: '10px 14px', borderRadius: '6px', fontSize: '13px', fontWeight: 700, marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>ℹ️</span> Checking out as a guest. To view order history, log in first.
            </div>
          )}
          <div className="modal-title">📦 {currentUser ? 'Checkout' : 'Guest Checkout'}</div>
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
            <div style={{ paddingBottom: '8px', borderBottom: '1px solid rgba(30,35,50,0.1)', marginBottom: '8px', fontSize: '13px', color: 'rgba(30,35,50,0.7)', lineHeight: 1.4 }}>
              <strong>Delivering to:</strong> {checkoutForm.name ? checkoutForm.name + " · " : ""}{checkoutForm.phone}<br/>
              {checkoutForm.address ? checkoutForm.address : <span style={{ color: "rgba(232,35,10,0.6)" }}>Please enter delivery address</span>}
            </div>
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
          
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', cursor: 'pointer', fontSize: '13px', color: 'rgba(30,35,50,0.8)', fontWeight: 600 }}>
            <input type="checkbox" checked={isConfirmed} onChange={(e) => setIsConfirmed(e.target.checked)} style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: 'var(--red)' }} />
            I confirm the order details and delivery address
          </label>
          
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
