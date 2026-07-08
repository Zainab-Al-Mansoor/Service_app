'use client';

import { useQuery } from '@tanstack/react-query';
import apiClient from '@/lib/api-client';
import { useState } from 'react';
import Link from 'next/link';
import { Sparkles, Clock, Search, Star, ArrowRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function CustomerServicesPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const { data: categoriesData } = useQuery({
    queryKey: ['categories'],
    queryFn: async () => (await apiClient.getCategories()).data?.categories || [],
  });

  const { data: servicesData } = useQuery({
    queryKey: ['services', selectedCategory, searchQuery],
    queryFn: async () => (await apiClient.getServices({ category: selectedCategory || undefined, search: searchQuery || undefined })).data,
  });

  const services = servicesData?.services || [];

  return (
    <div className="space-y-10 pb-12">
      {/* 1. DARK HERO SECTION */}
      <div className="bg-[#0F172A] rounded-[32px] p-8 md:p-12 text-white flex flex-col md:flex-row justify-between items-center gap-8 shadow-2xl">
        <div className="space-y-4 max-w-lg">
          <div className="inline-flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full text-xs font-medium">
            <Sparkles className="w-3 h-3 text-orange-400" /> BROWSE SERVICES
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold leading-tight tracking-tight">
            Find the perfect help, <span className="text-[#E28557]">right at your door.</span>
          </h1>
          <p className="text-slate-400">Vetted professionals for cleaning, repairs, beauty and everything in-between — booked in under a minute.</p>
          
          <div className="relative pt-2">
            <Search className="absolute left-4 top-6 w-5 h-5 text-slate-500" />
            <Input 
              placeholder="Try 'deep cleaning' or 'AC service'..." 
              className="pl-12 py-7 rounded-2xl bg-white/5 border-white/10 text-white placeholder:text-slate-500"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Button className="absolute right-2 top-3 bg-[#E28557] hover:bg-orange-600 rounded-xl px-8 h-12">Search</Button>
          </div>
        </div>

        {/* Today's Pick Card */}
        <div className="bg-white/5 border border-white/10 p-6 rounded-3xl w-full md:w-80 space-y-4">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Today's Pick</p>
          <h3 className="text-xl font-bold">Deep Home Cleaning</h3>
          <div className="flex gap-4 pt-2">
             <div><p className="text-lg font-bold">$49</p><p className="text-[10px] text-slate-400">FROM</p></div>
             <div><p className="text-lg font-bold">3h</p><p className="text-[10px] text-slate-400">AVG</p></div>
             <div><p className="text-lg font-bold">4.9★</p><p className="text-[10px] text-slate-400">RATED</p></div>
          </div>
        </div>
      </div>

      {/* 2. CATEGORIES */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold text-[#0F172A]">Categories</h2>
        <div className="flex flex-wrap gap-2">
           <button onClick={() => setSelectedCategory(null)} className={`px-5 py-2.5 rounded-full text-sm font-semibold transition ${selectedCategory === null ? 'bg-[#0F172A] text-white' : 'bg-slate-100'}`}>All Services</button>
           {categoriesData?.map((cat) => (
             <button key={cat.id} onClick={() => setSelectedCategory(cat.id)} className={`px-5 py-2.5 rounded-full text-sm font-semibold transition ${selectedCategory === cat.id ? 'bg-[#0F172A] text-white' : 'bg-slate-100'}`}>
               {cat.name}
             </button>
           ))}
        </div>
      </div>

      {/* 3. POPULAR SERVICES */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-[#0F172A]">Popular services</h2>
          <p className="text-sm font-bold text-[#E28557] uppercase tracking-wider">Sort: Popular</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((service) => (
            <Card key={service.id} className="rounded-3xl border-none shadow-sm hover:shadow-lg transition-all duration-300">
              <div className="h-48 bg-gradient-to-br from-orange-100 to-orange-50 p-6 flex flex-col justify-between">
                <div className="bg-white px-3 py-1 rounded-full text-[10px] font-bold uppercase w-fit">{service.category?.name}</div>
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center self-end"><ArrowRight className="w-5 h-5"/></div>
              </div>
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="font-bold text-lg text-[#0F172A]">{service.name}</h3>
                  <div className="flex items-center gap-1 font-bold text-sm"><Star className="w-4 h-4 fill-amber-400 text-amber-400"/> 4.8</div>
                </div>
                <p className="text-sm text-slate-500 mb-4 line-clamp-2">{service.description}</p>
                <div className="flex items-center gap-4 text-xs text-slate-400 mb-6">
                   <span className="flex items-center gap-1"><Clock className="w-3 h-3"/> {service.duration_minutes} min</span>
                </div>
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center gap-2">
                     <div className="w-8 h-8 rounded-full bg-[#0F172A] text-white flex items-center justify-center text-xs font-bold">AK</div>
                     <div><p className="text-xs font-bold">{service.provider?.full_name}</p><p className="text-[10px] text-green-600">Verified provider</p></div>
                  </div>
                  <div className="text-right"><p className="text-[10px] text-slate-400">FROM</p><p className="font-bold">${service.price}</p></div>
                </div>
                <Link href={`/customer/book/${service.id}`}><Button className="w-full mt-4 bg-[#0F172A] hover:bg-black rounded-xl py-6">Book now</Button></Link>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}