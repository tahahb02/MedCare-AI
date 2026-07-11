const urgencyStyles = {
  routine: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
  normal: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
  urgent: 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400',
  très_urgent: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
  critique: 'bg-red-600 text-white dark:bg-red-700 dark:text-red-100',
};

const urgencyLabels = {
  routine: 'Routine',
  normal: 'Normal',
  urgent: 'Urgent',
  très_urgent: 'Très urgent',
  critique: 'Critique',
};

export default function UrgencyBadge({ level = 'normal' }) {
  const style = urgencyStyles[level] || urgencyStyles.normal;
  const label = urgencyLabels[level] || level;

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${style}`}>
      {label}
    </span>
  );
}
