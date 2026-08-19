import { ICONS } from './library'

// Services and shop categories store an icon on the row, and every row created
// before the icon pack existed holds an emoji. Rather than run a data migration
// that would break the moment someone pastes an emoji back into the admin form,
// the value is resolved at render time: a pack name wins, a known emoji is
// translated, anything else falls back.
const LEGACY_EMOJI = {
    '💻': 'laptop',
    '🖥️': 'monitor',
    '🖥': 'monitor',
    '📹': 'cctv',
    '📷': 'cctv',
    '🎥': 'cctv',
    '🌐': 'wifi',
    '📡': 'wifi',
    '🛜': 'wifi',
    '🎓': 'graduation',
    '🔧': 'wrench',
    '🛠️': 'wrench',
    '🛠': 'wrench',
    '🔩': 'wrench',
    '🔒': 'shield',
    '🔐': 'shield',
    '🛡️': 'shield',
    '🛡': 'shield',
    '💡': 'lightbulb',
    '📋': 'clipboard',
    '📝': 'clipboard',
    '🎯': 'award',
    '🏆': 'award',
    '🤝': 'heart',
    '❤️': 'heart',
    '📚': 'book',
    '📖': 'book',
    '🎮': 'gamepad',
    '💼': 'briefcase',
    '⌨️': 'keyboard',
    '⌨': 'keyboard',
    '🔌': 'network',
    '🌍': 'network',
    '🛍️': 'bag',
    '🛍': 'bag',
    '🛒': 'bag',
    '🖼️': 'image',
    '🖼': 'image',
    '🔍': 'search',
    '👤': 'user',
    '👥': 'users',
    '💬': 'chat',
    '📞': 'phone',
    '📱': 'phone',
    '✉️': 'mail',
    '📧': 'mail',
    '📍': 'pin',
    '🕒': 'clock',
    '⏰': 'clock',
    '🚀': 'check-circle',
    '✅': 'check-circle',
    '✔️': 'check',
}

/**
 * Turn a stored icon value into a name the pack can draw.
 * Accepts a pack name, a legacy emoji, or junk.
 */
export function resolveIconName(value, fallback = 'wrench') {
    if (typeof value !== 'string') return fallback
    const key = value.trim()
    if (!key) return fallback
    if (ICONS[key]) return key
    if (LEGACY_EMOJI[key]) return LEGACY_EMOJI[key]
    // Emoji with a trailing variation selector that we didn't list explicitly.
    const stripped = key.replace(/️/g, '')
    if (LEGACY_EMOJI[stripped]) return LEGACY_EMOJI[stripped]
    return fallback
}

// The subset offered in the admin icon picker, in the order it should appear.
// Kept short on purpose: a picker with 50 near-identical options is how you
// end up with a mismatched grid.
export const SERVICE_ICON_CHOICES = [
    { name: 'laptop', label: 'Laptop' },
    { name: 'monitor', label: 'Monitor / screen' },
    { name: 'keyboard', label: 'Keyboard / accessories' },
    { name: 'cctv', label: 'CCTV camera' },
    { name: 'wifi', label: 'Internet / Wi-Fi' },
    { name: 'network', label: 'Networking' },
    { name: 'shield', label: 'Security' },
    { name: 'lock', label: 'Privacy / lock' },
    { name: 'wrench', label: 'Repair / maintenance' },
    { name: 'graduation', label: 'Training' },
    { name: 'book', label: 'Learning' },
    { name: 'clipboard', label: 'Consultancy' },
    { name: 'lightbulb', label: 'Ideas / solutions' },
    { name: 'briefcase', label: 'Business' },
    { name: 'gamepad', label: 'Gaming' },
    { name: 'bag', label: 'Shop' },
    { name: 'users', label: 'People / team' },
    { name: 'heart', label: 'Customer care' },
    { name: 'award', label: 'Quality / award' },
    { name: 'chat', label: 'Support / chat' },
]
