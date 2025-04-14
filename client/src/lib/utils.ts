import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format date as MMM DD, YYYY
export function formatDate(date: Date | string | number): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}

// Format time as HH:MM AM/PM
export function formatTime(date: Date | string | number): string {
  const d = new Date(date);
  return d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true
  });
}

// Format date range for display
export function formatDateRange(start: Date | string | number, end: Date | string | number): string {
  const startDate = new Date(start);
  const endDate = new Date(end);
  
  // If same day, just show the time range
  if (startDate.toDateString() === endDate.toDateString()) {
    return `${formatDate(startDate)} ${formatTime(startDate)} - ${formatTime(endDate)}`;
  }
  
  // Otherwise show the full date range
  return `${formatDate(startDate)} ${formatTime(startDate)} - ${formatDate(endDate)} ${formatTime(endDate)}`;
}

// Get formatted duration (e.g., "2.5 hrs")
export function formatDuration(hours: number): string {
  return `${hours.toFixed(1)} hrs`;
}

// Calculate if a date is today, tomorrow, or a future date
export function getRelativeDay(date: Date | string): 'Today' | 'Tomorrow' | string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const compareDate = new Date(date);
  compareDate.setHours(0, 0, 0, 0);
  
  if (compareDate.getTime() === today.getTime()) {
    return 'Today';
  } else if (compareDate.getTime() === tomorrow.getTime()) {
    return 'Tomorrow';
  } else {
    return formatDate(date);
  }
}

// Format instructor name
export function formatInstructorName(firstName: string, lastName: string): string {
  return `${firstName} ${lastName}`;
}

// Calculate flight hours percentages
export function calculateHoursPercentage(current: number, required: number): number {
  return Math.min(Math.round((current / required) * 100), 100);
}
