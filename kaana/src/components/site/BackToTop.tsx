'use client';

import Icon from "@/components/ui/Icon";

export default function BackToTop() {
  return (
    <>
      
        <button className="fixed bottom-8 right-8 w-10 h-10 bg-accent rounded-sm flex items-center justify-center text-dark opacity-0 pointer-events-none transition-all duration-300" id="backToTop">
          <Icon name="arrow-up" className="text-xs" />
        </button>
    </>
  );
}
