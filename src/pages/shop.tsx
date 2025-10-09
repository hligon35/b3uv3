import Layout from '@/components/Layout';
import Image from 'next/image';
import { useState } from 'react';
import MugImage from '@/images/shop/mug.png';
import ShirtFrontImage from '@/images/shop/shirt_front.png';
import ShirtBackImage from '@/images/shop/shirt_back.png';

interface Product { 
  id: number; 
  name: string; 
  price: number; 
  images: any[]; 
  description: string;
}

const products: Product[] = [
  { 
    id: 1, 
    name: 'B3U T-Shirt', 
    price: 24.99, 
    images: [ShirtFrontImage, ShirtBackImage], 
    description: 'Premium quality B3U branded t-shirt with front and back designs.'
  },
  { 
    id: 2, 
    name: 'B3U Coffee Mug', 
    price: 15.99, 
    images: [MugImage], 
    description: 'Start your day with inspiration from this high-quality B3U coffee mug.'
  },
];

export default function ShopPage() {
  const [cart, setCart] = useState<Product[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState<{[key: number]: number}>({});

  const addToCart = (p: Product) => setCart(c => [...c, p]);
  const removeFromCart = (id: number) => setCart(c => c.filter(p => p.id !== id));

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

  return (
    <Layout>
  <section className="section-padding bg-white">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-10 mb-12">
          <div>
            <h1 className="text-4xl font-bold mb-4">Shop</h1>
            <p className="max-w-xl text-white/80 mb-4">Support the mission through merch and digital resources. Every purchase fuels growth & community programs.</p>
            <p className="text-brandOrange font-semibold text-lg">More Merch Coming Soon!!!</p>
          </div>
          <div className="card min-w-[260px]">
            <h3 className="font-semibold mb-3 flex items-center justify-between">Cart <span className="text-xs font-normal text-white/50">({cart.length})</span></h3>
            <ul className="space-y-2 max-h-48 overflow-auto pr-1 text-sm mb-3">
              {cart.length === 0 && <li className="text-white/40 italic">Empty</li>}
              {cart.map(item => (
                <li key={item.id} className="flex items-center justify-between">
                  <span>{item.name}</span>
                  <button onClick={() => removeFromCart(item.id)} className="text-brandOrange text-xs hover:underline">Remove</button>
                </li>
              ))}
            </ul>
            <div className="flex items-center justify-between text-sm font-medium mb-3">
              <span>Total:</span>
              <span>${total.toFixed(2)}</span>
            </div>
            <button disabled={!cart.length} className="btn-primary w-full">Checkout (Placeholder)</button>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-8">
          {products.map(p => {
            const currentIndex = currentImageIndex[p.id] || 0;
            const currentImage = p.images[currentIndex];
            const hasMultipleImages = p.images.length > 1;
            
            return (
              <div key={p.id} className="card group">
                <div className="h-64 rounded-md mb-4 relative overflow-hidden bg-white">
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
                      className="btn-light text-sm pointer-events-auto"
                    >
                      Add to Cart
                    </button>
                  </div>
                </div>
                
                <h3 className="font-semibold mb-2 text-lg">{p.name}</h3>
                <p className="text-sm text-white/60 mb-4">{p.description}</p>
                <div className="flex items-center justify-between">
                  <span className="font-bold text-lg">${p.price.toFixed(2)}</span>
                  <button onClick={() => addToCart(p)} className="text-brandOrange hover:underline font-semibold">Add to Cart</button>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </Layout>
  );
}
