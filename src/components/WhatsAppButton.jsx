import React from 'react';
import { MessageCircle } from 'lucide-react';

export default function WhatsAppButton() {
  // Format nomor dari 082395928309 menjadi 6282395928309 untuk API WhatsApp
  const waNumber = "6282395928309"; 
  const message = "Halo Admin Kenzy Store, saya butuh bantuan terkait transaksi/akun saya.";
  const waLink = `https://wa.me/${waNumber}?text=${encodeURIComponent(message)}`;

  return (
    <a 
      href={waLink} 
      target="_blank" 
      rel="noopener noreferrer"
      className="wa-float-btn"
      title="Bantuan WhatsApp"
    >
      <MessageCircle size={28} />
    </a>
  );
}
