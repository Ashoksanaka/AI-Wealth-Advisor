"use client";

import { useEffect } from "react";

export function EmbedMode() {
  useEffect(() => {
    document.body.classList.add("embed-mode");
    return () => document.body.classList.remove("embed-mode");
  }, []);
  return null;
}
