"use client";
import "./globals.css"; // Optionally import global styles (if any)
import React, { useEffect } from "react";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  useEffect(() => {
    const originalConsoleError = console.error;
    console.error = (message: string) => {
      if (
        message.includes(
          "Using UNSAFE_componentWillReceiveProps in strict mode"
        )
      ) {
        //Workaround for https://github.com/swagger-api/swagger-ui/issues/5729
        return; // Suppress this specific warning
      }
      originalConsoleError(message);
    };
  }, []);

  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
