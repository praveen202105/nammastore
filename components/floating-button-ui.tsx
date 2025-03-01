import {
  FloatingButton,
  FloatingButtonItem,
} from "@/components/ui/floating-button";
import { cn } from "@/lib/utils";
import { IconBrandFacebook, IconBrandLinkedinFilled, IconBrandWhatsapp } from "@tabler/icons-react";
import { motion } from "framer-motion";
import {
  Contact2,
  DribbbleIcon,
  FacebookIcon,
  LinkedinIcon,
  PlusIcon,
} from "lucide-react";

function FloatingButtonExample() {
  const items = [
    {
      icon: <IconBrandFacebook />,
      bgColor: "bg-[#1877f2]",
    },
    {
      icon: <IconBrandWhatsapp />,
      bgColor: "bg-[#25D366]",
    },
    {
      icon: <IconBrandLinkedinFilled />,
      bgColor: "bg-[#0a66c2]",
    },
  ];

  return (
    <FloatingButton
      triggerContent={
        <motion.button
          className="flex items-center justify-center h-12 w-12 rounded-full bg-black dark:bg-slate-800 text-white/80"
          whileHover={{ scale: 1.1 }} // Slightly increases size on hover
          whileTap={{ scale: 0.9 }} // Slightly shrinks on tap/click
          transition={{ type: "spring", stiffness: 300, damping: 10 }} // Smooth spring animation
        >
          <Contact2 />
        </motion.button>
      }
    >
      {items.map((item, key) => (
        <FloatingButtonItem key={key}>
          <button
            className={cn(
              "h-12 w-12 rounded-full flex items-center justify-center text-white/80",
              item.bgColor
            )}
          >
            {item.icon}
          </button>
        </FloatingButtonItem>
      ))}
    </FloatingButton>
  );
}

export { FloatingButtonExample };
