import { useEffect, useRef, useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

import "../assets/dropdown.css";
import type { DiffFile, DiffResponse } from "../types/api/api-types";

type Props = {
    compareResult: DiffResponse;
    selectedBpmn: DiffFile;
    onClickItem: (fileSelected: DiffFile) => void;
};

export const DropDown: React.FC<Props> = ({ compareResult, selectedBpmn, onClickItem }) => {

  const [open, setOpen] = useState(false);
  const [dropdownTop, setDropdownTop] = useState<number |null>(0);

  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const buttonRef = useRef<HTMLDivElement | null>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);

  const toggleDropdown = () => {
    if(!buttonRef.current || !contentRef.current) return;
    if (!open) {
      const spaceRemaining =
        window.innerHeight - buttonRef.current.getBoundingClientRect().bottom;
      const contentHeight = contentRef.current.clientHeight;

      const topPosition =
        spaceRemaining > contentHeight
          ? null
          : -(contentHeight - spaceRemaining); // move up by height clipped by window
      setDropdownTop(topPosition);
    }

    setOpen((open) => !open);
  };

  useEffect(() => {
    const handler = (event : any) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setOpen(false);
      }
    };

    document.addEventListener("click", handler);

    return () => {
      document.removeEventListener("click", handler);
    };
  }, [dropdownRef]);

  return (
    <div ref={dropdownRef} className="dropdown">
      <div
        onClick={toggleDropdown}
        className={`dropdown-btn ${open ? "button-open" : null}`}
        ref={buttonRef}
      >
        {selectedBpmn.fileNameAfter}
        <span className="toggle-icon">
          {open ? <FaChevronUp /> : <FaChevronDown />}
        </span>
      </div>
      <div
        className={`dropdown-content ${open ? "content-open" : null}`}
        style={{ top: dropdownTop ? `${dropdownTop}px` : "100%" }}
        ref={contentRef}
      >
        {compareResult.map((el, i) => (
          <div 
            className="dropdown-item" 
            onClick={() => onClickItem(el)} 
            key={`dropdown-item-${i}`}
          >
            {el.fileNameAfter}
          </div>
        ))}
      </div>
    </div>
  );
};