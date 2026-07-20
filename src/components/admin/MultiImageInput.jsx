import { useState } from 'react'
import { uploadImage } from '../../utils/storage'

export default function MultiImageInput({ images = [], onChange, folder = 'misc', label = 'More photos' }) {
    const [uploading, setUploading] = useState(false)
    const [urlInput, setUrlInput] = useState('')
    const [error, setError] = useState('')

    const list = Array.isArray(images) ? images : []

    const handleFile = async (e) => {
        const file = e.target.files?.[0]
        if (!file) return
        setUploading(true)
        setError('')
        try {
            const url = await uploadImage(file, folder)
            onChange([...list, url])
        } catch (err) {
            setError(err.message || 'Upload failed.')
        } finally {
            setUploading(false)
            e.target.value = ''
        }
    }

    const addUrl = () => {
        const value = urlInput.trim()
        if (!value) return
        onChange([...list, value])
        setUrlInput('')
    }

    const removeAt = (index) => onChange(list.filter((_, i) => i !== index))

    return (
        <div className="acms-multi">
            <span className="ap-label">{label}</span>
            {list.length > 0 && (
                <div className="acms-multi-grid">
                    {list.map((url, i) => (
                        <div key={`${url}-${i}`} className="acms-multi-item">
                            <img src={url} alt="" />
                            <button type="button" className="acms-multi-remove" onClick={() => removeAt(i)} aria-label="Remove image">✕</button>
                        </div>
                    ))}
                </div>
            )}
            <div className="acms-multi-add">
                <label className={`ap-btn ap-btn-secondary ap-btn-sm acms-upload-btn${uploading ? ' acms-disabled' : ''}`}>
                    {uploading ? 'Uploading…' : '+ Upload'}
                    <input type="file" accept="image/*" onChange={handleFile} disabled={uploading} hidden />
                </label>
                <input
                    type="text"
                    className="ap-input acms-multi-url"
                    placeholder="…or paste image URL"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addUrl() } }}
                />
                <button type="button" className="ap-btn ap-btn-secondary ap-btn-sm" onClick={addUrl} disabled={!urlInput.trim()}>Add</button>
            </div>
            {error && <p className="ap-field-error">{error}</p>}
        </div>
    )
}
