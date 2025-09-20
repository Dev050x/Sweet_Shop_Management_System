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
    <div className="bg-white/90 backdrop-blur-sm border border-[#DDDDDD] p-3 rounded-lg shadow-sm hover:shadow-md transition-shadow w-full max-w-xs">
      {/* image area */}
      <div className="h-30 flex items-center justify-center bg-[#F2F4F7] rounded-md overflow-hidden mb-3">
        {!imgError ? (
          // img will try to load /images/<category>.png; onError → fallback
          <img
            src={imageSrc || "/placeholder.svg"}
            alt={sweet.category}
            className="max-h-full max-w-full object-contain"
            onError={() => setImgError(true)}
          />
        ) : (
          <div className="text-[#333333] text-sm">{sweet.category}</div>
        )}
      </div>

      <div className="space-y-2 mb-4">
        <h3 className="text-lg font-bold text-[#0D3253] leading-tight">{sweet.name}</h3>
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-wide text-[#3E4C65] font-medium bg-[#F2F4F7] px-2 py-1 rounded-full">
            {sweet.category}
          </span>
          <span className="text-lg font-bold text-[#0D3253]">${sweet.price}</span>
        </div>
        <div className="text-sm text-[#333333] flex items-center gap-1">
          <span className="w-2 h-2 bg-green-500 rounded-full"></span>
          <span>{sweet.quantity} in stock</span>
        </div>
      </div>

      <div>
        <button
          onClick={() => setOpen((s) => !s)}
          className="w-full px-3 py-2 bg-[#5CC5D5] text-[#0D3253] rounded-md hover:bg-[#3E4C65] hover:text-white transition-colors font-medium"
        >
          Purchase
        </button>
      </div>

      {open && (
        <form onSubmit={handleSubmit(submit)} className="mt-3 p-3 bg-[#F2F4F7] rounded-md">
          <div className="mb-3">
            <input
              type="number"
              {...register("quantity", { valueAsNumber: true })}
              min={1}
              className="w-full px-2 py-1 border border-[#DDDDDD] rounded focus:outline-none focus:ring-2 focus:ring-[#5CC5D5] focus:border-transparent"
            />
            {errors.quantity && <div className="text-red-500 text-xs mt-1">{errors.quantity.message}</div>}
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-3 py-1.5 bg-[#0D3253] text-white rounded hover:bg-[#3E4C65] transition-colors disabled:opacity-50 text-sm"
            >
              Confirm
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="flex-1 px-3 py-1.5 bg-[#333333] text-white rounded hover:bg-[#222222] transition-colors text-sm"
            >
              Cancel
            </button>
          </div>
        </form>
      )}
    </div>
  );
}