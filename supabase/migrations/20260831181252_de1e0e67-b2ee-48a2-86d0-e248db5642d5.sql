ALTER TABLE public.class_links
  ADD COLUMN IF NOT EXISTS whatsapp_channel_url text,
  ADD COLUMN IF NOT EXISTS whatsapp_group_url text,
  ADD COLUMN IF NOT EXISTS telegram_physics_url text,
  ADD COLUMN IF NOT EXISTS telegram_chemistry_url text,
  ADD COLUMN IF NOT EXISTS telegram_math_url text,
  ADD COLUMN IF NOT EXISTS telegram_english_url text,
  ADD COLUMN IF NOT EXISTS telegram_biology_url text;

UPDATE public.class_links
SET
  whatsapp_channel_url = 'https://whatsapp.com/channel/0029Vb8SIwd4o7qRe4XCRX07',
  whatsapp_group_url = 'https://chat.whatsapp.com/Gqo1kRR735SCmEN8WeLtFS',
  telegram_physics_url = 'https://t.me/+8HhPVVefzfszMDc0',
  telegram_chemistry_url = 'https://t.me/+Zwk_iFkm7thjNmI8',
  telegram_math_url = 'https://t.me/+JiaaZXShX6c0ZTM0',
  telegram_english_url = 'https://t.me/+A9tHM5izFARjOTg0',
  telegram_biology_url = 'https://t.me/+DBGwrel9_eljMzM0'
WHERE id = 1;
