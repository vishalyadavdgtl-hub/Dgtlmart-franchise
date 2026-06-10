export const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export const displayRazorpay = async (orderData, onSuccess, onFailure) => {
  const res = await loadRazorpayScript();

  if (!res) {
    alert('Razorpay SDK failed to load. Please check your internet connection.');
    return;
  }

  const options = {
    key: import.meta.env.VITE_RAZORPAY_KEY_ID,
    amount: orderData.amount,
    currency: orderData.currency,
    name: 'DGTLmart Franchise',
    description: 'Franchise Package Purchase',
    order_id: orderData.id,
    handler: function (response) {
      onSuccess(response);
    },
    prefill: {
      name: orderData.prefill?.name || '',
      email: orderData.prefill?.email || '',
      contact: orderData.prefill?.contact || '',
    },
    theme: {
      color: '#0ea5e9',
    },
    modal: {
      ondismiss: function () {
        if (onFailure) {
          onFailure('Payment cancelled by user');
        }
      },
    },
  };

  const paymentObject = new window.Razorpay(options);
  paymentObject.open();
};
