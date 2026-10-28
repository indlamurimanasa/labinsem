import { useEffect, useMemo, useState } from 'react'
import {
  ArrowDown,
  ArrowRight,
  Check,
  Heart,
  Minus,
  Plus,
  Search,
  ShoppingBag,
  X,
} from 'lucide-react'
import './App.css'

const formatPrice = (value) =>
  `₹${Number(value).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`

function handleProductImageError(event) {
  event.currentTarget.onerror = null
  event.currentTarget.src = '/product-placeholder.svg'
}

async function fetchProducts(signal) {
  const response = await fetch('/products.json', { signal })
  if (!response.ok) throw new Error(`The product list could not be loaded (${response.status}).`)

  const data = await response.json()
  if (!Array.isArray(data.products)) throw new Error('The product list has an unexpected format.')
  return data.products
}

function App() {
  const [products, setProducts] = useState([])
  const [loadState, setLoadState] = useState('loading')
  const [loadError, setLoadError] = useState('')
  const [category, setCategory] = useState('All pieces')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('featured')
  const [favorites, setFavorites] = useState(() => new Set())
  const [showFavorites, setShowFavorites] = useState(false)
  const [cart, setCart] = useState({})
  const [cartOpen, setCartOpen] = useState(false)

  useEffect(() => {
    const controller = new AbortController()
    fetchProducts(controller.signal)
      .then((loadedProducts) => {
        if (controller.signal.aborted) return
        setProducts(loadedProducts)
        setLoadState('ready')
      })
      .catch((error) => {
        if (controller.signal.aborted) return
        setLoadError(error instanceof Error ? error.message : 'Something went wrong while loading products.')
        setLoadState('error')
      })
    return () => controller.abort()
  }, [])

  const categories = useMemo(
    () => ['All pieces', ...new Set(products.map((product) => product.category))],
    [products],
  )

  const visibleProducts = useMemo(() => {
    const query = search.trim().toLowerCase()
    const matching = products.filter((product) => {
      const matchesCategory = category === 'All pieces' || product.category === category
      const matchesFavorite = !showFavorites || favorites.has(product.id)
      const matchesSearch =
        !query ||
        [product.name, product.category, product.detail]
          .filter(Boolean)
          .some((value) => value.toLowerCase().includes(query))

      return matchesCategory && matchesFavorite && matchesSearch
    })

    if (sort === 'price-low') return [...matching].sort((a, b) => a.price - b.price)
    if (sort === 'price-high') return [...matching].sort((a, b) => b.price - a.price)
    return [...matching].sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
  }, [category, favorites, products, search, showFavorites, sort])

  const cartItems = products.filter((product) => cart[product.id])
  const cartCount = Object.values(cart).reduce((total, quantity) => total + quantity, 0)
  const cartTotal = cartItems.reduce((total, product) => total + product.price * cart[product.id], 0)

  function toggleFavorite(productId) {
    setFavorites((current) => {
      const next = new Set(current)
      if (next.has(productId)) next.delete(productId)
      else next.add(productId)
      return next
    })
  }

  function updateCart(productId, amount) {
    setCart((current) => {
      const quantity = (current[productId] ?? 0) + amount
      if (quantity <= 0) {
        const next = { ...current }
        delete next[productId]
        return next
      }
      return { ...current, [productId]: quantity }
    })
  }

  return (
    <div className="storefront">
      <div className="announcement">
        <span>Thoughtful things, made to be lived with.</span>
        <span className="announcement-note">Complimentary delivery on orders over ₹5,000</span>
      </div>

      <header className="site-header">
        <a className="wordmark" href="#home" aria-label="Forma home">forma<span>.</span></a>
        <nav className="main-nav" aria-label="Main navigation">
          <a className="nav-active" href="#collection">Shop all</a>
          <a href="#collection" onClick={() => setCategory('Furniture')}>Furniture</a>
          <a href="#collection" onClick={() => setCategory('Lighting')}>Lighting</a>
          <a href="#collection" onClick={() => setCategory('Objects')}>Objects</a>
        </nav>
        <div className="header-actions">
          <button
            type="button"
            className={`header-icon ${showFavorites ? 'is-active' : ''}`}
            aria-label={showFavorites ? 'Show all products' : 'Show favorites'}
            aria-pressed={showFavorites}
            onClick={() => {
              setShowFavorites((current) => !current)
              setCategory('All pieces')
            }}
          >
            <Heart size={20} strokeWidth={1.6} />
            {favorites.size > 0 && <span className="icon-count">{favorites.size}</span>}
          </button>
          <button type="button" className="bag-button" onClick={() => setCartOpen(true)}>
            <ShoppingBag size={18} strokeWidth={1.7} />
            <span>Bag</span>
            <span className="bag-count">{cartCount}</span>
          </button>
        </div>
      </header>

      <main id="home">
        <section className="hero" aria-labelledby="hero-title">
          <div className="hero-copy">
            <span className="eyebrow"><span className="eyebrow-line" /> A slower kind of living</span>
            <h1 id="hero-title">Make room for<br /><em>good things.</em></h1>
            <p>Considered pieces for the everyday. Designed with intention, made to stay.</p>
            <a className="hero-link" href="#collection">Explore the collection <ArrowRight size={16} /></a>
          </div>
          <div className="hero-image" role="img" aria-label="Calm, sunlit living room with thoughtful natural furnishings">
            <div className="hero-caption"><span>THE EVERYDAY EDIT</span><span>NO. 01 — AT HOME</span></div>
          </div>
          <div className="hero-index"><span>01</span><span className="index-rule" /><span>04</span></div>
        </section>

        <section className="collection" id="collection" aria-labelledby="collection-title">
          <div className="collection-heading">
            <div>
              <span className="eyebrow"><span className="eyebrow-line" /> The Forma collection</span>
              <h2 id="collection-title">{showFavorites ? 'Your saved pieces' : 'Objects for living'}</h2>
            </div>
            <p className="collection-intro">Useful, beautiful, and a little bit special.<br />Find something that feels like you.</p>
          </div>

          <div className="catalog-toolbar">
            <div className="category-list" aria-label="Filter by category">
              {categories.map((item) => (
                <button
                  type="button"
                  key={item}
                  className={`category-button ${category === item ? 'selected' : ''}`}
                  onClick={() => setCategory(item)}
                >
                  {item}
                </button>
              ))}
            </div>
            <div className="catalog-controls">
              <label className="search-field">
                <Search size={16} strokeWidth={1.7} />
                <input
                  type="search"
                  placeholder="Find a piece"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  aria-label="Search products"
                />
              </label>
              <label className="sort-field">
                <span className="sr-only">Sort products</span>
                <select value={sort} onChange={(event) => setSort(event.target.value)}>
                  <option value="featured">Featured</option>
                  <option value="price-low">Price: low to high</option>
                  <option value="price-high">Price: high to low</option>
                </select>
                <ArrowDown size={14} aria-hidden="true" />
              </label>
            </div>
          </div>

          {loadState === 'loading' && (
            <div className="catalog-message" role="status">Gathering the good things…</div>
          )}
          {loadState === 'error' && (
            <div className="catalog-message error-message" role="alert">
              <p>{loadError}</p>
              <button
                type="button"
                className="text-button"
                onClick={() => {
                  setLoadState('loading')
                  setLoadError('')
                  fetchProducts()
                    .then((loadedProducts) => {
                      setProducts(loadedProducts)
                      setLoadState('ready')
                    })
                    .catch((error) => {
                      setLoadError(error instanceof Error ? error.message : 'Something went wrong while loading products.')
                      setLoadState('error')
                    })
                }}
              >
                Try again <ArrowRight size={15} />
              </button>
            </div>
          )}
          {loadState === 'ready' && visibleProducts.length > 0 && (
            <>
              <div className="results-line">
                <span>{String(visibleProducts.length).padStart(2, '0')} pieces</span>
                {showFavorites && <button className="clear-filter" type="button" onClick={() => setShowFavorites(false)}>Clear saved filter <X size={13} /></button>}
              </div>
              <div className="product-grid">
                {visibleProducts.map((product, index) => {
                  const isFavorite = favorites.has(product.id)
                  const inBag = Boolean(cart[product.id])

                  return (
                    <article className="product-card" key={product.id}>
                      <div className="product-image-wrap">
                        <img
                          className="product-image"
                          src={product.image}
                          alt={product.imageAlt || product.name}
                          loading={index < 4 ? 'eager' : 'lazy'}
                          onError={handleProductImageError}
                        />
                        {product.label && <span className="product-label">{product.label}</span>}
                        <button
                          className={`favorite-button ${isFavorite ? 'selected' : ''}`}
                          type="button"
                          aria-label={isFavorite ? `Remove ${product.name} from favorites` : `Add ${product.name} to favorites`}
                          aria-pressed={isFavorite}
                          onClick={() => toggleFavorite(product.id)}
                        >
                          <Heart size={18} strokeWidth={1.7} fill={isFavorite ? 'currentColor' : 'none'} />
                        </button>
                        <button
                          className={`quick-add ${inBag ? 'added' : ''}`}
                          type="button"
                          onClick={() => updateCart(product.id, 1)}
                          aria-label={`Add ${product.name} to bag`}
                        >
                          {inBag ? <Check size={17} /> : <Plus size={18} />}
                          <span>{inBag ? 'Added' : 'Add to bag'}</span>
                        </button>
                      </div>
                      <div className="product-details">
                        <div className="product-title-row">
                          <div>
                            <span className="product-category">{product.category}</span>
                            <h3>{product.name}</h3>
                          </div>
                          <span className="product-price">{formatPrice(product.price)}</span>
                        </div>
                        {product.detail && <p className="product-description">{product.detail}</p>}
                      </div>
                    </article>
                  )
                })}
              </div>
            </>
          )}
          {loadState === 'ready' && visibleProducts.length === 0 && (
            <div className="catalog-message empty-message">
              <p>{showFavorites && favorites.size === 0 ? 'Your saved pieces will find a home here.' : 'No pieces found. Try another search or category.'}</p>
              <button
                type="button"
                className="text-button"
                onClick={() => {
                  setSearch('')
                  setCategory('All pieces')
                  setShowFavorites(false)
                }}
              >
                See all pieces <ArrowRight size={15} />
              </button>
            </div>
          )}
        </section>
      </main>

      <footer className="site-footer">
        <a className="wordmark footer-wordmark" href="#home">forma<span>.</span></a>
        <p>Good things, for everyday living.</p>
        <span>Made for living well&nbsp; · &nbsp;© 2025 Forma</span>
      </footer>

      {cartOpen && (
        <div className="drawer-backdrop" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setCartOpen(false)
        }}>
          <aside className="cart-drawer" role="dialog" aria-modal="true" aria-labelledby="cart-title">
            <div className="drawer-heading">
              <div><span className="eyebrow">A few good things</span><h2 id="cart-title">Your bag <span>({cartCount})</span></h2></div>
              <button type="button" className="close-drawer" aria-label="Close bag" onClick={() => setCartOpen(false)}><X size={20} /></button>
            </div>
            {cartItems.length === 0 ? (
              <div className="cart-empty">
                <ShoppingBag size={30} strokeWidth={1.2} />
                <p>Your bag is taking a little breather.</p>
                <button type="button" className="text-button" onClick={() => setCartOpen(false)}>Explore the collection <ArrowRight size={15} /></button>
              </div>
            ) : (
              <>
                <div className="cart-items">
                  {cartItems.map((product) => (
                    <div className="cart-item" key={product.id}>
                      <img src={product.image} alt="" onError={handleProductImageError} />
                      <div className="cart-item-info">
                        <span className="product-category">{product.category}</span>
                        <h3>{product.name}</h3>
                        <span>{formatPrice(product.price)}</span>
                        <div className="quantity-control" aria-label={`Quantity of ${product.name}`}>
                          <button type="button" aria-label={`Remove one ${product.name}`} onClick={() => updateCart(product.id, -1)}><Minus size={13} /></button>
                          <span>{cart[product.id]}</span>
                          <button type="button" aria-label={`Add one ${product.name}`} onClick={() => updateCart(product.id, 1)}><Plus size={13} /></button>
                        </div>
                      </div>
                      <button type="button" className="remove-item" aria-label={`Remove ${product.name} from bag`} onClick={() => setCart((current) => {
                        const next = { ...current }
                        delete next[product.id]
                        return next
                      })}><X size={15} /></button>
                    </div>
                  ))}
                </div>
                <div className="cart-summary">
                  <div className="subtotal"><span>Subtotal</span><span>{formatPrice(cartTotal)}</span></div>
                  <p>Shipping and taxes calculated at checkout.</p>
                  <button type="button" className="checkout-button" onClick={() => setCartOpen(false)}>Continue to checkout <ArrowRight size={16} /></button>
                  <button type="button" className="continue-shopping" onClick={() => setCartOpen(false)}>Continue shopping</button>
                </div>
              </>
            )}
          </aside>
        </div>
      )}
    </div>
  )
}

export default App
