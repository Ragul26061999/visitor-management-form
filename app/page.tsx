"use client";

import { useState, useEffect } from "react";
import { QRCodeSVG } from "qrcode.react";

export default function Home() {
  const [qrUrl, setQrUrl] = useState("");

  useEffect(() => {
    // Generate the URL for the visitor form
    const baseUrl = typeof window !== 'undefined' ? window.location.origin : '';
    const formUrl = `${baseUrl}/visitor/form`;
    setQrUrl(formUrl);
  }, []);

  return (
    <div className="min-h-screen w-full bg-[linear-gradient(135deg,#f7f7ff_0%,#f2fbfa_40%,#fff7f5_100%)] flex items-center justify-center p-4">
      <div className="max-w-md w-full rounded-2xl shadow-[0_10px_30px_rgba(16,24,40,0.08)] border border-[#E9ECEF] bg-white/90 backdrop-blur p-8">
        <div className="text-center">
          {/* CLASSA Logo */}
          <div className="mb-6">
            <img 
              src="/image/classa logo.png" 
              alt="CLASSA Logo" 
              className="h-16 w-auto mx-auto"
            />
          </div>
          
          <h1 className="text-3xl font-semibold tracking-tight text-[#0F172A] mb-2">
            Visitor Management
          </h1>
          <p className="text-[#475569] mb-8">
            Scan this QR code to access the visitor registration form
          </p>
          
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
                <p className="text-sm text-[#64748B] mb-2">QR Code contains:</p>
                <code className="bg-[#F1F5F9] px-3 py-2 rounded-md text-xs break-all text-[#0F172A]">
                  {qrUrl}
                </code>
              </div>
              
              <div className="text-center">
                <p className="text-sm text-[#475569]">
                  When visitors scan this QR code, they will be redirected to the visitor registration form.
                </p>
              </div>
              
              <a
                href="/visitor/form"
                className="inline-flex items-center px-5 py-2.5 rounded-xl text-white shadow-sm transition-colors bg-[#5B9EEF] hover:bg-[#4B8FDF]"
              >
                Go to Form Directly
              </a>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
