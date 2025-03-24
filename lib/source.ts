import { loader } from 'fumadocs-core/source';
import { createElement } from 'react';
import { icons } from 'lucide-react';
import { createMDXSource } from 'fumadocs-mdx';
import { meta, docs, guide as guides, course, courseMeta, integrations } from '@/.source';
import type { InferMetaType, InferPageType } from 'fumadocs-core/source';
import { createOpenAPI } from 'fumadocs-openapi/server';

export const documentation = loader({
  baseUrl: '/docs',
  icon(icon) {
    if (icon && icon in icons)
      return createElement(icons[icon as keyof typeof icons]);
  },
  source: createMDXSource(docs, meta),
});

export const academy = loader({
  baseUrl: '/academy',
  icon(icon) {
    if (icon && icon in icons)
      return createElement(icons[icon as keyof typeof icons]);
  },
  source: createMDXSource(course, courseMeta),
});

export const guide = loader({
  baseUrl: '/guides',
  source: createMDXSource(guides, []),
});

export const integration = loader({
  baseUrl: '/integrations',
  source: createMDXSource(integrations, []),
});

export const openapi = createOpenAPI({
  proxyUrl: '/api/proxy',
  shikiOptions: {
    themes: {
      dark: 'vesper',
      light: 'vitesse-light',
    },
  },
});

export type Page = InferPageType<typeof documentation>;
export type Meta = InferMetaType<typeof documentation>;
