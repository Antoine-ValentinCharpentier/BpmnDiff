import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { getCompareResult } from '../api/rest-service'
import type { DiffResponse } from '../types/api/api-types'
import { BpmnViewerCompare } from '../components/BpmnViewerCompare'

export default function Home() {
  const { userInfo, logout } = useAuth()

  const [compareResult, setCompareResult] = useState<DiffResponse | null>(null)

  useEffect(() => {
    getCompareResult("73848940", "main", "dev").then(setCompareResult).catch(console.error)
  }, [])
  console.log(compareResult)
  return (
    <div>
      <h1>Home</h1>
      <p>Bienvenue, {userInfo?.preferred_username}</p>
      <button onClick={logout}>Se déconnecter</button>
      <h1>Added</h1>
      {compareResult?.added?.map((result, index) => (
        <BpmnViewerCompare
          xmlBefore={result.xmlBefore}
          xmlAfter={result.xmlAfter}
          prefix={`bpmn-added-${index}`}
          isManualMode={false}
          key={`bpmn-added-${index}`}
        />
      ))}
      <h1>Updated</h1>
      {compareResult?.updated?.map((result, index) => (
        <BpmnViewerCompare
          xmlBefore={result.xmlBefore}
          xmlAfter={result.xmlAfter}
          prefix={`bpmn-updated-${index}`}
          isManualMode={false}
          key={`bpmn-updated-${index}`}
        />
      ))}
      <h1>Deleted</h1>
      {compareResult?.deleted?.map((result, index) => (
        <BpmnViewerCompare
          xmlBefore={result.xmlBefore}
          xmlAfter={result.xmlAfter}
          prefix={`bpmn-deleted-${index}`}
          isManualMode={false}
          key={`bpmn-deleted-${index}`}
        />
      ))}
    </div>
  )
}
