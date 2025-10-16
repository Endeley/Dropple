'use client';

export type EducationVariant =
  | 'certificate'
  | 'certificate-gold'
  | 'award'
  | 'lesson-plan'
  | 'worksheet'
  | 'course-outline'
  | 'report-card'
  | 'study-guide'
  | 'class-schedule'
  | 'assignment'
  | 'syllabus'
  | 'attendance';

export interface EducationData {
  title: string;
  name: string;
  course: string;
  date: string;
  bgColor: string;
  accentColor: string;
  borderColor: string;
}

export interface EducationTemplateProps {
  variant: EducationVariant;
  customData?: Partial<EducationData>;
}

const DEFAULTS: Record<EducationVariant, EducationData> = {
  certificate: {
    title: 'Certificate of Completion',
    name: 'Student Name',
    course: 'Course Title',
    date: 'October 4, 2025',
    bgColor: '#ffffff',
    accentColor: '#1e40af',
    borderColor: '#dbeafe',
  },
  'certificate-gold': {
    title: 'Certificate of Achievement',
    name: 'Award Recipient',
    course: 'Excellence in Learning',
    date: '2025',
    bgColor: '#fffbea',
    accentColor: '#facc15',
    borderColor: '#fde68a',
  },
  award: {
    title: 'Achievement Award',
    name: 'Recipient Name',
    course: 'Excellence in Learning',
    date: '2025',
    bgColor: '#fef3c7',
    accentColor: '#92400e',
    borderColor: '#fcd34d',
  },
  'lesson-plan': {
    title: 'Lesson Plan',
    name: 'Subject: Mathematics',
    course: 'Grade 5',
    date: 'Week of Oct 4, 2025',
    bgColor: '#ffffff',
    accentColor: '#1f2937',
    borderColor: '#e5e7eb',
  },
  worksheet: {
    title: 'Student Worksheet',
    name: 'Name: ___________',
    course: 'Date: ___________',
    date: 'Class: ___________',
    bgColor: '#ffffff',
    accentColor: '#0f172a',
    borderColor: '#cbd5e1',
  },
  'course-outline': {
    title: 'Course Outline',
    name: 'Introduction to Programming',
    course: 'Fall Semester 2025',
    date: 'Instructor: John Doe',
    bgColor: '#eff6ff',
    accentColor: '#1e3a8a',
    borderColor: '#93c5fd',
  },
  'report-card': {
    title: 'Progress Report',
    name: 'Student Name',
    course: 'Academic Year 2024-2025',
    date: 'Quarter 1',
    bgColor: '#f0fdf4',
    accentColor: '#166534',
    borderColor: '#86efac',
  },
  'study-guide': {
    title: 'Study Guide',
    name: 'Final Exam Preparation',
    course: 'Chapter 1-5 Review',
    date: 'Exam Date: Oct 15, 2025',
    bgColor: '#fef2f2',
    accentColor: '#991b1b',
    borderColor: '#fecaca',
  },
  'class-schedule': {
    title: 'Class Schedule',
    name: 'Fall 2025',
    course: 'Monday - Friday',
    date: 'Room 101',
    bgColor: '#f5f3ff',
    accentColor: '#6b21a8',
    borderColor: '#d8b4fe',
  },
  assignment: {
    title: 'Assignment Sheet',
    name: 'Due Date: Oct 10, 2025',
    course: 'Total Points: 100',
    date: 'Submit by 11:59 PM',
    bgColor: '#ffffff',
    accentColor: '#ea580c',
    borderColor: '#fed7aa',
  },
  syllabus: {
    title: 'Course Syllabus',
    name: 'Introduction to Biology',
    course: 'BIO 101 - Fall 2025',
    date: 'Dr. Sarah Johnson',
    bgColor: '#ecfdf5',
    accentColor: '#065f46',
    borderColor: '#6ee7b7',
  },
  attendance: {
    title: 'Attendance Record',
    name: 'Month: October 2025',
    course: 'Class: 5th Grade',
    date: 'Teacher: Mr. Smith',
    bgColor: '#ffffff',
    accentColor: '#1f2937',
    borderColor: '#d1d5db',
  },
};

export function EducationTemplate({ variant, customData }: EducationTemplateProps) {
  const data = { ...DEFAULTS[variant], ...customData };

  if (variant === 'certificate' || variant === 'certificate-gold' || variant === 'award') {
    return (
      <div
        className='relative h-[450px] w-[600px] overflow-hidden rounded-lg p-12 shadow-xl'
        style={{ backgroundColor: data.bgColor, border: `8px double ${data.borderColor}` }}
      >
        <div className='flex h-full flex-col justify-between text-center'>
          <div>
            <div
              className='mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full'
              style={{ backgroundColor: data.accentColor }}
            >
              <span className='text-[32px]' style={{ color: '#ffffff' }}>
                🏆
              </span>
            </div>
            <h1 className='mb-8 text-[32px] font-extrabold tracking-wide' style={{ color: data.accentColor }}>
              {data.title}
            </h1>
            <p className='mb-2 text-[13px] font-medium' style={{ color: data.accentColor, opacity: 0.7 }}>
              This certificate is proudly presented to
            </p>
            <h2
              className='mb-6 inline-block border-b-2 pb-2 text-[28px] font-bold'
              style={{ color: data.accentColor, borderColor: data.accentColor }}
            >
              {data.name}
            </h2>
            <p className='mb-3 text-[14px] font-medium' style={{ color: data.accentColor, opacity: 0.8 }}>
              For successfully completing
            </p>
            <p className='text-[18px] font-bold' style={{ color: data.accentColor }}>
              {data.course}
            </p>
          </div>
          <div className='flex items-end justify-between text-[12px]' style={{ color: data.accentColor }}>
            <div className='text-left'>
              <div className='w-28 border-t pt-2' style={{ borderColor: data.accentColor }}>
                <p className='text-[11px] opacity:60'>Signature</p>
              </div>
            </div>
            <p className='opacity-70'>{data.date}</p>
            <div className='text-right'>
              <div className='w-28 border-t pt-2' style={{ borderColor: data.accentColor }}>
                <p className='text-[11px] opacity:60'>Date</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'report-card') {
    return (
      <div
        className='h-[650px] w-[500px] overflow-hidden rounded-lg p-8 shadow-xl'
        style={{ backgroundColor: data.bgColor, border: `2px solid ${data.borderColor}` }}
      >
        <div className='mb-6 border-b-2 pb-4' style={{ borderColor: data.accentColor }}>
          <h1 className='mb-2 text-[24px] font-bold' style={{ color: data.accentColor }}>
            {data.title}
          </h1>
          <p className='text-[13px]' style={{ color: data.accentColor, opacity: 0.8 }}>
            {data.name}
          </p>
          <p className='text-[12px]' style={{ color: data.accentColor, opacity: 0.7 }}>
            {data.course} • {data.date}
          </p>
        </div>
        <div className='mb-6 space-y-3'>
          {[
            { subject: 'Mathematics', grade: 'A' },
            { subject: 'Science', grade: 'A-' },
            { subject: 'English', grade: 'B+' },
            { subject: 'History', grade: 'A' },
            { subject: 'Art', grade: 'A+' },
          ].map((item) => (
            <div key={item.subject} className='flex items-center justify-between rounded bg-white p-3'>
              <span className='text-[13px] font-semibold' style={{ color: data.accentColor }}>
                {item.subject}
              </span>
              <span className='rounded px-3 py-1 text-[14px] font-bold' style={{ backgroundColor: data.borderColor, color: data.accentColor }}>
                {item.grade}
              </span>
            </div>
          ))}
        </div>
        <div className='border-t pt-4 text-[11px]' style={{ borderColor: data.borderColor, color: data.accentColor, opacity: 0.7 }}>
          Teacher Comments: Excellent progress this quarter. Keep up the great work!
        </div>
      </div>
    );
  }

  if (variant === 'class-schedule' || variant === 'attendance') {
    return (
      <div className='h-[500px] w-[550px] overflow-hidden rounded-lg p-8 shadow-xl' style={{ backgroundColor: data.bgColor }}>
        <div className='mb-6'>
          <h1 className='mb-2 text-[24px] font-bold' style={{ color: data.accentColor }}>
            {data.title}
          </h1>
          <p className='text-[12px]' style={{ color: data.accentColor, opacity: 0.8 }}>
            {data.name} • {data.course}
          </p>
          <p className='text-[11px]' style={{ color: data.accentColor, opacity: 0.7 }}>
            {data.date}
          </p>
        </div>
        <div className='overflow-hidden rounded-lg border' style={{ borderColor: data.borderColor }}>
          <div className='grid grid-cols-6 bg-slate-50 text-[11px] font-semibold'>
            {['Time', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((column) => (
              <div key={column} className='border-r p-2 last:border-r-0' style={{ borderColor: data.borderColor }}>
                {column}
              </div>
            ))}
          </div>
          {['9:00', '10:00', '11:00', '1:00', '2:00'].map((slot) => (
            <div key={slot} className='grid grid-cols-6 border-t text-[10px]' style={{ borderColor: data.borderColor }}>
              <div className='border-r p-2 font-semibold' style={{ borderColor: data.borderColor }}>
                {slot}
              </div>
              {Array.from({ length: 5 }).map((_, idx) => (
                <div key={idx} className='border-r p-2 last:border-r-0' style={{ borderColor: data.borderColor }}>
                  •
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className='h-[650px] w-[500px] overflow-hidden rounded-lg p-10 shadow-xl' style={{ backgroundColor: data.bgColor }}>
      <div className='mb-8 border-l-4 pl-6' style={{ borderColor: data.accentColor }}>
        <h1 className='mb-3 text-[28px] font-bold' style={{ color: data.accentColor }}>
          {data.title}
        </h1>
        <p className='mb-1 text-[14px] font-semibold' style={{ color: data.accentColor, opacity: 0.9 }}>
          {data.name}
        </p>
        <p className='mb-1 text-[13px]' style={{ color: data.accentColor, opacity: 0.8 }}>
          {data.course}
        </p>
        <p className='text-[12px]' style={{ color: data.accentColor, opacity: 0.7 }}>
          {data.date}
        </p>
      </div>
      <div className='space-y-6'>
        <div>
          <h3 className='mb-2 text-[14px] font-bold' style={{ color: data.accentColor }}>
            Objectives
          </h3>
          <ul className='space-y-2 text-[12px] text-slate-600'>
            <li>• Learning objective one</li>
            <li>• Learning objective two</li>
            <li>• Learning objective three</li>
          </ul>
        </div>
        <div>
          <h3 className='mb-2 text-[14px] font-bold' style={{ color: data.accentColor }}>
            Materials
          </h3>
          <ul className='space-y-2 text-[12px] text-slate-600'>
            <li>• Required material one</li>
            <li>• Required material two</li>
          </ul>
        </div>
        <div>
          <h3 className='mb-2 text-[14px] font-bold' style={{ color: data.accentColor }}>
            Instructions
          </h3>
          <p className='text-[12px] leading-relaxed text-slate-600'>
            Detailed instructions and guidelines will be provided here. Students should follow each step carefully to complete the assignment successfully.
          </p>
        </div>
      </div>
    </div>
  );
}
