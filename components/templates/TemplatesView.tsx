'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import TemplateCard from './TemplateCard.jsx';

type Category = {
    key: string;
    label: string;
    icon?: string | null;
};

type Props = {
    categories: Category[];
    templates: any[];
    current: string;
};

export default function TemplatesView({ categories, templates, current }: Props) {
    const router = useRouter();
    const params = useSearchParams();

    const handleChange = (value: string) => {
        const query = new URLSearchParams(params?.toString());
        if (value === 'recent') {
            query.delete('cat');
        } else {
            query.set('cat', value);
        }
        const search = query.toString();
        router.push(search ? `?${search}` : '/templates');
    };

    return (
        <Tabs value={current} onValueChange={handleChange} className='space-y-8'>
            <TabsList className='w-full flex-wrap justify-start gap-2 bg-transparent p-0'>
                {categories.map((cat) => (
                    <TabsTrigger
                        key={cat.key}
                        value={cat.key}
                        className='cursor-pointer rounded-full border border-transparent px-4 py-1.5 transition hover:border-indigo-500 hover:bg-indigo-50 hover:text-indigo-600 data-[state=active]:border-indigo-600 data-[state=active]:bg-indigo-600 data-[state=active]:text-white'>
                        {cat.label}
                    </TabsTrigger>
                ))}
            </TabsList>

            <TabsContent value={current} className='outline-none'>
                <div className='grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4'>
                    {templates.map((tpl) => (
                        <TemplateCard key={tpl._id} tpl={tpl} />
                    ))}
                    {templates.length === 0 ? <div className='col-span-full rounded-2xl border border-dashed border-[var(--border)] p-8 text-center text-sm text-slate-500 dark:text-slate-400'>No templates found for this category yet.</div> : null}
                </div>
            </TabsContent>
        </Tabs>
    );
}
