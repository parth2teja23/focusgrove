export interface Task {
  id: string;
  user_id: string;
  name: string;
  duration_minutes: number | null;
  date: string; // ISO date format (YYYY-MM-DD)
  done: boolean;
  carried_from: string | null;
  timer_left_seconds: number | null;
  created_at: string;
}

export interface Profile {
  id: string;
  username: string | null;
  xp: number;
  streak: number;
  last_active_date: string | null;
  created_at: string;
}

export interface TimerState {
  isRunning: boolean;
  secondsLeft: number;
  initialDuration: number;
}
