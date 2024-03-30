//   background-image: ;
export const CategorySkeleton = () => {
  return (
    <div className="flex items-center gap-[25px]">
      <div className="h-[25px] w-[25px] rounded-[6px] bg-[#CCCCCC]"></div>
      <div
        className="h-[25px] w-[150px] rounded-[6px] bg-[#CCCCCC]"
        style={{
          backgroundImage:
            "linear-gradient(to right, #d9d9d9 0%, rgba(0,0,0,0.05) 20%, #d9d9d9 40%, #d9d9d9 100%)",
          animation: "shimmer 5s linear infinite",
        }}
      ></div>
    </div>
  );
};
