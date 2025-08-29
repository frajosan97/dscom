<?php

namespace App\Http\Requests\Service;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            // Customer information
            'customer.customer_id' => 'required|integer|exists:users,id',
            'customer.customer_name' => 'required|string|max:255',
            'customer.customer_phone' => 'required|string|max:20',
            'customer.customer_email' => 'required|email|max:255',
            'customer.customer_address' => 'nullable|string|max:500',
            'customer.customer_city' => 'nullable|string|max:100',
            'customer.customer_country' => 'nullable|string|max:100',

            // Job details
            'job_details.order_number' => 'nullable|string|max:50|unique:repair_orders,order_number',
            'job_details.entry_date' => 'required|date',
            'job_details.company' => 'required|string|max:100',
            'job_details.brand' => 'nullable|string|max:100',
            'job_details.model' => 'required|string|max:100',
            'job_details.serial' => 'required|string|max:100',
            'job_details.specs' => 'nullable|string',
            'job_details.password' => 'nullable|string|max:100',
            'job_details.color' => 'nullable|string|max:50',
            'job_details.issue' => 'required|string',
            'job_details.remarks' => 'nullable|string',
            'job_details.provider' => 'nullable|string|max:255',
            'job_details.warranty' => 'required|string|in:in,out',
            'job_details.priority' => 'required|string|in:low,medium,high,urgent,normal',
            'job_details.status' => 'required|string',
            'job_details.expected_completion_date' => 'nullable|date',
            'job_details.repair_service_id' => 'required|integer|exists:repair_services,id',
            'job_details.complaint' => 'required|integer',

            // Initial check
            'initial_check.display' => 'nullable|string',
            'initial_check.back_panel' => 'nullable|string',
            'initial_check.status' => 'nullable|string',
            'initial_check.physical_condition' => 'nullable|string',
            'initial_check.risk_agreed' => 'nullable|string',
            'initial_check.accessories' => 'nullable|array',
            'initial_check.remarks' => 'nullable|string',
            'initial_check.checked_by' => 'nullable|string',
            'initial_check.check_date' => 'nullable|date',
            'initial_check.physicalCondition' => 'nullable|string|max:100',
            'initial_check.riskAgreement' => 'nullable|string|max:100',

            // Payment info
            'payment_info.diagnosis_fee' => 'nullable|numeric|min:0',
            'payment_info.estimated_cost' => 'nullable|numeric|min:0',
            'payment_info.balanceAccount' => 'nullable|string',

            // Other info
            // 'other_info.estimated_cost' => 'nullable|numeric|min:0',
            // 'other_info.diagnosis_fee' => 'nullable|numeric|min:0',
            'other_info.final_cost' => 'nullable|numeric|min:0',
            'other_info.tax_amount' => 'nullable|numeric|min:0',
            'other_info.discount_amount' => 'nullable|numeric|min:0',
            'other_info.total_amount' => 'nullable|numeric|min:0',
            'other_info.completion_date' => 'nullable|date',
            'other_info.signature' => 'nullable|string',
            'other_info.notification_channel' => 'nullable|array',
            'other_info.notification_channel.*' => 'nullable|string|in:sms,whatsapp,email',
            'other_info.attachments' => 'nullable|array',

            // File attachments
            'attachments' => 'nullable|array',
            'attachments.*' => 'nullable|file|mimes:jpeg,png,jpg,gif,pdf,doc,docx|max:10240',
        ];
    }

    /**
     * Get custom messages for validator errors.
     */
    public function messages(): array
    {
        return [
            'customer.customer_id.required' => 'Customer ID is required',
            'customer.customer_name.required' => 'Customer name is required',
            'customer.customer_phone.required' => 'Customer phone number is required',
            'customer.customer_email.required' => 'Customer email is required',
            'job_details.entry_date.required' => 'Entry date is required',
            'job_details.company.required' => 'Device company is required',
            'job_details.model.required' => 'Device model is required',
            'job_details.serial.required' => 'Serial number is required',
            'job_details.issue.required' => 'Issue description is required',
            'job_details.warranty.required' => 'Warranty status is required',
            'job_details.priority.required' => 'Priority level is required',
            'job_details.status.required' => 'Job status is required',
            'job_details.repair_service_id.required' => 'Repair service is required',
        ];
    }

    /**
     * Prepare the data for validation.
     */
    protected function prepareForValidation(): void
    {
        $this->merge([
            'customer' => $this->decodeJsonField('customer'),
            'job_details' => $this->decodeJsonField('job_details'),
            'initial_check' => $this->decodeJsonField('initial_check'),
            'payment_info' => $this->decodeJsonField('payment_info'),
            'other_info' => $this->decodeJsonField('other_info'),
        ]);
    }

    /**
     * Decode JSON field if it's a string.
     */
    private function decodeJsonField(string $field): array
    {
        $value = $this->{$field};

        if (is_string($value)) {
            return json_decode($value, true) ?? [];
        }

        return is_array($value) ? $value : [];
    }
}