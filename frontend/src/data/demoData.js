export const ownerSeed = {
  name: 'Demo Owner',
  phone: '9999999999',
  password: 'admin123',
};

export const demoState = {
  customers: [
    {
      id: 'cust-1',
      name: 'Ravi Kumar',
      phoneNumber: '9876543210',
      address: 'JP Nagar, Bengaluru',
      aadhaarNumber: '1234-5678-9012',
      panNumber: 'ABCDE1234F',
      documents: [{ id: 'doc-1', name: 'aadhaar-ravi.pdf', filePath: '/offline/aadhaar-ravi.pdf' }],
      createdAt: '2026-03-01T10:00:00.000Z',
    },
    {
      id: 'cust-2',
      name: 'Anita Sharma',
      phoneNumber: '9988776655',
      address: 'Anna Nagar, Chennai',
      aadhaarNumber: '9876-5432-1098',
      panNumber: 'PQRSX9876K',
      documents: [{ id: 'doc-2', name: 'pan-anita.pdf', filePath: '/offline/pan-anita.pdf' }],
      createdAt: '2026-03-05T12:00:00.000Z',
    }
  ],
  loans: [
    {
      id: 'loan-1',
      customerId: 'cust-1',
      loanAmount: 50000,
      interestRate: 12,
      loanDate: '2026-03-01',
      duration: 90,
      durationUnit: 'days',
      interestType: 'simple',
      status: 'active',
      collateral: {
        itemName: 'Gold chain',
        itemValue: 62000,
        description: '22k gold chain',
        image: { filePath: '/offline/gold-chain.png' }
      },
      documents: [{ id: 'loan-doc-1', documentType: 'loan-agreement', name: 'Loan agreement', filePath: '/offline/loan-agreement.pdf' }],
      signature: { filePath: '/offline/signature-ravi.png' },
      notes: 'Vehicle repair capital'
    },
    {
      id: 'loan-2',
      customerId: 'cust-2',
      loanAmount: 30000,
      interestRate: 2.5,
      loanDate: '2026-03-10',
      duration: 6,
      durationUnit: 'months',
      interestType: 'monthly',
      status: 'active',
      collateral: {
        itemName: 'Silver anklet',
        itemValue: 15000,
        description: 'Pair of anklets',
        image: { filePath: '/offline/silver-anklet.png' }
      },
      documents: [],
      signature: { filePath: '' },
      notes: 'Working capital'
    }
  ],
  payments: [
    {
      id: 'pay-1',
      loanId: 'loan-1',
      customerId: 'cust-1',
      paymentDate: '2026-03-08',
      amount: 8000,
      paymentMethod: 'upi',
      note: 'First installment'
    }
  ],
  ledgerEntries: [
    {
      id: 'led-1',
      customerId: 'cust-1',
      type: 'debit',
      amount: 50000,
      debit: 50000,
      credit: 0,
      balance: -50000,
      transactionDate: '2026-03-01',
      description: 'Loan disbursed'
    },
    {
      id: 'led-2',
      customerId: 'cust-1',
      type: 'credit',
      amount: 8000,
      debit: 0,
      credit: 8000,
      balance: -42000,
      transactionDate: '2026-03-08',
      description: 'Installment received'
    }
  ]
};
