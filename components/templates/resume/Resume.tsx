'use client';

import { Mail, Phone, MapPin, Briefcase, GraduationCap } from 'lucide-react';

export type ResumeVariant = 'professional' | 'creative' | 'minimal';

export interface ResumeProps {
  variant?: ResumeVariant;
}

export function Resume({ variant = 'professional' }: ResumeProps) {
  if (variant === 'professional') {
    return (
      <div className='h-[520px] w-[400px] overflow-hidden rounded-lg bg-white shadow-xl'>
        <div className='bg-slate-900 p-6 text-white'>
          <h1 className='mb-2 text-[28px] font-bold'>Emily Carter</h1>
          <p className='mb-4 text-[14px] text-slate-300'>Marketing Manager</p>
          <div className='space-y-1.5 text-[11px] font-light text-slate-200'>
            <div className='flex items-center gap-2'>
              <Mail className='h-3 w-3' /> emily.carter@email.com
            </div>
            <div className='flex items-center gap-2'>
              <Phone className='h-3 w-3' /> +1 (555) 321-7890
            </div>
            <div className='flex items-center gap-2'>
              <MapPin className='h-3 w-3' /> New York, NY
            </div>
          </div>
        </div>
        <div className='space-y-5 p-6'>
          <section>
            <div className='mb-3 flex items-center gap-2'>
              <Briefcase className='h-4 w-4 text-slate-700' />
              <h2 className='text-[14px] font-bold text-slate-900'>EXPERIENCE</h2>
            </div>
            <div className='space-y-3 text-[11px] text-slate-600'>
              <div>
                <h3 className='text-[13px] font-semibold text-slate-900'>Senior Marketing Manager</h3>
                <p className='font-medium'>Tech Corp • 2021 - Present</p>
                <p className='mt-1 text-[10px]'>Led digital campaigns that increased ROI by 150%.</p>
              </div>
              <div>
                <h3 className='text-[13px] font-semibold text-slate-900'>Marketing Specialist</h3>
                <p className='font-medium'>Growth Inc • 2018 - 2021</p>
                <p className='mt-1 text-[10px]'>Managed social media strategy for Fortune 500 clients.</p>
              </div>
            </div>
          </section>
          <section>
            <div className='mb-3 flex items-center gap-2'>
              <GraduationCap className='h-4 w-4 text-slate-700' />
              <h2 className='text-[14px] font-bold text-slate-900'>EDUCATION</h2>
            </div>
            <div className='text-[11px] text-slate-600'>
              <h3 className='text-[13px] font-semibold text-slate-900'>MBA, Marketing</h3>
              <p>Columbia Business School • 2018</p>
            </div>
          </section>
          <section>
            <h2 className='mb-2 text-[14px] font-bold text-slate-900'>SKILLS</h2>
            <div className='flex flex-wrap gap-2 text-[10px]'>
              {['Digital Marketing', 'SEO/SEM', 'Analytics', 'Leadership'].map((skill) => (
                <span key={skill} className='rounded bg-slate-100 px-2 py-1 text-slate-700'>
                  {skill}
                </span>
              ))}
            </div>
          </section>
        </div>
      </div>
    );
  }

  if (variant === 'creative') {
    return (
      <div className='h-[520px] w-[400px] overflow-hidden rounded-lg bg-gradient-to-br from-indigo-50 to-purple-50 shadow-xl'>
        <div className='p-6'>
          <div className='mb-6 flex items-start gap-4'>
            <div className='flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-[24px] font-bold text-white'>
              MC
            </div>
            <div className='space-y-1'>
              <h1 className='text-[26px] font-bold text-slate-900'>Michael Chen</h1>
              <p className='text-[13px] font-semibold text-indigo-600'>UX/UI Designer</p>
              <div className='text-[10px] text-slate-600'>
                <div>michael.chen@portfolio.com</div>
                <div>San Francisco, CA</div>
              </div>
            </div>
          </div>
          <div className='space-y-4 text-[10px] text-slate-600'>
            <div className='rounded-lg bg-white p-4'>
              <h2 className='mb-3 text-[12px] font-bold text-slate-900'>ABOUT ME</h2>
              <p>Passionate designer with 5+ years creating beautiful, user-centered digital experiences.</p>
            </div>
            <div className='rounded-lg bg-white p-4'>
              <h2 className='mb-3 text-[12px] font-bold text-slate-900'>EXPERIENCE</h2>
              <div className='space-y-2'>
                <div>
                  <div className='text-[11px] font-semibold text-slate-900'>Lead Designer</div>
                  <div>Design Studio • 2022-Present</div>
                </div>
                <div>
                  <div className='text-[11px] font-semibold text-slate-900'>UX Designer</div>
                  <div>Tech Startup • 2019-2022</div>
                </div>
              </div>
            </div>
            <div className='rounded-lg bg-white p-4'>
              <h2 className='mb-3 text-[12px] font-bold text-slate-900'>EXPERTISE</h2>
              <div className='grid grid-cols-2 gap-2'>
                {['Figma & Sketch', 'Prototyping', 'User Research', 'Design Systems'].map((item) => (
                  <span key={item}>• {item}</span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='h-[520px] w-[400px] overflow-hidden rounded-lg bg-white p-8 shadow-xl'>
      <div className='mb-8'>
        <h1 className='mb-1 text-[32px] font-light text-slate-900'>Lisa Johnson</h1>
        <div className='mb-3 h-0.5 w-12 bg-slate-900' />
        <p className='text-[13px] text-slate-600'>Software Engineer</p>
      </div>
      <div className='space-y-6 text-[10px] text-slate-600'>
        <section>
          <h2 className='mb-2 text-[11px] font-bold tracking-[0.1em] text-slate-900'>CONTACT</h2>
          <div className='space-y-1'>
            <div>lisa.johnson@email.com</div>
            <div>+1 (555) 789-0123</div>
            <div>Boston, MA</div>
          </div>
        </section>
        <section>
          <h2 className='mb-2 text-[11px] font-bold tracking-[0.1em] text-slate-900'>EXPERIENCE</h2>
          <div className='space-y-3'>
            <div>
              <div className='text-[11px] font-semibold text-slate-900'>Senior Software Engineer</div>
              <div>Innovation Labs | 2020 - Present</div>
            </div>
            <div>
              <div className='text-[11px] font-semibold text-slate-900'>Software Developer</div>
              <div>Code Company | 2017 - 2020</div>
            </div>
          </div>
        </section>
        <section>
          <h2 className='mb-2 text-[11px] font-bold tracking-[0.1em] text-slate-900'>EDUCATION</h2>
          <div className='text-[11px] font-semibold text-slate-900'>BS Computer Science</div>
          <div>MIT | 2017</div>
        </section>
        <section>
          <h2 className='mb-2 text-[11px] font-bold tracking-[0.1em] text-slate-900'>TECHNICAL SKILLS</h2>
          <div>JavaScript, Python, React, Node.js, PostgreSQL, AWS</div>
        </section>
      </div>
    </div>
  );
}
