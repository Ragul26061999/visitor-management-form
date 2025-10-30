"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { doc, setDoc, serverTimestamp, collection } from "firebase/firestore";
import { db } from "@/lib/firebaseClient";
import { useAuth } from "@/app/contexts/AuthContext";

export default function QRScanPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { schoolId } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processQRData = async () => {
      try {
        // Extract data from URL parameters
        const checkInTime = searchParams.get("checkInTime");
        const checkOutTime = searchParams.get("checkOutTime");
        const email = searchParams.get("email");
        const hostDepartment = searchParams.get("hostDepartment");
        const hostPerson = searchParams.get("hostPerson");
        const mobileNumber = searchParams.get("mobileNumber");
        const status = searchParams.get("status");
        const visitPurpose = searchParams.get("visitPurpose");
        const visitorName = searchParams.get("visitorName");
        const visitorType = searchParams.get("visitorType");

        // Validate required school ID
        if (!schoolId) {
          throw new Error("School ID is missing. Please ensure you are logged in properly.");
        }

        // Generate a new visitor ID
        const visitorId = doc(collection(db, "visitors")).id;

        // Prepare the data according to the specified format
        const visitorData = {
          checkInTime: checkInTime ? new Date(checkInTime) : serverTimestamp(),
          checkOutTime: checkOutTime ? new Date(checkOutTime) : serverTimestamp(),
          createdAt: checkInTime ? new Date(checkInTime) : serverTimestamp(),
          email: email || "",
          hostDepartment: hostDepartment || "",
          hostPerson: hostPerson || "",
          mobileNumber: mobileNumber || "",
          schoolId: doc(db, "school", schoolId),
          status: status || "checked-in",
          visitPurpose: visitPurpose || "",
          visitorId: visitorId,
          visitorName: visitorName || "",
          visitorType: visitorType || "current"
        };

        // Store data in Firestore
        await setDoc(doc(db, "visitors", visitorId), visitorData);

        // Redirect to the form page with the visitor ID
        router.push(`/visitor/form?id=${visitorId}`);
      } catch (err) {
        console.error("Error processing QR data:", err);
        if (err instanceof Error) {
          setError(err.message || "Failed to process QR code data");
        } else {
          setError("Failed to process QR code data");
        }
      }
    };

    if (searchParams.toString()) {
      processQRData();
    } else {
      // If no parameters, redirect to form page
      router.push("/visitor/form");
    }
  }, [router, searchParams, schoolId]);

  if (error) {
    return (
      <div className="min-h-screen w-full bg-[linear-gradient(135deg,#f7f7ff_0%,#f2fbfa_40%,#fff7f5_100%)] flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-2xl shadow-[0_10px_30px_rgba(16,24,40,0.08)] border border-[#E9ECEF] bg-white/90 backdrop-blur p-8">
          <div className="text-center">
            <h1 className="text-2xl font-semibold text-red-600 mb-4">Error Processing QR Code</h1>
            <p className="text-[#475569] mb-6">{error}</p>
            <button
              onClick={() => router.push("/visitor/form")}
              className="inline-flex items-center px-5 py-2.5 rounded-xl text-white shadow-sm transition-colors bg-[#5B9EEF] hover:bg-[#4B8FDF]"
            >
              Go to Form
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full bg-[linear-gradient(135deg,#f7f7ff_0%,#f2fbfa_40%,#fff7f5_100%)] flex items-center justify-center p-4">
      <div className="max-w-md w-full rounded-2xl shadow-[0_10px_30px_rgba(16,24,40,0.08)] border border-[#E9ECEF] bg-white/90 backdrop-blur p-8">
        <div className="text-center">
          <h1 className="text-2xl font-semibold text-[#0F172A] mb-4">Processing QR Code</h1>
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#5B9EEF] mx-auto"></div>
          <p className="text-[#475569] mt-4">Please wait while we process your information...</p>
        </div>
      </div>
    </div>
  );
}