/**
 * Order Status Transition Manager
 * Centralized location for status transition rules and validation
 */

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

/**
 * Defines allowed status transitions for each status
 * Key: current status
 * Value: array of statuses that can be transitioned to
 */
const STATUS_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  pending: ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped: ['delivered', 'cancelled'],
  delivered: ['cancelled'], // Allow cancellation for returns/refunds
  cancelled: [], // Terminal state - no transitions allowed
};

/**
 * Status display metadata
 */
export const STATUS_METADATA: Record<OrderStatus, {
  label: string;
  color: 'success' | 'warning' | 'info' | 'danger';
  description: string;
}> = {
  pending: {
    label: 'Pending',
    color: 'warning',
    description: 'Order received, awaiting processing',
  },
  processing: {
    label: 'Processing',
    color: 'info',
    description: 'Order is being prepared',
  },
  shipped: {
    label: 'Shipped',
    color: 'info',
    description: 'Order has been shipped',
  },
  delivered: {
    label: 'Delivered',
    color: 'success',
    description: 'Order has been delivered',
  },
  cancelled: {
    label: 'Cancelled',
    color: 'danger',
    description: 'Order has been cancelled',
  },
};

/**
 * Gets the allowed status transitions for a given current status
 * @param currentStatus - The current order status
 * @returns Array of statuses that can be transitioned to
 */
export function getAllowedTransitions(currentStatus: OrderStatus): OrderStatus[] {
  return STATUS_TRANSITIONS[currentStatus] || [];
}

/**
 * Checks if a status transition is valid
 * @param currentStatus - The current order status
 * @param newStatus - The desired new status
 * @returns true if transition is allowed, false otherwise
 */
export function isValidTransition(
  currentStatus: OrderStatus,
  newStatus: OrderStatus
): boolean {
  // Same status is not a valid transition
  if (currentStatus === newStatus) {
    return false;
  }

  const allowedTransitions = getAllowedTransitions(currentStatus);
  return allowedTransitions.includes(newStatus);
}

/**
 * Validates a status transition and returns detailed result
 * @param currentStatus - The current order status
 * @param newStatus - The desired new status
 * @returns Object with valid flag and optional error message
 */
export function validateTransition(
  currentStatus: OrderStatus,
  newStatus: OrderStatus
): { valid: boolean; error?: string } {
  // Check if same status
  if (currentStatus === newStatus) {
    return {
      valid: false,
      error: 'Order is already in this status',
    };
  }

  // Check if current status is terminal
  if (isTerminalStatus(currentStatus)) {
    return {
      valid: false,
      error: `Cannot change status of a ${currentStatus} order`,
    };
  }

  // Check if transition is allowed
  if (!isValidTransition(currentStatus, newStatus)) {
    const allowedStatuses = getAllowedTransitions(currentStatus)
      .map(s => STATUS_METADATA[s].label)
      .join(', ');

    return {
      valid: false,
      error: `Cannot transition from ${STATUS_METADATA[currentStatus].label} to ${STATUS_METADATA[newStatus].label}. Allowed: ${allowedStatuses}`,
    };
  }

  return { valid: true };
}

/**
 * Gets the next status in the normal flow (excluding cancelled)
 * @param currentStatus - The current order status
 * @returns Next status in flow, or null if at end of flow
 */
export function getNextStatus(currentStatus: OrderStatus): OrderStatus | null {
  const normalFlow: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered'];
  const currentIndex = normalFlow.indexOf(currentStatus);

  // If not in normal flow or at the end, return null
  if (currentIndex === -1 || currentIndex === normalFlow.length - 1) {
    return null;
  }

  return normalFlow[currentIndex + 1];
}

/**
 * Gets the previous status in the normal flow
 * @param currentStatus - The current order status
 * @returns Previous status in flow, or null if at start
 */
export function getPreviousStatus(currentStatus: OrderStatus): OrderStatus | null {
  const normalFlow: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered'];
  const currentIndex = normalFlow.indexOf(currentStatus);

  // If not in normal flow or at the start, return null
  if (currentIndex <= 0) {
    return null;
  }

  return normalFlow[currentIndex - 1];
}

/**
 * Checks if a status is terminal (no further transitions allowed)
 * @param status - The order status to check
 * @returns true if status is terminal
 */
export function isTerminalStatus(status: OrderStatus): boolean {
  return STATUS_TRANSITIONS[status].length === 0;
}

/**
 * Checks if a status can be cancelled
 * @param status - The order status to check
 * @returns true if status can transition to cancelled
 */
export function canBeCancelled(status: OrderStatus): boolean {
  return STATUS_TRANSITIONS[status].includes('cancelled');
}

/**
 * Gets all available statuses in the system
 * @returns Array of all order statuses
 */
export function getAllStatuses(): OrderStatus[] {
  return Object.keys(STATUS_TRANSITIONS) as OrderStatus[];
}

/**
 * Gets the status transition history path from start to target
 * @param targetStatus - The target status
 * @returns Array of statuses in order from pending to target
 */
export function getStatusPath(targetStatus: OrderStatus): OrderStatus[] {
  if (targetStatus === 'cancelled') {
    return ['cancelled'];
  }

  const normalFlow: OrderStatus[] = ['pending', 'processing', 'shipped', 'delivered'];
  const targetIndex = normalFlow.indexOf(targetStatus);

  if (targetIndex === -1) {
    return [];
  }

  return normalFlow.slice(0, targetIndex + 1);
}
