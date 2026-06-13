export default function LoadingSpinner({ size = 'md' }) {
  const sizeMap = { sm: 'w-4 h-4 border-2', md: 'w-8 h-8 border-2', lg: 'w-12 h-12 border-3' }
  return (
    <div className={`${sizeMap[size]} border-violet-200 border-t-violet-600 rounded-full animate-spin`} />
  )
}
