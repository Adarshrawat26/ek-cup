import * as React from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: 'default' | 'ghost' | 'outline' | 'secondary';
  size?: 'default' | 'sm' | 'lg' | 'icon';
}

const buttonVariants: Record<NonNullable<ButtonProps['variant']>, string> = {
  default: 'bg-brand-500 text-white shadow-warm hover:bg-brand-600',
  ghost: 'bg-transparent hover:bg-secondary',
  outline: 'border border-border bg-background hover:bg-secondary',
  secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
};

const buttonSizes: Record<NonNullable<ButtonProps['size']>, string> = {
  default: 'h-11 px-5 py-2.5',
  sm: 'h-9 px-3.5 text-sm',
  lg: 'h-12 px-6 text-base',
  icon: 'h-10 w-10'
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { className, variant = 'default', size = 'default', asChild = false, children, ...props },
  ref
) {
  const classNames = cn(
    'inline-flex items-center justify-center gap-2 rounded-full font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50',
    buttonVariants[variant],
    buttonSizes[size],
    className
  );

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children as React.ReactElement, {
      ref,
      className: cn(classNames, (children as any).props.className),
      ...props
    });
  }

  return (
    // eslint-disable-next-line react/button-has-type
    <button ref={ref} className={classNames} {...props}>
      {children}
    </button>
  );
});