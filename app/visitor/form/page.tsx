"use client";

import { useEffect, useMemo, useState, Suspense, type ChangeEvent, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { addDoc, collection, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebaseClient";
import { QRCodeSVG } from "qrcode.react";

type VisitorFormData = {
  fullName: string;
  phone: string;
  email?: string;
  purpose: string;
  toMeet?: string;
  vehicleNumber?: string;
};

function VisitorFormContent() {
  const searchParams = useSearchParams();
  const idFromUrl = useMemo(() => searchParams.get("id"), [searchParams]);
  const [form, setForm] = useState<VisitorFormData>({
    fullName: "",
    phone: "",
    email: "",
    purpose: "",
    toMeet: "",
    vehicleNumber: ""
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdId, setCreatedId] = useState<string | null>(null);

  useEffect(() => {
    if (idFromUrl) {
      setCreatedId(idFromUrl);
    }
  }, [idFromUrl]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setCreatedId(null);
    try {
      if (!form.fullName.trim()) throw new Error("Full name is required");
      if (!form.phone.trim()) throw new Error("Phone is required");
      if (!form.purpose.trim()) throw new Error("Purpose is required");

      const docRef = await addDoc(collection(db, "visitors"), {
        fullName: form.fullName.trim(),
        phone: form.phone.trim(),
        email: form.email?.trim() || null,
        purpose: form.purpose.trim(),
        toMeet: form.toMeet?.trim() || null,
        vehicleNumber: form.vehicleNumber?.trim() || null,
        status: "pending",
        createdAt: serverTimestamp()
      });
      setCreatedId(docRef.id);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to submit visitor form");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setForm({ fullName: "", phone: "", email: "", purpose: "", toMeet: "", vehicleNumber: "" });
    setCreatedId(null);
    setError(null);
  };

  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: 16 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 16 }}>Visitor Registration</h1>

      {!createdId && (
        <form onSubmit={handleSubmit} style={{ display: "grid", gap: 12 }}>
          <label style={{ display: "grid", gap: 6 }}>
            <span>Full name *</span>
            <input
              name="fullName"
              value={form.fullName}
              onChange={handleChange}
              placeholder="John Doe"
              required
              style={{ padding: 10, border: "1px solid #ddd", borderRadius: 8 }}
            />
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span>Phone *</span>
            <input
              name="phone"
              value={form.phone}
              onChange={handleChange}
              placeholder="98765 43210"
              required
              style={{ padding: 10, border: "1px solid #ddd", borderRadius: 8 }}
            />
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span>Email</span>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              placeholder="john@example.com"
              style={{ padding: 10, border: "1px solid #ddd", borderRadius: 8 }}
            />
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span>Purpose *</span>
            <input
              name="purpose"
              value={form.purpose}
              onChange={handleChange}
              placeholder="Delivery / Meeting / Parent / Vendor"
              required
              style={{ padding: 10, border: "1px solid #ddd", borderRadius: 8 }}
            />
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span>To meet (optional)</span>
            <input
              name="toMeet"
              value={form.toMeet}
              onChange={handleChange}
              placeholder="Person to meet"
              style={{ padding: 10, border: "1px solid #ddd", borderRadius: 8 }}
            />
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span>Vehicle number (optional)</span>
            <input
              name="vehicleNumber"
              value={form.vehicleNumber}
              onChange={handleChange}
              placeholder="TN 00 AB 1234"
              style={{ padding: 10, border: "1px solid #ddd", borderRadius: 8 }}
            />
          </label>

          {error && (
            <p style={{ color: "#c00" }}>{error}</p>
          )}

          <button
            type="submit"
            disabled={submitting}
            style={{
              padding: "10px 14px",
              background: "#111827",
              color: "#fff",
              borderRadius: 8,
              border: 0,
              cursor: submitting ? "not-allowed" : "pointer"
            }}
          >
            {submitting ? "Submitting..." : "Create visitor entry"}
          </button>
        </form>
      )}

      {createdId && (
        <div style={{ display: "grid", gap: 12, justifyItems: "center" }}>
          <p style={{ marginTop: 8 }}>Visitor created with ID:</p>
          <code style={{ padding: 8, background: "#f3f4f6", borderRadius: 6 }}>{createdId}</code>
          <QRCodeSVG value={createdId} size={220} includeMargin />
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={resetForm}
              style={{ padding: "8px 12px", border: "1px solid #ddd", borderRadius: 8 }}
            >
              New entry
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function VisitorFormPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VisitorFormContent />
    </Suspense>
  );
}


