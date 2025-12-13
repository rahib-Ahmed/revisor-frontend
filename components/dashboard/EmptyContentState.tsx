import { Upload } from 'lucide-react';

export function EmptyContentState() {
  return (
    <div className="border-border flex flex-col items-center justify-center rounded-lg border-2 border-dashed px-4 py-16">
      <div className="bg-muted mb-4 flex h-16 w-16 items-center justify-center rounded-full">
        <Upload className="text-muted-foreground h-8 w-8" />
      </div>
      <h2 className="text-foreground mb-2 text-xl font-semibold">No content yet</h2>
      <p className="text-muted-foreground mb-6 max-w-sm text-center">
        Upload your class notes, audio recordings, or PDF documents to start your revision sessions.
      </p>
      <div className="text-muted-foreground text-sm">
        Drag and drop files here, or click to browse
      </div>
      <p className="text-muted-foreground mt-2 text-xs">
        Supports: .txt, .md, .pdf, .mp3, .m4a, .wav
      </p>
    </div>
  );
}
