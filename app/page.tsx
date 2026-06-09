"use client";

import React, { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Scissors, CheckCircle2, Star, ChevronRight, 
  MapPin, Phone, Clock, Ruler, Sparkles, Send, Loader2
} from "lucide-react";
import Link from "next/link";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "@/lib/firebase"; // Ensure this path matches your firebase config file

export default function YoonisTailorLandingPage() {
  const formRef = useRef<HTMLDivElement>(null);
  
  // --- Form State ---
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    service: "Bespoke Suit",
    message: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState("");

  const scrollToForm = () => {
    formRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleBookAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError("");

    try {
      // Save lead to Firestore Database
      await addDoc(collection(db, "consultations"), {
        ...formData,
        status: "New",
        createdAt: serverTimestamp()
      });
      
      setIsSuccess(true);
      setFormData({ name: "", phone: "", service: "Bespoke Suit", message: "" });
      
      // Reset success message after 5 seconds
      setTimeout(() => setIsSuccess(false), 5000);
    } catch (err) {
      console.error("Failed to submit form:", err);
      setError("Something went wrong. Please try calling us directly.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // --- Animation Variants (Explicitly typed as any to bypass strict Framer Motion checks) ---
  const fadeUp: any = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
  };

  const staggerContainer: any = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
  };

  return (
    <div className="min-h-screen bg-[#050505] text-neutral-200 font-sans selection:bg-amber-500/30 overflow-hidden antialiased">
      
      {/* --- SEO HIDDEN TAGS (For client-side rendering edge cases) --- */}
      <div className="hidden">
        <h1>Yoonis Tailor | Premium Bespoke Tailoring in Hargeisa</h1>
        <h2>Custom Suits, Traditional Somali Wear, and Precision Alterations</h2>
        <p>Master craftsmanship meets modern design. Book your private fitting with Yoonis Tailor today.</p>
      </div>

      {/* SECTION 1: STICKY NAVIGATION BAR */}
      <nav className="fixed top-0 w-full z-50 bg-[#050505]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 font-black text-2xl text-white tracking-tight uppercase">
            <div className="h-10 w-10 bg-gradient-to-br from-amber-600 to-amber-800 rounded-xl flex items-center justify-center text-white shadow-lg shadow-amber-600/20">
              <Scissors size={20} />
            </div>
            Yoonis <span className="text-amber-500 font-light">Tailor</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-bold text-neutral-400 uppercase tracking-widest">
            <Link href="#about" className="hover:text-amber-400 transition-colors">Our Craft</Link>
            <Link href="#services" className="hover:text-amber-400 transition-colors">Services</Link>
            <Link href="#reviews" className="hover:text-amber-400 transition-colors">Clientele</Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/auth" className="hidden md:block text-xs font-bold text-neutral-500 hover:text-white transition-colors uppercase tracking-widest">Staff Portal</Link>
            <button onClick={scrollToForm} className="text-sm font-bold bg-white text-black px-6 py-2.5 rounded-full hover:bg-amber-400 hover:text-black transition-all shadow-sm active:scale-95">
              Book Fitting
            </button>
          </div>
        </div>
      </nav>

      {/* SECTION 2: HERO COMPONENT (Luxury Layout) */}
      <section className="relative pt-32 pb-20 lg:pt-40 lg:pb-32 px-6 overflow-hidden min-h-[90vh] flex items-center">
        {/* Background Image with Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            src="https://images.unsplash.com/photo-1594938298596-70f56fb3cecb?auto=format&fit=crop&q=80" 
            alt="Bespoke Tailoring" 
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#050505] via-[#050505]/80 to-transparent" />
        </div>
        
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-amber-600/10 rounded-full blur-[150px] pointer-events-none z-0" />
        
        <motion.div 
          initial="hidden" animate="visible" variants={staggerContainer}
          className="max-w-5xl mx-auto text-center relative z-10"
        >
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-bold uppercase tracking-widest text-amber-400 mb-8 backdrop-blur-sm">
            <Sparkles size={14} /> Master Tailor in Hargeisa
          </motion.div>
          <motion.h1 variants={fadeUp} className="text-5xl lg:text-7xl font-black tracking-tight text-white mb-6 leading-tight">
            Elevating the Art of <br className="hidden lg:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-amber-500 to-yellow-600">
              Bespoke Craftsmanship.
            </span>
          </motion.h1>
          <motion.p variants={fadeUp} className="text-lg lg:text-xl text-neutral-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Experience precision tailoring where traditional elegance meets modern design. We craft suits, traditional wear, and flawless alterations tailored exclusively to your physique.
          </motion.p>
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button onClick={scrollToForm} className="w-full sm:w-auto px-8 py-4 bg-amber-600 hover:bg-amber-700 text-white rounded-full font-bold uppercase tracking-widest transition-all shadow-lg shadow-amber-600/20 flex items-center justify-center gap-2 active:scale-95">
              Get Pricing & Book <ChevronRight size={18} />
            </button>
          </motion.div>
        </motion.div>
      </section>

      {/* SECTION 3: WHO IS YOONIS TAILOR (About & SEO) */}
      <section id="about" className="py-24 px-6 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
        <div className="flex-1 w-full relative">
          <div className="aspect-[4/5] rounded-3xl overflow-hidden relative group">
            <img 
              src="https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&q=80" 
              alt="Yoonis Tailor measuring fabric" 
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <div className="absolute bottom-8 left-8">
              <div className="bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2 rounded-xl text-white font-bold inline-flex items-center gap-2">
                <Ruler size={18} className="text-amber-400" /> Precision in every stitch
              </div>
            </div>
          </div>
        </div>
        <div className="flex-1 space-y-6">
          <div className="text-xs font-bold text-amber-500 uppercase tracking-widest">Our Heritage</div>
          <h2 className="text-3xl lg:text-5xl font-black text-white tracking-tight">The Signature of Perfection.</h2>
          <p className="text-neutral-400 leading-relaxed text-lg">
            At Yoonis Tailor, we don't just make clothes; we engineer confidence. Located in the heart of Hargeisa, we have spent years mastering the intricate geometry of the human body. 
          </p>
          <p className="text-neutral-400 leading-relaxed text-lg">
            Whether you are preparing for your wedding day, upgrading your executive wardrobe, or seeking the perfect fit for your traditional garments, our atelier uses only the finest fabrics and uncompromising techniques to ensure your garments last a lifetime.
          </p>
          <div className="grid grid-cols-2 gap-6 pt-6 border-t border-white/5">
            <div>
              <p className="text-3xl font-black text-white mb-1">10+</p>
              <p className="text-xs text-neutral-500 font-bold uppercase tracking-wider">Years of Mastery</p>
            </div>
            <div>
              <p className="text-3xl font-black text-white mb-1">5k+</p>
              <p className="text-xs text-neutral-500 font-bold uppercase tracking-wider">Garments Crafted</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 4: SERVICES & PRICING CTAs */}
      <section id="services" className="py-24 px-6 border-y border-white/5 bg-neutral-950/60">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-5xl font-black text-white tracking-tight mb-4">Our Master Services</h2>
            <p className="text-neutral-400 max-w-2xl mx-auto text-lg">Select a service to inquire about bespoke pricing and book your private measurement session.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Service 1 */}
            <div className="bg-[#0a0a0a] border border-white/5 hover:border-amber-500/30 transition-all rounded-3xl p-8 group relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl" />
              <div>
                <img src="https://images.unsplash.com/photo-1593030103066-0093718efeb9?auto=format&fit=crop&q=80" alt="Bespoke Suits" className="w-full h-48 object-cover rounded-xl mb-6 opacity-80 group-hover:opacity-100 transition-opacity" />
                <h3 className="text-2xl font-black text-white mb-3">Bespoke Suits</h3>
                <p className="text-neutral-400 text-sm leading-relaxed mb-6">Hand-cut and fully canvassed suits crafted from premium imported wools. Perfect for executives and groomsmen.</p>
              </div>
              <button onClick={() => { setFormData({...formData, service: "Bespoke Suit"}); scrollToForm(); }} className="w-full py-3 rounded-xl bg-white/5 hover:bg-amber-600 hover:text-white text-white text-sm font-bold transition-all border border-white/10 active:scale-95">
                Inquire Pricing
              </button>
            </div>

            {/* Service 2 */}
            <div className="bg-[#0a0a0a] border border-white/5 hover:border-amber-500/30 transition-all rounded-3xl p-8 group relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl" />
              <div>
                <img src="https://images.unsplash.com/photo-1588143093282-358aa029f600?auto=format&fit=crop&q=80" alt="Traditional Wear" className="w-full h-48 object-cover rounded-xl mb-6 opacity-80 group-hover:opacity-100 transition-opacity" />
                <h3 className="text-2xl font-black text-white mb-3">Traditional Wear</h3>
                <p className="text-neutral-400 text-sm leading-relaxed mb-6">Culturally authentic garments tailored with modern precision. Exceptional fabrics and detailed embroidery.</p>
              </div>
              <button onClick={() => { setFormData({...formData, service: "Traditional Wear"}); scrollToForm(); }} className="w-full py-3 rounded-xl bg-white/5 hover:bg-amber-600 hover:text-white text-white text-sm font-bold transition-all border border-white/10 active:scale-95">
                Inquire Pricing
              </button>
            </div>

            {/* Service 3 */}
            <div className="bg-[#0a0a0a] border border-white/5 hover:border-amber-500/30 transition-all rounded-3xl p-8 group relative overflow-hidden flex flex-col justify-between">
              <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl" />
              <div>
                <img src="https://images.unsplash.com/photo-1605518216938-7c31b7b14ad0?auto=format&fit=crop&q=80" alt="Precision Alterations" className="w-full h-48 object-cover rounded-xl mb-6 opacity-80 group-hover:opacity-100 transition-opacity" />
                <h3 className="text-2xl font-black text-white mb-3">Precision Alterations</h3>
                <p className="text-neutral-400 text-sm leading-relaxed mb-6">Breathe new life into your existing wardrobe. Expert tapering, hemming, and structural adjustments for a perfect fit.</p>
              </div>
              <button onClick={() => { setFormData({...formData, service: "Alterations"}); scrollToForm(); }} className="w-full py-3 rounded-xl bg-white/5 hover:bg-amber-600 hover:text-white text-white text-sm font-bold transition-all border border-white/10 active:scale-95">
                Inquire Pricing
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 5: CLIENT REVIEWS */}
      <section id="reviews" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-black text-white tracking-tight">Worn by Leaders.</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { text: "Yoonis Tailor crafted my wedding suit. The attention to detail and the way the fabric draped perfectly to my body was unparalleled. The best in Hargeisa.", author: "Ahmed M.", role: "Groom" },
            { text: "I bring all my executive wear here for alterations. They understand exactly how a modern suit should taper. Truly professional service.", author: "Hassan A.", role: "Business Executive" },
            { text: "The traditional garments they made for our family event were stunning. The embroidery was flawless and the delivery was exactly on time.", author: "Jama Y.", role: "Long-time Client" }
          ].map((testimonial, i) => (
            <div key={i} className="p-8 rounded-3xl bg-neutral-900/40 border border-white/5 relative flex flex-col justify-between">
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, idx) => <Star key={idx} size={16} className="fill-amber-400 text-amber-400" />)}
              </div>
              <p className="text-neutral-300 text-base leading-relaxed mb-8 italic">"{testimonial.text}"</p>
              <div className="border-t border-white/5 pt-4">
                <p className="font-bold text-white text-sm">{testimonial.author}</p>
                <p className="text-[11px] uppercase tracking-wider font-bold text-amber-500 mt-1">{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 6: CONTACT & BOOKING FORM (Connected to DB) */}
      <section ref={formRef} className="py-24 px-6">
        <div className="max-w-6xl mx-auto rounded-[3rem] bg-gradient-to-br from-[#0a0a0a] to-[#111] border border-white/10 p-8 lg:p-16 shadow-2xl relative overflow-hidden flex flex-col lg:flex-row gap-12">
          
          {/* Contact Info Side */}
          <div className="flex-1 z-10">
            <h2 className="text-4xl font-black text-white mb-4 tracking-tight">Visit the Atelier.</h2>
            <p className="text-neutral-400 mb-10 text-lg">Drop us a message to secure your private measurement session, or call us directly during business hours.</p>
            
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-white/5 rounded-xl text-amber-400"><MapPin size={24} /></div>
                <div>
                  <h4 className="font-bold text-white mb-1">Our Location</h4>
                  <p className="text-sm text-neutral-400">Downtown Hargeisa, Somaliland</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-3 bg-white/5 rounded-xl text-amber-400"><Phone size={24} /></div>
                <div>
                  <h4 className="font-bold text-white mb-1">Direct Line / WhatsApp</h4>
                  <p className="text-sm text-neutral-400">+252 63 000 0000</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="p-3 bg-white/5 rounded-xl text-amber-400"><Clock size={24} /></div>
                <div>
                  <h4 className="font-bold text-white mb-1">Working Hours</h4>
                  <p className="text-sm text-neutral-400">Sat - Thu: 8:00 AM - 8:00 PM</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form Side */}
          <div className="flex-1 z-10 bg-black/40 p-8 rounded-3xl border border-white/5 backdrop-blur-md">
            <h3 className="text-2xl font-bold text-white mb-6">Request a Booking</h3>
            
            <AnimatePresence>
              {isSuccess && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-6 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-start gap-3">
                  <CheckCircle2 className="text-emerald-400 shrink-0 mt-0.5" size={18} />
                  <div>
                    <h4 className="font-bold text-emerald-400 text-sm">Request Sent Successfully</h4>
                    <p className="text-xs text-emerald-400/80 mt-1">Our team will contact you shortly to confirm your appointment time and provide pricing details.</p>
                  </div>
                </motion.div>
              )}
              {error && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 text-rose-400 text-sm rounded-xl">
                  {error}
                </motion.div>
              )}
            </AnimatePresence>

            <form onSubmit={handleBookAppointment} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Full Name</label>
                <input required type="text" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors" placeholder="e.g. Ahmed Ali" />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Phone Number</label>
                  <input required type="tel" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors" placeholder="+252..." />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Service</label>
                  <select required value={formData.service} onChange={e => setFormData({...formData, service: e.target.value})} className="w-full bg-[#1a1a1a] border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors cursor-pointer appearance-none">
                    <option value="Bespoke Suit">Bespoke Suit</option>
                    <option value="Traditional Wear">Traditional Wear</option>
                    <option value="Alterations">Alterations</option>
                    <option value="Other">Other Inquiry</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-neutral-400 uppercase tracking-widest">Additional Details</label>
                <textarea rows={3} value={formData.message} onChange={e => setFormData({...formData, message: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-amber-500 transition-colors resize-none" placeholder="Tell us about the occasion, preferred dates, or specific requirements..." />
              </div>

              <button disabled={isSubmitting} type="submit" className="w-full mt-4 bg-white hover:bg-amber-400 text-black font-bold uppercase tracking-widest py-4 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-70 active:scale-95">
                {isSubmitting ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                {isSubmitting ? "Sending Request..." : "Submit Inquiry"}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5 bg-[#020202] pt-16 pb-8 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2 font-black text-xl text-white tracking-tight uppercase">
            <Scissors size={20} className="text-amber-500" />
            Yoonis Tailor
          </div>
          
          <div className="flex gap-6 text-sm font-bold text-neutral-500 uppercase tracking-widest">
            <span className="cursor-pointer hover:text-white transition-colors">Instagram</span>
            <span className="cursor-pointer hover:text-white transition-colors">Facebook</span>
            <Link href="/auth" className="cursor-pointer hover:text-white transition-colors">Staff Login</Link>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto pt-8 mt-8 border-t border-white/5 text-center text-xs text-neutral-600 font-medium">
          <p>© {new Date().getFullYear()} Yoonis Tailor. All rights reserved. Designed for master craftsmanship.</p>
        </div>
      </footer>

    </div>
  );
}