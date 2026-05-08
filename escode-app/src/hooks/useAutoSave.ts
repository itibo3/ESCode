import { useEffect } from 'react'

type UseAutoSaveArgs = {
  value: string
  onSave: (value: string) => void | Promise<void>
  delayMs?: number
}

export const useAutoSave = ({
  value,
  onSave,
  delayMs = 1000,
}: UseAutoSaveArgs): void => {
  useEffect(() => {
    const id = window.setTimeout(() => {
      void onSave(value)
    }, delayMs)

    return () => {
      window.clearTimeout(id)
    }
  }, [delayMs, onSave, value])
}
