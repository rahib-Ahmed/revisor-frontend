'use client';

import { UploadDropzone } from '@/components/upload/UploadDropzone';

export function EmptyContentState() {
  return (
    <div className="space-y-4">
      <div className="mb-8 text-center">
        <h2 className="text-foreground mb-2 text-xl font-semibold">Get started with revisor</h2>
        <p className="text-muted-foreground mx-auto max-w-md">
          Upload your class notes, audio recordings, or PDF documents to start your voice-based
          revision sessions.
        </p>
      </div>

      <UploadDropzone />
    </div>
  );
}
