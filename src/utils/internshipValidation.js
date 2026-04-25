export const academicModeValue = 'Academic Internship'
export const otherOptionValue = 'Other'

const internshipWizardStepFields = [
    ['fullName', 'email', 'phone'],
    ['itBackground', 'laptopStatus', 'modeOfLearning', 'school', 'departmentOption', 'academicLevel', 'programOption', 'programOptionOther'],
    ['internshipPeriod', 'internshipPeriodOther', 'feeStructure', 'paymentMethod'],
]

export function normalizeInternshipValue(value) {
    if (typeof value !== 'string') {
        return null
    }

    const trimmedValue = value.trim()
    return trimmedValue.length > 0 ? trimmedValue : null
}

function hasValue(value) {
    return normalizeInternshipValue(value) !== null
}

function isValidEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function isValidPhone(value) {
    const numericValue = value.replace(/\D/g, '')
    return numericValue.length >= 9 && numericValue.length <= 15
}

export function getInternshipWizardStepFields(stepIndex) {
    return internshipWizardStepFields[stepIndex] || []
}

export function validateInternshipApplication(formData, options = {}) {
    const errors = {}
    const fullName = normalizeInternshipValue(formData.fullName)
    const email = normalizeInternshipValue(formData.email)
    const phone = normalizeInternshipValue(formData.phone)
    const school = normalizeInternshipValue(formData.school)
    const departmentOption = normalizeInternshipValue(formData.departmentOption)
    const programOptionOther = normalizeInternshipValue(formData.programOptionOther)
    const internshipPeriodOther = normalizeInternshipValue(formData.internshipPeriodOther)

    if (!fullName) {
        errors.fullName = 'Enter your full name.'
    }

    if (!email) {
        errors.email = 'Enter your email address.'
    } else if (!isValidEmail(email)) {
        errors.email = 'Enter a valid email address.'
    }

    if (!phone) {
        errors.phone = 'Enter your phone number.'
    } else if (!isValidPhone(phone)) {
        errors.phone = 'Enter a valid phone number.'
    }

    if (!hasValue(formData.itBackground)) {
        errors.itBackground = 'Choose whether you have an IT background.'
    }

    if (!hasValue(formData.laptopStatus)) {
        errors.laptopStatus = 'Choose your laptop status.'
    }

    if (!hasValue(formData.modeOfLearning)) {
        errors.modeOfLearning = 'Choose a mode of learning.'
    }

    if (formData.modeOfLearning === academicModeValue) {
        if (!school) {
            errors.school = 'Enter your school name.'
        }

        if (!departmentOption) {
            errors.departmentOption = 'Enter your department or option.'
        }

        if (!hasValue(formData.academicLevel)) {
            errors.academicLevel = 'Choose your academic level.'
        }
    }

    if (!hasValue(formData.programOption)) {
        errors.programOption = 'Choose a program option.'
    } else if (formData.programOption === otherOptionValue && !programOptionOther) {
        errors.programOptionOther = 'Specify the other program option.'
    }

    if (!hasValue(formData.internshipPeriod)) {
        errors.internshipPeriod = 'Choose your internship period.'
    } else if (formData.internshipPeriod === otherOptionValue && !internshipPeriodOther) {
        errors.internshipPeriodOther = 'Specify the other internship period.'
    }

    if (!hasValue(formData.feeStructure)) {
        errors.feeStructure = 'Choose a fee structure.'
    }

    if (!hasValue(formData.paymentMethod)) {
        errors.paymentMethod = 'Choose a payment method.'
    }

    if (typeof options.step === 'number') {
        const stepFields = new Set(getInternshipWizardStepFields(options.step))

        return Object.fromEntries(
            Object.entries(errors).filter(([fieldName]) => stepFields.has(fieldName))
        )
    }

    return errors
}

export function getFirstInvalidInternshipStep(formData) {
    for (let stepIndex = 0; stepIndex < internshipWizardStepFields.length; stepIndex += 1) {
        const stepErrors = validateInternshipApplication(formData, { step: stepIndex })

        if (Object.keys(stepErrors).length > 0) {
            return stepIndex
        }
    }

    return -1
}