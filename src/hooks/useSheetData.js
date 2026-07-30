import { useEffect, useState, useCallback } from 'react'
import { fetchAllSheets } from '../utils/googleSheets'

const SHEET_ID_DEFAULT = '1vh1yICf0YZQInnpH16-vANtmiOxfRkvgJBGk78PysSo'
const REFRESH_INTERVAL = 5 * 60 * 1000

export const getSheetId = () => new URLSearchParams(window.location.search).get('sheet') || SHEET_ID_DEFAULT

async function fetchAndProcess(sheetId, setData, setLoading, setError) {
  setLoading(true)
  setError(null)
  try {
    const { ventas, metricas, tally } = await fetchAllSheets(sheetId)
    setData({ ventas, metricas, tally, updatedAt: new Date() })
  } catch (err) {
    setError(err.message || 'Error desconocido al leer Google Sheets')
  } finally {
    setLoading(false)
  }
}

export function useSheetData() {
  const [sheetId, setSheetId] = useState(getSheetId())
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    const onPopState = () => setSheetId(getSheetId())
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  useEffect(() => {
    fetchAndProcess(sheetId, setData, setLoading, setError)
    const interval = setInterval(() => fetchAndProcess(sheetId, setData, setLoading, setError), REFRESH_INTERVAL)
    return () => clearInterval(interval)
  }, [sheetId])

  const refetch = useCallback(() => fetchAndProcess(sheetId, setData, setLoading, setError), [sheetId])

  return { data, loading, error, sheetId, refetch }
}
