import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { PipelineVisualizer } from '../components/PipelineVisualizer';
import { Modal } from '../components/Modal';
import {
  ShoppingBag,
  ShoppingCart,
  Package,
  Clock,
  RefreshCw,
  CheckCircle2,
  MapPin,
  Building2,
  Star,
  Eye,
  Plus,
  Minus,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Truck,
  Boxes,
} from 'lucide-react';

const DEFAULT_PRODUCTS = [
  {
    _id: 'p_101',
    sku: 'PRD-101',
    name: 'Silk Designer Dress',
    category: 'Fashion Apparel',
    price: 1499,
    rating: 4.9,
    reviews: 128,
    image: 'https://images.unsplash.com/photo-1551488831-00ddcb6c6bd3?auto=format&fit=crop&w=800&q=80',
    description: 'Elegant handcrafted silk designer dress tailored for luxury, comfort & special occasions.',
    quantityInStock: 40,
    hasSizes: true,
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    type: 'apparel',
  },
  {
    _id: 'p_102',
    sku: 'PRD-102',
    name: 'Casual Cotton T-Shirt',
    category: 'Fashion Apparel',
    price: 699,
    rating: 4.7,
    reviews: 94,
    image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=800&q=80',
    description: 'Premium 100% breathable organic cotton daily casual t-shirt with classic fit.',
    quantityInStock: 85,
    hasSizes: true,
    sizes: ['S', 'M', 'L', 'XL'],
    type: 'apparel',
  },
  {
    _id: 'p_103',
    sku: 'PRD-103',
    name: 'Running Sneakers',
    category: 'Footwear',
    price: 2299,
    rating: 4.8,
    reviews: 210,
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=800&q=80',
    description: 'Lightweight high-performance cushion running shoes designed for maximum comfort & grip.',
    quantityInStock: 30,
    hasSizes: true,
    sizes: ['7 UK', '8 UK', '9 UK', '10 UK', '11 UK'],
    type: 'footwear',
  },
  {
    _id: 'p_104',
    sku: 'PRD-104',
    name: 'Laptop Backpack',
    category: 'Accessories',
    price: 999,
    rating: 4.6,
    reviews: 156,
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80',
    description: 'Water-resistant multi-compartment laptop backpack with USB charging port & anti-theft pocket.',
    quantityInStock: 50,
    type: 'accessory',
  },
  {
    _id: 'p_105',
    sku: 'PRD-105',
    name: 'Wireless Headphones',
    category: 'Electronics',
    price: 1799,
    rating: 4.8,
    reviews: 312,
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
    description: 'Active noise-cancelling wireless Bluetooth headphones with deep bass & 30h battery life.',
    quantityInStock: 35,
    type: 'tech',
  },
  {
    _id: 'p_106',
    sku: 'PRD-106',
    name: 'Smart Watch',
    category: 'Electronics',
    price: 2499,
    rating: 4.7,
    reviews: 180,
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
    description: 'Fitness tracker smartwatch with heart rate monitor, SpO2 sensor & HD AMOLED display.',
    quantityInStock: 25,
    type: 'tech',
  },
  {
    _id: 'p_107',
    sku: 'PRD-107',
    name: 'Ergonomic Office Chair',
    category: 'Furniture',
    price: 5999,
    rating: 4.9,
    reviews: 75,
    image: 'https://images.unsplash.com/photo-1580480055273-228ff5388ef8?auto=format&fit=crop&w=800&q=80',
    description: 'High-back ergonomic mesh chair with adjustable lumbar support, headrest & 3D armrests.',
    quantityInStock: 15,
    type: 'furniture',
  },
  {
    _id: 'p_108',
    sku: 'PRD-108',
    name: 'Standing Desk Converter',
    category: 'Furniture',
    price: 3499,
    rating: 4.8,
    reviews: 62,
    image: 'https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=800&q=80',
    description: 'Dual-tier gas spring standing desk converter for ergonomic home & office workstation.',
    quantityInStock: 12,
    type: 'furniture',
  },
  {
    _id: 'p_001',
    sku: 'PRD-001',
    name: 'Wireless Ergonomic Mouse',
    category: 'Electronics',
    price: 899,
    rating: 4.6,
    reviews: 110,
    image: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?auto=format&fit=crop&w=800&q=80',
    description: 'Wireless ergonomic mouse with quiet clicks, fast scrolling & adjustable DPI.',
    quantityInStock: 45,
    type: 'tech',
  },
  {
    _id: 'p_002',
    sku: 'PRD-002',
    name: 'Mechanical Gaming Keyboard',
    category: 'Electronics',
    price: 2199,
    rating: 4.8,
    reviews: 215,
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
    description: 'RGB mechanical gaming keyboard with tactile blue switches & wrist rest.',
    quantityInStock: 28,
    type: 'tech',
  },
];

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80';

export const CustomerPortal = () => {
  const { account } = useAuth();
  const [activeTab, setActiveTab] = useState('SHOP'); // SHOP vs CART vs ORDERS
  const [selectedCategory, setSelectedCategory] = useState('ALL');

  const [products, setProducts] = useState(DEFAULT_PRODUCTS);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);

  // Modals
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [selectedSize, setSelectedSize] = useState('M');
  const [productQty, setProductQty] = useState(1);

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [selectedTrackOrder, setSelectedTrackOrder] = useState(null);

  // Checkout Form
  const [customerName, setCustomerName] = useState(account?.name || 'Demo Customer');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [address, setAddress] = useState('H.No 4-12/A, Jubilee Hills');
  const [city, setCity] = useState('Hyderabad Central');
  const [pincode, setPincode] = useState('500033');
  const [placingOrder, setPlacingOrder] = useState(false);

  // Fetch Inventory Products & Customer Orders
  const loadData = async () => {
    try {
      const invRes = await api.getInventory();
      if (invRes && invRes.products && invRes.products.length > 0) {
        // Merge DB products with UI image URLs & properties
        const merged = DEFAULT_PRODUCTS.map((defP) => {
          const dbP = invRes.products.find((p) => p.sku === defP.sku || p.name === defP.name);
          return {
            ...defP,
            quantityInStock: dbP ? dbP.quantityInStock - (dbP.quantityReserved || 0) : defP.quantityInStock,
            price: dbP?.price || defP.price,
            rating: dbP?.rating || defP.rating,
            image: dbP?.image || defP.image,
          };
        });
        setProducts(merged);
      }
    } catch (e) {
      console.log('Using catalog dataset');
    }

    setLoadingOrders(true);
    try {
      const ordRes = await api.getOrders();
      setOrders(ordRes.orders || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingOrders(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Cart operations
  const addToCart = (product, size = selectedSize, qty = productQty) => {
    setCart((prevCart) => {
      const existingIndex = prevCart.findIndex((item) => item.product._id === product._id && item.size === size);
      if (existingIndex > -1) {
        const updated = [...prevCart];
        updated[existingIndex].quantity += qty;
        return updated;
      } else {
        return [...prevCart, { product, size: product.hasSizes ? size : null, quantity: qty }];
      }
    });
    setSelectedProduct(null);
    setProductQty(1);
  };

  const updateCartQty = (index, delta) => {
    setCart((prev) => {
      const updated = [...prev];
      const newQty = updated[index].quantity + delta;
      if (newQty <= 0) {
        return updated.filter((_, i) => i !== index);
      }
      updated[index].quantity = newQty;
      return updated;
    });
  };

  const removeCartItem = (index) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const cartSubtotal = cart.reduce((sum, item) => sum + item.product.price * item.quantity, 0);

  // Place Order Action (Calls backend API)
  const handlePlaceOrder = async (e) => {
    e.preventDefault();
    if (cart.length === 0) return;
    setPlacingOrder(true);
    try {
      const itemsPayload = cart.map((item) => ({
        sku: item.product.sku,
        quantity: item.quantity,
        name: item.product.name,
        size: item.size,
      }));

      const payload = {
        customerName: `${customerName} (${cart[0].product.name})`,
        destinationCity: `${city} (${address})`,
        deliveryDeadline: new Date(Date.now() + 86400000).toISOString(),
        priority: 'CRITICAL',
        items: itemsPayload,
      };

      const res = await api.createOrder(payload);
      const createdOrder = res.order || res;

      setCart([]);
      setIsCheckoutOpen(false);
      await loadData();
      setActiveTab('ORDERS');
      if (createdOrder) {
        setSelectedTrackOrder(createdOrder);
      }
    } catch (err) {
      alert(err.message || 'Failed to place order');
    } finally {
      setPlacingOrder(false);
    }
  };

  const formatDate = (dateInput) => {
    if (!dateInput) return 'Pending...';
    const d = new Date(dateInput);
    return `${d.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} • ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  const filteredProducts = selectedCategory === 'ALL'
    ? products
    : products.filter((p) => p.category.toLowerCase().includes(selectedCategory.toLowerCase()));

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="main-content" style={{ maxWidth: '1120px' }}>
      {/* Top Customer Header Banner */}
      <div
        style={{
          backgroundColor: '#0F1B2D',
          borderRadius: '16px',
          padding: '24px 32px',
          color: '#FFFFFF',
          marginBottom: '24px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          boxShadow: '0 8px 24px rgba(15, 27, 45, 0.12)',
        }}
      >
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: '800', color: '#14B8A6', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>
            SMART WAREHOUSE E-COMMERCE PORTAL
          </div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: '800', margin: 0, letterSpacing: '-0.02em' }}>
            Welcome, {account?.name || 'Customer'}
          </h1>
          <p style={{ color: '#94A3B8', fontSize: '0.875rem', marginTop: '4px', marginBottom: 0 }}>
            Shop premium items & track end-to-end warehouse fulfillment live in real-time.
          </p>
        </div>

        {/* E-Commerce Tab Navigation */}
        <div style={{ display: 'flex', gap: '8px', backgroundColor: 'rgba(255, 255, 255, 0.08)', padding: '6px', borderRadius: '12px' }}>
          <button
            className={`btn ${activeTab === 'SHOP' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '8px 16px', fontSize: '0.85rem', fontWeight: '700' }}
            onClick={() => setActiveTab('SHOP')}
          >
            <ShoppingBag size={16} /> Shop Products
          </button>

          <button
            className={`btn ${activeTab === 'CART' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '8px 16px', fontSize: '0.85rem', fontWeight: '700', position: 'relative' }}
            onClick={() => setActiveTab('CART')}
          >
            <ShoppingCart size={16} /> Cart
            {totalCartCount > 0 && (
              <span
                style={{
                  backgroundColor: '#EF4444',
                  color: '#FFFFFF',
                  fontSize: '0.7rem',
                  fontWeight: '800',
                  borderRadius: '10px',
                  padding: '2px 7px',
                  marginLeft: '6px',
                }}
              >
                {totalCartCount}
              </span>
            )}
          </button>

          <button
            className={`btn ${activeTab === 'ORDERS' ? 'btn-primary' : 'btn-secondary'}`}
            style={{ padding: '8px 16px', fontSize: '0.85rem', fontWeight: '700' }}
            onClick={() => setActiveTab('ORDERS')}
          >
            <Package size={16} /> My Orders & Live Tracking ({orders.length})
          </button>
        </div>
      </div>

      {/* VIEW 1: SHOP PRODUCTS CATALOG */}
      {activeTab === 'SHOP' && (
        <div>
          {/* Category Filter Bar */}
          <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', overflowX: 'auto', paddingBottom: '4px' }}>
            {['ALL', 'Fashion Apparel', 'Footwear', 'Electronics', 'Accessories', 'Furniture'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                style={{
                  padding: '8px 18px',
                  borderRadius: '20px',
                  fontSize: '0.825rem',
                  fontWeight: '700',
                  border: '1px solid #E2E8F0',
                  cursor: 'pointer',
                  backgroundColor: selectedCategory === cat ? '#2563EB' : '#FFFFFF',
                  color: selectedCategory === cat ? '#FFFFFF' : '#475569',
                  transition: 'all 0.2s ease',
                }}
              >
                {cat === 'ALL' ? 'All Products' : cat}
              </button>
            ))}
          </div>

          {/* Product Grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px' }}>
            {filteredProducts.map((product) => (
              <div
                key={product._id}
                className="card"
                style={{
                  padding: '18px',
                  display: 'flex',
                  flexDirection: 'column',
                  justify: 'space-between',
                  transition: 'transform 0.2s ease, box-shadow 0.2s ease',
                }}
              >
                <div>
                  {/* Product Card Image Container */}
                  <div
                    style={{
                      height: '170px',
                      backgroundColor: '#F8FAFC',
                      borderRadius: '12px',
                      border: '1px solid #E2E8F0',
                      overflow: 'hidden',
                      marginBottom: '14px',
                      position: 'relative',
                    }}
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      loading="lazy"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        display: 'block',
                      }}
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = FALLBACK_IMAGE;
                      }}
                    />
                    <span
                      style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        backgroundColor: '#F0FDF4',
                        color: '#14B8A6',
                        fontSize: '0.7rem',
                        fontWeight: '800',
                        padding: '3px 8px',
                        borderRadius: '6px',
                        border: '1px solid #14B8A6',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                      }}
                    >
                      In Stock ({product.quantityInStock})
                    </span>
                  </div>

                  {/* Rating & Title */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.775rem', color: '#F59E0B', fontWeight: '700', marginBottom: '4px' }}>
                    <Star size={14} fill="#F59E0B" /> {product.rating} <span style={{ color: '#94A3B8', fontWeight: '500' }}>({product.reviews})</span>
                  </div>
                  <h3 style={{ fontSize: '1.05rem', fontWeight: '800', color: '#0F172A', marginBottom: '6px', lineHeight: '1.3' }}>
                    {product.name}
                  </h3>
                  <p style={{ fontSize: '0.775rem', color: '#64748B', lineHeight: '1.4', marginBottom: '14px', height: '36px', overflow: 'hidden' }}>
                    {product.description}
                  </p>
                </div>

                {/* Price & Action Buttons */}
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '12px' }}>
                    <span style={{ fontSize: '1.35rem', fontWeight: '800', color: '#0F172A' }}>
                      ₹{product.price.toLocaleString('en-IN')}
                    </span>
                    <span style={{ fontSize: '0.725rem', color: '#64748B' }}>
                      SKU: <strong style={{ fontFamily: 'var(--font-mono)' }}>{product.sku}</strong>
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <button
                      className="btn btn-secondary"
                      style={{ padding: '8px 10px', fontSize: '0.775rem', fontWeight: '700' }}
                      onClick={() => {
                        setSelectedProduct(product);
                        setSelectedSize(product.sizes ? product.sizes[0] : 'M');
                        setProductQty(1);
                      }}
                    >
                      <Eye size={14} /> Details
                    </button>

                    <button
                      className="btn btn-primary"
                      style={{ padding: '8px 10px', fontSize: '0.775rem', fontWeight: '700' }}
                      onClick={() => addToCart(product, product.sizes ? product.sizes[0] : 'M', 1)}
                    >
                      <Plus size={14} /> Add Cart
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 2: SHOPPING CART */}
      {activeTab === 'CART' && (
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '24px' }}>
          {/* Cart Items List */}
          <div className="card">
            <div className="card-title" style={{ borderBottom: '1px solid #E2E8F0', paddingBottom: '12px', marginBottom: '16px' }}>
              <span>Shopping Cart ({cart.length} items)</span>
              <button className="btn btn-secondary" style={{ fontSize: '0.75rem' }} onClick={() => setActiveTab('SHOP')}>
                + Add More Items
              </button>
            </div>

            {cart.length === 0 ? (
              <div style={{ padding: '48px', textAlign: 'center', color: '#64748B' }}>
                <ShoppingCart size={48} style={{ color: '#CBD5E1', marginBottom: '12px' }} />
                <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0F172A' }}>Your Cart is Empty</h3>
                <p style={{ fontSize: '0.85rem', marginBottom: '16px' }}>Browse products and add items to begin checkout.</p>
                <button className="btn btn-primary" onClick={() => setActiveTab('SHOP')}>
                  <ShoppingBag size={16} /> Explore Products
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                {cart.map((item, index) => (
                  <div
                    key={index}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '14px',
                      backgroundColor: '#F8FAFC',
                      borderRadius: '10px',
                      border: '1px solid #E2E8F0',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                      <img
                        src={item.product.image}
                        alt={item.product.name}
                        style={{
                          width: '60px',
                          height: '60px',
                          borderRadius: '8px',
                          objectFit: 'cover',
                          border: '1px solid #E2E8F0',
                        }}
                        onError={(e) => {
                          e.target.onerror = null;
                          e.target.src = FALLBACK_IMAGE;
                        }}
                      />
                      <div>
                        <div style={{ fontWeight: '800', color: '#0F172A', fontSize: '0.95rem' }}>
                          {item.product.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#64748B' }}>
                          Price: ₹{item.product.price} {item.size && `| Size: ${item.size}`}
                        </div>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                      {/* Quantity Controls */}
                      <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #CBD5E1', borderRadius: '6px', backgroundColor: '#FFFFFF' }}>
                        <button
                          style={{ border: 'none', background: 'none', padding: '4px 8px', cursor: 'pointer' }}
                          onClick={() => updateCartQty(index, -1)}
                        >
                          <Minus size={12} />
                        </button>
                        <span style={{ fontSize: '0.85rem', fontWeight: '800', padding: '0 8px' }}>{item.quantity}</span>
                        <button
                          style={{ border: 'none', background: 'none', padding: '4px 8px', cursor: 'pointer' }}
                          onClick={() => updateCartQty(index, 1)}
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      <div style={{ fontWeight: '800', color: '#0F172A', fontSize: '1rem', minWidth: '80px', textAlign: 'right' }}>
                        ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                      </div>

                      <button
                        style={{ border: 'none', background: 'none', color: '#EF4444', cursor: 'pointer', padding: '4px' }}
                        onClick={() => removeCartItem(index)}
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Cart Summary Panel */}
          <div className="card" style={{ height: 'fit-content' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0F172A', marginBottom: '16px', borderBottom: '1px solid #E2E8F0', paddingBottom: '10px' }}>
              Order Summary
            </h3>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '0.875rem', marginBottom: '20px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B' }}>
                <span>Subtotal ({totalCartCount} items)</span>
                <span style={{ fontWeight: '700', color: '#0F172A' }}>₹{cartSubtotal.toLocaleString('en-IN')}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B' }}>
                <span>Express Warehouse Delivery</span>
                <span style={{ fontWeight: '700', color: '#14B8A6' }}>FREE</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#64748B' }}>
                <span>Fulfillment Hub Handling</span>
                <span style={{ fontWeight: '700', color: '#14B8A6' }}>INCLUDED</span>
              </div>
              <div style={{ borderTop: '1px solid #E2E8F0', paddingTop: '12px', display: 'flex', justifyContent: 'space-between', fontSize: '1.1rem', fontWeight: '800', color: '#0F172A' }}>
                <span>Total Amount</span>
                <span style={{ color: '#2563EB' }}>₹{cartSubtotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            <button
              className="btn btn-primary"
              style={{ width: '100%', padding: '14px', fontSize: '0.95rem', fontWeight: '800' }}
              disabled={cart.length === 0}
              onClick={() => setIsCheckoutOpen(true)}
            >
              PROCEED TO CHECKOUT <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}

      {/* VIEW 3: MY ORDERS & LIVE TRACKING */}
      {activeTab === 'ORDERS' && (
        <div className="card">
          <div className="card-title" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span>My Placed Orders ({orders.length})</span>
            <button className="btn btn-secondary" onClick={loadData}>
              <RefreshCw size={14} /> Refresh Live Status
            </button>
          </div>

          {loadingOrders ? (
            <div style={{ padding: '48px', textAlign: 'center', color: '#64748B' }}>Loading order fulfillment status...</div>
          ) : orders.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center' }}>
              <Package size={48} style={{ color: '#CBD5E1', marginBottom: '12px' }} />
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0F172A' }}>No Orders Found</h3>
              <p style={{ fontSize: '0.85rem', color: '#64748B', marginBottom: '16px' }}>Shop products and place an order to track your shipment.</p>
              <button className="btn btn-primary" onClick={() => setActiveTab('SHOP')}>
                <ShoppingBag size={16} /> Browse Shop
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {orders.map((ord) => (
                <div
                  key={ord._id}
                  style={{
                    backgroundColor: '#FFFFFF',
                    padding: '20px',
                    borderRadius: '12px',
                    border: '1px solid #E2E8F0',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                    <div>
                      <span style={{ fontWeight: '800', fontSize: '1.1rem', color: '#0F172A', fontFamily: 'var(--font-mono)' }}>
                        #{ord.orderNumber}
                      </span>
                      <span style={{ marginLeft: '12px', fontSize: '0.85rem', color: '#64748B' }}>
                        Customer: <strong style={{ color: '#0F172A' }}>{ord.customerName}</strong>
                      </span>
                    </div>

                    <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                      <StatusBadge value={ord.status} />
                      <button
                        className="btn btn-primary"
                        style={{ padding: '6px 14px', fontSize: '0.8rem', fontWeight: '700' }}
                        onClick={() => setSelectedTrackOrder(ord)}
                      >
                        <Eye size={14} /> Track Order Journey
                      </button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '24px', fontSize: '0.825rem', color: '#64748B', backgroundColor: '#F8FAFC', padding: '10px 14px', borderRadius: '8px', marginBottom: '16px' }}>
                    <span>Handling Warehouse: <strong style={{ color: '#2563EB' }}>{ord.warehouseName || 'Central Fulfillment Hub - Zone A'}</strong></span>
                    <span>Order Date: <strong style={{ color: '#0F172A' }}>{formatDate(ord.createdAt)}</strong></span>
                    <span>Deadline: <strong style={{ color: '#F97316' }}>{formatDate(ord.deliveryDeadline)}</strong></span>
                  </div>

                  {/* Pipeline Stepper */}
                  <PipelineVisualizer status={ord.status} orderNumber={ord.orderNumber} />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: PRODUCT DETAILS & SIZE SELECTION */}
      {selectedProduct && (
        <Modal
          isOpen={!!selectedProduct}
          onClose={() => setSelectedProduct(null)}
          title={`Product Details — ${selectedProduct.name}`}
          maxWidth="560px"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ backgroundColor: '#F8FAFC', borderRadius: '12px', border: '1px solid #E2E8F0', overflow: 'hidden' }}>
              <img
                src={selectedProduct.image}
                alt={selectedProduct.name}
                style={{ width: '100%', height: '220px', objectFit: 'cover' }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = FALLBACK_IMAGE;
                }}
              />
              <div style={{ padding: '16px' }}>
                <div style={{ fontSize: '1.3rem', fontWeight: '800', color: '#0F172A' }}>{selectedProduct.name}</div>
                <div style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '2px' }}>Category: {selectedProduct.category}</div>
                <div style={{ fontSize: '1.5rem', fontWeight: '800', color: '#2563EB', marginTop: '6px' }}>
                  ₹{selectedProduct.price.toLocaleString('en-IN')}
                </div>
              </div>
            </div>

            <p style={{ fontSize: '0.875rem', color: '#475569', lineHeight: '1.5' }}>
              {selectedProduct.description}
            </p>

            {/* Size Selector for Apparel / Footwear */}
            {selectedProduct.hasSizes && selectedProduct.sizes && (
              <div>
                <label style={{ fontSize: '0.8rem', fontWeight: '800', color: '#0F172A', display: 'block', marginBottom: '8px' }}>
                  SELECT SIZE
                </label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  {selectedProduct.sizes.map((sz) => (
                    <button
                      key={sz}
                      onClick={() => setSelectedSize(sz)}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '8px',
                        fontSize: '0.85rem',
                        fontWeight: '800',
                        border: '1px solid #CBD5E1',
                        backgroundColor: selectedSize === sz ? '#2563EB' : '#FFFFFF',
                        color: selectedSize === sz ? '#FFFFFF' : '#0F172A',
                        cursor: 'pointer',
                      }}
                    >
                      {sz}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity Selector */}
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: '800', color: '#0F172A', display: 'block', marginBottom: '8px' }}>
                QUANTITY
              </label>
              <div style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid #CBD5E1', borderRadius: '8px' }}>
                <button
                  style={{ border: 'none', background: 'none', padding: '8px 14px', cursor: 'pointer' }}
                  onClick={() => setProductQty(Math.max(1, productQty - 1))}
                >
                  <Minus size={14} />
                </button>
                <span style={{ fontWeight: '800', padding: '0 12px' }}>{productQty}</span>
                <button
                  style={{ border: 'none', background: 'none', padding: '8px 14px', cursor: 'pointer' }}
                  onClick={() => setProductQty(productQty + 1)}
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '12px' }}>
              <button
                className="btn btn-secondary"
                onClick={() => {
                  addToCart(selectedProduct, selectedSize, productQty);
                }}
              >
                <Plus size={16} /> Add to Cart
              </button>
              <button
                className="btn btn-primary"
                onClick={() => {
                  addToCart(selectedProduct, selectedSize, productQty);
                  setActiveTab('CART');
                  setIsCheckoutOpen(true);
                }}
              >
                Buy Now <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* MODAL 2: CHECKOUT & WAREHOUSE ORDER RESERVATION */}
      {isCheckoutOpen && (
        <Modal
          isOpen={isCheckoutOpen}
          onClose={() => setIsCheckoutOpen(false)}
          title="Checkout & Warehouse Shipping Details"
          maxWidth="600px"
        >
          <form onSubmit={handlePlaceOrder}>
            <div className="form-group">
              <label>Full Customer Name</label>
              <input
                type="text"
                className="form-control"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="form-group">
                <label>Phone Number</label>
                <input
                  type="text"
                  className="form-control"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>City</label>
                <input
                  type="text"
                  className="form-control"
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label>Full Delivery Address</label>
              <input
                type="text"
                className="form-control"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label>Pincode</label>
              <input
                type="text"
                className="form-control"
                value={pincode}
                onChange={(e) => setPincode(e.target.value)}
                required
              />
            </div>

            {/* Warehouse Routing Highlight */}
            <div style={{ backgroundColor: '#F0FDF4', border: '1px solid #14B8A6', padding: '14px', borderRadius: '10px', marginBottom: '20px', fontSize: '0.8rem', color: '#0F172A' }}>
              <div style={{ fontWeight: '800', color: '#14B8A6', marginBottom: '4px' }}>Automatic Fulfillment Routing:</div>
              <div>• Handling Warehouse: <strong>Central Fulfillment Hub - Zone A</strong></div>
              <div>• Priority Score: <strong>CRITICAL (Auto-routes for Picking)</strong></div>
              <div>• Total Order Amount: <strong style={{ color: '#2563EB' }}>₹{cartSubtotal.toLocaleString('en-IN')}</strong></div>
            </div>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button type="button" className="btn btn-secondary" onClick={() => setIsCheckoutOpen(false)}>
                Cancel
              </button>
              <button type="submit" className="btn btn-primary" disabled={placingOrder}>
                <CheckCircle2 size={16} /> {placingOrder ? 'Submitting Order...' : 'PLACE ORDER (RESERVE IN WAREHOUSE)'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* MODAL 3: CUSTOMER LIVE ORDER TRACKING STEPPER */}
      {selectedTrackOrder && (
        <Modal
          isOpen={!!selectedTrackOrder}
          onClose={() => setSelectedTrackOrder(null)}
          title={`Live Fulfillment Tracking — #${selectedTrackOrder.orderNumber}`}
          maxWidth="640px"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div style={{ backgroundColor: '#F8FAFC', padding: '16px', borderRadius: '12px', border: '1px solid #E2E8F0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ fontSize: '1.1rem', fontWeight: '800', color: '#0F172A' }}>
                  Order #{selectedTrackOrder.orderNumber}
                </span>
                <StatusBadge value={selectedTrackOrder.status} />
              </div>
              <div style={{ fontSize: '0.85rem', color: '#64748B' }}>
                Destination: <strong style={{ color: '#0F172A' }}>{selectedTrackOrder.destinationCity}</strong> | Handling Warehouse: <strong style={{ color: '#2563EB' }}>{selectedTrackOrder.warehouseName || 'Central Fulfillment Hub - Zone A'}</strong>
              </div>
            </div>

            <div style={{ fontSize: '0.8rem', fontWeight: '800', color: '#0F172A', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              LIVE FULFILLMENT MILESTONES & JOURNEY
            </div>

            {/* Stepper Steps */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '12px 16px', backgroundColor: '#F0FDF4', border: '1px solid #14B8A6', borderRadius: '10px' }}>
                <CheckCircle2 size={22} style={{ color: '#14B8A6' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '800', fontSize: '0.9rem', color: '#0F172A' }}>1. Order Placed & Warehouse Assigned</div>
                  <div style={{ fontSize: '0.775rem', color: '#64748B' }}>{formatDate(selectedTrackOrder.createdAt)} • Central Fulfillment Hub - Zone A</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '12px 16px', backgroundColor: ['PICKED', 'PACKING_IN_PROGRESS', 'PACKED', 'QC_IN_PROGRESS', 'QC_PASSED', 'DISPATCH_IN_PROGRESS', 'DISPATCHED'].includes(selectedTrackOrder.status) ? '#F0FDF4' : '#F8FAFC', border: `1px solid ${['PICKED', 'PACKING_IN_PROGRESS', 'PACKED', 'QC_IN_PROGRESS', 'QC_PASSED', 'DISPATCH_IN_PROGRESS', 'DISPATCHED'].includes(selectedTrackOrder.status) ? '#14B8A6' : '#E2E8F0'}`, borderRadius: '10px' }}>
                <Boxes size={22} style={{ color: ['PICKED', 'PACKING_IN_PROGRESS', 'PACKED', 'QC_IN_PROGRESS', 'QC_PASSED', 'DISPATCH_IN_PROGRESS', 'DISPATCHED'].includes(selectedTrackOrder.status) ? '#14B8A6' : '#94A3B8' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '800', fontSize: '0.9rem', color: '#0F172A' }}>2. Warehouse Item Picking</div>
                  <div style={{ fontSize: '0.775rem', color: '#64748B' }}>
                    {selectedTrackOrder.traceability?.picker ? `Completed by ${selectedTrackOrder.traceability.picker.name} • ${formatDate(selectedTrackOrder.traceability.picker.timestamp)}` : formatDate(selectedTrackOrder.stageTimestamps?.pickedAt)}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '12px 16px', backgroundColor: ['PACKED', 'QC_IN_PROGRESS', 'QC_PASSED', 'DISPATCH_IN_PROGRESS', 'DISPATCHED'].includes(selectedTrackOrder.status) ? '#F0FDF4' : '#F8FAFC', border: `1px solid ${['PACKED', 'QC_IN_PROGRESS', 'QC_PASSED', 'DISPATCH_IN_PROGRESS', 'DISPATCHED'].includes(selectedTrackOrder.status) ? '#14B8A6' : '#E2E8F0'}`, borderRadius: '10px' }}>
                <Package size={22} style={{ color: ['PACKED', 'QC_IN_PROGRESS', 'QC_PASSED', 'DISPATCH_IN_PROGRESS', 'DISPATCHED'].includes(selectedTrackOrder.status) ? '#14B8A6' : '#94A3B8' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '800', fontSize: '0.9rem', color: '#0F172A' }}>3. Order Packaging & Securing</div>
                  <div style={{ fontSize: '0.775rem', color: '#64748B' }}>
                    {selectedTrackOrder.traceability?.packer ? `Completed by ${selectedTrackOrder.traceability.packer.name} • ${formatDate(selectedTrackOrder.traceability.packer.timestamp)}` : formatDate(selectedTrackOrder.stageTimestamps?.packedAt)}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '12px 16px', backgroundColor: ['QC_PASSED', 'DISPATCH_IN_PROGRESS', 'DISPATCHED'].includes(selectedTrackOrder.status) ? '#F0FDF4' : '#F8FAFC', border: `1px solid ${['QC_PASSED', 'DISPATCH_IN_PROGRESS', 'DISPATCHED'].includes(selectedTrackOrder.status) ? '#14B8A6' : '#E2E8F0'}`, borderRadius: '10px' }}>
                <ShieldCheck size={22} style={{ color: ['QC_PASSED', 'DISPATCH_IN_PROGRESS', 'DISPATCHED'].includes(selectedTrackOrder.status) ? '#14B8A6' : '#94A3B8' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '800', fontSize: '0.9rem', color: '#0F172A' }}>4. Quality Control & Inspection</div>
                  <div style={{ fontSize: '0.775rem', color: '#64748B' }}>
                    {selectedTrackOrder.traceability?.qc ? `Passed by ${selectedTrackOrder.traceability.qc.name} • ${formatDate(selectedTrackOrder.traceability.qc.timestamp)}` : formatDate(selectedTrackOrder.stageTimestamps?.qcPassedAt)}
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '12px 16px', backgroundColor: selectedTrackOrder.status === 'DISPATCHED' ? '#F0FDF4' : '#F8FAFC', border: `1px solid ${selectedTrackOrder.status === 'DISPATCHED' ? '#14B8A6' : '#E2E8F0'}`, borderRadius: '10px' }}>
                <Truck size={22} style={{ color: selectedTrackOrder.status === 'DISPATCHED' ? '#14B8A6' : '#94A3B8' }} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: '800', fontSize: '0.9rem', color: '#0F172A' }}>5. Dispatch & Transit Delivery</div>
                  <div style={{ fontSize: '0.775rem', color: '#64748B' }}>
                    {selectedTrackOrder.traceability?.dispatcher ? `Dispatched by ${selectedTrackOrder.traceability.dispatcher.name} • ${formatDate(selectedTrackOrder.traceability.dispatcher.timestamp)}` : formatDate(selectedTrackOrder.stageTimestamps?.dispatchedAt)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
