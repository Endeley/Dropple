'use client';

import { ImageWithFallback } from '@/components/ImageWithFallback';

// Store image URLs
const imageDatabase = {
  portrait: 'https://images.unsplash.com/photo-1643968612613-fd411aecd1fd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwb3J0cmFpdCUyMHBob3RvZ3JhcGhlciUyMHByb2Zlc3Npb25hbHxlbnwxfHx8fDE3NTk2MTc3ODZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
  mountain: 'https://images.unsplash.com/photo-1635148040718-acf281233b8e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3VudGFpbiUyMGxhbmRzY2FwZSUyMG5hdHVyZXxlbnwxfHx8fDE3NTk1ODYxNTh8MA&ixlib=rb-4.1.0&q=80&w=1080',
  modernHouse: 'https://images.unsplash.com/photo-1627141234469-24711efb373c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBob3VzZSUyMGFyY2hpdGVjdHVyZXxlbnwxfHx8fDE3NTk1ODQ2MDR8MA&ixlib=rb-4.1.0&q=80&w=1080',
  citySkyline: 'https://images.unsplash.com/photo-1619297560564-f183f9b1fb6b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjaXR5JTIwc2t5bGluZSUyMHVyYmFufGVufDF8fHx8MTc1OTU0OTUxN3ww&ixlib=rb-4.1.0&q=80&w=1080',
  bridge: 'https://images.unsplash.com/photo-1759397573675-5e1c3e0ef41a?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxicmlkZ2UlMjBhcmNoaXRlY3R1cmUlMjBlbmdpbmVlcmluZ3xlbnwxfHx8fDE3NTk2MTc3ODh8MA&ixlib=rb-4.1.0&q=80&w=1080',
  ocean: 'https://images.unsplash.com/photo-1697809311064-c7a3852206ee?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxvY2VhbiUyMGJlYWNoJTIwc3Vuc2V0fGVufDF8fHx8MTc1OTYxNzc4OXww&ixlib=rb-4.1.0&q=80&w=1080',
  forest: 'https://images.unsplash.com/photo-1663312790104-c16cd011b761?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmb3Jlc3QlMjB0cmVlcyUyMG5hdHVyZXxlbnwxfHx8fDE3NTk1OTE4Mzd8MA&ixlib=rb-4.1.0&q=80&w=1080',
  luxuryInterior: 'https://images.unsplash.com/photo-1600210491892-03d54c0aaf87?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsdXh1cnklMjBob21lJTIwaW50ZXJpb3J8ZW58MXx8fHwxNzU5NTIyNDI4fDA&ixlib=rb-4.1.0&q=80&w=1080',
  restaurant: 'https://images.unsplash.com/photo-1667388968964-4aa652df0a9b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxyZXN0YXVyYW50JTIwZm9vZCUyMGRpbmluZ3xlbnwxfHx8fDE3NTk1NjY3MzZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
  tropical: 'https://images.unsplash.com/photo-1758551932752-a9c603e25146?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0cmF2ZWwlMjBkZXN0aW5hdGlvbiUyMHRyb3BpY2FsfGVufDF8fHx8MTc1OTYxNzc5MXww&ixlib=rb-4.1.0&q=80&w=1080',
  yoga: 'https://images.unsplash.com/photo-1599901860904-17e6ed7083a0?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx5b2dhJTIwZml0bmVzcyUyMHdlbGxuZXNzfGVufDF8fHx8MTc1OTU5NjM2OHww&ixlib=rb-4.1.0&q=80&w=1080',
  wildlife: 'https://images.unsplash.com/photo-1700392615834-71b7d91132e9?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3aWxkbGlmZSUyMGFuaW1hbCUyMG5hdHVyZXxlbnwxfHx8fDE3NTk1MDk1NjJ8MA&ixlib=rb-4.1.0&q=80&w=1080',
  street: 'https://images.unsplash.com/photo-1720339396582-da3613763f79?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdHJlZXQlMjBwaG90b2dyYXBoeSUyMHVyYmFufGVufDF8fHx8MTc1OTU5NDkxNnww&ixlib=rb-4.1.0&q=80&w=1080',
  desert: 'https://images.unsplash.com/photo-1517199250683-10a92ecf6cd1?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkZXNlcnQlMjBsYW5kc2NhcGUlMjBtaW5pbWFsfGVufDF8fHx8MTc1OTYxNzc5Mnww&ixlib=rb-4.1.0&q=80&w=1080',
  waterfall: 'https://images.unsplash.com/photo-1652975247627-a29239ba56be?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx3YXRlcmZhbGwlMjBuYXR1cmUlMjBzY2VuaWN8ZW58MXx8fHwxNzU5NjE3NzkzfDA&ixlib=rb-4.1.0&q=80&w=1080',
  couple: 'https://images.unsplash.com/photo-1758874089358-67fe2adc9bcb?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb3VwbGUlMjByb21hbnRpYyUyMGxpZmVzdHlsZXxlbnwxfHx8fDE3NTk2MTc3OTN8MA&ixlib=rb-4.1.0&q=80&w=1080',
  coffee: 'https://images.unsplash.com/photo-1642647916129-3909c75c0267?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2ZmZWUlMjBzaG9wJTIwY2FmZXxlbnwxfHx8fDE3NTk1MzM3Mzh8MA&ixlib=rb-4.1.0&q=80&w=1080',
  family: 'https://images.unsplash.com/photo-1628676348963-f88c671333f6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxmYW1pbHklMjBoYXBweSUyMGNoaWxkcmVufGVufDF8fHx8MTc1OTYxNzc5M3ww&ixlib=rb-4.1.0&q=80&w=1080',
  skyscraper: 'https://images.unsplash.com/photo-1649767146802-1d5baa586638?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxza3lzY3JhcGVyJTIwbW9kZXJuJTIwYnVpbGRpbmd8ZW58MXx8fHwxNzU5NTY0NzY3fDA&ixlib=rb-4.1.0&q=80&w=1080',
  garden: 'https://images.unsplash.com/photo-1679212788952-4e92a872a093?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxnYXJkZW4lMjBmbG93ZXJzJTIwYm90YW5pY2FsfGVufDF8fHx8MTc1OTYxNzc5M3ww&ixlib=rb-4.1.0&q=80&w=1080',
  apartment: 'https://images.unsplash.com/photo-1592049800448-67498692346c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhcGFydG1lbnQlMjBidWlsZGluZyUyMHJlYWwlMjBlc3RhdGV8ZW58MXx8fHwxNzU5NjE3Nzk3fDA&ixlib=rb-4.1.0&q=80&w=1080',
  villa: 'https://images.unsplash.com/photo-1743819455744-05417bf55cea?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx2aWxsYSUyMGx1eHVyeSUyMHByb3BlcnR5fGVufDF8fHx8MTc1OTYxNzc5N3ww&ixlib=rb-4.1.0&q=80&w=1080',
  hotel: 'https://images.unsplash.com/photo-1682879654255-f25b5103f17e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3RlbCUyMHJlc29ydCUyMGx1eHVyeXxlbnwxfHx8fDE3NTk2MTc3OTh8MA&ixlib=rb-4.1.0&q=80&w=1080',
  park: 'https://images.unsplash.com/photo-1605374930968-b86ef0e6a225?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYXJrJTIwZ3JlZW4lMjBuYXR1cmV8ZW58MXx8fHwxNzU5NjE3Nzk4fDA&ixlib=rb-4.1.0&q=80&w=1080',
  lake: 'https://images.unsplash.com/photo-1631551437792-ae5a0fb41c49?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsYWtlJTIwbW91bnRhaW4lMjByZWZsZWN0aW9ufGVufDF8fHx8MTc1OTYxNzc5OXww&ixlib=rb-4.1.0&q=80&w=1080',
  aurora: 'https://images.unsplash.com/photo-1644659513503-abcbf75b4521?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxhdXJvcmElMjBub3J0aGVybiUyMGxpZ2h0c3xlbnwxfHx8fDE3NTk2MTc3OTl8MA&ixlib=rb-4.1.0&q=80&w=1080',
  canyon: 'https://images.unsplash.com/photo-1638982834964-ca4ae60d1ffd?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjYW55b24lMjBkZXNlcnQlMjByb2NrfGVufDF8fHx8MTc1OTYxNzc5OXww&ixlib=rb-4.1.0&q=80&w=1080',
  tokyo: 'https://images.unsplash.com/photo-1663511172227-ab917d4bb4b6?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHx0b2t5byUyMG5pZ2h0JTIwY2l0eXxlbnwxfHx8fDE3NTk1ODc5OTd8MA&ixlib=rb-4.1.0&q=80&w=1080',
  paris: 'https://images.unsplash.com/photo-1696670407455-6a14376f48dc?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYXJpcyUyMGFyY2hpdGVjdHVyZSUyMGhpc3RvcmljfGVufDF8fHx8MTc1OTYxNzgwMHww&ixlib=rb-4.1.0&q=80&w=1080',
  newyork: 'https://images.unsplash.com/photo-1551734044-8cf6396c8639?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxuZXclMjB5b3JrJTIwc3RyZWV0fGVufDF8fHx8MTc1OTYxNzgwMXww&ixlib=rb-4.1.0&q=80&w=1080',
  london: 'https://images.unsplash.com/photo-1654271166015-d87ab7097752?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxsb25kb24lMjBhcmNoaXRlY3R1cmV8ZW58MXx8fHwxNzU5NjE3ODAxfDA&ixlib=rb-4.1.0&q=80&w=1080',
  dubai: 'https://images.unsplash.com/photo-1751698186759-5bac83376c9f?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxkdWJhaSUyMG1vZGVybiUyMGNpdHlzY2FwZXxlbnwxfHx8fDE3NTk2MTc4MDR8MA&ixlib=rb-4.1.0&q=80&w=1080',
  pasta: 'https://images.unsplash.com/photo-1749169337822-d875fd6f4c9d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwYXN0YSUyMGl0YWxpYW4lMjBmb29kfGVufDF8fHx8MTc1OTUyMzg0OHww&ixlib=rb-4.1.0&q=80&w=1080',
  sushi: 'https://images.unsplash.com/photo-1700324822763-956100f79b0d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzdXNoaSUyMGphcGFuZXNlJTIwY3Vpc2luZXxlbnwxfHx8fDE3NTk2MTc4MDN8MA&ixlib=rb-4.1.0&q=80&w=1080',
  bakery: 'https://images.unsplash.com/photo-1658740877393-7d001187d867?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxiYWtlcnklMjBicmVhZCUyMHBhc3RyeXxlbnwxfHx8fDE3NTk2MTc4MDR8MA&ixlib=rb-4.1.0&q=80&w=1080',
  cocktail: 'https://images.unsplash.com/photo-1671741974888-21b409f4767c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxjb2NrdGFpbCUyMGJhciUyMGRyaW5rc3xlbnwxfHx8fDE3NTk2MTc4MDR8MA&ixlib=rb-4.1.0&q=80&w=1080',
  meditation: 'https://images.unsplash.com/photo-1562088287-bde35a1ea917?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtZWRpdGF0aW9uJTIwemVuJTIwd2VsbG5lc3N8ZW58MXx8fHwxNzU5NjE3ODA0fDA&ixlib=rb-4.1.0&q=80&w=1080',
  running: 'https://images.unsplash.com/photo-1616466137547-c3e1d511a033?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxydW5uaW5nJTIwZml0bmVzcyUyMGV4ZXJjaXNlfGVufDF8fHx8MTc1OTYxNzgwNHww&ixlib=rb-4.1.0&q=80&w=1080',
  spa: 'https://images.unsplash.com/photo-1745327883508-b6cd32e5dde5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxzcGElMjByZWxheGF0aW9uJTIwbWFzc2FnZXxlbnwxfHx8fDE3NTk2MTc4MDR8MA&ixlib=rb-4.1.0&q=80&w=1080',
  salad: 'https://images.unsplash.com/photo-1651352650142-385087834d9d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxoZWFsdGh5JTIwZm9vZCUyMHNhbGFkfGVufDF8fHx8MTc1OTUwMTk5NHww&ixlib=rb-4.1.0&q=80&w=1080',
};

export function VisualTemplate({ variant, customData = {} }) {
  // PHOTOGRAPHY Templates
  if (variant === 'portrait-gallery') {
    return (
      <div className="w-full h-full bg-slate-900 overflow-hidden relative">
        <ImageWithFallback
          src={imageDatabase.portrait}
          alt="Portrait"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          <h2 className="mb-2" style={{ fontSize: '32px', fontWeight: 700 }}>
            {customData.title || 'Portrait Photography'}
          </h2>
          <p style={{ fontSize: '16px', opacity: 0.9 }}>
            {customData.subtitle || 'Professional portrait sessions'}
          </p>
        </div>
      </div>
    );
  }

  if (variant === 'wedding-album') {
    return (
      <div className="w-full h-full bg-rose-50 p-8 flex flex-col items-center justify-center">
        <div className="grid grid-cols-2 gap-4 w-full max-w-md">
          <div className="aspect-square rounded-lg overflow-hidden">
            <ImageWithFallback src={imageDatabase.couple} alt="Couple" className="w-full h-full object-cover" />
          </div>
          <div className="aspect-square rounded-lg overflow-hidden">
            <ImageWithFallback src={imageDatabase.portrait} alt="Portrait" className="w-full h-full object-cover" />
          </div>
        </div>
        <div className="mt-6 text-center">
          <h3 style={{ fontSize: '28px', fontWeight: 600, color: '#881337' }}>
            {customData.title || 'Our Wedding Day'}
          </h3>
          <p className="text-slate-600 mt-2">{customData.subtitle || 'A celebration of love'}</p>
        </div>
      </div>
    );
  }

  if (variant === 'family-portrait') {
    return (
      <div className="w-full h-full bg-white relative overflow-hidden">
        <div className="h-2/3">
          <ImageWithFallback src={imageDatabase.family} alt="Family" className="w-full h-full object-cover" />
        </div>
        <div className="p-8 bg-white">
          <h2 className="text-slate-900 mb-2" style={{ fontSize: '24px', fontWeight: 700 }}>
            {customData.title || 'Family Memories'}
          </h2>
          <p className="text-slate-600">{customData.subtitle || 'Creating lasting memories together'}</p>
        </div>
      </div>
    );
  }

  if (variant === 'headshot') {
    return (
      <div className="w-full h-full bg-gradient-to-br from-blue-50 to-slate-100 p-8 flex items-center justify-center">
        <div className="max-w-md w-full">
          <div className="aspect-[3/4] rounded-2xl overflow-hidden shadow-2xl mb-6">
            <ImageWithFallback src={imageDatabase.portrait} alt="Headshot" className="w-full h-full object-cover" />
          </div>
          <div className="text-center">
            <h3 style={{ fontSize: '24px', fontWeight: 700 }}>{customData.name || 'John Smith'}</h3>
            <p className="text-slate-600 mt-1">{customData.title || 'Professional Headshots'}</p>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'couple') {
    return (
      <div className="w-full h-full relative overflow-hidden">
        <ImageWithFallback src={imageDatabase.couple} alt="Couple" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
          <div className="text-center text-white px-8">
            <h2 className="mb-3" style={{ fontSize: '36px', fontWeight: 700 }}>
              {customData.title || 'Love Story'}
            </h2>
            <p style={{ fontSize: '18px', opacity: 0.95 }}>
              {customData.subtitle || 'Capturing your precious moments'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'baby') {
    return (
      <div className="w-full h-full bg-pink-50 p-6">
        <div className="bg-white rounded-2xl p-6 h-full shadow-lg">
          <div className="aspect-square rounded-xl overflow-hidden mb-4">
            <ImageWithFallback src={imageDatabase.family} alt="Baby" className="w-full h-full object-cover" />
          </div>
          <h3 className="text-center mb-1" style={{ fontSize: '20px', fontWeight: 600, color: '#ec4899' }}>
            {customData.title || 'Newborn Photography'}
          </h3>
          <p className="text-center text-slate-600">{customData.subtitle || 'Precious first moments'}</p>
        </div>
      </div>
    );
  }

  if (variant === 'fashion') {
    return (
      <div className="w-full h-full bg-black relative overflow-hidden">
        <ImageWithFallback src={imageDatabase.portrait} alt="Fashion" className="w-full h-full object-cover opacity-90" />
        <div className="absolute top-8 left-8 text-white">
          <h2 style={{ fontSize: '40px', fontWeight: 900, letterSpacing: '2px' }}>
            {customData.title || 'FASHION'}
          </h2>
          <p style={{ fontSize: '16px', letterSpacing: '4px', opacity: 0.9 }}>
            {customData.subtitle || 'PHOTOGRAPHY'}
          </p>
        </div>
      </div>
    );
  }

  if (variant === 'wildlife') {
    return (
      <div className="w-full h-full relative overflow-hidden">
        <ImageWithFallback src={imageDatabase.wildlife} alt="Wildlife" className="w-full h-full object-cover" />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-8 text-white">
          <h2 className="mb-2" style={{ fontSize: '32px', fontWeight: 700 }}>
            {customData.title || 'Wildlife Photography'}
          </h2>
          <p style={{ fontSize: '16px', opacity: 0.9 }}>
            {customData.subtitle || 'Nature in its purest form'}
          </p>
        </div>
      </div>
    );
  }

  if (variant === 'nature-closeup') {
    return (
      <div className="w-full h-full bg-emerald-50 p-8">
        <div className="h-full bg-white rounded-2xl overflow-hidden shadow-xl">
          <div className="h-3/4">
            <ImageWithFallback src={imageDatabase.garden} alt="Nature" className="w-full h-full object-cover" />
          </div>
          <div className="p-6 h-1/4 flex flex-col justify-center">
            <h3 style={{ fontSize: '22px', fontWeight: 600 }}>{customData.title || 'Nature Close-up'}</h3>
            <p className="text-slate-600 mt-1">{customData.subtitle || 'Macro photography'}</p>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'portfolio') {
    return (
      <div className="w-full h-full bg-slate-100 p-6">
        <div className="grid grid-cols-3 gap-3 h-2/3">
          <ImageWithFallback src={imageDatabase.portrait} alt="Photo 1" className="w-full h-full object-cover rounded-lg" />
          <ImageWithFallback src={imageDatabase.wildlife} alt="Photo 2" className="w-full h-full object-cover rounded-lg" />
          <ImageWithFallback src={imageDatabase.couple} alt="Photo 3" className="w-full h-full object-cover rounded-lg" />
        </div>
        <div className="mt-6 text-center">
          <h2 style={{ fontSize: '28px', fontWeight: 700 }}>{customData.name || 'Photography Portfolio'}</h2>
          <p className="text-slate-600 mt-1">{customData.subtitle || 'Professional photographer'}</p>
        </div>
      </div>
    );
  }

  if (variant === 'event') {
    return (
      <div className="w-full h-full bg-gradient-to-br from-purple-100 to-pink-100 p-8">
        <div className="bg-white rounded-2xl overflow-hidden shadow-2xl h-full">
          <div className="h-2/3">
            <ImageWithFallback src={imageDatabase.family} alt="Event" className="w-full h-full object-cover" />
          </div>
          <div className="p-6 h-1/3 flex flex-col justify-center">
            <h2 style={{ fontSize: '26px', fontWeight: 700 }}>{customData.title || 'Event Photography'}</h2>
            <p className="text-slate-600 mt-2">{customData.subtitle || 'Capturing your special moments'}</p>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'studio') {
    return (
      <div className="w-full h-full bg-slate-900 p-8 flex items-center justify-center">
        <div className="max-w-lg w-full text-center">
          <div className="aspect-[4/5] rounded-xl overflow-hidden mb-6 shadow-2xl">
            <ImageWithFallback src={imageDatabase.portrait} alt="Studio" className="w-full h-full object-cover" />
          </div>
          <h2 className="text-white mb-2" style={{ fontSize: '28px', fontWeight: 700 }}>
            {customData.title || 'Studio Photography'}
          </h2>
          <p className="text-slate-300">{customData.subtitle || 'Professional studio sessions'}</p>
        </div>
      </div>
    );
  }

  if (variant === 'outdoor') {
    return (
      <div className="w-full h-full relative overflow-hidden">
        <ImageWithFallback src={imageDatabase.mountain} alt="Outdoor" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/70" />
        <div className="absolute bottom-8 left-8 right-8 text-white">
          <h2 className="mb-2" style={{ fontSize: '36px', fontWeight: 700 }}>
            {customData.title || 'Outdoor Photography'}
          </h2>
          <p style={{ fontSize: '18px', opacity: 0.9 }}>
            {customData.subtitle || 'Adventure awaits'}
          </p>
        </div>
      </div>
    );
  }

  if (variant === 'lifestyle') {
    return (
      <div className="w-full h-full bg-white overflow-hidden">
        <div className="h-3/5">
          <ImageWithFallback src={imageDatabase.couple} alt="Lifestyle" className="w-full h-full object-cover" />
        </div>
        <div className="h-2/5 p-8 flex flex-col justify-center">
          <h2 style={{ fontSize: '30px', fontWeight: 700 }}>{customData.title || 'Lifestyle Photography'}</h2>
          <p className="text-slate-600 mt-3">{customData.subtitle || 'Authentic moments, beautifully captured'}</p>
        </div>
      </div>
    );
  }

  if (variant === 'product-photo') {
    return (
      <div className="w-full h-full bg-gradient-to-br from-gray-50 to-gray-100 p-10 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="aspect-square bg-white rounded-2xl shadow-2xl mb-6 overflow-hidden">
            <ImageWithFallback src={imageDatabase.coffee} alt="Product" className="w-full h-full object-cover" />
          </div>
          <h2 style={{ fontSize: '26px', fontWeight: 700 }}>{customData.title || 'Product Photography'}</h2>
          <p className="text-slate-600 mt-2">{customData.subtitle || 'Professional product shots'}</p>
        </div>
      </div>
    );
  }

  if (variant === 'pet') {
    return (
      <div className="w-full h-full bg-amber-50 p-6">
        <div className="h-full bg-white rounded-2xl overflow-hidden shadow-lg">
          <div className="h-4/5">
            <ImageWithFallback src={imageDatabase.wildlife} alt="Pet" className="w-full h-full object-cover" />
          </div>
          <div className="h-1/5 px-6 flex flex-col justify-center">
            <h3 style={{ fontSize: '22px', fontWeight: 600 }}>{customData.title || 'Pet Photography'}</h3>
            <p className="text-slate-600">{customData.subtitle || 'Capturing furry friends'}</p>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'sports') {
    return (
      <div className="w-full h-full relative overflow-hidden bg-black">
        <ImageWithFallback src={imageDatabase.running} alt="Sports" className="w-full h-full object-cover opacity-80" />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-white px-8">
            <h2 className="mb-3" style={{ fontSize: '42px', fontWeight: 900 }}>
              {customData.title || 'SPORTS'}
            </h2>
            <p style={{ fontSize: '20px', letterSpacing: '2px', opacity: 0.9 }}>
              {customData.subtitle || 'ACTION PHOTOGRAPHY'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'concert') {
    return (
      <div className="w-full h-full bg-purple-900 relative overflow-hidden">
        <ImageWithFallback src={imageDatabase.portrait} alt="Concert" className="w-full h-full object-cover opacity-70" />
        <div className="absolute inset-0 bg-gradient-to-t from-purple-900 via-transparent to-transparent" />
        <div className="absolute bottom-8 left-8 text-white">
          <h2 className="mb-2" style={{ fontSize: '38px', fontWeight: 800 }}>
            {customData.title || 'Concert Photography'}
          </h2>
          <p style={{ fontSize: '16px', opacity: 0.9 }}>
            {customData.subtitle || 'Live music moments'}
          </p>
        </div>
      </div>
    );
  }

  if (variant === 'services') {
    return (
      <div className="w-full h-full bg-slate-800 text-white p-10">
        <h2 className="mb-6" style={{ fontSize: '32px', fontWeight: 700 }}>
          {customData.title || 'Photography Services'}
        </h2>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="aspect-square rounded-lg overflow-hidden">
            <ImageWithFallback src={imageDatabase.portrait} alt="Service 1" className="w-full h-full object-cover" />
          </div>
          <div className="aspect-square rounded-lg overflow-hidden">
            <ImageWithFallback src={imageDatabase.couple} alt="Service 2" className="w-full h-full object-cover" />
          </div>
        </div>
        <p style={{ fontSize: '16px', opacity: 0.9 }}>
          {customData.description || 'Professional photography for all occasions'}
        </p>
      </div>
    );
  }

  if (variant === 'collection') {
    return (
      <div className="w-full h-full bg-white p-6">
        <h2 className="mb-4 text-center" style={{ fontSize: '28px', fontWeight: 700 }}>
          {customData.title || 'Photo Collection'}
        </h2>
        <div className="grid grid-cols-3 gap-2">
          <ImageWithFallback src={imageDatabase.portrait} alt="Photo 1" className="w-full aspect-square object-cover rounded" />
          <ImageWithFallback src={imageDatabase.wildlife} alt="Photo 2" className="w-full aspect-square object-cover rounded" />
          <ImageWithFallback src={imageDatabase.couple} alt="Photo 3" className="w-full aspect-square object-cover rounded" />
          <ImageWithFallback src={imageDatabase.mountain} alt="Photo 4" className="w-full aspect-square object-cover rounded" />
          <ImageWithFallback src={imageDatabase.ocean} alt="Photo 5" className="w-full aspect-square object-cover rounded" />
          <ImageWithFallback src={imageDatabase.family} alt="Photo 6" className="w-full aspect-square object-cover rounded" />
        </div>
      </div>
    );
  }

  // TRAVEL Templates
  if (variant === 'beach') {
    return (
      <div className="w-full h-full relative overflow-hidden">
        <ImageWithFallback src={imageDatabase.ocean} alt="Beach" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-blue-900/80 to-transparent flex items-end">
          <div className="p-8 text-white w-full">
            <h2 className="mb-2" style={{ fontSize: '38px', fontWeight: 700 }}>
              {customData.title || 'Beach Paradise'}
            </h2>
            <p style={{ fontSize: '18px', opacity: 0.95 }}>
              {customData.subtitle || 'Your perfect tropical getaway'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'mountain') {
    return (
      <div className="w-full h-full relative overflow-hidden">
        <ImageWithFallback src={imageDatabase.mountain} alt="Mountain" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <div className="text-center text-white px-8">
            <h2 className="mb-3" style={{ fontSize: '44px', fontWeight: 800 }}>
              {customData.title || 'Mountain Adventure'}
            </h2>
            <p style={{ fontSize: '20px', opacity: 0.95 }}>
              {customData.subtitle || 'Explore the peaks'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'city-guide') {
    return (
      <div className="w-full h-full bg-slate-900 overflow-hidden">
        <div className="h-1/2">
          <ImageWithFallback src={imageDatabase.citySkyline} alt="City" className="w-full h-full object-cover" />
        </div>
        <div className="h-1/2 p-8 text-white">
          <h2 className="mb-3" style={{ fontSize: '32px', fontWeight: 700 }}>
            {customData.title || 'City Travel Guide'}
          </h2>
          <p style={{ fontSize: '16px', opacity: 0.9, lineHeight: '1.6' }}>
            {customData.description || 'Discover the best attractions, restaurants, and hidden gems in this amazing city.'}
          </p>
        </div>
      </div>
    );
  }

  if (variant === 'hotel') {
    return (
      <div className="w-full h-full bg-gray-50 p-6">
        <div className="h-full bg-white rounded-2xl overflow-hidden shadow-xl">
          <div className="h-3/5">
            <ImageWithFallback src={imageDatabase.hotel} alt="Hotel" className="w-full h-full object-cover" />
          </div>
          <div className="h-2/5 p-6 flex flex-col justify-center">
            <h2 style={{ fontSize: '28px', fontWeight: 700 }}>{customData.title || 'Luxury Hotel & Resort'}</h2>
            <p className="text-slate-600 mt-2">{customData.subtitle || 'Experience ultimate comfort and elegance'}</p>
            <div className="mt-4 flex gap-2">
              <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                {customData.rating || '⭐ 4.9'}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'resort') {
    return (
      <div className="w-full h-full relative overflow-hidden">
        <ImageWithFallback src={imageDatabase.tropical} alt="Resort" className="w-full h-full object-cover" />
        <div className="absolute top-8 left-8 right-8 text-white">
          <div className="bg-white/20 backdrop-blur-md rounded-2xl p-6 border border-white/30">
            <h2 className="mb-2" style={{ fontSize: '34px', fontWeight: 700 }}>
              {customData.title || 'Paradise Resort'}
            </h2>
            <p style={{ fontSize: '16px', opacity: 0.95 }}>
              {customData.subtitle || 'All-inclusive luxury experience'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'itinerary') {
    return (
      <div className="w-full h-full bg-white p-8">
        <div className="mb-6">
          <div className="h-48 rounded-xl overflow-hidden mb-4">
            <ImageWithFallback src={imageDatabase.tropical} alt="Destination" className="w-full h-full object-cover" />
          </div>
          <h2 className="mb-2" style={{ fontSize: '28px', fontWeight: 700 }}>
            {customData.title || 'Travel Itinerary'}
          </h2>
          <p className="text-slate-600">{customData.duration || '7 Days / 6 Nights'}</p>
        </div>
        <div className="space-y-3">
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0" style={{ fontSize: '14px', fontWeight: 600 }}>
              1
            </div>
            <div>
              <p style={{ fontSize: '16px', fontWeight: 600 }}>{customData.day1 || 'Arrival & Check-in'}</p>
            </div>
          </div>
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0" style={{ fontSize: '14px', fontWeight: 600 }}>
              2
            </div>
            <div>
              <p style={{ fontSize: '16px', fontWeight: 600 }}>{customData.day2 || 'Beach & Activities'}</p>
            </div>
          </div>
          <div className="flex gap-3 items-start">
            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0" style={{ fontSize: '14px', fontWeight: 600 }}>
              3
            </div>
            <div>
              <p style={{ fontSize: '16px', fontWeight: 600 }}>{customData.day3 || 'City Tour'}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'destination') {
    return (
      <div className="w-full h-full bg-gradient-to-br from-cyan-500 to-blue-600 relative overflow-hidden">
        <div className="absolute inset-0">
          <ImageWithFallback src={imageDatabase.tropical} alt="Destination" className="w-full h-full object-cover mix-blend-overlay opacity-70" />
        </div>
        <div className="relative h-full flex items-center justify-center text-white text-center px-8">
          <div>
            <h1 className="mb-4" style={{ fontSize: '52px', fontWeight: 900 }}>
              {customData.destination || 'BALI'}
            </h1>
            <p style={{ fontSize: '22px', opacity: 0.95, letterSpacing: '1px' }}>
              {customData.subtitle || 'DISCOVER PARADISE'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'blog') {
    return (
      <div className="w-full h-full bg-white p-6">
        <div className="aspect-video rounded-xl overflow-hidden mb-4">
          <ImageWithFallback src={imageDatabase.mountain} alt="Travel Blog" className="w-full h-full object-cover" />
        </div>
        <h2 className="mb-2" style={{ fontSize: '26px', fontWeight: 700 }}>
          {customData.title || 'My Travel Adventures'}
        </h2>
        <p className="text-slate-600 mb-3">{customData.date || 'March 15, 2025'}</p>
        <p className="text-slate-700 leading-relaxed">
          {customData.excerpt || 'Join me on an incredible journey through breathtaking landscapes and unforgettable experiences...'}
        </p>
      </div>
    );
  }

  if (variant === 'tour-package') {
    return (
      <div className="w-full h-full bg-gradient-to-br from-orange-50 to-amber-50 p-8">
        <div className="bg-white rounded-2xl overflow-hidden shadow-xl h-full">
          <div className="h-2/5">
            <ImageWithFallback src={imageDatabase.tropical} alt="Tour" className="w-full h-full object-cover" />
          </div>
          <div className="h-3/5 p-6">
            <h2 className="mb-3" style={{ fontSize: '26px', fontWeight: 700 }}>
              {customData.title || 'Premium Tour Package'}
            </h2>
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-slate-600">
                <span>✓</span>
                <span>{customData.feature1 || 'All-inclusive meals'}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <span>✓</span>
                <span>{customData.feature2 || 'Professional guide'}</span>
              </div>
              <div className="flex items-center gap-2 text-slate-600">
                <span>✓</span>
                <span>{customData.feature3 || 'Luxury accommodation'}</span>
              </div>
            </div>
            <div className="pt-4 border-t border-slate-200">
              <p style={{ fontSize: '28px', fontWeight: 700, color: '#f59e0b' }}>
                {customData.price || '$1,299'}
              </p>
              <p className="text-slate-500 text-sm">{customData.priceNote || 'per person'}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'adventure') {
    return (
      <div className="w-full h-full relative overflow-hidden">
        <ImageWithFallback src={imageDatabase.mountain} alt="Adventure" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-orange-900/70 to-red-900/70" />
        <div className="absolute inset-0 flex items-center justify-center text-white text-center px-8">
          <div>
            <h2 className="mb-3" style={{ fontSize: '48px', fontWeight: 900 }}>
              {customData.title || 'ADVENTURE TOURS'}
            </h2>
            <p style={{ fontSize: '20px', letterSpacing: '2px', opacity: 0.95 }}>
              {customData.subtitle || 'PUSH YOUR LIMITS'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'cruise') {
    return (
      <div className="w-full h-full bg-navy-900 relative overflow-hidden">
        <ImageWithFallback src={imageDatabase.ocean} alt="Cruise" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-blue-900/90 via-blue-900/50 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8 text-white">
          <h2 className="mb-2" style={{ fontSize: '36px', fontWeight: 700 }}>
            {customData.title || 'Luxury Cruise'}
          </h2>
          <p style={{ fontSize: '18px', opacity: 0.95 }}>
            {customData.subtitle || 'Sail away to paradise'}
          </p>
        </div>
      </div>
    );
  }

  if (variant === 'island') {
    return (
      <div className="w-full h-full relative overflow-hidden">
        <ImageWithFallback src={imageDatabase.tropical} alt="Island" className="w-full h-full object-cover" />
        <div className="absolute top-8 right-8 bg-white/95 backdrop-blur-sm rounded-2xl p-6 max-w-xs shadow-2xl">
          <h2 className="mb-2" style={{ fontSize: '26px', fontWeight: 700 }}>
            {customData.title || 'Island Getaway'}
          </h2>
          <p className="text-slate-600 mb-3">
            {customData.description || 'Escape to your own private paradise'}
          </p>
          <div className="text-blue-600" style={{ fontSize: '24px', fontWeight: 700 }}>
            {customData.price || 'From $999'}
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'cultural') {
    return (
      <div className="w-full h-full bg-amber-50 p-6">
        <div className="h-full bg-white rounded-2xl overflow-hidden shadow-lg">
          <div className="h-3/5">
            <ImageWithFallback src={imageDatabase.paris} alt="Cultural" className="w-full h-full object-cover" />
          </div>
          <div className="h-2/5 p-6 flex flex-col justify-center">
            <h2 style={{ fontSize: '28px', fontWeight: 700 }}>{customData.title || 'Cultural Tour'}</h2>
            <p className="text-slate-600 mt-2">
              {customData.description || 'Immerse yourself in rich history and traditions'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'agency') {
    return (
      <div className="w-full h-full bg-gradient-to-br from-blue-600 to-cyan-500 p-8 text-white">
        <h1 className="mb-6" style={{ fontSize: '36px', fontWeight: 900 }}>
          {customData.agency || 'Wanderlust Travel'}
        </h1>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="aspect-video rounded-lg overflow-hidden">
            <ImageWithFallback src={imageDatabase.tropical} alt="Destination 1" className="w-full h-full object-cover" />
          </div>
          <div className="aspect-video rounded-lg overflow-hidden">
            <ImageWithFallback src={imageDatabase.mountain} alt="Destination 2" className="w-full h-full object-cover" />
          </div>
        </div>
        <p style={{ fontSize: '18px', opacity: 0.95 }}>
          {customData.tagline || 'Your journey begins here'}
        </p>
      </div>
    );
  }

  if (variant === 'backpacking') {
    return (
      <div className="w-full h-full bg-slate-800 relative overflow-hidden">
        <ImageWithFallback src={imageDatabase.mountain} alt="Backpacking" className="w-full h-full object-cover opacity-70" />
        <div className="absolute inset-0 flex items-center justify-center text-white text-center px-8">
          <div>
            <h2 className="mb-3" style={{ fontSize: '42px', fontWeight: 900 }}>
              {customData.title || 'BACKPACKING GUIDE'}
            </h2>
            <p style={{ fontSize: '18px', opacity: 0.95 }}>
              {customData.subtitle || 'Travel light, explore more'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // REAL ESTATE Templates
  if (variant === 'modern-home') {
    return (
      <div className="w-full h-full bg-slate-50 p-6">
        <div className="h-full bg-white rounded-2xl overflow-hidden shadow-xl">
          <div className="h-3/5">
            <ImageWithFallback src={imageDatabase.modernHouse} alt="Modern Home" className="w-full h-full object-cover" />
          </div>
          <div className="h-2/5 p-6">
            <div className="flex justify-between items-start mb-3">
              <div>
                <h2 style={{ fontSize: '28px', fontWeight: 700 }}>{customData.price || '$850,000'}</h2>
                <p className="text-slate-600 mt-1">{customData.address || '123 Modern Ave'}</p>
              </div>
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                {customData.status || 'For Sale'}
              </span>
            </div>
            <div className="flex gap-4 text-slate-700">
              <span>{customData.beds || '4'} beds</span>
              <span>•</span>
              <span>{customData.baths || '3'} baths</span>
              <span>•</span>
              <span>{customData.sqft || '2,500'} sqft</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'luxury-villa') {
    return (
      <div className="w-full h-full relative overflow-hidden">
        <ImageWithFallback src={imageDatabase.villa} alt="Villa" className="w-full h-full object-cover" />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-8 text-white">
          <h2 className="mb-2" style={{ fontSize: '34px', fontWeight: 700 }}>
            {customData.title || 'Luxury Villa'}
          </h2>
          <p style={{ fontSize: '18px', opacity: 0.95 }} className="mb-2">
            {customData.location || 'Beverly Hills, CA'}
          </p>
          <p style={{ fontSize: '28px', fontWeight: 700, color: '#fbbf24' }}>
            {customData.price || '$5,200,000'}
          </p>
        </div>
      </div>
    );
  }

  if (variant === 'apartment') {
    return (
      <div className="w-full h-full bg-white p-6">
        <div className="aspect-video rounded-xl overflow-hidden mb-4">
          <ImageWithFallback src={imageDatabase.apartment} alt="Apartment" className="w-full h-full object-cover" />
        </div>
        <h2 className="mb-2" style={{ fontSize: '26px', fontWeight: 700 }}>
          {customData.title || 'Modern Apartment Complex'}
        </h2>
        <p className="text-slate-600 mb-3">{customData.location || 'Downtown District'}</p>
        <div className="flex gap-3">
          <span className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm">
            {customData.units || '50 Units Available'}
          </span>
          <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-lg text-sm">
            {customData.priceFrom || 'From $1,800/mo'}
          </span>
        </div>
      </div>
    );
  }

  if (variant === 'property-showcase') {
    return (
      <div className="w-full h-full bg-gray-100 p-6">
        <div className="grid grid-cols-2 gap-3 mb-4 h-3/5">
          <div className="row-span-2 rounded-lg overflow-hidden">
            <ImageWithFallback src={imageDatabase.modernHouse} alt="Main" className="w-full h-full object-cover" />
          </div>
          <div className="rounded-lg overflow-hidden">
            <ImageWithFallback src={imageDatabase.luxuryInterior} alt="Interior" className="w-full h-full object-cover" />
          </div>
          <div className="rounded-lg overflow-hidden">
            <ImageWithFallback src={imageDatabase.garden} alt="Garden" className="w-full h-full object-cover" />
          </div>
        </div>
        <div className="h-2/5 bg-white rounded-lg p-4">
          <h2 style={{ fontSize: '22px', fontWeight: 700 }}>{customData.title || 'Property Showcase'}</h2>
          <p className="text-slate-600 mt-1">{customData.subtitle || 'Stunning features throughout'}</p>
        </div>
      </div>
    );
  }

  if (variant === 'interior') {
    return (
      <div className="w-full h-full relative overflow-hidden">
        <ImageWithFallback src={imageDatabase.luxuryInterior} alt="Interior" className="w-full h-full object-cover" />
        <div className="absolute top-8 left-8 bg-white/95 backdrop-blur-sm rounded-xl p-6 max-w-sm shadow-2xl">
          <h2 className="mb-2" style={{ fontSize: '24px', fontWeight: 700 }}>
            {customData.title || 'Luxury Interior'}
          </h2>
          <p className="text-slate-600">
            {customData.description || 'Designer finishes and premium materials'}
          </p>
        </div>
      </div>
    );
  }

  if (variant === 'for-sale') {
    return (
      <div className="w-full h-full bg-red-50 p-8">
        <div className="bg-white rounded-2xl overflow-hidden shadow-xl h-full">
          <div className="relative h-3/5">
            <ImageWithFallback src={imageDatabase.modernHouse} alt="For Sale" className="w-full h-full object-cover" />
            <div className="absolute top-4 right-4 bg-red-600 text-white px-4 py-2 rounded-lg" style={{ fontSize: '18px', fontWeight: 700 }}>
              FOR SALE
            </div>
          </div>
          <div className="h-2/5 p-6 flex flex-col justify-center">
            <h2 style={{ fontSize: '32px', fontWeight: 800, color: '#dc2626' }}>
              {customData.price || '$725,000'}
            </h2>
            <p className="text-slate-700 mt-2" style={{ fontSize: '18px', fontWeight: 600 }}>
              {customData.address || '456 Oak Street'}
            </p>
            <p className="text-slate-600 mt-1">{customData.details || '3 BD • 2 BA • 1,800 sqft'}</p>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'open-house') {
    return (
      <div className="w-full h-full bg-gradient-to-br from-blue-600 to-purple-600 p-8 text-white">
        <div className="mb-6">
          <h1 className="mb-2" style={{ fontSize: '42px', fontWeight: 900 }}>
            OPEN HOUSE
          </h1>
          <p style={{ fontSize: '24px', opacity: 0.95 }}>
            {customData.date || 'Saturday, March 16th'}
          </p>
          <p style={{ fontSize: '20px', opacity: 0.9 }}>
            {customData.time || '1:00 PM - 4:00 PM'}
          </p>
        </div>
        <div className="aspect-video rounded-xl overflow-hidden mb-4">
          <ImageWithFallback src={imageDatabase.modernHouse} alt="Property" className="w-full h-full object-cover" />
        </div>
        <p style={{ fontSize: '18px', opacity: 0.95 }}>
          {customData.address || '789 Elm Avenue, City Name'}
        </p>
      </div>
    );
  }

  if (variant === 'brochure') {
    return (
      <div className="w-full h-full bg-white p-6">
        <h2 className="mb-4 text-center" style={{ fontSize: '28px', fontWeight: 700 }}>
          {customData.title || 'Property Brochure'}
        </h2>
        <div className="grid grid-cols-2 gap-3 mb-4">
          <ImageWithFallback src={imageDatabase.modernHouse} alt="Exterior" className="w-full aspect-square object-cover rounded-lg" />
          <ImageWithFallback src={imageDatabase.luxuryInterior} alt="Interior" className="w-full aspect-square object-cover rounded-lg" />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
            <span className="text-slate-600">Bedrooms</span>
            <span style={{ fontWeight: 600 }}>{customData.beds || '4'}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
            <span className="text-slate-600">Bathrooms</span>
            <span style={{ fontWeight: 600 }}>{customData.baths || '3'}</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
            <span className="text-slate-600">Square Feet</span>
            <span style={{ fontWeight: 600 }}>{customData.sqft || '2,400'}</span>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'agent') {
    return (
      <div className="w-full h-full bg-slate-900 text-white p-8">
        <div className="flex items-center gap-6 mb-6">
          <div className="w-24 h-24 rounded-full overflow-hidden bg-slate-700">
            <ImageWithFallback src={imageDatabase.portrait} alt="Agent" className="w-full h-full object-cover" />
          </div>
          <div>
            <h2 style={{ fontSize: '28px', fontWeight: 700 }}>{customData.name || 'Sarah Johnson'}</h2>
            <p style={{ fontSize: '16px', opacity: 0.9 }}>{customData.title || 'Real Estate Agent'}</p>
            <p style={{ fontSize: '14px', opacity: 0.7 }}>{customData.phone || '(555) 123-4567'}</p>
          </div>
        </div>
        <div className="aspect-video rounded-xl overflow-hidden">
          <ImageWithFallback src={imageDatabase.modernHouse} alt="Listing" className="w-full h-full object-cover" />
        </div>
      </div>
    );
  }

  if (variant === 'development') {
    return (
      <div className="w-full h-full relative overflow-hidden">
        <ImageWithFallback src={imageDatabase.apartment} alt="Development" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-blue-900/90 to-transparent flex items-end">
          <div className="p-8 text-white w-full">
            <span className="px-3 py-1 bg-yellow-500 text-yellow-900 rounded-full text-sm" style={{ fontWeight: 600 }}>
              {customData.status || 'NEW DEVELOPMENT'}
            </span>
            <h2 className="mt-3 mb-2" style={{ fontSize: '36px', fontWeight: 700 }}>
              {customData.title || 'The Heights Residences'}
            </h2>
            <p style={{ fontSize: '18px', opacity: 0.95 }}>
              {customData.subtitle || 'Coming Spring 2025'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'commercial') {
    return (
      <div className="w-full h-full bg-gray-900 text-white p-8">
        <h2 className="mb-6" style={{ fontSize: '32px', fontWeight: 700 }}>
          {customData.title || 'Commercial Property'}
        </h2>
        <div className="aspect-video rounded-xl overflow-hidden mb-4">
          <ImageWithFallback src={imageDatabase.skyscraper} alt="Commercial" className="w-full h-full object-cover" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-slate-400 text-sm">Size</p>
            <p style={{ fontSize: '18px', fontWeight: 600 }}>{customData.size || '10,000 sqft'}</p>
          </div>
          <div>
            <p className="text-slate-400 text-sm">Price</p>
            <p style={{ fontSize: '18px', fontWeight: 600 }}>{customData.price || '$2.5M'}</p>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'rental') {
    return (
      <div className="w-full h-full bg-purple-50 p-6">
        <div className="h-full bg-white rounded-2xl overflow-hidden shadow-lg">
          <div className="h-2/3">
            <ImageWithFallback src={imageDatabase.luxuryInterior} alt="Rental" className="w-full h-full object-cover" />
          </div>
          <div className="h-1/3 p-6 flex flex-col justify-center">
            <div className="flex justify-between items-start">
              <div>
                <h2 style={{ fontSize: '26px', fontWeight: 700 }}>{customData.price || '$2,200/mo'}</h2>
                <p className="text-slate-600 mt-1">{customData.address || 'Modern Downtown Loft'}</p>
              </div>
              <span className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                For Rent
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'features') {
    return (
      <div className="w-full h-full bg-white p-8">
        <h2 className="mb-6" style={{ fontSize: '28px', fontWeight: 700 }}>
          {customData.title || 'Property Features'}
        </h2>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <ImageWithFallback src={imageDatabase.modernHouse} alt="Feature" className="w-full aspect-video object-cover rounded-lg" />
          <ImageWithFallback src={imageDatabase.luxuryInterior} alt="Feature" className="w-full aspect-video object-cover rounded-lg" />
        </div>
        <div className="space-y-2">
          <div className="flex items-center gap-3 text-slate-700">
            <span className="text-green-600">✓</span>
            <span>{customData.feature1 || 'Modern kitchen with premium appliances'}</span>
          </div>
          <div className="flex items-center gap-3 text-slate-700">
            <span className="text-green-600">✓</span>
            <span>{customData.feature2 || 'Hardwood floors throughout'}</span>
          </div>
          <div className="flex items-center gap-3 text-slate-700">
            <span className="text-green-600">✓</span>
            <span>{customData.feature3 || 'Private backyard & patio'}</span>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'neighborhood') {
    return (
      <div className="w-full h-full bg-green-50 p-6">
        <h2 className="mb-4" style={{ fontSize: '28px', fontWeight: 700 }}>
          {customData.title || 'Neighborhood Guide'}
        </h2>
        <div className="aspect-video rounded-xl overflow-hidden mb-4">
          <ImageWithFallback src={imageDatabase.park} alt="Neighborhood" className="w-full h-full object-cover" />
        </div>
        <div className="bg-white rounded-lg p-4">
          <p className="text-slate-700 leading-relaxed">
            {customData.description || 'Discover a vibrant community with parks, schools, shopping, and dining all within walking distance.'}
          </p>
        </div>
      </div>
    );
  }

  if (variant === 'investment') {
    return (
      <div className="w-full h-full bg-gradient-to-br from-emerald-600 to-teal-700 p-8 text-white">
        <h2 className="mb-4" style={{ fontSize: '32px', fontWeight: 800 }}>
          {customData.title || 'Investment Property'}
        </h2>
        <div className="aspect-video rounded-xl overflow-hidden mb-4">
          <ImageWithFallback src={imageDatabase.apartment} alt="Investment" className="w-full h-full object-cover" />
        </div>
        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span>Purchase Price</span>
            <span style={{ fontWeight: 700 }}>{customData.price || '$650,000'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Est. Rental Income</span>
            <span style={{ fontWeight: 700 }}>{customData.rental || '$3,500/mo'}</span>
          </div>
          <div className="flex justify-between items-center">
            <span>Cap Rate</span>
            <span style={{ fontWeight: 700 }}>{customData.capRate || '6.5%'}</span>
          </div>
        </div>
      </div>
    );
  }

  // ARCHITECTURE Templates
  if (variant === 'modern-building') {
    return (
      <div className="w-full h-full relative overflow-hidden">
        <ImageWithFallback src={imageDatabase.skyscraper} alt="Building" className="w-full h-full object-cover" />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 to-transparent p-8 text-white">
          <h2 className="mb-2" style={{ fontSize: '36px', fontWeight: 700 }}>
            {customData.title || 'Modern Architecture'}
          </h2>
          <p style={{ fontSize: '16px', opacity: 0.9 }}>
            {customData.subtitle || 'Contemporary design excellence'}
          </p>
        </div>
      </div>
    );
  }

  if (variant === 'bridge') {
    return (
      <div className="w-full h-full relative overflow-hidden">
        <ImageWithFallback src={imageDatabase.bridge} alt="Bridge" className="w-full h-full object-cover" />
        <div className="absolute top-8 left-8 bg-white/95 backdrop-blur-sm rounded-xl p-6 max-w-md shadow-2xl">
          <h2 className="mb-2" style={{ fontSize: '26px', fontWeight: 700 }}>
            {customData.title || 'Bridge Engineering'}
          </h2>
          <p className="text-slate-600">
            {customData.description || 'Innovative structural design and engineering'}
          </p>
        </div>
      </div>
    );
  }

  if (variant === 'skyscraper') {
    return (
      <div className="w-full h-full bg-slate-900 relative overflow-hidden">
        <ImageWithFallback src={imageDatabase.skyscraper} alt="Skyscraper" className="w-full h-full object-cover opacity-80" />
        <div className="absolute inset-0 flex items-center justify-center text-white text-center px-8">
          <div>
            <h2 className="mb-3" style={{ fontSize: '48px', fontWeight: 900 }}>
              {customData.title || 'SKYSCRAPER'}
            </h2>
            <p style={{ fontSize: '20px', letterSpacing: '2px', opacity: 0.95 }}>
              {customData.subtitle || 'REACHING NEW HEIGHTS'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'historic') {
    return (
      <div className="w-full h-full bg-amber-50 p-6">
        <div className="h-full bg-white rounded-2xl overflow-hidden shadow-xl">
          <div className="h-3/5">
            <ImageWithFallback src={imageDatabase.paris} alt="Historic" className="w-full h-full object-cover" />
          </div>
          <div className="h-2/5 p-6 flex flex-col justify-center">
            <h2 style={{ fontSize: '26px', fontWeight: 700 }}>{customData.title || 'Historic Architecture'}</h2>
            <p className="text-slate-600 mt-2">
              {customData.description || 'Preserving architectural heritage and timeless beauty'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'minimalist') {
    return (
      <div className="w-full h-full bg-white p-12 flex items-center justify-center">
        <div className="max-w-md w-full">
          <div className="aspect-square rounded overflow-hidden mb-6">
            <ImageWithFallback src={imageDatabase.modernHouse} alt="Minimalist" className="w-full h-full object-cover" />
          </div>
          <h2 className="text-center mb-2" style={{ fontSize: '28px', fontWeight: 700 }}>
            {customData.title || 'Minimalist Design'}
          </h2>
          <p className="text-center text-slate-600">
            {customData.subtitle || 'Less is more'}
          </p>
        </div>
      </div>
    );
  }

  if (variant === 'urban-structure') {
    return (
      <div className="w-full h-full relative overflow-hidden">
        <ImageWithFallback src={imageDatabase.citySkyline} alt="Urban" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/70 to-purple-900/70" />
        <div className="absolute inset-0 flex items-center justify-center text-white text-center px-8">
          <div>
            <h2 className="mb-3" style={{ fontSize: '44px', fontWeight: 800 }}>
              {customData.title || 'Urban Structure'}
            </h2>
            <p style={{ fontSize: '18px', opacity: 0.95 }}>
              {customData.subtitle || 'Defining the modern skyline'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'interior-design') {
    return (
      <div className="w-full h-full bg-gray-50 p-6">
        <div className="h-full bg-white rounded-2xl overflow-hidden shadow-lg">
          <div className="h-2/3">
            <ImageWithFallback src={imageDatabase.luxuryInterior} alt="Interior" className="w-full h-full object-cover" />
          </div>
          <div className="h-1/3 p-6 flex flex-col justify-center">
            <h2 style={{ fontSize: '26px', fontWeight: 700 }}>{customData.title || 'Interior Design'}</h2>
            <p className="text-slate-600 mt-2">
              {customData.description || 'Creating beautiful and functional spaces'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'portfolio') {
    return (
      <div className="w-full h-full bg-slate-900 p-8 text-white">
        <h2 className="mb-6" style={{ fontSize: '32px', fontWeight: 700 }}>
          {customData.title || 'Architecture Portfolio'}
        </h2>
        <div className="grid grid-cols-2 gap-4">
          <ImageWithFallback src={imageDatabase.modernHouse} alt="Project 1" className="w-full aspect-square object-cover rounded-lg" />
          <ImageWithFallback src={imageDatabase.skyscraper} alt="Project 2" className="w-full aspect-square object-cover rounded-lg" />
          <ImageWithFallback src={imageDatabase.bridge} alt="Project 3" className="w-full aspect-square object-cover rounded-lg" />
          <ImageWithFallback src={imageDatabase.luxuryInterior} alt="Project 4" className="w-full aspect-square object-cover rounded-lg" />
        </div>
      </div>
    );
  }

  if (variant === 'facade') {
    return (
      <div className="w-full h-full relative overflow-hidden">
        <ImageWithFallback src={imageDatabase.skyscraper} alt="Facade" className="w-full h-full object-cover" />
        <div className="absolute top-8 right-8 bg-black/80 backdrop-blur-sm rounded-xl p-6 text-white max-w-xs">
          <h2 className="mb-2" style={{ fontSize: '24px', fontWeight: 700 }}>
            {customData.title || 'Building Facade'}
          </h2>
          <p style={{ fontSize: '14px', opacity: 0.9 }}>
            {customData.description || 'Innovative facade design and materials'}
          </p>
        </div>
      </div>
    );
  }

  if (variant === 'engineering') {
    return (
      <div className="w-full h-full bg-gradient-to-br from-gray-900 to-blue-900 p-8 text-white">
        <h2 className="mb-6" style={{ fontSize: '36px', fontWeight: 800 }}>
          {customData.title || 'Structural Engineering'}
        </h2>
        <div className="aspect-video rounded-xl overflow-hidden mb-4">
          <ImageWithFallback src={imageDatabase.bridge} alt="Engineering" className="w-full h-full object-cover" />
        </div>
        <p style={{ fontSize: '16px', opacity: 0.9, lineHeight: '1.6' }}>
          {customData.description || 'Precision engineering for complex architectural challenges'}
        </p>
      </div>
    );
  }

  if (variant === 'sustainable') {
    return (
      <div className="w-full h-full bg-green-50 p-6">
        <div className="h-full bg-white rounded-2xl overflow-hidden shadow-xl">
          <div className="h-3/5">
            <ImageWithFallback src={imageDatabase.modernHouse} alt="Sustainable" className="w-full h-full object-cover" />
          </div>
          <div className="h-2/5 p-6 flex flex-col justify-center">
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm" style={{ fontWeight: 600 }}>
                LEED Certified
              </span>
            </div>
            <h2 style={{ fontSize: '26px', fontWeight: 700 }}>{customData.title || 'Sustainable Design'}</h2>
            <p className="text-slate-600 mt-2">
              {customData.description || 'Eco-friendly architecture for a better future'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'renovation') {
    return (
      <div className="w-full h-full bg-white p-6">
        <h2 className="mb-4" style={{ fontSize: '28px', fontWeight: 700 }}>
          {customData.title || 'Renovation Project'}
        </h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <p className="text-slate-500 text-sm mb-2">Before</p>
            <ImageWithFallback src={imageDatabase.modernHouse} alt="Before" className="w-full aspect-square object-cover rounded-lg" />
          </div>
          <div>
            <p className="text-slate-500 text-sm mb-2">After</p>
            <ImageWithFallback src={imageDatabase.luxuryInterior} alt="After" className="w-full aspect-square object-cover rounded-lg" />
          </div>
        </div>
        <p className="text-slate-600">
          {customData.description || 'Complete transformation with modern amenities'}
        </p>
      </div>
    );
  }

  if (variant === 'plans') {
    return (
      <div className="w-full h-full bg-blue-900 p-8 text-white">
        <h2 className="mb-6" style={{ fontSize: '32px', fontWeight: 700 }}>
          {customData.title || 'Architectural Plans'}
        </h2>
        <div className="aspect-video rounded-xl overflow-hidden mb-4 bg-white">
          <ImageWithFallback src={imageDatabase.modernHouse} alt="Plans" className="w-full h-full object-cover" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-blue-200 text-sm">Total Area</p>
            <p style={{ fontSize: '18px', fontWeight: 600 }}>{customData.area || '3,200 sqft'}</p>
          </div>
          <div>
            <p className="text-blue-200 text-sm">Floors</p>
            <p style={{ fontSize: '18px', fontWeight: 600 }}>{customData.floors || '2 Stories'}</p>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'landscape') {
    return (
      <div className="w-full h-full relative overflow-hidden">
        <ImageWithFallback src={imageDatabase.park} alt="Landscape" className="w-full h-full object-cover" />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-green-900/90 to-transparent p-8 text-white">
          <h2 className="mb-2" style={{ fontSize: '34px', fontWeight: 700 }}>
            {customData.title || 'Landscape Architecture'}
          </h2>
          <p style={{ fontSize: '16px', opacity: 0.95 }}>
            {customData.subtitle || 'Harmonizing nature and design'}
          </p>
        </div>
      </div>
    );
  }

  if (variant === 'contemporary') {
    return (
      <div className="w-full h-full bg-slate-100 p-8">
        <div className="h-full bg-white rounded-2xl overflow-hidden shadow-2xl">
          <div className="h-4/6">
            <ImageWithFallback src={imageDatabase.modernHouse} alt="Contemporary" className="w-full h-full object-cover" />
          </div>
          <div className="h-2/6 p-6 flex flex-col justify-center">
            <h2 style={{ fontSize: '28px', fontWeight: 700 }}>{customData.title || 'Contemporary Design'}</h2>
            <p className="text-slate-600 mt-2">
              {customData.description || 'Bold, innovative, and timeless'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // NATURE Templates
  if (variant === 'mountain') {
    return (
      <div className="w-full h-full relative overflow-hidden">
        <ImageWithFallback src={imageDatabase.mountain} alt="Mountain" className="w-full h-full object-cover" />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-8 text-white">
          <h2 className="mb-2" style={{ fontSize: '40px', fontWeight: 700 }}>
            {customData.title || 'Majestic Mountains'}
          </h2>
          <p style={{ fontSize: '18px', opacity: 0.95 }}>
            {customData.subtitle || 'Where earth meets sky'}
          </p>
        </div>
      </div>
    );
  }

  if (variant === 'ocean') {
    return (
      <div className="w-full h-full relative overflow-hidden">
        <ImageWithFallback src={imageDatabase.ocean} alt="Ocean" className="w-full h-full object-cover" />
        <div className="absolute inset-0 flex items-center justify-center text-white text-center px-8">
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
            <h2 className="mb-3" style={{ fontSize: '42px', fontWeight: 800 }}>
              {customData.title || 'Ocean Waves'}
            </h2>
            <p style={{ fontSize: '18px', opacity: 0.95 }}>
              {customData.subtitle || 'The rhythm of the sea'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'forest') {
    return (
      <div className="w-full h-full relative overflow-hidden">
        <ImageWithFallback src={imageDatabase.forest} alt="Forest" className="w-full h-full object-cover" />
        <div className="absolute top-8 left-8 bg-white/95 backdrop-blur-sm rounded-xl p-6 max-w-sm shadow-2xl">
          <h2 className="mb-2" style={{ fontSize: '28px', fontWeight: 700 }}>
            {customData.title || 'Forest Serenity'}
          </h2>
          <p className="text-slate-600">
            {customData.description || 'Lost in the beauty of nature'}
          </p>
        </div>
      </div>
    );
  }

  if (variant === 'desert') {
    return (
      <div className="w-full h-full relative overflow-hidden">
        <ImageWithFallback src={imageDatabase.desert} alt="Desert" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-orange-900/40 to-transparent flex items-start justify-center pt-12">
          <div className="text-center text-white px-8">
            <h2 className="mb-3" style={{ fontSize: '46px', fontWeight: 800 }}>
              {customData.title || 'Desert Dunes'}
            </h2>
            <p style={{ fontSize: '20px', opacity: 0.95 }}>
              {customData.subtitle || 'Endless horizons'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'waterfall') {
    return (
      <div className="w-full h-full relative overflow-hidden">
        <ImageWithFallback src={imageDatabase.waterfall} alt="Waterfall" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-blue-900/70 to-transparent flex items-end">
          <div className="p-8 text-white w-full">
            <h2 className="mb-2" style={{ fontSize: '38px', fontWeight: 700 }}>
              {customData.title || 'Waterfall Wonderland'}
            </h2>
            <p style={{ fontSize: '16px', opacity: 0.95 }}>
              {customData.subtitle || 'Nature\'s power and beauty'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'aurora') {
    return (
      <div className="w-full h-full relative overflow-hidden">
        <ImageWithFallback src={imageDatabase.aurora} alt="Aurora" className="w-full h-full object-cover" />
        <div className="absolute inset-0 flex items-center justify-center text-white text-center px-8">
          <div>
            <h2 className="mb-3" style={{ fontSize: '48px', fontWeight: 900 }}>
              {customData.title || 'Aurora Borealis'}
            </h2>
            <p style={{ fontSize: '20px', letterSpacing: '2px', opacity: 0.95 }}>
              {customData.subtitle || 'NORTHERN LIGHTS'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'lake') {
    return (
      <div className="w-full h-full bg-blue-50 p-6">
        <div className="h-full bg-white rounded-2xl overflow-hidden shadow-xl">
          <div className="h-4/5">
            <ImageWithFallback src={imageDatabase.lake} alt="Lake" className="w-full h-full object-cover" />
          </div>
          <div className="h-1/5 px-6 flex flex-col justify-center">
            <h2 style={{ fontSize: '26px', fontWeight: 700 }}>{customData.title || 'Lake Reflection'}</h2>
            <p className="text-slate-600">{customData.subtitle || 'Mirror of tranquility'}</p>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'canyon') {
    return (
      <div className="w-full h-full relative overflow-hidden">
        <ImageWithFallback src={imageDatabase.canyon} alt="Canyon" className="w-full h-full object-cover" />
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-red-900/90 to-transparent p-8 text-white">
          <h2 className="mb-2" style={{ fontSize: '40px', fontWeight: 700 }}>
            {customData.title || 'Grand Canyon'}
          </h2>
          <p style={{ fontSize: '18px', opacity: 0.95 }}>
            {customData.subtitle || 'Carved by time'}
          </p>
        </div>
      </div>
    );
  }

  if (variant === 'sunset') {
    return (
      <div className="w-full h-full relative overflow-hidden">
        <ImageWithFallback src={imageDatabase.ocean} alt="Sunset" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-orange-900/60 via-pink-900/40 to-purple-900/40 flex items-center justify-center">
          <div className="text-center text-white px-8">
            <h2 className="mb-3" style={{ fontSize: '44px', fontWeight: 800 }}>
              {customData.title || 'Sunset Beach'}
            </h2>
            <p style={{ fontSize: '20px', opacity: 0.95 }}>
              {customData.subtitle || 'Golden hour magic'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'park') {
    return (
      <div className="w-full h-full bg-green-50 p-6">
        <div className="h-full bg-white rounded-2xl overflow-hidden shadow-lg">
          <div className="h-3/5">
            <ImageWithFallback src={imageDatabase.park} alt="Park" className="w-full h-full object-cover" />
          </div>
          <div className="h-2/5 p-6 flex flex-col justify-center">
            <h2 style={{ fontSize: '28px', fontWeight: 700 }}>{customData.title || 'National Park'}</h2>
            <p className="text-slate-600 mt-2">
              {customData.description || 'Explore pristine wilderness and natural beauty'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'botanical') {
    return (
      <div className="w-full h-full bg-white p-6">
        <div className="aspect-square rounded-xl overflow-hidden mb-4">
          <ImageWithFallback src={imageDatabase.garden} alt="Botanical" className="w-full h-full object-cover" />
        </div>
        <h2 className="text-center mb-2" style={{ fontSize: '26px', fontWeight: 700 }}>
          {customData.title || 'Botanical Garden'}
        </h2>
        <p className="text-center text-slate-600">
          {customData.subtitle || 'A paradise of flora'}
        </p>
      </div>
    );
  }

  if (variant === 'tropical') {
    return (
      <div className="w-full h-full relative overflow-hidden">
        <ImageWithFallback src={imageDatabase.tropical} alt="Tropical" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-green-900/50 to-blue-900/50 flex items-center justify-center">
          <div className="text-center text-white px-8">
            <h2 className="mb-3" style={{ fontSize: '46px', fontWeight: 800 }}>
              {customData.title || 'Tropical Paradise'}
            </h2>
            <p style={{ fontSize: '20px', opacity: 0.95 }}>
              {customData.subtitle || 'Escape to paradise'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'winter') {
    return (
      <div className="w-full h-full bg-slate-100 p-6">
        <div className="h-full bg-white rounded-2xl overflow-hidden shadow-xl">
          <div className="h-4/5">
            <ImageWithFallback src={imageDatabase.mountain} alt="Winter" className="w-full h-full object-cover" />
          </div>
          <div className="h-1/5 px-6 flex flex-col justify-center">
            <h2 style={{ fontSize: '28px', fontWeight: 700 }}>{customData.title || 'Winter Wonderland'}</h2>
            <p className="text-slate-600">{customData.subtitle || 'Frozen beauty'}</p>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'meadow') {
    return (
      <div className="w-full h-full relative overflow-hidden">
        <ImageWithFallback src={imageDatabase.garden} alt="Meadow" className="w-full h-full object-cover" />
        <div className="absolute top-8 left-8 bg-white/95 backdrop-blur-sm rounded-xl p-6 max-w-sm shadow-2xl">
          <h2 className="mb-2" style={{ fontSize: '28px', fontWeight: 700 }}>
            {customData.title || 'Spring Meadow'}
          </h2>
          <p className="text-slate-600">
            {customData.description || 'A carpet of wildflowers'}
          </p>
        </div>
      </div>
    );
  }

  if (variant === 'autumn') {
    return (
      <div className="w-full h-full relative overflow-hidden">
        <ImageWithFallback src={imageDatabase.forest} alt="Autumn" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-orange-900/70 to-transparent flex items-end">
          <div className="p-8 text-white w-full">
            <h2 className="mb-2" style={{ fontSize: '38px', fontWeight: 700 }}>
              {customData.title || 'Autumn Forest'}
            </h2>
            <p style={{ fontSize: '16px', opacity: 0.95 }}>
              {customData.subtitle || 'Colors of fall'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // URBAN Templates
  if (variant === 'tokyo') {
    return (
      <div className="w-full h-full relative overflow-hidden">
        <ImageWithFallback src={imageDatabase.tokyo} alt="Tokyo" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-purple-900/80 to-transparent flex items-end">
          <div className="p-8 text-white w-full">
            <h2 className="mb-2" style={{ fontSize: '42px', fontWeight: 800 }}>
              {customData.title || 'TOKYO'}
            </h2>
            <p style={{ fontSize: '18px', opacity: 0.95, letterSpacing: '1px' }}>
              {customData.subtitle || 'CITY OF LIGHTS'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'paris') {
    return (
      <div className="w-full h-full relative overflow-hidden">
        <ImageWithFallback src={imageDatabase.paris} alt="Paris" className="w-full h-full object-cover" />
        <div className="absolute inset-0 flex items-center justify-center text-white text-center px-8">
          <div className="bg-black/40 backdrop-blur-sm rounded-2xl p-8 border border-white/20">
            <h2 className="mb-3" style={{ fontSize: '48px', fontWeight: 900 }}>
              {customData.title || 'PARIS'}
            </h2>
            <p style={{ fontSize: '20px', opacity: 0.95 }}>
              {customData.subtitle || 'The City of Romance'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'newyork') {
    return (
      <div className="w-full h-full bg-slate-900 relative overflow-hidden">
        <ImageWithFallback src={imageDatabase.newyork} alt="New York" className="w-full h-full object-cover opacity-80" />
        <div className="absolute inset-0 flex items-center justify-center text-white text-center px-8">
          <div>
            <h2 className="mb-3" style={{ fontSize: '52px', fontWeight: 900 }}>
              {customData.title || 'NEW YORK'}
            </h2>
            <p style={{ fontSize: '22px', letterSpacing: '2px', opacity: 0.95 }}>
              {customData.subtitle || 'THE BIG APPLE'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'london') {
    return (
      <div className="w-full h-full bg-gray-50 p-6">
        <div className="h-full bg-white rounded-2xl overflow-hidden shadow-xl">
          <div className="h-3/5">
            <ImageWithFallback src={imageDatabase.london} alt="London" className="w-full h-full object-cover" />
          </div>
          <div className="h-2/5 p-6 flex flex-col justify-center">
            <h2 style={{ fontSize: '32px', fontWeight: 700 }}>{customData.title || 'London'}</h2>
            <p className="text-slate-600 mt-2">
              {customData.description || 'Historic architecture meets modern culture'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'dubai') {
    return (
      <div className="w-full h-full relative overflow-hidden">
        <ImageWithFallback src={imageDatabase.dubai} alt="Dubai" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-amber-900/80 to-transparent flex items-end">
          <div className="p-8 text-white w-full">
            <h2 className="mb-2" style={{ fontSize: '44px', fontWeight: 800 }}>
              {customData.title || 'DUBAI'}
            </h2>
            <p style={{ fontSize: '18px', opacity: 0.95 }}>
              {customData.subtitle || 'City of the future'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'street') {
    return (
      <div className="w-full h-full relative overflow-hidden">
        <ImageWithFallback src={imageDatabase.street} alt="Street" className="w-full h-full object-cover" />
        <div className="absolute top-8 left-8 bg-black/80 backdrop-blur-sm rounded-xl p-6 text-white max-w-sm">
          <h2 className="mb-2" style={{ fontSize: '26px', fontWeight: 700 }}>
            {customData.title || 'Street Photography'}
          </h2>
          <p style={{ fontSize: '14px', opacity: 0.9 }}>
            {customData.subtitle || 'Capturing urban life'}
          </p>
        </div>
      </div>
    );
  }

  if (variant === 'skyline') {
    return (
      <div className="w-full h-full relative overflow-hidden">
        <ImageWithFallback src={imageDatabase.citySkyline} alt="Skyline" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/70 flex items-end">
          <div className="p-8 text-white w-full">
            <h2 className="mb-2" style={{ fontSize: '40px', fontWeight: 700 }}>
              {customData.title || 'City Skyline'}
            </h2>
            <p style={{ fontSize: '16px', opacity: 0.95 }}>
              {customData.subtitle || 'Urban horizons'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'explorer') {
    return (
      <div className="w-full h-full bg-gradient-to-br from-indigo-600 to-purple-700 p-8 text-white">
        <h2 className="mb-6" style={{ fontSize: '36px', fontWeight: 800 }}>
          {customData.title || 'Urban Explorer'}
        </h2>
        <div className="aspect-video rounded-xl overflow-hidden mb-4">
          <ImageWithFallback src={imageDatabase.street} alt="Urban" className="w-full h-full object-cover" />
        </div>
        <p style={{ fontSize: '16px', opacity: 0.95, lineHeight: '1.6' }}>
          {customData.description || 'Discover hidden gems in the concrete jungle'}
        </p>
      </div>
    );
  }

  if (variant === 'downtown') {
    return (
      <div className="w-full h-full bg-slate-900 p-6">
        <div className="h-full bg-white rounded-2xl overflow-hidden shadow-xl">
          <div className="h-2/3">
            <ImageWithFallback src={imageDatabase.citySkyline} alt="Downtown" className="w-full h-full object-cover" />
          </div>
          <div className="h-1/3 p-6 flex flex-col justify-center">
            <h2 style={{ fontSize: '28px', fontWeight: 700 }}>{customData.title || 'Downtown District'}</h2>
            <p className="text-slate-600 mt-2">
              {customData.description || 'The heart of the city'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'metropolitan') {
    return (
      <div className="w-full h-full relative overflow-hidden">
        <ImageWithFallback src={imageDatabase.newyork} alt="Metropolitan" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900/70 to-purple-900/70 flex items-center justify-center">
          <div className="text-center text-white px-8">
            <h2 className="mb-3" style={{ fontSize: '48px', fontWeight: 900 }}>
              {customData.title || 'METROPOLITAN'}
            </h2>
            <p style={{ fontSize: '20px', letterSpacing: '2px', opacity: 0.95 }}>
              {customData.subtitle || 'MODERN CITY LIFE'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  // FOOD Templates
  if (variant === 'menu') {
    return (
      <div className="w-full h-full bg-amber-50 p-8">
        <h2 className="mb-6 text-center" style={{ fontSize: '32px', fontWeight: 700 }}>
          {customData.title || 'Restaurant Menu'}
        </h2>
        <div className="aspect-video rounded-xl overflow-hidden mb-6">
          <ImageWithFallback src={imageDatabase.restaurant} alt="Restaurant" className="w-full h-full object-cover" />
        </div>
        <div className="space-y-4">
          <div className="flex justify-between items-start">
            <div>
              <p style={{ fontSize: '18px', fontWeight: 600 }}>{customData.dish1 || 'Signature Dish'}</p>
              <p className="text-slate-600 text-sm">{customData.desc1 || 'Chef\'s special creation'}</p>
            </div>
            <p style={{ fontSize: '18px', fontWeight: 700, color: '#d97706' }}>
              {customData.price1 || '$24'}
            </p>
          </div>
          <div className="flex justify-between items-start">
            <div>
              <p style={{ fontSize: '18px', fontWeight: 600 }}>{customData.dish2 || 'Premium Selection'}</p>
              <p className="text-slate-600 text-sm">{customData.desc2 || 'Fresh ingredients daily'}</p>
            </div>
            <p style={{ fontSize: '18px', fontWeight: 700, color: '#d97706' }}>
              {customData.price2 || '$32'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'italian') {
    return (
      <div className="w-full h-full bg-white p-6">
        <div className="h-full bg-gradient-to-br from-red-50 to-green-50 rounded-2xl overflow-hidden shadow-lg">
          <div className="h-3/5">
            <ImageWithFallback src={imageDatabase.pasta} alt="Italian" className="w-full h-full object-cover" />
          </div>
          <div className="h-2/5 p-6 flex flex-col justify-center">
            <h2 style={{ fontSize: '28px', fontWeight: 700, color: '#dc2626' }}>
              {customData.title || 'Italian Cuisine'}
            </h2>
            <p className="text-slate-600 mt-2">
              {customData.subtitle || 'Authentic flavors from Italy'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'sushi') {
    return (
      <div className="w-full h-full bg-slate-900 p-6">
        <div className="h-full bg-white rounded-2xl overflow-hidden shadow-xl">
          <div className="h-2/3">
            <ImageWithFallback src={imageDatabase.sushi} alt="Sushi" className="w-full h-full object-cover" />
          </div>
          <div className="h-1/3 p-6 flex flex-col justify-center">
            <h2 style={{ fontSize: '26px', fontWeight: 700 }}>{customData.title || 'Japanese Sushi'}</h2>
            <p className="text-slate-600 mt-2">
              {customData.subtitle || 'Fresh, handcrafted perfection'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'bakery') {
    return (
      <div className="w-full h-full bg-orange-50 p-6">
        <div className="aspect-video rounded-xl overflow-hidden mb-4">
          <ImageWithFallback src={imageDatabase.bakery} alt="Bakery" className="w-full h-full object-cover" />
        </div>
        <h2 className="mb-2" style={{ fontSize: '28px', fontWeight: 700, color: '#ea580c' }}>
          {customData.title || 'Artisan Bakery'}
        </h2>
        <p className="text-slate-700 mb-4">
          {customData.description || 'Freshly baked every morning'}
        </p>
        <div className="flex gap-2 flex-wrap">
          <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
            {customData.item1 || 'Croissants'}
          </span>
          <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
            {customData.item2 || 'Sourdough'}
          </span>
          <span className="px-3 py-1 bg-orange-100 text-orange-700 rounded-full text-sm">
            {customData.item3 || 'Pastries'}
          </span>
        </div>
      </div>
    );
  }

  if (variant === 'cocktail') {
    return (
      <div className="w-full h-full bg-gradient-to-br from-purple-900 to-pink-900 relative overflow-hidden">
        <ImageWithFallback src={imageDatabase.cocktail} alt="Cocktail" className="w-full h-full object-cover opacity-70" />
        <div className="absolute inset-0 flex items-center justify-center text-white text-center px-8">
          <div>
            <h2 className="mb-3" style={{ fontSize: '42px', fontWeight: 800 }}>
              {customData.title || 'Cocktail Bar'}
            </h2>
            <p style={{ fontSize: '18px', opacity: 0.95 }}>
              {customData.subtitle || 'Mixology perfection'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'coffee') {
    return (
      <div className="w-full h-full bg-amber-100 p-6">
        <div className="h-full bg-white rounded-2xl overflow-hidden shadow-lg">
          <div className="h-3/5">
            <ImageWithFallback src={imageDatabase.coffee} alt="Coffee" className="w-full h-full object-cover" />
          </div>
          <div className="h-2/5 p-6 flex flex-col justify-center">
            <h2 style={{ fontSize: '26px', fontWeight: 700 }}>{customData.title || 'Coffee Shop'}</h2>
            <p className="text-slate-600 mt-2">
              {customData.subtitle || 'Your daily dose of happiness'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'healthy') {
    return (
      <div className="w-full h-full bg-green-50 p-6">
        <div className="aspect-square rounded-xl overflow-hidden mb-4">
          <ImageWithFallback src={imageDatabase.salad} alt="Healthy Food" className="w-full h-full object-cover" />
        </div>
        <h2 className="text-center mb-2" style={{ fontSize: '26px', fontWeight: 700, color: '#16a34a' }}>
          {customData.title || 'Healthy Food'}
        </h2>
        <p className="text-center text-slate-600 mb-4">
          {customData.subtitle || 'Nourish your body'}
        </p>
        <div className="flex justify-center gap-2">
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
            {customData.tag1 || 'Organic'}
          </span>
          <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
            {customData.tag2 || 'Fresh'}
          </span>
        </div>
      </div>
    );
  }

  if (variant === 'fine-dining') {
    return (
      <div className="w-full h-full bg-slate-900 text-white p-8">
        <div className="text-center mb-6">
          <h2 className="mb-2" style={{ fontSize: '34px', fontWeight: 700 }}>
            {customData.title || 'Fine Dining'}
          </h2>
          <p style={{ fontSize: '16px', opacity: 0.9 }}>
            {customData.subtitle || 'An exquisite culinary journey'}
          </p>
        </div>
        <div className="aspect-video rounded-xl overflow-hidden">
          <ImageWithFallback src={imageDatabase.restaurant} alt="Fine Dining" className="w-full h-full object-cover" />
        </div>
      </div>
    );
  }

  if (variant === 'delivery') {
    return (
      <div className="w-full h-full bg-gradient-to-br from-red-500 to-orange-600 p-8 text-white">
        <h2 className="mb-6" style={{ fontSize: '36px', fontWeight: 800 }}>
          {customData.title || 'Food Delivery'}
        </h2>
        <div className="grid grid-cols-2 gap-4 mb-6">
          <div className="aspect-square rounded-lg overflow-hidden">
            <ImageWithFallback src={imageDatabase.pasta} alt="Food 1" className="w-full h-full object-cover" />
          </div>
          <div className="aspect-square rounded-lg overflow-hidden">
            <ImageWithFallback src={imageDatabase.sushi} alt="Food 2" className="w-full h-full object-cover" />
          </div>
        </div>
        <p style={{ fontSize: '18px', opacity: 0.95 }}>
          {customData.tagline || 'Hot & fresh to your door'}
        </p>
      </div>
    );
  }

  if (variant === 'culinary') {
    return (
      <div className="w-full h-full bg-white p-8">
        <h2 className="mb-6 text-center" style={{ fontSize: '32px', fontWeight: 700 }}>
          {customData.title || 'Culinary Classes'}
        </h2>
        <div className="aspect-video rounded-xl overflow-hidden mb-4">
          <ImageWithFallback src={imageDatabase.restaurant} alt="Culinary" className="w-full h-full object-cover" />
        </div>
        <p className="text-slate-700 text-center mb-4">
          {customData.description || 'Learn from expert chefs'}
        </p>
        <div className="flex justify-center gap-3">
          <span className="px-4 py-2 bg-red-100 text-red-700 rounded-lg" style={{ fontWeight: 600 }}>
            {customData.level || 'All Levels'}
          </span>
          <span className="px-4 py-2 bg-amber-100 text-amber-700 rounded-lg" style={{ fontWeight: 600 }}>
            {customData.price || '$79/class'}
          </span>
        </div>
      </div>
    );
  }

  // Default fallback
  return (
    <div className="w-full h-full bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center text-white p-8">
      <div className="text-center">
        <h2 className="mb-2" style={{ fontSize: '28px', fontWeight: 700 }}>
          {variant}
        </h2>
        <p style={{ fontSize: '16px', opacity: 0.9 }}>
          Visual Template
        </p>
      </div>
    </div>
  );
}
