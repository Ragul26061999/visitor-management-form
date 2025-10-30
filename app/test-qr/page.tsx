"use client";

import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";
import Link from "next/link";

export default function TestQRPage() {
  const [qrUrl, setQrUrl] = useState("");

  useEffect(() => {
    // Generate the URL for the QR scan page with sample data
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const scanUrl = new URL(`${baseUrl}/visitor/scan`);
    
    // Add the exact sample data from the requirements
    scanUrl.searchParams.append("checkInTime", "2025-10-25T13:22:28+05:30");
    scanUrl.searchParams.append("checkOutTime", "2025-10-25T13:56:12+05:30");
    scanUrl.searchParams.append("email", "ragul26061999@gmail.com");
    scanUrl.searchParams.append("hostDepartment", "ftufktfkyuuy");
    scanUrl.searchParams.append("hostPerson", "vishal");
    scanUrl.searchParams.append("mobileNumber", "8939243996");
    scanUrl.searchParams.append("status", "checked-out");
    scanUrl.searchParams.append("visitPurpose", "parent");
    scanUrl.searchParams.append("visitorName", "ragul");
    scanUrl.searchParams.append("visitorType", "current");
    
    setQrUrl(scanUrl.toString());
  }, []);

  return (
    <div className="min-h-screen w-full bg-[linear-gradient(135deg,#f7f7ff_0%,#f2fbfa_40%,#fff7f5_100%)] flex items-center justify-center p-4">
      <div className="max-w-md w-full rounded-2xl shadow-[0_10px_30px_rgba(16,24,40,0.08)] border border-[#E9ECEF] bg-white/90 backdrop-blur p-8">
        <div className="text-center">
          <h1 className="text-3xl font-semibold tracking-tight text-[#0F172A] mb-6">
            Test QR Code
          </h1>
          
          {qrUrl && (
            <div className="flex flex-col items-center space-y-6">
              <div className="bg-white p-4 rounded-xl border border-[#E2E8F0] shadow-[0_6px_20px_rgba(2,6,23,0.06)]">
                <QRCodeSVG 
                  value={qrUrl} 
                  size={256} 
                  includeMargin 
                />
              </div>
              
              <div className="text-center">
                <p className="text-sm text-[#64748B] mb-2">Scan this QR code to test the functionality</p>
                <p className="text-sm text-[#475569]">
                  This QR code contains the exact data specified in your requirements.
                </p>
              </div>
              
              <Link
                href="/"
                className="inline-flex items-center px-5 py-2.5 rounded-xl text-white shadow-sm transition-colors bg-[#5B9EEF] hover:bg-[#4B8FDF]"
              >
                Back to Home
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}