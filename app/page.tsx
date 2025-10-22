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
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Visitor Management
          </h1>
          <p className="text-gray-600 mb-8">
            Scan this QR code to access the visitor registration form
          </p>
          
          {qrUrl && (
            <div className="flex flex-col items-center space-y-6">
              <div className="bg-white p-4 rounded-lg border-2 border-gray-200">
                <QRCodeSVG 
                  value={qrUrl} 
                  size={256} 
                  includeMargin 
                />
              </div>
              
              <div className="text-center">
                <p className="text-sm text-gray-500 mb-2">QR Code contains:</p>
                <code className="bg-gray-100 px-3 py-2 rounded text-xs break-all">
                  {qrUrl}
                </code>
              </div>
              
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  When visitors scan this QR code, they will be redirected to the visitor registration form.
                </p>
              </div>
              
              <a
                href="/visitor/form"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
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
