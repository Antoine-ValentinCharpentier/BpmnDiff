import { useEffect, useState } from 'react'
import { getCompareResult } from '../api/rest-service'
import type { DiffFile, DiffResponse } from '../types/api/api-types'
import { BpmnViewerCompare } from '../components/BpmnViewerCompare'

import { Header } from '../components/Header'
import "../assets/layout.css";

export default function Home() {

  const [compareResult, setCompareResult] = useState<DiffResponse | null>(null)

  const [selectedBpmn, setSelectedBpmn] = useState<DiffFile | null>(null);

  useEffect(() => {
    const fetchCompareResult = async () => {
      try {
        const res = await getCompareResult("73848940", "main", "dev");
        setCompareResult(res);

        const firstDiffFile: DiffFile | null = res[0] ?? null;

        setSelectedBpmn(firstDiffFile);
      } catch (error) {
        console.error(error);
      }
    };

    fetchCompareResult();
  }, []);

  if(!selectedBpmn || !compareResult) {
    // TODO : Loading page
    return <></>
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
