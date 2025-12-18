import { NextResponse } from 'next/server'

export class ValidationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'ValidationError'
  }
}

export function badRequest(message: string) {
  return NextResponse.json(
    {
      message,
      error: {
        code: 400,
        message: 'Bad Request',
      },
    },
    { status: 400 },
  )
}

export function internalError(message?: string) {
  const finalMessage = message && message.trim().length > 0 ? message : 'Internal Server Error'
  return NextResponse.json(
    {
      message: finalMessage,
      error: {
        code: 500,
        message: finalMessage,
      },
    },
    { status: 500 },
  )
}
