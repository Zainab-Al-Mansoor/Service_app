'use client';
import { motion } from 'framer-motion';

const services = [
  "Electrical", "Beauty & Spa", "Appliance repair", 
  "Painting", "Pest control", "Plumbing", "Home Cleaning"
];

export default function TextTicker() {
  return (
    <div className="w-full py-6 border-y border-slate-200 bg-[#FDFBF7] overflow-hidden">
      <div className="max-w-7xl mx-auto flex items-center gap-8">
        <motion.div
          className="flex whitespace-nowrap gap-8"
          animate={{ x: ["0%", "-50%"] }}
          transition={{ repeat: Infinity, ease: "linear", duration: 20 }}
        >
          {[...services, ...services].map((service, index) => (
            <div key={index} className="flex items-center gap-8">
              <span className="text-slate-600 font-medium text-lg tracking-wide hover:text-orange-600 transition-colors cursor-pointer">
                {service}
              </span>
              <span className="text-slate-300 text-xl">✦</span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}