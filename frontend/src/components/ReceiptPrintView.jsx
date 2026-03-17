import { currency, formatDate } from '../utils/calculations.js';
import { AppLogo } from './AppLogo.jsx';

export function ReceiptPrintView({ payment, owner }) {
  if (!payment) return null;

  return (
    <div className="print-only hidden p-8 pb-16 text-slate-900 border border-slate-200 h-full">
      <div className="flex items-center justify-between mb-8 border-b border-slate-200 pb-6">
        <div>
          <AppLogo />
          <h1 className="mt-2 text-xl font-bold uppercase tracking-widest text-slate-900">Payment Receipt</h1>
        </div>
        <div className="text-right">
          <p className="font-semibold text-lg">{owner?.name || 'Loan Manager'}</p>
          <p className="text-sm text-slate-500">Date: {formatDate(new Date().toISOString())}</p>
          <p className="text-sm text-slate-500">Receipt #: RCP-{payment.id.slice(0, 8).toUpperCase()}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-8 mb-8">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-1">Received From</p>
          <p className="text-lg font-bold">{payment.customerName}</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-1">Payment Method</p>
          <p className="text-lg font-semibold uppercase">{payment.paymentMethod}</p>
        </div>
      </div>

      <div className="mb-12 border rounded-xl border-slate-200 overflow-hidden">
         <div className="grid grid-cols-3 bg-slate-100 p-3 text-xs font-semibold uppercase tracking-widest text-slate-500 border-b border-slate-200">
           <span>Description</span>
           <span className="text-center">Date</span>
           <span className="text-right">Amount</span>
         </div>
         <div className="grid grid-cols-3 p-4 text-sm font-medium">
           <span>Loan Installment ({payment.note || 'No note'})</span>
           <span className="text-center">{formatDate(payment.paymentDate)}</span>
           <span className="text-right text-lg font-bold">{currency.format(payment.amount)}</span>
         </div>
      </div>

      <div className="flex justify-end mb-16">
        <div className="w-64">
           <div className="flex justify-between py-2 border-b border-slate-200">
             <span className="text-slate-500 text-sm">Amount Paid</span>
             <span className="font-semibold">{currency.format(payment.amount)}</span>
           </div>
           <div className="flex justify-between py-2 border-b border-slate-200 text-slate-500">
              <span className="text-sm">Remaining Balance</span>
              <span className="font-medium">{currency.format(payment.remainingBalance)}</span>
           </div>
           <div className="flex justify-between py-4 text-lg font-bold">
              <span>Total Received</span>
              <span>{currency.format(payment.amount)}</span>
           </div>
        </div>
      </div>

      <div className="mt-auto pt-16 border-t border-slate-200 grid grid-cols-2 gap-8 text-center">
         <div>
            <div className="border-b border-slate-300 w-48 mx-auto -mt-4 mb-2 h-12"></div>
            <p className="text-xs uppercase font-semibold text-slate-500 tracking-widest">Customer Signature</p>
         </div>
         <div>
            <div className="border-b border-slate-300 w-48 mx-auto -mt-4 mb-2 h-12"></div>
            <p className="text-xs uppercase font-semibold text-slate-500 tracking-widest">Authorized Signatory</p>
         </div>
      </div>
    </div>
  );
}
