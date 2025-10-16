import { api } from '../../convex/_generated/api';
import { fetchQuery } from 'convex/nextjs';
import TemplatesView from '../../components/templates/TemplatesView';
import { TEMPLATE_CATALOG, TEMPLATE_CATEGORIES, CATEGORY_METADATA } from '@/lib/templates/catalog';
import { getTemplateComponentKey, getTemplateMetaBySlug, getTemplatePreviewInfo } from '@/lib/templates/preview';

type SearchParams = Promise<Record<string, string | string[] | undefined>> | Record<string, string | string[] | undefined>;

type TemplatesPageProps = {
  searchParams: SearchParams;
};

export const metadata = { title: 'Templates • Dropple' };

export default async function TemplatesPage({ searchParams }: TemplatesPageProps) {
  const params = await Promise.resolve(searchParams);
  const currentCategory = params?.cat ?? 'recent';

  let categories: { key: string; label: string }[] = [];
  let templates: any[] = [];

  const enhanceTemplate = (tpl: any) => {
    if (!tpl?.slug) {
      return tpl;
    }

    const componentKey = tpl.componentKey ?? getTemplateComponentKey(tpl.slug);
    const previewInfo = getTemplatePreviewInfo(tpl.slug);
    const meta = getTemplateMetaBySlug(tpl.slug);

    const fallbackThumbnail =
      tpl.thumbnail ??
      meta?.thumbnail ??
      (tpl.thumbnailUrl
        ? {
            type: 'image',
            src: tpl.thumbnailUrl,
          }
        : undefined);

    const thumbnailUrl =
      tpl.thumbnailUrl ??
      (typeof fallbackThumbnail === 'string'
        ? fallbackThumbnail
        : fallbackThumbnail?.type === 'image'
        ? fallbackThumbnail.src
        : fallbackThumbnail?.type === 'hybrid'
        ? fallbackThumbnail.image?.src
        : undefined);

    return {
      ...tpl,
      componentKey,
      previewComponentKey: tpl.previewComponentKey ?? previewInfo?.componentKey ?? componentKey,
      previewVariant: tpl.previewVariant ?? previewInfo?.variant,
      thumbnail: fallbackThumbnail,
      thumbnailUrl,
      thumbnailLabel: tpl.thumbnailLabel ?? meta?.thumbnailLabel,
    };
  };

  try {
    categories = await fetchQuery(api.templateBrowser.categories, {});
  } catch (error) {
    console.warn('Convex categories unavailable; falling back to catalog', error);
  }

  // Fall back to the catalog metadata
  if (!categories.length) {
    categories = TEMPLATE_CATEGORIES.map((key) => ({
      key,
      label: CATEGORY_METADATA[key].label,
    }));
  }

  const fetchTemplatesFromConvex = async () => {
    if (currentCategory === 'recent') {
      return await fetchQuery(api.templateBrowser.listRecent, { limit: 24 });
    }
    if (currentCategory === 'popular') {
      return await fetchQuery(api.templateBrowser.listPopular, { limit: 24 });
    }
    if (currentCategory === 'all') {
      return await fetchQuery(api.templateBrowser.listAll, { limit: 60 });
    }
    return await fetchQuery(api.templateBrowser.listByCategory, {
      key: currentCategory,
      limit: 24,
    });
  };

  try {
    templates = await fetchTemplatesFromConvex();
  } catch (error) {
    console.warn('Convex templates unavailable; falling back to catalog', error);
  }

  // Fall back to all local entries + filter by category
  if (!templates.length) {
    const fallbackCatalog =
      currentCategory === 'recent' || currentCategory === 'popular' || currentCategory === 'all'
        ? TEMPLATE_CATALOG
        : TEMPLATE_CATALOG.filter((tpl) => tpl.category === currentCategory);

    templates = fallbackCatalog.map(({ component, ...tpl }) => {
      const thumbnail = tpl.thumbnail;
      const thumbnailUrl =
        typeof thumbnail === 'string'
          ? thumbnail
          : thumbnail?.type === 'image'
          ? thumbnail.src
          : thumbnail?.type === 'hybrid'
          ? thumbnail.image?.src
          : undefined;

      return {
        ...tpl,
        _id: tpl.slug,
        thumbnail,
        thumbnailUrl,
      };
    });
  }

  templates = Array.isArray(templates) ? templates.map(enhanceTemplate) : [];

  return (
    <div className='mx-auto max-w-7xl px-6 py-8'>
      <div className='mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between'>
        <div>
          <h1 className='text-2xl font-semibold text-slate-900 dark:text-slate-100'>Templates</h1>
          <p className='text-sm text-slate-500 dark:text-slate-400'>
            Explore curated layouts by category and start designing instantly.
          </p>
        </div>
      </div>

      <TemplatesView categories={categories} templates={templates} current={currentCategory} />
    </div>
  );
}
