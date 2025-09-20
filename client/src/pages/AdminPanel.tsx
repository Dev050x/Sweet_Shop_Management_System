// src/pages/AdminPanel.tsx
import { useState } from "react";
import { useSweets } from "../context /SweetContext";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { addSweetSchema, updateSweetSchema, restockSchema } from "../validation/adminSchemas";
import type {AddSweetInput, UpdateSweetInput, RestockInput} from "../validation/adminSchemas";

export default function AdminPanel() {
  const { sweets, addSweet, updateSweet, deleteSweet, restockSweet, fetchSweets } = useSweets();
  const [editingId, setEditingId] = useState<number | null>(null);
  const [restockId, setRestockId] = useState<number | null>(null);

  // Add form
  const { register: addRegister, handleSubmit: handleAdd, formState: { errors: addErrors, isSubmitting: addSubmitting }, reset: resetAdd } =
    useForm<AddSweetInput>({ resolver: zodResolver(addSweetSchema) });

  // Edit form
  const { register: editRegister, handleSubmit: handleEditSubmit, formState: { errors: editErrors, isSubmitting: editSubmitting }, reset: resetEdit, setValue } =
    useForm<UpdateSweetInput>({ resolver: zodResolver(updateSweetSchema) });

  // Restock form
  const { register: restockRegister, handleSubmit: handleRestockSubmit, formState: { errors: restockErrors, isSubmitting: restockSubmitting }, reset: resetRestock } =
    useForm<RestockInput>({ resolver: zodResolver(restockSchema) });

  const onAdd = async (data: AddSweetInput) => {
    try {
      await addSweet(data);
      resetAdd();
      alert("Sweet added");
    } catch (err:any) {
      alert(err?.response?.data?.message ?? err?.message ?? "Add failed");
    }
  };

  const onEdit = async (data: UpdateSweetInput) => {
    if (!editingId) return;
    try {
      await updateSweet(editingId, data);
      setEditingId(null);
      resetEdit();
      alert("Sweet updated");
    } catch (err:any) {
      alert(err?.response?.data?.message ?? err?.message ?? "Update failed");
    }
  };

  const onDelete = async (id: number) => {
    if (!confirm("Delete this sweet?")) return;
    try {
      await deleteSweet(id);
      alert("Deleted");
    } catch (err:any) {
      const msg = err?.response?.data?.message ?? err?.message ?? "Delete failed";
      alert(msg);
    }
  };

  const onStartEdit = (id: number) => {
    const s = sweets.find(x => x.id === id);
    if (!s) return;
    setEditingId(id);
    // prefill edit form
    setValue("name", s.name);
    setValue("category", s.category);
    setValue("price", s.price);
    setValue("quantity", s.quantity);
  };

  const onStartRestock = (id:number) => {
    setRestockId(id);
    resetRestock();
  };

  const onRestock = async (data: RestockInput) => {
    if (!restockId) return;
    try {
      await restockSweet(restockId, data.quantity);
      setRestockId(null);
      resetRestock();
      alert("Restocked successfully");
    } catch (err:any) {
      alert(err?.response?.data?.message ?? err?.message ?? "Restock failed");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#BCC7DC] to-[#F2F4F7] p-6">
      <div className="max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-[#0D3253] mb-8 text-center">Admin Panel</h2>

        {/* Add Sweet Section */}
        <section className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-6 mb-8">
          <h3 className="text-xl font-semibold text-[#0D3253] mb-4">Add New Sweet</h3>
          <form onSubmit={handleAdd(onAdd)} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <input
                placeholder="Sweet Name"
                {...addRegister("name")}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5CC5D5] focus:border-transparent outline-none transition-all"
              />
              {addErrors.name && <div className="text-red-500 text-sm mt-1">{addErrors.name.message}</div>}
            </div>
            <div>
              <input
                placeholder="Category (e.g., CHOCOLATE)"
                {...addRegister("category")}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5CC5D5] focus:border-transparent outline-none transition-all"
              />
              {addErrors.category && <div className="text-red-500 text-sm mt-1">{addErrors.category.message}</div>}
            </div>
            <div>
              <input
                type="number"
                step="0.01"
                placeholder="Price ($)"
                {...addRegister("price", { valueAsNumber: true })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5CC5D5] focus:border-transparent outline-none transition-all"
              />
              {addErrors.price && <div className="text-red-500 text-sm mt-1">{addErrors.price.message}</div>}
            </div>
            <div>
              <input
                type="number"
                placeholder="Initial Quantity"
                {...addRegister("quantity", { valueAsNumber: true })}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#5CC5D5] focus:border-transparent outline-none transition-all"
              />
              {addErrors.quantity && <div className="text-red-500 text-sm mt-1">{addErrors.quantity.message}</div>}
            </div>
            <div className="md:col-span-2 lg:col-span-4">
              <button
                disabled={addSubmitting}
                type="submit"
                className="w-full md:w-auto px-6 py-2 bg-[#5CC5D5] text-white font-medium rounded-lg hover:bg-[#4AB5C5] disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {addSubmitting ? "Adding..." : "Add Sweet"}
              </button>
            </div>
          </form>
        </section>

        {/* Existing Sweets Section */}
        <section className="bg-white/80 backdrop-blur-sm rounded-lg shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-xl font-semibold text-[#0D3253]">Manage Sweets</h3>
            <button
              onClick={() => fetchSweets()}
              className="px-4 py-2 bg-[#0D3253] text-white rounded-lg hover:bg-[#0A2A47] transition-colors"
            >
              Refresh List
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {sweets.map((s) => (
              <div
                key={s.id}
                className="bg-white rounded-lg shadow-md border border-gray-200 p-4 hover:shadow-lg transition-shadow"
              >
                <div className="mb-4">
                  <h4 className="text-lg font-semibold text-[#0D3253] mb-2">{s.name}</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Category:</span> {s.category}
                    </div>
                    <div>
                      <span className="font-medium">Price:</span>{" "}
                      <span className="text-[#0D3253] font-semibold">${s.price}</span>
                    </div>
                    <div>
                      <span className="font-medium">Stock:</span>{" "}
                      <span
                        className={
                          s.quantity > 10 ? "text-green-600" : s.quantity > 0 ? "text-yellow-600" : "text-red-600"
                        }
                      >
                        {s.quantity}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  <button
                    onClick={() => onStartEdit(s.id)}
                    className="px-3 py-1 bg-[#5CC5D5] text-white text-sm rounded hover:bg-[#4AB5C5] transition-colors"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => onDelete(s.id)}
                    className="px-3 py-1 bg-red-500 text-white text-sm rounded hover:bg-red-600 transition-colors"
                  >
                    Delete
                  </button>
                  <button
                    onClick={() => onStartRestock(s.id)}
                    className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition-colors"
                  >
                    Restock
                  </button>
                </div>

                {/* Inline edit form */}
                {editingId === s.id && (
                  <form onSubmit={handleEditSubmit(onEdit)} className="border-t pt-4 space-y-3">
                    <div>
                      <input
                        placeholder="Name"
                        {...editRegister("name")}
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-[#5CC5D5] focus:border-transparent outline-none"
                      />
                      {editErrors.name && <div className="text-red-500 text-xs mt-1">{editErrors.name.message}</div>}
                    </div>
                    <div>
                      <input
                        placeholder="Category"
                        {...editRegister("category")}
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-[#5CC5D5] focus:border-transparent outline-none"
                      />
                      {editErrors.category && (
                        <div className="text-red-500 text-xs mt-1">{editErrors.category.message}</div>
                      )}
                    </div>
                    <div>
                      <input
                        type="number"
                        step="0.01"
                        placeholder="Price"
                        {...editRegister("price", { valueAsNumber: true })}
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-[#5CC5D5] focus:border-transparent outline-none"
                      />
                      {editErrors.price && <div className="text-red-500 text-xs mt-1">{editErrors.price.message}</div>}
                    </div>
                    <div>
                      <input
                        type="number"
                        placeholder="Quantity"
                        {...editRegister("quantity", { valueAsNumber: true })}
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-[#5CC5D5] focus:border-transparent outline-none"
                      />
                      {editErrors.quantity && (
                        <div className="text-red-500 text-xs mt-1">{editErrors.quantity.message}</div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        disabled={editSubmitting}
                        type="submit"
                        className="px-3 py-1 bg-[#5CC5D5] text-white text-sm rounded hover:bg-[#4AB5C5] disabled:opacity-50 transition-colors"
                      >
                        {editSubmitting ? "Saving..." : "Save"}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(null)
                          resetEdit()
                        }}
                        className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                {/* Inline restock form */}
                {restockId === s.id && (
                  <form onSubmit={handleRestockSubmit(onRestock)} className="border-t pt-4 space-y-3">
                    <div>
                      <input
                        type="number"
                        placeholder="Restock quantity"
                        {...restockRegister("quantity", { valueAsNumber: true })}
                        className="w-full px-3 py-2 border border-gray-300 rounded text-sm focus:ring-2 focus:ring-[#5CC5D5] focus:border-transparent outline-none"
                      />
                      {restockErrors.quantity && (
                        <div className="text-red-500 text-xs mt-1">{restockErrors.quantity.message}</div>
                      )}
                    </div>
                    <div className="flex gap-2">
                      <button
                        disabled={restockSubmitting}
                        type="submit"
                        className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 disabled:opacity-50 transition-colors"
                      >
                        {restockSubmitting ? "Restocking..." : "Restock"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setRestockId(null)}
                        className="px-3 py-1 bg-gray-500 text-white text-sm rounded hover:bg-gray-600 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}