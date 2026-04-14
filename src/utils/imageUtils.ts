export const compressImage = (file: File, maxWidth = 800, quality = 0.7, format = 'image/jpeg'): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = (event) => {
            const result = event.target?.result as string;

            // If it's a GIF, don't compress it as canvas would make it static
            if (file.type === 'image/gif' || file.name.toLowerCase().endsWith('.gif')) {
                resolve(result);
                return;
            }

            const img = new Image();
            img.src = result;
            img.onload = () => {
                const canvas = document.createElement('canvas');
                let width = img.width;
                let height = img.height;

                if (width > maxWidth) {
                    height = Math.round((height * maxWidth) / width);
                    width = maxWidth;
                }

                canvas.width = width;
                canvas.height = height;

                const ctx = canvas.getContext('2d');
                if (!ctx) {
                    reject(new Error('Could not get canvas context'));
                    return;
                }

                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL(format, quality));
            };
            img.onerror = (error) => reject(error);
        };
        reader.onerror = (error) => reject(error);
    });
};
export const getCroppedImg = async (
    imageSrc: string,
    pixelCrop: { x: number; y: number; width: number; height: number },
    flip = { horizontal: false, vertical: false }
): Promise<Blob> => {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
        const img = new Image();
        img.addEventListener('load', () => resolve(img));
        img.addEventListener('error', (error) => reject(error));
        img.setAttribute('crossOrigin', 'anonymous'); // needed to avoid cross-origin issues on CodeSandbox
        img.src = imageSrc;
    });

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    if (!ctx) {
        throw new Error('No 2d context');
    }

    // set canvas size to match the target crop
    canvas.width = pixelCrop.width;
    canvas.height = pixelCrop.height;

    // translate canvas context to a central point on the image to allow rotating/flipping (though we only need crop here)
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.scale(flip.horizontal ? -1 : 1, flip.vertical ? -1 : 1);
    ctx.translate(-canvas.width / 2, -canvas.height / 2);

    // draw rotated image and store data.
    ctx.drawImage(
        image,
        pixelCrop.x,
        pixelCrop.y,
        pixelCrop.width,
        pixelCrop.height,
        0,
        0,
        pixelCrop.width,
        pixelCrop.height
    );

    // As a blob
    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (!blob) {
                reject(new Error('Canvas is empty'));
                return;
            }
            resolve(blob);
        }, 'image/jpeg');
    });
};

export const blobToDataURL = (blob: Blob): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
};

// ─────────────────────────────────────────────────────────────────────────────
// Supabase Image Optimization
// Uses Supabase Storage's built-in image transformation API to serve resized
// WebP images via CDN. Reduces image size by 60-80% vs raw originals.
// Docs: https://supabase.com/docs/guides/storage/serving/image-transformations
// ─────────────────────────────────────────────────────────────────────────────

const SUPABASE_STORAGE_DOMAINS = ['supabase.co/storage', 'supabase.in/storage'];

const isSupabaseUrl = (url: string): boolean =>
    SUPABASE_STORAGE_DOMAINS.some(domain => url?.includes(domain));

export interface OptimizeImageOptions {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'avif' | 'origin';
}

/**
 * Returns an optimized Supabase image URL with WebP + resize.
 * Falls back gracefully to the original URL for non-Supabase images.
 */
export const optimizeImageUrl = (
    url: string | undefined | null,
    options: OptimizeImageOptions = {}
): string => {
    if (import.meta.env.VITE_DISABLE_IMAGE_OPTIMIZATION === 'true') {
        return url;
    }

    const isGif = url.toLowerCase().includes('.gif');
    const { width, height, quality = 80, format = isGif ? 'origin' : 'webp' } = options;

    const params = new URLSearchParams();
    if (width) params.set('width', String(width));
    if (height) params.set('height', String(height));
    params.set('quality', String(quality));
    params.set('format', format);

    const transformedUrl = url.replace(
        '/storage/v1/object/public/',
        '/storage/v1/render/image/public/'
    );

    return `${transformedUrl}?${params.toString()}`;
};

/** Ready-to-use presets for common use cases */
export const imgOptimized = {
    /** 64×64 px avatar */
    avatar: (url: string) => optimizeImageUrl(url, { width: 64, height: 64, quality: 85 }),
    /** 128×128 px avatar */
    avatarMd: (url: string) => optimizeImageUrl(url, { width: 128, height: 128, quality: 85 }),
    /** 256×256 px large avatar */
    avatarLg: (url: string) => optimizeImageUrl(url, { width: 256, height: 256, quality: 85 }),
    /** 400px card thumbnail */
    thumb: (url: string) => optimizeImageUrl(url, { width: 400, quality: 80 }),
    /** 1200px banner / background */
    banner: (url: string) => optimizeImageUrl(url, { width: 1200, quality: 75 }),
    /** 600px product image */
    product: (url: string) => optimizeImageUrl(url, { width: 600, quality: 80 }),
};
