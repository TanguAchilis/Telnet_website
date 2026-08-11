import { useEffect, useState } from 'react'
import { fetchContactInfo } from './content'
import { readInjectedContact } from './siteContact'
import { setWhatsAppNumber } from './whatsapp'

// Seed every WhatsApp link from the prerendered value before React even mounts,
// so the very first render is correct rather than showing the fallback.
setWhatsAppNumber(readInjectedContact()?.whatsapp)

/**
 * The admin-editable contact record, for whatever needs it this render.
 *
 * Starts from the value baked into the page at build time and refreshes from
 * Supabase on mount, so edits made since the last publish still reach visitors.
 * Also keeps the WhatsApp helper's module-level number in step — getWhatsAppUrl()
 * is called by a dozen components that would otherwise each need this wiring.
 *
 * Called once, in PublicLayout.
 */
export function useSiteContact() {
    const [contact, setContact] = useState(readInjectedContact)

    useEffect(() => {
        let active = true
        fetchContactInfo()
            .then((info) => {
                if (!active || !info) return
                setWhatsAppNumber(info.whatsapp)
                // Replacing the object re-renders the layout, which rebuilds the
                // hrefs its children produced from the module-level number.
                setContact(info)
            })
            .catch(() => { /* keep the build-time value */ })
        return () => { active = false }
    }, [])

    return contact
}
