"use client";

import React, { useState, useRef, useEffect } from "react";
import { ChevronDown, Search, X, Check, Globe } from "lucide-react";
import { CountryFlagBadge } from "./CountryFlagBadge";
import { cn } from "@/lib/utils";

export interface SelectOption {
  value: string;
  label: string;
  iso?: string;
  badge?: string;
  subLabel?: string;
}

interface SearchableSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  searchPlaceholder?: string;
  searchable?: boolean;
  className?: string;
  menuClassName?: string;
  showFlag?: boolean;
  labelPrefix?: string;
  size?: "sm" | "md";
}

export function SearchableSelect({
  value,
  onChange,
  options,
  placeholder = "Select an option...",
  searchPlaceholder = "Search...",
  searchable,
  className,
  menuClassName,
  showFlag = false,
  labelPrefix,
  size = "sm",
}: SearchableSelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-enable search bar if more than 7 options unless explicitly disabled
  const isSearchable = searchable ?? options.length > 7;

  // Selected option resolution
  const selectedOption = options.find((opt) => opt.value === value);

  // Outside click listener
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
        setSearchQuery("");
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape" && isOpen) {
        setIsOpen(false);
        setSearchQuery("");
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("keydown", handleKeyDown);
      if (isSearchable && inputRef.current) {
        setTimeout(() => inputRef.current?.focus(), 50);
      }
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, isSearchable]);

  // Filtered options based on search query
  const filteredOptions = searchQuery.trim()
    ? options.filter((opt) => {
        const query = searchQuery.toLowerCase().trim();
        return (
          opt.label.toLowerCase().includes(query) ||
          opt.value.toLowerCase().includes(query) ||
          (opt.subLabel && opt.subLabel.toLowerCase().includes(query)) ||
          (opt.iso && opt.iso.toLowerCase().includes(query))
        );
      })
    : options;

  const heightClass = size === "md" ? "h-9" : "h-8";

  return (
    <div className="relative inline-block text-left" ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          heightClass,
          "rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-semibold text-foreground shadow-xs hover:bg-accent/50 focus:outline-none focus:ring-1 focus:ring-ring transition-colors flex items-center justify-between gap-2 cursor-pointer select-none",
          className
        )}
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <div className="flex items-center gap-2 min-w-0 truncate">
          {labelPrefix && (
            <span className="text-muted-foreground font-medium shrink-0">
              {labelPrefix}
            </span>
          )}

          {showFlag && selectedOption && (
            selectedOption.value === "ALL" || selectedOption.value === "GLOBAL" ? (
              <Globe className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            ) : (
              <CountryFlagBadge
                iso={selectedOption.iso || selectedOption.value}
                name={selectedOption.label}
                size="xs"
              />
            )
          )}

          <span className="truncate text-foreground">
            {selectedOption ? selectedOption.label : placeholder}
          </span>
        </div>

        <ChevronDown
          className={cn(
            "h-3.5 w-3.5 text-muted-foreground transition-transform duration-200 shrink-0 ml-1",
            isOpen && "rotate-180"
          )}
        />
      </button>

      {/* Floating Popover Menu */}
      {isOpen && (
        <div
          className={cn(
            "absolute left-0 top-full mt-1.5 w-64 rounded-xl border border-border bg-card/95 backdrop-blur-md shadow-xl z-50 overflow-hidden flex flex-col animate-in fade-in-0 zoom-in-95 duration-100",
            menuClassName
          )}
        >
          {/* Optional Search Bar */}
          {isSearchable && (
            <div className="p-2 border-b border-border bg-muted/30">
              <div className="relative flex items-center">
                <Search className="absolute left-2.5 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                <input
                  ref={inputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder={searchPlaceholder}
                  className="w-full h-7.5 pl-8 pr-7 text-xs rounded-md border border-input bg-background text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring font-sans"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 text-muted-foreground hover:text-foreground cursor-pointer"
                    title="Clear search"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Scrollable Items List */}
          <div className="max-h-64 overflow-y-auto divide-y divide-border/20 py-1">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((opt) => {
                const isSelected = opt.value === value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => {
                      onChange(opt.value);
                      setIsOpen(false);
                      setSearchQuery("");
                    }}
                    className={cn(
                      "w-full px-3 py-1.5 text-left flex items-center justify-between text-xs transition-colors hover:bg-accent/60 cursor-pointer select-none",
                      isSelected && "bg-accent/80 font-semibold"
                    )}
                  >
                    <div className="flex items-center gap-2 min-w-0 pr-2">
                      {showFlag && (
                        opt.value === "ALL" || opt.value === "GLOBAL" ? (
                          <Globe className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                        ) : (
                          <CountryFlagBadge
                            iso={opt.iso || opt.value}
                            name={opt.label}
                            size="xs"
                          />
                        )
                      )}
                      <span className="truncate text-foreground font-medium">
                        {opt.label}
                      </span>
                      {opt.subLabel && (
                        <span className="text-[10px] font-semibold tracking-wider text-muted-foreground uppercase">
                          {opt.subLabel}
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {opt.badge && (
                        <span className="text-xs text-muted-foreground tabular-nums font-medium">
                          {opt.badge}
                        </span>
                      )}
                      {isSelected && (
                        <Check className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400 shrink-0" />
                      )}
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="p-3 text-center text-xs text-muted-foreground">
                No matching options found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default SearchableSelect;
