import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Home() {
  const router = useRouter();
  useEffect(() => {
    // router.push("/login");
  });
  return <div className="min-h-screen w-screen bg-white">Home Page</div>;
}
