import { api } from '../../convex/_generated/api';
import { fetchQuery } from 'convex/nextjs';
import TemplatesView from '../../components/templates/TemplatesView';
import { TEMPLATE_CATALOG, TEMPLATE_CATEGORIES, CATEGORY_METADATA } from '@/lib/templates/catalog';

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

    templates = fallbackCatalog.map((tpl) => ({
      ...tpl,
      _id: tpl.slug,
      thumbnailUrl: tpl.thumbnail,
    }));
  }

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
