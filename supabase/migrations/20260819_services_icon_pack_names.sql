-- ---------------------------------------------------------------------
-- Normalise services.icon from emoji to Telnet icon-pack names.
--
-- The site no longer renders emoji: every icon comes from the in-house
-- pack in src/icons/. The app resolves legacy emoji at render time
-- (src/icons/resolve.js), so this migration is not required for the site
-- to look right; it just stops the admin form round-tripping emoji back
-- into the column, and keeps the stored value readable.
--
-- Idempotent: rows already holding a pack name are left alone.
-- ---------------------------------------------------------------------

update public.services
set icon = case icon
    when '💻' then 'laptop'
    when '🖥️' then 'monitor'
    when '📹' then 'cctv'
    when '📷' then 'cctv'
    when '🌐' then 'wifi'
    when '📡' then 'wifi'
    when '🎓' then 'graduation'
    when '🔧' then 'wrench'
    when '🛠️' then 'wrench'
    when '🔒' then 'shield'
    when '🔐' then 'shield'
    when '🛡️' then 'shield'
    when '💡' then 'lightbulb'
    when '📋' then 'clipboard'
    when '🎯' then 'award'
    when '🏆' then 'award'
    when '🤝' then 'heart'
    when '📚' then 'book'
    when '🎮' then 'gamepad'
    when '💼' then 'briefcase'
    when '⌨️' then 'keyboard'
    when '🔌' then 'network'
    when '🛍️' then 'bag'
    when '💬' then 'chat'
    when '👥' then 'users'
    else icon
end
where icon is not null
  and icon not in (
    'laptop', 'monitor', 'keyboard', 'cctv', 'wifi', 'network', 'shield',
    'lock', 'wrench', 'graduation', 'book', 'clipboard', 'lightbulb',
    'briefcase', 'gamepad', 'bag', 'users', 'heart', 'award', 'chat'
  );

-- Anything left that is neither a pack name nor a mapped emoji (a stray
-- character someone typed into the old free-text field) becomes the
-- generic service glyph rather than rendering as nothing.
update public.services
set icon = 'wrench'
where icon is null
   or icon not in (
    'laptop', 'monitor', 'keyboard', 'cctv', 'wifi', 'network', 'shield',
    'lock', 'wrench', 'graduation', 'book', 'clipboard', 'lightbulb',
    'briefcase', 'gamepad', 'bag', 'users', 'heart', 'award', 'chat'
  );
