-- Adds streak/vacation/freeze fields to habits
ALTER TABLE habits
    ADD COLUMN IF NOT EXISTS longest_streak INTEGER DEFAULT 0,
    ADD COLUMN IF NOT EXISTS last_completed_date TIMESTAMPTZ,
    ADD COLUMN IF NOT EXISTS freeze_tokens INTEGER DEFAULT 3,
    ADD COLUMN IF NOT EXISTS vacation_mode BOOLEAN DEFAULT FALSE,
    ADD COLUMN IF NOT EXISTS vacation_until TIMESTAMPTZ;

-- backfill defaults for existing rows
UPDATE habits
SET longest_streak = COALESCE(longest_streak, streak),
    freeze_tokens = COALESCE(freeze_tokens, 3)
WHERE true;
