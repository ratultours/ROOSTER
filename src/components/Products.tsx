import React from 'react';
import { Search, ShoppingBag, Heart } from 'lucide-react';
import { useAppContext, products } from '../AppContext';

export function Products() {
  const {
    currentCategory, setCurrentCategory,
    searchQuery, setSearchQuery,
    cardQty, setCardQty,
    cart, setCart,
    showToast,
    currentUser,
    users,
    saveUsersState
  } = useAppContext();

  const [animatingCard, setAnimatingCard] = React.useState<number | null>(null);
  const [addedItem, setAddedItem] = React.useState<number | null>(null);

  const toggleFavorite = (id: number) => {
    if (!currentUser) {
      showToast('⚠️ Please login to favor items');
      return;
    }
    const u = users[currentUser.email];
    const favs = u.favorites || [];
    const isFav = favs.includes(id);
    const newFavs = isFav ? favs.filter((fid: number) => fid !== id) : [...favs, id];
    
    const newUsers = { ...users };
    newUsers[currentUser.email] = { ...u, favorites: newFavs };
    saveUsersState(newUsers);
    
    showToast(isFav ? 'Removed from favorites' : '❤️ Added to favorites');
  };

  const getFilteredProducts = () => {
    let list = currentCategory === 'all' ? products : products.filter(p => p.category === currentCategory);
    if (searchQuery) {
      list = list.filter(p => p.name.toLowerCase().includes(searchQuery) || p.category.toLowerCase().includes(searchQuery));
    }
    return list;
  };

  const filtered = getFilteredProducts();

  const handleAddQty = (id: number, delta: number) => {
    setCardQty((prev: any) => ({
      ...prev,
      [id]: Math.max(1, (prev[id] || 1) + delta)
    }));
  };

  const handleAddToCart = (id: number) => {
    const qty = cardQty[id] || 1;
    setCart((prev: any) => ({
      ...prev,
      [id]: (prev[id] || 0) + qty
    }));
    
    setAnimatingCard(id);
    setAddedItem(id);
    setTimeout(() => {
      setAnimatingCard(prev => prev === id ? null : prev);
    }, 350);
    setTimeout(() => {
      setAddedItem(prev => prev === id ? null : prev);
    }, 900);

    const product = products.find(p => p.id === id);
    showToast(`${product?.name} × ${qty} added!`);
  };

  const getCatLabel = (c: string) => {
    return { meatbox: '🥩 Meatbox', fries: '🍟 Fries', dumpling: '🥟 Dumpling' }[c] || c;
  };

  const sectionHeading = searchQuery ? '🔍 Search Results' : (currentCategory === 'all' ? '🔥 All Items' : getCatLabel(currentCategory));

  return (
    <>
      {/* SEARCH BAR */}
      <div className="search-wrap">
        <div className="search-box">
          <span className="search-icon">
            <Search size={16} strokeWidth={2.2} />
          </span>
          <input
            className="search-input"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value.toLowerCase())}
            placeholder="Search for meatbox, fries, dumpling..."
          />
          {searchQuery && (
            <button className="search-clear show" onClick={() => setSearchQuery('')}>✕</button>
          )}
        </div>
        {searchQuery && (
          <div className="search-result-count show">{filtered.length} result{filtered.length !== 1 ? 's' : ''} for "{searchQuery}"</div>
        )}
      </div>

      {/* CATEGORY TABS */}
      <div className="category-wrap">
        <div className={`cat-tab ${currentCategory === 'all' ? 'active' : ''}`} onClick={() => setCurrentCategory('all')}>🔥 All Items</div>
        <div className={`cat-tab ${currentCategory === 'meatbox' ? 'active' : ''}`} onClick={() => setCurrentCategory('meatbox')}>🥩 Meatbox</div>
        <div className={`cat-tab ${currentCategory === 'fries' ? 'active' : ''}`} onClick={() => setCurrentCategory('fries')}>🍟 Fries</div>
        <div className={`cat-tab ${currentCategory === 'dumpling' ? 'active' : ''}`} onClick={() => setCurrentCategory('dumpling')}>🥟 Dumpling</div>
      </div>

      {/* PRODUCT GRID */}
      <div className="section" id="products-section">
        <div className="section-title">{sectionHeading}</div>
        <div className="products-grid">
          {filtered.length === 0 ? (
            <div className="no-results" style={{ gridColumn: '1 / -1' }}>
              <div className="no-results-icon">🔍</div>
              <p>No results found</p>
              <span>Try a different keyword</span>
            </div>
          ) : (
            filtered.map(p => {
              const qty = cardQty[p.id] || 1;
              const disc = Math.round(((p.oldPrice - p.price) / p.oldPrice) * 100);
              const catLabel = getCatLabel(p.category).replace(/[^\w\s]/gi, '').trim();
              
              return (
                <div key={p.id} className={`product-card ${animatingCard === p.id ? 'adding' : ''}`}>
                  <div className="product-img-wrap">
                    <img src={p.img} alt={p.name} loading="lazy" onError={(e) => { (e.target as any).style.display = 'none'; }} />
                    <div className="badge-discount">-{disc}%</div>
                    <button 
                      onClick={(e) => { e.stopPropagation(); toggleFavorite(p.id); }}
                      style={{
                        position: 'absolute', top: '10px', right: '10px',
                        background: 'rgba(255,255,255,0.85)', backdropFilter: 'blur(8px)',
                        border: 'none', borderRadius: '50%', width: '30px', height: '30px',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', zIndex: 10, boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
                      }}
                    >
                      <Heart size={16} fill={currentUser && users[currentUser.email]?.favorites?.includes(p.id) ? "var(--red)" : "none"} color={currentUser && users[currentUser.email]?.favorites?.includes(p.id) ? "var(--red)" : "#1a1d25"} />
                    </button>
                  </div>
                  <div className="product-body">
                    <div className="product-category">{catLabel}</div>
                    <div className="product-name">{p.name}</div>
                    <div className="price-row">
                      <div className="price-current">৳{p.price}</div>
                      <div className="price-old">৳{p.oldPrice}</div>
                    </div>
                    <div className="action-row">
                      <div className="qty-control">
                        <button className="qty-btn" onClick={() => handleAddQty(p.id, -1)}>−</button>
                        <div className="qty-num">{qty}</div>
                        <button className="qty-btn" onClick={() => handleAddQty(p.id, 1)}>+</button>
                      </div>
                      <button className={`add-btn ${addedItem === p.id ? 'added-success' : ''}`} onClick={() => handleAddToCart(p.id)}>
                        {addedItem === p.id ? (
                          <>✓ Added</>
                        ) : (
                          <><ShoppingBag size={13} strokeWidth={2.2} /> Add</>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
}
