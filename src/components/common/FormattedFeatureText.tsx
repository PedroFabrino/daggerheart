import React from 'react';

interface FormattedFeatureTextProps {
  text: string;
  className?: string;
}

/**
 * Parses inline markdown:
 * - ***bold italic***
 * - **bold**
 * - _italic_ or *italic*
 */
function renderInlineMarkdown(text: string): React.ReactNode[] {
  // Regex splitting on ***...***, **_..._**, **...**, _..._, or *...*
  const tokenRegex = /(\*\*\*[^*]+\*\*\*|\*\*_[^_]+_\*\*|\*\*[^*]+\*\*|_[^_]+_|\*[^*]+\*)/g;
  const parts = text.split(tokenRegex);

  return parts.map((part, index) => {
    if (!part) return null;

    if (
      (part.startsWith('***') && part.endsWith('***')) ||
      (part.startsWith('**_') && part.endsWith('_**'))
    ) {
      const content = part.startsWith('***')
        ? part.slice(3, -3)
        : part.slice(3, -3);
      return (
        <strong
          key={index}
          className="font-bold italic text-text-primary tracking-tight"
        >
          {content}
        </strong>
      );
    }

    if (part.startsWith('**') && part.endsWith('**')) {
      const content = part.slice(2, -2);
      return (
        <strong key={index} className="font-bold text-text-primary">
          {content}
        </strong>
      );
    }

    if (
      (part.startsWith('_') && part.endsWith('_')) ||
      (part.startsWith('*') && part.endsWith('*'))
    ) {
      const content = part.slice(1, -1);
      return (
        <em
          key={index}
          className="italic text-text-primary/95 font-medium not-italic-colon"
        >
          {content}
        </em>
      );
    }

    return <React.Fragment key={index}>{part}</React.Fragment>;
  });
}

/**
 * Normalizes text to ensure inline bullets like "...rest: - _Fire:_ ... - _Earth:_ ..."
 * break cleanly into separate lines.
 */
function normalizeText(raw: string): string {
  if (!raw) return '';
  let text = raw.replace(/\r\n/g, '\n');

  // If text contains inline bullet patterns (e.g. "...: - _Fire:_ ... - _Earth:_ ...")
  // convert "- " preceded by a space or punctuation into a newline bullet
  text = text.replace(/([:;.])\s+[-•]\s+/g, '$1\n- ');
  // Split multiple inline bullets if on single line
  text = text.replace(/([^\n])\s+-\s+(_|\*\*|[A-Z])/g, '$1\n- $2');

  return text;
}

export const FormattedFeatureText: React.FC<FormattedFeatureTextProps> = ({
  text,
  className = '',
}) => {
  if (!text) return null;

  const normalized = normalizeText(text);
  const rawLines = normalized.split('\n');

  // Group lines into either bullet lists or paragraph blocks
  type Block =
    | { type: 'paragraph'; content: string }
    | { type: 'bullets'; items: string[] };

  const blocks: Block[] = [];
  let currentBulletItems: string[] = [];
  let currentParagraphLines: string[] = [];

  const flushParagraph = () => {
    if (currentParagraphLines.length > 0) {
      const content = currentParagraphLines.join(' ').trim();
      if (content) {
        blocks.push({ type: 'paragraph', content });
      }
      currentParagraphLines = [];
    }
  };

  const flushBullets = () => {
    if (currentBulletItems.length > 0) {
      blocks.push({ type: 'bullets', items: [...currentBulletItems] });
      currentBulletItems = [];
    }
  };

  for (const rawLine of rawLines) {
    const trimmed = rawLine.trim();
    if (!trimmed) {
      flushParagraph();
      flushBullets();
      continue;
    }

    // Check if line is a bullet item (starts with - or • or * followed by whitespace)
    const bulletMatch = trimmed.match(/^[-•*]\s+(.*)$/);
    if (bulletMatch) {
      flushParagraph();
      currentBulletItems.push(bulletMatch[1]);
    } else {
      if (currentBulletItems.length > 0) {
        // If current bullet exists, is this a continuation line or a new paragraph?
        // If it starts lowercase or continues a sentence, append to last bullet
        if (/^[a-z]/.test(trimmed)) {
          currentBulletItems[currentBulletItems.length - 1] += ' ' + trimmed;
        } else {
          flushBullets();
          currentParagraphLines.push(trimmed);
        }
      } else {
        currentParagraphLines.push(trimmed);
      }
    }
  }

  flushParagraph();
  flushBullets();

  return (
    <div className={`space-y-2 text-text-secondary ${className}`}>
      {blocks.map((block, idx) => {
        if (block.type === 'paragraph') {
          return (
            <p key={idx} className="leading-relaxed">
              {renderInlineMarkdown(block.content)}
            </p>
          );
        }

        if (block.type === 'bullets') {
          return (
            <ul key={idx} className="space-y-1.5 my-2 pl-0.5">
              {block.items.map((item, bIdx) => (
                <li key={bIdx} className="flex items-start gap-2 leading-relaxed">
                  <span className="w-1.5 h-1.5 rounded-full bg-hope/70 mt-1.5 flex-shrink-0" />
                  <div className="flex-1 text-text-secondary">
                    {renderInlineMarkdown(item)}
                  </div>
                </li>
              ))}
            </ul>
          );
        }

        return null;
      })}
    </div>
  );
};
