import { FileText, FileType, Music, Video } from 'lucide-react';

interface FileTypeIconProps {
  mimeType: string;
  className?: string;
}

export function FileTypeIcon({ mimeType, className = 'w-8 h-8' }: FileTypeIconProps) {
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

  return <FileText className={`${className} text-gray-500`} />;
}
