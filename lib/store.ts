import { create } from 'zustand'

export interface ColInfo {
  name: string
  idx: number
}

export interface DataStore {
  file: File | null
  headers: string[]
  selCols: ColInfo[]
  data: Record<string, string[]>
  rows: Record<string, string>[]
  totalRows: number
  isLoading: boolean
  loadProgress: number
  loadTitle: string
  loadInfo: string
  setFile: (f: File | null) => void
  setHeaders: (h: string[]) => void
  setSelCols: (c: ColInfo[]) => void
  setData: (d: Record<string, string[]>) => void
  setRows: (r: Record<string, string>[]) => void
  setTotalRows: (n: number) => void
  setLoading: (v: boolean) => void
  setProgress: (pct: number, title: string, info: string) => void
  reset: () => void
}

const initialState = {
  file: null,
  headers: [],
  selCols: [],
  data: {},
  rows: [],
  totalRows: 0,
  isLoading: false,
  loadProgress: 0,
  loadTitle: '',
  loadInfo: '',
}

export const useStore = create<DataStore>()((set) => ({
  ...initialState,
  setFile:      (file)                              => set({ file }),
  setHeaders:   (headers)                           => set({ headers }),
  setSelCols:   (selCols)                           => set({ selCols }),
  setData:      (data)                              => set({ data }),
  setRows:      (rows)                              => set({ rows }),
  setTotalRows: (totalRows)                         => set({ totalRows }),
  setLoading:   (isLoading)                         => set({ isLoading }),
  setProgress:  (loadProgress, loadTitle, loadInfo) => set({ loadProgress, loadTitle, loadInfo }),
  reset:        ()                                  => set({ ...initialState }),
}))
