"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface TypewriterProps {
  words: string[];
  className?: string;
  typingSpeed?: number;
  deletingSpeed?: number;
  pauseTime?: number;
}

export const Typewriter: React.FC<TypewriterProps> = ({
  words,
  className,
  typingSpeed = 100,
  deletingSpeed = 50,
  pauseTime = 2000,
}) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;

    if (isPaused) {
      timeout = setTimeout(() => {
        setIsPaused(false);
        setIsDeleting(true);
      }, pauseTime);
    } else if (isDeleting && currentText === "") {
      setIsDeleting(false);
      setCurrentWordIndex((prev) => (prev + 1) % words.length);
    } else if (!isDeleting && currentText === words[currentWordIndex]) {
      setIsPaused(true);
    } else {
      const speed = isDeleting ? deletingSpeed : typingSpeed;
      timeout = setTimeout(() => {
        const nextText = isDeleting
          ? currentText.slice(0, -1)
          : words[currentWordIndex].slice(0, currentText.length + 1);
        setCurrentText(nextText);
      }, speed);
    }

    return () => clearTimeout(timeout);
  }, [currentText, isDeleting, isPaused, words, currentWordIndex, typingSpeed, deletingSpeed, pauseTime]);

  return (
    <span className={cn("inline-flex items-center", className)}>
      <span className="relative">
        {currentText}
        <motion.span
          animate={{ opacity: [1, 0] }}
          transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
          className="ml-1 rtl:ml-0 rtl:mr-1 inline-block w-1 h-[1em] bg-blue-500 align-middle"
        />
      </span>
    </span>
  );
};
