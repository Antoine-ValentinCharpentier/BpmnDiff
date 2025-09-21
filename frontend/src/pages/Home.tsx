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

  useEffect(() => {
    const fetchCompareResult = async (id: string | undefined, params: URLSearchParams) => {
      try {
        if(!id || !params ) {
          // navigate("/not-found");
          console.log("test")
          return;
        }
       
        if(!id) return;
        // projectId = 73848940
        const resultAPI = await getCompareResult(id, params);
        setCompareResult(resultAPI);
        const firstDiffFile: DiffFile | null = resultAPI[0] ?? null;
        setSelectedBpmn(firstDiffFile);
      } catch (error) {
        console.error(error);
        console.log("la")
        navigate("/not-found");
      }
    };
    fetchCompareResult(projectId, params);  
    
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
