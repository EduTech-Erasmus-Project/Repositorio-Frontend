/**
 * Preview puntual de una imagen detectada durante el análisis técnico del OA.
 */
export interface TagOAImagePreview {
    exists?: boolean;
    exist?: boolean;
    url_img: string;
    name: string;
}

/**
 * Resumen técnico generado al inspeccionar el paquete cargado del OA.
 *
 * Mantiene claves legacy como `im_prev` y `img_prev` porque el backend todavía
 * puede responder cualquiera de las dos variantes.
 */
export interface TagOA{
    paragraph: number;
    img:number;
    video: number;
    audio: number;
    is_adapted_oer:boolean;
    im_prev?: TagOAImagePreview;
    img_prev?: TagOAImagePreview;
    paths_img_preview?: PathsImgPreview[];
}

/**
 * Ruta candidata para la previsualización de imágenes extraídas del OA.
 */
export interface PathsImgPreview{
    src?:string;
    alt?: string;
} 
