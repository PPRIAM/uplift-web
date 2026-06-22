'use client';

import React, { useState } from 'react';

/**
 * Composant NewsletterForm
 * Permet aux utilisateurs de s'abonner à la newsletter via un formulaire interactif.
 */
export default function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  // Gestion de la soumission du formulaire de newsletter
  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 3000);
    }
  };

  return (
    <div className="w-full md:max-w-[450px]">
      <h4 className="text-[15px] font-bold uppercase tracking-[0.05em] text-[#334155] mb-3 font-heading">
        Inscription à la Newsletter
      </h4>
      <p className="text-[#64748B] text-sm mb-4 leading-relaxed">
        Recevez nos actualités et restez connecté avec l&apos;élan technologique d&apos;AYIBUZZ MÉDIA.
      </p>
      
      <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row gap-3">
        <input 
          type="email" 
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Votre adresse e-mail" 
          className="input-field flex-1 py-3 px-4 text-sm outline-none bg-[#F8FAFC] border-[1.5px] border-[#0F172A] rounded-[6px] text-[#0F172A] placeholder:text-[#64748B]" 
          required
        />
        <button 
          type="submit"
          className="btn-primary py-3 px-6 text-sm font-semibold whitespace-nowrap cursor-pointer transition-colors duration-200"
        >
          {subscribed ? 'Inscrit !' : "S'abonner"}
        </button>
      </form>
    </div>
  );
}
