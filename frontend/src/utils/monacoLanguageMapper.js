/**
 * Maps problem language constants to Monaco Editor language IDs
 * @param {string} language - Language constant (e.g., 'PYTHON', 'JAVA', 'CPP')
 * @returns {string} Monaco Editor language ID (e.g., 'python', 'java', 'cpp')
 */
export function mapToMonacoLanguage(language) {
  if (!language) return 'python';

  switch (String(language).toUpperCase()) {
    case 'JAVA':
      return 'java';
    case 'PYTHON':
      return 'python';
    case 'CPP':
    case 'C++':
      return 'cpp';
    case 'C':
      return 'c';
    case 'CSHARP':
    case 'C#':
      return 'csharp';
    case 'JAVASCRIPT':
    case 'JS':
      return 'javascript';
    case 'TYPESCRIPT':
    case 'TS':
      return 'typescript';
    case 'RUST':
      return 'rust';
    case 'GO':
      return 'go';
    default:
      return 'python';
  }
}

/**
 * Maps Monaco Editor language ID to problem language constant
 * @param {string} monacoLang - Monaco Editor language ID
 * @returns {string} Problem language constant
 */
export function mapFromMonacoLanguage(monacoLang) {
  if (!monacoLang) return 'PYTHON';

  const mapping = {
    'java': 'JAVA',
    'python': 'PYTHON',
    'cpp': 'CPP',
    'c': 'C',
    'csharp': 'CSHARP',
    'javascript': 'JAVASCRIPT',
    'typescript': 'TYPESCRIPT',
    'rust': 'RUST',
    'go': 'GO'
  };

  return mapping[monacoLang.toLowerCase()] || 'PYTHON';
}

