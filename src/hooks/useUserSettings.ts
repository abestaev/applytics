import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

const DAILY_GOAL_KEY = 'applytics.dailyGoal';
const DEFAULT_DAILY_GOAL = 3;

function clampDailyGoal(value: number) {
  return Math.max(1, Math.min(1000, Math.round(value || DEFAULT_DAILY_GOAL)));
}

function readCachedDailyGoal() {
  const saved = Number(localStorage.getItem(DAILY_GOAL_KEY));
  return Number.isFinite(saved) && saved > 0 ? clampDailyGoal(saved) : DEFAULT_DAILY_GOAL;
}

export function useUserSettings() {
  const [dailyGoal, setDailyGoalState] = useState<number>(readCachedDailyGoal);

  const applyDailyGoal = (value: number) => {
    const safe = clampDailyGoal(value);
    setDailyGoalState(safe);
    localStorage.setItem(DAILY_GOAL_KEY, String(safe));
    return safe;
  };

  useEffect(() => {
    let active = true;
    let channel: ReturnType<typeof supabase.channel> | undefined;

    supabase.auth.getSession().then(async ({ data }) => {
      const userId = data.session?.user?.id;
      if (!userId) return;

      const { data: row, error } = await supabase
        .from('user_settings')
        .select('daily_goal')
        .eq('user_id', userId)
        .maybeSingle();

      if (error) {
        console.error('useUserSettings fetch:', error.message);
      } else if (active && typeof row?.daily_goal === 'number') {
        applyDailyGoal(row.daily_goal);
      }

      channel = supabase
        .channel(`user-settings:${userId}`)
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'user_settings',
          filter: `user_id=eq.${userId}`,
        }, payload => {
          const next = payload.new && 'daily_goal' in payload.new
            ? Number(payload.new.daily_goal)
            : undefined;
          if (active && typeof next === 'number' && Number.isFinite(next)) {
            applyDailyGoal(next);
          }
        })
        .subscribe();
    });

    return () => {
      active = false;
      if (channel) {
        void supabase.removeChannel(channel);
      }
    };
  }, []);

  const setDailyGoal = async (value: number) => {
    const safe = applyDailyGoal(value);
    const { data } = await supabase.auth.getSession();
    const userId = data.session?.user?.id;
    if (!userId) return;

    const { error } = await supabase
      .from('user_settings')
      .upsert({
        user_id: userId,
        daily_goal: safe,
        updated_at: new Date().toISOString(),
      }, {
        onConflict: 'user_id',
      });

    if (error) {
      console.error('useUserSettings upsert:', error.message);
    }
  };

  return { dailyGoal, setDailyGoal };
}
