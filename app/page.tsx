import { Metadata } from "next";
import * as motion from "framer-motion/client";
import type { Variants } from "framer-motion";
import { 
  ArrowRight, Sparkles, Zap, Shield, Globe, 
  ChevronRight, CheckCircle2, Play, Layers, 
  Cpu, Code, MessageCircle, DollarSign, Activity,
  Smartphone, Eye, Star, HelpCircle, ArrowUpRight
} from "lucide-react";
import Link from "next/link";

// ==========================================
// 1. SEO METADATA
// ==========================================
export const metadata: Metadata = {
  title: "TailorOS | The Future of Tailoring Management",
  description: "Automate your tailoring business, manage measurements, and track production all in one modern platform.",
  keywords: ["tailor software", "tailoring POS", "garment management", "SaaS"],
  openGraph: {
    title: "TailorOS | Modern Tailor Management",
    description: "The complete OS for modern tailors.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TailorOS | Modern Tailor Management",
  }
};

// ==========================================
// 2. EXPLICITLY TYPED ANIMATION VARIANTS
// ==========================================
const fadeUp: Variants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 0.6, ease: "easeOut" } 
  }
};

const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

export default function PublicLandingPage() {
  return (
    <div className="min-h-screen bg-[#050505] text-neutral-200 font-sans selection:bg-indigo-500/30 overflow-hidden antialiased">
      
      {/* SECTION 1: STICKY NAVIGATION BAR */}
      <nav className="fixed top-0 w-full z-50 bg-[#050505]/80 backdrop-blur-md border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl text-white tracking-tight">
            <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white shadow-md shadow-indigo-600/20">
              <Sparkles size={16} />
            </div>
            TailorOS
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-neutral-400">
            <Link href="#features" className="hover:text-white transition-colors">Features</Link>
            <Link href="#how-it-works" className="hover:text-white transition-colors">Workflow</Link>
            <Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link>
            <Link href="#faq" className="hover:text-white transition-colors">FAQ</Link>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/auth" className="text-sm font-medium text-neutral-400 hover:text-white transition-colors">Log in</Link>
            <Link href="/auth" className="text-sm font-medium bg-white text-black px-4 py-2 rounded-full hover:bg-neutral-200 transition-colors shadow-sm">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* SECTION 2: HERO COMPONENT (Modern Glowing Layout) */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-6 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-indigo-600/10 rounded-full blur-[130px] pointer-events-none" />
        
        <motion.div 
          initial="hidden" 
          animate="visible" 
          variants={staggerContainer}
          className="max-w-5xl mx-auto text-center relative z-10"
        >
          <motion.div variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs font-medium text-indigo-400 mb-8 backdrop-blur-sm">
            <Sparkles size={14} /> Introducing Next-Gen TailorOS
          </motion.div>
          <motion.h1 variants={fadeUp} className="text-5xl lg:text-7xl font-black tracking-tight text-white mb-6 leading-tight">
            The premium architecture for <br className="hidden lg:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-cyan-400">
              bespoke fashion houses.
            </span>
          </motion.h1>
          <motion.p variants={fadeUp} className="text-lg lg:text-xl text-neutral-400 max-w-2xl mx-auto mb-10 leading-relaxed">
            Automate body metrics tracking, govern advanced multi-item design pipelines, and synchronize transactions flawlessly within an ultra-modern workspace.
          </motion.p>
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-full font-medium transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 active:scale-95">
              Start free trial <ArrowRight size={18} />
            </button>
            <button className="w-full sm:w-auto px-8 py-4 bg-white/5 hover:bg-white/10 text-white border border-white/10 rounded-full font-medium transition-all flex items-center justify-center gap-2 active:scale-95">
              <Play size={18} /> Watch Technical Review
            </button>
          </motion.div>
        </motion.div>
      </section>

      {/* SECTION 3: SOCIAL PROOF / TRUSTED BRANDS */}
      <section className="py-10 border-y border-white/5 bg-white/[0.01]">
        <div className="max-w-7xl mx-auto px-6 text-center">
          <p className="text-xs text-neutral-500 font-bold uppercase tracking-widest mb-6">Trusted by elite worldwide tailoring institutions</p>
          <div className="flex flex-wrap justify-center items-center gap-12 lg:gap-24 opacity-40 text-lg font-serif italic text-white tracking-wider">
            <span>Savile Row Atelier</span>
            <span>Milano Sartorial</span>
            <span>L'Atelier Haute Couture</span>
            <span>Tokyo Stitch Guild</span>
          </div>
        </div>
      </section>

      {/* SECTION 4: BENTO GRID VALUE PROPOSITION */}
      <section id="features" className="py-24 px-6 max-w-7xl mx-auto">
        <motion.div initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="text-center mb-16">
          <h2 className="text-3xl lg:text-5xl font-extrabold text-white mb-4 tracking-tight">Engineered for absolute accuracy.</h2>
          <p className="text-neutral-400 max-w-2xl mx-auto">A unified suite eliminating management fragmentation from modern high-end tailoring spaces.</p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[280px]">
          {/* Card 1 Large */}
          <div className="md:col-span-2 bg-gradient-to-br from-neutral-900 to-neutral-950 border border-white/5 rounded-3xl p-8 relative overflow-hidden group hover:border-indigo-500/20 transition-all">
            <div className="relative z-10 max-w-md">
              <Layers className="text-indigo-400 mb-4" size={32} />
              <h3 className="text-2xl font-bold text-white mb-2">Live Production Pipeline</h3>
              <p className="text-neutral-400 text-sm leading-relaxed">Map sub-collection structures from raw cutting matrices up to ready-for-delivery states on an interactive whiteboard wrapper.</p>
            </div>
            <div className="absolute right-0 bottom-0 w-2/3 h-2/3 bg-indigo-500/5 blur-3xl rounded-full" />
          </div>
          
          {/* Card 2 */}
          <div className="bg-gradient-to-br from-neutral-900 to-neutral-950 border border-white/5 rounded-3xl p-8 hover:border-emerald-500/20 transition-all">
            <Shield className="text-emerald-400 mb-4" size={32} />
            <h3 className="text-xl font-bold text-white mb-2">Metrics Security</h3>
            <p className="text-neutral-400 text-sm leading-relaxed">Customer measurement parameters remain fully encrypted, isolated, and historized across chronological updates.</p>
          </div>

          {/* Card 3 */}
          <div className="bg-gradient-to-br from-neutral-900 to-neutral-950 border border-white/5 rounded-3xl p-8 hover:border-cyan-400/20 transition-all">
            <Globe className="text-cyan-400 mb-4" size={32} />
            <h3 className="text-xl font-bold text-white mb-2">Omnichannel Links</h3>
            <p className="text-neutral-400 text-sm leading-relaxed">Provision safe, dedicated read-only operational checking access endpoints directly to buyers.</p>
          </div>

          {/* Card 4 Large */}
          <div className="md:col-span-2 bg-gradient-to-br from-neutral-900 to-neutral-950 border border-white/5 rounded-3xl p-8 relative overflow-hidden group hover:border-amber-500/20 transition-all">
            <div className="relative z-10 max-w-md">
              <Zap className="text-amber-400 mb-4" size={32} />
              <h3 className="text-2xl font-bold text-white mb-2">Automated Pings Engine</h3>
              <p className="text-neutral-400 text-sm leading-relaxed">Instantly translate order state movements into live formatted parameter messages dispatched smoothly to external client numbers.</p>
            </div>
            <div className="absolute right-0 bottom-0 w-2/3 h-2/3 bg-amber-500/5 blur-3xl rounded-full" />
          </div>
        </div>
      </section>

      {/* SECTION 5: METRIC KEY PERFORMANCE INDEXING */}
      <section className="py-20 px-6 border-y border-white/5 bg-neutral-950/60">
        <div className="max-w-7xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: "14,000+", label: "Active Masters" },
            { value: "8.2M", label: "Garments Delivered" },
            { value: "99.99%", label: "API Cluster Uptime" },
            { value: "18 hrs", label: "Average Weekly Saving" }
          ].map((stat, i) => (
            <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}>
              <div className="text-4xl lg:text-5xl font-black text-white mb-1 tracking-tight">{stat.value}</div>
              <div className="text-xs text-neutral-500 font-bold uppercase tracking-wider">{stat.label}</div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* SECTION 6: THE ARTISANAL PRODUCT MISSION */}
      <section className="py-24 px-6 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
        <div className="flex-1 space-y-6">
          <div className="text-xs font-bold text-indigo-400 uppercase tracking-widest">Architectural Foundations</div>
          <h2 className="text-3xl lg:text-5xl font-bold text-white tracking-tight">Honoring classical craftsmanship via absolute programmatic clarity.</h2>
          <p className="text-neutral-400 leading-relaxed">
            Tailoring is an organic art of dynamic margins, yet maintaining production workflows shouldn't be an erratic guessing game. Our structural system frames intricate relational constraints beautifully, granting administrators effortless governance of daily performance variables.
          </p>
        </div>
        <div className="flex-1 w-full relative">
          <div className="aspect-video rounded-3xl bg-gradient-to-tr from-indigo-500/10 via-neutral-900 to-purple-500/5 border border-white/10 p-8 flex flex-col justify-between backdrop-blur-sm relative overflow-hidden group">
            <div className="flex justify-between items-start">
              <Code className="text-indigo-400" size={28} />
              <span className="text-[10px] font-mono text-neutral-500 bg-black/40 px-2 py-1 rounded">Schema Secure</span>
            </div>
            <div className="space-y-2">
              <div className="h-2 w-2/3 bg-neutral-800 rounded" />
              <div className="h-2 w-1/2 bg-neutral-800 rounded" />
              <div className="h-2 w-3/4 bg-indigo-500/30 rounded" />
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 7: CORE PRODUCTION WORKFLOW PIPELINE */}
      <section id="how-it-works" className="py-24 px-6 max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white tracking-tight">The Operational Loop Blueprint</h2>
          <p className="text-sm text-neutral-400 mt-2">How data maps natively from client interaction to final invoice execution.</p>
        </div>
        <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-white/5 before:to-transparent">
          {[
            { step: "01", title: "Metric Capture & Encryption", desc: "Isolate individual shoulder slope, wrist, chest, and anatomical measurements straight into safe structural entries.", icon: Smartphone },
            { step: "02", title: "Relational Assignment Engine", desc: "Link targeted textile inventories, specified styling blueprints, and processing personnel to the unique order pointer.", icon: Cpu },
            { step: "03", title: "Asynchronous Pipeline Governance", desc: "Track tasks seamlessly across localized visual segments: cutting, tailoring assembly, structural fittings, and ready queues.", icon: Layers },
            { step: "04", title: "Instant Notification & Receipting", desc: "Compile polished financial summary balance sheets and fire automated pick-up messages instantly.", icon: CheckCircle2 }
          ].map((item, i) => (
            <motion.div key={i} initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
              <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white/10 bg-neutral-900 text-indigo-400 font-bold shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-xl z-10 text-xs">
                {item.step}
              </div>
              <div className="w-[calc(100%-3.5rem)] md:w-[calc(50%-2.5rem)] p-6 rounded-2xl bg-white/[0.01] border border-white/5 hover:border-indigo-500/20 transition-all flex gap-4">
                <div className="p-2 h-fit rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-400 group-hover:text-indigo-400 transition-colors">
                  <item.icon size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-white mb-1 text-sm">{item.title}</h3>
                  <p className="text-xs text-neutral-400 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* SECTION 8: ECOSYSTEM MATRIX INTEGRATIONS */}
      <section className="py-24 px-6 border-y border-white/5 bg-neutral-950/40 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-3xl font-bold text-white tracking-tight">Interoperable Protocol Bindings</h2>
          <p className="text-xs text-neutral-400 mt-2 mb-12">Synchronize status changes gracefully with modern standard platform hooks.</p>
          <div className="flex flex-wrap justify-center items-center gap-4">
            {['Stripe Financials', 'Native WhatsApp Webhook', 'QuickBooks Cloud', 'Twilio Messaging APIs', 'Shopify Inventory Engine'].map((integration, i) => (
              <div key={i} className="px-5 py-3 rounded-xl bg-neutral-900/60 border border-white/5 text-neutral-300 font-mono text-xs hover:border-neutral-700 hover:text-white transition-all cursor-default">
                {integration}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SECTION 9: EXECUTIVE CUSTOMER REVIEWS */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold text-white tracking-tight">Validated by Studio Directors</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { text: "The index management capabilities freed up hours of manual verification work. It is exceptionally resilient.", author: "Edward Vance", role: "Sartorial Director" },
            { text: "Handling multi-item orders with discrete tracking status targets solved our tracking gaps overnight.", author: "Clara Rossi", role: "Milan Outerwear" },
            { text: "Outstanding operational metrics. The localized scanning capabilities reduced physical checkout delays to zero.", author: "Kenji Sato", role: "Tokyo Bespoke Guild" }
          ].map((testimonial, i) => (
            <div key={i} className="p-8 rounded-2xl bg-neutral-900/40 border border-white/5 relative flex flex-col justify-between">
              <div className="flex gap-1 mb-4">
                {[...Array(5)].map((_, idx) => <Star key={idx} size={14} className="fill-amber-400 text-amber-400" />)}
              </div>
              <p className="text-neutral-300 text-sm leading-relaxed mb-6">"{testimonial.text}"</p>
              <div className="border-t border-white/5 pt-4">
                <p className="font-bold text-white text-xs">{testimonial.author}</p>
                <p className="text-[11px] text-neutral-500">{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 10: TIERED SUBSCRIPTION PACKAGES */}
      <section id="pricing" className="py-24 px-6 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-5xl font-black text-white tracking-tight mb-3">Transparent Scaling Models</h2>
          <p className="text-sm text-neutral-400">Zero hidden deployment surcharges. Unlocked framework feature updates standard.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto items-center">
          
          {/* Tier 1 */}
          <div className="p-8 rounded-3xl bg-neutral-900/40 border border-white/5">
            <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-wider mb-1">Starter Core</h3>
            <div className="mb-6 flex items-baseline gap-1">
              <span className="text-4xl font-black text-white">$29</span>
              <span className="text-xs text-neutral-500 font-mono">/mo</span>
            </div>
            <ul className="space-y-3 mb-8 text-neutral-400 text-xs border-t border-white/5 pt-4">
              <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-indigo-400"/> Max 100 Active Pointers</li>
              <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-indigo-400"/> Baseline Metric Indices</li>
              <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-indigo-400"/> Secure Asynchronous Tables</li>
            </ul>
            <button className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold transition-all border border-white/10 active:scale-95">Deploy Basic</button>
          </div>

          {/* Tier 2 Pro */}
          <div className="p-8 rounded-3xl bg-gradient-to-b from-indigo-950 via-indigo-900/60 to-neutral-950 border border-indigo-500 relative shadow-2xl shadow-indigo-500/10">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-indigo-600 text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-md">Production Standard</div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1">Professional Suite</h3>
            <div className="mb-6 flex items-baseline gap-1">
              <span className="text-4xl font-black text-white">$79</span>
              <span className="text-xs text-indigo-300 font-mono">/mo</span>
            </div>
            <ul className="space-y-3 mb-8 text-indigo-200/80 text-xs border-t border-indigo-500/20 pt-4">
              <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-white"/> Infinite Relational Matrix</li>
              <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-white"/> Live Production Visual Board</li>
              <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-white"/> Automated Webhook Dispatch</li>
              <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-white"/> Financial Balance Sheets Engine</li>
            </ul>
            <button className="w-full py-3 rounded-xl bg-white text-indigo-950 text-xs font-bold hover:bg-neutral-200 transition-all shadow-md active:scale-95">Initiate 14-Day Cycle</button>
          </div>

          {/* Tier 3 */}
          <div className="p-8 rounded-3xl bg-neutral-900/40 border border-white/5">
            <h3 className="text-sm font-bold text-neutral-400 uppercase tracking-wider mb-1">Enterprise Link</h3>
            <div className="mb-6 flex items-baseline gap-1">
              <span className="text-3xl font-black text-white">Custom</span>
            </div>
            <ul className="space-y-3 mb-8 text-neutral-400 text-xs border-t border-white/5 pt-4">
              <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-neutral-600"/> Multi-Store Node Routing</li>
              <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-neutral-600"/> Dedicated Sandbox Testing</li>
              <li className="flex items-center gap-2"><CheckCircle2 size={14} className="text-neutral-600"/> Custom SLA Parameters</li>
            </ul>
            <button className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-semibold transition-all border border-white/10 active:scale-95">Query Architecture</button>
          </div>
        </div>
      </section>

      {/* SECTION 11: SYSTEM ARCHITECT MATRIX POOLS */}
      <section className="py-24 px-6 border-y border-white/5 bg-neutral-950/20 text-center">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-white tracking-tight mb-12">Product Operations Core</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            <div>
              <div className="w-12 h-12 rounded-xl bg-neutral-900 border border-neutral-800 mx-auto mb-4 flex items-center justify-center text-indigo-400"><Cpu size={20}/></div>
              <h4 className="font-bold text-white text-sm">Cluster Management</h4>
              <p className="text-xs text-neutral-500 mt-1">High-Throughput Node Delivery</p>
            </div>
            <div>
              <div className="w-12 h-12 rounded-xl bg-neutral-900 border border-neutral-800 mx-auto mb-4 flex items-center justify-center text-cyan-400"><Activity size={20}/></div>
              <h4 className="font-bold text-white text-sm">Telemetry Pipeline</h4>
              <p className="text-xs text-neutral-500 mt-1">Real-Time State Validation</p>
            </div>
            <div>
              <div className="w-12 h-12 rounded-xl bg-neutral-900 border border-neutral-800 mx-auto mb-4 flex items-center justify-center text-emerald-400"><DollarSign size={20}/></div>
              <h4 className="font-bold text-white text-sm">Ledger Clearing</h4>
              <p className="text-xs text-neutral-500 mt-1">Immutable Balance Assertions</p>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION 12: CORE USER INQUIRY MATRIX (FAQ) */}
      <section id="faq" className="py-24 px-6 max-w-3xl mx-auto">
        <div className="flex items-center gap-2 justify-center text-indigo-400 text-xs font-bold tracking-widest uppercase mb-3">
          <HelpCircle size={14} /> Knowledge Repository
        </div>
        <h2 className="text-3xl font-bold text-white tracking-tight mb-10 text-center">Frequently Answered Protocols</h2>
        <div className="space-y-4">
          {[
            { q: "Is prior inventory knowledge required to deploy?", a: "No. The system loads standard operational templates out of the box, allowing workspace leads to start executing measurement tasks instantly." },
            { q: "How are metric profile histories generated?", a: "Every alteration to a client's structural measurement parameters prompts an asynchronous logging event, saving previous states as historical snapshots." },
            { q: "Can we bind custom payment systems to the billing tables?", a: "Yes. Our webhook endpoints permit swift alignment with local mobile transaction structures or standard credit clearinghouses." }
          ].map((faq, i) => (
            <div key={i} className="p-6 rounded-2xl bg-neutral-900/30 border border-white/5 hover:border-neutral-800 transition-colors">
              <h3 className="font-bold text-white text-sm mb-2 flex items-center justify-between">
                {faq.q} <ChevronRight size={16} className="text-neutral-600" />
              </h3>
              <p className="text-neutral-400 text-xs leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 13: CORE CALL TO ACTION TERMINAL BANNER */}
      <section className="py-24 px-6">
        <div className="max-w-5xl mx-auto rounded-[2.5rem] bg-gradient-to-br from-indigo-700 via-indigo-900 to-neutral-950 p-12 lg:p-20 text-center relative overflow-hidden border border-white/10 shadow-2xl shadow-indigo-600/5">
          <div className="absolute inset-0 bg-neutral-950/20 mix-blend-overlay pointer-events-none" />
          <h2 className="text-4xl lg:text-5xl font-black text-white mb-4 relative z-10 tracking-tight">System Initialization Ready.</h2>
          <p className="text-indigo-200/80 mb-8 max-w-xl mx-auto relative z-10 text-sm leading-relaxed">Deprecate manual book tracking. Synchronize your internal fashion workshop operations through our premium infrastructure layout.</p>
          <button className="px-8 py-4 bg-white text-indigo-950 rounded-full font-bold text-sm hover:scale-105 transition-transform relative z-10 shadow-xl active:scale-95">
            Initialize Free Core Access
          </button>
        </div>
      </section>

      {/* FOOTER ANCHOR MODULE */}
      <footer className="border-t border-white/5 bg-[#020202] pt-20 pb-10 px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2 space-y-4">
            <div className="flex items-center gap-2 font-bold text-xl text-white tracking-tight">
              <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white">
                <Sparkles size={16} />
              </div>
              TailorOS
            </div>
            <p className="text-neutral-500 text-xs max-w-xs leading-relaxed">Assembling premium cloud pipeline runtimes tailored specifically for independent global fashion operators.</p>
            <div className="flex gap-3 text-xs font-mono text-neutral-400">
              <span className="cursor-pointer hover:text-white transition-colors">GitHub // Terminal</span>
              <span className="cursor-pointer hover:text-white transition-colors">Matrix // Network</span>
            </div>
          </div>
          
          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-4">Framework Stack</h4>
            <ul className="space-y-2 text-neutral-500 text-xs font-medium">
              <li><span className="hover:text-white transition-colors cursor-default">Feature Grid</span></li>
              <li><span className="hover:text-white transition-colors cursor-default">Webhook Routes</span></li>
              <li><span className="hover:text-white transition-colors cursor-default">Pricing Models</span></li>
              <li><span className="hover:text-white transition-colors cursor-default">System Status</span></li>
            </ul>
          </div>

          <div>
            <h4 className="text-white font-bold text-xs uppercase tracking-wider mb-4">Governance</h4>
            <ul className="space-y-2 text-neutral-500 text-xs font-medium">
              <li><span className="hover:text-white transition-colors cursor-default">Privacy Protocol</span></li>
              <li><span className="hover:text-white transition-colors cursor-default">Terms of Execution</span></li>
              <li><span className="hover:text-white transition-colors cursor-default">SLA Security</span></li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
          <p className="text-neutral-600">© {new Date().getFullYear()} TailorOS Engineering Labs. All systems fully certified.</p>
          <div className="flex items-center gap-2 text-neutral-500">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Edge Server Array Operational
          </div>
        </div>
      </footer>

    </div>
  );
}