"use strict";(self.webpackChunkmirage=self.webpackChunkmirage||[]).push([[375],{3807:(b,v,i)=>{i.d(v,{K:()=>c});var _=i(6895),h=i(380),s=i(4006),o=i(2466),l=i(5030),e=i(6738);let c=(()=>{class a{static#e=this.\u0275fac=function(g){return new(g||a)};static#t=this.\u0275mod=e.oAB({type:a});static#n=this.\u0275inj=e.cJS({imports:[_.ez,h.m,s.UX,o.aw,l.Y]})}return a})()},5030:(b,v,i)=>{i.d(v,{Y:()=>o});var _=i(6895),h=i(8611),s=i(6738);let o=(()=>{class l{constructor(){this.buttonMenuBoolean=!1,this.itemsStructure=[],this.containUrlName=""}ngOnInit(){this.createDropdownMenu()}createDropdownMenu(){const c=this.object.learning_object_file.url.split("/");this.containUrlName=c[c.length-1];const r=this.object.learning_object_file.url.replace(this.containUrlName,"imsmanifest.xml");let d=new XMLHttpRequest;d.open("GET",r,!1),d.send();let g=d.responseXML;var C=g.getElementsByTagName("organizations")[0].getElementsByTagName("organization");let M=C[0].getElementsByTagName("title"),E=C[0].querySelector("item"),A=this.obtainItemValues(E);this.objectCollectionMenu={title:M[0].textContent,items:A},this.showingManagement(),this.itemsStructure.forEach(T=>{let x=document.getElementById(T.title);const Z=g.querySelectorAll('resource[identifier="'+T.id+'"]')[0].getElementsByTagName("file")[0].getAttribute("href");null!=x.textContent&&""!=x.textContent&&(x.onclick=()=>{this.object.learning_object_file.url=this.object.learning_object_file.url.replace(this.containUrlName,Z),this.containUrlName=Z},x.addEventListener("keydown",y=>{"Enter"===y.key&&(this.object.learning_object_file.url=this.object.learning_object_file.url.replace(this.containUrlName,Z),this.containUrlName=Z)}))})}obtainItemValues(c){let a=c.querySelector("title");const r=a?a.textContent:"";let d=`<li><a id="${r}" tabindex="0" class="link-ref">${r}`;""!=r&&this.itemsStructure.push({title:r,id:c.getAttribute("identifierref")});const g=c.children;if(g.length>0){d+="<ul>";for(let f=0;f<g.length;f++){let C=this.obtainItemValues(g[f]);null!=C&&(d+=C)}return d+="</ul>",d+="</a></li>",d}}showingManagement(){const c=document.getElementById("jerarquia-container");c&&(c.innerHTML=`<ul>${this.objectCollectionMenu.items}</ul>`)}static#e=this.\u0275fac=function(a){return new(a||l)};static#t=this.\u0275cmp=s.Xpm({type:l,selectors:[["app-drop-down-menu-learning-object"]],inputs:{buttonMenuBoolean:"buttonMenuBoolean",objectCollectionMenu:"objectCollectionMenu",object:"object"},standalone:!0,features:[s.jDz],decls:4,vars:1,consts:[["tabindex","0",1,"container-menu-items"],[2,"font-size","15px"],["id","jerarquia-container"]],template:function(a,r){1&a&&(s.TgZ(0,"div",0)(1,"h1",1),s._uU(2),s.qZA(),s._UZ(3,"div",2),s.qZA()),2&a&&(s.xp6(2),s.hij(" ",r.objectCollectionMenu.title," "))},dependencies:[h.hJ,_.ez],styles:["[_nghost-%COMP%]  li{margin-top:.5em;margin-bottom:.5em}.container-menu-items[_ngcontent-%COMP%]{margin-top:4em;margin-left:2em;margin-right:2em}@media (max-width: 1300px){.container-menu-items[_ngcontent-%COMP%]{padding:10px!important;margin-top:1em!important}}[_nghost-%COMP%]  a{cursor:pointer}"]})}return l})()},5375:(b,v,i)=>{i.r(v),i.d(v,{ContactModule:()=>G});var _=i(6895),h=i(7935),s=i(5861),o=i(4006),l=i(2111),e=i(6738),c=i(1155),a=i(8253),r=i(3071),d=i(8611),g=i(4028),f=i(2778),C=i(4146),M=i(8473),E=i(8766),A=i(9723),T=i(9470),x=i(2466);function I(t,u){1&t&&(e.TgZ(0,"small",28),e._uU(1),e.ALo(2,"translate"),e.qZA()),2&t&&(e.xp6(1),e.hij("*",e.lcZ(2,1,"validation.obligatoryCamp"),"*"))}function Z(t,u){if(1&t&&(e.TgZ(0,"div"),e.YNc(1,I,3,3,"small",27),e.qZA()),2&t){const n=e.oxw();e.xp6(1),e.Q6J("ngIf",n.name.errors.required)}}function y(t,u){1&t&&(e.TgZ(0,"small",28),e._uU(1),e.ALo(2,"translate"),e.qZA()),2&t&&(e.xp6(1),e.hij("*",e.lcZ(2,1,"validation.obligatoryCamp"),"*"))}function j(t,u){1&t&&(e.TgZ(0,"small",28),e._uU(1),e.ALo(2,"translate"),e.qZA()),2&t&&(e.xp6(1),e.hij("*",e.lcZ(2,1,"validation.obligatoryCamp"),"*"))}function O(t,u){if(1&t&&(e.TgZ(0,"div"),e.YNc(1,y,3,3,"small",27),e.YNc(2,j,3,3,"small",27),e.qZA()),2&t){const n=e.oxw();e.xp6(1),e.Q6J("ngIf",n.email.errors.required),e.xp6(1),e.Q6J("ngIf",n.email.errors.email)}}function L(t,u){1&t&&(e.TgZ(0,"small",28),e._uU(1),e.ALo(2,"translate"),e.qZA()),2&t&&(e.xp6(1),e.hij("*",e.lcZ(2,1,"validation.obligatoryCamp"),"*"))}function P(t,u){if(1&t&&(e.TgZ(0,"div"),e.YNc(1,L,3,3,"small",27),e.qZA()),2&t){const n=e.oxw();e.xp6(1),e.Q6J("ngIf",n.message.errors.required)}}function D(t,u){if(1&t&&(e.TgZ(0,"div",32),e._UZ(1,"i",33),e.TgZ(2,"span",22)(3,"a",34),e._uU(4),e.qZA()()()),2&t){const n=e.oxw().$implicit;e.xp6(3),e.MGl("href","mailto:",n.user1.email,"",e.LSH),e.xp6(1),e.hij(" ",n.user1.email,"")}}function B(t,u){if(1&t&&(e.TgZ(0,"div",32),e._UZ(1,"i",33),e.TgZ(2,"span",22)(3,"a",34),e._uU(4),e.qZA()()()),2&t){const n=e.oxw().$implicit;e.xp6(3),e.MGl("href","mailto:",n.user1.email1,"",e.LSH),e.xp6(1),e.hij(" ",n.user1.email1,"")}}function N(t,u){if(1&t&&(e.TgZ(0,"p-card",29)(1,"div",30),e.YNc(2,D,5,2,"div",31),e.YNc(3,B,5,2,"div",31),e.qZA()()),2&t){const n=u.$implicit;e.Q6J("header",n.user1.status)("subheader",n.user1.date)("tabIndex",0),e.xp6(2),e.Q6J("ngIf",n.user1.email),e.xp6(1),e.Q6J("ngIf",n.user1.email1)}}function F(t,u){if(1&t&&(e.TgZ(0,"div",32),e._UZ(1,"i",33),e.TgZ(2,"span",22)(3,"a",34),e._uU(4),e.qZA()()()),2&t){const n=e.oxw().$implicit;e.xp6(3),e.MGl("href","mailto:",n.user2.email,"",e.LSH),e.xp6(1),e.hij(" ",n.user2.email,"")}}function S(t,u){if(1&t&&(e.TgZ(0,"div",32),e._UZ(1,"i",33),e.TgZ(2,"span",22)(3,"a",34),e._uU(4),e.qZA()()()),2&t){const n=e.oxw().$implicit;e.xp6(3),e.MGl("href","mailto:",n.user2.email1,"",e.LSH),e.xp6(1),e.hij(" ",n.user2.email1,"")}}function J(t,u){if(1&t&&(e.TgZ(0,"p-card",29)(1,"div",30),e.YNc(2,F,5,2,"div",31),e.YNc(3,S,5,2,"div",31),e.qZA()()),2&t){const n=u.$implicit;e.Q6J("header",n.user2.status)("subheader",n.user2.date)("tabIndex",0),e.xp6(2),e.Q6J("ngIf",n.user2.email),e.xp6(1),e.Q6J("ngIf",n.user2.email1)}}const z=[{path:"",component:(()=>{class t{constructor(n,p,m,U,$){this.fb=n,this.messageService=p,this.languageService=m,this.breadcrumbService=U,this.userService=$,this.subscription=[],this.createForm(),this.add_breadcrumb()}ngOnDestroy(){this.subscription.forEach(n=>{n.unsubscribe()})}ngOnInit(){this.events1=[{user1:{status:"Ing. \xc1ngel P\xe9rez",date:"Docente",icon:l.dv.ANGLE_LEFT,color:"#3B5B68",email:"aperezm@ups.edu.ec",email1:""},user2:{status:"Ing. Paola Ingavelez",date:"Docente",icon:l.dv.ANGLE_RIGHT,color:"#3B5B68",email:"pcingavelez@ups.edu.ec",email1:""}},{user1:{status:"Ing. Edwin Marquez",date:"Desarrollo Frontend y Backend",icon:l.dv.ANGLE_RIGHT,color:"#3B5B68",email:"emarquezl@est.ups.edu.ec",email1:"edwi1999@hotmail.com"},user2:{status:"Ing. Claudio Maldonado",date:"Desarrollo Frontend",icon:l.dv.ANGLE_LEFT,color:"#3B5B68",email:"cmaldonadom3@est.ups.edu.ec",email1:"claudio.mldo@outlook.com"}},{user1:{status:"Ing. Bryam Chimbo",date:"Desarrollo Backend y Frontend",icon:l.dv.ANGLE_LEFT,color:"#3B5B68",email:"bchimboa1@est.ups.edu.ec",email1:"bry4mchimbo@gmail.com"},user2:{status:"Ing. \xc1ngel Paqui",date:"Desarrollo Backend",icon:l.dv.ANGLE_RIGHT,color:"#3B5B68",email:"apaquig@est.ups.edu.ec",email1:"angelpaqui36@gmail.com"}}]}add_breadcrumb(){var n=this;return(0,s.Z)(function*(){n.breadcrumbService.setItems([{label:"ROA"},{label:yield n.languageService.translate.get("menu.contact").toPromise(),routerLink:["/contact"]}])})()}createForm(){this.angForm=this.fb.group({name:[null,o.kI.required],email:[null,[o.kI.required,o.kI.email]],message:[null,o.kI.required]})}validateUser(){var n=this;return(0,s.Z)(function*(){if(n.angForm.valid){let p=n.angForm.getRawValue();try{200==(yield n.userService.sendContactEmail(p).toPromise()).code?(n.showSuccess(),n.angForm.reset()):n.showError()}catch{n.showError()}}else n.markTouchForm(),n.messageService.add({severity:"error",summary:"Error",detail:"Formulario Invalido"})})()}showSuccess(){this.messageService.add({severity:"success",summary:"Success",detail:"Datos enviados correctamente"})}showError(){this.messageService.add({severity:"error",summary:"Error",detail:"Hubo un error al tratar de enviar el correo electronico"})}markTouchForm(){Object.values(this.angForm.controls).forEach(n=>{n.markAsTouched()})}get name(){return this.angForm.get("name")}get email(){return this.angForm.get("email")}get message(){return this.angForm.get("message")}static#e=this.\u0275fac=function(p){return new(p||t)(e.Y36(o.QS),e.Y36(l.ez),e.Y36(c.T),e.Y36(a.p),e.Y36(r.K))};static#t=this.\u0275cmp=e.Xpm({type:t,selectors:[["app-contact"]],decls:51,vars:29,consts:[[3,"header_title"],[1,"login-body","layout-light"],[1,"login-content","animate__animated","animate__fadeIn"],[1,"login-panel",2,"width","80%"],[1,"login-panel-content",2,"width","100%"],[1,"forms"],["autocomplete","off","id","loginForm",3,"formGroup","ngSubmit"],[1,"p-grid"],[1,"p-col-12","p-md-6","p-lg-6"],[1,"p-field","p-fluid"],["for","firstnamelabel"],["type","text","formControlName","name","pInputText",""],[4,"ngIf"],["type","text","formControlName","email","pInputText",""],["name","","id","","rows","5","cols","30","formControlName","message","pInputTextarea","",2,"width","100%"],["src","assets/img/contacts.svg","tabindex","0",2,"width","100%","height","100%",3,"alt"],[1,"p-buttonset"],["pButton","","pRipple","","type","submit","icon","pi pi-check",3,"label"],[1,"developers"],[1,"p-grid","about-us",2,"padding-bottom","4em","justify-content","center"],["tabindex","0",1,"p-col-12","p-md-6","p-lg-6"],[1,"content-info"],["tabindex","0"],[1,"p-col-12","p-md-6","p-lg-12"],[3,"value"],["pTemplate","content","tabindex","0"],["pTemplate","opposite","tabindex","0"],["id","name ","class","p-error",4,"ngIf"],["id","name ",1,"p-error"],[3,"header","subheader","tabIndex"],[1,"footer"],["class","email",4,"ngIf"],[1,"email"],[1,"pi","pi-envelope"],[3,"href"]],template:function(p,m){1&p&&(e._UZ(0,"app-header",0),e.ALo(1,"translate"),e.TgZ(2,"div",1)(3,"div",2)(4,"div",3)(5,"div",4)(6,"div",5)(7,"form",6),e.NdJ("ngSubmit",function(){return m.validateUser()}),e.TgZ(8,"div",7)(9,"div",8)(10,"div",9)(11,"label",10),e._uU(12),e.ALo(13,"translate"),e.qZA(),e._UZ(14,"input",11),e.YNc(15,Z,2,1,"div",12),e.qZA(),e.TgZ(16,"div",9)(17,"label",10),e._uU(18),e.ALo(19,"translate"),e.qZA(),e._UZ(20,"input",13),e.YNc(21,O,3,2,"div",12),e.qZA(),e.TgZ(22,"div",9)(23,"label",10),e._uU(24),e.ALo(25,"translate"),e.qZA(),e.TgZ(26,"div"),e._UZ(27,"textarea",14),e.qZA(),e.YNc(28,P,2,1,"div",12),e.qZA()(),e.TgZ(29,"div",8),e._UZ(30,"img",15),e.ALo(31,"translate"),e.qZA()(),e.TgZ(32,"span",16),e._UZ(33,"button",17),e.ALo(34,"translate"),e.qZA()()(),e.TgZ(35,"div",18)(36,"div",19)(37,"div",20)(38,"div",21)(39,"h2",22),e._uU(40),e.ALo(41,"translate"),e.qZA(),e.TgZ(42,"p",22),e._uU(43),e.ALo(44,"translate"),e.qZA()()()(),e.TgZ(45,"div",7)(46,"div",23)(47,"p-timeline",24),e.YNc(48,N,4,5,"ng-template",25),e.YNc(49,J,4,5,"ng-template",26),e.qZA()()()()(),e._UZ(50,"p-toast"),e.qZA()()()),2&p&&(e.Q6J("header_title",e.lcZ(1,13,"menu.contactUp")),e.xp6(7),e.Q6J("formGroup",m.angForm),e.xp6(5),e.hij("",e.lcZ(13,15,"register.name"),"*"),e.xp6(3),e.Q6J("ngIf",m.name.invalid&&(m.name.dirty||m.name.touched)),e.xp6(3),e.hij("",e.lcZ(19,17,"register.email"),"*"),e.xp6(3),e.Q6J("ngIf",m.email.invalid&&(m.name.dirty||m.email.touched)),e.xp6(3),e.hij("",e.lcZ(25,19,"search.message"),"*"),e.xp6(4),e.Q6J("ngIf",m.message.invalid&&(m.message.dirty||m.message.touched)),e.xp6(2),e.s9C("alt",e.lcZ(31,21,"login.sendImage")),e.xp6(3),e.s9C("label",e.lcZ(34,23,"login.send")),e.xp6(7),e.Oqu(e.lcZ(41,25,"developers.title")),e.xp6(3),e.Oqu(e.lcZ(44,27,"developers.description")),e.xp6(4),e.Q6J("value",m.events1))},dependencies:[_.O5,o._Y,o.Fj,o.JJ,o.JL,l.jx,d.Hq,g.Z,f.o,C.g,M.H,E.T,A.FN,T.G,o.sg,o.u,x.X$],styles:[".login-panel[_ngcontent-%COMP%]{width:80%}.login-panel-content[_ngcontent-%COMP%]{width:100%}.login-content[_ngcontent-%COMP%]{position:relative}[_nghost-%COMP%]  .login-panel{height:auto!important}.custom-marker[_ngcontent-%COMP%]{display:flex;width:2rem;height:2rem;align-items:center;justify-content:center;color:#fff;border-radius:50%;z-index:1}  .p-timeline-event-content,   .p-timeline-event-opposite{line-height:1}@media screen and (max-width: 960px){  .customized-timeline .p-timeline-event:nth-child(even){flex-direction:row!important}  .customized-timeline .p-timeline-event:nth-child(even) .p-timeline-event-content{text-align:left!important}  .customized-timeline .p-timeline-event-opposite{flex:0}  .customized-timeline .p-card{margin-top:1rem}}.footer[_ngcontent-%COMP%]   .email[_ngcontent-%COMP%]{padding:3px}.developers[_ngcontent-%COMP%]{padding-top:2em;margin-bottom:4em}[_nghost-%COMP%]  .p-card-body{text-align:center;margin-bottom:10px}.about-us[_ngcontent-%COMP%]   img[_ngcontent-%COMP%]{width:100%}.about-us[_ngcontent-%COMP%]   .content-info[_ngcontent-%COMP%]{display:flex;flex-direction:column;justify-content:center;height:100%;text-align:center}.forms[_ngcontent-%COMP%]{padding-top:2em;padding-bottom:4em}"]})}return t})(),data:{breadcrumb:null}}];let R=(()=>{class t{static#e=this.\u0275fac=function(p){return new(p||t)};static#t=this.\u0275mod=e.oAB({type:t});static#n=this.\u0275inj=e.cJS({imports:[h.Bz.forChild(z),h.Bz]})}return t})();var Y=i(3807),w=i(380);let G=(()=>{class t{static#e=this.\u0275fac=function(p){return new(p||t)};static#t=this.\u0275mod=e.oAB({type:t});static#n=this.\u0275inj=e.cJS({imports:[_.ez,R,Y.K,w.m,o.UX]})}return t})()},3071:(b,v,i)=>{i.d(v,{K:()=>l});var _=i(2340),h=i(6738),s=i(529);const o=_.N.baseUrl;let l=(()=>{class e{constructor(a){this.http=a}getUserDetail(a){return this.http.get(`${o}/user-management/${a}`)}updateUser(a){return this.http.put(`${o}/user-management/${a.id}/`,a)}updateImage(a,r){let d=new FormData;return d.append("image",a),this.http.put(`${o}/user/photo/${r}/`,d)}sent_email_token_verify(a,r){return this.http.get(`${o}/email-verify/`+a+"/"+r)}set_email_verify_new_token(a){return this.http.post(`${o}/set-verify/`,{email:a})}sendContactEmail(a){let r=new FormData;return r.append("name",a.name),r.append("email",a.email),r.append("content",a.message),this.http.post(`${o}/contact-email/`,r)}static#e=this.\u0275fac=function(r){return new(r||e)(h.LFG(s.eN))};static#t=this.\u0275prov=h.Yz7({token:e,factory:e.\u0275fac,providedIn:"root"})}return e})()}}]);