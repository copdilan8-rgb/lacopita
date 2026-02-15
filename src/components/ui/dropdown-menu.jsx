"use client";

import * as React from "react";

function DropdownMenu({ children }) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="relative inline-block">
      {React.Children.map(children, child => {
        if (child.type.displayName === "DropdownMenuTrigger") {
          return React.cloneElement(child, { onClick: () => setOpen(!open) });
        }
        if (child.type.displayName === "DropdownMenuContent" && open) {
          return React.cloneElement(child, { onClose: () => setOpen(false) });
        }
        return child;
      })}
    </div>
  );
}

function DropdownMenuTrigger({ children, onClick }) {
  return (
    <button type="button" onClick={onClick} className="focus:outline-none">
      {children}
    </button>
  );
}
DropdownMenuTrigger.displayName = "DropdownMenuTrigger";

function DropdownMenuContent({ children, className = "", onClose }) {
  return (
    <div
      className={`absolute right-0 mt-2 w-40 bg-white border rounded shadow-lg z-10 ${className}`}
      tabIndex={-1}
      onBlur={onClose}
    >
      {children}
    </div>
  );
}
DropdownMenuContent.displayName = "DropdownMenuContent";

function DropdownMenuLabel({ children }) {
  return <div className="px-4 py-2 text-xs text-gray-500 font-semibold">{children}</div>;
}
DropdownMenuLabel.displayName = "DropdownMenuLabel";

function DropdownMenuSeparator() {
  return <hr className="my-1 border-gray-200" />;
}
DropdownMenuSeparator.displayName = "DropdownMenuSeparator";

function DropdownMenuItem({ children, onClick }) {
  return (
    <button
      type="button"
      className="w-full text-left px-4 py-2 hover:bg-gray-100 text-sm"
      onClick={onClick}
    >
      {children}
    </button>
  );
}
DropdownMenuItem.displayName = "DropdownMenuItem";

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
};