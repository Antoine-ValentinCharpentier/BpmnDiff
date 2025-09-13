import { RiLogoutBoxRFill } from "react-icons/ri";
import { useAuth } from "../context/AuthContext";
import type { DiffFile, DiffResponse } from "../types/api/api-types";
import { DropDown } from "./DropDown";

type Props = {
    compareResult: DiffResponse;
    selectedBpmn: DiffFile;
    onClickNewBpmn: (selectedFile: DiffFile) => void;
};

export const Header: React.FC<Props> = ({ compareResult, selectedBpmn, onClickNewBpmn }) => {
    const { userInfo, logout } = useAuth();

    console.log(userInfo);

    return (
        <div className="header">
            <DropDown compareResult={compareResult} selectedBpmn={selectedBpmn} onClickItem={onClickNewBpmn}/>

            {selectedBpmn.fileNameBefore !== selectedBpmn.fileNameAfter
            ? `${selectedBpmn.fileNameBefore} -> ${selectedBpmn.fileNameAfter}`
            : selectedBpmn.fileNameAfter}

            <RiLogoutBoxRFill onClick={logout} title="Se déconnecter"/>
        </div>
    );
};