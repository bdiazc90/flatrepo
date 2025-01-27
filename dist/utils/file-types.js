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
export const EXTENSION_TO_LANGUAGE = {
    '.js': 'javascript',
    '.jsx': 'jsx',
    '.ts': 'typescript',
    '.tsx': 'tsx',
    '.md': 'markdown',
    '.html': 'html',
    '.css': 'css',
    '.json': 'json'
};
const BINARY_TYPE_MAP = {
    // Images
    '.jpg': 'image', '.jpeg': 'image', '.png': 'image', '.gif': 'image',
    '.bmp': 'image', '.ico': 'image', '.webp': 'image', '.svg': 'image',
    // Videos
    '.mp4': 'video', '.mov': 'video', '.avi': 'video', '.mkv': 'video',
    '.wmv': 'video', '.flv': 'video', '.webm': 'video',
    // Audio
    '.mp3': 'audio', '.wav': 'audio', '.ogg': 'audio', '.m4a': 'audio',
    '.flac': 'audio', '.aac': 'audio',
    // Documents
    '.pdf': 'PDF document', '.doc': 'Word document', '.docx': 'Word document',
    '.xls': 'Excel spreadsheet', '.xlsx': 'Excel spreadsheet',
    '.ppt': 'PowerPoint presentation', '.pptx': 'PowerPoint presentation',
    // Compressed
    '.zip': 'compressed file', '.rar': 'compressed file',
    '.7z': 'compressed file', '.tar': 'compressed file',
    '.gz': 'compressed file',
    // Fonts
    '.ttf': 'typeface font', '.otf': 'typeface font',
    '.woff': 'web font', '.woff2': 'web font', '.eot': 'web font'
};
export function getBinaryFileType(extension) {
    return BINARY_TYPE_MAP[extension.toLowerCase()] || 'binary file';
}
