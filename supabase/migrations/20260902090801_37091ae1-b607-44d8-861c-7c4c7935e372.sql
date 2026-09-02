REVOKE EXECUTE ON FUNCTION public.share_verifications_guard() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.sync_reward_unlock() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.verified_share_points(uuid) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.verified_share_points(uuid) TO service_role;