"use client";

import React, { useState, useEffect } from "react";
import { motion, useScroll, useTransform, AnimatePresence, Variants } from "framer-motion";
import Link from "next/link";
import { 
  Scissors, Ruler, Crosshair, Star, ChevronRight, Play, 
  ArrowRight, ShieldCheck, CheckCircle2, Clock, MapPin, 
  Quote,  Menu, X 
} from "lucide-react";

// --- Shared Animation Variants (TypeScript Safe) ---
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 40 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] } 
  }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { staggerChildren: 0.15 } 
  }
};

export default function YoonisLandingPage() {
  const { scrollYProgress } = useScroll();
  const opacity = useTransform(scrollYProgress, [0, 0.05], [1, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="bg-[#030303] min-h-screen text-neutral-200 font-sans selection:bg-amber-500/30 selection:text-amber-200 overflow-hidden">
      
      {/* --- Ambient Background Effects --- */}
      <div className="fixed top-[-10%] left-[-10%] w-[500px] h-[500px] bg-amber-600/10 rounded-full blur-[150px] pointer-events-none mix-blend-screen z-0" />
      <div className="fixed bottom-[-10%] right-[-5%] w-[600px] h-[600px] bg-yellow-700/5 rounded-full blur-[150px] pointer-events-none mix-blend-screen z-0" />

      {/* --- 0. Navigation Bar --- */}
      <header className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${isScrolled ? "bg-black/60 backdrop-blur-2xl border-b border-white/5 py-3" : "bg-transparent py-6"}`}>
        <div className="max-w-7xl mx-auto px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-700 flex items-center justify-center text-white shadow-[0_0_20px_rgba(217,119,6,0.3)]">
              <Scissors size={20} />
            </div>
            <span className="text-xl font-black text-white tracking-tight uppercase">Yoonis</span>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-bold text-neutral-400">
            {["About", "Services", "Process", "Gallery", "Contact"].map((item) => (
              <a key={item} href={`#${item.toLowerCase()}`} className="hover:text-white transition-colors">{item}</a>
            ))}
          </nav>

          <div className="hidden md:flex items-center gap-4">
            <Link href="/auth" className="text-xs font-bold uppercase tracking-widest text-amber-500 hover:text-amber-400 transition-colors flex items-center gap-2">
              <ShieldCheck size={16} /> System Access
            </Link>
          </div>

          <button className="md:hidden text-white" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>
      </header>

      {/* --- 1. Hero Section --- */}
      <section className="relative min-h-screen flex items-center justify-center pt-20 overflow-hidden z-10">
        <motion.div style={{ scale }} className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-[#030303]/60 via-[#030303]/80 to-[#030303] z-10" />
          <img src="https://images.unsplash.com/photo-1593030761757-71fae46af504?auto=format&fit=crop&q=80" alt="Tailored Suit" className="w-full h-full object-cover object-top opacity-50 grayscale mix-blend-overlay" />
        </motion.div>

        <div className="max-w-7xl mx-auto px-6 relative z-20 flex flex-col items-center text-center">
          <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }} className="mb-6">
            <span className="px-4 py-1.5 rounded-full border border-amber-500/30 bg-amber-500/10 text-amber-400 text-[10px] font-black uppercase tracking-[0.3em]">
              Premium Tailoring in Hargeisa
            </span>
          </motion.div>
          <motion.h1 initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.2 }} className="text-6xl md:text-8xl font-black text-white tracking-tighter leading-[0.9] mb-6">
            THE PERFECT <br /> <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-500 to-amber-700">FIT.</span>
          </motion.h1>
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 1, delay: 0.4 }} className="max-w-xl text-neutral-400 text-lg md:text-xl font-medium mb-10">
            High-quality custom clothing made just for you. We focus on great details and a perfect fit to make sure you look your absolute best.
          </motion.p>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1, delay: 0.6 }} className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
            <Link href="#gallery" className="w-full sm:w-auto px-8 py-4 rounded-xl bg-white text-black font-black text-sm uppercase tracking-wide hover:bg-neutral-200 transition-colors shadow-[0_0_40px_rgba(255,255,255,0.2)]">
              View Our Work
            </Link>
            <Link href="/auth" className="w-full sm:w-auto px-8 py-4 rounded-xl bg-amber-600/10 border border-amber-500/30 text-amber-500 font-black text-sm uppercase tracking-wide hover:bg-amber-500/20 transition-all flex items-center justify-center gap-2">
              <ShieldCheck size={18} /> Client Login
            </Link>
          </motion.div>
        </div>

        <motion.div style={{ opacity }} className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-neutral-600">
          <span className="text-[9px] uppercase tracking-widest font-bold">Scroll Down</span>
          <div className="w-[1px] h-12 bg-gradient-to-b from-neutral-600 to-transparent" />
        </motion.div>
      </section>

      {/* --- 2. Heritage / About Section --- */}
      <section id="about" className="py-32 relative z-10 border-t border-white/5 bg-[#050505]">
        <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true, margin: "-100px" }} variants={fadeUp} className="space-y-6">
            <h2 className="text-4xl md:text-5xl font-black text-white tracking-tight">A DECADE OF <br/><span className="text-amber-500">QUALITY.</span></h2>
            <p className="text-neutral-400 text-lg leading-relaxed">
              Based right here in Hargeisa, Yoonis Tailor brings you the finest custom clothing in the region. For over ten years, we have combined classic tailoring skills with modern styles to give our clients clothes that fit perfectly and last a long time.
            </p>
            <div className="flex items-center gap-8 pt-4">
              <div>
                <p className="text-3xl font-black text-white">10+</p>
                <p className="text-xs text-amber-500 uppercase tracking-wider font-bold">Years in Business</p>
              </div>
              <div className="w-[1px] h-12 bg-white/10" />
              <div>
                <p className="text-3xl font-black text-white">5K+</p>
                <p className="text-xs text-amber-500 uppercase tracking-wider font-bold">Happy Clients</p>
              </div>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, x: 50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 1 }} className="relative aspect-square md:aspect-[4/5] rounded-3xl overflow-hidden border border-white/10 group">
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
            <img src="https://images.unsplash.com/photo-1594938298603-c8148c4dae35?auto=format&fit=crop&q=80" alt="Tailor working on a suit" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000 ease-out" />
            <div className="absolute bottom-8 left-8 z-20 flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-amber-500 flex items-center justify-center text-black">
                <Play size={20} className="ml-1" />
              </div>
              <span className="text-sm font-bold text-white uppercase tracking-widest">See How We Work</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* --- 3. Services Section --- */}
      <section id="services" className="py-32 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-20">
            <h2 className="text-4xl font-black text-white uppercase tracking-tight">Our <span className="text-amber-500">Services</span></h2>
            <p className="text-neutral-500 mt-4 max-w-2xl mx-auto">Everything you need to build a wardrobe that looks great and feels comfortable.</p>
          </motion.div>

          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer} className="grid md:grid-cols-3 gap-6">
            {[
              { title: "Full Custom Suits", icon: Scissors, desc: "A suit made completely from scratch, based on your exact body measurements and style choices." },
              { title: "Tailored Fit", icon: Ruler, desc: "We take our standard sizes and adjust them carefully so they fit your body perfectly." },
              { title: "Expert Alterations", icon: Crosshair, desc: "Bring in your own clothes, and we will adjust the fit so they look and feel brand new." }
            ].map((srv, i) => (
              <motion.div key={i} variants={fadeUp} className="bg-white/[0.02] border border-white/5 hover:border-amber-500/30 p-8 rounded-3xl group transition-colors">
                <div className="w-14 h-14 rounded-2xl bg-black border border-white/10 flex items-center justify-center text-amber-500 mb-6 group-hover:scale-110 group-hover:bg-amber-500 group-hover:text-black transition-all">
                  <srv.icon size={24} />
                </div>
                <h3 className="text-xl font-black text-white mb-3">{srv.title}</h3>
                <p className="text-neutral-400 text-sm leading-relaxed mb-6">{srv.desc}</p>
                <button className="text-xs font-bold text-amber-500 uppercase tracking-widest flex items-center gap-2 group/btn">
                  Learn More <ArrowRight size={14} className="group-hover/btn:translate-x-2 transition-transform" />
                </button>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* --- 4. The Process Section --- */}
      <section id="process" className="py-32 bg-[#050505] relative z-10 border-y border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16">
            <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
              <h2 className="text-4xl font-black text-white uppercase tracking-tight mb-6">How We <br/><span className="text-amber-500">Work</span></h2>
              <p className="text-neutral-400 mb-12">From picking the fabric to the final delivery, we make sure every step is done right so you get exactly what you want.</p>
              
              <div className="space-y-8">
                {[
                  { step: "01", title: "Design & Fabric Choice", desc: "We sit down to discuss what you need, look at fabrics, and decide on the style of your suit." },
                  { step: "02", title: "Taking Measurements", desc: "We take detailed measurements to make sure the clothing will fit your body type perfectly." },
                  { step: "03", title: "First Fitting", desc: "You try on the unfinished suit so we can check the fit and make any needed adjustments." },
                  { step: "04", title: "Final Delivery", desc: "You pick up your finished clothes, ready to wear, with every detail checked for quality." }
                ].map((item, i) => (
                  <div key={i} className="flex gap-6 group">
                    <div className="flex flex-col items-center">
                      <div className="text-sm font-black text-amber-500 bg-amber-500/10 px-3 py-1 rounded-lg border border-amber-500/20 group-hover:bg-amber-500 group-hover:text-black transition-colors">{item.step}</div>
                      {i !== 3 && <div className="w-[1px] h-full bg-white/10 mt-4 group-hover:bg-amber-500/50 transition-colors" />}
                    </div>
                    <div className="pb-8">
                      <h4 className="text-lg font-black text-white mb-2">{item.title}</h4>
                      <p className="text-sm text-neutral-400">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
            
            <div className="relative rounded-3xl overflow-hidden border border-white/10 h-full min-h-[500px]">
              <img src="https://images.unsplash.com/photo-1578932750294-f5075e85f44a?auto=format&fit=crop&q=80" alt="Tailoring Process" className="w-full h-full object-cover grayscale opacity-60" />
              <div className="absolute inset-0 bg-amber-900/20 mix-blend-color" />
            </div>
          </div>
        </div>
      </section>

      {/* --- 5. Lookbook / Collection Section --- */}
      <section id="gallery" className="py-32 relative z-10">
        <div className="max-w-[1400px] mx-auto px-6">
          <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="flex justify-between items-end mb-16">
            <div>
              <h2 className="text-4xl font-black text-white uppercase tracking-tight">Our <span className="text-amber-500">Gallery</span></h2>
              <p className="text-neutral-500 mt-2">Take a look at some of the custom clothing we have made for our clients.</p>
            </div>
            <button className="hidden md:flex text-xs font-bold text-white uppercase tracking-widest items-center gap-2 hover:text-amber-500 transition-colors">
              View Full Gallery <ArrowRight size={14} />
            </button>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[
              "https://images.unsplash.com/photo-1594938328870-9623159c8c99?auto=format&fit=crop&q=80",
              "https://images.unsplash.com/photo-1598808503746-f34c53b9323e?auto=format&fit=crop&q=80",
              "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80",
            ].map((img, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="group relative aspect-[3/4] overflow-hidden rounded-2xl cursor-pointer">
                <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors z-10" />
                <img src={img} alt={`Custom Suit Example ${i}`} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                <div className="absolute bottom-0 inset-x-0 p-6 bg-gradient-to-t from-black via-black/60 to-transparent z-20 translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all">
                  <p className="text-white font-black text-lg">Custom Order #{104 + i}</p>
                  <p className="text-amber-500 text-xs font-bold uppercase tracking-widest">Premium Fabric</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- 6. Materials & Fabrics --- */}
      <section className="py-24 bg-amber-900/10 border-y border-amber-500/10 relative z-10 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <motion.div initial={{ opacity: 0, x: -50 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }}>
              <h2 className="text-3xl font-black text-white uppercase tracking-tight mb-4">High Quality <br/><span className="text-amber-500">Fabrics</span></h2>
              <p className="text-neutral-400 text-sm leading-relaxed">
                A great suit starts with great material. We bring in the best fabrics that look good and are comfortable to wear in our climate. Whether you need a lightweight cotton blend for the heat or premium wool for special events, we have plenty of options for you to choose from.
              </p>
            </motion.div>
            <div className="grid grid-cols-2 gap-4">
              {['Premium Wool', 'Lightweight Cotton', 'Classic Linen', 'Custom Blends'].map((mill, i) => (
                <div key={i} className="bg-black/40 backdrop-blur-md border border-white/5 p-6 rounded-2xl flex items-center justify-center text-center hover:border-amber-500/30 transition-colors">
                  <span className="text-sm font-bold text-neutral-300 tracking-widest uppercase">{mill}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* --- 7. Metrics / Numbers --- */}
      <section className="py-20 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { num: "30+", label: "Body Measurements taken" },
              { num: "50h", label: "Work Hours per Suit" },
              { num: "100%", label: "Satisfaction Guarantee" },
              { num: "15+", label: "Expert Staff" }
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <p className="text-4xl md:text-5xl font-black text-white mb-2">{stat.num}</p>
                <p className="text-[10px] uppercase tracking-widest text-amber-500 font-bold">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- 8. Testimonials --- */}
      <section className="py-32 bg-[#050505] relative z-10 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <Quote className="text-amber-500/20 w-24 h-24 mx-auto mb-6" />
          <motion.h2 initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-3xl font-black text-white uppercase tracking-tight mb-16">What Our <span className="text-amber-500">Clients Say</span></motion.h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {[
              { name: "Ahmed Ali", role: "Business Owner", text: "The fit is amazing. Yoonis really knows how to make a great suit. I won't go anywhere else in Hargeisa to get my clothes made." },
              { name: "Jama Hassan", role: "Regular Client", text: "Best tailor in town. The quality is outstanding and they pay attention to exactly what I want. Highly recommended." },
              { name: "Mohamed Farah", role: "Groom", text: "I got my wedding suit made here and it was perfect. The team was very professional and delivered on time." }
            ].map((t, i) => (
              <motion.div key={i} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="bg-white/[0.02] border border-white/5 p-8 rounded-3xl text-left">
                <div className="flex text-amber-500 mb-4">
                  {[...Array(5)].map((_, idx) => <Star key={idx} size={14} fill="currentColor" />)}
                </div>
                <p className="text-neutral-300 text-sm italic mb-6 leading-relaxed">&quot;{t.text}&quot;</p>
                <div>
                  <p className="text-white font-bold">{t.name}</p>
                  <p className="text-[10px] text-amber-500 uppercase tracking-wider">{t.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* --- 9. Team / Artisans --- */}
      <section className="py-32 relative z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-white uppercase tracking-tight">Our <span className="text-amber-500">Team</span></h2>
            <p className="text-neutral-500 mt-2">The hard-working people behind the business.</p>
          </div>
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {[
              { name: "Hassan Yoonis", role: "Head Tailor & Founder", img: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80" },
              { name: "Omar Abdi", role: "Master Tailor", img: "https://images.unsplash.com/photo-1531891437562-4301cf35b7e4?auto=format&fit=crop&q=80" }
            ].map((master, i) => (
              <div key={i} className="group relative overflow-hidden rounded-3xl border border-white/10 aspect-square">
                <img src={master.img} alt={master.name} className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
                <div className="absolute bottom-6 left-6">
                  <p className="text-2xl font-black text-white">{master.name}</p>
                  <p className="text-xs text-amber-500 uppercase tracking-widest font-bold">{master.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- 10. Pricing & Tiers --- */}
      <section className="py-32 bg-[#050505] relative z-10 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-white uppercase tracking-tight">Our <span className="text-amber-500">Pricing</span></h2>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* MTM Tier */}
            <div className="bg-white/[0.02] border border-white/5 p-10 rounded-3xl">
              <h3 className="text-xl font-black text-white uppercase tracking-wider mb-2">Tailored Fit</h3>
              <p className="text-neutral-400 text-sm mb-6">Standard sizes adjusted to fit your exact measurements.</p>
              <div className="text-3xl font-black text-white mb-8">From $120</div>
              <ul className="space-y-4 mb-10 text-sm text-neutral-300">
                <li className="flex items-center gap-3"><CheckCircle2 size={16} className="text-amber-500" /> Professional Measurements</li>
                <li className="flex items-center gap-3"><CheckCircle2 size={16} className="text-amber-500" /> High Quality Stitching</li>
                <li className="flex items-center gap-3"><CheckCircle2 size={16} className="text-amber-500" /> Faster Delivery</li>
              </ul>
              <button className="w-full py-4 rounded-xl border border-white/10 text-white font-bold hover:bg-white/5 transition-colors">Ask About Pricing</button>
            </div>
            
            {/* Bespoke Tier */}
            <div className="bg-gradient-to-b from-amber-900/20 to-black border border-amber-500/30 p-10 rounded-3xl relative overflow-hidden shadow-[0_0_50px_rgba(217,119,6,0.1)]">
              <div className="absolute top-0 right-0 bg-amber-500 text-black text-[10px] font-black uppercase tracking-widest px-4 py-1 rounded-bl-xl">Popular</div>
              <h3 className="text-xl font-black text-white uppercase tracking-wider mb-2">Full Custom</h3>
              <p className="text-neutral-400 text-sm mb-6">A suit made completely from scratch just for you.</p>
              <div className="text-3xl font-black text-amber-500 mb-8">From $280</div>
              <ul className="space-y-4 mb-10 text-sm text-neutral-300">
                <li className="flex items-center gap-3"><CheckCircle2 size={16} className="text-amber-500" /> Full Body Measurements</li>
                <li className="flex items-center gap-3"><CheckCircle2 size={16} className="text-amber-500" /> Hand-Finished Details</li>
                <li className="flex items-center gap-3"><CheckCircle2 size={16} className="text-amber-500" /> Fitting Sessions Included</li>
                <li className="flex items-center gap-3"><CheckCircle2 size={16} className="text-amber-500" /> Many Fabric Choices</li>
              </ul>
              <button className="w-full py-4 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold shadow-lg shadow-amber-600/20 transition-all">Book an Appointment</button>
            </div>
          </div>
        </div>
      </section>

      {/* --- 11. FAQ --- */}
      <section className="py-32 relative z-10">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-black text-white uppercase tracking-tight">Common <span className="text-amber-500">Questions</span></h2>
          </div>
          <div className="space-y-4">
            {[
              { q: "How long does it take to make a custom suit?", a: "For your first custom suit, it usually takes about 3 to 4 weeks. This gives us time to get your measurements right and do a fitting. After your first order, it is usually much faster." },
              { q: "Do I need to make an appointment?", a: "Yes, it is best to call ahead or book an appointment. This way, we have enough time to focus completely on you and take good measurements." },
              { q: "Can you copy a suit I already own?", a: "We can definitely look at your current suit to see what style you like, but we will still take fresh measurements to make sure the new one fits you even better." }
            ].map((faq, i) => (
              <div key={i} className="bg-white/[0.02] border border-white/5 p-6 rounded-2xl">
                <h4 className="text-white font-bold mb-2 flex items-center justify-between">
                  {faq.q} <ChevronRight size={16} className="text-amber-500" />
                </h4>
                <p className="text-neutral-400 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- 12. Footer & Final CTA --- */}
      <footer id="contact" className="relative z-10 border-t border-white/10 bg-black pt-32 pb-10 overflow-hidden">
        {/* Giant Background Text */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full text-center pointer-events-none opacity-5">
          <h1 className="text-[15vw] font-black text-white tracking-tighter leading-none">YOONIS</h1>
        </div>

        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="grid md:grid-cols-2 gap-16 mb-24">
            <div>
              <h2 className="text-5xl font-black text-white uppercase tracking-tight mb-6">Ready For Your <br/><span className="text-amber-500">New Suit?</span></h2>
              <p className="text-neutral-400 max-w-md mb-8">Contact us today to schedule your fitting and get started on your custom clothing.</p>
              
              {/* Core Authentication / Login Link as requested */}
              <Link href="/auth" className="inline-flex items-center gap-3 bg-white text-black px-8 py-4 rounded-xl text-sm font-black uppercase tracking-widest hover:bg-neutral-200 transition-colors shadow-[0_0_30px_rgba(255,255,255,0.15)] group">
                Access System Portal
                <ShieldCheck size={18} className="group-hover:text-amber-600 transition-colors" />
              </Link>
            </div>
            
            <div className="grid grid-cols-2 gap-8 text-sm">
              <div className="space-y-4">
                <h4 className="text-white font-bold uppercase tracking-widest mb-4">Our Shop</h4>
                <p className="text-neutral-400 flex items-start gap-2"><MapPin size={16} className="text-amber-500 shrink-0 mt-0.5" /> Downtown Hargeisa, Somalia</p>
                <p className="text-neutral-400 flex items-center gap-2"><Clock size={16} className="text-amber-500" /> Saturday - Thursday, 8AM - 8PM</p>
              </div>
              <div className="space-y-4">
                <h4 className="text-white font-bold uppercase tracking-widest mb-4">Contact Us</h4>
                <p className="text-neutral-400">info@yoonistailor.com</p>
                <p className="text-neutral-400">+252 63 XXXXXXX</p>
                <div className="flex gap-4 pt-2">
                
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-bold text-neutral-600 uppercase tracking-widest">
            <p>&copy; {new Date().getFullYear()} Yoonis Tailor. All Rights Reserved.</p>
            <div className="flex gap-6">
              <Link href="/privacy" className="hover:text-neutral-300 transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-neutral-300 transition-colors">Terms of Service</Link>
              <Link href="/auth" className="hover:text-amber-500 transition-colors flex items-center gap-1">
                 <ShieldCheck size={12}/> Staff Login
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}