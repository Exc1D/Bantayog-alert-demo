const VARIANTS = {
  primary: 'bg-secondary text-white hover:bg-blue-800 focus:ring-blue-300',
  secondary: 'bg-white text-text border-2 border-border hover:bg-gray-50 focus:ring-gray-300',
  danger: 'bg-danger text-white hover:bg-red-600 focus:ring-red-300',
  success: 'bg-success text-white hover:bg-emerald-600 focus:ring-emerald-300',
  warning: 'bg-warning text-white hover:bg-amber-600 focus:ring-amber-300',
  ghost: 'text-textLight hover:text-text hover:bg-gray-100'
};

const SIZES = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base'
};

export default function Button({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  className = '',
  onClick,
  type = 'button',
  ...props
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        inline-flex items-center justify-center gap-2 rounded-lg font-semibold
        transition-all duration-200 focus:outline-none focus:ring-2
        disabled:opacity-50 disabled:cursor-not-allowed
        ${VARIANTS[variant]}
        ${SIZES[size]}
        ${className}
      `}
      {...props}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </button>
  );
}
