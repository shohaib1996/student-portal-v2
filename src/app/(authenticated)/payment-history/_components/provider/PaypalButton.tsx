import React, { useState } from 'react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { instance } from '@/lib/axios/axiosInstance';

// Renders errors or successfull transactions on the screen.
function Message({ content }: any) {
    return <p>{content}</p>;
}

interface PaypalButtonProps {
    trxId: string;
    paypalConfig: any;
    onSuccess: () => void;
    onError: () => void;
}

function PaypalButton({
    trxId,
    paypalConfig,
    onSuccess,
    onError,
}: PaypalButtonProps) {
    const initialOptions = {
        'client-id': paypalConfig.clientId,
        'enable-funding': 'venmo',
        'disable-funding': '',
        // 'buyer-country': 'US',
        currency: 'USD',
        'data-page-type': 'product-details',
        components: 'buttons',
        'data-sdk-integration-source': 'developer-studio',
    };

    const [message, setMessage] = useState('');

    return (
        <div className='App'>
            <PayPalScriptProvider options={initialOptions as any}>
                <PayPalButtons
                    style={{
                        shape: 'rect',
                        layout: 'vertical',
                        color: 'gold',
                        label: 'paypal',
                    }}
                    createOrder={async () => {
                        try {
                            const response = await instance.post(
                                '/transaction/paypal/ordercreate',
                                {
                                    trxId,
                                },
                            );
                            const orderData = response.data?.jsonResponse;

                            if (orderData.id) {
                                return orderData.id;
                            } else {
                                const errorDetail = orderData?.details?.[0];
                                const errorMessage = errorDetail
                                    ? `${errorDetail.issue} ${errorDetail.description} (${orderData.debug_id})`
                                    : JSON.stringify(orderData);

                                throw new Error(errorMessage);
                            }
                        } catch (error) {
                            console.error(error);
                            setMessage(
                                `Could not initiate PayPal Checkout...${error}`,
                            );
                        }
                    }}
                    onApprove={async (data, actions) => {
                        try {
                            const response = await instance.post(
                                `/transaction/paypal/ordercapture`,
                                {
                                    orderID: data.orderID,
                                    trxId,
                                },
                            );

                            const orderData = response.data?.jsonResponse;
                            // Three cases to handle:
                            //   (1) Recoverable INSTRUMENT_DECLINED -> call actions.restart()
                            //   (2) Other non-recoverable errors -> Show a failure message
                            //   (3) Successful transaction -> Show confirmation or thank you message

                            const errorDetail = orderData?.details?.[0];

                            if (errorDetail?.issue === 'INSTRUMENT_DECLINED') {
                                // (1) Recoverable INSTRUMENT_DECLINED -> call actions.restart()
                                // recoverable state, per https://developer.paypal.com/docs/checkout/standard/customize/handle-funding-failures/
                                return actions.restart();
                            } else if (errorDetail) {
                                // (2) Other non-recoverable errors -> Show a failure message
                                throw new Error(
                                    `${errorDetail.description} (${orderData.debug_id})`,
                                );
                            } else {
                                // (3) Successful transaction -> Show confirmation or thank you message
                                // Or go to another URL:  actions.redirect('thank_you.html');
                                const transaction =
                                    orderData.purchase_units[0].payments
                                        .captures[0];
                                setMessage(
                                    `Transaction ${transaction.status}: ${transaction.id}. See console for all available details`,
                                );
                                console.log(
                                    'Capture result',
                                    orderData,
                                    JSON.stringify(orderData, null, 2),
                                );
                                onSuccess();
                            }
                        } catch (error) {
                            console.error(error);
                            setMessage(
                                `Sorry, your transaction could not be processed...${error}`,
                            );
                            onError();
                        }
                    }}
                />
            </PayPalScriptProvider>
            <Message content={message} />
        </div>
    );
}

export default PaypalButton;
