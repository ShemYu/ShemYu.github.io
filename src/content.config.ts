import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

const canonical = z.preprocess(
  (value) => {
    if (value === null || value === undefined) return undefined;
    if (typeof value === 'string' && value.trim() === '') return undefined;
    return value;
  },
  z
    .string()
    .refine((value) => URL.canParse(value), { message: 'canonical must be an absolute URL' })
    .optional(),
);

const blog = defineCollection({
  loader: glob({ base: './src/content/blog', pattern: '**/*.md' }),
  schema: z.object({
    title: z.string().min(1),
    date: z.coerce.date(),
    description: z.string().min(1),
    tags: z.array(z.string().min(1)).default([]),
    lang: z.enum(['en', 'zh']),
    translationKey: z.string().min(1),
    canonical,
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };
