"use client";

import { useRef, useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { ThemeToggle } from "./ThemeToggle";
import { UnhcrEmblem } from "./UnhcrEmblem";
import { cn } from "@/lib/utils";

interface HeaderProps {
  activeTab?: string;
  setActiveTab?: (tab: string) => void;
}

export function Header({}: HeaderProps = {}) {
  const pathname = usePathname();

  const navItems = [
    { href: "/", label: "Overview" },
    { href: "/map", label: "National Capacity" },
    { href: "/due-process", label: "Decision Outcomes" },
    { href: "/corridors", label: "Migration Routes" },
    { href: "/methodology", label: "Methodology" },
  ];

  const isItemActive = (href: string) => {
    if (href === "/") {
      return pathname === "/" || pathname === "/overview";
    }
    return pathname === href || pathname.startsWith(`${href}/`);
  };

  const mobileNavRef = useRef<HTMLDivElement>(null);
  const activeTabLinkRef = useRef<HTMLAnchorElement | null>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = () => {
    const el = mobileNavRef.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;
    setCanScrollLeft(scrollLeft > 6);
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 6);
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, []);

  // Smoothly center the active tab link whenever pathname changes
  useEffect(() => {
    const container = mobileNavRef.current;
    const linkEl = activeTabLinkRef.current;
    if (!container || !linkEl) return;

    const linkLeft = linkEl.offsetLeft;
    const linkWidth = linkEl.offsetWidth;
    const containerWidth = container.clientWidth;
    const targetScrollLeft = linkLeft - containerWidth / 2 + linkWidth / 2;

    container.scrollTo({
      left: Math.max(0, targetScrollLeft),
      behavior: "smooth",
    });

    const timer = setTimeout(checkScroll, 320);
    return () => clearTimeout(timer);
  }, [pathname]);

  // Dynamic edge fade mask for peeking affordance
  let maskStyle = "none";
  if (canScrollLeft && canScrollRight) {
    maskStyle =
      "linear-gradient(to right, transparent 0%, black 20px, black calc(100% - 24px), transparent 100%)";
  } else if (canScrollRight) {
    maskStyle =
      "linear-gradient(to right, black calc(100% - 24px), transparent 100%)";
  } else if (canScrollLeft) {
    maskStyle = "linear-gradient(to right, transparent 0%, black 20px, black 100%)";
  }

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur-md">
        <div className="mx-auto flex h-16 w-full max-w-[1600px] items-center justify-between px-4 sm:px-6 lg:px-8 2xl:px-10">
          {/* Left: Authoritative Institutional UNHCR Identity */}
          <Link
            href="/"
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group focus:outline-none"
            title="UNHCR Asylum Operations Analytics Home"
          >
            <UnhcrEmblem className="h-8 w-8 sm:h-9 sm:w-9 text-[#0072bc] dark:text-sky-400 shrink-0 transition-transform group-hover:scale-105" />
            <div className="flex flex-col">
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-sm sm:text-base tracking-tight text-foreground">
                  UNHCR
                </span>
                <span className="text-muted-foreground/50 font-light text-xs">|</span>
                <span className="font-semibold text-sm sm:text-base tracking-tight text-foreground">
                  Asylum Operations Analytics
                </span>
              </div>
            </div>
          </Link>

          {/* Center: Primary Navigation Segmented Pills */}
          <nav className="hidden lg:flex items-center gap-1 rounded-lg border border-border/60 bg-muted/50 p-1">
            {navItems.map((item) => {
              const active = isItemActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "rounded-md px-3.5 py-1.5 text-xs sm:text-sm font-medium transition-all duration-150 select-none cursor-pointer",
                    active
                      ? "bg-foreground text-background shadow-xs font-semibold"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Right: Institutional Utilities (Theme) */}
          <div className="flex items-center gap-2">
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Mobile / Tablet Horizontal Navigation Strip */}
      <div className="lg:hidden relative border-b border-border bg-muted/30">
        <div
          ref={mobileNavRef}
          onScroll={checkScroll}
          style={{
            maskImage: maskStyle,
            WebkitMaskImage: maskStyle,
            WebkitOverflowScrolling: "touch",
          }}
          className="flex items-center overflow-x-auto px-3.5 py-1.5 gap-1.5 scroll-smooth [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {navItems.map((item) => {
            const active = isItemActive(item.href);
            return (
              <Link
                key={item.href}
                ref={(el) => {
                  if (active) activeTabLinkRef.current = el;
                }}
                href={item.href}
                className={cn(
                  "whitespace-nowrap rounded-md px-3.5 py-1.5 text-xs font-medium transition-all duration-150 shrink-0 cursor-pointer select-none",
                  active
                    ? "bg-foreground text-background shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/80"
                )}
              >
                {item.label}
              </Link>
            );
          })}
        </div>
      </div>
    </>
  );
}
