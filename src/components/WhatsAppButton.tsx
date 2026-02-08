import { MessageCircle } from 'lucide-react';

const WhatsAppButton = () => {
  const phoneNumber = '255746582989';
  const message = encodeURIComponent('Hello! I have a question about iTechGlass products.');
  
  return (
    <a
      href={`https://wa.me/${phoneNumber}?text=${message}`}
      target="_blank"
      rel="noopener noreferrer"
      className="fixed bottom-6 right-6 z-50 flex items-center justify-center w-14 h-14 rounded-full bg-[#25D366] text-white shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
      aria-label="Chat on WhatsApp"
    >
      <MessageCircle className="h-7 w-7" />
    </a>
  );
};

export default WhatsAppButton;
