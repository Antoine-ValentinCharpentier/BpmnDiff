import { useEffect, useState } from 'react'
import { getCompareResult } from '../api/rest-service'
import type { DiffFile, DiffResponse } from '../types/api/api-types'
import { BpmnViewerCompare } from '../components/BpmnViewerCompare'

import { Header } from '../components/Header'
import "../assets/styles/global/layout.css";
import LoadingPage from './LoadingPage'
import { useLocation, useNavigate } from 'react-router-dom'

export default function Home() {
  const { search } = useLocation();
  const navigate = useNavigate();

  const [compareResult, setCompareResult] = useState<DiffResponse | null>(null)
  const [selectedBpmn, setSelectedBpmn] = useState<DiffFile | null>(null);

  useEffect(() => {
    const fetchCompareResult = async () => {
      const params = new URLSearchParams(search);
      const from = params.get("from");
      const to = params.get("to");
      const branch = params.get("branch");
      try {
        if(!(from && to) || !branch) {
          navigate("/not-found");
          return;
        }
        const resultAPI = await getCompareResult("73848940", from, to, branch);
        setCompareResult(resultAPI);
        const firstDiffFile: DiffFile | null = resultAPI[0] ?? null;
        setSelectedBpmn(firstDiffFile);
      } catch (error) {
        console.error(error);
        navigate("/not-found");
      }
    };

    fetchCompareResult();
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
