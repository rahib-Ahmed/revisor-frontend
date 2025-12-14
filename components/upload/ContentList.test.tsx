import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ContentList } from './ContentList';
import { StatusBadge } from './StatusBadge';
import { FileTypeIcon } from './FileTypeIcon';
import { ContentCard } from './ContentCard';
import type { ContentItem } from '@/types/content';

// Mock the useContentItems hook
vi.mock('@/hooks/useContentItems', () => ({
  useContentItems: vi.fn(),
}));

import { useContentItems } from '@/hooks/useContentItems';

const mockUseContentItems = vi.mocked(useContentItems);

const mockContentItems: ContentItem[] = [
  {
    id: '1',
    userId: 'user-1',
    contentType: 'text',
    status: 'ready',
    originalFilename: 'notes.txt',
    filePath: 'user-1/1/notes.txt',
    fileSize: 1024,
    mimeType: 'text/plain',
    title: 'My Notes',
    chunkCount: 5,
    errorMessage: null,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    userId: 'user-1',
    contentType: 'audio',
    status: 'transcribing',
    originalFilename: 'lecture.mp3',
    filePath: 'user-1/2/lecture.mp3',
    fileSize: 5242880,
    mimeType: 'audio/mpeg',
    title: null,
    errorMessage: null,
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z',
  },
  {
    id: '3',
    userId: 'user-1',
    contentType: 'pdf',
    status: 'failed',
    originalFilename: 'document.pdf',
    filePath: 'user-1/3/document.pdf',
    fileSize: 2097152,
    mimeType: 'application/pdf',
    title: 'Important Document',
    errorMessage: 'Failed to extract text from PDF',
    createdAt: '2024-01-03T00:00:00Z',
    updatedAt: '2024-01-03T00:00:00Z',
  },
];

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
    },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  };
}

describe('StatusBadge', () => {
  it('shows "Ready" with correct styling for ready status', () => {
    render(<StatusBadge status="ready" />);
    const badge = screen.getByText('Ready');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-green-100');
  });

  it('shows "Failed" with correct styling for failed status', () => {
    render(<StatusBadge status="failed" errorMessage="Test error" />);
    const badge = screen.getByText('Failed');
    expect(badge).toBeInTheDocument();
    expect(badge).toHaveClass('bg-red-100');
    expect(badge).toHaveAttribute('title', 'Test error');
  });

  it('shows spinner for processing statuses', () => {
    render(<StatusBadge status="transcribing" />);
    expect(screen.getByText('Transcribing...')).toBeInTheDocument();
    // Check for spinner SVG
    const svg = document.querySelector('svg.animate-spin');
    expect(svg).toBeInTheDocument();
  });

  it('shows spinner for indexing status', () => {
    render(<StatusBadge status="indexing" />);
    expect(screen.getByText('Indexing...')).toBeInTheDocument();
    const svg = document.querySelector('svg.animate-spin');
    expect(svg).toBeInTheDocument();
  });

  it('shows correct label for parsing status', () => {
    render(<StatusBadge status="parsing" />);
    expect(screen.getByText('Analyzing...')).toBeInTheDocument();
  });
});

describe('FileTypeIcon', () => {
  it('shows document icon for text content type', () => {
    render(<FileTypeIcon contentType="text" />);
    // The component renders an SVG from lucide-react
    const svg = document.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass('text-blue-500');
  });

  it('shows music icon for audio content type', () => {
    render(<FileTypeIcon contentType="audio" />);
    const svg = document.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass('text-purple-500');
  });

  it('shows document icon for pdf content type', () => {
    render(<FileTypeIcon contentType="pdf" />);
    const svg = document.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass('text-red-500');
  });

  it('supports mimeType prop fallback', () => {
    render(<FileTypeIcon mimeType="audio/mpeg" />);
    const svg = document.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass('text-purple-500');
  });
});

describe('ContentCard', () => {
  const mockOnClick = vi.fn();

  beforeEach(() => {
    mockOnClick.mockClear();
  });

  it('renders content item details', () => {
    render(<ContentCard item={mockContentItems[0]} onClick={mockOnClick} />);

    expect(screen.getByText('My Notes')).toBeInTheDocument();
    expect(screen.getByText('Ready')).toBeInTheDocument();
    expect(screen.getByText('1 KB')).toBeInTheDocument();
    expect(screen.getByText('5 indexed chunks')).toBeInTheDocument();
  });

  it('shows original filename when title is null', () => {
    render(<ContentCard item={mockContentItems[1]} onClick={mockOnClick} />);

    expect(screen.getByText('lecture.mp3')).toBeInTheDocument();
  });

  it('shows error message for failed items', () => {
    render(<ContentCard item={mockContentItems[2]} onClick={mockOnClick} />);

    expect(screen.getByText('Failed to extract text from PDF')).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const user = userEvent.setup();
    render(<ContentCard item={mockContentItems[0]} onClick={mockOnClick} />);

    await user.click(screen.getByText('My Notes'));

    expect(mockOnClick).toHaveBeenCalledTimes(1);
  });
});

describe('ContentList', () => {
  beforeEach(() => {
    mockUseContentItems.mockReset();
  });

  it('renders loading skeleton while fetching', () => {
    mockUseContentItems.mockReturnValue({
      data: undefined,
      isLoading: true,
      error: null,
      deleteItem: vi.fn(),
      deleteItemAsync: vi.fn(),
      isDeleting: false,
      deleteError: null,
      retryItem: vi.fn(),
      retryItemAsync: vi.fn(),
      isRetrying: false,
      retryError: null,
    } as unknown as ReturnType<typeof useContentItems>);

    render(<ContentList />, { wrapper: createWrapper() });

    // Should show skeleton loading divs
    const skeletons = document.querySelectorAll('.animate-pulse');
    expect(skeletons.length).toBeGreaterThan(0);
  });

  it('renders empty state when no items', () => {
    mockUseContentItems.mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
      deleteItem: vi.fn(),
      deleteItemAsync: vi.fn(),
      isDeleting: false,
      deleteError: null,
      retryItem: vi.fn(),
      retryItemAsync: vi.fn(),
      isRetrying: false,
      retryError: null,
    } as unknown as ReturnType<typeof useContentItems>);

    render(<ContentList />, { wrapper: createWrapper() });

    expect(screen.getByText('No content uploaded yet')).toBeInTheDocument();
    expect(screen.getByText('Drag and drop files above to get started')).toBeInTheDocument();
  });

  it('renders error message on fetch failure', () => {
    mockUseContentItems.mockReturnValue({
      data: undefined,
      isLoading: false,
      error: new Error('Network error'),
      deleteItem: vi.fn(),
      deleteItemAsync: vi.fn(),
      isDeleting: false,
      deleteError: null,
      retryItem: vi.fn(),
      retryItemAsync: vi.fn(),
      isRetrying: false,
      retryError: null,
    } as unknown as ReturnType<typeof useContentItems>);

    render(<ContentList />, { wrapper: createWrapper() });

    expect(screen.getByText('Failed to load content. Please try again.')).toBeInTheDocument();
  });

  it('renders grid of content cards when items exist', () => {
    mockUseContentItems.mockReturnValue({
      data: mockContentItems,
      isLoading: false,
      error: null,
      deleteItem: vi.fn(),
      deleteItemAsync: vi.fn(),
      isDeleting: false,
      deleteError: null,
      retryItem: vi.fn(),
      retryItemAsync: vi.fn(),
      isRetrying: false,
      retryError: null,
    } as unknown as ReturnType<typeof useContentItems>);

    render(<ContentList />, { wrapper: createWrapper() });

    expect(screen.getByText('My Notes')).toBeInTheDocument();
    expect(screen.getByText('lecture.mp3')).toBeInTheDocument();
    expect(screen.getByText('Important Document')).toBeInTheDocument();
  });

  it('opens modal when card is clicked', async () => {
    const user = userEvent.setup();

    mockUseContentItems.mockReturnValue({
      data: mockContentItems,
      isLoading: false,
      error: null,
      deleteItem: vi.fn(),
      deleteItemAsync: vi.fn(),
      isDeleting: false,
      deleteError: null,
      retryItem: vi.fn(),
      retryItemAsync: vi.fn(),
      isRetrying: false,
      retryError: null,
    } as unknown as ReturnType<typeof useContentItems>);

    render(<ContentList />, { wrapper: createWrapper() });

    await user.click(screen.getByText('My Notes'));

    // Modal should open - check for modal content
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});
