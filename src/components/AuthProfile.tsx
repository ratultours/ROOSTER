import React, { useState, useRef } from 'react';
import { User, Lock, Mail, Phone, LogOut, Camera, Calendar, ShoppingBag, MapPin, CreditCard, RotateCcw, Clock, CheckCircle2, Truck, Home, ShoppingCart } from 'lucide-react';
import { useAppContext, DELIVERY_CHARGE } from '../AppContext';

export function AuthProfile() {
  const { 
    currentUser, users, saveUsersState, saveSessionState, clearSessionState,
    isAuthOpen, setIsAuthOpen, showToast, getStats, getOrders, setOrders, accTab, setAccTab,
    cart, setCart, setCardQty, setIsCartOpen
  } = useAppContext();

  const [authTab, setAuthTab] = useState<'login'|'signup'>('login');
  
  const [loginForm, setLoginForm] = useState({ identifier: '', password: '' });
  const [signupForm, setSignupForm] = useState({ name: '', phone: '', email: '', password: '' });
  const [authMsg, setAuthMsg] = useState({ text: '', type: '' });

  const [editForm, setEditForm] = useState({ name: '', phone: '', address: '', email: '', curPassword: '', newPassword: '' });
  const [otpSent, setOtpSent] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [pendingOTP, setPendingOTP] = useState<string|null>(null);
  const [pendingNewEmail, setPendingNewEmail] = useState<string|null>(null);
  const [otpStatus, setOtpStatus] = useState({ msg: '', type: 'pending' });

  const [orderDetailId, setOrderDetailId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const u = currentUser ? users[currentUser.email] : null;
  const ordersList = currentUser ? getOrders(currentUser.email) : [];
  const stats = currentUser ? getStats(currentUser.email) : { orders: 0, items: 0, spent: 0 };

  const closeAuth = () => {
    setIsAuthOpen(false);
    setAuthMsg({ text: '', type: '' });
  };

  const doLogin = () => {
    const identifier = loginForm.identifier.trim().toLowerCase();
    const pass = loginForm.password;
    if (!identifier || !pass) { setAuthMsg({text: 'Please fill in all fields.', type: 'error'}); return; }

    let matchedEmail = null;
    if (users[identifier]) {
      matchedEmail = identifier;
    } else {
      for (const email in users) {
        if (users[email].phone === identifier) { matchedEmail = email; break; }
      }
    }

    if (!matchedEmail) { setAuthMsg({text: 'No account found. Please sign up.', type: 'error'}); return; }
    if (users[matchedEmail].password !== btoa(pass)) { setAuthMsg({text: 'Incorrect password.', type: 'error'}); return; }

    saveSessionState({ name: users[matchedEmail].name, email: matchedEmail });
    setAuthMsg({text: 'Welcome back, ' + users[matchedEmail].name.split(' ')[0] + '! 🎉', type: 'success'});
    setTimeout(() => { setAuthMsg({ text: '', type: '' }); }, 1200);
  };

  const doSignup = () => {
    const { name, phone, email, password } = signupForm;
    const finalEmail = email.trim().toLowerCase();
    if (!name.trim() || !finalEmail || !password) { setAuthMsg({text: 'Name, email and password are required.', type: 'error'}); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(finalEmail)) { setAuthMsg({text: 'Please enter a valid email.', type: 'error'}); return; }
    if (phone && !/^01[3-9]\d{8}$/.test(phone)) { setAuthMsg({text: 'Please enter a valid BD phone number.', type: 'error'}); return; }
    if (password.length < 6) { setAuthMsg({text: 'Password must be at least 6 characters.', type: 'error'}); return; }
    if (users[finalEmail]) { setAuthMsg({text: 'An account with this email already exists.', type: 'error'}); return; }
    if (phone) {
      for (const e in users) {
        if (users[e].phone === phone) { setAuthMsg({text: 'This phone number is already registered.', type: 'error'}); return; }
      }
    }
    
    const newUsers = { ...users, [finalEmail]: { name: name.trim(), password: btoa(password), phone: phone.trim(), address: '', avatar: null, favorites: [] } };
    saveUsersState(newUsers);
    saveSessionState({ name: name.trim(), email: finalEmail });
    setAuthMsg({text: 'Account created! Welcome ' + name.trim().split(' ')[0] + '! 🐓', type: 'success'});
    setTimeout(() => { setAuthMsg({ text: '', type: '' }); }, 1200);
  };

  const doLogout = () => {
    saveSessionState(null);
    closeAuth();
    showToast('👋 Logged out successfully!');
  };

  const handleCancelOrder = (orderId: string) => {
    if (!currentUser) return;
    const allOrders = getOrders(currentUser.email);
    const orderIndex = allOrders.findIndex((o: any) => o.id === orderId);
    if (orderIndex >= 0 && allOrders[orderIndex].status === 'pending') {
      const timeElapsed = Date.now() - (allOrders[orderIndex].timestamp || 0);
      if (timeElapsed > 15000) {
        showToast('⚠️ Cannot cancel, order is already being processed.');
        return;
      }
      if (confirm('Are you sure you want to cancel this order?')) {
        allOrders[orderIndex].status = 'cancelled';
        setOrders(currentUser.email, allOrders);
        setOrderDetailId(null);
        showToast('🚫 Order cancelled successfully!');
      }
    } else {
      showToast('⚠️ Order cannot be cancelled at this stage.');
    }
  };

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const dataUrl = ev.target?.result;
      const newUsers = { ...users };
      newUsers[currentUser.email].avatar = dataUrl;
      saveUsersState(newUsers);
      showToast('📷 Profile photo updated!');
    };
    reader.readAsDataURL(file);
  };

  // Profile Edit Logic
  const initEditForm = () => {
    if (!currentUser || !u) return;
    setEditForm({ name: currentUser.name, phone: u.phone, address: u.address, email: currentUser.email, curPassword: '', newPassword: '' });
  };

  React.useEffect(() => {
    if (isAuthOpen && currentUser) initEditForm();
  }, [isAuthOpen, currentUser]);

  const saveName = () => {
    if (!editForm.name.trim()) { showToast('⚠️ Name cannot be empty'); return; }
    const newUsers = { ...users };
    newUsers[currentUser.email].name = editForm.name.trim();
    saveUsersState(newUsers);
    saveSessionState({ ...currentUser, name: editForm.name.trim() });
    showToast('✅ Name updated!');
  };

  const savePhone = () => {
    if (editForm.phone && !/^01[3-9]\d{8}$/.test(editForm.phone)) { showToast('⚠️ Enter a valid BD phone number'); return; }
    const newUsers = { ...users };
    newUsers[currentUser.email].phone = editForm.phone.trim();
    saveUsersState(newUsers);
    showToast('✅ Phone number updated!');
  };

  const saveAddress = () => {
    const newUsers = { ...users };
    newUsers[currentUser.email].address = editForm.address.trim();
    saveUsersState(newUsers);
    showToast('✅ Address saved!');
  };

  const handleReorder = (e: React.MouseEvent, order: any) => {
    if (e) e.stopPropagation();
    const newCart = { ...cart };
    order.items.forEach((item: any) => {
      newCart[item.id] = (newCart[item.id] || 0) + item.qty;
    });
    setCart(newCart);
    
    let totalQ = 0;
    Object.values(newCart).forEach((q: any) => { if (q > 0) totalQ += q; });
    setCardQty(totalQ);
    
    showToast('Items added to cart!');
    setIsAuthOpen(false);
    setIsCartOpen(true);
    setOrderDetailId(null);
  };

  const requestEmailOTP = () => {
    const email = editForm.email.trim().toLowerCase();
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) { showToast('⚠️ Enter a valid email address'); return; }
    if (email === currentUser.email) { showToast('ℹ️ This is already your email'); return; }
    if (users[email]) { showToast('⚠️ This email is already in use'); return; }
    
    const otp = String(Math.floor(100000 + Math.random() * 900000));
    setPendingOTP(otp);
    setPendingNewEmail(email);
    setOtpSent(true);
    setOtpInput('');
    setOtpStatus({ msg: `OTP sent! (Demo: use code ${otp})`, type: 'pending' });
    showToast('📧 OTP sent to ' + email);
  };

  const verifyEmailOTP = () => {
    if (otpInput.trim() !== pendingOTP) {
      setOtpStatus({ msg: 'Wrong OTP. Please try again.', type: 'error' });
      return;
    }
    
    const oldEmail = currentUser.email;
    const userData = { ...users[oldEmail] };
    const newUsers = { ...users };
    delete newUsers[oldEmail];
    newUsers[pendingNewEmail!] = userData;
    saveUsersState(newUsers);
    
    const oldStats = localStorage.getItem('rooster_stats_'+oldEmail);
    if(oldStats) localStorage.setItem('rooster_stats_'+pendingNewEmail, oldStats);
    const oldOrders = localStorage.getItem('rooster_orders_'+oldEmail);
    if(oldOrders) localStorage.setItem('rooster_orders_'+pendingNewEmail, oldOrders);
    
    localStorage.removeItem('rooster_stats_'+oldEmail);
    localStorage.removeItem('rooster_orders_'+oldEmail);
    
    saveSessionState({ ...currentUser, email: pendingNewEmail });
    setOtpStatus({ msg: '✓ Email updated successfully!', type: 'ok' });
    showToast('✅ Email updated!');
    setTimeout(() => { setOtpSent(false); }, 2000);
  };

  const changePassword = () => {
    const cur = editForm.curPassword;
    const nw = editForm.newPassword;
    if (!cur || !nw) { showToast('⚠️ Fill in both fields'); return; }
    if (users[currentUser.email].password !== btoa(cur)) { showToast('⚠️ Current password is incorrect'); return; }
    if (nw.length < 6) { showToast('⚠️ New password must be at least 6 characters'); return; }
    
    const newUsers = { ...users };
    newUsers[currentUser.email].password = btoa(nw);
    saveUsersState(newUsers);
    setEditForm({ ...editForm, curPassword: '', newPassword: '' });
    showToast('✅ Password updated!');
  };

  const selectedOrder = orderDetailId ? ordersList.find((o: any) => o.id === orderDetailId) : null;

  return (
    <>
      <div className={`auth-overlay ${isAuthOpen ? 'open' : ''}`} onClick={(e) => { if (e.target === e.currentTarget) closeAuth(); }}>
        <div className="auth-modal">
          <button className="auth-close-btn" onClick={closeAuth}>✕</button>

          {!currentUser ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
                <span style={{ fontSize: '14px', fontWeight: 600, color: 'rgba(30,35,50,0.6)', marginRight: '10px' }}>
                  {authTab === 'login' ? 'Need an account?' : 'Already have an account?'}
                </span>
                <button 
                  onClick={() => {
                    setAuthTab(authTab === 'login' ? 'signup' : 'login');
                    setAuthMsg({ text: '', type: '' });
                  }}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '20px',
                    border: '1.5px solid var(--red)',
                    background: 'var(--red)',
                    color: '#fff',
                    fontFamily: "'Rubik', sans-serif",
                    fontWeight: 800,
                    fontSize: '13px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: '0 2px 8px rgba(232,35,10,0.2)'
                  }}
                >
                  Switch to {authTab === 'login' ? 'Sign Up' : 'Login'}
                </button>
              </div>

              {authMsg.text && (
                <div className={`auth-msg ${authMsg.type} show`}>{authMsg.text}</div>
              )}

              <div className="auth-panels-wrap">
                <div className="auth-panels-inner" style={{ transform: authTab === 'signup' ? 'translateX(-100%)' : 'translateX(0)' }}>
                  
                  {/* LOGIN */}
                  <div className="auth-panel" style={{ width: '100%', flex: '0 0 100%' }}>
                    <div className="auth-input-group">
                      <label className="auth-label">Email or Phone</label>
                      <div className="auth-input-wrap">
                        <span className="auth-input-icon"><User size={15} /></span>
                        <input className="auth-input" type="text" placeholder="Email or Mobile Number" autoComplete="username" value={loginForm.identifier} onChange={e => setLoginForm({...loginForm, identifier: e.target.value})} />
                      </div>
                    </div>
                    <div className="auth-input-group">
                      <label className="auth-label">Password</label>
                      <div className="auth-input-wrap">
                        <span className="auth-input-icon"><Lock size={15} /></span>
                        <input className="auth-input" type="password" placeholder="••••••••" autoComplete="current-password" value={loginForm.password} onChange={e => setLoginForm({...loginForm, password: e.target.value})} />
                      </div>
                    </div>
                    <button className="auth-submit-btn" onClick={doLogin}>Login to Account</button>
                    <div className="auth-switch-text">Don't have an account? <span className="auth-switch-link" onClick={() => setAuthTab('signup')}>Sign Up</span></div>
                  </div>

                  {/* SIGNUP */}
                  <div className="auth-panel" style={{ width: '100%', flex: '0 0 100%' }}>
                    <div className="auth-input-group">
                      <label className="auth-label">Full Name</label>
                      <div className="auth-input-wrap">
                        <span className="auth-input-icon"><User size={15} /></span>
                        <input className="auth-input" type="text" placeholder="Your full name" autoComplete="name" value={signupForm.name} onChange={e => setSignupForm({...signupForm, name: e.target.value})} />
                      </div>
                    </div>
                    <div className="auth-input-group">
                      <label className="auth-label">Mobile Number</label>
                      <div className="auth-input-wrap">
                        <span className="auth-input-icon"><Phone size={15} /></span>
                        <input className="auth-input" type="tel" placeholder="01XXXXXXXXX" autoComplete="tel" value={signupForm.phone} onChange={e => setSignupForm({...signupForm, phone: e.target.value})} />
                      </div>
                    </div>
                    <div className="auth-input-group">
                      <label className="auth-label">Email</label>
                      <div className="auth-input-wrap">
                        <span className="auth-input-icon"><Mail size={15} /></span>
                        <input className="auth-input" type="email" placeholder="your@email.com" autoComplete="email" value={signupForm.email} onChange={e => setSignupForm({...signupForm, email: e.target.value})} />
                      </div>
                    </div>
                    <div className="auth-input-group">
                      <label className="auth-label">Password</label>
                      <div className="auth-input-wrap">
                        <span className="auth-input-icon"><Lock size={15} /></span>
                        <input className="auth-input" type="password" placeholder="Min. 6 characters" autoComplete="new-password" value={signupForm.password} onChange={e => setSignupForm({...signupForm, password: e.target.value})} />
                      </div>
                    </div>
                    <button className="auth-submit-btn" onClick={doSignup}>Create Account</button>
                    <div className="auth-switch-text">Already have an account? <span className="auth-switch-link" onClick={() => setAuthTab('login')}>Login</span></div>
                  </div>

                </div>
              </div>
            </>
          ) : (
            <div className="profile-panel active">
              <div className="profile-top">
                <div className="profile-avatar-big" onClick={() => fileInputRef.current?.click()}>
                  {!u?.avatar && <span>{currentUser.name.split(' ').map((w: string) => w[0]).join('').toUpperCase().slice(0, 2)}</span>}
                  {u?.avatar && <img src={u.avatar} alt="Profile" />}
                  <div className="avatar-edit-overlay"><Camera size={16} /></div>
                </div>
                <input type="file" ref={fileInputRef} style={{ display: 'none' }} accept="image/*" onChange={handleAvatarUpload} />
                <div className="profile-info-col">
                  <div className="profile-name">{currentUser.name}</div>
                  <div className="profile-email-sm">{currentUser.email}</div>
                </div>
              </div>

              <div className="profile-stats">
                <div className="profile-stat"><div className="profile-stat-num">{stats.orders}</div><div className="profile-stat-label">Orders</div></div>
                <div className="profile-stat"><div className="profile-stat-num">{stats.items}</div><div className="profile-stat-label">Items</div></div>
                <div className="profile-stat"><div className="profile-stat-num">৳{stats.spent}</div><div className="profile-stat-label">Spent</div></div>
              </div>

              <div className="account-tabs">
                <button className={`account-tab-btn ${accTab === 'orders' ? 'active' : ''}`} onClick={() => setAccTab('orders')}>📦 Orders</button>
                <button className={`account-tab-btn ${accTab === 'edit' ? 'active' : ''}`} onClick={() => setAccTab('edit')}>✏️ Edit</button>
                <button className={`account-tab-btn ${accTab === 'logout' ? 'active' : ''}`} onClick={() => setAccTab('logout')}>🚪 Logout</button>
              </div>

              {accTab === 'orders' && (
                <div className="account-section active">
                  {ordersList.length === 0 ? (
                    <div className="empty-orders">
                      <div className="empty-orders-icon">📦</div>
                      <p>No orders yet</p>
                      <span style={{ fontSize: '12px', color: 'rgba(30,35,50,0.3)' }}>Your order history will appear here</span>
                    </div>
                  ) : (
                    ordersList.slice().reverse().map((o: any) => (
                      <div key={o.id} className="order-item" onClick={() => setOrderDetailId(o.id)}>
                        <div className="order-item-header">
                          <div className="order-item-id">#{o.id}</div>
                          <span className={`order-status-chip status-${o.status}`}>
                            {o.status === 'confirmed' ? '✓ Confirmed' : o.status === 'out_for_delivery' ? '🛵 Out for Delivery' : o.status === 'delivered' ? '🎉 Delivered' : o.status === 'cancelled' ? '🚫 Cancelled' : '⏳ Pending'}
                          </span>
                        </div>
                        <div className="order-item-date">{o.date}</div>
                        <div className="order-item-summary">{o.items.map((i: any) => `${i.name}×${i.qty}`).join(', ')}</div>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '4px' }}>
                          <div className="order-item-total">Total: ৳{o.total}</div>
                          <button 
                            className="reorder-btn" 
                            onClick={(e) => handleReorder(e, o)}
                          >
                            <ShoppingCart size={12} /> Reorder
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                  <button className="section-logout-btn" onClick={doLogout}><LogOut size={14} /> Logout</button>
                </div>
              )}

              {accTab === 'edit' && (
                <div className="account-section active">
                  <div className="edit-group">
                    <label className="edit-label">Full Name</label>
                    <div className="edit-input-row"><input className="edit-input" type="text" value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} />{editForm.name.trim() !== currentUser.name && <button className="save-field-btn" onClick={saveName}>Save</button>}</div>
                  </div>
                  <div className="edit-group">
                    <label className="edit-label">Phone Number</label>
                    <div className="edit-input-row"><input className="edit-input" type="tel" value={editForm.phone} onChange={e => setEditForm({...editForm, phone: e.target.value})} />{editForm.phone.trim() !== (u?.phone || '') && <button className="save-field-btn" onClick={savePhone}>Save</button>}</div>
                  </div>
                  <div className="edit-group">
                    <label className="edit-label">Default Address</label>
                    <div className="edit-input-row"><input className="edit-input" type="text" value={editForm.address} onChange={e => setEditForm({...editForm, address: e.target.value})} />{editForm.address.trim() !== (u?.address || '') && <button className="save-field-btn" onClick={saveAddress}>Save</button>}</div>
                  </div>
                  <div className="edit-group">
                    <label className="edit-label">Email Address</label>
                    <div className="edit-input-row"><input className="edit-input" type="email" value={editForm.email} onChange={e => setEditForm({...editForm, email: e.target.value})} />{editForm.email.trim() !== currentUser.email && <button className="save-field-btn" onClick={requestEmailOTP}>Verify</button>}</div>
                    {otpSent && (
                      <div style={{ marginTop: '8px' }}>
                        <div className="otp-row"><input className="otp-input" type="text" maxLength={6} placeholder="------" value={otpInput} onChange={e => setOtpInput(e.target.value)} /><button className="save-field-btn" onClick={verifyEmailOTP}>Confirm</button></div>
                        <div className={`otp-status ${otpStatus.type}`}>{otpStatus.msg}</div>
                      </div>
                    )}
                  </div>
                  <div style={{ marginTop: '16px', paddingTop: '14px', borderTop: '1px solid rgba(30,35,50,0.10)' }}>
                    <div className="edit-group">
                      <label className="edit-label">Current Password</label>
                      <div className="auth-input-wrap">
                        <span className="auth-input-icon"><Lock size={14} /></span>
                        <input className="edit-input" type="password" placeholder="Current password" style={{ paddingLeft: '38px' }} value={editForm.curPassword} onChange={e => setEditForm({...editForm, curPassword: e.target.value})} />
                      </div>
                    </div>
                    <div className="edit-group">
                      <label className="edit-label">New Password</label>
                      <div className="auth-input-wrap">
                        <span className="auth-input-icon"><Lock size={14} /></span>
                        <input className="edit-input" type="password" placeholder="Min. 6 characters" style={{ paddingLeft: '38px' }} value={editForm.newPassword} onChange={e => setEditForm({...editForm, newPassword: e.target.value})} />
                      </div>
                    </div>
                    <button className="auth-submit-btn" style={{ marginTop: '4px' }} disabled={!editForm.curPassword || !editForm.newPassword} onClick={changePassword}>Update Password</button>
                  </div>
                  <button className="section-logout-btn" onClick={doLogout}><LogOut size={14} /> Logout</button>
                </div>
              )}

              {accTab === 'logout' && (
                <div className="account-section active">
                  <div style={{ background:'rgba(255,255,255,0.40)', border:'1px solid rgba(255,255,255,0.65)', borderRadius:'10px', padding:'20px 16px', textAlign:'center', marginBottom:'14px' }}>
                    <div style={{ fontSize:'40px', marginBottom:'12px' }}>🚪</div>
                    <div style={{ fontFamily:"'Rubik', sans-serif", fontSize:'20px', color:'#1a1d25', letterSpacing:'1px', marginBottom:'6px' }}>Ready to Leave?</div>
                    <div style={{ fontSize:'13px', color:'rgba(30,35,50,0.50)', fontWeight:600, lineHeight:1.5 }}>You'll need to log in again to place orders and view your history.</div>
                  </div>
                  <button className="section-logout-btn" onClick={doLogout} style={{ marginTop:0 }}><LogOut size={14} /> Confirm Logout</button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className={`order-detail-overlay ${orderDetailId ? 'open' : ''}`} onClick={(e) => { if (e.target === e.currentTarget) setOrderDetailId(null); }}>
        <div className="order-detail-modal">
          <div className="order-detail-header">
            <div className="order-detail-title">ORDER #{selectedOrder?.id}</div>
            <button className="detail-close" onClick={() => setOrderDetailId(null)}>✕</button>
          </div>
          {selectedOrder && (
            <div>
              <div className="detail-section">
                <div className="detail-section-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><Calendar size={13} /> Order Info</div>
                <div className="detail-row"><span>Date</span><span>{selectedOrder.date}</span></div>
                <div className="detail-row">
                  <span>Status</span>
                  <span className={`order-status-chip status-${selectedOrder.status}`}>
                    {selectedOrder.status === 'confirmed' ? '✓ Confirmed' : selectedOrder.status === 'out_for_delivery' ? '🛵 Out for Delivery' : selectedOrder.status === 'delivered' ? '🎉 Delivered' : selectedOrder.status === 'cancelled' ? '🚫 Cancelled' : '⏳ Pending'}
                  </span>
                </div>
                
                {selectedOrder.status !== 'cancelled' && (() => {
                  const s = selectedOrder.status;
                  const isActive = (levels: string[]) => levels.includes(s) ? 'active' : '';
                  return (
                    <div className="order-tracker-vertical">
                      <div className={`vt-node ${isActive(['pending', 'confirmed', 'out_for_delivery', 'delivered'])}`}>
                        <div className="vt-icon"><Clock size={16} /></div>
                        <div className="vt-content">
                          <div className="vt-title">Order Placed</div>
                          <div className="vt-desc">We have received your order and are processing it.</div>
                        </div>
                      </div>
                      <div className={`vt-node ${isActive(['confirmed', 'out_for_delivery', 'delivered'])}`}>
                        <div className="vt-icon"><CheckCircle2 size={16} /></div>
                        <div className="vt-content">
                          <div className="vt-title">Order Confirmed</div>
                          <div className="vt-desc">Your items have been prepared and packed.</div>
                        </div>
                      </div>
                      <div className={`vt-node ${isActive(['out_for_delivery', 'delivered'])}`}>
                        <div className="vt-icon"><Truck size={16} /></div>
                        <div className="vt-content">
                          <div className="vt-title">Out for Delivery</div>
                          <div className="vt-desc">Our delivery partner is on the way to you.</div>
                        </div>
                      </div>
                      <div className={`vt-node ${isActive(['delivered'])}`}>
                        <div className="vt-icon"><Home size={16} /></div>
                        <div className="vt-content">
                          <div className="vt-title">Delivered</div>
                          <div className="vt-desc">Order has been successfully hand-delivered.</div>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
              <div className="detail-section" style={{ background: '#fff', border: '1px dashed rgba(30,35,50,0.3)' }}>
                <div className="detail-section-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><ShoppingBag size={13} /> Items Ordered</div>
                <div style={{ marginBottom: '12px' }}>
                  {selectedOrder.items.map((i: any) => (
                    <div key={i.id} className="receipt-item">
                      <div className="receipt-item-name">
                        <span className="receipt-item-qty">{i.qty}x</span> {i.name}
                      </div>
                      <span>৳{i.price * i.qty}</span>
                    </div>
                  ))}
                </div>
                <div className="detail-row" style={{ marginTop: '12px' }}><span>Subtotal</span><span>৳{selectedOrder.total - DELIVERY_CHARGE}</span></div>
                <div className="detail-row"><span>Delivery Charge</span><span>৳{DELIVERY_CHARGE}</span></div>
                <div className="detail-row total-row"><span>Total</span><span>৳{selectedOrder.total}</span></div>
              </div>
              <div className="detail-section">
                <div className="detail-section-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><MapPin size={13} /> Delivery Info</div>
                <div className="detail-row"><span>Name</span><span>{selectedOrder.customer.name}</span></div>
                <div className="detail-row"><span>Phone</span><span>{selectedOrder.customer.phone}</span></div>
                {selectedOrder.customer.email && <div className="detail-row"><span>Email</span><span>{selectedOrder.customer.email}</span></div>}
                <div className="detail-row"><span>Address</span><span style={{ textAlign: 'right', maxWidth: '180px' }}>{selectedOrder.customer.address}</span></div>
                {selectedOrder.customer.note && <div className="detail-row"><span>Note</span><span>{selectedOrder.customer.note}</span></div>}
              </div>
              <div className="detail-section">
                <div className="detail-section-label" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}><CreditCard size={13} /> Payment</div>
                <div className="detail-row"><span>Method</span><span>Cash on Delivery</span></div>
              </div>
              <button 
                className="reorder-btn-lg" 
                onClick={(e) => handleReorder(e, selectedOrder)}
              >
                <RotateCcw size={16} /> Reorder Full Order
              </button>
              {selectedOrder.status === 'pending' && (Date.now() - (selectedOrder.timestamp || 0) < 15000) && (
                <button 
                  className="section-logout-btn" 
                  style={{ background: 'var(--orange)', color: '#1a1d25', borderColor: '#e5af51', marginTop: '10px', fontWeight: 900, boxShadow: '0 4px 14px rgba(255,195,90,0.4)', textTransform: 'uppercase', letterSpacing: '0.5px' }}
                  onClick={() => handleCancelOrder(selectedOrder.id)}
                >
                  ✕ CANCEL THIS ORDER
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
