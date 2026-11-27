export type TaskStatus = "active" | "completed" | "failed";
export interface Task {
  id: string; user_id: string; title: string; task_type: "small" | "long"; label: string; assigned_by: string;
  description: string; deadline: string | null; status: TaskStatus; progress: number; completed_at: string | null; created_at: string;
}
export interface TaskProgress { id: string; task_id: string; entry_date: string; description: string; progress: number; created_at: string }
export interface DiaryEntry { id: string; title: string; body: string; mood: string; entry_date: string; created_at: string }
export interface Activity { id: string; kind: string; source_key: string; title: string; entry_date: string; created_at: string }
export interface Habit { id: string; name: string; emoji: string; frequency: "daily" | "weekly" | "monthly"; detail: string; created_at: string }
export interface HabitCheckin { id: string; habit_id: string; period_key: string; created_at: string }
export interface Journey { id: string; feeling: string; emoji: string; intensity: number; reflection: string; entry_date: string; created_at: string }
export interface MediaItem { id: string; title: string; description: string; category: string; file_path: string; mime_type: string; size_bytes: number; created_at: string }
export interface Memory { id: string; title: string; memory_date: string; caption: string; storage_path: string | null; media_id: string | null; created_at: string }
export interface Recipe { id: string; name: string; category: string; ingredients: string; steps: string; image_path: string | null; created_at: string }
export interface Collection { id: string; name: string; category: string; description: string; image_path: string | null; media_id: string | null; rating: number; created_at: string }
export interface CalEvent { id: string; title: string; event_date: string; start_time: string | null; details: string; task_id: string | null; created_at: string }
export interface KnowledgeCard { id: string; title: string; body: string; category: string; tags: string[]; links: string[]; related_ids: string[]; task_id: string | null; created_at: string; updated_at: string }
export interface GameScore { id: string; game: string; difficulty: string; score: number; created_at: string }
export interface Profile {
  user_id: string; display_name: string; avatar_path: string | null; background_path: string | null;
  pin_hash: string | null; pin_salt: string | null; theme: Partial<ThemeSettings>; widgets: WidgetPref[];
}
export interface ThemeSettings { preset: string; g1: string; g2: string; g3: string; g4: string; accent: string; glass: number; density: "cozy" | "comfortable" | "spacious"; decorations: boolean; reduceMotion: boolean }
export interface WidgetPref { id: string; visible: boolean }
