!function(){function e(e,r){if(!(e instanceof r))throw new TypeError("Cannot call a class as a function")}function r(e,r){for(var t=0;t<r.length;t++){var a=r[t];a.enumerable=a.enumerable||!1,a.configurable=!0,"value"in a&&(a.writable=!0),Object.defineProperty(e,a.key,a)}}(window.webpackJsonp=window.webpackJsonp||[]).push([[15],{lu3c:function(t,a,o){"use strict";o.r(a),o.d(a,"LoginModule",function(){return _});var n=o("ofXK"),i=o("tyNb"),s=o("mrSG"),l=o("3Pt+"),c=o("PSD3"),u=o.n(c),b=o("fXoL"),m=o("DSp3"),g=o("kyOO"),h=o("7zfz"),d=o("EFyh"),f=o("n90K"),p=o("dts7"),v=o("7kUa"),w=o("+YxP"),y=o("Ji6n"),k=o("jIHw"),O=o("sYmb");function E(e,r){1&e&&(b.Ob(0,"small",22),b.Fc(1),b.Zb(2,"translate"),b.Nb()),2&e&&(b.xb(1),b.Gc(b.ac(2,1,"login.errorMsjEmail")))}function x(e,r){1&e&&(b.Ob(0,"small",23),b.Fc(1),b.Zb(2,"translate"),b.Nb()),2&e&&(b.xb(1),b.Gc(b.ac(2,1,"login.errorMsjPassword")))}var F,C,M,N=function(e){return{"ng-dirty":e}},S=function(e,r){return{"pi-eye":e,"pi-eye-slash":r}},P=[{path:"",component:(F=function(){function t(r,a,o,n,i,s,c){e(this,t),this.auth=r,this.router=a,this.fb=o,this.languageService=n,this.messageService=i,this.loginService=s,this.storageService=c,this.subscribes=[],this.show=!1,this.loginForm=this.fb.group({email:[this.storageService.getCookieItem("userEmail")||null,[l.q.required,l.q.pattern("^([a-zA-Z0-9_'-'.]+)@([a-zA-Z0-9_'-'.]+).([a-zA-Z]{2,5})$")]],password:[null,[l.q.required]],rememberMe:[!!this.storageService.getCookieItem("userEmail")]})}var a,o,n;return a=t,(o=[{key:"ngOnDestroy",value:function(){this.subscribes.forEach(function(e){})}},{key:"ngOnInit",value:function(){var e=this;this.translate=this.languageService.translate,this.translate.onLangChange.subscribe(function(r){e.msjModal=r.translations.login.modalMsj,e.msjError={severity:"error",summary:r.translations.message.titleError,detail:r.translations.login.errorMesage}})}},{key:"errorEmailRequired",get:function(){var e;return(null===(e=this.loginForm.get("email").errors)||void 0===e?void 0:e.required)&&this.loginForm.get("email").touched}},{key:"errorEmailFormat",get:function(){var e;return(null===(e=this.loginForm.get("email").errors)||void 0===e?void 0:e.pattern)&&this.loginForm.get("email").touched}},{key:"errorPasswordRequired",get:function(){var e;return(null===(e=this.loginForm.get("password").errors)||void 0===e?void 0:e.required)&&this.loginForm.get("password").touched}},{key:"onLogin",value:function(){return Object(s.a)(this,void 0,void 0,regeneratorRuntime.mark(function e(){var r,t,a=this;return regeneratorRuntime.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:if(this.loadTranslateText(),this.messageService.clear(),!this.loginForm.valid){e.next=9;break}return u.a.fire({allowOutsideClick:!1,icon:"info",text:this.msjModal}),u.a.showLoading(),r={email:this.loginForm.get("email").value,password:this.loginForm.get("password").value},e.next=5,this.loginService.signIn(r).subscribe(function(e){return Object(s.a)(a,void 0,void 0,regeneratorRuntime.mark(function r(){var t=this;return regeneratorRuntime.wrap(function(r){for(;;)switch(r.prev=r.next){case 0:if(!e.detail){r.next=2;break}return r.abrupt("return",(this.showMessageError(),void u.a.close()));case 2:return this.storageService.saveCookieItem("data_acc",e.access),this.storageService.saveCookieItem("data_ref",e.refresh),r.next=6,this.loginService.validateUser(e.access).then(function(){t.saveEmail(),u.a.close()}).catch(function(e){t.messageService.add({severity:"error",summary:"Server Error",detail:e}),t.showMessageError(),u.a.close()});case 6:case"end":return r.stop()}},r,this)}))},function(e){a.showMessageError(),u.a.close()});case 5:t=e.sent,this.subscribes.push(t),e.next=10;break;case 9:this.markTouchForm();case 10:case"end":return e.stop()}},e,this)}))}},{key:"markTouchForm",value:function(){Object.values(this.loginForm.controls).forEach(function(e){e.markAsTouched()})}},{key:"loadTranslateText",value:function(){var e=this.translate.currentLang;"es"===e?(this.msjModal=this.translate.translations.es.login.modalMsj,this.msjError={severity:"error",summary:this.translate.translations.es.message.titleError,detail:this.translate.translations.es.login.errorMesage}):"en"==e&&(this.msjModal=this.translate.translations.en.login.modalMsj,this.msjError={severity:"error",summary:this.translate.translations.en.message.titleError,detail:this.translate.translations.en.login.errorMesage})}},{key:"showMessageError",value:function(){this.messageService.add(this.msjError)}},{key:"onSaveEmail",value:function(e){e.checked?this.saveEmail():this.storageService.removeCookieItem("userEmail")}},{key:"saveEmail",value:function(){null!==this.loginForm.get("email").value&&""!==this.loginForm.get("email").value?this.storageService.saveCookieItem("userEmail",this.loginForm.get("email").value):(this.markTouchForm(),this.loginForm.controls.rememberMe.setValue(!1))}}])&&r(a.prototype,o),n&&r(a,n),t}(),F.\u0275fac=function(e){return new(e||F)(b.Ib(m.a),b.Ib(i.d),b.Ib(l.b),b.Ib(g.a),b.Ib(h.h),b.Ib(d.a),b.Ib(f.a))},F.\u0275cmp=b.Cb({type:F,selectors:[["app-login"]],decls:38,vars:42,consts:[[1,"login-body","layout-light"],[1,"login-content","animate__animated","animate__fadeIn"],[1,"login-panel"],[1,"login-panel-content"],[1,"logo"],["loading","lazy","src","assets/img/image2vector.svg",3,"alt"],["autocomplete","off","id","loginForm",3,"formGroup","ngSubmit"],[1,"forms"],[1,"p-field","p-fluid"],["for","email"],["aria-describedby","email-help","id","email","pInputText","","type","email","name","email","formControlName","email",3,"ngClass","placeholder"],["id","email-help","class","p-error",4,"ngIf"],["for","password"],[1,"viewPass"],["aria-describedby","pass-help","id","password","name","password","formControlName","password","pPassword","",3,"ngClass","type","placeholder","feedback"],["tabindex","0",1,"pi",3,"ngClass","click","keyup.enter"],["id","pass-help","class","p-error",4,"ngIf"],[1,"p-col-12"],["name","checked","id","check","formControlName","rememberMe","value","SaveInfo","binary","true",3,"label","onChange"],[1,"buttons"],["pButton","","type","submit",3,"label"],["href","#/restart-password",1,"secondary-button"],["id","email-help",1,"p-error"],["id","pass-help",1,"p-error"]],template:function(e,r){1&e&&(b.Ob(0,"div",0),b.Ob(1,"div",1),b.Ob(2,"div",2),b.Ob(3,"div",3),b.Ob(4,"div",4),b.Jb(5,"img",5),b.Zb(6,"translate"),b.Nb(),b.Ob(7,"h2"),b.Fc(8),b.Zb(9,"translate"),b.Nb(),b.Jb(10,"p-messages"),b.Ob(11,"form",6),b.Vb("ngSubmit",function(){return r.onLogin()}),b.Ob(12,"div",7),b.Ob(13,"div",8),b.Ob(14,"label",9),b.Fc(15),b.Zb(16,"translate"),b.Nb(),b.Jb(17,"input",10),b.Zb(18,"translate"),b.Dc(19,E,3,3,"small",11),b.Nb(),b.Ob(20,"div",8),b.Ob(21,"label",12),b.Fc(22),b.Zb(23,"translate"),b.Nb(),b.Ob(24,"div",13),b.Jb(25,"input",14),b.Zb(26,"translate"),b.Ob(27,"i",15),b.Vb("click",function(){return r.show=!r.show})("keyup.enter",function(){return r.show=!r.show}),b.Nb(),b.Nb(),b.Dc(28,x,3,3,"small",16),b.Nb(),b.Ob(29,"div",17),b.Ob(30,"p-checkbox",18),b.Vb("onChange",function(e){return r.onSaveEmail(e)}),b.Zb(31,"translate"),b.Nb(),b.Nb(),b.Ob(32,"div",19),b.Jb(33,"button",20),b.Zb(34,"translate"),b.Ob(35,"a",21),b.Fc(36),b.Zb(37,"translate"),b.Nb(),b.Nb(),b.Nb(),b.Nb(),b.Nb(),b.Nb(),b.Nb(),b.Nb()),2&e&&(b.xb(5),b.fc("alt",b.ac(6,17,"menu.altLogo")),b.xb(3),b.Gc(b.ac(9,19,"login.loginTitle")),b.xb(3),b.fc("formGroup",r.loginForm),b.xb(4),b.Gc(b.ac(16,21,"login.labeEmail")),b.xb(2),b.fc("ngClass",b.jc(35,N,r.errorEmailRequired||r.errorEmailFormat))("placeholder",b.ac(18,23,"login.placeholderEmail")),b.xb(2),b.fc("ngIf",r.errorEmailRequired||r.errorEmailFormat),b.xb(3),b.Gc(b.ac(23,25,"login.labelPassword")),b.xb(3),b.fc("ngClass",b.jc(37,N,r.errorPasswordRequired))("type",r.show?"text":"password")("placeholder",b.ac(26,27,"login.placeholderPass"))("feedback",!1),b.xb(2),b.fc("ngClass",b.kc(39,S,!r.show,r.show)),b.xb(1),b.fc("ngIf",r.errorPasswordRequired),b.xb(2),b.fc("label",b.ac(31,29,"login.check")),b.xb(3),b.fc("label",b.ac(34,31,"login.btnLogin")),b.xb(3),b.Hc("",b.ac(37,33,"login.recoverPassword")," "))},directives:[p.a,l.r,l.l,l.f,l.a,v.a,l.k,l.e,n.j,n.l,w.a,y.a,k.b],pipes:[O.c],styles:[".login-content[_ngcontent-%COMP%]{position:relative;height:100vh}.login-content[_ngcontent-%COMP%]   .desert[_ngcontent-%COMP%]{position:absolute;bottom:0}.login-content[_ngcontent-%COMP%]   .login-panel[_ngcontent-%COMP%]{height:100%}.viewPass[_ngcontent-%COMP%]{position:relative}.viewPass[_ngcontent-%COMP%]   i[_ngcontent-%COMP%]{position:absolute;top:8px;right:10px;padding:5px;cursor:pointer}"]}),F),data:{breadcrumb:null}}],j=((C=function r(){e(this,r)}).\u0275mod=b.Gb({type:C}),C.\u0275inj=b.Fb({factory:function(e){return new(e||C)},imports:[[i.h.forChild(P)],i.h]}),C),I=o("PCNd"),_=((M=function r(){e(this,r)}).\u0275mod=b.Gb({type:M}),M.\u0275inj=b.Fb({factory:function(e){return new(e||M)},imports:[[n.b,j,l.o,I.a]]}),M)}}])}();