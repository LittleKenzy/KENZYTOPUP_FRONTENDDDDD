export const formatRupiah = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (dateString) => {
  if (!dateString) return '';
  const options = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  };
  return new Date(dateString).toLocaleDateString('id-ID', options);
};

export const getCategoryIcon = (category) => {
  switch (category) {
    case 'GAME': return '🎮';
    case 'EWALLET': return '💳';
    case 'PLN': return '⚡';
    case 'PULSA': return '📱';
    case 'PAKET_DATA': return '🌐';
    default: return '🛒';
  }
};

export const getCategoryLabel = (category) => {
  switch (category) {
    case 'GAME': return 'Game Top-up';
    case 'EWALLET': return 'E-Wallet';
    case 'PLN': return 'Token PLN';
    case 'PULSA': return 'Pulsa Reguler';
    case 'PAKET_DATA': return 'Paket Data';
    default: return category;
  }
};
