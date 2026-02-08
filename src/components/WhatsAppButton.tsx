import { MessageCircle } from 'lucide-react';

const WhatsAppButton = () => {
  const phoneNumber = '255746582989';
  const message = encodeURIComponent('Hello! I have a question about iTechGlass products.');
  const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
  
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
  };
  
  return (
    <button
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] text-white shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="h-7 w-7" />
    </button>
  );
};

export default WhatsAppButton;
