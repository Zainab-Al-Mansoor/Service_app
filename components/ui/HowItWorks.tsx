'use client';
import { motion } from 'framer-motion';

export default function HowItWorks() {
  const steps = [
    { number: '1', title: 'Choose Service', desc: 'Browse our wide range of services and pick what you need' },
    { number: '2', title: 'Select Time', desc: 'Pick a convenient date and time for your appointment' },
    { number: '3', title: 'Get It Done', desc: 'Our verified professional arrives and completes the job' },
  ];

  return (
    <section id="how-it-works" className="py-24 px-4 bg-[#261C16] text-white">
      <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
        
        {/* Left Side: Text Content */}
        <div className="space-y-12">
          <div>
            <p className="text-sm font-medium text-orange-400 uppercase tracking-widest mb-4">— HOW IT WORKS</p>
            <h2 className="text-5xl md:text-6xl font-bold leading-[1.1]">
              Book your service in <br />
              <span className="italic text-orange-500">3 simple steps.</span>
            </h2>
            <p className="text-slate-300 mt-6 max-w-md text-lg">
              No phone calls, no back-and-forth. Pick, schedule, and relax - we will handle the rest.
            </p>
          </div>

          <div className="space-y-8">
            {steps.map((step) => (
              <div key={step.number} className="flex gap-6 items-start">
                <div className="flex-shrink-0 w-12 h-12 rounded-full border border-orange-500/30 flex items-center justify-center text-orange-500 font-bold">
                  {step.number}
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-1">{step.title}</h3>
                  <p className="text-slate-400 text-sm leading-relaxed">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side: Image */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          className="relative h-[450px] rounded-3xl overflow-hidden shadow-2xl"
        >
          <img 
            src="/images/how-it-works-hero.jpg" 
            className="w-full h-full object-cover" 
            alt="How it works" 
          />
          {/* Booking Time Tag */}
          <div className="absolute bottom-8 left-8 bg-black/40 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10">
            <p className="text-3xl font-bold">3 min</p>
            <p className="text-xs text-slate-300 uppercase tracking-wider">avg. booking time</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}