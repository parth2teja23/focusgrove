"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Calendar, CheckSquare, TreePine, BarChart3 } from "lucide-react";

/**
 * Fixed bottom navigation bar
 */
export function BottomNav() {
  const pathname = usePathname();
  
  const navItems = [
    { href: "/app/today", label: "Today", icon: CheckSquare },
    { href: "/app/calendar", label: "Calendar", icon: Calendar },
    { href: "/app/forest", label: "Forest", icon: TreePine },
    { href: "/app/stats", label: "Stats", icon: BarChart3 },
  ];
  
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200">
      <div className="max-w-md mx-auto px-4">
        <div className="flex items-center justify-around h-16">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 flex-1 h-full transition-colors",
                  isActive ? "text-green-600" : "text-gray-600 hover:text-gray-900"
                )}
              >
                <Icon size={24} />
                <span className="text-xs font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
