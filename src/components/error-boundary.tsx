'use client'

import { Component, ErrorInfo, ReactNode } from 'react'
import { useTranslations } from 'next-intl'

interface Props {
  children?: ReactNode
}

interface State {
  hasError: boolean
}

function ErrorFallback({ onReset }: { onReset: () => void }) {
  const t = useTranslations('errors')
  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-xl font-semibold mb-2">{t('somethingWentWrong')}</h2>
        <button
          className="text-[#ff2828] hover:underline"
          onClick={onReset}
        >
          {t('tryAgain')}
        </button>
      </div>
    </div>
  )
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  }

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo)
  }

  public render() {
    if (this.state.hasError) {
      return <ErrorFallback onReset={() => this.setState({ hasError: false })} />
    }

    return this.props.children
  }
}
