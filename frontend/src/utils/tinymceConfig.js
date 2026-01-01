import editorContentCss from 'tinymce/skins/content/default/content.css?url';
import editorContentUiCss from 'tinymce/skins/ui/oxide/content.min.css?url';
import prismThemeCss from 'prismjs/themes/prism-okaidia.css?url';

/**
 * Standard codesample languages available in TinyMCE
 */
export const CODESAMPLE_LANGUAGES = [
  { text: 'HTML/XML', value: 'markup' },
  { text: 'JavaScript', value: 'javascript' },
  { text: 'CSS', value: 'css' },
  { text: 'Python', value: 'python' },
  { text: 'Java', value: 'java' },
  { text: 'C', value: 'c' },
  { text: 'C++', value: 'cpp' },
  { text: 'C#', value: 'csharp' },
  { text: 'SQL', value: 'sql' },
  { text: 'Bash/Shell', value: 'bash' }
];

/**
 * Standard plugins for TinyMCE editors
 */
export const STANDARD_PLUGINS = [
  'advlist', 'autolink', 'lists', 'link', 'charmap', 'preview',
  'anchor', 'searchreplace', 'visualblocks', 'code', 'fullscreen',
  'insertdatetime', 'table', 'codesample', 'help', 'wordcount'
];

/**
 * Standard toolbar configuration for TinyMCE
 */
export const STANDARD_TOOLBAR = 'undo redo | blocks | ' +
  'bold italic backcolor | alignleft aligncenter ' +
  'alignright alignjustify | bullist numlist outdent indent | ' +
  'removeformat | table | codesample | help';

/**
 * Creates a TinyMCE configuration object
 * @param {Object} options - Configuration options
 * @param {number} [options.height=500] - Editor height in pixels
 * @param {boolean} [options.enableImageUpload=false] - Enable image upload
 * @param {Function} [options.imageUploadHandler] - Image upload handler function
 * @param {string} [options.toolbar] - Custom toolbar configuration
 * @param {Array} [options.plugins] - Custom plugins array
 * @param {Array} [options.codesampleLanguages] - Custom codesample languages
 * @returns {Object} TinyMCE configuration object
 */
export function createTinyMCEConfig({
  height = 500,
  enableImageUpload = false,
  imageUploadHandler = null,
  toolbar = STANDARD_TOOLBAR,
  plugins = STANDARD_PLUGINS,
  codesampleLanguages = CODESAMPLE_LANGUAGES
} = {}) {
  const config = {
    height,
    menubar: false,
    plugins: enableImageUpload ? [...plugins, 'image'] : plugins,
    toolbar: enableImageUpload ? toolbar.replace('table |', 'image | table |') : toolbar,
    skin: false,
    content_css: [editorContentCss, editorContentUiCss, prismThemeCss],
    content_style: `
      .token, .token.operator, .token.number, .token.string, .token.function {
        background: transparent !important;
        padding: 0 !important;
        border-radius: 0 !important;
      }
      pre[class*="language-"] .token { background: transparent !important; }
    `,
    codesample_global_prismjs: true,
    codesample_languages: codesampleLanguages
  };

  if (enableImageUpload && imageUploadHandler) {
    config.automatic_uploads = true;
    config.images_upload_handler = imageUploadHandler;
  }

  return config;
}

