'use client';

import { createElement } from 'react';

import { TEMPLATE_CATALOG, getTemplateBySlug, type TemplateEntry } from '@/lib/templates/catalog';

type UniversalTemplateProps = {
  slug?: string;
  entry?: TemplateEntry;
  customData?: Record<string, any>;
};

export function UniversalTemplate({ slug, entry, customData }: UniversalTemplateProps) {
  const resolvedEntry = entry ?? (slug ? getTemplateBySlug(slug) : undefined);

  if (!resolvedEntry) {
    return <div className='flex h-40 w-40 items-center justify-center rounded bg-slate-100 text-xs text-slate-500'>Template not found</div>;
  }

  return createElement(resolvedEntry.component as any, {
    ...resolvedEntry.props,
    customData,
  });
}

export function listCatalogEntries() {
  return TEMPLATE_CATALOG;
}
