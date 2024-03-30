import { PaginationController } from "./PaginationController";
import { useSearchParams } from "next/navigation";
import { api } from "@/utils/api";
import { useCallback, useEffect, useRef } from "react";
import toast from "react-hot-toast";
import { CategorySkeleton } from "./skeletons";
export const PaginatedCard: React.FC<{}> = ({}) => {
  const checkboxes = useRef<Array<HTMLInputElement | null>>([]);
  const searchParams = useSearchParams();
  const currentPage = searchParams.get("page") ?? "1";
  let limit = searchParams?.get("limit") ?? "6";
  const util = api.useUtils();
  const [{ data }, { data: categoriesData }, { data: selectedCategoriesData }] =
    api.useQueries((t) => [
      t.category.getCount(),
      t.category.getAll({
        currentPage: Number(currentPage),
        limit: Number(limit),
      }),
      t.category.getAllSelected(),
    ]);
  const { mutate } = api.category.select.useMutation({
    onSuccess: () => {
      util.category.getAllSelected.invalidate();
    },
    onError: () => {
      toast.error("error selecting category");
    },
  });

  let totalPages = data && Math.ceil(data.categoriesCount / 6);

  const selectCheckboxes = useCallback(() => {
    selectedCategoriesData?.selectedCategories.map(({ categoryId }) => {
      checkboxes.current.map((checkboxes) => {
        if (checkboxes?.name === categoryId) {
          checkboxes.checked = true;
        }
      });
    });
  }, [selectedCategoriesData, categoriesData, categoriesData?.categories]);

  useEffect(() => {
    selectCheckboxes();
  }, [selectedCategoriesData, categoriesData, categoriesData?.categories]);

  // handling change of input
  function handleChange(categoryId: string) {
    checkboxes.current.map((elem) => {
      if (elem?.name === categoryId) {
        if (elem.checked === true) {
          elem.checked = false;
        } else {
          elem.checked = true;
        }
      }
    });
  }
  return (
    <div className=" relative mt-[78px] flex h-[658px] w-[576px] flex-col  items-center gap-[40px] rounded-[20px] border border-[#C1C1C1] p-[30px]">
      <div className="flex flex-col items-center gap-[20px]">
        <h1 className="text-[32px] font-[600] capitalize">
          Please mark your interests!
        </h1>
        <h3 className="text-center text-[20px] font-[600]">
          We will keep you notified.
        </h3>
      </div>
      <div className="flex w-[100%] flex-col gap-[20px]">
        <h3>My saved interests!</h3>
        <div className="flex w-[100%] flex-col gap-[10px]">
          {categoriesData ? (
            categoriesData?.categories.map((category) => {
              return (
                <div key={category.id} className="main">
                  <input
                    ref={(e) => {
                      checkboxes.current?.push(e);
                    }}
                    id={category.id}
                    name={category.id}
                    type="checkbox"
                  />
                  <span
                    onClick={(e) => {
                      e.preventDefault();
                      handleChange(category.id);
                      mutate({ id: category.id });
                    }}
                    ref={(e) => {}}
                    className="checkbox-container"
                  ></span>
                  <label htmlFor={category.id}>{category.name}</label>
                </div>
              );
            })
          ) : (
            <div className="flex flex-col gap-[25px]">
              <CategorySkeleton />
              <CategorySkeleton />
              <CategorySkeleton />
              <CategorySkeleton />
              <CategorySkeleton />
              <CategorySkeleton />
            </div>
          )}
        </div>
      </div>

      <PaginationController
        selectCheckboxes={selectCheckboxes}
        totalPages={totalPages}
      />
    </div>
  );
};
