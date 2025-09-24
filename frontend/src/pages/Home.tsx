import { useEffect, useState } from 'react'
import { getCompareResult } from '../api/rest-service'
import type { DiffFile, DiffResponse } from '../types/api/api-types'
import { BpmnViewerCompare } from '../components/BpmnViewerCompare'

import { Header } from '../components/Header'
import "../assets/styles/global/layout.css";
import LoadingPage from './LoadingPage'
import { useLocation, useNavigate, useParams } from 'react-router-dom'

export default function Home() {
  const { projectId } = useParams();

  const { search } = useLocation();
  const params = new URLSearchParams(search);

  const navigate = useNavigate();

  const [compareResult, setCompareResult] = useState<DiffResponse | null>(null)
  const [selectedBpmn, setSelectedBpmn] = useState<DiffFile | null>(null);

  const fetchCompareResult = async (id: string, params: URLSearchParams) => {
    try {       
      const resultAPI = await getCompareResult(id, params);
      setCompareResult(resultAPI);
      const firstDiffFile: DiffFile | null = resultAPI[0] ?? null;
      setSelectedBpmn(firstDiffFile);
    } catch (error) {
      console.error(error);
      navigate("/not-found");
    }
  };

  useEffect(() => {

    function isNotBlank(str: string | null) {
      return str != null && str.trim() !== "";
    }

    const from = params.get("from");
    const to = params.get("to");
    const mode = params.get("mode");
    const branch = params.get("branch");
    const baseBranch = params.get("baseBranch");
    
    const multiMode = isNotBlank(from) && isNotBlank(to) && isNotBlank(mode) && from!=to;
    const singleMode = isNotBlank(branch) && isNotBlank(baseBranch) && branch!=baseBranch;

    if(!projectId || (!multiMode && !singleMode)) {
      navigate("/not-found");
      return;
    }else {
      fetchCompareResult(projectId, params);  
    }
  }, []);

  if(!selectedBpmn || !compareResult) {
    return <LoadingPage/>
  }

  return (
    <>
      
      <div className='container'>
        <Header compareResult={compareResult} selectedBpmn={selectedBpmn} onClickNewBpmn={setSelectedBpmn}/>
        <BpmnViewerCompare
          xmlBefore={selectedBpmn.xmlBefore}
          xmlAfter={selectedBpmn.xmlAfter}
          prefix={`bpmn`}
          isManualMode={false}
          key={`bpmn`}
        />
      </div>
    </>
  )
}
