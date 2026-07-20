import { useEffect } from 'react'
import { createPortal } from 'react-dom'

export default function Modal({ open, title, onClose, children, footer }) {
    useEffect(() => {
        if (!open) return
        const onKey = (e) => { if (e.key === 'Escape') onClose() }
        document.addEventListener('keydown', onKey)
        document.body.style.overflow = 'hidden'
        return () => {
            document.removeEventListener('keydown', onKey)
            document.body.style.overflow = ''
        }
    }, [open, onClose])

    if (!open) return null

    return createPortal(
        <div className="acms-modal-overlay" onClick={onClose}>
            <div className="acms-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
                <div className="acms-modal-hdr">
                    <h3>{title}</h3>
                    <button type="button" className="acms-modal-close" onClick={onClose} aria-label="Close">✕</button>
                </div>
                <div className="acms-modal-body">{children}</div>
                {footer && <div className="acms-modal-foot">{footer}</div>}
            </div>
        </div>,
        document.body
    )
}
