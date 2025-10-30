"use client";

import { useEffect, useMemo, useState, Suspense, type ChangeEvent, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import { addDoc, collection, serverTimestamp, updateDoc, doc } from "firebase/firestore";
import { db } from "@/lib/firebaseClient";
import { QRCodeSVG } from "qrcode.react";
import { useAuth } from "../../contexts/AuthContext";

type VisitorFormData = {
  fullName: string;
  phone: string;
  email?: string;
  purpose: string;
  toMeet: string; // Made required as per new format
  department?: string; // Added department field
  // Removed vehicleNumber and duration as they're not in the new format
};

function VisitorFormContent() {
  const searchParams = useSearchParams();
  const idFromUrl = useMemo(() => searchParams.get("id"), [searchParams]);
  const { schoolId } = useAuth(); // Get schoolId from AuthContext
  const [form, setForm] = useState<VisitorFormData>({
    fullName: "",
    phone: "",
    email: "",
    purpose: "",
    toMeet: "", // hostPerson
    department: "" // hostDepartment
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createdId, setCreatedId] = useState<string | null>(null);
  const [isExistingVisitor, setIsExistingVisitor] = useState(false);

  useEffect(() => {
    if (idFromUrl) {
      setCreatedId(idFromUrl);
      // Check if this is an existing visitor record
      setIsExistingVisitor(true);
    }
  }, [idFromUrl]);

  // Pre-fill form with data from QR code if available
  useEffect(() => {
    const prefillForm = async () => {
      // Check if we have QR scan data in the URL
      const checkInTime = searchParams.get("checkInTime");
      if (checkInTime) {
        // This is a QR code scan, pre-fill the form
        setForm({
          fullName: searchParams.get("visitorName") || "",
          phone: searchParams.get("mobileNumber") || "",
          email: searchParams.get("email") || "",
          purpose: searchParams.get("visitPurpose") || "",
          toMeet: searchParams.get("hostPerson") || "",
          department: searchParams.get("hostDepartment") || ""
        });
      }
    };
    
    prefillForm();
  }, [searchParams]);

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
      if (!form.toMeet.trim()) throw new Error("Host person is required"); // Changed validation message

      // Validate that we have a school ID
      if (!schoolId) {
        throw new Error("School ID is missing. Please ensure you are logged in properly.");
      }

      // If this is an existing visitor (from QR scan), update the record
      if (isExistingVisitor && createdId) {
        // Update the existing document with form data
        await updateDoc(doc(db, "visitors", createdId), {
          visitorName: form.fullName.trim(),
          mobileNumber: form.phone.trim(),
          email: form.email?.trim() || null,
          visitPurpose: form.purpose.trim(),
          hostPerson: form.toMeet.trim(),
          hostDepartment: form.department?.trim() || null,
          visitorType: "current",
          status: "checked-in",
          checkInTime: serverTimestamp(),
          createdAt: serverTimestamp(),
          schoolId: doc(db, "school", schoolId) // Save as reference instead of string
        });
      } else {
        // Create the document first without visitorId
        const docRef = await addDoc(collection(db, "visitors"), {
          visitorName: form.fullName.trim(),
          mobileNumber: form.phone.trim(),
          email: form.email?.trim() || null,
          visitPurpose: form.purpose.trim(),
          hostPerson: form.toMeet.trim(),
          hostDepartment: form.department?.trim() || null,
          visitorType: "current",
          status: "checked-in",
          checkInTime: serverTimestamp(),
          createdAt: serverTimestamp(),
          schoolId: doc(db, "school", schoolId) // Save as reference instead of string
        });
        
        // Update the document to include visitorId (same as document ID)
        await updateDoc(doc(db, "visitors", docRef.id), { visitorId: docRef.id });
        
        setCreatedId(docRef.id);
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to submit visitor form");
    } finally {
      setSubmitting(false);
    }
  };

  const resetForm = () => {
    setForm({ fullName: "", phone: "", email: "", purpose: "", toMeet: "", department: "" });
    setCreatedId(null);
    setIsExistingVisitor(false);
    setError(null);
  };

  return (
    <div style={{ maxWidth: 640, margin: "0 auto", padding: 16 }}>
      {/* Card container */}
      <div style={{
        background: "#ffffff",
        border: "1px solid #E9ECEF",
        borderRadius: 16,
        boxShadow: "0 10px 30px rgba(16,24,40,0.08)",
        padding: 20
      }}>
        {/* CLASSA Logo */}
        <div style={{ textAlign: "center", marginBottom: 16 }}>
          <img
            src="/image/classa logo.png"
            alt="CLASSA Logo"
            style={{ height: 56, width: "auto", maxWidth: "100%" }}
          />
        </div>

        <h1 style={{ fontSize: 26, fontWeight: 600, marginBottom: 8, textAlign: "center", color: "#0F172A" }}>
          Visitor Registration
        </h1>
        <p style={{ textAlign: "center", color: "#475569", marginBottom: 16 }}>
          Please fill in your details below
        </p>

        {/* Important Visitor Information */}
        <div style={{
          background: "linear-gradient(135deg,#F7FAFF 0%, #FDF7FF 100%)",
          border: "1px solid #E2E8F0",
          borderRadius: 12,
          padding: 14,
          marginBottom: 18
        }}>
          <h3 style={{ fontSize: 15, fontWeight: 600, marginBottom: 8, color: "#334155" }}>
            Important Information for Visitors
          </h3>
          <ul style={{
            margin: 0,
            paddingLeft: 18,
            fontSize: 14,
            lineHeight: 1.6,
            color: "#475569"
          }}>
            <li>Please provide accurate contact information</li>
            <li>Bring a valid ID for verification</li>
            <li>Follow campus security protocols</li>
            <li>Wear visitor badge at all times</li>
            <li>Check out at the security desk when leaving</li>
          </ul>
        </div>

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
              style={{ padding: 12, border: "1px solid #E2E8F0", borderRadius: 12, background: "#F8FAFC" }}
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
              style={{ padding: 12, border: "1px solid #E2E8F0", borderRadius: 12, background: "#F8FAFC" }}
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
              style={{ padding: 12, border: "1px solid #E2E8F0", borderRadius: 12, background: "#F8FAFC" }}
            />
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span>Visit Purpose *</span>
            <input
              name="purpose"
              value={form.purpose}
              onChange={handleChange}
              placeholder="Delivery / Meeting / Parent / Vendor"
              required
              style={{ padding: 12, border: "1px solid #E2E8F0", borderRadius: 12, background: "#F8FAFC" }}
            />
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span>Host Person *</span>
            <input
              name="toMeet"
              value={form.toMeet}
              onChange={handleChange}
              placeholder="Person to meet"
              required
              style={{ padding: 12, border: "1px solid #E2E8F0", borderRadius: 12, background: "#F8FAFC" }}
            />
          </label>

          <label style={{ display: "grid", gap: 6 }}>
            <span>Host Department</span>
            <input
              name="department"
              value={form.department}
              onChange={handleChange}
              placeholder="Department of host"
              style={{ padding: 12, border: "1px solid #E2E8F0", borderRadius: 12, background: "#F8FAFC" }}
            />
          </label>

          {error && (
            <p style={{ color: "#DC2626", background: "#FEF2F2", border: "1px solid #FECACA", padding: 10, borderRadius: 10 }}>
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            style={{
              padding: "12px 16px",
              background: submitting ? "#A5B4FC" : "#6C8EF5",
              color: "#fff",
              borderRadius: 12,
              border: 0,
              boxShadow: "0 6px 18px rgba(37,99,235,0.25)",
              cursor: submitting ? "not-allowed" : "pointer",
              transition: "background 150ms ease"
            }}
          >
            {submitting ? "Submitting..." : (isExistingVisitor ? "Update visitor entry" : "Create visitor entry")}
          </button>
        </form>
      )}

      {createdId && (
        <div style={{ display: "grid", gap: 12, justifyItems: "center", paddingTop: 8 }}>
          <p style={{ marginTop: 4, color: "#334155" }}>Visitor created with ID:</p>
          <code style={{ padding: 8, background: "#F1F5F9", borderRadius: 10, color: "#0F172A" }}>{createdId}</code>
          <div style={{ background: "#ffffff", border: "1px solid #E2E8F0", borderRadius: 14, padding: 10, boxShadow: "0 6px 20px rgba(2,6,23,0.06)" }}>
            <QRCodeSVG value={createdId} size={220} includeMargin />
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={resetForm}
              style={{ padding: "10px 14px", border: "1px solid #CBD5E1", borderRadius: 12, background: "#F8FAFC", color: "#0F172A" }}
            >
              New entry
            </button>
          </div>
        </div>
      )}
      </div>
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