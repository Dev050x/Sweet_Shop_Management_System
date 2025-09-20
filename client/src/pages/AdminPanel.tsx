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
    <div style={{ padding: 12 }}>
      <h2>Admin Panel</h2>

      <section style={{ marginBottom: 20 }}>
        <h3>Add Sweet</h3>
        <form onSubmit={handleAdd(onAdd)}>
          <div>
            <input placeholder="Name" {...addRegister("name")} />
            {addErrors.name && <div style={{ color: "red" }}>{addErrors.name.message}</div>}
          </div>
          <div>
            <input placeholder="Category (e.g., CHOCOLATE)" {...addRegister("category")} />
            {addErrors.category && <div style={{ color: "red" }}>{addErrors.category.message}</div>}
          </div>
          <div>
            <input type="number" step="0.01" placeholder="Price" {...addRegister("price", { valueAsNumber: true })} />
            {addErrors.price && <div style={{ color: "red" }}>{addErrors.price.message}</div>}
          </div>
          <div>
            <input type="number" placeholder="Quantity" {...addRegister("quantity", { valueAsNumber: true })} />
            {addErrors.quantity && <div style={{ color: "red" }}>{addErrors.quantity.message}</div>}
          </div>
          <div><button disabled={addSubmitting} type="submit">{addSubmitting ? "Adding..." : "Add Sweet"}</button></div>
        </form>
      </section>

      <section style={{ marginBottom: 20 }}>
        <h3>Existing Sweets</h3>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          {sweets.map(s => (
            <div key={s.id} style={{ border: "1px solid #ddd", padding: 8, minWidth: 220 }}>
              <div><strong>{s.name}</strong></div>
              <div>Category: {s.category}</div>
              <div>Price: {s.price}</div>
              <div>Quantity: {s.quantity}</div>

              <div style={{ marginTop: 8 }}>
                <button onClick={() => onStartEdit(s.id)}>Edit</button>
                <button onClick={() => onDelete(s.id)} style={{ marginLeft: 6 }}>Delete</button>
                <button onClick={() => onStartRestock(s.id)} style={{ marginLeft: 6 }}>Restock</button>
              </div>

              {/* Inline edit form */}
              {editingId === s.id && (
                <form onSubmit={handleEditSubmit(onEdit)} style={{ marginTop: 8 }}>
                  <div><input placeholder="Name" {...editRegister("name")} /></div>
                  {editErrors.name && <div style={{ color: "red" }}>{editErrors.name.message}</div>}
                  <div><input placeholder="Category" {...editRegister("category")} /></div>
                  {editErrors.category && <div style={{ color: "red" }}>{editErrors.category.message}</div>}
                  <div><input type="number" step="0.01" placeholder="Price" {...editRegister("price", { valueAsNumber: true })} /></div>
                  {editErrors.price && <div style={{ color: "red" }}>{editErrors.price.message}</div>}
                  <div><input type="number" placeholder="Quantity" {...editRegister("quantity", { valueAsNumber: true })} /></div>
                  {editErrors.quantity && <div style={{ color: "red" }}>{editErrors.quantity.message}</div>}
                  <div style={{ marginTop: 6 }}>
                    <button disabled={editSubmitting} type="submit">{editSubmitting ? "Saving..." : "Save"}</button>
                    <button type="button" onClick={() => { setEditingId(null); resetEdit(); }} style={{ marginLeft: 6 }}>Cancel</button>
                  </div>
                </form>
              )}

              {/* Inline restock form */}
              {restockId === s.id && (
                <form onSubmit={handleRestockSubmit(onRestock)} style={{ marginTop: 8 }}>
                  <div>
                    <input type="number" placeholder="Restock quantity" {...restockRegister("quantity", { valueAsNumber: true })} />
                    {restockErrors.quantity && <div style={{ color: "red" }}>{restockErrors.quantity.message}</div>}
                  </div>
                  <div style={{ marginTop: 6 }}>
                    <button disabled={restockSubmitting} type="submit">{restockSubmitting ? "Restocking..." : "Restock"}</button>
                    <button type="button" onClick={() => setRestockId(null)} style={{ marginLeft: 6 }}>Cancel</button>
                  </div>
                </form>
              )}
            </div>
          ))}
        </div>
      </section>

      <div>
        <button onClick={() => fetchSweets()}>Refresh list</button>
      </div>
    </div>
  );
}