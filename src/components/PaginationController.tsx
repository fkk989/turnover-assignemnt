import React from "react";
import { useSearchParams, useRouter } from "next/navigation";

export const PaginationController = ({
  totalPages,
}: {
  totalPages?: number;
  selectCheckboxes: () => void;
}) => {
  if (!totalPages) return <div></div>;
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentPage = searchParams.get("page") ?? "1";

  const page_numbers = [];
  for (let i = Number(currentPage) - 5; i <= Number(currentPage) + 5; i++) {
    if (i < 1) continue;
    if (i > totalPages) break;
    page_numbers.push(i);
  }
  return (
    <div className=" absolute bottom-[100px] left-[30px] flex h-[26px] w-[300px] items-center justify-center gap-[15px]">
      <button
        onClick={() => {
          router.push(`/categories?page=${1}`);
        }}
      >{`<<`}</button>

      <button
        onClick={() =>
          router.push(
            `/categories?page=${Number(currentPage) > 1 ? Number(currentPage) - 1 : 1}`,
          )
        }
      >{`<`}</button>

      <div className="flex w-[165px] items-center justify-center gap-[10px] overflow-hidden">
        {page_numbers.map((pageNumber) => {
          return (
            <div
              className={`cursor-pointer ${
                Number(currentPage) === pageNumber
                  ? "text-sky-600"
                  : "text-black"
              }`}
              key={pageNumber}
              onClick={() => router.push(`/categories?page=${pageNumber}`)}
            >
              {pageNumber}
            </div>
          );
        })}
      </div>

      <button
        onClick={() =>
          router.push(
            `/categories?page=${
              Number(currentPage) < totalPages
                ? Number(currentPage) + 1
                : totalPages
            }`,
          )
        }
      >{`>`}</button>

      <button
        onClick={() => router.push(`/categories?page=${totalPages}`)}
      >{`>>`}</button>
    </div>
  );
};
