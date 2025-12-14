'use client';

import { UploadDropzone } from '@/components/upload/UploadDropzone';
import { ContentList } from '@/components/upload/ContentList';

export function EmptyContentState() {
  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-foreground mb-2 text-xl font-semibold">Get started with revisor</h2>
        <p className="text-muted-foreground mx-auto max-w-md">
          Upload your class notes, audio recordings, or PDF documents to start your voice-based
          revision sessions.
        </p>
      </div>

      <UploadDropzone />

      <section className="mt-8">
        <h3 className="text-foreground mb-4 text-lg font-semibold">Your Content Library</h3>
        <ContentList />
      </section>
    </div>
  );
}
