"use client";

import { useEffect, useMemo, useState } from "react";
import { supabase } from "../../../lib/supabaseClient";

export type FieldType =
  | "text"
  | "textarea"
  | "number"
  | "datetime"
  | "select"
  | "checkbox"
  | "json";

export interface FieldConfig {
  key: string;
  label: string;
  type?: FieldType;
  placeholder?: string;
  options?: string[];
}

interface CrudManagerProps {
  title: string;
  description?: string;
  table: string;
  columns: FieldConfig[];
}

export default function CrudManager({
  title,
  description,
  table,
  columns,
}: CrudManagerProps) {
  const [rows, setRows] = useState<Record<string, any>[]>([]);
  const [status, setStatus] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);

  const initialFormState = useMemo(() => {
    const initial: Record<string, any> = {};
    columns.forEach((col) => {
      initial[col.key] = col.type === "checkbox" ? false : "";
    });
    return initial;
  }, [columns]);

  const [formState, setFormState] = useState<Record<string, any>>(initialFormState);

  const loadRows = async () => {
    if (!supabase) return;
    const { data, error } = await supabase.from(table).select("*").limit(200);
    if (error) {
      setStatus(error.message);
      return;
    }
    setRows(data ?? []);
  };

  useEffect(() => {
    loadRows();
  }, [table]);

  const handleChange = (key: string, value: any) => {
    setFormState((prev) => ({ ...prev, [key]: value }));
  };

  const normalizePayload = () => {
    const payload: Record<string, any> = {};
    for (const field of columns) {
      const raw = formState[field.key];
      if (field.type === "number") {
        payload[field.key] = raw === "" ? null : Number(raw);
      } else if (field.type === "checkbox") {
        payload[field.key] = Boolean(raw);
      } else if (field.type === "json") {
        if (raw === "") {
          payload[field.key] = {};
        } else {
          payload[field.key] = JSON.parse(raw);
        }
      } else {
        payload[field.key] = raw === "" ? null : raw;
      }
    }
    return payload;
  };

  const handleSave = async () => {
    if (!supabase) return;
    try {
      const payload = normalizePayload();
      if (editingId) {
        const { error } = await supabase
          .from(table)
          .update(payload)
          .eq("id", editingId);
        if (error) {
          setStatus(error.message);
          return;
        }
        setStatus("Updated successfully.");
      } else {
        const { error } = await supabase.from(table).insert(payload);
        if (error) {
          setStatus(error.message);
          return;
        }
        setStatus("Created successfully.");
      }
      setEditingId(null);
      setFormState(initialFormState);
      loadRows();
    } catch (err) {
      setStatus(err instanceof Error ? err.message : "Invalid form data.");
    }
  };

  const handleEdit = (row: Record<string, any>) => {
    setEditingId(row.id);
    const next: Record<string, any> = {};
    columns.forEach((col) => {
      const value = row[col.key];
      if (col.type === "json") {
        next[col.key] = value ? JSON.stringify(value, null, 2) : "";
      } else if (col.type === "checkbox") {
        next[col.key] = Boolean(value);
      } else {
        next[col.key] = value ?? "";
      }
    });
    setFormState(next);
  };

  const handleDelete = async (id: string) => {
    if (!supabase) return;
    const { error } = await supabase.from(table).delete().eq("id", id);
    if (error) {
      setStatus(error.message);
      return;
    }
    setStatus("Deleted.");
    loadRows();
  };

  return (
    <div className="space-y-6">
      <div>
        <p className="admin-kicker">
          {table}
        </p>
        <h1 className="mt-2 admin-title">
          {title}
        </h1>
        {description && <p className="mt-2 admin-description">{description}</p>}
      </div>

      <div className="admin-card p-6">
        <div className="grid gap-4 md:grid-cols-2">
          {columns.map((field) => (
            <div key={field.key} className="space-y-2">
              <label className="admin-kicker-muted">
                {field.label}
              </label>
              {field.type === "textarea" || field.type === "json" ? (
                <textarea
                  className="admin-textarea h-24"
                  onChange={(event) => handleChange(field.key, event.target.value)}
                  placeholder={field.placeholder}
                  value={formState[field.key] ?? ""}
                />
              ) : field.type === "select" ? (
                <select
                  className="admin-select"
                  onChange={(event) => handleChange(field.key, event.target.value)}
                  value={formState[field.key] ?? ""}
                >
                  <option value="">Select</option>
                  {field.options?.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : field.type === "checkbox" ? (
                <input
                  checked={Boolean(formState[field.key])}
                  className="h-4 w-4 accent-opssignal"
                  onChange={(event) => handleChange(field.key, event.target.checked)}
                  type="checkbox"
                />
              ) : (
                <input
                  className="admin-input"
                  onChange={(event) => handleChange(field.key, event.target.value)}
                  placeholder={field.placeholder}
                  type={
                    field.type === "number"
                      ? "number"
                      : field.type === "datetime"
                        ? "datetime-local"
                        : "text"
                  }
                  value={formState[field.key] ?? ""}
                />
              )}
            </div>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            className="admin-button-primary"
            onClick={handleSave}
            type="button"
          >
            {editingId ? "Update" : "Create"}
          </button>
          <button
            className="admin-button-muted"
            onClick={() => {
              setEditingId(null);
              setFormState(initialFormState);
            }}
            type="button"
          >
            Reset
          </button>
        </div>
        {status && <p className="mt-3 text-xs text-opsfog/60">{status}</p>}
      </div>

      <div className="admin-card p-6">
        <p className="admin-kicker-muted">
          Records
        </p>
        <div className="mt-4 space-y-3">
          {rows.map((row) => (
            <div
              key={row.id}
              className="admin-card-inset p-4 text-sm text-opsfog"
            >
              <div className="grid gap-2 md:grid-cols-2">
                {columns.map((field) => (
                  <div key={field.key}>
                    <p className="text-[10px] uppercase tracking-[0.3em] text-opsfog/50">
                      {field.label}
                    </p>
                    <p className="mt-1 break-words text-opsfog/80">
                      {typeof row[field.key] === "object"
                        ? JSON.stringify(row[field.key])
                        : String(row[field.key] ?? "")}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  className="rounded-full border border-opssignal/40 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-opssignal"
                  onClick={() => handleEdit(row)}
                  type="button"
                >
                  Edit
                </button>
                <button
                  className="rounded-full border border-opsred/40 px-3 py-1 text-[10px] uppercase tracking-[0.3em] text-opsred"
                  onClick={() => handleDelete(row.id)}
                  type="button"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
          {rows.length === 0 && (
            <p className="text-sm text-opsfog/60">No records found.</p>
          )}
        </div>
      </div>
    </div>
  );
}
