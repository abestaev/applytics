import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface UserSettings {
  dailyGoal: number;
}

const DAILY_GOAL_KEY = 'applytics.dailyGoal';

export function useUserSettings() {
  const [dailyGoal, setDailyGoalState] = useState<number>(() => {
    const saved = Number(localStorage.getItem(DAILY_GOAL_KEY));
    return Number.isFinite(saved) && saved > 0 ? saved : 3;
  });

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) return;
      supabase
        .from('user_settings')
        .select('daily_goal')
        .eq('user_id', data.user.id)
        .maybeSingle()
        .then(({ data: row }) => {
          if (row?.daily_goal) {
            setDailyGoalState(row.daily_goal);
            localStorage.setItem(DAILY_GOAL_KEY, String(row.daily_goal));
          }
        });
    });
  }, []);

  const setDailyGoal = async (value: number) => {
    setDailyGoalState(value);
    localStorage.setItem(DAILY_GOAL_KEY, String(value));
    const { data } = await supabase.auth.getUser();
    if (!data.user) return;
    await supabase.from('user_settings').upsert({
      user_id: data.user.id,
      daily_goal: value,
      updated_at: new Date().toISOString(),
    });
  };

  return { dailyGoal, setDailyGoal } satisfies UserSettings & { setDailyGoal: (v: number) => Promise<void> };
}
