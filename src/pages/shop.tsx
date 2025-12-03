import Layout from '@/components/Layout';
import Image from 'next/image';
// Stripe payment will be handled via a hosted Payment Link (set as NEXT_PUBLIC_STRIPE_PAYMENT_LINK)
import { useEffect, useRef, useState } from 'react';
import MugImage from '@/images/shop/mug.png';
import ShirtFrontImage from '@/images/shop/shirt_front.png';
import ShirtBackImage from '@/images/shop/shirt_back.png';
// QR code payment options removed; using Stripe Payment Link instead

interface Product { 
  id: number; 
  name: string; 
  price: number; 
  images: any[]; 
  description: string;
  sizes?: string[]; // optional list of sizes
}

interface CartItem {
  id: number;
  name: string;
  price: number;
  size?: string;
}

const products: Product[] = [
  { 
    id: 1, 
    name: 'B3U T-Shirt', 
    price: 24.99, 
    images: [ShirtFrontImage, ShirtBackImage], 
    sizes: ['S','M','L','XL','2XL'],
    description: 'Premium quality B3U branded t-shirt with front and back designs.'
  },
  { 
    id: 2, 
    name: 'B3U Coffee Mug', 
    price: 20.0, 
    images: [MugImage], 
    description: 'Start your day with inspiration from this high-quality B3U coffee mug.'
  },
];

export default function ShopPage() {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState<{[key: number]: number}>({});
  const [isTouch, setIsTouch] = useState(false);
  const [showOverlay, setShowOverlay] = useState<{[key:number]: boolean}>({});
  const [selectedSize, setSelectedSize] = useState<Record<number, string | ''>>({});
  const [sizeError, setSizeError] = useState<Record<number, boolean>>({});

  // Checkout UI state
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [stripeError, setStripeError] = useState<string | null>(null);

  // Detect touch / non-hover devices to adjust overlay behavior
  useEffect(() => {
    const checkTouch = () => {
      try {
        return window.matchMedia && window.matchMedia('(hover: none)').matches;
      } catch {
        return 'ontouchstart' in window || (navigator as any).maxTouchPoints > 0;
      }
    };
    setIsTouch(checkTouch());
  }, []);



  const addToCart = (p: Product) => {
    if (p.sizes && !selectedSize[p.id]) {
      setSizeError(prev => ({ ...prev, [p.id]: true }));
      return;
    }
    setCart(c => [...c, { id: p.id, name: p.name, price: p.price, size: selectedSize[p.id] }]);
    // Clear any size error after successful add
    setSizeError(prev => ({ ...prev, [p.id]: false }));
  };
  const removeFromCart = (index: number) => setCart(c => c.filter((_, i) => i !== index));

  const nextImage = (productId: number, maxImages: number) => {
    setCurrentImageIndex(prev => ({
      ...prev,
      [productId]: ((prev[productId] || 0) + 1) % maxImages
    }));
  };

  const prevImage = (productId: number, maxImages: number) => {
    setCurrentImageIndex(prev => ({
      ...prev,
      [productId]: ((prev[productId] || 0) - 1 + maxImages) % maxImages
    }));
  };

  const total = cart.reduce((sum,p) => sum + p.price, 0);

  // Stripe Payment Link (hosted checkout)
  const STRIPE_PAYMENT_LINK = process.env.NEXT_PUBLIC_STRIPE_PAYMENT_LINK || '';
  const isStripeConfigured = STRIPE_PAYMENT_LINK.length > 0;

  const handleStripeCheckout = () => {
    setStripeError(null);
    if (!isStripeConfigured) {
      setStripeError('Stripe is not configured. Add NEXT_PUBLIC_STRIPE_PAYMENT_LINK to enable card checkout.');
      return;
    }
    // Redirect to the hosted Stripe Payment Link
    try {
      window.location.href = STRIPE_PAYMENT_LINK;
    } catch (err) {
      setStripeError('Unable to redirect to Stripe. Please try again.');
    }
  };

  return (
    <Layout>
      {/* Stripe checkout (hosted Payment Link) */}
  <section className="section-padding bg-white">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-10 mb-12">
          <div>
            <h1 className="text-4xl font-bold mb-4">Shop</h1>
            <p className="max-w-xl text-navy/80 mb-4">Support the mission through merch and digital resources. Every purchase fuels growth & community programs.</p>
            <p className="text-brandOrange font-semibold text-lg">More Merch Coming Soon!!!</p>
          </div>
          <div className="card min-w-[260px]">
            <h3 className="font-semibold mb-3 flex items-center justify-between">Cart <span className="text-xs font-normal text-navy/50">({cart.length})</span></h3>
            <ul className="space-y-2 max-h-48 overflow-auto pr-1 text-sm mb-3">
              {cart.length === 0 && <li className="text-navy/40 italic">Empty</li>}
              {cart.map((item, index) => (
                <li key={`${item.id}-${index}`} className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <span>{item.name}</span>
                    {item.size && (
                      <span className="inline-flex items-center rounded-md border border-black/20 bg-black/5 px-2 py-0.5 text-xs text-navy">
                        {item.size}
                      </span>
                    )}
                  </span>
                  <button onClick={() => removeFromCart(index)} className="text-brandOrange text-xs hover:underline">Remove</button>
                </li>
              ))}
            </ul>
            <div className="flex items-center justify-between text-sm font-medium mb-3">
              <span>Total:</span>
              <span>${total.toFixed(2)}</span>
            </div>
            {!checkoutOpen ? (
              <button
                disabled={!cart.length}
                onClick={() => setCheckoutOpen(true)}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Checkout
              </button>
            ) : (
              <div className="space-y-3">
                {!isStripeConfigured && (
                  <div className="text-yellow-200 text-sm">Stripe is not configured. Add NEXT_PUBLIC_STRIPE_PAYMENT_LINK and rebuild to enable card checkout.</div>
                )}
                {stripeError && (
                  <div className="text-red-300 text-sm">{stripeError}</div>
                )}
                <button
                  type="button"
                  onClick={handleStripeCheckout}
                  className="btn-primary w-full"
                >
                  Pay with Card
                </button>
                <button
                  type="button"
                  onClick={() => setCheckoutOpen(false)}
                  className="text-white/70 hover:text-white text-xs underline"
                >
                  Cancel
                </button>
              </div>
            )}

            {/* QR code payment options removed; Stripe Payment Link is primary checkout. */}
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          {products.map(p => {
            const currentIndex = currentImageIndex[p.id] || 0;
            const currentImage = p.images[currentIndex];
            const hasMultipleImages = p.images.length > 1;
            const overlayVisible = isTouch ? !!showOverlay[p.id] : false;
            
            return (
              <div key={p.id} className="card group">
                <div
                  className="h-64 rounded-md mb-4 relative overflow-hidden bg-white"
                  onClick={(e) => {
                    if (!isTouch) return; // Only toggle on touch devices
                    const target = e.target as HTMLElement;
                    // Don't toggle if clicking a button (e.g., nav arrows or Add to Cart)
                    if (target.closest('button')) return;
                    setShowOverlay(prev => ({ ...prev, [p.id]: !prev[p.id] }));
                  }}
                >
                  <Image
                    src={currentImage}
                    alt={`${p.name} ${hasMultipleImages ? `- View ${currentIndex + 1}` : ''}`}
                    fill
                    className="object-contain p-4"
                  />
                  
                  {/* Image Navigation for T-Shirt */}
                  {hasMultipleImages && (
                    <>
                      <button
                        onClick={() => prevImage(p.id, p.images.length)}
                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-brandOrange text-white p-3 rounded-full shadow-lg hover:bg-brandOrange-dark transition-all z-10"
                        aria-label="Previous image"
                      >
                        ←
                      </button>
                      <button
                        onClick={() => nextImage(p.id, p.images.length)}
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-brandOrange text-white p-3 rounded-full shadow-lg hover:bg-brandOrange-dark transition-all z-10"
                        aria-label="Next image"
                      >
                        →
                      </button>
                      
                      {/* Image indicators */}
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
                        {p.images.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(prev => ({ ...prev, [p.id]: index }))}
                            className={`w-3 h-3 rounded-full transition-all border-2 border-white ${
                              index === currentIndex ? 'bg-brandOrange' : 'bg-white/50 hover:bg-white/80'
                            }`}
                            aria-label={`View ${index === 0 ? 'front' : 'back'} of ${p.name}`}
                          />
                        ))}
                      </div>
                      
                      {/* View label */}
                      <div className="absolute top-3 right-3 bg-brandOrange text-white text-sm font-semibold px-3 py-1 rounded-full shadow-lg">
                        {currentIndex === 0 ? 'Front' : 'Back'}
                      </div>
                    </>
                  )}
                  
                  {/* Add to Cart Overlay - only show when not hovering navigation */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition pointer-events-none">
                    <button 
                      onClick={() => addToCart(p)} 
                      disabled={!!p.sizes && !selectedSize[p.id]}
                      className="btn-light text-sm pointer-events-auto disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
                
                <h3 className="font-semibold text-lg leading-tight mb-0">{p.name}</h3>
                <p className="text-sm text-white/60 mb-4">{p.description}</p>
                {/* Size selection if applicable */}
                {p.sizes && (
                  <div className="mb-4">
                    <label htmlFor={`size-${p.id}`} className="block text-xs font-medium text-white/80 mb-1">Size</label>
                    <select
                      id={`size-${p.id}`}
                      className="w-full rounded-lg border border-black/20 bg-white px-3 py-2 text-black placeholder:text-black/40 shadow-sm focus:outline-none focus:ring-2 focus:ring-brandOrange focus:border-brandOrange hover:border-black/30"
                      value={selectedSize[p.id] ?? ''}
                      onChange={(e) => {
                        const v = e.target.value;
                        setSelectedSize(prev => ({ ...prev, [p.id]: v }));
                        if (v) setSizeError(prev => ({ ...prev, [p.id]: false }));
                      }}
                    >
                      <option value="" disabled>Select a size</option>
                      {p.sizes.map(size => (
                        <option key={size} value={size}>{size}</option>
                      ))}
                    </select>
                    {sizeError[p.id] && !selectedSize[p.id] && (
                      <p className="mt-1 text-xs text-red-400">Please select a size.</p>
                    )}
                  </div>
                )}
                <div className="mt-auto flex items-center justify-between">
                  <span className="font-bold text-lg">${p.price.toFixed(2)}</span>
                  <button
                    onClick={() => addToCart(p)}
                    disabled={!!p.sizes && !selectedSize[p.id]}
                    className="text-brandOrange hover:underline font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Add to Cart
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </Layout>
  );
}
