"use client";

import { MantineProvider } from "@mantine/core";
import { FC, ReactNode } from "react";

export const MantineWrapper: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <MantineProvider withGlobalStyles withNormalizeCSS>
      {children}
    </MantineProvider>
  );
};
