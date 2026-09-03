insert into public.user_roles (user_id, role)
select id, 'admin'::app_role from auth.users
where email in ('newtonedgetutorial@gmail.com','isaacayomideone@gmail.com')
on conflict (user_id, role) do nothing;