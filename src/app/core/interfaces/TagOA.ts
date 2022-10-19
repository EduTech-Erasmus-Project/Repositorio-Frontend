export interface TagOA{
    paragraph:Number;
    img:Number;
    video: Number;
    audio: Number;
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