import Layout from '@/components/Layout';
import { useState } from 'react';

interface Product { id: number; name: string; price: number; }
const products: Product[] = Array.from({ length: 8 }).map((_,i) => ({ id: i+1, name: `Product ${i+1}`, price: (i+1) * 5 + 10 }));

export default function ShopPage() {
  const [cart, setCart] = useState<Product[]>([]);

  const addToCart = (p: Product) => setCart(c => [...c, p]);
  const removeFromCart = (id: number) => setCart(c => c.filter(p => p.id !== id));

  const total = cart.reduce((sum,p) => sum + p.price, 0);

  return (
    <Layout>
  <section className="section-padding bg-white">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-10 mb-12">
          <div>
            <h1 className="text-4xl font-bold mb-4">Shop</h1>
            <p className="max-w-xl text-white/80">Support the mission through merch and digital resources. Every purchase fuels growth & community programs.</p>
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
        <div className="grid md:grid-cols-4 gap-8">
          {products.map(p => (
            <div key={p.id} className="card group">
              <div className="h-40 rounded-md bg-[url('https://picsum.photos/400/400?shop=${p.id}')] bg-cover bg-center mb-4 relative overflow-hidden">
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                  <button onClick={() => addToCart(p)} className="btn-light text-xs">Add to Cart</button>
                </div>
              </div>
              <h3 className="font-semibold mb-1">{p.name}</h3>
              <p className="text-sm text-white/60 mb-3">High-quality gear and resources advancing the mission.</p>
              <div className="flex items-center justify-between text-sm">
                <span className="font-semibold">${p.price.toFixed(2)}</span>
                <button onClick={() => addToCart(p)} className="text-brandOrange hover:underline">Add</button>
              </div>
            </div>
          ))}
        </div>
      </section>
    </Layout>
  );
}
