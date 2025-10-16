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
  | 'freelance'
  | 'gradient-header'
  | 'clean-blue'
  | 'modern-teal'
  | 'minimal-gray'
  | 'gradient-creative';

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

  if (variant === 'gradient-header') {
    return (
      <div className='h-[520px] w-[400px] overflow-hidden rounded-xl bg-white shadow-xl'>
        <div className='bg-gradient-to-r from-indigo-500 to-sky-500 p-6 text-white'>
          <div className='flex items-center justify-between'>
            <div>
              <p className='text-[11px] uppercase tracking-wide text-indigo-100'>Invoice</p>
              <h1 className='text-[28px] font-bold'>INVOICE</h1>
            </div>
            <div className='text-right text-[10px] text-indigo-100'>
              <p>Pelican Group</p>
              <p>billing@pelicangroup.com</p>
            </div>
          </div>
        </div>
        <div className='space-y-5 p-6 text-[11px] text-slate-600'>
          <div className='flex items-center justify-between rounded-lg border border-indigo-100/60 bg-indigo-50/40 p-3'>
            <span className='font-semibold text-indigo-600'>Invoice #2025-014</span>
            <span className='font-semibold text-indigo-600'>Due Nov 04, 2025</span>
          </div>
          <div className='space-y-3 rounded-lg border border-slate-200 p-4'>
            {[
              ['Product Design Sprint', '$3,200.00'],
              ['Brand Identity Kit', '$1,400.00'],
              ['User Testing Sessions', '$650.00'],
            ].map(([label, value]) => (
              <div key={label} className='flex items-center justify-between'>
                <span>{label}</span>
                <span className='font-semibold text-slate-800'>{value}</span>
              </div>
            ))}
            <div className='flex items-center justify-between border-t border-slate-200 pt-3 text-[13px] font-bold text-indigo-600'>
              <span>Total Due</span>
              <span>$5,250.00</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'clean-blue') {
    return (
      <div className='h-[520px] w-[400px] overflow-hidden rounded-xl border border-slate-100 bg-slate-50 shadow-xl'>
        <div className='flex items-center justify-between bg-white px-6 py-5'>
          <div>
            <p className='text-[10px] font-semibold uppercase tracking-widest text-slate-400'>Invoice #0001</p>
            <h1 className='text-[26px] font-bold text-slate-900'>Pelican Group</h1>
          </div>
          <div className='h-12 w-12 rounded-lg bg-slate-200' />
        </div>
        <div className='space-y-5 px-6 py-6 text-[11px] text-slate-600'>
          <div className='grid grid-cols-2 gap-4'>
            <div className='rounded-lg bg-white p-4'>
              <p className='text-[10px] font-semibold text-slate-500'>Billed To</p>
              <p className='mt-1 font-semibold text-slate-900'>Northwind LLC</p>
              <p>billing@northwind.com</p>
            </div>
            <div className='rounded-lg bg-white p-4'>
              <p className='text-[10px] font-semibold text-slate-500'>Dates</p>
              <p className='mt-1 font-semibold text-slate-900'>Issued Oct 01</p>
              <p>Due Nov 01</p>
            </div>
          </div>
          <div className='rounded-lg bg-white p-4'>
            <div className='flex items-center justify-between text-[10px] font-semibold text-slate-500'>
              <span>Item</span>
              <span>Amount</span>
            </div>
            <div className='mt-3 space-y-2 text-[11px]'>
              <div className='flex items-center justify-between'>
                <span>Consulting Services</span>
                <span className='font-semibold text-slate-900'>$2,800.00</span>
              </div>
              <div className='flex items-center justify-between'>
                <span>Monthly Retainer</span>
                <span className='font-semibold text-slate-900'>$1,200.00</span>
              </div>
            </div>
            <div className='mt-4 flex items-center justify-between border-t border-slate-200 pt-3 text-[13px] font-bold text-slate-900'>
              <span>Total</span>
              <span>$4,000.00</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'modern-teal') {
    return (
      <div className='h-[520px] w-[400px] overflow-hidden rounded-xl bg-white shadow-xl'>
        <div className='bg-teal-500 px-6 py-5 text-white'>
          <p className='text-[11px] uppercase tracking-wide text-teal-100'>Invoice</p>
          <div className='flex items-center justify-between'>
            <h1 className='text-[30px] font-extrabold'>INVOICE</h1>
            <div className='text-right text-[10px] text-teal-100'>
              <p>Invoice #1048</p>
              <p>Issued Oct 04, 2025</p>
            </div>
          </div>
        </div>
        <div className='space-y-4 px-6 py-6 text-[11px] text-slate-600'>
          <div className='flex items-start justify-between rounded-xl border border-teal-100 bg-teal-50/60 p-4'>
            <div>
              <p className='text-[10px] font-semibold text-teal-600'>Bill To</p>
              <p className='mt-1 font-semibold text-slate-900'>Acme Robotics</p>
              <p>accounts@acmerobotics.io</p>
            </div>
            <div className='text-right'>
              <p className='text-[10px] font-semibold text-teal-600'>Payment Due</p>
              <p className='mt-1 font-semibold text-slate-900'>Nov 04, 2025</p>
            </div>
          </div>
          <div className='rounded-xl border border-slate-200 p-4'>
            {[
              ['Design Sprint', '$1,800'],
              ['Prototype Build', '$2,400'],
              ['User Testing', '$650'],
            ].map(([label, amt]) => (
              <div key={label} className='flex items-center justify-between py-2'>
                <span>{label}</span>
                <span className='font-semibold text-slate-900'>{amt}</span>
              </div>
            ))}
            <div className='mt-3 flex items-center justify-between border-t border-slate-200 pt-3 text-[13px] font-bold text-teal-600'>
              <span>Total</span>
              <span>$4,850</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'minimal-gray') {
    return (
      <div className='h-[520px] w-[400px] overflow-hidden rounded-xl border border-slate-200 bg-slate-50 p-8 shadow-xl'>
        <div className='flex items-center justify-between'>
          <div>
            <p className='text-[10px] font-semibold uppercase tracking-widest text-slate-400'>Invoice</p>
            <h1 className='text-[28px] font-bold text-slate-900'>INVOICE</h1>
          </div>
          <div className='h-10 w-10 rounded-lg bg-slate-300' />
        </div>
        <div className='mt-8 space-y-3 text-[11px] text-slate-600'>
          <div className='grid grid-cols-2 gap-4'>
            <div>
              <p className='text-[10px] font-semibold text-slate-500'>Bill To</p>
              <p className='font-semibold text-slate-900'>Studio Aurora</p>
              <p>hello@studioaurora.co</p>
            </div>
            <div>
              <p className='text-[10px] font-semibold text-slate-500'>Dates</p>
              <p className='font-semibold text-slate-900'>Issued Oct 4</p>
              <p>Due Nov 4</p>
            </div>
          </div>
        </div>
        <div className='mt-6 rounded-lg border border-slate-200 bg-white p-4 text-[11px]'>
          <div className='flex items-center justify-between border-b border-slate-200 pb-2 text-[10px] font-semibold text-slate-500'>
            <span>Description</span>
            <span>Amount</span>
          </div>
          <div className='space-y-2 pt-2'>
            <div className='flex items-center justify-between text-slate-700'>
              <span>Consulting Services</span>
              <span className='font-semibold text-slate-900'>$2,600</span>
            </div>
            <div className='flex items-center justify-between text-slate-700'>
              <span>Implementation</span>
              <span className='font-semibold text-slate-900'>$1,750</span>
            </div>
          </div>
          <div className='mt-3 flex items-center justify-between border-t border-slate-200 pt-3 text-[13px] font-bold text-slate-900'>
            <span>Total</span>
            <span>$4,350</span>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'gradient-creative') {
    return (
      <div className='h-[520px] w-[400px] overflow-hidden rounded-xl bg-gradient-to-br from-pink-500 via-fuchsia-500 to-indigo-500 p-8 text-white shadow-2xl'>
        <div className='flex items-center justify-between'>
          <h1 className='text-[30px] font-black'>INVOICE</h1>
          <div className='h-10 w-10 rounded-lg bg-white/20' />
        </div>
        <p className='mt-1 text-[11px] font-semibold uppercase tracking-widest text-white/70'>Invoice #5729</p>
        <div className='mt-8 grid grid-cols-2 gap-4 text-[11px]'>
          <div className='rounded-xl bg-white/10 p-4'>
            <p className='text-[10px] font-semibold text-white/70'>Bill To</p>
            <p className='mt-1 font-semibold text-white'>Lumen Studio</p>
            <p className='text-white/70'>accounts@lumen.studio</p>
          </div>
          <div className='rounded-xl bg-white/10 p-4'>
            <p className='text-[10px] font-semibold text-white/70'>Payment Due</p>
            <p className='mt-1 font-semibold text-white'>Nov 12, 2025</p>
            <p className='text-white/70'>Wire transfer • Net 30</p>
          </div>
        </div>
        <div className='mt-8 rounded-xl bg-white/10 p-4 text-[11px]'>
          {[
            ['UX Audit & Research', '$1,950'],
            ['Design System Build', '$2,650'],
            ['Handoff & Documentation', '$900'],
          ].map(([label, amount]) => (
            <div key={label} className='flex items-center justify-between py-2 text-white/90'>
              <span>{label}</span>
              <span className='font-semibold text-white'>{amount}</span>
            </div>
          ))}
          <div className='mt-3 flex items-center justify-between border-t border-white/30 pt-3 text-[14px] font-bold text-white'>
            <span>Total</span>
            <span>$5,500</span>
          </div>
        </div>
        <p className='mt-6 text-center text-[10px] uppercase tracking-widest text-white/60'>Thank you for your business</p>
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
