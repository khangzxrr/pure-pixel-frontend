import type { ReactNode } from "react";

type BlogNavProps = {
  // accepted from callers but not used here
  toggleSidebar?: () => void;
  activeIcon?: ReactNode;
  activeTitle?: ReactNode;
  // accepted from callers but not used here
  activeQuote?: ReactNode;
};

const BlogNav = ({ activeIcon, activeTitle }: BlogNavProps) => {
  return (
    <div className="relative flex items-center justify-between  space-x-4 w-full">
      <div className="relative flex items-center space-x-4">
        <div className="flex gap-2 items-center lg:items-end">
          <div className="flex items-center gap-2 pr-4   border-r-[1px] border-[#777777]">
            <div className="text-2xl pl-2">{activeIcon || "#"}</div>
            <div className="hidden lg:block">{activeTitle}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogNav;
