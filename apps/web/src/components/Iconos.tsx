type Props = {
  className?: string;
};

function base(className: string | undefined, children: React.ReactNode[]) {
  return (
    <svg
      className={className}
      width="16"
      height="16"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

export function IconoCalendario({ className = "h-4 w-4" }: Props) {
  return base(className, [
    <rect key="c" x="3" y="4" width="18" height="18" rx="2" />,
    <line key="a" x1="16" y1="2" x2="16" y2="6" />,
    <line key="b" x1="8" y1="2" x2="8" y2="6" />,
    <line key="d" x1="3" y1="10" x2="21" y2="10" />,
  ]);
}

export function IconoChevron({ className = "h-4 w-4" }: Props) {
  return base(className, [<polyline key="p" points="6 9 12 15 18 9" />]);
}

export function IconoLupa({ className = "h-4 w-4" }: Props) {
  return base(className, [
    <circle key="c" cx="11" cy="11" r="8" />,
    <line key="l" x1="21" y1="21" x2="16.65" y2="16.65" />,
  ]);
}

export function IconoCheck({ className = "h-3.5 w-3.5" }: Props) {
  return base(className, [<polyline key="p" points="20 6 9 17 4 12" />]);
}

export function IconoFlecha({ className = "h-4 w-4" }: Props) {
  return base(className, [
    <line key="l" x1="5" y1="12" x2="19" y2="12" />,
    <polyline key="p" points="12 5 19 12 12 19" />,
  ]);
}