import { useState } from 'react'
import { uploadImage } from '../../utils/storage'

export default function ImageUpload({ value, onChange, folder = 'misc', label = 'Image' }) {
    const [uploading, setUploading] = useState(false)
    const [error, setError] = useState('')

    const handleFile = async (e) => {
        const file = e.target.files?.[0]
        if (!file) return
        setUploading(true)
        setError('')
        try {
            const url = await uploadImage(file, folder)
            onChange(url)
        } catch (err) {
            setError(err.message || 'Upload failed.')
        } finally {
            setUploading(false)
            e.target.value = ''
        }
    }

    return (
        <div className="acms-upload">
            {label && <span className="ap-label">{label}</span>}
            <div className="acms-upload-row">
                <div className="acms-upload-preview">
                    {value ? <img src={value} alt="" /> : <span className="acms-upload-empty">No image</span>}
                </div>
                <div className="acms-upload-controls">
                    <label className={`ap-btn ap-btn-secondary ap-btn-sm acms-upload-btn${uploading ? ' acms-disabled' : ''}`}>
                        {uploading ? 'Uploading…' : (value ? 'Replace' : 'Upload image')}
                        <input type="file" accept="image/*" onChange={handleFile} disabled={uploading} hidden />
                    </label>
                    {value && !uploading && (
                        <button type="button" className="ap-btn ap-btn-danger ap-btn-sm" onClick={() => onChange('')}>
                            Remove
                        </button>
                    )}
                </div>
            </div>
            <input
                type="text"
                className="ap-input acms-url-input"
                placeholder="…or paste an image URL"
                value={value || ''}
                onChange={(e) => onChange(e.target.value)}
            />
            {error && <p className="ap-field-error">{error}</p>}
        </div>
    )
}
