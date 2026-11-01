import { BadgeCheck, CircleCheck, CircleX, Clock3 } from 'lucide-react'

const STATUS_META = {
  Pending: { icon: Clock3, className: 'pending' },
  Confirmed: { icon: BadgeCheck, className: 'confirmed' },
  Completed: { icon: CircleCheck, className: 'completed' },
  Cancelled: { icon: CircleX, className: 'cancelled' },
}

function StatusBadge({ status }) {
  const meta = STATUS_META[status] || STATUS_META.Pending
  const Icon = meta.icon

  return (
    <span className={`status-badge status-${meta.className}`}>
      <Icon size={13} strokeWidth={2.4} />
      {status}
    </span>
  )
}

export default StatusBadge
