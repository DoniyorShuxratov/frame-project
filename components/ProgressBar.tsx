"use client";

import { AppProgressBar } from "next-nprogress-bar";

export function ProgressBar() {
  return (
    <AppProgressBar
      height="3px"
      color="#0086cb"
      options={{ showSpinner: false }}
      shallowRouting
    />
  );
}
