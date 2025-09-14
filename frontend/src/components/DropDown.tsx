import { useRef, useState } from "react";
import { FaChevronDown, FaChevronUp } from "react-icons/fa";

import "../assets/dropdown.css";
import type { ChangeType, DiffFile, DiffResponse } from "../types/api/api-types";
import { FiEdit3, FiMinus, FiPlus } from "react-icons/fi";

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

  const getIconChangeType = (changeType: ChangeType) => {
    switch (changeType) {
      case "ADDED":
        return <FiPlus className="icon-added"/>;
      case "DELETED":
        return <FiMinus className="icon-deleted"/>;
      case "UPDATED":
        return <FiEdit3 className="icon-updated"/>;
      default:
        return null;
    }
  };

  return (
    <div 
      ref={dropdownRef} 
      className="dropdown"
    >
      <div
        className={`dropdown-btn ${open ? "button-open" : null}`}
        ref={buttonRef}
        onClick={toggleDropdown}
      >
        {getIconChangeType(selectedBpmn.changeType)}
        {selectedBpmn.fileNameAfter}
        {open 
          ? <FaChevronUp className={`toggle-icon icon-${selectedBpmn.changeType.toLowerCase()}`} /> 
          : <FaChevronDown className={`toggle-icon icon-${selectedBpmn.changeType.toLowerCase()}`}/>
        }
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
            {getIconChangeType(el.changeType)}
            {el.fileNameAfter}
          </div>
        ))}
      </div>
    </div>
  );
};