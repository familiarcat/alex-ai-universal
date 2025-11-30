import { z } from 'zod';

export const BlockSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('heading'), level: z.enum(['h1','h2','h3']), text: z.string().min(1) }),
  z.object({ type: z.literal('paragraph'), text: z.string().min(1) }),
  z.object({ type: z.literal('image'), url: z.string().url(), alt: z.string().default('') }),
  z.object({ type: z.literal('rich'), mdx: z.string().min(1) }),
]);

export const PageSchema = z.object({
  id: z.string().uuid().optional(),
  slug: z.string().min(1),
  title: z.string().min(1),
  locale: z.string().default('en'),
  status: z.enum(['draft','published']).default('draft'),
  tags: z.array(z.string()).default([]),
  blocks: z.array(BlockSchema),
  updatedAt: z.string().datetime().optional(),
});

export type Block = z.infer<typeof BlockSchema>;
export type Page = z.infer<typeof PageSchema>;

export const ConstructorEventSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('PageDraftSaved'), page: PageSchema }),
  z.object({ type: z.literal('PagePublished'), pageId: z.string(), revalidateTags: z.array(z.string()).default([]) }),
  z.object({ type: z.literal('AssetUploaded'), url: z.string().url(), pageId: z.string().optional() }),
]);

export type ConstructorEvent = z.infer<typeof ConstructorEventSchema>;


