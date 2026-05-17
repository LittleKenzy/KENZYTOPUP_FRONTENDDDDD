import { getPromoText } from './promoText';

export const getShareLink = (channel) => {
  const text = getPromoText();
  
  switch (channel) {
    case 'whatsapp':
      return `https://wa.me/?text=${encodeURIComponent(text)}`;
    case 'instagram':
    case 'tiktok':
    case 'copy':
      // For these channels, we usually just need the text to copy to clipboard
      // The logic for opening the app or showing a toast will be in the component.
      return text;
    default:
      return text;
  }
};
