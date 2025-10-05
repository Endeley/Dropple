import type { EditableElement } from '@/components/editor/TemplateEditor';
import type { TemplateEntry, TemplateCategory } from '@/lib/templates/catalog';

export function getDefaultData(entry: TemplateEntry): Record<string, any> {
  const { category, props } = entry;
  const variant = String(props.variant ?? '');

  switch (category) {
    case 'presentation':
      return {
        title: 'Presentation Title',
        subtitle: 'Add your subtitle',
        bgColor: '#0f172a',
        accentColor: '#3b82f6',
      };
    case 'resume':
      return {
        name: 'Your Name',
        title: 'Professional Title',
        email: 'email@example.com',
        phone: '(123) 456-7890',
        bgColor: '#ffffff',
        accentColor: '#1f2937',
      };
    case 'invoice':
      return {
        title: 'Invoice',
        invoiceNumber: '#INV-001',
        company: 'Your Company',
        date: 'Oct 4, 2025',
        bgColor: '#ffffff',
        accentColor: '#1f2937',
      };
    default:
      return {};
  }
}

export function getEditableElements(entry: TemplateEntry, customData: Record<string, any>): EditableElement[] {
  const variant = String(entry.props.variant ?? '');
  const data = { ...getDefaultData(entry), ...customData };
  const colorFields: EditableElement[] = [
    { id: 'bgColor', type: 'color', label: 'Background Color', value: data.bgColor ?? '#ffffff' },
    { id: 'accentColor', type: 'color', label: 'Accent Color', value: data.accentColor ?? '#000000' },
  ];

  switch (entry.category) {
    case 'popular':
      return [
        { id: 'title', type: 'text', label: 'Title', value: data.title ?? '' },
        { id: 'subtitle', type: 'text', label: 'Subtitle', value: data.subtitle ?? '' },
        ...colorFields,
      ];
    case 'business':
      return [
        { id: 'title', type: 'text', label: 'Title', value: data.title ?? '' },
        { id: 'subtitle', type: 'text', label: 'Subtitle', value: data.subtitle ?? '' },
        { id: 'company', type: 'text', label: 'Company', value: data.company ?? '' },
        { id: 'date', type: 'text', label: 'Date', value: data.date ?? '' },
        ...colorFields,
      ];
    case 'enterprise':
      return [
        { id: 'title', type: 'text', label: 'Title', value: data.title ?? '' },
        { id: 'metric1', type: 'text', label: 'Metric 1', value: data.metric1 ?? '' },
        { id: 'metric2', type: 'text', label: 'Metric 2', value: data.metric2 ?? '' },
        { id: 'metric3', type: 'text', label: 'Metric 3', value: data.metric3 ?? '' },
        ...colorFields,
      ];
    case 'ecommerce':
      return [
        { id: 'title', type: 'text', label: 'Title', value: data.title ?? '' },
        { id: 'price', type: 'text', label: 'Price/CTA', value: data.price ?? '' },
        { id: 'description', type: 'text', label: 'Description', value: data.description ?? '' },
        ...colorFields,
        { id: 'image', type: 'image', label: 'Hero Image', value: data.image ?? '' },
      ];
    case 'education':
      return [
        { id: 'title', type: 'text', label: 'Title', value: data.title ?? '' },
        { id: 'name', type: 'text', label: 'Name/Subject', value: data.name ?? '' },
        { id: 'course', type: 'text', label: 'Course', value: data.course ?? '' },
        { id: 'date', type: 'text', label: 'Date', value: data.date ?? '' },
        ...colorFields,
      ];
    case 'resume':
      return [
        { id: 'name', type: 'text', label: 'Name', value: data.name ?? '' },
        { id: 'title', type: 'text', label: 'Title', value: data.title ?? '' },
        { id: 'email', type: 'text', label: 'Email', value: data.email ?? '' },
        { id: 'phone', type: 'text', label: 'Phone', value: data.phone ?? '' },
        ...colorFields,
      ];
    case 'invoice':
      return [
        { id: 'invoiceNumber', type: 'text', label: 'Invoice Number', value: data.invoiceNumber ?? '' },
        { id: 'company', type: 'text', label: 'Company', value: data.company ?? '' },
        { id: 'date', type: 'text', label: 'Date', value: data.date ?? '' },
        ...colorFields,
      ];
    default:
      return [
        { id: 'title', type: 'text', label: 'Title', value: data.title ?? '' },
        { id: 'subtitle', type: 'text', label: 'Subtitle', value: data.subtitle ?? '' },
        ...colorFields,
      ];
  }
}
