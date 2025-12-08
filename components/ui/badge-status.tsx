import { cn } from "@/lib/utils"

type StatusType =
  | "pending"
  | "active"
  | "completed"
  | "paid"
  | "overdue"
  | "declined"
  | "expired"
  | "sent"
  | "accepted"
  | "failed"

interface BadgeStatusProps {
  status: StatusType
  className?: string
}

const statusStyles: Record<StatusType, string> = {
  pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
  active: "bg-green-100 text-green-800 border-green-200",
  completed: "bg-blue-100 text-blue-800 border-blue-200",
  paid: "bg-green-100 text-green-800 border-green-200",
  overdue: "bg-red-100 text-red-800 border-red-200",
  declined: "bg-gray-100 text-gray-800 border-gray-200",
  expired: "bg-gray-100 text-gray-800 border-gray-200",
  sent: "bg-blue-100 text-blue-800 border-blue-200",
  accepted: "bg-green-100 text-green-800 border-green-200",
  failed: "bg-red-100 text-red-800 border-red-200",
}

export function BadgeStatus({ status, className }: BadgeStatusProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize",
        statusStyles[status],
        className,
      )}
    >
      {status}
    </span>
  )
}
