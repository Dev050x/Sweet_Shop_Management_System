import  { useMemo, useState, useEffect } from "react";
import { useSweets } from "../context /SweetContext";
import SweetCard from "../components/SweetCard";
import type { Sweet } from "../validation/sweetSchemas";

export default function Dashboard() {
  const { sweets, purchaseSweet, fetchSweets } = useSweets();
  const [nameFilter, setNameFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>("ALL");

  // slider bounds stored as nullable until sweets load
  const [sliderMin, setSliderMin] = useState<number | null>(null);
  const [sliderMax, setSliderMax] = useState<number | null>(null);

  // compute available price range from sweets
  const priceDomain = useMemo(() => {
    if (!sweets || sweets.length === 0) return { min: 0, max: 0 };
    let min = Number.POSITIVE_INFINITY;
    let max = Number.NEGATIVE_INFINITY;
    for (const s of sweets) {
      if (s.price < min) min = s.price;
      if (s.price > max) max = s.price;
    }
    if (!isFinite(min)) min = 0;
    if (!isFinite(max)) max = 0;
    // ensure integer domain
    return { min: Math.floor(min), max: Math.ceil(max) };
  }, [sweets]);

  // initialize slider values once when sweets first arrive (preserve user changes afterwards)
  useEffect(() => {
    if (sweets.length === 0) return;
    if (sliderMin === null || sliderMax === null) {
      setSliderMin(priceDomain.min);
      setSliderMax(priceDomain.max);
    } else {
      // if domain changed (e.g., new sweets with prices outside current range), clamp current values
      setSliderMin(prev => {
        if (prev === null) return priceDomain.min;
        return Math.max(priceDomain.min, Math.min(prev, priceDomain.max));
      });
      setSliderMax(prev => {
        if (prev === null) return priceDomain.max;
        return Math.max(priceDomain.min, Math.min(prev, priceDomain.max));
      });
    }
  }, [sweets, priceDomain.min, priceDomain.max]); // note: intentionally not including slider state to avoid reset

  // Ensure filtering works even if slider states are not yet set (safe guards)
  const displayed = useMemo(() => {
    return sweets.filter((s) => {
      if (nameFilter && !s.name.toLowerCase().includes(nameFilter.toLowerCase())) return false;
      if (categoryFilter !== "ALL" && s.category !== categoryFilter) return false;
      if (sliderMin !== null && s.price < sliderMin) return false;
      if (sliderMax !== null && s.price > sliderMax) return false;
      return true;
    });
  }, [sweets, nameFilter, categoryFilter, sliderMin, sliderMax]);

  const handlePurchase = async (id: number, qty: number) => {
    try {
      await purchaseSweet(id, qty);
      alert("Purchase successful");
    } catch (err: any) {
      const msg = err?.response?.data?.message ?? err?.message ?? "Purchase failed";
      alert(msg);
    }
  };

  // handlers that keep min <= max
  const onChangeMin = (value: number) => {
    if (sliderMax === null) {
      setSliderMin(value);
      setSliderMax(priceDomain.max);
      return;
    }
    if (value > sliderMax) {
      // if min moved past max, push max up to value
      setSliderMin(value);
      setSliderMax(value);
    } else {
      setSliderMin(value);
    }
  };

  const onChangeMax = (value: number) => {
    if (sliderMin === null) {
      setSliderMax(value);
      setSliderMin(priceDomain.min);
      return;
    }
    if (value < sliderMin) {
      // if max moved below min, pull min down to value
      setSliderMin(value);
      setSliderMax(value);
    } else {
      setSliderMax(value);
    }
  };

  const categories = useMemo(() => {
    const s = Array.from(new Set(sweets.map(x => x.category)));
    return ["ALL", ...s];
  }, [sweets]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#BCC7DC] to-[#F2F4F7] p-4">
      <div className="max-w-7xl mx-auto">
        <h2 className="text-3xl font-bold text-[#0D3253] mb-2">Delicious Sweets Collection</h2>
        <p className="text-[#3E4C65] mb-6">The Sweeter Way to Manage Your Shop</p>

        <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 mb-6 shadow-sm border border-[#DDDDDD]">
          <div className="flex flex-wrap gap-4 items-center">
            <input
              placeholder="Search by name"
              value={nameFilter}
              onChange={(e) => setNameFilter(e.target.value)}
              className="px-3 py-2 border border-[#DDDDDD] rounded-md focus:outline-none focus:ring-2 focus:ring-[#5CC5D5] focus:border-transparent"
            />

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 border border-[#DDDDDD] rounded-md focus:outline-none focus:ring-2 focus:ring-[#5CC5D5] focus:border-transparent bg-white"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>

            {/* Range slider: two range inputs (min & max). values default to domain when sweets load */}
            <div className="flex flex-col gap-2">
              <div className="text-sm text-[#333333]">
                Price range: {sliderMin ?? priceDomain.min} — {sliderMax ?? priceDomain.max}
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min={priceDomain.min}
                  max={priceDomain.max}
                  value={sliderMin ?? priceDomain.min}
                  onChange={(e) => onChangeMin(Number(e.target.value))}
                  className="accent-[#5CC5D5]"
                />
                <input
                  type="range"
                  min={priceDomain.min}
                  max={priceDomain.max}
                  value={sliderMax ?? priceDomain.max}
                  onChange={(e) => onChangeMax(Number(e.target.value))}
                  className="accent-[#5CC5D5]"
                />
              </div>
            </div>

            <button
              onClick={() => fetchSweets()}
              className="px-4 py-2 bg-[#0D3253] text-white rounded-md hover:bg-[#3E4C65] transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {displayed.length === 0 ? (
            <div className="col-span-full text-center text-[#333333] py-8">No sweets found</div>
          ) : (
            displayed.map((s: Sweet) => <SweetCard key={s.id} sweet={s} onPurchase={handlePurchase} />)
          )}
        </div>
      </div>
    </div>
  );
}