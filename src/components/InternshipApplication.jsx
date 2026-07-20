import { useState, useEffect, useCallback, useRef, Fragment } from 'react'
import { createPortal } from 'react-dom'
import { getWhatsAppUrl, whatsappMessages } from '../utils/whatsapp'
import { submitInternshipApplication } from '../utils/internshipApplications'
import { fetchSetting } from '../utils/admin'
import {
    academicModeValue,
    getFirstInvalidInternshipStep,
    getInternshipWizardStepFields,
    otherOptionValue,
    validateInternshipApplication,
} from '../utils/internshipValidation'
import './InternshipApplication.css'

const learningModes = [
    {
        value: 'Academic Internship',
        label: 'Academic Internship',
        description: 'For students enrolled in institutions of higher learning.',
    },
    {
        value: 'Professional Internship (3 Months)',
        label: 'Professional Internship (3 Months)',
    },
    {
        value: 'Short Program (2-3 Months)',
        label: 'Short Program (2-3 Months)',
    },
    {
        value: 'Short Course (Job Seekers) 4-6 Months',
        label: 'Short Course (Job Seekers) 4-6 Months',
    },
]

const itBackgroundOptions = [
    'No (I need catch up classes)',
    'Yes',
]

const laptopOptions = [
    'Yes',
    'No',
    'Still to buy',
]

const academicLevels = [
    'Year 1',
    'Year 2',
    'Year 3',
    'Year 4',
]

const DEFAULT_PROGRAM_OPTIONS = [
    'Networking & Security (NWS, CSN, etc)',
    'Cyber Security (pro interns)',
    'Telecommunications',
    'Computer Graphics and Web Development',
    'Electrical Power Systems',
    'Software Engineering (BTech & HND)',
]

const internshipPeriods = [
    'July',
    'July - August',
    'August',
    'August - September',
    'September - February',
    'March - August',
    'Other',
]

const DEFAULT_FEE_STRUCTURES = [
    '1 Month (15,000 XAF)',
    '2 Months (20,000 XAF)',
    '3-4 Months (25,000 XAF)',
    '5-6 Months (30,000 XAF)',
]

// Module-level cache so we don't re-fetch on every modal open
let _feeStructuresCache = null
let _programOptionsCache = null

const paymentMethods = [
    'MOMO (671827893 taku otto)',
    'Pay at the Malingo office',
]

const wizardSteps = [
    {
        title: 'Personal Details',
        description: 'Tell us your name and how we can reach you.',
    },
    {
        title: 'Learning Path',
        description: 'Choose your mode, program, and IT background.',
    },
    {
        title: 'Fees & Payment',
        description: 'Set your period, fee plan, and review your application.',
    },
]

const initialFormData = {
    fullName: '',
    email: '',
    phone: '',
    itBackground: '',
    laptopStatus: '',
    modeOfLearning: '',
    school: '',
    departmentOption: '',
    academicLevel: '',
    programOption: '',
    programOptionOther: '',
    internshipPeriod: '',
    internshipPeriodOther: '',
    feeStructure: '',
    paymentMethod: '',
}

function RequiredMark() {
    return <span className="ia-required" aria-hidden="true">*</span>
}

function FieldError({ message }) {
    if (!message) {
        return null
    }

    return (
        <p className="ia-field-error" role="alert">
            {message}
        </p>
    )
}

function RadioChoiceGroup({ name, legend, hint, options, value, onChange, error, required = false }) {
    return (
        <fieldset className={`ia-radio-group${error ? ' ia-radio-group-error' : ''}`}>
            <legend className="ia-radio-legend">
                {legend}
                {required && <RequiredMark />}
            </legend>
            {hint && <p className="ia-radio-hint">{hint}</p>}
            <div className="ia-radio-grid">
                {options.map((option, index) => {
                    const optionValue = typeof option === 'string' ? option : option.value
                    const optionLabel = typeof option === 'string' ? option : option.label
                    const optionDescription = typeof option === 'string' ? '' : option.description
                    const optionId = `${name}-${index}`

                    return (
                        <label key={optionValue} htmlFor={optionId} className={`ia-radio-card${value === optionValue ? ' ia-radio-selected' : ''}`}>
                            <input
                                id={optionId}
                                type="radio"
                                name={name}
                                value={optionValue}
                                checked={value === optionValue}
                                onChange={onChange}
                                aria-invalid={Boolean(error)}
                            />
                            <span className="ia-radio-text">{optionLabel}</span>
                            {optionDescription && <span className="ia-radio-note">{optionDescription}</span>}
                        </label>
                    )
                })}
            </div>
            <FieldError message={error} />
        </fieldset>
    )
}

export default function InternshipApplication({ isOpen, onClose }) {
    const [formData, setFormData] = useState(initialFormData)
    const [currentStep, setCurrentStep] = useState(0)
    const [fieldErrors, setFieldErrors] = useState({})
    const [validatedSteps, setValidatedSteps] = useState({})
    const [submitStatus, setSubmitStatus] = useState({ type: 'idle', message: '' })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitted, setSubmitted] = useState(false)
    const [feeStructures, setFeeStructures] = useState(_feeStructuresCache ?? DEFAULT_FEE_STRUCTURES)
    const [programOptions, setProgramOptions] = useState(_programOptionsCache ?? DEFAULT_PROGRAM_OPTIONS)
    const statusRef = useRef(null)

    const isAcademicMode = formData.modeOfLearning === academicModeValue
    const isOtherProgramOption = formData.programOption === otherOptionValue
    const isOtherInternshipPeriod = formData.internshipPeriod === otherOptionValue
    const finalStepIndex = wizardSteps.length - 1
    const currentStepConfig = wizardSteps[currentStep]
    const availableProgramOptions = programOptions.includes(otherOptionValue)
        ? programOptions
        : [...programOptions, otherOptionValue]

    // Load configurable options from DB on first open (cached after first fetch)
    useEffect(() => {
        if (!isOpen) return

        if (_feeStructuresCache) {
            setFeeStructures(_feeStructuresCache)
        } else {
            fetchSetting('fee_structures')
                .then((val) => {
                    if (Array.isArray(val) && val.length > 0) {
                        _feeStructuresCache = val
                        setFeeStructures(val)
                    }
                })
                .catch(() => {})
        }

        if (_programOptionsCache) {
            setProgramOptions(_programOptionsCache)
        } else {
            fetchSetting('program_options')
                .then((val) => {
                    if (Array.isArray(val) && val.length > 0) {
                        _programOptionsCache = val
                        setProgramOptions(val)
                    }
                })
                .catch(() => {})
        }
    }, [isOpen])

    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : ''
        return () => { document.body.style.overflow = '' }
    }, [isOpen])

    const handleKeyDown = useCallback((e) => {
        if (e.key === 'Escape' && !isSubmitting) onClose()
    }, [isSubmitting, onClose])

    useEffect(() => {
        if (isOpen) document.addEventListener('keydown', handleKeyDown)
        return () => document.removeEventListener('keydown', handleKeyDown)
    }, [isOpen, handleKeyDown])

    useEffect(() => {
        if (!isOpen) {
            const t = setTimeout(() => {
                setFormData(initialFormData)
                setCurrentStep(0)
                setFieldErrors({})
                setValidatedSteps({})
                setSubmitStatus({ type: 'idle', message: '' })
                setSubmitted(false)
            }, 300)
            return () => clearTimeout(t)
        }
    }, [isOpen])

    // Bring the status banner into view whenever an error is shown, so it is
    // never hidden above the fold on a long, scrolled step.
    useEffect(() => {
        if (submitStatus.type === 'error' && submitStatus.message && statusRef.current) {
            statusRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' })
            statusRef.current.focus?.()
        }
    }, [submitStatus])

    const reviewItems = [
        {
            label: 'Applicant',
            value: formData.fullName || 'Not provided yet',
        },
        {
            label: 'Contact',
            value: formData.email && formData.phone
                ? `${formData.email} · ${formData.phone}`
                : 'Complete your contact details on the first step.',
        },
        {
            label: 'Mode',
            value: formData.modeOfLearning || 'Choose a mode of learning.',
        },
        {
            label: 'Program',
            value: formData.programOption === otherOptionValue
                ? (formData.programOptionOther || 'Other option')
                : (formData.programOption || 'Choose a program option.'),
        },
        {
            label: 'Period',
            value: formData.internshipPeriod === otherOptionValue
                ? (formData.internshipPeriodOther || 'Other period')
                : (formData.internshipPeriod || 'Choose an internship period.'),
        },
    ]

    const replaceStepErrors = (stepIndex, nextFormData) => {
        const nextStepErrors = validateInternshipApplication(nextFormData, { step: stepIndex })

        setFieldErrors((currentErrors) => {
            const updatedErrors = { ...currentErrors }

            getInternshipWizardStepFields(stepIndex).forEach((fieldName) => {
                delete updatedErrors[fieldName]
            })

            return {
                ...updatedErrors,
                ...nextStepErrors,
            }
        })

        return nextStepErrors
    }

    const markStepValidated = (stepIndex) => {
        setValidatedSteps((prev) => ({ ...prev, [stepIndex]: true }))
    }

    const handleNextStep = () => {
        markStepValidated(currentStep)
        setSubmitStatus({ type: 'idle', message: '' })

        const nextStepErrors = replaceStepErrors(currentStep, formData)

        if (Object.keys(nextStepErrors).length > 0) {
            setSubmitStatus({
                type: 'error',
                message: 'Please complete the highlighted fields before continuing.',
            })
            return
        }

        setCurrentStep((s) => Math.min(s + 1, finalStepIndex))
    }

    const handlePreviousStep = () => {
        setCurrentStep((s) => Math.max(s - 1, 0))
    }

    const getFieldClassName = (fieldName) => (
        fieldErrors[fieldName] ? 'ia-input-error' : ''
    )

    const handleChange = (event) => {
        const { name, value, type, checked } = event.target

        const nextFormData = {
            ...formData,
            [name]: type === 'checkbox' ? checked : value,
            ...(name === 'modeOfLearning' && value !== academicModeValue
                ? { school: '', departmentOption: '', academicLevel: '' }
                : {}),
            ...(name === 'programOption' && value !== otherOptionValue
                ? { programOptionOther: '' }
                : {}),
            ...(name === 'internshipPeriod' && value !== otherOptionValue
                ? { internshipPeriodOther: '' }
                : {}),
        }

        setFormData(nextFormData)
        setSubmitStatus({ type: 'idle', message: '' })

        if (validatedSteps[currentStep]) {
            replaceStepErrors(currentStep, nextFormData)
        }
    }

    const handleSubmit = async (event) => {
        event.preventDefault()
        setSubmitStatus({ type: 'idle', message: '' })

        if (currentStep !== finalStepIndex) {
            handleNextStep()
            return
        }

        const allErrors = validateInternshipApplication(formData)

        if (Object.keys(allErrors).length > 0) {
            const firstInvalidStep = getFirstInvalidInternshipStep(formData)

            if (firstInvalidStep !== -1) {
                markStepValidated(firstInvalidStep)
                replaceStepErrors(firstInvalidStep, formData)
                setCurrentStep(firstInvalidStep)
            }

            const missingCount = Object.keys(allErrors).length
            setSubmitStatus({
                type: 'error',
                message: firstInvalidStep !== -1 && firstInvalidStep !== finalStepIndex
                    ? `Some required details are incomplete — we've taken you back to fix ${missingCount === 1 ? 'it' : 'them'}.`
                    : 'Please complete the highlighted fields before submitting.',
            })

            return
        }

        setIsSubmitting(true)

        try {
            await submitInternshipApplication(formData)
            setSubmitted(true)
        } catch (error) {
            setSubmitStatus({
                type: 'error',
                message: error.message || 'We could not submit your application right now. Please try again.',
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleClose = () => {
        if (!isSubmitting) onClose()
    }

    if (!isOpen) return null

    return createPortal(
        <div className="ia-overlay" onClick={handleClose} role="dialog" aria-modal="true" aria-labelledby="ia-modal-title">
            <div className="ia-panel" onClick={(e) => e.stopPropagation()}>

                {submitted ? (
                    <div className="ia-success">
                        <div className="ia-success-icon">
                            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <polyline points="20 6 9 17 4 12" />
                            </svg>
                        </div>
                        <h2 className="ia-success-title">Application Submitted!</h2>
                        <p className="ia-success-msg">
                            Thank you! We have received your internship application and will get back to you shortly. Remember to drop your supporting documents at the Malingo office.
                        </p>
                        <a
                            href={getWhatsAppUrl(whatsappMessages.internship)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-secondary ia-success-wa"
                        >
                            Ask about next steps on WhatsApp
                        </a>
                        <button type="button" className="btn btn-primary ia-success-close" onClick={handleClose}>
                            Close
                        </button>
                    </div>
                ) : (
                    <>
                        <div className="ia-header">
                            <div className="ia-header-text">
                                <p className="ia-step-counter">Step {currentStep + 1} of {wizardSteps.length}</p>
                                <h2 id="ia-modal-title" className="ia-modal-title">{currentStepConfig.title}</h2>
                                <p className="ia-step-desc">{currentStepConfig.description}</p>
                            </div>
                            <button className="ia-close" type="button" onClick={handleClose} aria-label="Close application form" disabled={isSubmitting}>
                                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                    <line x1="18" y1="6" x2="6" y2="18" />
                                    <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                            </button>
                        </div>

                        <div className="ia-progress" aria-label="Application progress">
                            {wizardSteps.map((step, index) => (
                                <Fragment key={step.title}>
                                    <div className={`ia-prog-step${index === currentStep ? ' ia-prog-active' : index < currentStep ? ' ia-prog-done' : ''}`}>
                                        <div className="ia-prog-dot">
                                            {index < currentStep ? (
                                                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                                    <polyline points="20 6 9 17 4 12" />
                                                </svg>
                                            ) : (
                                                <span>{index + 1}</span>
                                            )}
                                        </div>
                                        <span className="ia-prog-label">{step.title}</span>
                                    </div>
                                    {index < wizardSteps.length - 1 && (
                                        <div className={`ia-prog-line${index < currentStep ? ' ia-prog-line-done' : ''}`} aria-hidden="true" />
                                    )}
                                </Fragment>
                            ))}
                        </div>

                        <form className="ia-body" onSubmit={handleSubmit} noValidate>
                            {submitStatus.message && (
                                <div
                                    ref={statusRef}
                                    tabIndex={-1}
                                    className={`ia-status${submitStatus.type === 'error' ? ' ia-status-error' : ' ia-status-success'}`}
                                    aria-live="assertive"
                                    role={submitStatus.type === 'error' ? 'alert' : 'status'}
                                >
                                    {submitStatus.message}
                                </div>
                            )}

                            {currentStep === 0 && (
                                <div className="ia-grid">
                                    <div className="ia-field">
                                        <label htmlFor="fullName">Full name<RequiredMark /></label>
                                        <input
                                            id="fullName"
                                            name="fullName"
                                            type="text"
                                            value={formData.fullName}
                                            onChange={handleChange}
                                            placeholder="Your full name"
                                            className={getFieldClassName('fullName')}
                                            aria-invalid={Boolean(fieldErrors.fullName)}
                                        />
                                        <FieldError message={fieldErrors.fullName} />
                                    </div>

                                    <div className="ia-field">
                                        <label htmlFor="email">Email address<RequiredMark /></label>
                                        <input
                                            id="email"
                                            name="email"
                                            type="email"
                                            value={formData.email}
                                            onChange={handleChange}
                                            placeholder="yourname@example.com"
                                            className={getFieldClassName('email')}
                                            aria-invalid={Boolean(fieldErrors.email)}
                                        />
                                        <FieldError message={fieldErrors.email} />
                                    </div>

                                    <div className="ia-field ia-field-full">
                                        <label htmlFor="phone">Phone number<RequiredMark /></label>
                                        <input
                                            id="phone"
                                            name="phone"
                                            type="tel"
                                            value={formData.phone}
                                            onChange={handleChange}
                                            placeholder="e.g. 671 827 893"
                                            className={getFieldClassName('phone')}
                                            aria-invalid={Boolean(fieldErrors.phone)}
                                        />
                                        <FieldError message={fieldErrors.phone} />
                                    </div>
                                </div>
                            )}

                            {currentStep === 1 && (
                                <div className="ia-grid">
                                    <RadioChoiceGroup
                                        name="itBackground"
                                        legend="Do you have an IT background"
                                        options={itBackgroundOptions}
                                        value={formData.itBackground}
                                        onChange={handleChange}
                                        error={fieldErrors.itBackground}
                                        required
                                    />

                                    <RadioChoiceGroup
                                        name="laptopStatus"
                                        legend="Do you have a functional laptop"
                                        hint="TELNET also offers affordable laptops for purchase."
                                        options={laptopOptions}
                                        value={formData.laptopStatus}
                                        onChange={handleChange}
                                        error={fieldErrors.laptopStatus}
                                        required
                                    />

                                    <RadioChoiceGroup
                                        name="modeOfLearning"
                                        legend="Mode of Learning"
                                        options={learningModes}
                                        value={formData.modeOfLearning}
                                        onChange={handleChange}
                                        error={fieldErrors.modeOfLearning}
                                        required
                                    />

                                    {isAcademicMode && (
                                        <fieldset className="ia-sub-section ia-field-full">
                                            <legend className="ia-sub-legend">Academic Internship Details</legend>
                                            <p className="ia-sub-hint">For students enrolled in institutions of higher learning.</p>
                                            <div className="ia-grid ia-sub-grid">
                                                <div className="ia-field">
                                                    <label htmlFor="school">School<RequiredMark /></label>
                                                    <input
                                                        id="school"
                                                        name="school"
                                                        type="text"
                                                        value={formData.school}
                                                        onChange={handleChange}
                                                        placeholder="Your school name"
                                                        className={getFieldClassName('school')}
                                                        aria-invalid={Boolean(fieldErrors.school)}
                                                    />
                                                    <FieldError message={fieldErrors.school} />
                                                </div>

                                                <div className="ia-field">
                                                    <label htmlFor="departmentOption">Department / Option<RequiredMark /></label>
                                                    <input
                                                        id="departmentOption"
                                                        name="departmentOption"
                                                        type="text"
                                                        value={formData.departmentOption}
                                                        onChange={handleChange}
                                                        placeholder="Your department or option"
                                                        className={getFieldClassName('departmentOption')}
                                                        aria-invalid={Boolean(fieldErrors.departmentOption)}
                                                    />
                                                    <FieldError message={fieldErrors.departmentOption} />
                                                </div>

                                                <RadioChoiceGroup
                                                    name="academicLevel"
                                                    legend="Academic Level"
                                                    options={academicLevels}
                                                    value={formData.academicLevel}
                                                    onChange={handleChange}
                                                    error={fieldErrors.academicLevel}
                                                    required
                                                />
                                            </div>
                                            <div className="ia-note ia-note-offset">
                                                <strong>Internship Letter:</strong> Drop your letter and supporting documents at the Malingo office after submitting this form. Do not upload here.
                                            </div>
                                        </fieldset>
                                    )}

                                    <RadioChoiceGroup
                                        name="programOption"
                                        legend="Program Option"
                                        options={availableProgramOptions}
                                        value={formData.programOption}
                                        onChange={handleChange}
                                        error={fieldErrors.programOption}
                                        required
                                    />

                                    {isOtherProgramOption && (
                                        <div className="ia-field ia-field-full">
                                            <label htmlFor="programOptionOther">Specify your program<RequiredMark /></label>
                                            <input
                                                id="programOptionOther"
                                                name="programOptionOther"
                                                type="text"
                                                value={formData.programOptionOther}
                                                onChange={handleChange}
                                                placeholder="Your preferred program"
                                                className={getFieldClassName('programOptionOther')}
                                                aria-invalid={Boolean(fieldErrors.programOptionOther)}
                                            />
                                            <FieldError message={fieldErrors.programOptionOther} />
                                        </div>
                                    )}
                                </div>
                            )}

                            {currentStep === 2 && (
                                <div className="ia-grid">
                                    <div className="ia-review ia-field-full">
                                        <p className="ia-review-label">Application Snapshot</p>
                                        <div className="ia-review-list">
                                            {reviewItems.map((item) => (
                                                <div key={item.label} className="ia-review-item">
                                                    <span>{item.label}</span>
                                                    <strong>{item.value}</strong>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <RadioChoiceGroup
                                        name="internshipPeriod"
                                        legend="Internship Period"
                                        options={internshipPeriods}
                                        value={formData.internshipPeriod}
                                        onChange={handleChange}
                                        error={fieldErrors.internshipPeriod}
                                        required
                                    />

                                    {isOtherInternshipPeriod && (
                                        <div className="ia-field ia-field-full">
                                            <label htmlFor="internshipPeriodOther">Specify your period<RequiredMark /></label>
                                            <input
                                                id="internshipPeriodOther"
                                                name="internshipPeriodOther"
                                                type="text"
                                                value={formData.internshipPeriodOther}
                                                onChange={handleChange}
                                                placeholder="Your preferred period"
                                                className={getFieldClassName('internshipPeriodOther')}
                                                aria-invalid={Boolean(fieldErrors.internshipPeriodOther)}
                                            />
                                            <FieldError message={fieldErrors.internshipPeriodOther} />
                                        </div>
                                    )}

                                    <RadioChoiceGroup
                                        name="feeStructure"
                                        legend="Fee Structure"
                                        options={feeStructures}
                                        value={formData.feeStructure}
                                        onChange={handleChange}
                                        error={fieldErrors.feeStructure}
                                        required
                                    />

                                    <div className="ia-note ia-field-full">
                                        <span className="ia-note-label">Payment of Fees</span>
                                        <p>
                                            For MOMO payment, send the screenshot to the manager (671621015) via WhatsApp with your name and program. Only fees for professional short courses (6 months) can be paid in two installments. Registration fee: 5,000 XAF.
                                        </p>
                                        <a
                                            href={getWhatsAppUrl(whatsappMessages.internship)}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="ia-inline-link"
                                        >
                                            Ask Telnet about the program &rarr;
                                        </a>
                                    </div>

                                    <RadioChoiceGroup
                                        name="paymentMethod"
                                        legend="Payment Method"
                                        options={paymentMethods}
                                        value={formData.paymentMethod}
                                        onChange={handleChange}
                                        error={fieldErrors.paymentMethod}
                                        required
                                    />
                                </div>
                            )}

                            <div className="ia-footer">
                                {currentStep > 0 ? (
                                    <button type="button" className="ia-btn-back" onClick={handlePreviousStep} disabled={isSubmitting}>
                                        &larr; Back
                                    </button>
                                ) : (
                                    <div aria-hidden="true" />
                                )}

                                {currentStep < finalStepIndex ? (
                                    <button type="button" className="ia-btn-next" onClick={handleNextStep} disabled={isSubmitting}>
                                        Continue &rarr;
                                    </button>
                                ) : (
                                    <button type="submit" className="ia-btn-submit" disabled={isSubmitting}>
                                        <span className="ia-btn-inner">
                                            {isSubmitting && <span className="ia-spinner" aria-hidden="true" />}
                                            <span>{isSubmitting ? 'Submitting...' : 'Submit Application'}</span>
                                        </span>
                                    </button>
                                )}
                            </div>
                        </form>
                    </>
                )}

            </div>
        </div>,
        document.body
    )
}
