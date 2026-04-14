"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function ProspectRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/leads");
  }, [router]);
  return null;
}
