import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import { DropdownConfig } from "@/types/ui";

interface ZenDropdownProps {
  trigger: React.ReactNode;
  children: React.ReactNode;
  config?: DropdownConfig;
  className?: string;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function ZenDropdown({
  trigger,
  children,
  config = {},
  className = "",
  open,
  onOpenChange,
}: ZenDropdownProps) {
  const [isInternalOpen, setIsInternalOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Use controlled or uncontrolled state
  const isOpen = open !== undefined ? open : isInternalOpen;
  const setIsOpen = useCallback(
    (newOpen: boolean) => {
      if (onOpenChange) {
        onOpenChange(newOpen);
      } else {
        setIsInternalOpen(newOpen);
      }
    },
    [onOpenChange]
  );

  // Default config
  const { positioning = {}, behavior = {}, animation = {} } = config;

  const { align = "right", maxHeight = 400, width = "content" } = positioning;

  const { closeOnSelect = false } = behavior;

  const { duration = 200, type = "slide" } = animation;

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    // Touch outside handler for mobile
    const handleTouchOutside = (event: TouchEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleTouchOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("touchstart", handleTouchOutside);
      };
    }
  }, [isOpen, setIsOpen]);

  // Auto-close on selection if configured
  const handleContentClick = (event: React.MouseEvent) => {
    if (closeOnSelect) {
      const target = event.target as HTMLElement;
      const isInteractive = target.closest(
        'button, [role="button"], [onclick]'
      );
      if (isInteractive) {
        setIsOpen(false);
      }
    }
  };

  const getAlignmentClasses = () => {
    switch (align) {
      case "left":
        return "left-0";
      case "center":
        return "left-1/2 transform -translate-x-1/2";
      case "right":
      default:
        return "right-0";
    }
  };

  const getWidthStyle = () => {
    if (typeof width === "number") {
      return { width: `${width}px` };
    }
    return {};
  };

  const getWidthClasses = () => {
    if (typeof width === "number") return "";
    switch (width) {
      case "trigger":
        return "w-full";
      case "content":
      default:
        return "w-48 sm:w-64"; // Smaller on mobile
    }
  };

  const getAnimationProps = () => {
    switch (type) {
      case "fade":
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 },
        };
      case "scale":
        return {
          initial: { opacity: 0, scale: 0.95 },
          animate: { opacity: 1, scale: 1 },
          exit: { opacity: 0, scale: 0.95 },
        };
      case "slide":
      default:
        return {
          initial: { opacity: 0, y: -10 },
          animate: { opacity: 1, y: 0 },
          exit: { opacity: 0, y: -10 },
        };
    }
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Trigger */}
      <div onClick={() => setIsOpen(!isOpen)}>{trigger}</div>

      {/* Dropdown Content */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            {...getAnimationProps()}
            transition={{ duration: duration / 1000 }}
            className={`absolute mt-1 sm:mt-2 ${getAlignmentClasses()} ${getWidthClasses()} bg-white border border-stone-200 shadow-lg zen-card z-[9999] rounded-lg overflow-hidden`}
            style={{
              maxHeight: `${maxHeight}px`,
              overflowY: "auto",
              ...getWidthStyle(),
            }}
            onClick={handleContentClick}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
