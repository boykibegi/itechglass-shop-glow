import { MessageCircle } from 'lucide-react';

const WhatsAppButton = () => {
  const phoneNumber = '255746582989';
  const message = 'Hello! I have a question about iTechGlass products.';
  const encodedMessage = encodeURIComponent(message);

  const isMobile =
    typeof navigator !== 'undefined' &&
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  const whatsappUrl = isMobile
    ? `https://wa.me/${phoneNumber}?text=${encodedMessage}`
    : `https://web.whatsapp.com/send?phone=${phoneNumber}&text=${encodedMessage}`;

  return (
    <a
      href={whatsappUrl}
      target="_blank"
      rel="noopener noreferrer"
      onClick={(e) => {
        const opened = window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
        if (opened) e.preventDefault();
      }}
      className="group fixed bottom-6 right-6 z-50 flex items-center gap-3"
      aria-label="Chat on WhatsApp"
    >
      {/* Tooltip */}
      <span className="hidden sm:block opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all duration-300 bg-card border border-border text-foreground text-xs font-medium px-3 py-1.5 rounded-full shadow-lg whitespace-nowrap pointer-events-none">
        Chat with us
      </span>

      {/* Button */}
      <div className="relative flex items-center justify-center w-14 h-14">
        {/* Ping ring */}
        <span className="absolute inset-0 rounded-full bg-[#25D366]/20 animate-ping [animation-duration:2.5s]" />
        {/* Glow */}
        <span className="absolute inset-0 rounded-full bg-[#25D366]/10 blur-md scale-125" />
        {/* Icon circle */}
        <span className="relative flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] shadow-[0_4px_20px_-4px_rgba(37,211,102,0.5)] hover:shadow-[0_8px_30px_-4px_rgba(37,211,102,0.6)] hover:-translate-y-1 transition-all duration-300">
          <MessageCircle className="h-6 w-6 text-white" />
        </span>
      </div>
    </a>
  );
};

export default WhatsAppButton;
