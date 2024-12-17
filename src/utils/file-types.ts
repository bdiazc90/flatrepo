export const BINARY_EXTENSIONS = new Set([
    // Imágenes
    '.jpg', '.jpeg', '.png', '.gif', '.bmp', '.ico', '.webp', '.svg', '.tiff',
    // Videos
    '.mp4', '.mov', '.avi', '.mkv', '.wmv', '.flv', '.webm',
    // Audio
    '.mp3', '.wav', '.ogg', '.m4a', '.flac', '.aac',
    // Documentos
    '.pdf', '.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx',
    // Comprimidos
    '.zip', '.rar', '.7z', '.tar', '.gz',
    // Binarios
    '.exe', '.dll', '.so', '.dylib',
    // Fonts
    '.ttf', '.otf', '.woff', '.woff2', '.eot'
  ]);
  
  export const EXTENSION_TO_LANGUAGE: Record<string, string> = {
    '.js': 'javascript',
    '.jsx': 'jsx',
    '.ts': 'typescript',
    '.tsx': 'tsx',
    '.md': 'markdown',
    '.html': 'html',
    '.css': 'css',
    '.json': 'json'
  };
  
  const BINARY_TYPE_MAP: Record<string, string> = {
    // Imágenes
    '.jpg': 'imagen', '.jpeg': 'imagen', '.png': 'imagen', '.gif': 'imagen',
    '.bmp': 'imagen', '.ico': 'imagen', '.webp': 'imagen', '.svg': 'imagen',
    // Videos
    '.mp4': 'video', '.mov': 'video', '.avi': 'video', '.mkv': 'video',
    '.wmv': 'video', '.flv': 'video', '.webm': 'video',
    // Audio
    '.mp3': 'audio', '.wav': 'audio', '.ogg': 'audio', '.m4a': 'audio',
    '.flac': 'audio', '.aac': 'audio',
    // Documentos
    '.pdf': 'documento PDF', '.doc': 'documento Word', '.docx': 'documento Word',
    '.xls': 'hoja de cálculo Excel', '.xlsx': 'hoja de cálculo Excel',
    '.ppt': 'presentación PowerPoint', '.pptx': 'presentación PowerPoint',
    // Comprimidos
    '.zip': 'archivo comprimido', '.rar': 'archivo comprimido',
    '.7z': 'archivo comprimido', '.tar': 'archivo comprimido',
    '.gz': 'archivo comprimido',
    // Fonts
    '.ttf': 'fuente tipográfica', '.otf': 'fuente tipográfica',
    '.woff': 'fuente web', '.woff2': 'fuente web', '.eot': 'fuente web'
  };
  
  export function getBinaryFileType(extension: string): string {
    return BINARY_TYPE_MAP[extension.toLowerCase()] || 'archivo binario';
  }