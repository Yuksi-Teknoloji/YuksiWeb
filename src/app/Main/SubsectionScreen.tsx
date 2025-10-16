// src/app/Main/SubsectionScreen.tsx
import { fetchSubSectionByType, enumToLabel } from '@/lib/subsection';

export default async function SubsectionScreen({ type }: { type: number }) {
  const data = await fetchSubSectionByType(type).catch(() => null);

  const title = data?.title?.trim() || enumToLabel(type);
  const html = (data?.content ?? '').trim();

  return (
    <div className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="mb-3 text-2xl font-semibold">{title}</h1>
      {!html ? (
        <p className="text-neutral-600">Bu başlık için içerik bulunamadı.</p>
      ) : (
        <article
          className="prose max-w-none prose-headings:font-semibold prose-p:leading-7"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      )}
    </div>
  );
}
