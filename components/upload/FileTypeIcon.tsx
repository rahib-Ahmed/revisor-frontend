import { FileText, FileType, Music, Video } from 'lucide-react';
import type { ContentType } from '@/types/content';

interface FileTypeIconProps {
  mimeType?: string;
  contentType?: ContentType;
  className?: string;
}

export function FileTypeIcon({ mimeType, contentType, className = 'w-8 h-8' }: FileTypeIconProps) {
  // Support contentType directly
  if (contentType) {
    switch (contentType) {
      case 'text':
        return <FileText className={`${className} text-blue-500`} />;
      case 'audio':
        return <Music className={`${className} text-purple-500`} />;
      case 'pdf':
        return <FileType className={`${className} text-red-500`} />;
      case 'video':
        return <Video className={`${className} text-orange-500`} />;
      default:
        return <FileText className={`${className} text-gray-500`} />;
    }
  }

  // Fallback to mimeType detection
  if (mimeType) {
    if (mimeType.startsWith('text/') || mimeType === 'text/markdown') {
      return <FileText className={`${className} text-blue-500`} />;
    }

    if (mimeType.startsWith('audio/')) {
      return <Music className={`${className} text-purple-500`} />;
    }

    if (mimeType === 'application/pdf') {
      return <FileType className={`${className} text-red-500`} />;
    }

    if (mimeType.startsWith('video/')) {
      return <Video className={`${className} text-orange-500`} />;
    }
  }

  return <FileText className={`${className} text-gray-500`} />;
}
