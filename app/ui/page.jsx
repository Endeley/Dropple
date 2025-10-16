'use client';

import { useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import UIDesignerWorkspace from '@/components/ui-designer/UIDesignerWorkspace';

export default function UIDesignerPage() {
    const searchParams = useSearchParams();
    const designId = searchParams.get('designId') ?? 'workspace-demo';
    const userId = searchParams.get('userId') ?? 'guest';
    const normalizedId = useMemo(() => designId.trim() || 'workspace-demo', [designId]);

    return <UIDesignerWorkspace userId={userId} designId={normalizedId} />;
}
