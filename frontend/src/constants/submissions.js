
export const STATUS_MAP = {
  "ACCEPTED": { label: 'Accepted', color: 'green' },
  "EVALUATING": { label: 'Evaluating', color: 'orange' },
  "EVALUATED": { label: 'Evaluated', color: 'gray' },
};

export const OUTCOME_MAP = {
  "PASSED": { label: 'Passed', color: 'green', icon: '✔', isPass: true },
  "FAILED": { label: 'Failed', color: 'red', icon: '✖', isPass: false },
  "COMP_ERR": { label: 'Compilation error', color: 'red', icon: '✖', isPass: false },
  "TIMEOUT": { label: 'Timeout', color: 'red', icon: '✖', isPass: false },
  "INT_SERV_ERR": { label: 'Server error', color: 'red', icon: '✖', isPass: false },
};

export function statusLabel(status) {
  return STATUS_MAP[status]?.label || status || 'Unknown';
}

export function outcomeInfo(outcome) {
  if (!outcome) return { label: '-', color: 'gray', icon: '✖', isPass: false };
  return OUTCOME_MAP[outcome] || { label: outcome, color: 'red', icon: '✖', isPass: false };
}
