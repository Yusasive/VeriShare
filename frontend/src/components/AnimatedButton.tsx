"use client";
// Utility to filter out incompatible drag event handlers for Framer Motion
const filterMotionProps = <T extends Record<string, unknown>>(
  props: T
): Partial<T> => {
  const keysToRemove = [
    "onDrag",
    "onDragStart",
    "onDragEnd",
    "onDragOver",
    "onDragEnter",
    "onDragLeave",
    "onDrop",
  ];
  const filtered: Partial<T> = {};
  for (const key in props) {
    if (!keysToRemove.includes(key)) {
      filtered[key] = props[key];
    }
  }
  return filtered;
};
import { motion } from "framer-motion";
import React from "react";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  asLink?: false;
};

type LinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> & {
  asLink: true;
  href: string;
};

type Props = ButtonProps | LinkProps;

export default function AnimatedButton(props: Props) {
  const { children, asLink = false, className = "", ...rest } = props;

  const base =
    "rounded-full px-6 py-3 text-sm font-semibold text-black bg-gradient-to-r from-cyan-300 to-indigo-400 hover:from-cyan-200 hover:to-indigo-300 shadow-[0_0_40px_#22d3ee66]";

  const MotionButton = motion.button;
  const MotionLink = motion.a;

  if (asLink) {
    const { href, ...linkProps } = rest as LinkProps;
    const safeProps = filterMotionProps(linkProps);
    return (
      <MotionLink
        href={href}
        whileHover={{ y: -2, scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`${base} ${className}`}
        {...safeProps}
      >
        {children}
      </MotionLink>
    );
  }

  const safeButtonProps = filterMotionProps(rest as ButtonProps);
  return (
    <MotionButton
      whileHover={{ y: -2, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={`${base} ${className}`}
      {...safeButtonProps}
    >
      {children}
    </MotionButton>
  );
}
