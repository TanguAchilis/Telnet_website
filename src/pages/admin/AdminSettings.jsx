import { useEffect, useState } from 'react'
import { fetchSetting, saveSetting } from '../../utils/admin'
import './admin.css'
import './AdminSettings.css'

const DEFAULT_FEES = [
    '1 Month (15,000 XAF)',
    '2 Months (20,000 XAF)',
    '3-4 Months (25,000 XAF)',
    '5-6 Months (30,000 XAF)',
]

const DEFAULT_PROGRAMS = [
    'Networking & Security (NWS, CSN, etc)',
    'Cyber Security (pro interns)',
    'Telecommunications',
    'Computer Graphics and Web Development',
    'Electrical Power Systems',
    'Software Engineering (BTech & HND)',
]

function SettingsListEditor({
    settingKey,
    defaults,
    title,
    description,
    placeholder,
    resetLabel,
}) {
    const [items, setItems] = useState([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const [newItem, setNewItem] = useState('')
    const [editIndex, setEditIndex] = useState(null)
    const [editValue, setEditValue] = useState('')

    useEffect(() => {
        let active = true

        fetchSetting(settingKey)
            .then((value) => {
                if (!active) return
                setItems(Array.isArray(value) && value.length > 0 ? value : defaults)
            })
            .catch(() => {
                if (active) setItems(defaults)
            })
            .finally(() => {
                if (active) setLoading(false)
            })

        return () => {
            active = false
        }
    }, [defaults, settingKey])

    const handleSave = async () => {
        setSaving(true)
        setError('')
        setSuccess(false)

        try {
            const sanitizedItems = items.map((item) => item.trim()).filter(Boolean)
            const { error: saveError } = await saveSetting(settingKey, sanitizedItems)

            if (saveError) throw saveError

            setItems(sanitizedItems)
            setSuccess(true)
            setTimeout(() => setSuccess(false), 3500)
        } catch (e) {
            setError(e.message)
        } finally {
            setSaving(false)
        }
    }

    const addItem = () => {
        const value = newItem.trim()
        if (!value) return

        setItems((prev) => [...prev, value])
        setNewItem('')
    }

    const removeItem = (index) => {
        setItems((prev) => prev.filter((_, itemIndex) => itemIndex !== index))
    }

    const startEdit = (index) => {
        setEditIndex(index)
        setEditValue(items[index])
    }

    const cancelEdit = () => {
        setEditIndex(null)
        setEditValue('')
    }

    const commitEdit = () => {
        const value = editValue.trim()
        if (value && editIndex !== null) {
            setItems((prev) => prev.map((item, index) => (index === editIndex ? value : item)))
        }
        cancelEdit()
    }

    const resetToDefaults = () => {
        if (window.confirm(resetLabel)) {
            setItems(defaults)
            cancelEdit()
        }
    }

    return (
        <div className="ap-card aset-card">
            <p className="ap-card-title">{title}</p>
            <p className="aset-description">{description}</p>

            {loading ? (
                <div className="ap-loading"><span className="ap-spinner" />Loading…</div>
            ) : (
                <>
                    {error && <div className="ap-alert ap-alert-error">{error}</div>}
                    {success && <div className="ap-alert ap-alert-success">Settings saved successfully.</div>}

                    <div className="aset-list">
                        {items.map((item, index) => (
                            <div key={`${settingKey}-${index}`} className="aset-item">
                                {editIndex === index ? (
                                    <input
                                        className="ap-input"
                                        value={editValue}
                                        onChange={(e) => setEditValue(e.target.value)}
                                        onBlur={commitEdit}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') commitEdit()
                                            if (e.key === 'Escape') cancelEdit()
                                        }}
                                        autoFocus
                                        style={{ flex: 1 }}
                                    />
                                ) : (
                                    <span className="aset-item-text">{item}</span>
                                )}

                                <div className="aset-actions">
                                    {editIndex !== index && (
                                        <button type="button" className="ap-btn ap-btn-secondary ap-btn-sm" onClick={() => startEdit(index)}>
                                            Edit
                                        </button>
                                    )}
                                    <button type="button" className="ap-btn ap-btn-danger ap-btn-sm" onClick={() => removeItem(index)}>
                                        Remove
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="aset-add">
                        <input
                            type="text"
                            className="ap-input"
                            placeholder={placeholder}
                            value={newItem}
                            onChange={(e) => setNewItem(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && addItem()}
                            style={{ flex: 1 }}
                        />
                        <button type="button" className="ap-btn ap-btn-secondary" onClick={addItem} disabled={!newItem.trim()}>
                            + Add
                        </button>
                    </div>

                    <div className="aset-footer">
                        <button type="button" className="ap-btn ap-btn-secondary ap-btn-sm" onClick={resetToDefaults}>
                            Reset to defaults
                        </button>
                        <button type="button" className="ap-btn ap-btn-primary" onClick={handleSave} disabled={saving}>
                            {saving ? <><span className="ap-spinner" style={{ width: '1rem', height: '1rem', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white' }} /> Saving…</> : 'Save Changes'}
                        </button>
                    </div>
                </>
            )}
        </div>
    )
}

export default function AdminSettings() {
    return (
        <div className="ap-page">
            <div className="ap-page-header">
                <h2 className="ap-page-title">Settings</h2>
                <p className="ap-page-subtitle">Configure the internship options shown across the public form and admin portal.</p>
            </div>

            <div className="aset-grid">
                <SettingsListEditor
                    settingKey="program_options"
                    defaults={DEFAULT_PROGRAMS}
                    title="Internship Programmes"
                    description="These values appear on the public internship page and inside the application modal. Keep only the programmes you currently offer."
                    placeholder="New programme, e.g. Data Analysis"
                    resetLabel="Reset internship programmes to defaults?"
                />

                <SettingsListEditor
                    settingKey="fee_structures"
                    defaults={DEFAULT_FEES}
                    title="Fee Structures"
                    description="These values appear in the internship application form. Changes are saved to the database and reflected immediately."
                    placeholder="New fee structure, e.g. 2 Months (20,000 XAF)"
                    resetLabel="Reset fee structures to defaults?"
                />
            </div>
        </div>
    )
}
