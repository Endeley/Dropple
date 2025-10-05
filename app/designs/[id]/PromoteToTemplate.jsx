'use client';

import { useTransition } from 'react';
import { useMutation } from 'convex/react';

import { api } from '../../../convex/_generated/api';
import { Button } from '../../../components/ui/button';

export default function PromoteToTemplate({ designId, defaultSlug }) {
    const promote = useMutation(api.templatesAdmin.promoteDesign);
    const [pending, startTransition] = useTransition();

    const handlePromote = () => {
        startTransition(async () => {
            const slugInput = window.prompt('Slug for the template', defaultSlug ?? 'new-template');
            if (!slugInput) return;
            const categoryInput = window.prompt('Category (popular, business, enterprise, ecommerce, education)', 'popular');
            if (!categoryInput) return;

            await promote({
                designId: designId,
                slug: slugInput,
                category: categoryInput,
                isFeatured: false,
            });

            window.alert('Promoted design to template');
        });
    };

    return (
        <Button type='button' onClick={handlePromote} disabled={pending} variant='outline'>
            {pending ? 'Promoting…' : 'Promote to Template'}
        </Button>
    );
}
