import React from 'react';
import { ShoppingBag, User, History } from 'lucide-react';
import { useAppContext } from '../AppContext';

export function Header() {
  const { currentUser, users, setIsAuthOpen, setIsCartOpen, cart, setAccTab } = useAppContext();
  const totalQty = Object.values(cart).reduce((a: any, b: any) => a + b, 0) as number;

  const userInitial = currentUser?.name ? currentUser.name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2) : '?';
  const u = currentUser ? users[currentUser.email] : null;

  return (
    <header>
      <div className="header-inner">
        <div className="logo-wrap">
          <img className="logo-img" src="https://storage.googleapis.com/takeapp/media/cmnl188qn000504jv7qe62dq4.png" alt="Rooster Logo" onError={(e) => { (e.target as any).style.display = 'none'; }} />
          <div>
            <div className="logo-text">ROOSTER</div>
            <div className="logo-sub">A Statement</div>
          </div>
        </div>
        <div className="header-actions">
          {currentUser ? (
            <>
              <button className="auth-btn logged-in" onClick={() => setIsAuthOpen(true)}>
                {u?.avatar ? (
                  <img className="header-profile-photo" src={u.avatar} alt="Profile" />
                ) : (
                  <div className="header-profile-initials">{userInitial}</div>
                )}
              </button>
            </>
          ) : (
            <button className="auth-btn" onClick={() => setIsAuthOpen(true)}>
              <User size={16} strokeWidth={2.2} />
            </button>
          )}
          <button className="cart-btn" onClick={() => setIsCartOpen(true)}>
            <ShoppingBag size={18} strokeWidth={2.2} />
            <span className={`cart-badge ${totalQty > 0 ? 'show' : ''}`} id="cart-badge">
              {totalQty}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
}

export function Hero() {
  return (
    <div className="hero">
      <h1>
        <span className="strike">Not a Snack</span>
        <span className="dash"> - </span>
        <span className="statement">A Statement</span>
      </h1>
      <div className="hero-address">📍 259/2, West Monipur, Mirpur-2, Dhaka</div>
    </div>
  );
}

export function Footer() {
  return (
    <footer>
      <div className="footer-inner">
        <div className="cod-banner">
          <div className="cod-top">
            <span className="cod-accept-label">We Accept:</span>
            <div className="cod-pill-btn">
              <span className="cod-pill-icon">💵</span>
              <span className="cod-pill-text">Cash on Delivery</span>
            </div>
          </div>
          <div className="cod-divider"></div>
          <div className="cod-bottom">
            <div className="cod-sub">Pay when your order arrives at your door</div>
            <div className="delivery-chip">🛵 Delivery Charge ৳70</div>
          </div>
        </div>
        
        <div className="footer-contact-row">
          <a className="wa-btn" href="https://wa.me/8801332601510" target="_blank" rel="noopener noreferrer">
            <svg width="16" height="16" viewBox="0 0 32 32" fill="none"><circle cx="16" cy="16" r="16" fill="#25D366"/><path d="M23.5 8.5C21.6 6.6 19.1 5.5 16.4 5.5C10.9 5.5 6.4 10 6.4 15.5C6.4 17.3 6.9 19.1 7.8 20.6L6.3 26L11.8 24.5C13.3 25.3 15 25.8 16.7 25.8H16.8C22.3 25.8 26.8 21.3 26.8 15.8C26.6 13.2 25.4 10.4 23.5 8.5ZM16.4 24C14.9 24 13.4 23.6 12.1 22.8L11.8 22.6L8.7 23.5L9.6 20.5L9.4 20.2C8.5 18.8 8 17.2 8 15.5C8 10.8 11.8 7 16.5 7C18.8 7 20.9 7.9 22.5 9.5C24.1 11.1 25 13.2 25 15.5C24.9 20.3 21.1 24 16.4 24ZM21.1 17.7C20.8 17.5 19.4 16.9 19.2 16.8C18.9 16.7 18.8 16.6 18.6 16.9C18.4 17.2 18 17.7 17.8 17.9C17.6 18.1 17.5 18.1 17.2 18C15.7 17.3 14.7 16.7 13.7 15.1C13.4 14.6 13.9 14.6 14.4 13.6C14.5 13.4 14.4 13.3 14.3 13.1C14.2 12.9 13.8 11.5 13.6 10.9C13.4 10.3 13.2 10.4 13 10.4C12.8 10.4 12.7 10.4 12.5 10.4C12.3 10.4 12 10.5 11.7 10.8C11.5 11.1 10.8 11.7 10.8 13.1C10.8 14.5 11.7 15.8 11.9 16C12.1 16.2 13.8 18.8 16.4 20C18.3 20.8 19 20.9 19.9 20.8C20.5 20.7 21.6 20.1 21.9 19.4C22.1 18.7 22.1 18.1 22 17.9C21.8 17.9 21.5 17.8 21.1 17.7Z" fill="white"/></svg>
            WhatsApp
          </a>
          <a className="email-btn" href="mailto:myloverooster@gmail.com">
            <svg width="16" height="16" viewBox="0 0 32 32" fill="none"><rect width="32" height="32" rx="4" fill="white"/><path d="M6 10.5C6 9.4 6.9 8.5 8 8.5H24C25.1 8.5 26 9.4 26 10.5V21.5C26 22.6 25.1 23.5 24 23.5H8C6.9 23.5 6 22.6 6 21.5V10.5Z" fill="white" stroke="#E8EAED" strokeWidth="0.5"/><path d="M8.5 11.5L16 17.5L23.5 11.5" stroke="#EA4335" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg>
            Email
          </a>
        </div>
        
        <div className="dev-section">
          <div className="dev-label">Developer</div>
          <div className="dev-name">MOHAMMAD NUR <span className="bold-hasnat">HASNAT</span></div>
          <div className="dev-contacts">
            <a className="dev-contact-btn dev-btn-email" href="mailto:mohammadnurhasnat@gmail.com"><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><path d="M2 6C2 4.9 2.9 4 4 4H20C21.1 4 22 4.9 22 6V18C22 19.1 21.1 20 20 20H4C2.9 20 2 19.1 2 18V6Z" fill="white" stroke="#EA4335" strokeWidth="0.5"/><path d="M2 6L12 13L22 6" stroke="#EA4335" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/></svg></a>
            <a className="dev-contact-btn dev-btn-phone" href="tel:+8801861186863"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#25D366" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 8.8a19.79 19.79 0 01-3.07-8.68A2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92v2z"/></svg></a>
            <a className="dev-contact-btn dev-btn-telegram" href="https://t.me/mdnurhasnat" target="_blank" rel="noopener noreferrer"><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="12" fill="#2AABEE"/><path d="M5.5 11.8L17.5 7L14.5 17.5L11 14L8.5 16.5V13L15 8.5L9 12.5L5.5 11.8Z" fill="white"/></svg></a>
            <a className="dev-contact-btn dev-btn-facebook" href="https://facebook.com/hasnat.bikel" target="_blank" rel="noopener noreferrer"><svg width="14" height="14" viewBox="0 0 24 24" fill="none"><circle cx="12" cy="12" r="12" fill="#1877F2"/><path d="M15.5 8H13.5C13.2 8 13 8.2 13 8.5V10H15.5L15 13H13V20H10V13H8V10H10V8.5C10 6.6 11.6 5 13.5 5H15.5V8Z" fill="white"/></svg></a>
          </div>
        </div>
        <div className="footer-copy">© 2026 <span className="brand-name">Rooster</span> · All rights reserved</div>
      </div>
    </footer>
  );
}

export function Toast() {
  const { toast } = useAppContext();
  
  // Decide icon based on message content
  let icon = '🔔';
  let title = 'Notification';
  if (toast.msg.toLowerCase().includes('confirmed')) {
    icon = '✅'; title = 'Order Update';
  } else if (toast.msg.toLowerCase().includes('out for delivery')) {
    icon = '🛵'; title = 'Delivery Updates';
  } else if (toast.msg.toLowerCase().includes('delivered')) {
    icon = '🎉'; title = 'Order Complete';
  } else if (toast.msg.toLowerCase().includes('success') || toast.msg.toLowerCase().includes('added')) {
    icon = '✅'; title = 'Success';
  } else if (toast.msg.toLowerCase().includes('error') || toast.msg.toLowerCase().includes('failed') || toast.msg.toLowerCase().includes('cannot')) {
    icon = '⚠️'; title = 'Alert';
  }

  return (
    <div className={`toast ${toast.show ? 'show' : ''}`} id="toast">
      <div className="toast-icon">{icon}</div>
      <div className="toast-content">
        <div className="toast-title">Rooster • {title}</div>
        <div id="toast-msg">{toast.msg}</div>
      </div>
    </div>
  );
}
