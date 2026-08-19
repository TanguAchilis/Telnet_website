import { useEffect, useState } from 'react'
import { fetchContactInfo } from './content'
import { getSiteContact, setSiteContact } from './siteContact'
import { setWhatsAppNumber } from './whatsapp'

// Seed the WhatsApp helper from the prerendered value before React mounts, so
// the very first render is correct rather than showing the fallback.
setWhatsAppNumber(getSiteContact().whatsapp)

/**
 * The admin-editable contact record: phone, email, address, hours, WhatsApp.
 *
 * Starts from the value baked into the page at build time and refreshes from
 * Supabase on mount, so edits made since the last publish still reach visitors.
 *
 * Called once, in PublicLayout. Navbar, Footer and Contact read the same values
 * through getSiteContact() rather than props: this hook's state update
 * re-renders the layout, and they re-render with it.
 */
export function useSiteContact() {
    const [contact, setContact] = useState(getSiteContact)

    useEffect(() => {
        let active = true
        fetchContactInfo()
            .then((info) => {
                if (!active || !info) return
                setWhatsAppNumber(info.whatsapp)
                if (setSiteContact(info)) setContact(getSiteContact())
            })
            .catch(() => { /* keep the build-time value */ })
        return () => { active = false }
    }, [])

    return contact
}
