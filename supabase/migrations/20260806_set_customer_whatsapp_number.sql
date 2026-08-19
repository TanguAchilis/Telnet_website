-- Sets the customer-facing WhatsApp number to the one the company is actually
-- using: +237 679 837 395.
--
-- The stored value was 237672595150, which is now out of date. Every WhatsApp
-- button on the site reads this field (navbar quote CTA, floating bubble, hero,
-- footer, services, shop, product enquiries, 404). See src/utils/whatsapp.js.
--
-- Digits only, no '+' or spaces: the value is interpolated straight into a
-- wa.me URL, which rejects both.
--
-- Only the whatsapp key is touched. jsonb_set leaves phone, email, address and
-- hours exactly as the admin panel last saved them.
--
-- Idempotent: safe to run more than once, and it creates the row if the
-- contact_info setting doesn't exist yet.

insert into public.admin_settings (key, value, updated_at)
values (
    'contact_info',
    jsonb_build_object('whatsapp', '237679837395'),
    now()
)
on conflict (key) do update
-- Bare table name, not schema-qualified: that's the form ON CONFLICT DO UPDATE
-- exposes for the existing row.
set value = jsonb_set(
        coalesce(admin_settings.value, '{}'::jsonb),
        '{whatsapp}',
        '"237679837395"'::jsonb,
        true
    ),
    updated_at = now();
