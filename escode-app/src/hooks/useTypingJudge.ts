import { useMemo, useState } from 'react'
import type { TypedChar } from '../types'

type UseTypingJudgeArgs = {
  expectedText: string
  initialValue: string
}

type JudgeResult = {
  typedText: string
  typedChars: TypedChar[]
  currentIndex: number
  accuracy: number
  mismatchIndexes: number[]
  pushInput: (char: string) => void
  backspace: () => void
  reset: (value: string) => void
}

const buildInitial = (initialValue: string, expectedText: string): TypedChar[] =>
  initialValue.split('').map((char, index) => ({
    char,
    correct: char === (expectedText[index] ?? ''),
  }))

export const useTypingJudge = ({
  expectedText,
  initialValue,
}: UseTypingJudgeArgs): JudgeResult => {
  const [typedChars, setTypedChars] = useState<TypedChar[]>(
    buildInitial(initialValue, expectedText),
  )

  const typedText = useMemo(
    () => typedChars.map((item) => item.char).join(''),
    [typedChars],
  )

  const mismatchIndexes = useMemo(
    () =>
      typedChars
        .map((item, index) => (item.correct ? -1 : index))
        .filter((index) => index >= 0),
    [typedChars],
  )

  const accuracy = useMemo(() => {
    if (typedChars.length === 0) {
      return 100
    }
    const correctCount = typedChars.filter((item) => item.correct).length
    return (correctCount / typedChars.length) * 100
  }, [typedChars])

  const pushInput = (char: string) => {
    setTypedChars((prev) => {
      const expectedChar = expectedText[prev.length] ?? ''
      return [...prev, { char, correct: char === expectedChar }]
    })
  }

  const backspace = () => {
    setTypedChars((prev) => prev.slice(0, -1))
  }

  const reset = (value: string) => {
    setTypedChars(buildInitial(value, expectedText))
  }

  return {
    typedText,
    typedChars,
    currentIndex: typedChars.length,
    accuracy,
    mismatchIndexes,
    pushInput,
    backspace,
    reset,
  }
}
