import {
  FloatingButton,
  FloatingButtonItem,
} from "@/components/ui/floating-button";

import { IconBrandWhatsapp } from "@tabler/icons-react";
import { motion } from "framer-motion";

function FloatingButtonExample() {
  const phoneNumber = "9365346556"; // Replace with Namma Store's WhatsApp number
  const message = encodeURIComponent(
    "Hello, I am interested in enquiring about Namma Store. Can you provide more details?"
  );

  const openWhatsApp = () => {
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, "_blank");
  };

  return (
    <FloatingButton
      triggerContent={
        <motion.button
          className="flex items-center justify-center h-12 w-12 rounded-full bg-[#25D366] text-white shadow-lg"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          transition={{ type: "spring", stiffness: 300, damping: 10 }}
          onClick={openWhatsApp} // Opens WhatsApp on click
        >
          <IconBrandWhatsapp size={28} />
        </motion.button>
      }
      children={undefined}
    />
  );
}

export { FloatingButtonExample };
