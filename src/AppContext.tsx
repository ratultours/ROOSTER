import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export const DELIVERY_CHARGE = 70;

export interface Product {
    id: number;
    category: string;
    name: string;
    price: number;
    oldPrice: number;
    img: string;
}

export const products: Product[] = [
  { id: 1, category: 'meatbox', name: 'Overloded', price: 220, oldPrice: 250, img: 'https://storage.googleapis.com/takeapp/media/cmjn769e1000104le7ls295vk.jpeg' },
  { id: 2, category: 'meatbox', name: 'Sausage Carnival', price: 250, oldPrice: 280, img: 'https://storage.googleapis.com/takeapp/media/cmjn80utm000004jx83vh9a6y.jpeg' },
  { id: 3, category: 'meatbox', name: 'Cheesy Bounce', price: 260, oldPrice: 290, img: 'https://storage.googleapis.com/takeapp/media/cmjn82sf1000104jx1gdy78ek.jpeg' },
  { id: 4, category: 'meatbox', name: 'Meatball Explore', price: 260, oldPrice: 290, img: 'https://storage.googleapis.com/takeapp/media/cmjn86wso000104jua8al4wen.jpeg' },
  { id: 5, category: 'fries', name: 'French Fries', price: 120, oldPrice: 150, img: 'https://storage.googleapis.com/takeapp/media/cmjn7i8fw000204lb482ogrv3.jpg' },
  { id: 6, category: 'dumpling', name: 'Fried Dumpling', price: 180, oldPrice: 200, img: 'https://storage.googleapis.com/takeapp/media/cmjn7e25l000404icfmlg2pts.jpg' },
  { id: 7, category: 'dumpling', name: 'Steam Dumpling', price: 170, oldPrice: 190, img: 'https://storage.googleapis.com/takeapp/media/cmjn7dqkl000804l46g3n7y1c.jpg' },
  { id: 8, category: 'dumpling', name: 'Bbq Steam Dumpling', price: 190, oldPrice: 230, img: 'https://storage.googleapis.com/takeapp/media/cmjn88lrb000304jjeqmjdnxp.jpg' },
  { id: 9, category: 'dumpling', name: 'Bbq Fried Dumpling', price: 200, oldPrice: 230, img: 'https://storage.googleapis.com/takeapp/media/cmjn8a729000304kwg8jw2zyf.jpg' }
];

export const AppContext = createContext<any>(null);

export const AppProvider = ({ children }: { children: ReactNode }) => {
  const [cart, setCart] = useState<Record<number, number>>({});
  const [cardQty, setCardQty] = useState<Record<number, number>>({});
  const [currentCategory, setCurrentCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const [users, setUsers] = useState<Record<string, any>>(() => JSON.parse(localStorage.getItem('rooster_users') || '{}'));
  const [currentUser, setCurrentUser] = useState<any>(() => JSON.parse(localStorage.getItem('rooster_session') || 'null'));

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isSuccessOpen, setIsSuccessOpen] = useState(false);
  const [orderDetailId, setOrderDetailId] = useState<string | null>(null);
  const [accTab, setAccTab] = useState<'orders'|'edit'|'logout'>('orders');

  const [toast, setToast] = useState({ show: false, msg: '' });

  useEffect(() => {
    if (isCartOpen || isAuthOpen || isCheckoutOpen || isSuccessOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isCartOpen, isAuthOpen, isCheckoutOpen, isSuccessOpen]);

  useEffect(() => {
    if (!currentUser) return;
    const interval = setInterval(() => {
      const orders = getOrders(currentUser.email);
      let changed = false;
      const now = Date.now();
      
      const newOrders = orders.map((o: any) => {
        if (!o.timestamp) return o;
        const elapsed = now - o.timestamp;
        let newStatus = o.status;
        
        if (o.status === 'pending' && elapsed > 15000) {
           newStatus = 'confirmed';
        } else if (o.status === 'confirmed' && elapsed > 30000) {
           newStatus = 'out_for_delivery';
        } else if (o.status === 'out_for_delivery' && elapsed > 45000) {
           newStatus = 'delivered';
        }
        
        if (newStatus !== o.status) {
          changed = true;
          return { ...o, status: newStatus };
        }
        return o;
      });
      
      if (changed) {
        setOrders(currentUser.email, newOrders);
        // Force state update to re-render AuthProfile if open
        setUsers({ ...users });
      }
    }, 5000);
    return () => clearInterval(interval);
  }, [currentUser, users]);

  const showToast = (msg: string) => {
    setToast({ show: true, msg });
    setTimeout(() => setToast({ show: false, msg: '' }), 4000);
  };

  const saveUsersState = (newUsers: any) => {
    setUsers(newUsers);
    localStorage.setItem('rooster_users', JSON.stringify(newUsers));
  };

  const saveSessionState = (u: any) => {
    setCurrentUser(u);
    if (u) {
      localStorage.setItem('rooster_session', JSON.stringify(u));
    } else {
      localStorage.removeItem('rooster_session');
    }
  };

  const getStats = (email: string) => JSON.parse(localStorage.getItem('rooster_stats_'+email) || '{"orders":0,"items":0,"spent":0}');
  const setStats = (email: string, s: any) => localStorage.setItem('rooster_stats_'+email, JSON.stringify(s));
  const getOrders = (email: string) => JSON.parse(localStorage.getItem('rooster_orders_'+email) || '[]');
  const setOrders = (email: string, o: any) => localStorage.setItem('rooster_orders_'+email, JSON.stringify(o));

  return (
    <AppContext.Provider value={{
      cart, setCart, cardQty, setCardQty, currentCategory, setCurrentCategory,
      searchQuery, setSearchQuery, users, saveUsersState, currentUser, saveSessionState,
      isCartOpen, setIsCartOpen, isAuthOpen, setIsAuthOpen, isCheckoutOpen, setIsCheckoutOpen,
      isSuccessOpen, setIsSuccessOpen, orderDetailId, setOrderDetailId, toast, showToast,
      getStats, setStats, getOrders, setOrders, accTab, setAccTab
    }}>
      {children}
    </AppContext.Provider>
  )
};

export const useAppContext = () => useContext(AppContext);
