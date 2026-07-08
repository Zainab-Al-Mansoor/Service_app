'use client';

import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Shield,
  Clock,
  Star,
  ChevronRight,
  Wrench,
  Droplets,
  Zap,
  Paintbrush,
  Fan,
  Bug,
  Scissors
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import TextTicker from '@/components/ui/TextTicker';
import HowItWorks from '@/components/ui/HowItWorks';
import Header from '@/components/ui/Header';
import Footer from '@/components/ui/Footer';

const services = [
  { name: 'Home Cleaning', icon: Sparkles, description: 'Deep cleaning for your home' },
  { name: 'Plumbing', icon: Droplets, description: 'Expert pipe repair & installation' },
  { name: 'Electrical', icon: Zap, description: 'Safe electrical solutions' },
  { name: 'Painting', icon: Paintbrush, description: 'Transform your space' },
  { name: 'AC Services', icon: Fan, description: 'Cooling system maintenance' },
  { name: 'Pest Control', icon: Bug, description: 'Keep pests away' },
  { name: 'Appliance Repair', icon: Wrench, description: 'Fix your appliances' },
  { name: 'Beauty & Wellness', icon: Scissors, description: 'Spa services at home' },
];

const features = [
  { icon: Clock, title: 'On-Time Service', description: 'Our providers arrive when promised' },
  { icon: Shield, title: 'Verified Professionals', description: 'All providers are background checked' },
  { icon: Star, title: 'Quality Guaranteed', description: 'Satisfaction or your money back' },
];

export default function LandingPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  // useEffect(() => {
  //   if (!loading && user) {
  //     if (user.role === 'admin') {
  //       router.push('/admin');
  //     } else if (user.role === 'provider') {
  //       router.push('/provider');
  //     } else {
  //       router.push('/customer');
  //     }
  //   }
  // }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}

      <Header />
      {/* Hero Section */}
      <section className="relative pt-20 mt-10 pb-24 px-4 overflow-hidden bg-[#FDFBF7]">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">

          {/* Left Side: Content */}
          <div className="text-left space-y-8 relative z-20">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-white border border-slate-200 rounded-full text-slate-600 text-xs font-medium shadow-sm">
              <span className="w-2 h-2 rounded-full bg-orange-500"></span>
              Trusted by 50,000+ households
            </div>

            <h1 className="text-6xl md:text-7xl font-bold text-slate-900 tracking-tight leading-[1.05]">
              Professional services <span className="text-orange-600 italic">at your doorstep.</span>
            </h1>

            <p className="text-lg text-slate-600 max-w-md leading-relaxed">
              Book trusted professionals for home cleaning, repairs, beauty services, and more. Quality guaranteed — or we make it right.
            </p>

            {/* Buttons with explicit z-index to ensure they are clickable */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Link href="/signup">
                <Button size="lg" className="h-14 px-8 rounded-full bg-slate-900 hover:bg-slate-800 text-white text-lg">
                  Book a service <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
              <Link href="/signup?role=provider">
                <Button size="lg" variant="outline" className="h-14 px-8 rounded-full border-slate-200 text-lg hover:bg-slate-50">
                  Become a provider
                </Button>
              </Link>
            </div>

            {/* Stats row */}
            <div className="grid grid-cols-3 gap-8 pt-8 border-t border-slate-200">
              <div><div className="text-2xl font-bold text-slate-900">4.9/5</div><div className="text-sm text-slate-500">avg. rating</div></div>
              <div><div className="text-2xl font-bold text-slate-900">100%</div><div className="text-sm text-slate-500">vetted pros</div></div>
              <div><div className="text-2xl font-bold text-slate-900">&lt;60min</div><div className="text-sm text-slate-500">response</div></div>
            </div>
          </div>

          {/* Right Side: Visual Content */}
          <div className="relative h-[500px] z-10">
            {/* Main Large Image */}
            <div className="absolute right-0 top-0 w-3/4 h-full rounded-3xl overflow-hidden shadow-2xl">
              <img
                src="/images/hero-professional.jpg"
                className="w-full h-full object-cover object-top"
                alt="Professional"
              />
            </div>

            {/* Floating Small Images */}
            <div className="absolute left-0 top-10 w-2/5 rounded-3xl overflow-hidden shadow-xl border-4 border-white">
              <img
                src="/images/hero-cleaning.jpg"
                className="w-full aspect-square object-cover"
                alt="Cleaning"
              />
            </div>
            <div className="absolute left-10 bottom-10 w-2/5 rounded-3xl overflow-hidden shadow-xl border-4 border-white">
              <img
                src="/images/hero-beauty.jpg"
                className="w-full aspect-square object-cover"
                alt="Service"
              />
            </div>
          </div>
        </div>
      </section>
      {/*Text Slider*/}
      <TextTicker />


      {/* Services Grid */}
      <section id="services" className="py-24 px-4 bg-[#FDFBF7]">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="mb-16">
            <p className="text-sm font-medium text-slate-500 uppercase tracking-widest mb-4">— OUR SERVICES</p>
            <h2 className="text-5xl md:text-6xl font-bold text-slate-900 mb-6">
              Everything your home <br />
              <span className="italic text-orange-600">needs</span>, handled with care.
            </h2>
            <p className="text-lg text-slate-600 max-w-lg">
              A curated roster of specialists across eight categories — each vetted, insured, and rated by your neighbours.
            </p>
          </div>

          {/* Grid Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((service, index) => (
              <Card
                key={service.name}
                className="group relative bg-white border-slate-100 shadow-sm hover:shadow-xl transition-all duration-300 rounded-3xl p-6"
              >
                {/* Numbering */}
                <div className="absolute top-6 right-6 text-slate-300 font-bold text-lg">
                  {String(index + 1).padStart(2, '0')}
                </div>

                {/* Icon Container */}
                <div className="w-12 h-12 mb-8 bg-orange-50 rounded-2xl flex items-center justify-center">
                  <service.icon className="w-6 h-6 text-orange-600" />
                </div>

                {/* Content */}
                <h3 className="text-xl font-bold text-slate-900 mb-2">{service.name}</h3>
                <p className="text-slate-500 text-sm mb-6">{service.description}</p>

                {/* Explore Link */}
                <a href="#" className="inline-flex items-center text-sm font-semibold text-slate-900 group-hover:text-orange-600 transition-colors">
                  Explore <ChevronRight className="w-4 h-4 ml-1" />
                </a>
              </Card>
            ))}
          </div>
        </div>
      </section>
      <section id="features" className="py-24 px-4 bg-[#FDFBF7]">
        <div className="max-w-7xl mx-auto">

          {/* Section Header & Image Grid */}
          <div className="grid lg:grid-cols-2 gap-16 items-center mb-16">

            {/* Left side: Heading */}
            <div>
              <p className="text-sm font-medium text-slate-500 uppercase tracking-widest mb-4">— WHY CHOOSE US</p>
              <h2 className="text-5xl font-bold text-slate-900 leading-[1.1]">
                Reliability, warmth, <br />
                <span className="italic text-orange-600">and craft</span> — in every visit.
              </h2>
            </div>

            {/* Right side: Image with Overlay Text */}
            <div className="relative rounded-3xl overflow-hidden shadow-2xl h-[300px] lg:h-[350px]">
              <img
                src="/images/hero-cleaning.jpg"
                className="w-full h-full object-cover"
                alt="Why Choose Us"
              />
              <div className="absolute bottom-6 left-6 bg-white/90 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg">
                <p className="text-sm font-medium text-slate-900">"We treat every home like it were our own."</p>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <div key={feature.title} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-lg transition-all duration-300 relative">
                {/* Numbering */}
                <div className="text-slate-300 font-bold text-lg mb-6 text-right">
                  {String(index + 1).padStart(2, '0')}
                </div>

                <div className="w-12 h-12 mb-6 bg-orange-50 rounded-2xl flex items-center justify-center">
                  <feature.icon className="w-6 h-6 text-orange-600" />
                </div>

                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-600 leading-relaxed">{feature.description}</p>

                {/* Bottom decorative line */}
                <div className="mt-8 h-1 w-12 bg-orange-200 rounded-full" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <HowItWorks />



      {/* CTA */}
      <section className="py-24 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="bg-[#E28557] rounded-[3rem] p-12 lg:p-20 grid lg:grid-cols-2 gap-16 items-center">

            {/* Left side: Text Content */}
            <div className="text-white space-y-8">
              <div>
                <p className="text-sm font-medium text-orange-100 uppercase tracking-widest mb-4">— GET STARTED</p>
                <h2 className="text-5xl md:text-6xl font-bold leading-[1.1]">
                  Ready to Get <br />
                  <span className="italic">Started?</span>
                </h2>
                <p className="text-lg text-orange-50 mt-6 max-w-md leading-relaxed">
                  Join thousands of satisfied customers today and discover the easiest way to care for your home.
                </p>
              </div>

              <Link href="/signup">
                <Button size="lg" className="h-14 px-8 rounded-full bg-white text-[#E28557] hover:bg-orange-50 text-lg font-semibold transition-all">
                  Create Free Account <ChevronRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>
            </div>

            {/* Right side: Image with Testimonial */}
            <div className="relative">
              <div className="rounded-[2rem] overflow-hidden shadow-2xl h-[400px]">
                <img
                  src="/images/cta-home.jpg"
                  className="w-full h-full object-cover"
                  alt="Happy family at home"
                />
              </div>

              {/* Testimonial Card */}
              <div className="absolute -bottom-10 -left-6 lg:-left-20 bg-white p-6 rounded-3xl shadow-xl max-w-xs">
                <p className="text-slate-700 italic mb-3">
                  "Our home has never felt this cared for."
                </p>
                <p className="text-sm font-bold text-slate-900">— Priya, Bangalore</p>
              </div>
            </div>
          </div>
        </div>
      </section>
      {/* Footer */}
     <Footer/>
    </div>
  );
}
