import { hasSupabaseConfig, supabase } from './supabase'
import { normalizeInternshipValue, validateInternshipApplication, otherOptionValue } from './internshipValidation'

export async function submitInternshipApplication(formData) {
    if (!hasSupabaseConfig || !supabase) {
        throw new Error('Application submission is not configured yet. Add your Supabase URL and publishable key to enable this form.')
    }

    const validationErrors = validateInternshipApplication(formData)
    const firstValidationMessage = Object.values(validationErrors)[0]

    if (firstValidationMessage) {
        throw new Error(firstValidationMessage)
    }

    const payload = {
        full_name: normalizeInternshipValue(formData.fullName),
        email: normalizeInternshipValue(formData.email)?.toLowerCase(),
        phone: normalizeInternshipValue(formData.phone),
        it_background: formData.itBackground,
        laptop_status: formData.laptopStatus,
        mode_of_learning: formData.modeOfLearning,
        school: normalizeInternshipValue(formData.school),
        department_option: normalizeInternshipValue(formData.departmentOption),
        academic_level: normalizeInternshipValue(formData.academicLevel),
        program_option: formData.programOption,
        program_option_other: formData.programOption === otherOptionValue ? normalizeInternshipValue(formData.programOptionOther) : null,
        internship_period: formData.internshipPeriod,
        internship_period_other: formData.internshipPeriod === otherOptionValue ? normalizeInternshipValue(formData.internshipPeriodOther) : null,
        fee_structure: formData.feeStructure,
        payment_method: formData.paymentMethod,
        document_submission_method: 'office_drop_off',
        source: 'website',
        metadata: {
            submitted_from: '/internship',
            supporting_documents: 'office_drop_off',
        },
    }

    const { error } = await supabase.from('internship_applications').insert(payload)

    if (error) {
        throw new Error(error.message || 'We could not submit your application right now. Please try again.')
    }

    return 'Application submitted successfully. If you have an internship letter or supporting documents, please drop them at the Malingo office.'
}