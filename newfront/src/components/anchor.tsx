import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

type AnchorProps = {
  href: string;
  className?: string;
  activeClassName?: string;
  disabled?: boolean;
  children: React.ReactNode;
};

export default function Anchor({
  href,
  className,
  activeClassName,
  disabled,
  children,
}: AnchorProps) {
  const { pathname } = useLocation();
  // Match: exact pathname or pathname matches the base path (for parent routes)
  const basePath = href.replace(/\/$/, ""); // Remove trailing slash
  const pathNameClean = pathname.replace(/\/$/, "");
  
  // Exact match or this is a parent of current path
  const isActive = pathNameClean === basePath;

  if (disabled) {
    return (
      <div className={cn(className, "cursor-not-allowed opacity-50")}>
        {children}
      </div>
    );
  }

  return (
    <Link
      to={href}
      className={cn(className, isActive && activeClassName)}
    >
      {children}
    </Link>
  );
}
