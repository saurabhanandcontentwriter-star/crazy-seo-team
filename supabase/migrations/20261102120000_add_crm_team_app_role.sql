-- The original app_role enum only contained admin and user.
-- Employee Google login writes crm_team into user_roles, so the enum must
-- include that value before the Edge Function can grant employee access.
ALTER TYPE public.app_role ADD VALUE IF NOT EXISTS 'crm_team';
