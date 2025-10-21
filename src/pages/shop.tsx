import Layout from '@/components/Layout';
import Image from 'next/image';
import Script from 'next/script';
import { useEffect, useRef, useState } from 'react';
import MugImage from '@/images/shop/mug.png';
import ShirtFrontImage from '@/images/shop/shirt_front.png';
import ShirtBackImage from '@/images/shop/shirt_back.png';
import QRCode from '@/images/shop/qrcode.png';
import ZelleQR from '@/images/shop/Zelle qr.png';

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

  // PayPal UI state
  const [paypalReady, setPaypalReady] = useState(false);
  const [paypalError, setPaypalError] = useState<string | null>(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const paypalRef = useRef<HTMLDivElement | null>(null);

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

  // Optional external destinations for QR codes
  const QR_LINK = process.env.NEXT_PUBLIC_QR_LINK || 'https://www.paypal.com/us/digital-wallet/mobile-apps';
  const ZELLE_LINK = process.env.NEXT_PUBLIC_ZELLE_LINK || 'https://enroll.zellepay.com/qr-codes?data=eyJuYW1lIjoiQjNVIEwuTC5DLiIsImFjdGlvbiI6InBheW1lbnQiLCJ0b2tlbiI6IjgwNDM4NTI1MTIifQ==';

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

  // PayPal setup
  const PAYPAL_CLIENT_ID = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || '';
  const isPaypalConfigured = PAYPAL_CLIENT_ID.length > 0;

  useEffect(() => {
    // Render PayPal buttons when SDK is ready, checkout is open, and there are items
  if (!paypalReady || !showCheckout || cart.length === 0) return;
  if (!isPaypalConfigured) return;
    const container = paypalRef.current;
    if (!container) return;

    const w = window as any;
    if (!w.paypal || typeof w.paypal.Buttons !== 'function') {
      setPaypalError('PayPal SDK failed to load. Please refresh and try again.');
      return;
    }

    // Clear any previous render
    container.replaceChildren();

    const items = cart.map((item) => ({
      name: item.size ? `${item.name} (${item.size})` : item.name,
      sku: item.size ? `${item.id}-${item.size}` : `${item.id}`,
      description: item.size ? `Size: ${item.size}` : undefined,
      category: 'PHYSICAL_GOODS',
      quantity: '1',
      unit_amount: { currency_code: 'USD', value: item.price.toFixed(2) },
    }));

    const amount = total.toFixed(2);

    const buttons = w.paypal.Buttons({
      style: { layout: 'vertical', color: 'gold', shape: 'pill', label: 'pay' },
      createOrder: (_data: any, actions: any) => {
        return actions.order.create({
          purchase_units: [
            {
              description: 'B3U Shop Order',
              amount: {
                currency_code: 'USD',
                value: amount,
                breakdown: {
                  item_total: { currency_code: 'USD', value: amount },
                },
              },
              items,
            },
          ],
        });
      },
      onApprove: async (_data: any, actions: any) => {
        try {
          await actions.order.capture();
          setCart([]);
          setShowCheckout(false);
          alert('Thank you! Your payment was processed.');
        } catch (err) {
          console.error(err);
          alert('Payment capture failed.');
        }
      },
      onError: (err: any) => {
        console.error('PayPal error', err);
        setPaypalError('Payment could not be completed.');
      },
    });

    buttons.render(container);

    return () => {
      try {
        container.replaceChildren();
      } catch {}
    };
  }, [paypalReady, showCheckout, cart, total, isPaypalConfigured]);

  return (
    <Layout>
      {/* PayPal SDK (only load when configured) */}
      {isPaypalConfigured && (
        <Script
          src={`https://www.paypal.com/sdk/js?client-id=${PAYPAL_CLIENT_ID}&currency=USD`}
          strategy="afterInteractive"
          onLoad={() => setPaypalReady(true)}
          onError={() => setPaypalError('Failed to load PayPal SDK.')}
        />
      )}
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
            {!showCheckout ? (
              <button
                disabled={!cart.length}
                onClick={() => setShowCheckout(true)}
                className="btn-primary w-full disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Checkout with PayPal
              </button>
            ) : (
              <div className="space-y-3">
                {!isPaypalConfigured && (
                  <div className="text-yellow-200 text-sm">PayPal is not configured. Add NEXT_PUBLIC_PAYPAL_CLIENT_ID and rebuild to enable checkout.</div>
                )}
                {isPaypalConfigured && !paypalReady && (
                  <div className="text-white/80 text-sm">Loading PayPal…</div>
                )}
                {paypalError && (
                  <div className="text-red-300 text-sm">{paypalError}</div>
                )}
                <div ref={paypalRef} />
                <button
                  type="button"
                  onClick={() => setShowCheckout(false)}
                  className="text-white/70 hover:text-white text-xs underline"
                >
                  Cancel
                </button>
              </div>
            )}

            {/* QR Codes */}
            <div className="mt-5 border-t border-black/10 pt-4">
              <h4 className="font-semibold text-sm mb-2">Quick Pay via QR</h4>
              <div className="grid grid-cols-2 gap-3">
                <div className="text-center">
                  <a
                    href={QR_LINK || (QRCode as any).src}
                    target="_blank"
                    rel="noopener"
                    className="block"
                    aria-label="Open QR code destination"
                  >
                    <div className="relative w-28 h-28 mx-auto rounded-md overflow-hidden bg-white">
                      <Image src={QRCode} alt="QR code" fill className="object-contain p-1" />
                    </div>
                  </a>
                  <div className="text-xs text-navy/60 mt-1">QR Code</div>
                </div>
                <div className="text-center">
                  <a
                    href={ZELLE_LINK || (ZelleQR as any).src}
                    target="_blank"
                    rel="noopener"
                    className="block"
                    aria-label="Open Zelle QR destination"
                  >
                    <div className="relative w-28 h-28 mx-auto rounded-md overflow-hidden bg-white">
                      <Image src={ZelleQR} alt="Zelle QR code" fill className="object-contain p-1" />
                    </div>
                  </a>
                  <div className="text-xs text-navy/60 mt-1">Zelle</div>
                </div>
              </div>
            </div>
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
