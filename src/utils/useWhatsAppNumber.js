import { useEffect, useState } from 'react'
import { fetchContactInfo } from './content'
import { getWhatsAppNumber, setWhatsAppNumber } from './whatsapp'

/**
 * Loads the admin-configured WhatsApp number and points every link at it.
 *
 * Called once, in PublicLayout. getWhatsAppUrl() reads a module-level value, so
 * updating it is invisible to React — this hook holds the number in state purely
 * so the layout re-renders and its children rebuild their hrefs. Without that,
 * links keep the default until something else happens to re-render them.
 *
 * Kept out of whatsapp.js so that module stays free of React and the data layer:
 * it's imported by a dozen components, and several of them only need the URL
 * helper.
 */
export function useWhatsAppNumberSync() {
    const [, setNumber] = useState(getWhatsAppNumber)

    useEffect(() => {
        let active = true
        fetchContactInfo()
            .then((info) => {
                if (!active) return
                // Only re-render when the stored value differs from what we
                // already had — normally it doesn't after the first load.
                if (setWhatsAppNumber(info?.whatsapp)) setNumber(getWhatsAppNumber())
            })
            .catch(() => { /* keep the default */ })
        return () => { active = false }
    }, [])
}
