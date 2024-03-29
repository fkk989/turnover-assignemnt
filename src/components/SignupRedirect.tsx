import { useRouter } from "next/navigation";
import React from "react";
export const SignupRedirect = () => {
  const router = useRouter();
  return (
    <p className="flex gap-[10px] capitalize">
      have an account?
      <span
        onClick={() => router.push("/login")}
        className="cursor-pointer uppercase tracking-[1px] text-sky-600 hover:text-sky-400"
      >
        login
      </span>
    </p>
  );
};
