export interface TagOA{
    paragraph: number;
    img:number;
    video: number;
    audio: number;
    is_adapted_oer:boolean;
    im_prev:{
        exists:boolean;
        url_img:string;
        name:string;
    }
}

export interface PathsImgPreview{
    src?:string;
    alt?: string;
} 