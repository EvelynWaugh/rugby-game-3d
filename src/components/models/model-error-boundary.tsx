import { Component, type ReactNode } from 'react'

interface ModelErrorBoundaryProps {
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

  render() {
    if (this.state.hasError) return this.props.fallback
    return this.props.children
  }
}
