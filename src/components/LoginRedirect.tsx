import { useRouter } from "next/navigation";
import React from "react";
export const LoginRedirect = () => {
  const router = useRouter();
  return (
    <p
      onClick={() => router.push("/signup")}
      className="flex gap-[10px] capitalize"
    >
      Don't have a account?
      <span className="cursor-pointer uppercase tracking-[1px] text-sky-600 hover:text-sky-400">
        Sign Up
      </span>
    </p>
  );
};
