import React, { useState, useRef, useEffect } from "react";
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
  const setIsOpen = (newOpen: boolean) => {
    if (onOpenChange) {
      onOpenChange(newOpen);
    } else {
      setIsInternalOpen(newOpen);
    }
  };

  // Default config
  const {
    positioning = {},
    behavior = {},
    animation = {},
  } = config;

  const {
    align = 'right',
    offset = 8,
    maxHeight = 400,
    width = 'content',
  } = positioning;

  const {
    closeOnSelect = false,
  } = behavior;

  const {
    duration = 200,
    type = 'slide',
  } = animation;

  // Click outside handler
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Auto-close on selection if configured
  const handleContentClick = (event: React.MouseEvent) => {
    if (closeOnSelect) {
      const target = event.target as HTMLElement;
      const isInteractive = target.closest('button, [role="button"], [onclick]');
      if (isInteractive) {
        setIsOpen(false);
      }
    }
  };

  const getAlignmentClasses = () => {
    switch (align) {
      case 'left':
        return 'left-0';
      case 'center':
        return 'left-1/2 transform -translate-x-1/2';
      case 'right':
      default:
        return 'right-0';
    }
  };

  const getWidthStyle = () => {
    if (typeof width === 'number') {
      return { width: `${width}px` };
    }
    return {};
  };

  const getWidthClasses = () => {
    if (typeof width === 'number') return '';
    switch (width) {
      case 'trigger':
        return 'w-full';
      case 'content':
      default:
        return 'w-64';
    }
  };

  const getAnimationProps = () => {
    switch (type) {
      case 'fade':
        return {
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 },
        };
      case 'scale':
        return {
          initial: { opacity: 0, scale: 0.95 },
          animate: { opacity: 1, scale: 1 },
          exit: { opacity: 0, scale: 0.95 },
        };
      case 'slide':
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
      <div onClick={() => setIsOpen(!isOpen)}>
        {trigger}
      </div>

      {/* Dropdown Content */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            {...getAnimationProps()}
            transition={{ duration: duration / 1000 }}
            className={`absolute mt-2 ${getAlignmentClasses()} ${getWidthClasses()} bg-white border border-stone-200 shadow-lg zen-card p-4 z-[9999]`}
            style={{
              maxHeight: `${maxHeight}px`,
              overflowY: 'auto',
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
