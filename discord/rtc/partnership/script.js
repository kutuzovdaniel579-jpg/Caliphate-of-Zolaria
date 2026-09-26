const policyContent = document.getElementById('policy-content');

function escapeHtml(value) {
  return value.replace(/[&<>"']/g, (character) => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  })[character]);
}

function renderInline(text) {
  let html = escapeHtml(text);
  html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
  html = html.replace(/\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g, '<a href="$2" target="_blank" rel="noopener">$1</a>');
  html = html.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  return html;
}

function renderMarkdown(markdown) {
  const lines = markdown.replace(/\r/g, '').split('\n');
  const output = [];
  let paragraph = [];
  let listType = '';
  let inCodeBlock = false;
  let codeLines = [];

  const flushParagraph = () => {
    if (paragraph.length) {
      output.push(`<p>${renderInline(paragraph.join(' '))}</p>`);
      paragraph = [];
    }
  };
  const closeList = () => {
    if (listType) {
      output.push(`</${listType}>`);
      listType = '';
    }
  };

  for (const line of lines) {
    if (line.trim().startsWith('```')) {
      flushParagraph();
      closeList();
      if (inCodeBlock) {
        output.push(`<pre><code>${escapeHtml(codeLines.join('\n'))}</code></pre>`);
        codeLines = [];
      }
      inCodeBlock = !inCodeBlock;
      continue;
    }
    if (inCodeBlock) {
      codeLines.push(line);
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.+)$/);
    const unordered = line.match(/^\s*[-*+]\s+(.+)$/);
    const ordered = line.match(/^\s*\d+[.)]\s+(.+)$/);
    if (!line.trim()) {
      flushParagraph();
      closeList();
    } else if (heading) {
      flushParagraph();
      closeList();
      const level = heading[1].length;
      output.push(`<h${level}>${renderInline(heading[2])}</h${level}>`);
    } else if (unordered || ordered) {
      flushParagraph();
      const nextType = unordered ? 'ul' : 'ol';
      if (listType !== nextType) {
        closeList();
        output.push(`<${nextType}>`);
        listType = nextType;
      }
      output.push(`<li>${renderInline((unordered || ordered)[1])}</li>`);
    } else if (/^\s*>/.test(line)) {
      flushParagraph();
      closeList();
      output.push(`<blockquote>${renderInline(line.replace(/^\s*>\s?/, ''))}</blockquote>`);
    } else if (/^\s*([-*_])\1\1+\s*$/.test(line)) {
      flushParagraph();
      closeList();
      output.push('<hr />');
    } else {
      closeList();
      paragraph.push(line.trim());
    }
  }

  flushParagraph();
  closeList();
  if (inCodeBlock) output.push(`<pre><code>${escapeHtml(codeLines.join('\n'))}</code></pre>`);
  return output.join('\n');
}

fetch('https://raw.githubusercontent.com/kutuzovdaniel579-jpg/www.zolarian.online/refs/heads/main/discord/rtc/partnership/policy.md')
  .then((response) => {
    if (!response.ok) throw new Error('Policy.md could not be found.');
    return response.text();
  })
  .then((markdown) => {
    policyContent.innerHTML = markdown.trim()
      ? renderMarkdown(markdown)
      : '<p>The policy file is currently empty.</p>';
  })
  .catch(() => {
    policyContent.innerHTML = '<div class="load-error"><strong>We couldn’t load the policy.</strong><br />Make sure <code>Policy.md</code> is in the same folder as this page, then refresh. You can also <a href="Policy.md">open the source file</a>.</div>';
  });
