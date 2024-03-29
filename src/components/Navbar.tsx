import React from "react";
import { PiShoppingCartSimpleThin } from "react-icons/pi";
import { CiSearch } from "react-icons/ci";
import Link from "next/link";
import { api } from "@/utils/api";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";

export const Navbar = () => {
  const router = useRouter();
  const { data } = api.user.getUser.useQuery();
  const listStyle = "capitalize cursor-pointer";
  const { mutate } = api.user.logout.useMutation({
    onSuccess: () => {
      toast.success("loged out", { id: "loging-out" });
      router.refresh();
    },
    onError: () => {
      toast.error("Error login out", { id: "loging-out" });
    },
  });
  return (
    <div className="box-border flex h-[100px] w-screen items-end justify-between bg-white p-[30px] pb-[15px] pt-[15px]">
      <div className="w-[25%] text-[35px] font-bold ">ECOMMERCE</div>
      <div className="flex w-[50%] items-center justify-center">
        <ul className="flex justify-center gap-[50px]">
          <Link href={"/categories"}>
            <li className={listStyle}>categories</li>
          </Link>
          <li className={listStyle}>sale</li>
          <li className={listStyle}>clearance</li>
          <li className={listStyle}>new stock</li>
          <li className={listStyle}>trending</li>
          {data && data?.user && (
            <li
              onClick={() => {
                toast.loading("loging out", { id: "loging-out" });

                mutate();
              }}
              className={listStyle}
            >
              Log out
            </li>
          )}
        </ul>
      </div>
      <div className="flex h-[100%] w-[25%] flex-col justify-between">
        <div className="flex items-center justify-end gap-[20px]">
          <div className="cursor-pointer text-[14px]">Help</div>
          <div className="cursor-pointer text-[14px]">Order & Return</div>
          <div className="cursor-pointer text-[14px]">Hi {data?.user.name}</div>
        </div>
        <div className="flex items-center justify-end gap-[50px]">
          <CiSearch className="cursor-pointer text-[25px]" />
          <PiShoppingCartSimpleThin className="cursor-pointer text-[25px]" />
        </div>
      </div>
    </div>
  );
};
