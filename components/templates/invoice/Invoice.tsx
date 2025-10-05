'use client';

export type InvoiceVariant =
  | 'standard'
  | 'modern'
  | 'simple'
  | 'professional'
  | 'creative'
  | 'minimal'
  | 'service'
  | 'product'
  | 'freelance';

export interface InvoiceProps {
  variant?: InvoiceVariant;
}

export function Invoice({ variant = 'standard' }: InvoiceProps) {
  if (variant === 'standard') {
    return (
      <div className='h-[520px] w-[400px] overflow-hidden rounded-lg bg-white p-8 shadow-xl'>
        <div className='mb-8 flex items-start justify-between'>
          <div>
            <h1 className='mb-1 text-[24px] font-bold text-slate-900'>INVOICE</h1>
            <p className='text-[11px] text-slate-600'>#INV-2025-1042</p>
          </div>
          <div className='text-right text-[10px] text-slate-600'>
            <div className='text-[14px] font-bold text-slate-900'>Your Company</div>
            <div>123 Business St</div>
            <div>New York, NY 10001</div>
          </div>
        </div>
        <div className='mb-6 grid grid-cols-2 gap-6 text-[10px] text-slate-600'>
          <div>
            <h3 className='mb-1 text-[11px] font-bold text-slate-900'>BILL TO</h3>
            <div>Client Name</div>
            <div>456 Client Ave</div>
            <div>Boston, MA 02101</div>
          </div>
          <div>
            <h3 className='mb-1 text-[11px] font-bold text-slate-900'>INVOICE DATE</h3>
            <div>October 4, 2025</div>
            <div className='mt-2 text-slate-900'>
              <span className='font-semibold'>DUE DATE</span>
              <div className='text-slate-600'>November 4, 2025</div>
            </div>
          </div>
        </div>
        <div className='mb-4 border-t border-slate-200 pt-4 text-[10px]'>
          <div className='mb-2 grid grid-cols-12 gap-2 font-semibold text-slate-900'>
            <div className='col-span-6'>DESCRIPTION</div>
            <div className='col-span-2 text-right'>QTY</div>
            <div className='col-span-2 text-right'>RATE</div>
            <div className='col-span-2 text-right'>AMOUNT</div>
          </div>
          {[
            ['Web Design Services', '1', '$2,500', '$2,500'],
            ['Development Hours', '40', '$150', '$6,000'],
            ['Hosting & Domain', '1', '$500', '$500'],
          ].map(([desc, qty, rate, amount]) => (
            <div key={desc} className='grid grid-cols-12 gap-2 text-slate-600'>
              <div className='col-span-6'>{desc}</div>
              <div className='col-span-2 text-right'>{qty}</div>
              <div className='col-span-2 text-right'>{rate}</div>
              <div className='col-span-2 text-right'>{amount}</div>
            </div>
          ))}
        </div>
        <div className='mt-auto border-t border-slate-200 pt-4'>
          <div className='ml-auto w-48 text-[10px] text-slate-600'>
            <div className='mb-1 flex justify-between'>
              <span>Subtotal</span>
              <span>$9,000</span>
            </div>
            <div className='mb-2 flex justify-between'>
              <span>Tax (10%)</span>
              <span>$900</span>
            </div>
            <div className='flex justify-between border-t border-slate-200 pt-2 text-[14px] font-bold text-slate-900'>
              <span>TOTAL</span>
              <span>$9,900</span>
            </div>
          </div>
        </div>
        <div className='mt-6 text-center text-[9px] text-slate-500'>Thank you for your business!</div>
      </div>
    );
  }

  if (variant === 'modern') {
    return (
      <div className='h-[520px] w-[400px] overflow-hidden rounded-lg bg-slate-50 shadow-xl'>
        <div className='bg-blue-600 p-6 text-white'>
          <div className='flex items-start justify-between'>
            <div>
              <h1 className='mb-1 text-[28px] font-bold'>Invoice</h1>
              <p className='text-[12px]'>#2025-1042</p>
            </div>
            <div className='h-12 w-12 rounded-lg bg-white/20' />
          </div>
        </div>
        <div className='space-y-5 p-6'>
          <div className='grid grid-cols-2 gap-4 text-[9px] text-slate-600'>
            <div className='rounded-lg bg-white p-3'>
              <div className='mb-1 font-semibold text-slate-500'>FROM</div>
              <div className='text-[11px] font-semibold text-slate-900'>Design Studio Inc</div>
              <div>design@studio.com</div>
            </div>
            <div className='rounded-lg bg-white p-3'>
              <div className='mb-1 font-semibold text-slate-500'>TO</div>
              <div className='text-[11px] font-semibold text-slate-900'>Client Corp</div>
              <div>client@corp.com</div>
            </div>
          </div>
          <div className='rounded-lg bg-white p-4 text-[10px]'>
            <div className='mb-1 flex justify-between text-slate-600'>
              <span>Issue Date</span>
              <span className='font-semibold text-slate-900'>Oct 4, 2025</span>
            </div>
            <div className='flex justify-between text-slate-600'>
              <span>Due Date</span>
              <span className='font-semibold text-slate-900'>Nov 4, 2025</span>
            </div>
          </div>
          <div className='rounded-lg bg-white p-4 text-[10px]'>
            {[
              ['Website Redesign', '$5,000'],
              ['Logo Design', '$1,500'],
              ['Brand Guidelines', '$800'],
            ].map(([desc, amount]) => (
              <div key={desc} className='mb-2 flex justify-between last:mb-0'>
                <span className='text-slate-600'>{desc}</span>
                <span className='font-semibold text-slate-900'>{amount}</span>
              </div>
            ))}
            <div className='mt-3 flex justify-between border-t border-slate-200 pt-3 text-[16px] font-bold text-blue-600'>
              <span>Total</span>
              <span>$7,300</span>
            </div>
          </div>
          <div className='rounded-lg bg-blue-50 p-3 text-center text-[10px] font-semibold text-blue-900'>
            Payment due within 30 days
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='h-[520px] w-[400px] overflow-hidden rounded-lg bg-white p-8 shadow-xl'>
      <div className='mb-6 border-b-2 border-slate-900 pb-4'>
        <h1 className='text-[32px] font-light text-slate-900'>Invoice</h1>
      </div>
      <div className='mb-6 grid grid-cols-2 gap-4 text-[11px] text-slate-600'>
        <div>
          <div className='font-semibold text-slate-900'>Invoice Number</div>
          <div>INV-2025-1042</div>
        </div>
        <div>
          <div className='font-semibold text-slate-900'>Date</div>
          <div>October 4, 2025</div>
        </div>
        <div>
          <div className='font-semibold text-slate-900'>Due</div>
          <div>November 4, 2025</div>
        </div>
      </div>
      <div className='mb-6 grid grid-cols-2 gap-4 text-[11px] text-slate-600'>
        <div>
          <div className='mb-1 font-semibold text-slate-900'>From</div>
          <div>Freelance Services</div>
          <div>freelance@email.com</div>
        </div>
        <div>
          <div className='mb-1 font-semibold text-slate-900'>To</div>
          <div>Business Client</div>
          <div>client@business.com</div>
        </div>
      </div>
      <table className='mb-6 w-full text-[11px] text-slate-600'>
        <thead className='border-b border-slate-200 text-[10px] font-semibold text-slate-900'>
          <tr>
            <th className='py-2 text-left'>Service</th>
            <th className='py-2 text-right'>Amount</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className='py-2'>Consulting Services</td>
            <td className='py-2 text-right'>$3,000</td>
          </tr>
          <tr>
            <td className='py-2'>Project Management</td>
            <td className='py-2 text-right'>$2,000</td>
          </tr>
          <tr>
            <td className='py-2'>Implementation</td>
            <td className='py-2 text-right'>$1,500</td>
          </tr>
        </tbody>
      </table>
      <div className='border-t-2 border-slate-900 pt-4'>
        <div className='flex justify-between text-[18px] font-semibold text-slate-900'>
          <span>Total Due</span>
          <span>$6,500</span>
        </div>
      </div>
      <div className='mt-6 text-center text-[10px] text-slate-500'>Payment terms: Net 30 days</div>
    </div>
  );
}
