"use client";

import React from "react";
import { motion } from "framer-motion";

interface Category {
  id: string;
  name: string;
}

interface CategoryTabsProps {
  categories: Category[];
  activeCategoryId: string;
  onCategoryChange: (id: string) => void;
}

export default function CategoryTabs({ categories, activeCategoryId, onCategoryChange }: CategoryTabsProps) {
  return (
    <div className="w-full overflow-x-auto no-scrollbar scroll-smooth py-4">
      <div className="flex items-center space-x-3 px-4 min-w-max">
        {categories.map((category) => {
          const isActive = activeCategoryId === category.id;
          
          return (
            <button
              key={category.id}
              onClick={() => onCategoryChange(category.id)}
              className={`relative h-11 px-6 rounded-2xl text-xs font-black uppercase tracking-widest transition-all duration-300 whitespace-nowrap overflow-hidden ${
                isActive 
                ? "text-white shadow-xl shadow-brand/20" 
                : "bg-white text-gray-400 hover:bg-gray-50 border border-border font-bold"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="active-bg"
                  className="absolute inset-0 bg-brand z-0"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10">{category.name}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
