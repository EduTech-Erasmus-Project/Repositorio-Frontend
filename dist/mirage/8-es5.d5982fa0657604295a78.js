!function(){function t(t,e){if(!(t instanceof e))throw new TypeError("Cannot call a class as a function")}function e(t,e){for(var i=0;i<e.length;i++){var n=e[i];n.enumerable=n.enumerable||!1,n.configurable=!0,"value"in n&&(n.writable=!0),Object.defineProperty(t,n.key,n)}}function i(t,i,n){return i&&e(t.prototype,i),n&&e(t,n),t}(window.webpackJsonp=window.webpackJsonp||[]).push([[8],{"MxL+":function(e,n,a){"use strict";a.r(n),a.d(n,"ReportsModule",function(){return kt});var c=a("ofXK"),o=a("+F6F"),b=a("tyNb"),r=a("mrSG"),l=a("fXoL"),u=a("t3rE"),s=a("EFyh"),f=a("dPl2"),p=a("7CaW"),d=a("rEr+"),v=a("7zfz");function O(t,e){1&t&&(l.Ob(0,"div"),l.Ob(1,"h1"),l.Fc(2,"Informe de Evaluaci\xf3n Accesibilidad"),l.Nb(),l.Nb())}function g(t,e){1&t&&(l.Ob(0,"div"),l.Ob(1,"h1"),l.Fc(2,"Informe de Evaluaci\xf3n Adaptabilidad"),l.Nb(),l.Nb())}function h(t,e){if(1&t&&(l.Ob(0,"a"),l.Ob(1,"b"),l.Fc(2,"Observaciones del Experto:"),l.Nb(),l.Fc(3),l.Nb()),2&t){var i=l.Yb();l.xb(3),l.Hc(" ",i.observationexpert,"")}}function m(t,e){if(1&t&&(l.Ob(0,"a"),l.Ob(1,"b"),l.Fc(2,"Observaciones del Estudiante:"),l.Nb(),l.Fc(3),l.Nb()),2&t){var i=l.Yb();l.xb(3),l.Hc(" ",i.observationstudent,"")}}function N(t,e){if(1&t&&(l.Ob(0,"h5"),l.Ob(1,"a"),l.Fc(2),l.Nb(),l.Nb()),2&t){var i=l.Yb().$implicit;l.xb(2),l.Gc(i.evaluation_concept)}}function y(t,e){if(1&t&&(l.Mb(0),l.Ob(1,"ul"),l.Ob(2,"li"),l.Ob(3,"a"),l.Fc(4),l.Nb(),l.Nb(),l.Nb(),l.Lb()),2&t){var i=l.Yb().$implicit;l.xb(4),l.Hc("",i.interpreter_yes,".")}}function x(t,e){}function j(t,e){if(1&t&&(l.Ob(0,"div"),l.Dc(1,y,5,1,"ng-container",25),l.Dc(2,x,0,0,"ng-template",null,26,l.Ec),l.Nb()),2&t){var i=e.$implicit,n=l.tc(3);l.xb(1),l.fc("ngIf","Si"==i.qualification)("ngIfElse",n)}}function F(t,e){if(1&t&&(l.Ob(0,"div"),l.Dc(1,N,3,1,"h5",2),l.Dc(2,j,4,2,"div",13),l.Jb(3,"br"),l.Nb()),2&t){var i=e.$implicit,n=l.Yb(3);l.xb(1),l.fc("ngIf",n.viewSubtitle(i.question_evaluations,"Si")),l.xb(1),l.fc("ngForOf",i.question_evaluations)}}function D(t,e){if(1&t&&(l.Ob(0,"div"),l.Dc(1,F,4,2,"div",13),l.Nb()),2&t){var i=e.$implicit;l.xb(1),l.fc("ngForOf",i.concept_evaluations)}}function _(t,e){if(1&t&&(l.Ob(0,"h5"),l.Ob(1,"a"),l.Fc(2),l.Nb(),l.Nb()),2&t){var i=l.Yb().$implicit;l.xb(2),l.Gc(i.evaluation_concept)}}function E(t,e){if(1&t&&(l.Mb(0),l.Ob(1,"ul"),l.Ob(2,"li"),l.Ob(3,"a"),l.Fc(4),l.Nb(),l.Nb(),l.Nb(),l.Lb()),2&t){var i=l.Yb().$implicit;l.xb(4),l.Hc("",i.interpreter_partially,".")}}function w(t,e){}function I(t,e){if(1&t&&(l.Ob(0,"div"),l.Dc(1,E,5,1,"ng-container",25),l.Dc(2,w,0,0,"ng-template",null,26,l.Ec),l.Nb()),2&t){var i=e.$implicit,n=l.tc(3);l.xb(1),l.fc("ngIf","Parcialmente"==i.qualification)("ngIfElse",n)}}function k(t,e){if(1&t&&(l.Ob(0,"div"),l.Dc(1,_,3,1,"h5",2),l.Dc(2,I,4,2,"div",13),l.Jb(3,"br"),l.Nb()),2&t){var i=e.$implicit,n=l.Yb(3);l.xb(1),l.fc("ngIf",n.viewSubtitle(i.question_evaluations,"Parcialmente")),l.xb(1),l.fc("ngForOf",i.question_evaluations)}}function q(t,e){if(1&t&&(l.Ob(0,"div"),l.Dc(1,k,4,2,"div",13),l.Nb()),2&t){var i=e.$implicit;l.xb(1),l.fc("ngForOf",i.concept_evaluations)}}function S(t,e){if(1&t&&(l.Ob(0,"h5"),l.Ob(1,"a"),l.Fc(2),l.Nb(),l.Nb()),2&t){var i=l.Yb().$implicit;l.xb(2),l.Gc(i.evaluation_concept)}}function $(t,e){if(1&t&&(l.Mb(0),l.Ob(1,"ul"),l.Ob(2,"li"),l.Ob(3,"a"),l.Fc(4),l.Nb(),l.Nb(),l.Nb(),l.Lb()),2&t){var i=l.Yb().$implicit;l.xb(4),l.Hc("",i.interpreter_no,".")}}function P(t,e){}function A(t,e){if(1&t&&(l.Ob(0,"div"),l.Dc(1,$,5,1,"ng-container",25),l.Dc(2,P,0,0,"ng-template",null,26,l.Ec),l.Nb()),2&t){var i=e.$implicit,n=l.tc(3);l.xb(1),l.fc("ngIf","No"==i.qualification)("ngIfElse",n)}}function C(t,e){if(1&t&&(l.Ob(0,"div"),l.Dc(1,S,3,1,"h5",2),l.Dc(2,A,4,2,"div",13),l.Jb(3,"br"),l.Nb()),2&t){var i=e.$implicit,n=l.Yb(3);l.xb(1),l.fc("ngIf",n.viewSubtitle(i.question_evaluations,"No")),l.xb(1),l.fc("ngForOf",i.question_evaluations)}}function L(t,e){if(1&t&&(l.Ob(0,"div"),l.Dc(1,C,4,2,"div",13),l.Nb()),2&t){var i=e.$implicit;l.xb(1),l.fc("ngForOf",i.concept_evaluations)}}function J(t,e){if(1&t&&(l.Ob(0,"div"),l.Ob(1,"li"),l.Ob(2,"a"),l.Ob(3,"b"),l.Fc(4),l.Nb(),l.Fc(5),l.Zb(6,"number"),l.Nb(),l.Nb(),l.Nb()),2&t){var i=e.$implicit;l.xb(4),l.Hc("",i.evaluation_concept,": "),l.xb(1),l.Gc(l.bc(6,2,i.average,"1.1-2"))}}function Y(t,e){if(1&t&&(l.Ob(0,"div",27),l.Dc(1,J,7,5,"div",13),l.Nb()),2&t){var i=e.$implicit;l.xb(1),l.fc("ngForOf",i.concept_evaluations)}}function R(t,e){if(1&t&&(l.Mb(0),l.Ob(1,"ul"),l.Ob(2,"li"),l.Ob(3,"a"),l.Fc(4),l.Nb(),l.Nb(),l.Nb(),l.Lb()),2&t){var i=l.Yb().$implicit;l.xb(4),l.Hc("",i.schema,".")}}function H(t,e){}function M(t,e){if(1&t&&(l.Ob(0,"div"),l.Dc(1,R,5,1,"ng-container",25),l.Dc(2,H,0,0,"ng-template",null,26,l.Ec),l.Nb()),2&t){var i=e.$implicit,n=l.tc(3);l.xb(1),l.fc("ngIf",null==i.schema?null:i.schema.includes("accessibilityHazard:"))("ngIfElse",n)}}function G(t,e){if(1&t&&(l.Ob(0,"div"),l.Dc(1,M,4,2,"div",13),l.Nb()),2&t){var i=e.$implicit;l.xb(1),l.fc("ngForOf",i.question_evaluations)}}function z(t,e){if(1&t&&(l.Ob(0,"div"),l.Dc(1,G,2,1,"div",13),l.Nb()),2&t){var i=e.$implicit;l.xb(1),l.fc("ngForOf",i.concept_evaluations)}}function T(t,e){1&t&&(l.Ob(0,"tr"),l.Ob(1,"th",31),l.Fc(2,"Metadatos"),l.Nb(),l.Ob(3,"th",31),l.Fc(4,"Concuerda con el Experto"),l.Nb(),l.Nb())}function U(t,e){if(1&t&&(l.Ob(0,"tr"),l.Ob(1,"td",32),l.Fc(2),l.Nb(),l.Ob(3,"td",32),l.Fc(4),l.Nb(),l.Nb()),2&t){var i=e.$implicit;l.xb(2),l.Hc(" ",i.id," "),l.xb(2),l.Hc(" ",i.concuerdan," ")}}function B(t,e){if(1&t&&l.Dc(0,U,5,2,"tr",13),2&t){var i=l.Yb(3);l.fc("ngForOf",i.colsAnswer)}}function Q(t,e){if(1&t&&(l.Ob(0,"div"),l.Ob(1,"p-table",28),l.Dc(2,T,5,0,"ng-template",29),l.Dc(3,B,1,1,"ng-template",30),l.Nb(),l.Nb()),2&t){var i=l.Yb(2);l.xb(1),l.fc("columns",i.te)("value",i.te)}}function V(t,e){if(1&t&&(l.Ob(0,"div"),l.Ob(1,"div",5),l.Ob(2,"p-tabView"),l.Ob(3,"p-tabPanel",12),l.Ob(4,"h4"),l.Ob(5,"a"),l.Fc(6,"Aspectos Positivos de la Evaluacion"),l.Nb(),l.Nb(),l.Dc(7,D,2,1,"div",13),l.Nb(),l.Ob(8,"p-tabPanel",14),l.Ob(9,"h4"),l.Ob(10,"a"),l.Fc(11,"Aspectos Regulares de la Evaluacion"),l.Nb(),l.Nb(),l.Dc(12,q,2,1,"div",13),l.Nb(),l.Ob(13,"p-tabPanel",15),l.Ob(14,"h5"),l.Ob(15,"a"),l.Fc(16,"Aspectos de la Evaluacion mal implementados "),l.Nb(),l.Nb(),l.Dc(17,L,2,1,"div",13),l.Nb(),l.Ob(18,"p-tabPanel",16),l.Ob(19,"p-panel",17),l.Ob(20,"div"),l.Ob(21,"a"),l.Fc(22),l.Nb(),l.Nb(),l.Jb(23,"br"),l.Ob(24,"div",4),l.Ob(25,"div",5),l.Ob(26,"div",1),l.Ob(27,"div",18),l.Ob(28,"h6"),l.Ob(29,"a"),l.Fc(30,"Resiltado Calificacion Areas de Evaluacion"),l.Nb(),l.Nb(),l.Dc(31,Y,2,1,"div",19),l.Nb(),l.Ob(32,"div",18),l.Ob(33,"b"),l.Ob(34,"a"),l.Fc(35,"Peligros de Accesibilidad Identificados"),l.Nb(),l.Nb(),l.Dc(36,z,2,1,"div",13),l.Nb(),l.Nb(),l.Nb(),l.Nb(),l.Ob(37,"div",20),l.Ob(38,"p",20),l.Ob(39,"a"),l.Fc(40,"Tabla Comparativa de Metadatos de Accesibilidad"),l.Nb(),l.Nb(),l.Ob(41,"div",21),l.Dc(42,Q,4,2,"div",2),l.Nb(),l.Nb(),l.Ob(43,"div"),l.Jb(44,"br"),l.Ob(45,"label",22),l.Fc(46,"Visita nuestra herramienta "),l.Ob(47,"a",23),l.Fc(48,"OER-ADAP"),l.Nb(),l.Fc(49," para la adaptaci\xf3n de objetos de aprendizaje.Tambi\xe9n puedes visitar nuestra herramienta "),l.Ob(50,"a",24),l.Fc(51,"LOMPAD-WEB"),l.Nb(),l.Fc(52," para la correccion de los metadatos y el metaetiquetado para objetos de aprendizaje."),l.Nb(),l.Nb(),l.Nb(),l.Nb(),l.Nb(),l.Nb(),l.Nb()),2&t){var i=l.Yb();l.xb(3),l.gc("tooltip",i.topyes),l.xb(4),l.fc("ngForOf",i.resultsEv),l.xb(1),l.gc("tooltip",i.toppartially),l.xb(4),l.fc("ngForOf",i.resultsEv),l.xb(1),l.gc("tooltip",i.topno),l.xb(4),l.fc("ngForOf",i.resultsEv),l.xb(5),l.Hc("A continuacion se muestran aquellos metadatos que estan incluidos dentro del objeto de aprendizaje llamado ",null==i.objectData?null:i.objectData.slug,", y aquelos metadatos identificados por parte de la evaluacion realizada por el experto."),l.xb(9),l.fc("ngForOf",i.resultsEv),l.xb(5),l.fc("ngForOf",i.resultsEv),l.xb(6),l.fc("ngIf",(null==i.colsAnswer?null:i.colsAnswer.length)>0)}}function Z(t,e){if(1&t&&(l.Ob(0,"h5"),l.Ob(1,"a"),l.Fc(2),l.Nb(),l.Nb()),2&t){var i=l.Yb().$implicit;l.xb(2),l.Gc(i.evaluation_principle.principle)}}function X(t,e){if(1&t&&(l.Mb(0),l.Ob(1,"a"),l.Ob(2,"b"),l.Fc(3,"Pauta de Evaluacion->"),l.Nb(),l.Fc(4),l.Nb(),l.Ob(5,"ul"),l.Ob(6,"ol"),l.Ob(7,"a"),l.Fc(8),l.Nb(),l.Nb(),l.Nb(),l.Lb()),2&t){var i=l.Yb().$implicit,n=l.Yb().$implicit;l.xb(4),l.Hc("",n.guideline_pr,":"),l.xb(4),l.Gc(i.interpreter_st_yes)}}function W(t,e){}function K(t,e){if(1&t&&(l.Ob(0,"div"),l.Dc(1,X,9,2,"ng-container",25),l.Dc(2,W,0,0,"ng-template",null,26,l.Ec),l.Nb()),2&t){var i=e.$implicit,n=l.tc(3);l.xb(1),l.fc("ngIf","Si"==i.qualification)("ngIfElse",n)}}function tt(t,e){if(1&t&&(l.Ob(0,"div"),l.Dc(1,K,4,2,"div",13),l.Jb(2,"br"),l.Nb()),2&t){var i=e.$implicit;l.xb(1),l.fc("ngForOf",i.guideline_evaluations)}}function et(t,e){if(1&t&&(l.Ob(0,"div"),l.Dc(1,Z,3,1,"h5",2),l.Dc(2,tt,3,1,"div",13),l.Nb()),2&t){var i=e.$implicit,n=l.Yb(3);l.xb(1),l.fc("ngIf",n.viewSubtitleEst(i.principle_gl,"Si")),l.xb(1),l.fc("ngForOf",i.principle_gl)}}function it(t,e){if(1&t&&(l.Ob(0,"div"),l.Dc(1,et,3,2,"div",13),l.Nb()),2&t){var i=e.$implicit;l.xb(1),l.fc("ngForOf",i.evaluation_students)}}function nt(t,e){if(1&t&&(l.Ob(0,"h5"),l.Ob(1,"a"),l.Fc(2),l.Nb(),l.Nb()),2&t){var i=l.Yb().$implicit;l.xb(2),l.Gc(i.evaluation_principle.principle)}}function at(t,e){if(1&t&&(l.Mb(0),l.Ob(1,"li",36),l.Ob(2,"a"),l.Ob(3,"b"),l.Fc(4,"Pauta de Evaluacion->"),l.Nb(),l.Fc(5),l.Nb(),l.Nb(),l.Ob(6,"ul"),l.Ob(7,"ol"),l.Ob(8,"a"),l.Fc(9),l.Nb(),l.Nb(),l.Nb(),l.Lb()),2&t){var i=l.Yb().$implicit,n=l.Yb().$implicit;l.xb(5),l.Hc("",n.guideline_pr,":"),l.xb(4),l.Gc(i.interpreter_st_partially)}}function ct(t,e){}function ot(t,e){if(1&t&&(l.Ob(0,"div"),l.Dc(1,at,10,2,"ng-container",25),l.Dc(2,ct,0,0,"ng-template",null,26,l.Ec),l.Nb()),2&t){var i=e.$implicit,n=l.tc(3);l.xb(1),l.fc("ngIf","Parcialmente"==i.qualification)("ngIfElse",n)}}function bt(t,e){if(1&t&&(l.Ob(0,"div"),l.Dc(1,ot,4,2,"div",13),l.Jb(2,"br"),l.Nb()),2&t){var i=e.$implicit;l.xb(1),l.fc("ngForOf",i.guideline_evaluations)}}function rt(t,e){if(1&t&&(l.Ob(0,"div"),l.Dc(1,nt,3,1,"h5",2),l.Dc(2,bt,3,1,"div",13),l.Nb()),2&t){var i=e.$implicit,n=l.Yb(3);l.xb(1),l.fc("ngIf",n.viewSubtitleEst(i.principle_gl,"Parcialmente")),l.xb(1),l.fc("ngForOf",i.principle_gl)}}function lt(t,e){if(1&t&&(l.Ob(0,"div"),l.Dc(1,rt,3,2,"div",13),l.Nb()),2&t){var i=e.$implicit;l.xb(1),l.fc("ngForOf",i.evaluation_students)}}function ut(t,e){if(1&t&&(l.Ob(0,"h5"),l.Ob(1,"a"),l.Fc(2),l.Nb(),l.Nb()),2&t){var i=l.Yb().$implicit;l.xb(2),l.Gc(i.evaluation_principle.principle)}}function st(t,e){if(1&t&&(l.Mb(0),l.Ob(1,"li",36),l.Ob(2,"a"),l.Ob(3,"b"),l.Fc(4,"Pauta de Evaluacion->"),l.Nb(),l.Fc(5),l.Nb(),l.Nb(),l.Ob(6,"ul"),l.Ob(7,"ol"),l.Ob(8,"a"),l.Fc(9),l.Nb(),l.Nb(),l.Nb(),l.Lb()),2&t){var i=l.Yb().$implicit,n=l.Yb().$implicit;l.xb(5),l.Hc("",n.guideline_pr,":"),l.xb(4),l.Gc(i.interpreter_st_no)}}function ft(t,e){}function pt(t,e){if(1&t&&(l.Ob(0,"div"),l.Dc(1,st,10,2,"ng-container",25),l.Dc(2,ft,0,0,"ng-template",null,26,l.Ec),l.Nb()),2&t){var i=e.$implicit,n=l.tc(3);l.xb(1),l.fc("ngIf","No"==i.qualification)("ngIfElse",n)}}function dt(t,e){if(1&t&&(l.Ob(0,"div"),l.Dc(1,pt,4,2,"div",13),l.Jb(2,"br"),l.Nb()),2&t){var i=e.$implicit;l.xb(1),l.fc("ngForOf",i.guideline_evaluations)}}function vt(t,e){if(1&t&&(l.Ob(0,"div"),l.Dc(1,ut,3,1,"h5",2),l.Dc(2,dt,3,1,"div",13),l.Nb()),2&t){var i=e.$implicit,n=l.Yb(3);l.xb(1),l.fc("ngIf",n.viewSubtitleEst(i.principle_gl,"No")),l.xb(1),l.fc("ngForOf",i.principle_gl)}}function Ot(t,e){if(1&t&&(l.Ob(0,"div"),l.Dc(1,vt,3,2,"div",13),l.Nb()),2&t){var i=e.$implicit;l.xb(1),l.fc("ngForOf",i.evaluation_students)}}function gt(t,e){if(1&t&&(l.Ob(0,"div"),l.Ob(1,"h5"),l.Fc(2,"Estudiante"),l.Nb(),l.Ob(3,"p-tabView"),l.Ob(4,"p-tabPanel",33),l.Ob(5,"h5"),l.Ob(6,"a"),l.Fc(7,"Aspectos Positivos de la Evaluacion del alumno"),l.Nb(),l.Nb(),l.Dc(8,it,2,1,"div",13),l.Nb(),l.Ob(9,"p-tabPanel",34),l.Ob(10,"h5"),l.Ob(11,"a"),l.Fc(12,"Aspectos Regulares de la evaluacion identificados por el estudiante"),l.Nb(),l.Nb(),l.Dc(13,lt,2,1,"div",13),l.Nb(),l.Ob(14,"p-tabPanel",35),l.Ob(15,"h5"),l.Ob(16,"a"),l.Fc(17,"Aspectos negativos identificados por el estudiante"),l.Nb(),l.Nb(),l.Dc(18,Ot,2,1,"div",13),l.Nb(),l.Nb(),l.Nb()),2&t){var i=l.Yb();l.xb(4),l.gc("tooltip",i.Stopyes),l.xb(4),l.fc("ngForOf",i.resultsEvStudent),l.xb(1),l.gc("tooltip",i.Stoppartially),l.xb(4),l.fc("ngForOf",i.resultsEvStudent),l.xb(1),l.gc("tooltip",i.Stopno),l.xb(4),l.fc("ngForOf",i.resultsEvStudent)}}var ht,mt,Nt,yt=function(){return{"background-color":"cadetblue",color:"#ffffff"}},xt=[{path:"",pathMatch:"full",redirectTo:"/"},{path:":slug",component:(ht=function(){function e(i,n,a){var c=this;t(this,e),this.objectService=i,this.route=n,this.loginService=a,this.te=[1],this.metadataEv=[],this.metadataOb=[],this.colsAnswer=[],this.route.params.subscribe(function(t){c.getObjectDetail(t.slug)}),this.route.queryParams.subscribe(function(t){c.validtotal=t.rstudent})}return i(e,[{key:"ngOnInit",value:function(){}},{key:"showBasicDialogObject",value:function(){this.displayWindowobject=!0}},{key:"showBasicDialogMetadata",value:function(){this.displayWindowmetadata=!0}},{key:"getObjectDetail",value:function(t){return Object(r.a)(this,void 0,void 0,regeneratorRuntime.mark(function e(){var i=this;return regeneratorRuntime.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,this.objectService.getObjectDetail(t).subscribe(function(t){i.objectData=t,i.loadstudent(i.objectData.id);var e=[];Object.keys(i.objectData).forEach(function(t){(t.includes("accesibility")||t.includes("annotation_mode"))&&e.push((t+": "+i.objectData[t]).replace("_",""))});var n=[];e.forEach(function(t){var e=t.split(":");e[1].split(",").forEach(function(t){var i=e[0].replace("accesibilityfeatures","accessibilityfeature").replace("accesibilitycontrol","accessibilitycontrol").replace("accesibilityhazard","accessibilityhazard").replace("annotationmodeaccess","accesmode").replace("accesibilityapi","accessibilityapi").replace("accesibilitysummary","accessibilitysummary");n.push(i.toLowerCase()+":"+t.trim().toLowerCase())})}),i.loadDataExpert(i.objectData.id,n)},function(t){console.log("err",t)});case 2:case"end":return e.stop()}},e,this)}))}},{key:"loadDataExpert",value:function(t,e){return Object(r.a)(this,void 0,void 0,regeneratorRuntime.mark(function i(){var n=this;return regeneratorRuntime.wrap(function(i){for(;;)switch(i.prev=i.next){case 0:return i.next=2,this.objectService.getResultsEvaluation(t).subscribe(function(t){n.resultsEv=t.map(function(t){return{observation:t.observation,concept_evaluations:t.concept_evaluations.map(function(t){return{average:t.average,evaluation_concept:t.evaluation_concept.concept,question_evaluations:t.question_evaluations.map(function(t){return{question:t.question,schema:t.schema,qualification:t.qualification,interpreter_yes:t.interpreter_yes,interpreter_partially:t.interpreter_partially,interpreter_no:t.interpreter_no}})}})}}),n.resultsEv=n.resultsEv;var i=0,a=0,c=0;n.resultsEv.forEach(function(t){n.observationexpert=t.observation,t.concept_evaluations.forEach(function(t){t.question_evaluations.forEach(function(t){"Si"==t.qualification&&(i+=1),"Parcialmente"==t.qualification&&(a+=1),"No"==t.qualification&&(c+=1),n.metadataEv.push(t.schema)})})}),n.topyes=i,n.topno=c,n.toppartially=a;var o=[];n.resultsEv.forEach(function(t){t.concept_evaluations.forEach(function(t){t.question_evaluations.forEach(function(t){var i;null!=t.schema&&(e.includes(null===(i=t.schema)||void 0===i?void 0:i.toLowerCase())&&"Si"==t.qualification||e.includes(t.schema.toLowerCase())&&"Parcialmente"==t.qualification?o.push("Si"):e.includes(t.schema.toLowerCase())||"No"!=t.qualification?(!e.includes(t.schema.toLowerCase())&&"Si"==t.qualification||!e.includes(t.schema.toLowerCase())&&"Parcialmente"==t.qualification||e.includes(t.schema.toLowerCase())&&"No"==t.qualification)&&o.push("No"):o.push("Si"))})})});var b=[];n.resultsEv.forEach(function(t){n.observationexpert=t.observation,t.concept_evaluations.forEach(function(t){t.question_evaluations.forEach(function(t){null!=t.schema&&(!e.includes(t.schema.toLowerCase())&&"Si"==t.qualification||!e.includes(t.schema.toLowerCase())&&"Parcialmente"==t.qualification?b.push("incluir"):e.includes(t.schema.toLowerCase())&&"No"==t.qualification?b.push("quitar"):e.includes(t.schema.toLowerCase())&&"Si"==t.qualification||e.includes(t.schema.toLowerCase())&&"Parcialmente"==t.qualification?b.push(" "):e.includes(t.schema.toLowerCase())||"No"!=t.qualification||b.push(" "))})})});for(var r=0;r<n.metadataEv.length;r++)""==n.metadataEv[r]||n.colsAnswer.push({id:n.metadataEv[r],concuerdan:o[r],faltan:b[r]})});case 2:case"end":return i.stop()}},i,this)}))}},{key:"viewSubtitle",value:function(t,e){return t.map(function(t){return t.qualification==e}).includes(!0)}},{key:"viewSubtitleEst",value:function(t,e){return t.map(function(t){return t.guideline_evaluations.map(function(t){return t.qualification==e}).includes(!0)}).includes(!0)}},{key:"loadstudent",value:function(t){return Object(r.a)(this,void 0,void 0,regeneratorRuntime.mark(function e(){var i=this;return regeneratorRuntime.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:return e.next=2,this.objectService.getObjectResultsPublicEvaluationStudent(t).subscribe(function(t){if(t.length>0){i.resultsEvStudent=t.map(function(t){return{rating_student:t.rating,observation:t.observation,evaluation_students:t.evaluation_students.map(function(t){return{average_principle:t.average_principle,evaluation_principle:t.evaluation_principle,principle_gl:t.principle_gl.map(function(t){return{average_guideline:t.average_guideline,guideline_pr:t.guideline_pr.guideline,guideline_evaluations:t.guideline_evaluations.map(function(t){return{question:t.question,qualification:t.qualification,interpreter_st_yes:t.interpreter_st_yes,interpreter_st_no:t.interpreter_st_no,interpreter_st_partially:t.interpreter_st_partially,metadata:t.metadata}})}})}})}}),i.resultsEvStudent=i.resultsEvStudent;var e=0,n=0,a=0;i.resultsEvStudent.forEach(function(t){i.observationstudent=t.observation,t.evaluation_students.forEach(function(t){t.principle_gl.forEach(function(t){t.guideline_evaluations.forEach(function(t){"Si"==t.qualification&&(e+=1),"No"==t.qualification&&(a+=1),"Parcialmente"==t.qualification&&(n+=1)})})})}),i.Stopyes=e,i.Stopno=a,i.Stoppartially=n}});case 2:case"end":return e.stop()}},e,this)}))}}]),e}(),ht.\u0275fac=function(t){return new(t||ht)(l.Ib(u.a),l.Ib(b.a),l.Ib(s.a))},ht.\u0275cmp=l.Cb({type:ht,selectors:[["app-reports"]],decls:99,vars:31,consts:[[1,"main-content"],[1,"p-grid"],[4,"ngIf"],[1,"p-col-12","p-md-12"],[1,"accordion-body"],[1,"card"],[1,"p-col-12","p-md-1"],["severity","success","styleClass","p-mr-9","size","xlarge",3,"label"],[1,"p-col-12","p-md-7"],["SIZE","3"],[1,"p-col-12","p-md-4"],["width","150","height","135","align","right","loading","lazy",3,"src"],["leftIcon","pi pi-comments","header","Excelente",3,"tooltip"],[4,"ngFor","ngForOf"],["leftIcon","pi pi-comments","header","Regular",3,"tooltip"],["leftIcon","pi pi-comments","header","Por alcanzar",3,"tooltip"],["leftIcon","pi pi-book","header","General"],["header","Resumen de Metadatos"],[1,"p-col-12","p-md-6"],["class","tableP",4,"ngFor","ngForOf"],["align","center"],["align","center",1,"p-col-12","p-md-12"],["for","",2,"color","#3B5B68"],["href","https://oeradap.edutech-project.org/",2,"font-style","italic","text-decoration","underline"],["href","https://lompads.edutech-project.org/#/",2,"font-style","italic","text-decoration","underline"],[4,"ngIf","ngIfElse"],["editTemplate",""],[1,"tableP"],["styleClass","p-datatable-gridlines",1,"table",3,"columns","value"],["pTemplate","header"],["pTemplate","body"],[2,"color","#3B5B68"],[1,"tdid"],["header","Excelente","leftIcon","pi pi-comments",3,"tooltip"],["header","Regular","leftIcon","pi pi-comments",3,"tooltip"],["header","Por alcanzar","leftIcon","pi pi-comments",3,"tooltip"],["type","square"]],template:function(t,e){1&t&&(l.Ob(0,"div",0),l.Ob(1,"div",1),l.Dc(2,O,3,0,"div",2),l.Dc(3,g,3,0,"div",2),l.Ob(4,"div",3),l.Ob(5,"div",4),l.Ob(6,"div",5),l.Ob(7,"h3"),l.Ob(8,"b"),l.Fc(9,"T\xedtulo:"),l.Nb(),l.Fc(10),l.Nb(),l.Ob(11,"div",1),l.Ob(12,"div",6),l.Jb(13,"p-avatar",7),l.Zb(14,"number"),l.Nb(),l.Ob(15,"div",8),l.Ob(16,"li"),l.Ob(17,"a"),l.Ob(18,"FONT",9),l.Ob(19,"b"),l.Fc(20,"\xc1reas de Conocimiento:"),l.Nb(),l.Fc(21),l.Nb(),l.Jb(22,"i"),l.Nb(),l.Nb(),l.Ob(23,"li"),l.Ob(24,"a"),l.Ob(25,"FONT",9),l.Ob(26,"b"),l.Fc(27,"Desarrollado por:"),l.Nb(),l.Fc(28),l.Nb(),l.Jb(29,"i"),l.Nb(),l.Nb(),l.Ob(30,"li"),l.Ob(31,"a"),l.Ob(32,"FONT",9),l.Ob(33,"b"),l.Fc(34,"Fecha de Publicaci\xf3n:"),l.Nb(),l.Fc(35),l.Zb(36,"date"),l.Nb(),l.Jb(37,"i"),l.Nb(),l.Nb(),l.Ob(38,"li"),l.Ob(39,"a"),l.Ob(40,"FONT",9),l.Ob(41,"b"),l.Fc(42,"Cobertura:"),l.Nb(),l.Fc(43),l.Nb(),l.Jb(44,"i"),l.Nb(),l.Nb(),l.Ob(45,"li"),l.Ob(46,"a"),l.Ob(47,"FONT",9),l.Ob(48,"b"),l.Fc(49,"Requerimientos:"),l.Nb(),l.Fc(50),l.Nb(),l.Jb(51,"i"),l.Nb(),l.Nb(),l.Nb(),l.Ob(52,"div",10),l.Jb(53,"img",11),l.Nb(),l.Nb(),l.Nb(),l.Ob(54,"div"),l.Ob(55,"p"),l.Ob(56,"a"),l.Ob(57,"b"),l.Fc(58,"Descripcion:"),l.Nb(),l.Ob(59,"a"),l.Fc(60),l.Nb(),l.Nb(),l.Jb(61,"br"),l.Ob(62,"a"),l.Ob(63,"b"),l.Fc(64,"Objetivo:"),l.Nb(),l.Fc(65),l.Nb(),l.Jb(66,"br"),l.Ob(67,"a"),l.Ob(68,"b"),l.Fc(69,"Palabras Clave:"),l.Nb(),l.Fc(70),l.Nb(),l.Jb(71,"br"),l.Ob(72,"a"),l.Ob(73,"b"),l.Fc(74,"Ubicaci\xf3n t\xe9cnica :"),l.Nb(),l.Fc(75),l.Nb(),l.Jb(76,"br"),l.Ob(77,"a"),l.Ob(78,"b"),l.Fc(79,"Cat\xe1logo :"),l.Nb(),l.Fc(80),l.Nb(),l.Jb(81,"br"),l.Ob(82,"a"),l.Ob(83,"b"),l.Fc(84,"Dificultad :"),l.Nb(),l.Fc(85),l.Nb(),l.Jb(86,"br"),l.Ob(87,"a"),l.Ob(88,"b"),l.Fc(89,"Idioma:"),l.Nb(),l.Fc(90),l.Nb(),l.Jb(91,"br"),l.Dc(92,h,4,1,"a",2),l.Jb(93,"br"),l.Dc(94,m,4,1,"a",2),l.Jb(95,"br"),l.Nb(),l.Nb(),l.Jb(96,"br"),l.Dc(97,V,53,10,"div",2),l.Dc(98,gt,19,6,"div",2),l.Nb(),l.Nb(),l.Nb(),l.Nb()),2&t&&(l.xb(2),l.fc("ngIf",!e.validtotal),l.xb(1),l.fc("ngIf",e.validtotal),l.xb(7),l.Hc(" ",null==e.objectData?null:e.objectData.slug,""),l.xb(3),l.Bc(l.ic(30,yt)),l.gc("label",l.bc(14,24,null==e.objectData?null:e.objectData.rating,"1.1-2")),l.xb(8),l.Hc(" ",null==e.objectData?null:e.objectData.knowledge_area.name," "),l.xb(7),l.Ic(" ",null==e.objectData?null:e.objectData.user_created.first_name," ",null==e.objectData?null:e.objectData.user_created.last_name,""),l.xb(7),l.Hc(" ",l.bc(36,27,null==e.objectData?null:e.objectData.created,"MM/dd/yyyy"),""),l.xb(8),l.Hc(" ",null==e.objectData?null:e.objectData.general_coverage,""),l.xb(7),l.Hc(" ",null==e.objectData?null:e.objectData.technical_installationRremarks," "),l.xb(3),l.fc("src",null==e.objectData?null:e.objectData.avatar,l.xc),l.xb(7),l.Gc(null==e.objectData?null:e.objectData.general_description),l.xb(5),l.Hc(" ",null==e.objectData?null:e.objectData.educational_description,""),l.xb(5),l.Hc(" ",null==e.objectData?null:e.objectData.general_keyword,""),l.xb(5),l.Hc(" ",null==e.objectData?null:e.objectData.technical_location,""),l.xb(5),l.Hc(" ",null==e.objectData?null:e.objectData.relation_catalog,""),l.xb(5),l.Hc(" ",null==e.objectData?null:e.objectData.educational_difficulty,""),l.xb(5),l.Hc(" ",null==e.objectData?null:e.objectData.general_language,""),l.xb(2),l.fc("ngIf",!e.validtotal),l.xb(2),l.fc("ngIf",e.validtotal),l.xb(3),l.fc("ngIf",!e.validtotal),l.xb(1),l.fc("ngIf",e.validtotal))},directives:[c.l,o.a,f.b,f.a,c.k,p.a,d.b,v.j],pipes:[c.e,c.d],styles:[".tdid[_ngcontent-%COMP%]{overflow:hidden;color:#3b5b68}[_nghost-%COMP%]     table{width:auto!important;background-color:#0ff}"]}),ht),data:{breadcrumb:null}}],jt=((mt=function e(){t(this,e)}).\u0275mod=l.Gb({type:mt}),mt.\u0275inj=l.Fb({factory:function(t){return new(t||mt)},imports:[[b.h.forChild(xt)],b.h]}),mt),Ft=a("jeV5"),Dt=a("ZZi9"),_t=a("/RsI"),Et=a("jIHw"),wt=a("PCNd"),It=a("QGhL"),kt=((Nt=function e(){t(this,e)}).\u0275mod=l.Gb({type:Nt}),Nt.\u0275inj=l.Fb({factory:function(t){return new(t||Nt)},imports:[[c.b,jt,o.b,Ft.b,Dt.a,p.b,f.c,_t.b,Et.c,wt.a,It.a]]}),Nt)},QGhL:function(e,i,n){"use strict";n.d(i,"a",function(){return r});var a=n("ofXK"),c=n("PCNd"),o=n("3Pt+"),b=n("fXoL"),r=function(){var e=function e(){t(this,e)};return e.\u0275mod=b.Gb({type:e}),e.\u0275inj=b.Fb({factory:function(t){return new(t||e)},imports:[[a.b,c.a,o.o]]}),e}()},t3rE:function(e,n,a){"use strict";a.d(n,"a",function(){return f});var c=a("lJxs"),o=a("AytR"),b=a("uUT0"),r=a("fXoL"),l=a("tk/3"),u=a("n90K"),s=o.a.baseUrl,f=function(){var e=function(){function e(i,n){t(this,e),this.http=i,this.storageService=n}return i(e,[{key:"getLearningObject",value:function(){return this.http.get(s+"/areas-de-conocimiento/").pipe(Object(c.a)(function(t){return t}))}},{key:"uploadObject",value:function(t){var e=new FormData;return e.append("file",t),this.http.post(s+"/learning-object-file/",e)}},{key:"urlUpload",get:function(){return s+"/learning-object-file/"}},{key:"getObjectDetail",value:function(t){return this.http.get("".concat(s,"/learning-object/").concat(t))}},{key:"getObjectDetailById",value:function(t){return this.http.get("".concat(s,"/learning-object-metadata/").concat(t,"/"))}},{key:"getComments",value:function(t){return this.http.get("".concat(s,"/learning-objects/comments/").concat(t))}},{key:"addComent",value:function(t){return this.http.post(s+"/learning-object/create/commentary/",t)}},{key:"addMetadata",value:function(t){var e=Object(b.serialize)(t);return this.http.post(s+"/learning-object-metadata/",e)}},{key:"editMetadata",value:function(t){var e=Object(b.serialize)(t);return this.http.patch("".concat(s,"/learning-object-metadata/").concat(t.id,"/"),e)}},{key:"sendQualificationExpert",value:function(t){return this.http.post(s+"/learning-objects/register-evaluation-expert/",t)}},{key:"sendQualificationExpertUpdate",value:function(t,e){return this.http.put("".concat(s,"/learning-objects/register-evaluation-expert/").concat(e,"/"),t)}},{key:"sendQualificationStudent",value:function(t){return this.http.post(s+"/learning-objects/student-evaluation/",t)}},{key:"sendQualificationStudentUpdate",value:function(t,e){return this.http.put("".concat(s,"/learning-objects/student-evaluation/").concat(e,"/"),t)}},{key:"validateLike",value:function(t){return this.http.get("".concat(s,"/learning-objects/liked/").concat(t))}},{key:"getRecommendedObjects",value:function(){return this.http.get(s+"/learning-objects/recommended/")}},{key:"getResultsEvaluation",value:function(t){return this.http.get("".concat(s,"/learning-objects/evaluations-result-expert/").concat(t)).pipe(Object(c.a)(function(t){return t}))}},{key:"interactionLike",value:function(t){return this.http.put("".concat(s,"/object-learning/interaction/").concat(t.id,"/"),t)}},{key:"interactionView",value:function(t){return this.http.post(s+"/object-learning/interaction/",t)}},{key:"getObjectsTeacher",value:function(){return this.http.get(s+"/learning-objects/observation/")}},{key:"deleteObjestTeacher",value:function(t){return this.http.delete("".concat(s,"/learning-object-file-delete/").concat(t))}},{key:"getObjectsViewed",value:function(){return this.http.get(s+"/learning-objects/viewed/")}},{key:"getObjectResultsEvaluation",value:function(t){return this.http.get("".concat(s,"/learning-objects/evaluations-result-to-expert/").concat(t,"/")).pipe(Object(c.a)(function(t){return t}))}},{key:"getObjectResultsEvaluationStudent",value:function(t){return this.http.get("".concat(s,"/learning-objects/student/result-to-student/").concat(t,"/")).pipe(Object(c.a)(function(t){return t}))}},{key:"getObjectResultsEvaluationAutomatic",value:function(t){return this.http.get("".concat(s,"/learning-objects/evaluations-result-to-expert-automatic/").concat(t,"/")).pipe(Object(c.a)(function(t){return t}))}},{key:"getObjectResultsPublicEvaluationStudent",value:function(t){return this.http.get("".concat(s,"/learning-objects/student/result-to-public-student/").concat(t,"/")).pipe(Object(c.a)(function(t){return t}))}},{key:"getPopulars",value:function(){return this.http.get(s+"/learning-objects/populars/").pipe(Object(c.a)(function(t){return t}))}},{key:"searchExpertNoRated",value:function(){return this.http.get(s+"/learning-objects/expert-collaborator/no-rated/").pipe(Object(c.a)(function(t){return t}))}}]),e}();return e.\u0275fac=function(t){return new(t||e)(r.Sb(l.b),r.Sb(u.a))},e.\u0275prov=r.Eb({token:e,factory:e.\u0275fac,providedIn:"root"}),e}()},uUT0:function(t,e){var i=function(t){return void 0===t},n=function(t){return Array.isArray(t)},a=function(t){return t&&"number"==typeof t.size&&"string"==typeof t.type&&"function"==typeof t.slice};t.exports={serialize:function t(e,c,o,b){return(c=c||{}).indices=!i(c.indices)&&c.indices,c.nullsAsUndefineds=!i(c.nullsAsUndefineds)&&c.nullsAsUndefineds,c.booleansAsIntegers=!i(c.booleansAsIntegers)&&c.booleansAsIntegers,c.allowEmptyArrays=!i(c.allowEmptyArrays)&&c.allowEmptyArrays,o=o||new FormData,i(e)||(null===e?c.nullsAsUndefineds||o.append(b,""):"boolean"==typeof e?o.append(b,c.booleansAsIntegers?e?1:0:e):n(e)?e.length?e.forEach(function(e,i){t(e,c,o,b+"["+(c.indices?i:"")+"]")}):c.allowEmptyArrays&&o.append(b+"[]",""):e instanceof Date?o.append(b,e.toISOString()):(r=e)!==Object(r)||function(t){return a(t)&&"string"==typeof t.name&&("object"==typeof t.lastModifiedDate||"number"==typeof t.lastModified)}(e)||a(e)?o.append(b,e):Object.keys(e).forEach(function(i){var a=e[i];if(n(a))for(;i.length>2&&i.lastIndexOf("[]")===i.length-2;)i=i.substring(0,i.length-2);t(a,c,o,b?b+"["+i+"]":i)})),o;var r}}}}])}();