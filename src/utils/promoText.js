import { STORE_CONFIG } from '../config/constants';

export const getPromoText = () => {
  return `🎮 Mau top up game murah & cepat? Coba ${STORE_CONFIG.storeName}!

✅ Proses instan
✅ Harga terjangkau
✅ Terpercaya

Kunjungi sekarang: ${STORE_CONFIG.websiteUrl}
📱 WA/order: ${STORE_CONFIG.whatsappNumber}

#TopUp #${STORE_CONFIG.storeName.replace(/\s+/g, '')} #GameTopUp`;
};
