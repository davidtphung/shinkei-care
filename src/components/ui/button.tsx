import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import type { ButtonHTMLAttributes } from 'react'
import { usePressed } from '@/hooks/usePressed.ts'
import { cn } from '@/lib/utils.ts'

const buttonVariants = cva(
  'hit-target pressable spring inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-full px-5 py-3 text-base font-semibold leading-none disabled:pointer-events-none disabled:opacity-50 sm:min-h-12',
  {
    variants: {
      variant: {
        primary: 'bg-accent text-navy',
        navy: 'bg-navy text-cream',
        cream: 'bg-cream text-navy',
        outline: 'border-2 border-navy bg-cream text-navy',
        ghost: 'bg-transparent text-cream',
      },
    },
    defaultVariants: {
      variant: 'primary',
    },
  },
)

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }

export function Button({
  className,
  variant,
  asChild = false,
  type = 'button',
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : 'button'
  const { pressed, pressProps } = usePressed()

  return (
    <Comp
      className={cn(buttonVariants({ variant }), className)}
      data-pressed={pressed ? 'true' : 'false'}
      type={asChild ? undefined : type}
      {...pressProps}
      {...props}
    />
  )
}
