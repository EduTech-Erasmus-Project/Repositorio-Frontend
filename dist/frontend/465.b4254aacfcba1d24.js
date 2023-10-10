"use strict";(self.webpackChunkmirage=self.webpackChunkmirage||[]).push([[465],{1465:(Y,u,a)=>{a.r(u),a.d(u,{RecoverPasswordModule:()=>R});var d=a(6895),l=a(7935),m=a(5861),r=a(4006),e=a(6738),g=a(529),p=a(4120),v=a(2111),f=a(1155),h=a(8253),Z=a(8611),x=a(2778),y=a(8473),A=a(9723),C=a(2466);function b(n,c){1&n&&(e.TgZ(0,"small",20),e._uU(1),e.ALo(2,"translate"),e.qZA()),2&n&&(e.xp6(1),e.hij("*",e.lcZ(2,1,"validation.obligatoryCamp"),"*"))}function P(n,c){1&n&&(e.TgZ(0,"small",21),e._uU(1),e.ALo(2,"translate"),e.qZA()),2&n&&(e.xp6(1),e.hij("*",e.lcZ(2,1,"validation.errorEmail"),"*"))}function S(n,c){if(1&n&&(e.TgZ(0,"div"),e.YNc(1,b,3,3,"small",18),e.YNc(2,P,3,3,"small",19),e.qZA()),2&n){const t=e.oxw(2);e.xp6(1),e.Q6J("ngIf",t.email1.errors.required),e.xp6(1),e.Q6J("ngIf",t.email1.errors.pattern)}}function T(n,c){1&n&&(e.TgZ(0,"small",22),e._uU(1),e.ALo(2,"translate"),e.qZA()),2&n&&(e.xp6(1),e.hij("*",e.lcZ(2,1,"validation.emailValid"),"*"))}const O=function(n){return{"ng-dirty ng-invalid":n}};function w(n,c){if(1&n){const t=e.EpF();e.TgZ(0,"div",8)(1,"form",9),e.NdJ("ngSubmit",function(){e.CHM(t);const i=e.oxw();return e.KtG(i.sentEmail())}),e.TgZ(2,"div",10)(3,"p",11),e._uU(4),e.ALo(5,"translate"),e.qZA(),e.TgZ(6,"div",12),e._UZ(7,"input",13),e.ALo(8,"translate"),e.YNc(9,S,3,2,"div",14),e.YNc(10,T,3,3,"small",15),e.qZA()(),e.TgZ(11,"div",16),e._UZ(12,"button",17),e.ALo(13,"translate"),e.qZA()()()}if(2&n){const t=e.oxw();e.xp6(1),e.Q6J("formGroup",t.angForm),e.xp6(3),e.Oqu(e.lcZ(5,7,"login.resetDescription")),e.xp6(3),e.Q6J("ngClass",e.VKq(13,O,t.email1.invalid&&(t.email1.dirty||t.email1.touched)||t.emailCheck))("placeholder",e.lcZ(8,9,"login.placeholderEmail")),e.xp6(2),e.Q6J("ngIf",t.email1.invalid&&(t.email1.dirty||t.email1.touched)),e.xp6(1),e.Q6J("ngIf",t.emailCheck),e.xp6(2),e.s9C("label",e.lcZ(13,11,"login.sentResEmail"))}}const F=function(){return["/login"]};function I(n,c){1&n&&(e.TgZ(0,"div",23)(1,"div",10)(2,"p",24),e._uU(3),e.ALo(4,"translate"),e.qZA(),e.TgZ(5,"h6",11),e._uU(6),e.ALo(7,"translate"),e.qZA(),e._UZ(8,"a",25),e.ALo(9,"translate"),e.TgZ(10,"p",26),e._uU(11),e.ALo(12,"translate"),e.qZA()()()),2&n&&(e.xp6(3),e.Oqu(e.lcZ(4,5,"login.resetEmailStudentDes")),e.xp6(3),e.Oqu(e.lcZ(7,7,"login.resetEmailStudentExample")),e.xp6(2),e.Q6J("label",e.lcZ(9,9,"menu.login"))("routerLink",e.DdM(13,F)),e.xp6(3),e.Oqu(e.lcZ(12,11,"login.resetEmailStudentAlert")))}const _=[{path:"",component:(()=>{class n{constructor(t,o,i,s,E,J,U){this.fb=t,this.http=o,this.loginService=i,this.messageService=s,this.router=E,this.languageService=J,this.breadcrumbService=U,this.dark=!1,this.patternV="^([a-zA-Z0-9_' - '.]+)@([a-zA-Z0-9_' - '.]+).([a-zA-Z]{2,5})$",this.emailCheck=!1,this.is_student=!1,this.createForm(),this.add_breadcrumb()}ngOnInit(){}createForm(){this.angForm=this.fb.group({email:[this.email,[r.kI.required,r.kI.pattern(this.patternV)]]})}add_breadcrumb(){var t=this;return(0,m.Z)(function*(){t.breadcrumbService.setItems([{label:"ROA"},{label:yield t.languageService.translate.get("menu.resetPassword").toPromise(),routerLink:["/restart-password"]}])})()}sentEmail(){var t=this;return(0,m.Z)(function*(){t.email=t.angForm.get("email").value,t.angForm.valid?t.loginService.resetPass(t.email).subscribe(function(){var o=(0,m.Z)(function*(i){if("We have send you a link to reset your password"==i.message){let s=yield t.languageService.translate.get("register.recoverSentEmail").toPromise();t.showSuccess(s),t.emailCheck=!1,t.angForm.reset(),t.router.navigateByUrl("/emailMessage")}else if(201==i.status){t.is_student=!0;let s=yield t.languageService.translate.get("login.recoverPasswordM").toPromise();t.showSuccess(s),t.angForm.reset(),t.emailCheck=!1}});return function(i){return o.apply(this,arguments)}}(),function(){var o=(0,m.Z)(function*(i){let s=yield t.languageService.translate.get("login.recoverErrorMail").toPromise();t.showError(s),t.emailCheck=!0});return function(i){return o.apply(this,arguments)}}()):t.markTouchForm()})()}showError(t){this.messageService.add({severity:"error",summary:"Error",detail:t})}showInfo(t){this.messageService.add({severity:"info",summary:"Info",detail:t})}showSuccess(t){this.messageService.add({severity:"success",summary:"Success",detail:t})}markTouchForm(){Object.values(this.angForm.controls).forEach(t=>{t.markAsTouched()})}get email1(){return this.angForm.get("email")}static#e=this.\u0275fac=function(o){return new(o||n)(e.Y36(r.QS),e.Y36(g.eN),e.Y36(p.r),e.Y36(v.ez),e.Y36(l.F0),e.Y36(f.T),e.Y36(h.p))};static#t=this.\u0275cmp=e.Xpm({type:n,selectors:[["app-recover-password"]],decls:13,vars:8,consts:[[1,"login-body","layout-light"],[1,"login-content","animate__animated","animate__fadeIn"],[1,"login-panel"],[1,"login-panel-content"],[1,"logo"],["loading","lazy","src","assets/img/image2vector.svg",3,"alt"],["class","form-reset-container",4,"ngIf"],["class","form-reset-student",4,"ngIf"],[1,"form-reset-container"],["autocomplete","off","id","loginForm",3,"formGroup","ngSubmit"],["tabindex","0",1,"forms"],["tabindex","0"],[1,"p-col-12","p-md-12"],["id","email","type","text","formControlName","email","aria-describedby","email1e email2e passwordOld","pInputText","",3,"ngClass","placeholder"],[4,"ngIf"],["id","passwordOld ","class","p-error",4,"ngIf"],[1,"forms"],["pButton","","type","submit",1,"p-button",3,"label"],["id","email1e","class","p-error",4,"ngIf"],["id","email2e","class","p-error",4,"ngIf"],["id","email1e",1,"p-error"],["id","email2e",1,"p-error"],["id","passwordOld ",1,"p-error"],[1,"form-reset-student"],["tabindex","0",2,"text-align","justify"],["pButton","","pRipple","","type","button","routerLinkActive","p-menuitem-link-active",1,"p-button-text",3,"label","routerLink"],["tabindex","0",2,"text-align","justify","font-size","x-small"]],template:function(o,i){1&o&&(e.TgZ(0,"div",0)(1,"div",1)(2,"div",2)(3,"div",3)(4,"div",4),e._UZ(5,"img",5),e.ALo(6,"translate"),e.qZA(),e.TgZ(7,"h3"),e._uU(8),e.ALo(9,"translate"),e.qZA(),e._UZ(10,"p-toast"),e.YNc(11,w,14,15,"div",6),e.YNc(12,I,13,14,"div",7),e.qZA()()()()),2&o&&(e.xp6(5),e.Q6J("alt",e.lcZ(6,4,"menu.altLogo")),e.xp6(3),e.Oqu(e.lcZ(9,6,"login.resetPass")),e.xp6(3),e.Q6J("ngIf",0==i.is_student),e.xp6(1),e.Q6J("ngIf",1==i.is_student))},dependencies:[d.mk,d.O5,l.rH,l.Od,r._Y,r.Fj,r.JJ,r.JL,Z.Hq,x.o,y.H,A.FN,r.sg,r.u,C.X$],styles:["#email[_ngcontent-%COMP%]{width:100%}.login-content[_ngcontent-%COMP%]{position:relative;height:70vh}.login-content[_ngcontent-%COMP%]   .desert[_ngcontent-%COMP%]{position:absolute;bottom:0}.login-content[_ngcontent-%COMP%]   .login-panel[_ngcontent-%COMP%]{height:100%}.p-button[_ngcontent-%COMP%]{width:100%}.p-button-text[_ngcontent-%COMP%]{color:#fff;background-color:#3b5b68}.login-panel[_ngcontent-%COMP%]{background:none}"]})}return n})(),data:{breadcrumb:null}}];let L=(()=>{class n{static#e=this.\u0275fac=function(o){return new(o||n)};static#t=this.\u0275mod=e.oAB({type:n});static#n=this.\u0275inj=e.cJS({imports:[l.Bz.forChild(_),l.Bz]})}return n})();var M=a(380);let R=(()=>{class n{static#e=this.\u0275fac=function(o){return new(o||n)};static#t=this.\u0275mod=e.oAB({type:n});static#n=this.\u0275inj=e.cJS({imports:[d.ez,L,M.m,r.UX]})}return n})()}}]);