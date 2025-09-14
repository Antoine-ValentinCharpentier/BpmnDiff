import { BiLogOut } from "react-icons/bi";
import { useAuth } from "../context/AuthContext";
import type { DiffFile, DiffResponse } from "../types/api/api-types";
import { DropDown } from "./DropDown";

import '../assets/styles/components/header.css';

type Props = {
    compareResult: DiffResponse;
    selectedBpmn: DiffFile;
    onClickNewBpmn: (selectedFile: DiffFile) => void;
};

export const Header: React.FC<Props> = ({ compareResult, selectedBpmn, onClickNewBpmn }) => {
    const { userInfo, logout } = useAuth();

    console.log(userInfo);

    return (
        <div className={`header header-${selectedBpmn.changeType.toLowerCase()}`}>
            <DropDown compareResult={compareResult} selectedBpmn={selectedBpmn} onClickItem={onClickNewBpmn}/>

            <p className="title">
                {selectedBpmn.fileNameBefore !== selectedBpmn.fileNameAfter
            ? `${selectedBpmn.fileNameBefore} -> ${selectedBpmn.fileNameAfter}`
            : selectedBpmn.fileNameAfter}
            </p>

            <BiLogOut onClick={logout} title="Se déconnecter" className="logout"/>
        </div>
    );
};