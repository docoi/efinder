
import React, { useState } from 'react';
import Head from 'next/head';
import {
  Mail, Users, Download, ShieldCheck, Zap, Search, DollarSign, FileText, ChevronDown
} from 'lucide-react';

const InstaEmailScoutHome = () => {
  const [faqOpen, setFaqOpen] = useState(null);

  const toggleFaq = (index) => {
    setFaqOpen(faqOpen === index ? null : index);
  };

  const faqs = [
    {
      question: "How does Insta Email Scout work?",
      answer: "Insta Email Scout scans Instagram pages and intelligently extracts public email addresses available for outreach or business contact."
    },
    {
      question: "Is this tool compliant with Instagram policies?",
      answer: "We only extract publicly visible email addresses and do not store login credentials or interact with private accounts."
    },
    {
      question: "Can I try it for free?",
      answer: "Yes! You can run up to 3 test searches with CSV download included, completely free—no sign-up needed."
    },
    {
      question: "What kind of emails can I find?",
      answer: "Most commonly you'll find business, creator, or influencer contact emails listed on profiles."
    }
  ];

  return (
    <>
      <Head>
        <title>Insta Email Scout | Find Instagram Emails Instantly</title>
        <meta name="description" content="Use Insta Email Scout to extract creator and business emails from Instagram profiles. Perfect for outreach and lead generation." />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </Head>

      <main className="bg-white min-h-screen text-gray-800 font-sans">
        {/* Hero */}
        <section className="text-center py-24 px-4">
          <h1 className="text-4xl sm:text-6xl font-bold mb-6">Find Instagram Emails Instantly</h1>
          <p className="text-lg text-gray-600 max-w-xl mx-auto mb-8">
            Extract creator and business emails from any Instagram profile or category in seconds. No sign-up needed.
          </p>
          <a href="https://leads4ig.com/dashboard" className="inline-block bg-purple-600 text-white text-lg font-semibold py-3 px-6 rounded-lg shadow hover:bg-purple-700 transition">
            Get Started Free
          </a>
        </section>

        {/* Features */}
        <section className="bg-gray-100 py-20 px-4">
          <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
            {[
              { icon: <Mail className="w-8 h-8" />, title: "Email Extraction", desc: "Get public emails from influencers, creators, and brands." },
              { icon: <Users className="w-8 h-8" />, title: "Category Search", desc: "Search by topic like 'beauty', 'fitness', 'travel' and more." },
              { icon: <Download className="w-8 h-8" />, title: "CSV Download", desc: "Download clean .csv lists for outreach or campaigns." },
              { icon: <ShieldCheck className="w-8 h-8" />, title: "Secure & Private", desc: "We never save your data. Ever." },
              { icon: <Zap className="w-8 h-8" />, title: "Fast Results", desc: "Get thousands of emails in seconds, powered by smart APIs." },
              { icon: <DollarSign className="w-8 h-8" />, title: "Pay-as-you-go", desc: "Choose your plan or pay only for what you need." }
            ].map(({ icon, title, desc }, i) => (
              <div key={i} className="bg-white p-6 rounded-xl shadow hover:shadow-lg transition text-center">
                <div className="text-purple-600 mb-4 mx-auto">{icon}</div>
                <h3 className="text-xl font-bold mb-2">{title}</h3>
                <p className="text-gray-600">{desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section className="py-20 px-4">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-10">Frequently Asked Questions</h2>
            <div className="space-y-4 text-left">
              {faqs.map((faq, i) => (
                <div key={i} className="border border-gray-200 rounded-lg">
                  <button
                    onClick={() => toggleFaq(i)}
                    className="w-full p-4 flex items-center justify-between text-lg font-medium"
                  >
                    {faq.question}
                    <ChevronDown className={`w-5 h-5 transform transition-transform ${faqOpen === i ? 'rotate-180' : ''}`} />
                  </button>
                  {faqOpen === i && (
                    <div className="p-4 pt-0 text-gray-600">{faq.answer}</div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="bg-gray-900 text-white py-8 text-center">
          <p className="text-sm">&copy; {new Date().getFullYear()} Insta Email Scout. All rights reserved.</p>
        </footer>
      </main>
    </>
  );
};

export default InstaEmailScoutHome;
