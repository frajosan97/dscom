<?php

namespace App\Services;

use GuzzleHttp\Client;
use GuzzleHttp\Exception\RequestException;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\ValidationException;
use Carbon\Carbon;

class SmsService
{
    protected $apiKey;
    protected $partnerId;
    protected $apiBaseUrl;
    protected $senderId;
    protected $client;
    protected $maxBulkMessages = 20;

    public function __construct()
    {
        $this->apiKey = config('services.sms.api_key');
        $this->partnerId = config('services.sms.partner_id');
        $this->apiBaseUrl = rtrim(config('services.sms.api_url'), '/');
        $this->senderId = config('services.sms.sender_id');

        $this->client = new Client([
            'timeout' => 30,
            'connect_timeout' => 10,
            'verify' => config('app.env') === 'production', // Verify SSL in production
        ]);
    }

    /**
     * Send a single SMS message
     *
     * @param string $mobile Recipient phone number (format: 2547XXXXXXXX)
     * @param string $message SMS content
     * @param string|null $scheduleTime Optional schedule time (format: Y-m-d H:i)
     * @param string|null $clientSmsId Optional client reference ID
     * @return array|false
     * @throws ValidationException
     */
    public function sendSms(
        string $mobile,
        string $message,
        ?string $scheduleTime = null,
        ?string $clientSmsId = null
    ) {
        // Validate input
        $validator = Validator::make([
            'mobile' => $mobile,
            'message' => $message,
            'scheduleTime' => $scheduleTime,
            'clientSmsId' => $clientSmsId,
        ], [
            'mobile' => ['required'],
            'message' => 'required|string',
            'scheduleTime' => 'nullable|date_format:Y-m-d H:i|after_or_equal:now',
            'clientSmsId' => 'nullable|string|max:50',
        ]);

        if ($validator->fails()) {
            throw new ValidationException($validator);
        }

        // Prepare request data
        $payload = [
            'apikey' => $this->apiKey,
            'partnerID' => $this->partnerId,
            'message' => $message,
            'shortcode' => $this->senderId,
            'mobile' => formatPhoneNumber($mobile),
        ];

        if ($scheduleTime) {
            $payload['timeToSend'] = $scheduleTime;
        }

        if ($clientSmsId) {
            $payload['clientsmsid'] = $clientSmsId;
        }

        try {
            $response = $this->client->post("{$this->apiBaseUrl}/api/services/sendsms/", [
                'headers' => [
                    'Accept' => 'application/json',
                    'Content-Type' => 'application/json',
                ],
                'json' => $payload,
            ]);

            $responseData = json_decode($response->getBody(), true);

            return $responseData['responses'][0] ?? false;

            // if (!isset($responseData['responses'][0]['respose-code'])) {
            //     Log::error('Invalid SMS API response format', ['response' => $responseData]);
            //     return false;
            // }

            // return $responseData['responses'][0];
        } catch (RequestException $e) {
            $this->logRequestException($e, 'Single SMS sending failed');
            return false;
        }
    }

    /**
     * Send bulk SMS messages (up to 20 at once)
     *
     * @param array $messages Array of message arrays with keys: mobile, message, scheduleTime (optional), clientSmsId (optional)
     * @return array|false
     * @throws ValidationException
     */
    public function sendBulkSms(array $messages)
    {
        if (count($messages) > $this->maxBulkMessages) {
            throw new \InvalidArgumentException("Maximum {$this->maxBulkMessages} messages can be sent in one request");
        }

        $smsList = [];
        $errors = [];

        foreach ($messages as $index => $message) {
            $validator = Validator::make($message, [
                'mobile' => ['required', 'regex:/^254[17]\d{8}$/'],
                'message' => 'required|string|max:160',
                'scheduleTime' => 'nullable|date_format:Y-m-d H:i|after_or_equal:now',
                'clientSmsId' => 'nullable|string|max:50',
            ]);

            if ($validator->fails()) {
                $errors["message_{$index}"] = $validator->errors()->all();
                continue;
            }

            $smsData = [
                'partnerID' => $this->partnerId,
                'apikey' => $this->apiKey,
                'pass_type' => 'plain',
                'mobile' => $message['mobile'],
                'message' => $message['message'],
                'shortcode' => $this->senderId,
            ];

            if (!empty($message['clientSmsId'])) {
                $smsData['clientsmsid'] = $message['clientSmsId'];
            }

            if (!empty($message['scheduleTime'])) {
                $smsData['timeToSend'] = $message['scheduleTime'];
            }

            $smsList[] = $smsData;
        }

        if (!empty($errors)) {
            throw new ValidationException(Validator::make([], []), null, $errors);
        }

        if (empty($smsList)) {
            throw new \InvalidArgumentException("No valid messages to send");
        }

        try {
            $response = $this->client->post("{$this->apiBaseUrl}/api/services/sendbulk/", [
                'headers' => [
                    'Accept' => 'application/json',
                    'Content-Type' => 'application/json',
                ],
                'json' => [
                    'count' => count($smsList),
                    'smslist' => $smsList,
                ],
            ]);

            $responseData = json_decode($response->getBody(), true);

            if (!isset($responseData['responses'])) {
                Log::error('Invalid Bulk SMS API response format', ['response' => $responseData]);
                return false;
            }

            return $responseData['responses'];
        } catch (RequestException $e) {
            $this->logRequestException($e, 'Bulk SMS sending failed');
            return false;
        }
    }

    /**
     * Get delivery report for a message
     *
     * @param string $messageId The message ID returned when sending the SMS
     * @return array|false
     */
    public function getDeliveryReport(string $messageId)
    {
        if (empty($messageId)) {
            throw new \InvalidArgumentException("Message ID is required");
        }

        try {
            $response = $this->client->post("{$this->apiBaseUrl}/api/services/getdlr/", [
                'headers' => [
                    'Accept' => 'application/json',
                    'Content-Type' => 'application/json',
                ],
                'json' => [
                    'apikey' => $this->apiKey,
                    'partnerID' => $this->partnerId,
                    'messageID' => $messageId,
                ],
            ]);

            $responseData = json_decode($response->getBody(), true);

            if (!isset($responseData['responses'])) {
                Log::error('Invalid Delivery Report API response format', ['response' => $responseData]);
                return false;
            }

            return $responseData['responses'];
        } catch (RequestException $e) {
            $this->logRequestException($e, 'Delivery report fetch failed');
            return false;
        }
    }

    /**
     * Get account balance
     *
     * @return array|false
     */
    public function getBalance()
    {
        try {
            $response = $this->client->post("{$this->apiBaseUrl}/api/services/getbalance/", [
                'headers' => [
                    'Accept' => 'application/json',
                    'Content-Type' => 'application/json',
                ],
                'json' => [
                    'apikey' => $this->apiKey,
                    'partnerID' => $this->partnerId,
                ],
            ]);

            $responseData = json_decode($response->getBody(), true);

            if (!isset($responseData['responses'])) {
                Log::error('Invalid Balance API response format', ['response' => $responseData]);
                return false;
            }

            return $responseData['responses'];
        } catch (RequestException $e) {
            $this->logRequestException($e, 'Balance check failed');
            return false;
        }
    }

    /**
     * Handle and log request exceptions
     */
    protected function logRequestException(RequestException $e, string $context): void
    {
        if ($e->hasResponse()) {
            $response = $e->getResponse();
            $statusCode = $response->getStatusCode();
            $body = json_decode((string) $response->getBody(), true);

            Log::error("{$context}: HTTP {$statusCode}", [
                'response' => $body,
                'exception' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
        } else {
            Log::error("{$context}: No response received", [
                'exception' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
            ]);
        }
    }

    /**
     * Get the maximum number of messages allowed in bulk send
     */
    public function getMaxBulkMessages(): int
    {
        return $this->maxBulkMessages;
    }

    /**
     * Validate a phone number
     */
    public function validatePhoneNumber(string $phone): bool
    {
        return preg_match('/^254[17]\d{8}$/', $phone) === 1;
    }
}
