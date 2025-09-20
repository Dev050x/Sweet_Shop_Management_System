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
    <div style={{ padding: 16 }}>
      <h2>Delicious Sweets Collection</h2>
      The Sweeter Way to Manage Your Shop
      <div style={{ marginBottom: 12 }}>
        <input
          placeholder="Search by name"
          value={nameFilter}
          onChange={e => setNameFilter(e.target.value)}
        />

        <select
          value={categoryFilter}
          onChange={e => setCategoryFilter(e.target.value)}
          style={{ marginLeft: 8 }}
        >
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>

        {/* Range slider: two range inputs (min & max). values default to domain when sweets load */}
        <div style={{ display: "inline-block", marginLeft: 12, verticalAlign: "middle" }}>
          <div>Price range: {sliderMin ?? priceDomain.min} — {sliderMax ?? priceDomain.max}</div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <input
              type="range"
              min={priceDomain.min}
              max={priceDomain.max}
              value={sliderMin ?? priceDomain.min}
              onChange={e => onChangeMin(Number(e.target.value))}
            />
            <input
              type="range"
              min={priceDomain.min}
              max={priceDomain.max}
              value={sliderMax ?? priceDomain.max}
              onChange={e => onChangeMax(Number(e.target.value))}
            />
          </div>
        </div>

        <button onClick={() => fetchSweets()} style={{ marginLeft: 8 }}>Refresh</button>
      </div>

      <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
        {displayed.length === 0 ? <div>No sweets found</div> : displayed.map((s: Sweet) =>
          <SweetCard key={s.id} sweet={s} onPurchase={handlePurchase} />
        )}
      </div>
    </div>
  );
}