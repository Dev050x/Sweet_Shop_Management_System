import  { useState } from "react";
import type { Sweet } from "../validation/sweetSchemas";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { sweetPurchaseSchema } from "../validation/sweetSchemas";
import type {SweetPurchaseInput} from "../validation/sweetSchemas";

export default function SweetCard({
  sweet,
  onPurchase,
}: {
  sweet: Sweet;
  onPurchase: (id: number, qty: number) => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } =
    useForm<SweetPurchaseInput>({ resolver: zodResolver(sweetPurchaseSchema), defaultValues: { quantity: 1 } });

  const submit = async (d: SweetPurchaseInput) => {
    await onPurchase(sweet.id, d.quantity);
    reset();
    setOpen(false);
  };

  // public image path convention: /public/images/<category>.png (category lowercased)
  const imageSrc = `/images/${String(sweet.category).toLowerCase()}.png`;
  const [imgError, setImgError] = useState(false);

  return (
    <div style={{ border: "1px solid #ddd", padding: 12, borderRadius: 8, width: 260 }}>
      {/* image area */}
      <div style={{ height: 120, display: "flex", alignItems: "center", justifyContent: "center", background: "#f7f7f7", borderRadius: 6, overflow: "hidden", marginBottom: 8 }}>
        {!imgError ? (
          // img will try to load /images/<category>.png; onError → fallback
          <img
            src={imageSrc}
            alt={sweet.category}
            style={{ maxHeight: "100%", maxWidth: "100%", objectFit: "contain" }}
            onError={() => setImgError(true)}
          />
        ) : (
          <div style={{ color: "#666", fontSize: 14 }}>{sweet.category}</div>
        )}
      </div>

      <div><strong>{sweet.name}</strong></div>
      <div>Category: {sweet.category}</div>
      <div>Price: {sweet.price}</div>
      <div>In stock: {sweet.quantity}</div>

      <div style={{ marginTop: 8 }}>
        <button onClick={() => setOpen(s => !s)}>Purchase</button>
      </div>

      {open && (
        <form onSubmit={handleSubmit(submit)} style={{ marginTop: 8 }}>
          <div>
            <input type="number" {...register("quantity", { valueAsNumber: true })} min={1} />
            {errors.quantity && <div style={{ color: "red" }}>{errors.quantity.message}</div>}
          </div>
          <div style={{ marginTop: 6 }}>
            <button type="submit" disabled={isSubmitting}>Confirm</button>
            <button type="button" onClick={() => setOpen(false)} style={{ marginLeft: 8 }}>Cancel</button>
          </div>
        </form>
      )}
    </div>
  );
}