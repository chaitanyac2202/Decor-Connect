import React from 'react';

const Footer = () => {
  return (
    <footer className="glass border-t border-white/10 py-6 mt-auto w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-sm text-gray-400">
        <p className="mb-2">© {new Date().getFullYear()} DecorConnect. All rights reserved.</p>
        <p className="text-xs text-gray-500">
          Emails sent via this platform must comply with CAN-SPAM regulations. Ensure you have appropriate consent before contacting businesses.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
