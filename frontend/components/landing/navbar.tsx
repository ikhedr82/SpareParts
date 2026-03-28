"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { useLanguage } from "@/lib/i18n/LanguageContext";
import { LanguageSwitcher } from "@/components/language-switcher";
import { Menu, X, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { useScrollSpy } from "@/hooks/use-scroll-spy";
import { Button } from "@/components/ui/button";

const navItems = [
  { id: "features", label: "landing.nav.features" },
  { id: "pricing", label: "landing.nav.pricing" },
  { id: "about", label: "landing.nav.about" },
  { id: "faq", label: "landing.faq.title" },
  { id: "contact", label: "landing.nav.contact" },
];

export const Navbar = () => {
  const { t } = useLanguage();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  const activeSection = useScrollSpy(navItems.map(item => item.id));

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (id: string | "top") => {
    setIsMobileMenuOpen(false);
    if (id === "top") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  };

  return (
    <nav 
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-300",
        isScrolled 
          ? "bg-slate-950/80 backdrop-blur-xl border-b border-white/5 py-3 shadow-lg" 
          : "bg-transparent py-5"
      )}
    >
      <div className="container mx-auto px-4 md:px-6 flex items-center justify-between relative h-full">
        {/* Left/Start side: Toggle on mobile (hidden on desktop) */}
        <div className="lg:hidden flex-1 flex justify-start">
          <button 
            className="text-white p-2 hover:bg-white/10 rounded-xl transition-colors"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Logo: Centered on mobile, Start-aligned on desktop */}
        <div className="flex-shrink-0 lg:flex-none flex justify-center lg:justify-start lg:mr-8 rtl:lg:mr-0 rtl:lg:ml-8">
          <button onClick={() => scrollToSection("top")} className="flex items-center">
            <BrandLogo variant="light" height={28} />
          </button>
        </div>

        {/* Desktop Menu: Center-ish */}
        <div className="hidden lg:flex items-center gap-8 flex-1 justify-center">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.id)}
              className={cn(
                "text-sm font-medium transition-colors hover:text-blue-400 relative py-2",
                activeSection === item.id ? "text-blue-400 after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-blue-400" : "text-slate-300"
              )}
            >
              {t(item.label)}
            </button>
          ))}
        </div>

        {/* Desktop Actions / Mobile Spacer */}
        <div className="flex-1 flex justify-end items-center gap-4">
          <div className="hidden lg:flex items-center gap-4">
            <LanguageSwitcher />
            <Link href="/login" className="text-sm font-medium text-slate-300 hover:text-white transition-colors">
              {t("landing.nav.login")}
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white rounded-full px-6 py-2 text-sm font-medium shadow-lg shadow-blue-600/20 transition-colors"
            >
              {t("landing.nav.start_free")}
            </Link>
          </div>
          
          {/* Mobile spacer to balance the left toggle */}
          <div className="lg:hidden w-10 h-10" /> 
        </div>
      </div>

      {/* Mobile Menu */}
      <div className={cn(
        "lg:hidden fixed inset-0 top-[64px] bg-slate-950 z-40 transition-transform duration-300 ease-in-out px-6 py-8 flex flex-col gap-6",
        isMobileMenuOpen ? "translate-x-0" : "translate-x-full rtl:-translate-x-full"
      )}>
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => scrollToSection(item.id)}
            className={cn(
              "text-2xl font-semibold text-left rtl:text-right",
              activeSection === item.id ? "text-blue-400" : "text-white"
            )}
          >
            {t(item.label)}
          </button>
        ))}
        <div className="mt-auto pb-10 flex flex-col gap-6">
          <div className="flex items-center justify-between">
            <span className="text-slate-400 font-medium">{t("landing.nav.login")}</span>
            <LanguageSwitcher />
          </div>
          <Link
            href="/signup"
            className="w-full flex items-center justify-center bg-blue-600 hover:bg-blue-700 h-14 text-lg font-bold rounded-2xl transition-colors"
          >
            {t("landing.nav.start_free")}
            <ArrowRight className="ml-2 w-5 h-5 rtl:mr-2 rtl:ml-0 rtl:rotate-180" />
          </Link>
        </div>
      </div>
    </nav>
  );
};
