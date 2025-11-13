import React from 'react';

export default function Footer() {
  return (
    <footer className="w-full bg-gray-100 text-center p-6 mt-12">
      <p className="text-gray-600 text-sm">
        © {new Date().getFullYear()} Campus Closet Share. All rights reserved.
      </p>
    </footer>
  );
}