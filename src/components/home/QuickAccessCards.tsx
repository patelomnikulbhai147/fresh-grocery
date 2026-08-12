import Link from "next/link";
import { formatINR } from "@/lib/utils";
import { products } from "@/data/catalog";
import { ShoppingCart, LayoutGrid, Tag } from "lucide-react";

export function QuickAccessCards() {
  const sampleTomato = products.find(p => p.id === "v-tomato");
  
  return (
    <section className="py-8 md:py-12 mb-12">
      <div className="w-full px-4 sm:px-6 md:px-8 lg:px-10 xl:px-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
          
          {/* Card 1: Category Page Preview */}
          <div className="card-option12 p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4 text-[#067a46]">
                <LayoutGrid className="w-5 h-5" />
                <h3 className="font-bold text-slate-800">Category Page</h3>
              </div>
              <div className="flex gap-2 justify-center mb-6">
                {products.slice(0, 4).map(p => (
                  <div key={p.id} className="w-14 h-14 rounded-lg bg-slate-50 border border-slate-100 p-1 flex items-center justify-center overflow-hidden">
                    <img src={p.image} alt={p.name} className="w-10 h-10 object-contain mix-blend-multiply" />
                  </div>
                ))}
              </div>
            </div>
            <Link href="/shop?cat=vegetables" className="w-full inline-block text-center bg-white border border-slate-200 text-slate-700 font-bold py-2.5 rounded-lg text-sm hover:bg-slate-50 transition">
              Explore Now
            </Link>
          </div>

          {/* Card 2: Product Detail Preview */}
          <div className="card-option12 p-6 flex flex-col justify-between relative">
            <div>
              <div className="flex items-center gap-2 mb-4 text-[#067a46]">
                <Tag className="w-5 h-5" />
                <h3 className="font-bold text-slate-800">Product Detail</h3>
              </div>
              
              <div className="flex items-center gap-4 mb-4">
                {sampleTomato && (
                  <>
                    <div className="w-20 h-20 shrink-0">
                      <img src={sampleTomato.image} alt="Tomato" className="w-full h-full object-contain mix-blend-multiply" />
                    </div>
                    <div>
                      <div className="font-bold text-slate-800 text-lg">{sampleTomato.name.split("/")[0].trim()}</div>
                      <div className="text-sm font-semibold text-[#067a46]">
                        {formatINR(sampleTomato.weights[0].price)} - {formatINR(sampleTomato.weights[1]?.price || sampleTomato.weights[0].price * 1.5)} / kg
                      </div>
                      <div className="text-xs text-slate-500 mt-1">Farm Fresh</div>
                    </div>
                  </>
                )}
              </div>
            </div>
            <Link href="/product/fresh-tomato" className="w-full inline-block text-center bg-[#067a46] hover:bg-[#046338] text-white font-bold py-2.5 rounded-lg text-sm transition">
              View Details
            </Link>
          </div>

          {/* Card 3: Cart & Checkout Preview */}
          <div className="card-option12 p-6 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-4 text-[#067a46]">
                <ShoppingCart className="w-5 h-5" />
                <h3 className="font-bold text-slate-800">Cart & Checkout</h3>
              </div>
              
              <div className="space-y-3 mb-6">
                {[
                  { name: "Tomato", weight: "1 kg", price: "₹60.00" },
                  { name: "Potato", weight: "1 kg", price: "₹36.00" },
                  { name: "Onion", weight: "1 kg", price: "₹28.00" }
                ].map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 bg-slate-100 rounded flex items-center justify-center text-xs">
                        {item.name[0]}
                      </div>
                      <span className="font-medium text-slate-700">{item.name}</span>
                    </div>
                    <div className="flex gap-4">
                      <span className="text-slate-500 text-xs w-8">{item.weight}</span>
                      <span className="font-semibold text-slate-800 w-12 text-right">{item.price}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <Link href="/cart" className="w-full inline-block text-center bg-[#067a46] hover:bg-[#046338] text-white font-bold py-2.5 rounded-lg text-sm transition">
              Proceed to Checkout
            </Link>
          </div>

        </div>
      </div>
    </section>
  );
}
