import { MessageCircle } from 'lucide-react';

const WhatsAppButton = () => {
  const phoneNumber = '255746582989';
  const message = 'Hello! I have a question about iTechGlass products.';
  const encodedMessage = encodeURIComponent(message);

  const isMobile =
    typeof navigator !== 'undefined' &&
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  // Desktop: avoid api.whatsapp.com redirects by linking directly to WhatsApp Web
  const whatsappUrl = isMobile
    ? `https://wa.me/${phoneNumber}?text=${encodedMessage}`
    : `https://web.whatsapp.com/send?phone=${phoneNumber}&text=${encodedMessage}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => {
        // In strict iframe/preview contexts, window.open may be blocked.
        // If it succeeds, prevent default to avoid duplicate tabs.
        const opened = window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
        if (opened) e.preventDefault();
      }}
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="h-7 w-7" />
    </a>
  );
};

export default WhatsAppButton;
