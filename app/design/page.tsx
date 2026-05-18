'use client'
export default function DesignPage() {
  if (typeof window !== 'undefined') {
    window.location.replace('/design.html')
  }
  return null
}