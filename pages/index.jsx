import React, { useState } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { Search, Clock, Target, Rocket, Sparkles, ChevronDown, CheckCircle, Star } from 'lucide-react';

// --- Reusable Components (Unchanged) ---

const TiltCard = ({ icon, title, description, className = '' }) => {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useTransform(x, [-100, 100], [-12, 12]);
  const mouseYSpring = useTransform(y, [-100, 100], [12, -12]);

  const handleMouseMove = (e) => {
    const rect = e.currentTarget.getBoundingClientRect();
    x.set(e.clientX - rect.left - rect.width / 2);
    y.set(e.clientY - rect.top - rect.height / 2);
  };
  const handleMouseLeave = () => { x.set(0); y.set(0); };

  return (
    <motion.div
      onMouseMove={handleMouseMove} onMouseLeave={handleMouseLeave}
      style={{ rotateY: mouseXSpring, rotateX: mouseYSpring, transformStyle: 'preserve-3d' }}
      className={`relative w-full rounded-2xl bg-white/5 backdrop-blur-lg border border-white/10 p-6 flex flex-col items-center justify-center text-center group ${className}`}
    >
      <div style={{ transform: 'translateZ(50px)' }} className="text-purple-400 mb-4">{icon}</div>
      <h3 style={{ transform: 'translateZ(40px)' }} className="text-lg font-bold text-white mb-2">{title}</h3>
      <p style={{ transform: 'translateZ(30px)' }} className="text-sm text-gray-400 leading-relaxed">{description}</p>
    </motion.div>
  );
};

const FaqItem = ({ question, answer }) => {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <motion.div layout onClick={() => setIsOpen(!isOpen)} className="w-full bg-white/5 backdrop-blur-lg border border-white/10 rounded-lg p-5 cursor-pointer">
      <motion.div layout className="flex justify-between items-center">
        <h4 className="font-semibold text-white">{question}</h4>
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }}><ChevronDown className="w-5 h-5 text-gray-400" /></motion.div>
      </motion.div>
      {isOpen && (
        <motion.div initial={{ opacity: 0, height: 0, marginTop: 0 }} animate={{ opacity: 1, height: 'auto', marginTop: '16px' }} exit={{ opacity: 0, height: 0, marginTop: 0 }} transition={{ duration: 0.3 }}>
          <p className="text-gray-400 text-sm leading-relaxed">{answer}</p>
        </motion.div>
      )}
    </motion.div>
  );
};


// --- Main Page Component ---

const Leads4IgHomepage = () => {
  const [searchType, setSearchType] = useState('single');
  const [searchInput, setSearchInput] = useState('');
  
  // --- UPDATED SLIDER LOGIC ---
  const [emails, setEmails] = useState(500);

  // New tiered pricing function with linear interpolation
  const calculateTieredPrice = (count) => {
    const tiers = [
        [100, 4.50], [250, 11.00], [500, 22.00], [1000, 33.00],
        [2500, 67.00], [10000, 170.00], [20000, 249.00]
    ];

    if (count <= tiers[0][0]) return tiers[0][1];
    if (count >= tiers[tiers.length - 1][0]) return tiers[tiers.length - 1][1];
    
    let lowerTier, upperTier;
    for (let i = 0; i < tiers.length - 1; i++) {
      if (count >= tiers[i][0] && count < tiers[i+1][0]) {
        lowerTier = tiers[i];
        upperTier = tiers[i+1];
        break;
      }
    }
    
    const [lowerCount, lowerPrice] = lowerTier;
    const [upperCount, upperPrice] = upperTier;
    
    const range = upperCount - lowerCount;
    const positionInRange = count - lowerCount;
    const percentage = positionInRange / range;
    
    const priceRange = upperPrice - lowerPrice;
    const interpolatedPrice = lowerPrice + (percentage * priceRange);

    return interpolatedPrice;
  };

  const price = calculateTieredPrice(emails);
  const formattedPrice = `$${price.toFixed(2).replace(/\.00$/, "")}`;
  // --- END UPDATED SLIDER LOGIC ---

  const scrollVariants = {
    offscreen: { y: 50, opacity: 0 },
    onscreen: { y: 0, opacity: 1, transition: { type: 'spring', bounce: 0.4, duration: 1.2 }}
  };
  
  const faqData = [
    { question: "How accurate is the email finding process?", answer: "Our AI uses advanced algorithms to scan public data, providing a high accuracy rate for publicly available contact information. We continuously update our systems to ensure the best results." },
    { question: "Is it legal to scrape emails from Instagram?", answer: "We gather publicly available information, which is compliant with general data protection regulations. We do not access private accounts or data. However, you should always comply with your local regulations regarding outreach marketing." },
    { question: "Do you offer a trial or free plan?", answer: "We have starter plans available so you can experience the power of Leads 4 IG before committing to a larger plan." }
  ];

  const reviewsData = [
    { name: "Sarah K.", role: "Marketing Manager", comment: "This tool is a game-changer. We saved over 20 hours a week on lead generation. Absolutely essential for our outreach.", stars: 5 },
    { name: "David L.", role: "Startup Founder", comment: "As a new business, finding the right influencers was tough. Leads 4 IG gave us a direct line to them. Our ROI was insane.", stars: 5 },
    { name: "Jessica M.", role: "Freelance Consultant", comment: "The 'Pay As You Go' option is perfect for me. I can scale up for big projects without a monthly subscription. The data is top-notch!", stars: 5 },
  ];

  return (
    <div className="w-full bg-black text-white overflow-x-hidden">
      <div className="fixed inset-0 nebula-bg" />

      {/* --- HERO SECTION --- */}
      <section id="home" className="relative min-h-screen w-full flex flex-col">
        <header className="absolute top-0 left-0 right-0 z-20 container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} className="text-2xl font-bold flex items-center">
              <Sparkles className="inline w-6 h-6 mr-2 text-purple-400" />
              <span className="bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Leads 4 IG</span>
            </motion.div>
             <nav className="hidden md:flex space-x-8">
                <a href="#features" className="text-gray-300 hover:text-white transition-colors">Features</a>
                <a href="#pricing" className="text-gray-300 hover:text-white transition-colors">Pricing</a>
                <a href="#faq" className="text-gray-300 hover:text-white transition-colors">FAQ</a>
            </nav>
            <motion.button initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.8 }} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="bg-white/10 backdrop-blur-md text-white px-6 py-2 rounded-full border border-white/20 hover:bg-white/20 transition-all font-medium">Get Started</motion.button>
          </div>
        </header>

        <div className="relative z-10 flex-1 flex flex-col items-center justify-center p-4 text-center">
            <motion.h1 initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8, delay: 0.2 }} className="text-4xl md:text-6xl font-bold mb-4 max-w-4xl tracking-tight">Instagram Leads in Seconds</motion.h1>
            <motion.p initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8, delay: 0.3 }} className="text-lg md:text-xl text-gray-300 mb-8 max-w-3xl leading-relaxed">Skip the scroll. Get real emails from real profiles, instantly.</motion.p>
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8, delay: 0.4 }} className="flex flex-col sm:flex-row gap-4 mb-12">
                <button className="bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold px-8 py-3 rounded-full hover:opacity-90 transition-opacity transform hover:scale-105">Get Leads Now</button>
                <button className="bg-white/10 backdrop-blur-md border border-white/20 text-white font-semibold px-8 py-3 rounded-full hover:bg-white/20 transition-colors">Try It Free</button>
            </motion.div>
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.8, delay: 0.5 }} className="w-full max-w-2xl group">
                <div className="relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-teal-500 rounded-full blur-lg opacity-60 group-hover:opacity-90 transition-opacity duration-500"></div>
                    <div className="relative flex items-center w-full bg-black/40 backdrop-blur-lg border border-white/20 rounded-full p-2 shadow-2xl">
                        <div className="flex items-center pl-3">
                            <button onClick={() => setSearchType('single')} className={`px-3 py-2 rounded-full text-xs transition-all ${searchType === 'single' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:bg-white/10'}`}>Profile</button>
                            <button onClick={() => setSearchType('category')} className={`ml-1 px-3 py-2 rounded-full text-xs transition-all ${searchType === 'category' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:bg-white/10'}`}>Category</button>
                        </div>
                        <input type="text" placeholder={searchType === 'single' ? "@username..." : "e.g., Fitness, Beauty..."} value={searchInput} onChange={(e) => setSearchInput(e.target.value)} className="w-full bg-transparent text-md text-white placeholder-gray-400 px-4 py-3 focus:outline-none" />
                        <div className="absolute right-2 top-1/2 -translate-y-1/2"><button className="p-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full text-white hover:scale-105 transition-transform"><Search className="w-5 h-5" /></button></div>
                    </div>
                </div>
                <p className="text-xs text-gray-500 mt-3">Find 100–20,000+ leads from Instagram in seconds.</p>
            </motion.div>
        </div>
      </section>

      {/* --- THREE-CARD SECTION --- */}
      <section id="features" className="relative container mx-auto px-6 py-24">
         <motion.div initial="offscreen" whileInView="onscreen" viewport={{ once: true, amount: 0.5 }} variants={scrollVariants} className="text-center mb-16">
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">Stop Searching. Start Selling.</h2>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-8">
            <TiltCard icon={<Clock size={32} />} title="Save Time" description="No more endless scrolling or copy-pasting. Instantly uncover thousands of verified contacts in seconds."/>
            <TiltCard icon={<Target size={32} />} title="More Opportunities" description="Unlock the hidden emails and profiles that lead to real collaborations, sales, and growth."/>
            <TiltCard icon={<Rocket size={32} />} title="Scale Fast" description="Go from 0 to 20,000 leads effortlessly. Fuel campaigns and grow outreach without limits."/>
        </div>
      </section>

      {/* --- PRICING SECTION --- */}
      <section id="pricing" className="relative container mx-auto px-6 py-24">
        <motion.div initial="offscreen" whileInView="onscreen" viewport={{ once: true, amount: 0.5 }} variants={scrollVariants} className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Flexible Plans for Everyone</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Choose the perfect plan that fits your needs, from casual searching to large-scale outreach.</p>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-8">
            <motion.div initial="offscreen" whileInView="onscreen" viewport={{ once: true, amount: 0.5 }} variants={scrollVariants} className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 flex flex-col">
                <h3 className="text-2xl font-semibold mb-2">Starter</h3>
                <p className="text-4xl font-bold mb-4">$19 <span className="text-lg font-normal text-gray-400">/ month</span></p>
                <p className="text-gray-400 mb-6 flex-grow">Perfect for getting started with powerful features.</p>
                <ul className="space-y-4 mb-8 text-left"><li className="flex items-center"><CheckCircle className="w-5 h-5 text-emerald-400 mr-3" /> 500 Results</li><li className="flex items-center"><CheckCircle className="w-5 h-5 text-emerald-400 mr-3" /> Single & Category Search</li><li className="flex items-center"><CheckCircle className="w-5 h-5 text-emerald-400 mr-3" /> Community Support</li></ul>
                <button className="mt-auto w-full bg-white/10 border border-white/20 py-3 rounded-lg hover:bg-white/20 transition-colors">Get Started</button>
            </motion.div>
            <motion.div initial="offscreen" whileInView="onscreen" viewport={{ once: true, amount: 0.5 }} variants={scrollVariants} className="relative bg-black/20 backdrop-blur-xl border-2 border-purple-500 rounded-2xl p-8 flex flex-col shadow-2xl shadow-purple-500/20">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-purple-600 text-white text-xs font-bold px-4 py-1 rounded-full">RECOMMENDED</div>
                <h3 className="text-2xl font-semibold mb-2">Pro</h3>
                <p className="text-4xl font-bold mb-4">$49 <span className="text-lg font-normal text-gray-400">/ month</span></p>
                <p className="text-gray-400 mb-6 flex-grow">Ideal for marketers and growing businesses.</p>
                <ul className="space-y-4 mb-8 text-left"><li className="flex items-center"><CheckCircle className="w-5 h-5 text-emerald-400 mr-3" /> 2,500 Results</li><li className="flex items-center"><CheckCircle className="w-5 h-5 text-emerald-400 mr-3" /> All Starter Features</li><li className="flex items-center"><CheckCircle className="w-5 h-5 text-emerald-400 mr-3" /> Export to CSV</li><li className="flex items-center"><CheckCircle className="w-5 h-5 text-emerald-400 mr-3" /> Priority Support</li></ul>
                <button className="mt-auto w-full bg-gradient-to-r from-purple-600 to-pink-600 py-3 rounded-lg hover:opacity-90 transition-opacity font-semibold">Choose Plan</button>
            </motion.div>
             <motion.div initial="offscreen" whileInView="onscreen" viewport={{ once: true, amount: 0.5 }} variants={scrollVariants} className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 flex flex-col">
                <h3 className="text-2xl font-semibold mb-2">Premium</h3>
                <p className="text-4xl font-bold mb-4">$119 <span className="text-lg font-normal text-gray-400">/ month</span></p>
                <p className="text-gray-400 mb-6 flex-grow">For agencies and power users with high demand.</p>
                <ul className="space-y-4 mb-8 text-left"><li className="flex items-center"><CheckCircle className="w-5 h-5 text-emerald-400 mr-3" /> 10,000 Results</li><li className="flex items-center"><CheckCircle className="w-5 h-5 text-emerald-400 mr-3" /> All Pro Features</li><li className="flex items-center"><CheckCircle className="w-5 h-5 text-emerald-400 mr-3" /> API Access</li><li className="flex items-center"><CheckCircle className="w-5 h-5 text-emerald-400 mr-3" /> Dedicated Account Manager</li></ul>
                <button className="mt-auto w-full bg-white/10 border border-white/20 py-3 rounded-lg hover:bg-white/20 transition-colors">Contact Sales</button>
            </motion.div>
        </div>
      </section>
      
      {/* --- DYNAMIC SLIDER SECTION --- */}
      <section id="pay-as-you-go" className="relative container mx-auto px-6 pb-24">
        <motion.div initial="offscreen" whileInView="onscreen" viewport={{ once: true, amount: 0.5 }} variants={scrollVariants} className="max-w-3xl mx-auto">
            <div className="text-center mb-12"><h2 className="text-4xl font-bold mb-4">Pay As You Go</h2><p className="text-gray-400">Need more leads without a monthly commitment? Just use the slider.</p></div>
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 shadow-2xl">
                <div className="flex justify-between items-center mb-4 font-bold text-2xl"><div className="flex items-baseline"><span className="text-purple-400">{emails.toLocaleString()}</span><span className="text-gray-400 text-sm ml-2">Leads</span></div><div className="flex items-baseline"><span className="text-emerald-400">{formattedPrice}</span></div></div>
                <input type="range" min="100" max="20000" step="100" value={emails} onChange={(e) => setEmails(Number(e.target.value))} className="w-full h-2 bg-black/30 rounded-lg appearance-none cursor-pointer range-slider"/>
                <style>{`.range-slider::-webkit-slider-thumb { -webkit-appearance: none; appearance: none; width: 20px; height: 20px; background: #a855f7; border-radius: 50%; cursor: pointer; border: 2px solid white; } .range-slider::-moz-range-thumb { width: 20px; height: 20px; background: #a855f7; border-radius: 50%; cursor: pointer; border: 2px solid white; }`}</style>
                <div className="flex justify-between text-xs text-gray-500 mt-2"><span>100</span><span>20,000</span></div>
                <button className="w-full mt-8 bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-semibold py-3 rounded-lg hover:opacity-90 transition-opacity">Buy {emails.toLocaleString()} Leads</button>
            </div>
        </motion.div>
      </section>

      {/* --- REVIEW SECTION --- */}
      <section id="reviews" className="relative container mx-auto px-6 py-24">
        <motion.div initial="offscreen" whileInView="onscreen" viewport={{ once: true, amount: 0.5 }} variants={scrollVariants} className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Loved by Marketers & Founders</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">Don't just take our word for it. Here's what our users are saying.</p>
        </motion.div>
        <div className="grid md:grid-cols-3 gap-8">
            {reviewsData.map((review, index) => (
                <motion.div key={index} initial="offscreen" whileInView="onscreen" viewport={{ once: true, amount: 0.5 }} variants={{ offscreen: { y: 50, opacity: 0 }, onscreen: { y: 0, opacity: 1, transition: { type: 'spring', duration: 1, delay: index * 0.2 }}}} className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 flex flex-col text-left">
                    <div className="flex text-yellow-400 mb-4">{[...Array(review.stars)].map((_, i) => <Star key={i} className="w-5 h-5 fill-current" />)}</div>
                    <p className="text-gray-300 mb-6 flex-grow">"{review.comment}"</p>
                    <div><p className="font-bold text-white">{review.name}</p><p className="text-sm text-gray-500">{review.role}</p></div>
                </motion.div>
            ))}
        </div>
      </section>

      {/* --- FAQ SECTION --- */}
      <section id="faq" className="relative container mx-auto px-6 py-24">
        <motion.div initial="offscreen" whileInView="onscreen" viewport={{ once: true, amount: 0.5 }} variants={scrollVariants} className="text-center mb-16"><h2 className="text-4xl font-bold mb-4">Frequently Asked Questions</h2></motion.div>
        <motion.div initial="offscreen" whileInView="onscreen" viewport={{ once: true, amount: 0.5 }} variants={scrollVariants} className="max-w-3xl mx-auto space-y-4">
            {faqData.map((faq, index) => (<FaqItem key={index} question={faq.question} answer={faq.answer} />))}
        </motion.div>
      </section>

      {/* --- FOOTER --- */}
      <footer className="relative border-t border-white/10 mt-24">
        <div className="container mx-auto px-6 py-12">
             <div className="grid md:grid-cols-4 gap-8 mb-12 text-left">
                <div className="md:col-span-1">
                    <div className="text-xl font-bold flex items-center mb-4"><Sparkles className="inline w-5 h-5 mr-2 text-purple-400" /><span>Leads 4 IG</span></div>
                    <p className="text-gray-400 text-sm">Stop Searching. Start Selling.</p>
                </div>
                <div>
                    <h4 className="font-semibold mb-4 text-white">Product</h4>
                    <ul className="space-y-3 text-sm text-gray-400">
                        <li><a href="#features" className="hover:text-white transition-colors">Features</a></li>
                        <li><a href="#pricing" className="hover:text-white transition-colors">Pricing</a></li>
                        <li><a href="#reviews" className="hover:text-white transition-colors">Reviews</a></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-semibold mb-4 text-white">Company</h4>
                    <ul className="space-y-3 text-sm text-gray-400">
                        <li><a href="#" className="hover:text-white transition-colors">About Us</a></li>
                        <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
                        <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
                    </ul>
                </div>
                <div>
                    <h4 className="font-semibold mb-4 text-white">Legal</h4>
                    <ul className="space-y-3 text-sm text-gray-400">
                        <li><a href="#" className="hover:text-white transition-colors">Terms & Conditions</a></li>
                        <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                        <li><a href="#" className="hover:text-white transition-colors">Disclaimer</a></li>
                    </ul>
                </div>
            </div>
            <div className="border-t border-white/10 pt-8 text-center text-xs text-gray-500">
                <p className="mb-3">Leads 4 IG is not affiliated with Instagram, TikTok, YouTube, or Meta Platforms Inc.</p>
                <p className="mb-4">Instagram is a trademark of Meta Platforms, Inc.</p>
                <p>&copy; {new Date().getFullYear()} Leads 4 IG. All rights reserved.</p>
            </div>
        </div>
      </footer>
    </div>
  );
};

export default Leads4IgHomepage;