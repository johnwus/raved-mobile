declare module 'paystack' {
  interface PaystackConfig {
    secretKey: string;
  }

  interface TransactionInitializeData {
    email: string;
    amount: number;
    reference?: string;
    name?: string;
    metadata?: any;
    callback_url?: string;
    [key: string]: any;
  }

  interface TransactionInitializeResponse {
    status: boolean;
    message: string;
    data: {
      authorization_url: string;
      access_code: string;
      reference: string;
      [key: string]: any;
    };
  }

  interface TransactionVerifyResponse {
    status: boolean;
    message: string;
    data: {
      status: string;
      reference: string;
      amount: number;
      customer: {
        email: string;
        [key: string]: any;
      };
      [key: string]: any;
    };
  }

  interface PaystackInstance {
    transaction: {
      initialize: (data: TransactionInitializeData) => Promise<TransactionInitializeResponse>;
      verify: (reference: string) => Promise<TransactionVerifyResponse>;
      [key: string]: any;
    };
    [key: string]: any;
  }

  function paystack(secretKey: string): PaystackInstance;
  export = paystack;
}