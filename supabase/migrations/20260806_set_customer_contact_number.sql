-- Sets both the customer-facing WhatsApp number and the displayed phone number
-- to the one the company is actually using: +237 679 837 395.
--
-- Supersedes 20260806_set_customer_whatsapp_number.sql, which set only the
-- WhatsApp key and left phone on the outdated +237672595150. Both are applied
-- here so a fresh database reaches the right state in one pass; running the
-- earlier file first is harmless.
--
-- Where each key is used:
--   whatsapp - interpolated into wa.me URLs by every "Chat on WhatsApp" button
--              (see src/utils/whatsapp.js). Digits only: wa.me rejects '+' and
--              spaces.
--   phone    - displayed in the footer, mobile menu and contact page, and
--              emitted as `telephone` in the LocalBusiness structured data.
--              Formatting is free; schema.org accepts spaces.
--
-- Only these two keys are touched. email, address and hours stay exactly as the
-- admin panel last saved them.
--
-- Idempotent, and creates the row if contact_info doesn't exist yet.

insert into public.admin_settings (key, value, updated_at)
values (
    'contact_info',
    jsonb_build_object(
        'whatsapp', '237672595150',
        'phone', '+237 672 595 150'
    ),
    now()
)
on conflict (key) do update
-- Bare table name, not schema-qualified: that's the form ON CONFLICT DO UPDATE
-- exposes for the existing row.
set value = jsonb_set(
        jsonb_set(
            coalesce(admin_settings.value, '{}'::jsonb),
            '{whatsapp}',
            '"237672595150"'::jsonb,
            true
        ),
        '{phone}',
        '"+237 672 595 150"'::jsonb,
        true
    ),
    updated_at = now();
