
export class UserModel{
constructor(
    public first_name:string,
    public last_name:string,
    public email:string,
    public password:string,
    public country?:string,
    public city?:string,
    public phone?:string,
    public observation?:string,
    public image?:string,
    public uid?:string,
    public roles?:string[],
){}

get imageURL(){
    return '../assets/demo/images/avatar/annafali.png';
}
}