!function(){function e(e,r){if(!(e instanceof r))throw new TypeError("Cannot call a class as a function")}function r(e,r){for(var t=0;t<r.length;t++){var a=r[t];a.enumerable=a.enumerable||!1,a.configurable=!0,"value"in a&&(a.writable=!0),Object.defineProperty(e,a.key,a)}}(window.webpackJsonp=window.webpackJsonp||[]).push([[15],{lu3c:function(t,a,o){"use strict";o.r(a),o.d(a,"LoginModule",function(){return Z});var n=o("ofXK"),i=o("tyNb"),s=o("mrSG"),l=o("3Pt+"),c=o("PSD3"),u=o.n(c),b=o("fXoL"),m=o("DSp3"),g=o("kyOO"),h=o("7zfz"),d=o("EFyh"),p=o("n90K"),f=o("dts7"),v=o("Gxio"),w=o("7kUa"),y=o("+YxP"),k=o("Ji6n"),O=o("jIHw"),x=o("sYmb");function E(e,r){1&e&&(b.Ob(0,"small",22),b.Fc(1),b.Zb(2,"translate"),b.Nb()),2&e&&(b.xb(1),b.Gc(b.ac(2,1,"login.errorMsjEmail")))}function F(e,r){1&e&&(b.Ob(0,"small",23),b.Fc(1),b.Zb(2,"translate"),b.Nb()),2&e&&(b.xb(1),b.Gc(b.ac(2,1,"login.errorMsjPassword")))}var C,M,N,S=function(e){return{"ng-dirty":e}},P=function(e,r){return{"pi-eye":e,"pi-eye-slash":r}},j=[{path:"",component:(C=function(){function t(r,a,o,n,i,s,c){e(this,t),this.auth=r,this.router=a,this.fb=o,this.languageService=n,this.messageService=i,this.loginService=s,this.storageService=c,this.subscribes=[],this.show=!1,this.loginForm=this.fb.group({email:[this.storageService.getCookieItem("userEmail")||null,[l.p.required,l.p.pattern("^([a-zA-Z0-9_'-'.]+)@([a-zA-Z0-9_'-'.]+).([a-zA-Z]{2,5})$")]],password:[null,[l.p.required]],rememberMe:[!!this.storageService.getCookieItem("userEmail")]})}var a,o,n;return a=t,(o=[{key:"ngOnDestroy",value:function(){this.subscribes.forEach(function(e){})}},{key:"ngOnInit",value:function(){var e=this;this.translate=this.languageService.translate,this.translate.onLangChange.subscribe(function(r){e.msjModal=r.translations.login.modalMsj,e.msjError={severity:"error",summary:r.translations.message.titleError,detail:r.translations.login.errorMesage}})}},{key:"errorEmailRequired",get:function(){var e;return(null===(e=this.loginForm.get("email").errors)||void 0===e?void 0:e.required)&&this.loginForm.get("email").touched}},{key:"errorEmailFormat",get:function(){var e;return(null===(e=this.loginForm.get("email").errors)||void 0===e?void 0:e.pattern)&&this.loginForm.get("email").touched}},{key:"errorPasswordRequired",get:function(){var e;return(null===(e=this.loginForm.get("password").errors)||void 0===e?void 0:e.required)&&this.loginForm.get("password").touched}},{key:"onLogin",value:function(){return Object(s.a)(this,void 0,void 0,regeneratorRuntime.mark(function e(){var r,t,a=this;return regeneratorRuntime.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:if(this.loadTranslateText(),this.messageService.clear(),!this.loginForm.valid){e.next=9;break}return u.a.fire({allowOutsideClick:!1,icon:"info",text:this.msjModal}),u.a.showLoading(),r={email:this.loginForm.get("email").value,password:this.loginForm.get("password").value},e.next=5,this.loginService.signIn(r).subscribe(function(e){return Object(s.a)(a,void 0,void 0,regeneratorRuntime.mark(function r(){var t=this;return regeneratorRuntime.wrap(function(r){for(;;)switch(r.prev=r.next){case 0:if(!e.detail){r.next=2;break}return r.abrupt("return",(this.showMessageError(),void u.a.close()));case 2:return this.storageService.saveCookieItem("data_acc",e.access),this.storageService.saveCookieItem("data_ref",e.refresh),r.next=6,this.loginService.validateUser(e.access).then(function(){t.saveEmail(),u.a.close()}).catch(function(e){t.messageService.add({severity:"error",summary:"Server Error",detail:e}),t.showMessageError(),u.a.close()});case 6:case"end":return r.stop()}},r,this)}))},function(e){a.showMessageError(),u.a.close()});case 5:t=e.sent,this.subscribes.push(t),e.next=10;break;case 9:this.markTouchForm();case 10:case"end":return e.stop()}},e,this)}))}},{key:"markTouchForm",value:function(){Object.values(this.loginForm.controls).forEach(function(e){e.markAsTouched()})}},{key:"loadTranslateText",value:function(){var e=this.translate.currentLang;"es"===e?(this.msjModal=this.translate.translations.es.login.modalMsj,this.msjError={severity:"error",summary:this.translate.translations.es.message.titleError,detail:this.translate.translations.es.login.errorMesage}):"en"==e&&(this.msjModal=this.translate.translations.en.login.modalMsj,this.msjError={severity:"error",summary:this.translate.translations.en.message.titleError,detail:this.translate.translations.en.login.errorMesage})}},{key:"showMessageError",value:function(){this.messageService.add(this.msjError)}},{key:"onSaveEmail",value:function(e){e.checked?this.saveEmail():this.storageService.removeCookieItem("userEmail")}},{key:"saveEmail",value:function(){null!==this.loginForm.get("email").value&&""!==this.loginForm.get("email").value?this.storageService.saveCookieItem("userEmail",this.loginForm.get("email").value):(this.markTouchForm(),this.loginForm.controls.rememberMe.setValue(!1))}}])&&r(a.prototype,o),n&&r(a,n),t}(),C.\u0275fac=function(e){return new(e||C)(b.Ib(m.a),b.Ib(i.d),b.Ib(l.b),b.Ib(g.a),b.Ib(h.h),b.Ib(d.a),b.Ib(p.a))},C.\u0275cmp=b.Cb({type:C,selectors:[["app-login"]],decls:39,vars:42,consts:[[1,"login-body","layout-light"],[1,"login-content","animate__animated","animate__fadeIn"],[1,"login-panel"],[1,"login-panel-content"],[1,"logo"],["loading","lazy","src","assets/img/image2vector.svg",3,"alt"],["autocomplete","off","id","loginForm",3,"formGroup","ngSubmit"],[1,"forms"],[1,"p-field","p-fluid"],["for","email"],["aria-describedby","email-help","id","email","pInputText","","type","email","name","email","formControlName","email",3,"ngClass","placeholder"],["id","email-help","class","p-error",4,"ngIf"],["for","password"],[1,"viewPass"],["aria-describedby","pass-help","id","password","name","password","formControlName","password","pPassword","",3,"ngClass","type","placeholder","feedback"],["tabindex","0",1,"pi",3,"ngClass","click","keyup.enter"],["id","pass-help","class","p-error",4,"ngIf"],[1,"p-col-12"],["name","checked","id","check","formControlName","rememberMe","value","SaveInfo","binary","true",3,"label","onChange"],[1,"buttons"],["pButton","","type","submit",3,"label"],["href","#/restart-password",1,"secondary-button"],["id","email-help",1,"p-error"],["id","pass-help",1,"p-error"]],template:function(e,r){1&e&&(b.Ob(0,"div",0),b.Ob(1,"div",1),b.Ob(2,"div",2),b.Ob(3,"div",3),b.Ob(4,"div",4),b.Jb(5,"img",5),b.Zb(6,"translate"),b.Nb(),b.Ob(7,"h2"),b.Fc(8),b.Zb(9,"translate"),b.Nb(),b.Jb(10,"p-messages"),b.Jb(11,"p-toast"),b.Ob(12,"form",6),b.Vb("ngSubmit",function(){return r.onLogin()}),b.Ob(13,"div",7),b.Ob(14,"div",8),b.Ob(15,"label",9),b.Fc(16),b.Zb(17,"translate"),b.Nb(),b.Jb(18,"input",10),b.Zb(19,"translate"),b.Dc(20,E,3,3,"small",11),b.Nb(),b.Ob(21,"div",8),b.Ob(22,"label",12),b.Fc(23),b.Zb(24,"translate"),b.Nb(),b.Ob(25,"div",13),b.Jb(26,"input",14),b.Zb(27,"translate"),b.Ob(28,"i",15),b.Vb("click",function(){return r.show=!r.show})("keyup.enter",function(){return r.show=!r.show}),b.Nb(),b.Nb(),b.Dc(29,F,3,3,"small",16),b.Nb(),b.Ob(30,"div",17),b.Ob(31,"p-checkbox",18),b.Vb("onChange",function(e){return r.onSaveEmail(e)}),b.Zb(32,"translate"),b.Nb(),b.Nb(),b.Ob(33,"div",19),b.Jb(34,"button",20),b.Zb(35,"translate"),b.Ob(36,"a",21),b.Fc(37),b.Zb(38,"translate"),b.Nb(),b.Nb(),b.Nb(),b.Nb(),b.Nb(),b.Nb(),b.Nb(),b.Nb()),2&e&&(b.xb(5),b.fc("alt",b.ac(6,17,"menu.altLogo")),b.xb(3),b.Gc(b.ac(9,19,"login.loginTitle")),b.xb(4),b.fc("formGroup",r.loginForm),b.xb(4),b.Gc(b.ac(17,21,"login.labeEmail")),b.xb(2),b.fc("ngClass",b.jc(35,S,r.errorEmailRequired||r.errorEmailFormat))("placeholder",b.ac(19,23,"login.placeholderEmail")),b.xb(2),b.fc("ngIf",r.errorEmailRequired||r.errorEmailFormat),b.xb(3),b.Gc(b.ac(24,25,"login.labelPassword")),b.xb(3),b.fc("ngClass",b.jc(37,S,r.errorPasswordRequired))("type",r.show?"text":"password")("placeholder",b.ac(27,27,"login.placeholderPass"))("feedback",!1),b.xb(2),b.fc("ngClass",b.kc(39,P,!r.show,r.show)),b.xb(1),b.fc("ngIf",r.errorPasswordRequired),b.xb(2),b.fc("label",b.ac(32,29,"login.check")),b.xb(3),b.fc("label",b.ac(35,31,"login.btnLogin")),b.xb(3),b.Hc("",b.ac(38,33,"login.recoverPassword")," "))},directives:[f.a,v.a,l.q,l.l,l.f,l.a,w.a,l.k,l.e,n.j,n.l,y.a,k.a,O.b],pipes:[x.c],styles:[".login-content[_ngcontent-%COMP%]{position:relative;height:100vh}.login-content[_ngcontent-%COMP%]   .desert[_ngcontent-%COMP%]{position:absolute;bottom:0}.login-content[_ngcontent-%COMP%]   .login-panel[_ngcontent-%COMP%]{height:100%}.viewPass[_ngcontent-%COMP%]{position:relative}.viewPass[_ngcontent-%COMP%]   i[_ngcontent-%COMP%]{position:absolute;top:8px;right:10px;padding:5px;cursor:pointer}"]}),C),data:{breadcrumb:null}}],I=((M=function r(){e(this,r)}).\u0275mod=b.Gb({type:M}),M.\u0275inj=b.Fb({factory:function(e){return new(e||M)},imports:[[i.h.forChild(j)],i.h]}),M),_=o("PCNd"),Z=((N=function r(){e(this,r)}).\u0275mod=b.Gb({type:N}),N.\u0275inj=b.Fb({factory:function(e){return new(e||N)},imports:[[n.b,I,l.n,_.a]]}),N)}}])}();