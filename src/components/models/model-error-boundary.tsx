import { Component, type ReactNode } from 'react'

interface ModelErrorBoundaryProps {
  onError?: (error: Error) => void
  fallback: ReactNode
  children: ReactNode
}

interface ModelErrorBoundaryState {
  hasError: boolean
}

export class ModelErrorBoundary extends Component<ModelErrorBoundaryProps, ModelErrorBoundaryState> {
  constructor(props: ModelErrorBoundaryProps) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error: Error) {
    this.props.onError?.(error)
  }

  render() {
    if (this.state.hasError) return this.props.fallback
    return this.props.children
  }
}
