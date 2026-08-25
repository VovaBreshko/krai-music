import { createContext, useContext } from 'react'

type LayoutContextValue = {
  /** Когда true — Layout убирает padding и ограничение ширины у main/container */
  fullBleed: boolean
  setFullBleed: (value: boolean) => void
}

const LayoutContext = createContext<LayoutContextValue>({
  fullBleed: false,
  setFullBleed: () => {},
})

export function useLayoutContext() {
  return useContext(LayoutContext)
}

export default LayoutContext
