(window.webpackJsonp=window.webpackJsonp||[]).push([[8],{"MxL+":function(t,e,i){"use strict";i.r(e),i.d(e,"ReportsModule",function(){return Nt});var a=i("ofXK"),n=i("+F6F"),c=i("tyNb"),o=i("mrSG"),b=i("fXoL"),l=i("t3rE"),s=i("EFyh"),r=i("dPl2"),u=i("7CaW"),p=i("rEr+"),d=i("7zfz");function f(t,e){1&t&&(b.Ob(0,"div"),b.Ob(1,"h1"),b.Fc(2,"Informe de Evaluaci\xf3n Accesibilidad"),b.Nb(),b.Nb())}function O(t,e){1&t&&(b.Ob(0,"div"),b.Ob(1,"h1"),b.Fc(2,"Informe de Evaluaci\xf3n Adaptabilidad"),b.Nb(),b.Nb())}function v(t,e){if(1&t&&(b.Ob(0,"a"),b.Ob(1,"b"),b.Fc(2,"Observaciones del Experto:"),b.Nb(),b.Fc(3),b.Nb()),2&t){const t=b.Yb();b.xb(3),b.Hc(" ",t.observationexpert,"")}}function g(t,e){if(1&t&&(b.Ob(0,"a"),b.Ob(1,"b"),b.Fc(2,"Observaciones del Estudiante:"),b.Nb(),b.Fc(3),b.Nb()),2&t){const t=b.Yb();b.xb(3),b.Hc(" ",t.observationstudent,"")}}function h(t,e){if(1&t&&(b.Mb(0),b.Ob(1,"ul"),b.Ob(2,"li"),b.Ob(3,"a"),b.Fc(4),b.Nb(),b.Nb(),b.Nb(),b.Lb()),2&t){const t=b.Yb().$implicit;b.xb(4),b.Hc("",t.interpreter_yes,".")}}function N(t,e){}function m(t,e){if(1&t&&(b.Ob(0,"div"),b.Dc(1,h,5,1,"ng-container",23),b.Dc(2,N,0,0,"ng-template",null,24,b.Ec),b.Nb()),2&t){const t=e.$implicit,i=b.tc(3);b.xb(1),b.fc("ngIf","Si"==t.qualification)("ngIfElse",i)}}function F(t,e){if(1&t&&(b.Ob(0,"div"),b.Ob(1,"h5"),b.Ob(2,"a"),b.Fc(3),b.Nb(),b.Nb(),b.Dc(4,m,4,2,"div",13),b.Jb(5,"br"),b.Nb()),2&t){const t=e.$implicit;b.xb(3),b.Gc(t.evaluation_concept),b.xb(1),b.fc("ngForOf",t.question_evaluations)}}function j(t,e){if(1&t&&(b.Ob(0,"div"),b.Dc(1,F,6,2,"div",13),b.Nb()),2&t){const t=e.$implicit;b.xb(1),b.fc("ngForOf",t.concept_evaluations)}}function x(t,e){if(1&t&&(b.Mb(0),b.Ob(1,"ul"),b.Ob(2,"li"),b.Ob(3,"a"),b.Fc(4),b.Nb(),b.Nb(),b.Nb(),b.Lb()),2&t){const t=b.Yb().$implicit;b.xb(4),b.Hc("",t.interpreter_partially,".")}}function _(t,e){}function D(t,e){if(1&t&&(b.Ob(0,"div"),b.Dc(1,x,5,1,"ng-container",23),b.Dc(2,_,0,0,"ng-template",null,24,b.Ec),b.Nb()),2&t){const t=e.$implicit,i=b.tc(3);b.xb(1),b.fc("ngIf","Parcialmente"==t.qualification)("ngIfElse",i)}}function E(t,e){if(1&t&&(b.Ob(0,"div"),b.Ob(1,"h5"),b.Ob(2,"a"),b.Fc(3),b.Nb(),b.Nb(),b.Dc(4,D,4,2,"div",13),b.Jb(5,"br"),b.Nb()),2&t){const t=e.$implicit;b.xb(3),b.Gc(t.evaluation_concept),b.xb(1),b.fc("ngForOf",t.question_evaluations)}}function y(t,e){if(1&t&&(b.Ob(0,"div"),b.Dc(1,E,6,2,"div",13),b.Nb()),2&t){const t=e.$implicit;b.xb(1),b.fc("ngForOf",t.concept_evaluations)}}function $(t,e){if(1&t&&(b.Mb(0),b.Ob(1,"ul"),b.Ob(2,"li"),b.Ob(3,"a"),b.Fc(4),b.Nb(),b.Nb(),b.Nb(),b.Lb()),2&t){const t=b.Yb().$implicit;b.xb(4),b.Hc("",t.interpreter_no,".")}}function w(t,e){}function I(t,e){if(1&t&&(b.Ob(0,"div"),b.Dc(1,$,5,1,"ng-container",23),b.Dc(2,w,0,0,"ng-template",null,24,b.Ec),b.Nb()),2&t){const t=e.$implicit,i=b.tc(3);b.xb(1),b.fc("ngIf","No"==t.qualification)("ngIfElse",i)}}function q(t,e){if(1&t&&(b.Ob(0,"div"),b.Ob(1,"h5"),b.Ob(2,"a"),b.Fc(3),b.Nb(),b.Nb(),b.Dc(4,I,4,2,"div",13),b.Jb(5,"br"),b.Nb()),2&t){const t=e.$implicit;b.xb(3),b.Gc(t.evaluation_concept),b.xb(1),b.fc("ngForOf",t.question_evaluations)}}function S(t,e){if(1&t&&(b.Ob(0,"div"),b.Dc(1,q,6,2,"div",13),b.Nb()),2&t){const t=e.$implicit;b.xb(1),b.fc("ngForOf",t.concept_evaluations)}}function P(t,e){if(1&t&&(b.Ob(0,"div"),b.Ob(1,"li"),b.Ob(2,"a"),b.Ob(3,"b"),b.Fc(4),b.Nb(),b.Fc(5),b.Zb(6,"number"),b.Nb(),b.Nb(),b.Nb()),2&t){const t=e.$implicit;b.xb(4),b.Hc("",t.evaluation_concept,": "),b.xb(1),b.Gc(b.bc(6,2,t.average,"1.1-2"))}}function C(t,e){if(1&t&&(b.Ob(0,"div",25),b.Dc(1,P,7,5,"div",13),b.Nb()),2&t){const t=e.$implicit;b.xb(1),b.fc("ngForOf",t.concept_evaluations)}}function A(t,e){if(1&t&&(b.Mb(0),b.Ob(1,"ul"),b.Ob(2,"li"),b.Ob(3,"a"),b.Fc(4),b.Nb(),b.Nb(),b.Nb(),b.Lb()),2&t){const t=b.Yb().$implicit;b.xb(4),b.Hc("",t.schema,".")}}function L(t,e){}function J(t,e){if(1&t&&(b.Ob(0,"div"),b.Dc(1,A,5,1,"ng-container",23),b.Dc(2,L,0,0,"ng-template",null,24,b.Ec),b.Nb()),2&t){const t=e.$implicit,i=b.tc(3);b.xb(1),b.fc("ngIf",t.schema.includes("accessibilityHazard:"))("ngIfElse",i)}}function H(t,e){if(1&t&&(b.Ob(0,"div"),b.Dc(1,J,4,2,"div",13),b.Nb()),2&t){const t=e.$implicit;b.xb(1),b.fc("ngForOf",t.question_evaluations)}}function M(t,e){if(1&t&&(b.Ob(0,"div"),b.Dc(1,H,2,1,"div",13),b.Nb()),2&t){const t=e.$implicit;b.xb(1),b.fc("ngForOf",t.concept_evaluations)}}function R(t,e){1&t&&(b.Ob(0,"tr"),b.Ob(1,"th"),b.Fc(2,"Metadatos"),b.Nb(),b.Ob(3,"th"),b.Fc(4,"Concuerda con el Experto"),b.Nb(),b.Ob(5,"th"),b.Fc(6,"Incluir/Quitar"),b.Nb(),b.Nb())}function G(t,e){if(1&t&&(b.Ob(0,"tr"),b.Ob(1,"td",29),b.Fc(2),b.Nb(),b.Ob(3,"td",29),b.Fc(4),b.Nb(),b.Ob(5,"td",29),b.Fc(6),b.Nb(),b.Nb()),2&t){const t=e.$implicit;b.xb(2),b.Hc(" ",t.id," "),b.xb(2),b.Hc(" ",t.concuerdan," "),b.xb(2),b.Hc(" ",t.faltan," ")}}function k(t,e){if(1&t&&b.Dc(0,G,7,3,"tr",13),2&t){const t=b.Yb(3);b.fc("ngForOf",t.colsAnswer)}}function Y(t,e){if(1&t&&(b.Ob(0,"div"),b.Ob(1,"p-table",26),b.Dc(2,R,7,0,"ng-template",27),b.Dc(3,k,1,1,"ng-template",28),b.Nb(),b.Nb()),2&t){const t=b.Yb(2);b.xb(1),b.fc("columns",t.te)("value",t.te)}}function z(t,e){if(1&t&&(b.Ob(0,"div"),b.Ob(1,"div",5),b.Ob(2,"p-tabView"),b.Ob(3,"p-tabPanel",12),b.Ob(4,"h5"),b.Ob(5,"a"),b.Fc(6,"Aspectos Positivos de la Evaluacion"),b.Nb(),b.Nb(),b.Dc(7,j,2,1,"div",13),b.Nb(),b.Ob(8,"p-tabPanel",14),b.Ob(9,"h5"),b.Ob(10,"a"),b.Fc(11,"Aspectos Regulares de la Evaluacion"),b.Nb(),b.Nb(),b.Dc(12,y,2,1,"div",13),b.Nb(),b.Ob(13,"p-tabPanel",15),b.Ob(14,"h5"),b.Ob(15,"a"),b.Fc(16,"Aspectos de la Evaluacion mal implementados "),b.Nb(),b.Nb(),b.Dc(17,S,2,1,"div",13),b.Nb(),b.Ob(18,"p-tabPanel",16),b.Ob(19,"p-panel",17),b.Ob(20,"div"),b.Ob(21,"a"),b.Fc(22),b.Nb(),b.Nb(),b.Jb(23,"br"),b.Ob(24,"div",4),b.Ob(25,"div",5),b.Ob(26,"div",1),b.Ob(27,"div",18),b.Ob(28,"h6"),b.Ob(29,"a"),b.Fc(30,"Resiltado Calificacion Areas de Evaluacion"),b.Nb(),b.Nb(),b.Dc(31,C,2,1,"div",19),b.Nb(),b.Ob(32,"div",18),b.Ob(33,"b"),b.Ob(34,"a"),b.Fc(35,"Peligros de Accesibilidad Identificados"),b.Nb(),b.Nb(),b.Dc(36,M,2,1,"div",13),b.Nb(),b.Nb(),b.Nb(),b.Nb(),b.Ob(37,"div",20),b.Ob(38,"p",20),b.Ob(39,"a"),b.Fc(40,"Tabla Comparativa de Metadatos de Accesibilidad"),b.Nb(),b.Nb(),b.Ob(41,"div",21),b.Dc(42,Y,4,2,"div",2),b.Nb(),b.Nb(),b.Ob(43,"div"),b.Jb(44,"br"),b.Ob(45,"a"),b.Fc(46,"Para realizar la correccion de los metadatos te recomendamos usar la herramienta de lompad Web para tus objetos de aprendizaje"),b.Nb(),b.Jb(47,"br"),b.Ob(48,"A",22),b.Ob(49,"a"),b.Ob(50,"b"),b.Fc(51,"Enlace->"),b.Nb(),b.Nb(),b.Fc(52,"https://www.google.com"),b.Nb(),b.Nb(),b.Nb(),b.Nb(),b.Nb(),b.Nb(),b.Nb()),2&t){const t=b.Yb();b.xb(3),b.gc("tooltip",t.topyes),b.xb(4),b.fc("ngForOf",t.resultsEv),b.xb(1),b.gc("tooltip",t.toppartially),b.xb(4),b.fc("ngForOf",t.resultsEv),b.xb(1),b.gc("tooltip",t.topno),b.xb(4),b.fc("ngForOf",t.resultsEv),b.xb(5),b.Hc("A continuacion se muestran aquellos metadatos que estan incluidos dentro del objeto de aprendizaje llamado ",null==t.objectData?null:t.objectData.slug,", y aquelos metadatos identificados por parte de la evaluacion realizada por el experto."),b.xb(9),b.fc("ngForOf",t.resultsEv),b.xb(5),b.fc("ngForOf",t.resultsEv),b.xb(6),b.fc("ngIf",(null==t.colsAnswer?null:t.colsAnswer.length)>0)}}function T(t,e){if(1&t&&(b.Mb(0),b.Ob(1,"a"),b.Ob(2,"b"),b.Fc(3,"Pauta de Evaluacion->"),b.Nb(),b.Fc(4),b.Nb(),b.Ob(5,"ul"),b.Ob(6,"ol"),b.Ob(7,"a"),b.Fc(8),b.Nb(),b.Nb(),b.Nb(),b.Lb()),2&t){const t=b.Yb().$implicit,e=b.Yb().$implicit;b.xb(4),b.Hc("",e.guideline_pr,":"),b.xb(4),b.Gc(t.interpreter_st_yes)}}function U(t,e){}function Q(t,e){if(1&t&&(b.Ob(0,"div"),b.Dc(1,T,9,2,"ng-container",23),b.Dc(2,U,0,0,"ng-template",null,24,b.Ec),b.Nb()),2&t){const t=e.$implicit,i=b.tc(3);b.xb(1),b.fc("ngIf","Si"==t.qualification)("ngIfElse",i)}}function B(t,e){if(1&t&&(b.Ob(0,"div"),b.Dc(1,Q,4,2,"div",13),b.Jb(2,"br"),b.Nb()),2&t){const t=e.$implicit;b.xb(1),b.fc("ngForOf",t.guideline_evaluations)}}function Z(t,e){if(1&t&&(b.Ob(0,"div"),b.Ob(1,"h5"),b.Ob(2,"a"),b.Fc(3),b.Nb(),b.Nb(),b.Dc(4,B,3,1,"div",13),b.Nb()),2&t){const t=e.$implicit;b.xb(3),b.Gc(t.evaluation_principle.principle),b.xb(1),b.fc("ngForOf",t.principle_gl)}}function V(t,e){if(1&t&&(b.Ob(0,"div"),b.Dc(1,Z,5,2,"div",13),b.Nb()),2&t){const t=e.$implicit;b.xb(1),b.fc("ngForOf",t.evaluation_students)}}function X(t,e){if(1&t&&(b.Mb(0),b.Ob(1,"li",33),b.Ob(2,"a"),b.Ob(3,"b"),b.Fc(4,"Pauta de Evaluacion->"),b.Nb(),b.Fc(5),b.Nb(),b.Nb(),b.Ob(6,"ul"),b.Ob(7,"ol"),b.Ob(8,"a"),b.Fc(9),b.Nb(),b.Nb(),b.Nb(),b.Lb()),2&t){const t=b.Yb().$implicit,e=b.Yb().$implicit;b.xb(5),b.Hc("",e.guideline_pr,":"),b.xb(4),b.Gc(t.interpreter_st_partially)}}function W(t,e){}function K(t,e){if(1&t&&(b.Ob(0,"div"),b.Dc(1,X,10,2,"ng-container",23),b.Dc(2,W,0,0,"ng-template",null,24,b.Ec),b.Nb()),2&t){const t=e.$implicit,i=b.tc(3);b.xb(1),b.fc("ngIf","Parcialmente"==t.qualification)("ngIfElse",i)}}function tt(t,e){if(1&t&&(b.Ob(0,"div"),b.Dc(1,K,4,2,"div",13),b.Jb(2,"br"),b.Nb()),2&t){const t=e.$implicit;b.xb(1),b.fc("ngForOf",t.guideline_evaluations)}}function et(t,e){if(1&t&&(b.Ob(0,"div"),b.Ob(1,"h5"),b.Ob(2,"a"),b.Fc(3),b.Nb(),b.Nb(),b.Dc(4,tt,3,1,"div",13),b.Nb()),2&t){const t=e.$implicit;b.xb(3),b.Gc(t.evaluation_principle.principle),b.xb(1),b.fc("ngForOf",t.principle_gl)}}function it(t,e){if(1&t&&(b.Ob(0,"div"),b.Dc(1,et,5,2,"div",13),b.Nb()),2&t){const t=e.$implicit;b.xb(1),b.fc("ngForOf",t.evaluation_students)}}function at(t,e){if(1&t&&(b.Mb(0),b.Ob(1,"li",33),b.Ob(2,"a"),b.Ob(3,"b"),b.Fc(4,"Pauta de Evaluacion->"),b.Nb(),b.Fc(5),b.Nb(),b.Nb(),b.Ob(6,"ul"),b.Ob(7,"ol"),b.Ob(8,"a"),b.Fc(9),b.Nb(),b.Nb(),b.Nb(),b.Lb()),2&t){const t=b.Yb().$implicit,e=b.Yb().$implicit;b.xb(5),b.Hc("",e.guideline_pr,":"),b.xb(4),b.Gc(t.interpreter_st_no)}}function nt(t,e){}function ct(t,e){if(1&t&&(b.Ob(0,"div"),b.Dc(1,at,10,2,"ng-container",23),b.Dc(2,nt,0,0,"ng-template",null,24,b.Ec),b.Nb()),2&t){const t=e.$implicit,i=b.tc(3);b.xb(1),b.fc("ngIf","No"==t.qualification)("ngIfElse",i)}}function ot(t,e){if(1&t&&(b.Ob(0,"div"),b.Dc(1,ct,4,2,"div",13),b.Jb(2,"br"),b.Nb()),2&t){const t=e.$implicit;b.xb(1),b.fc("ngForOf",t.guideline_evaluations)}}function bt(t,e){if(1&t&&(b.Ob(0,"div"),b.Ob(1,"h5"),b.Ob(2,"a"),b.Fc(3),b.Nb(),b.Nb(),b.Dc(4,ot,3,1,"div",13),b.Nb()),2&t){const t=e.$implicit;b.xb(3),b.Gc(t.evaluation_principle.principle),b.xb(1),b.fc("ngForOf",t.principle_gl)}}function lt(t,e){if(1&t&&(b.Ob(0,"div"),b.Dc(1,bt,5,2,"div",13),b.Nb()),2&t){const t=e.$implicit;b.xb(1),b.fc("ngForOf",t.evaluation_students)}}function st(t,e){if(1&t&&(b.Ob(0,"div"),b.Ob(1,"h5"),b.Fc(2,"Estudiante"),b.Nb(),b.Ob(3,"p-tabView"),b.Ob(4,"p-tabPanel",30),b.Ob(5,"h5"),b.Ob(6,"a"),b.Fc(7,"Aspectos Positivos de la Evaluacion del alumno"),b.Nb(),b.Nb(),b.Dc(8,V,2,1,"div",13),b.Nb(),b.Ob(9,"p-tabPanel",31),b.Ob(10,"h5"),b.Ob(11,"a"),b.Fc(12,"Aspectos Regulares de la evaluacion identificados por el estudiante"),b.Nb(),b.Nb(),b.Dc(13,it,2,1,"div",13),b.Nb(),b.Ob(14,"p-tabPanel",32),b.Ob(15,"h5"),b.Ob(16,"a"),b.Fc(17,"Aspectos negativos identificados por el estudiante"),b.Nb(),b.Nb(),b.Dc(18,lt,2,1,"div",13),b.Nb(),b.Nb(),b.Nb()),2&t){const t=b.Yb();b.xb(4),b.gc("tooltip",t.Stopyes),b.xb(4),b.fc("ngForOf",t.resultsEvStudent),b.xb(1),b.gc("tooltip",t.Stoppartially),b.xb(4),b.fc("ngForOf",t.resultsEvStudent),b.xb(1),b.gc("tooltip",t.Stopno),b.xb(4),b.fc("ngForOf",t.resultsEvStudent)}}const rt=function(){return{"background-color":"cadetblue",color:"#ffffff"}},ut=[{path:"",pathMatch:"full",redirectTo:"/"},{path:":slug",component:(()=>{class t{constructor(t,e,i){this.objectService=t,this.route=e,this.loginService=i,this.te=[1],this.metadataEv=[],this.metadataOb=[],this.colsAnswer=[],this.route.params.subscribe(t=>{this.getObjectDetail(t.slug)}),this.route.queryParams.subscribe(t=>{this.validtotal=t.rstudent})}ngOnInit(){}showBasicDialogObject(){this.displayWindowobject=!0}showBasicDialogMetadata(){this.displayWindowmetadata=!0}getObjectDetail(t){return Object(o.a)(this,void 0,void 0,function*(){yield this.objectService.getObjectDetail(t).subscribe(t=>{this.objectData=t,this.loadstudent(this.objectData.id);let e=[];Object.keys(this.objectData).forEach(t=>{(t.includes("accesibility")||t.includes("annotation_mode"))&&e.push((t+": "+this.objectData[t]).replace("_",""))});let i=[];e.forEach(t=>{var e=t.split(":");e[1].split(",").forEach(t=>{var a=e[0].replace("accesibilityfeatures","accessibilityfeature").replace("accesibilitycontrol","accessibilitycontrol").replace("accesibilityhazard","accessibilityhazard").replace("annotationmodeaccess","accesmode").replace("accesibilityapi","accessibilityapi").replace("accesibilitysummary","accessibilitysummary");i.push(a.toLowerCase()+":"+t.trim().toLowerCase())})}),this.loadDataExpert(this.objectData.id,i)},t=>{console.log("err",t)})})}loadDataExpert(t,e){return Object(o.a)(this,void 0,void 0,function*(){yield this.objectService.getResultsEvaluation(t).subscribe(t=>{this.resultsEv=t.results.map(t=>({observation:t.observation,concept_evaluations:t.concept_evaluations.map(t=>({average:t.average,evaluation_concept:t.evaluation_concept.concept,question_evaluations:t.question_evaluations.map(t=>({question:t.question,schema:t.schema,qualification:t.qualification,interpreter_yes:t.interpreter_yes,interpreter_partially:t.interpreter_partially,interpreter_no:t.interpreter_no}))}))})),this.resultsEv=this.resultsEv;var i=0,a=0,n=0;this.resultsEv.forEach(t=>{this.observationexpert=t.observation,t.concept_evaluations.forEach(t=>{t.question_evaluations.forEach(t=>{"Si"==t.qualification&&(i+=1),"Parcialmente"==t.qualification&&(a+=1),"No"==t.qualification&&(n+=1),this.metadataEv.push(t.schema)})})}),this.topyes=i,this.topno=n,this.toppartially=a;let c=[];this.resultsEv.forEach(t=>{t.concept_evaluations.forEach(t=>{t.question_evaluations.forEach(t=>{e.includes(t.schema.toLowerCase())&&"Si"==t.qualification||e.includes(t.schema.toLowerCase())&&"Parcialmente"==t.qualification?c.push("Si"):e.includes(t.schema.toLowerCase())||"No"!=t.qualification?(!e.includes(t.schema.toLowerCase())&&"Si"==t.qualification||!e.includes(t.schema.toLowerCase())&&"Parcialmente"==t.qualification||e.includes(t.schema.toLowerCase())&&"No"==t.qualification)&&c.push("No"):c.push("Si")})})}),console.log("elemento",c);let o=[];this.resultsEv.forEach(t=>{this.observationexpert=t.observation,t.concept_evaluations.forEach(t=>{t.question_evaluations.forEach(t=>{!e.includes(t.schema.toLowerCase())&&"Si"==t.qualification||!e.includes(t.schema.toLowerCase())&&"Parcialmente"==t.qualification?o.push("incluir"):e.includes(t.schema.toLowerCase())&&"No"==t.qualification?o.push("quitar"):e.includes(t.schema.toLowerCase())&&"Si"==t.qualification||e.includes(t.schema.toLowerCase())&&"Parcialmente"==t.qualification?o.push(" "):e.includes(t.schema.toLowerCase())||"No"!=t.qualification||o.push(" ")})})});for(let e=0;e<this.metadataEv.length;e++)""==this.metadataEv[e]||this.colsAnswer.push({id:this.metadataEv[e],concuerdan:c[e],faltan:o[e]})})})}loadstudent(t){return Object(o.a)(this,void 0,void 0,function*(){yield this.objectService.getObjectResultsPublicEvaluationStudent(t).subscribe(t=>{this.resultsEvStudent=t.results.map(t=>({rating_student:t.rating,observation:t.observation,evaluation_students:t.evaluation_students.map(t=>({average_principle:t.average_principle,evaluation_principle:t.evaluation_principle,principle_gl:t.principle_gl.map(t=>({average_guideline:t.average_guideline,guideline_pr:t.guideline_pr.guideline,guideline_evaluations:t.guideline_evaluations.map(t=>({question:t.question,qualification:t.qualification,interpreter_st_yes:t.interpreter_st_yes,interpreter_st_no:t.interpreter_st_no,interpreter_st_partially:t.interpreter_st_partially,metadata:t.metadata}))}))}))})),this.resultsEvStudent=this.resultsEvStudent;var e=0,i=0,a=0;this.resultsEvStudent.forEach(t=>{this.observationstudent=t.observation,t.evaluation_students.forEach(t=>{t.principle_gl.forEach(t=>{t.guideline_evaluations.forEach(t=>{"Si"==t.qualification&&(e+=1),"No"==t.qualification&&(a+=1),"Parcialmente"==t.qualification&&(i+=1)})})})}),this.Stopyes=e,this.Stopno=a,this.Stoppartially=i})})}}return t.\u0275fac=function(e){return new(e||t)(b.Ib(l.a),b.Ib(c.a),b.Ib(s.a))},t.\u0275cmp=b.Cb({type:t,selectors:[["app-reports"]],decls:99,vars:31,consts:[[1,"main-content"],[1,"p-grid"],[4,"ngIf"],[1,"p-col-12","p-md-12"],[1,"accordion-body"],[1,"card"],[1,"p-col-12","p-md-1"],["severity","success","styleClass","p-mr-9","size","xlarge",3,"label"],[1,"p-col-12","p-md-7"],["SIZE","3"],[1,"p-col-12","p-md-4"],["width","135","height","135","align","right","loading","lazy",3,"src"],["leftIcon","pi pi-comments","header","Bueno",3,"tooltip"],[4,"ngFor","ngForOf"],["leftIcon","pi pi-comments","header","Regular",3,"tooltip"],["leftIcon","pi pi-comments","header","Malo",3,"tooltip"],["leftIcon","pi pi-book","header","General"],["header","Resumen de Metadatos"],[1,"p-col-12","p-md-6"],["class","tableP",4,"ngFor","ngForOf"],["align","center"],["align","center",1,"p-col-12","p-md-12"],["HREF","https://www.google.com","target","_blank"],[4,"ngIf","ngIfElse"],["editTemplate",""],[1,"tableP"],["styleClass","p-datatable-gridlines",1,"table",3,"columns","value"],["pTemplate","header"],["pTemplate","body"],[1,"tdid"],["header","Bueno","leftIcon","pi pi-comments",3,"tooltip"],["header","Regular","leftIcon","pi pi-comments",3,"tooltip"],["header","Malo","leftIcon","pi pi-comments",3,"tooltip"],["type","square"]],template:function(t,e){1&t&&(b.Ob(0,"div",0),b.Ob(1,"div",1),b.Dc(2,f,3,0,"div",2),b.Dc(3,O,3,0,"div",2),b.Ob(4,"div",3),b.Ob(5,"div",4),b.Ob(6,"div",5),b.Ob(7,"h3"),b.Ob(8,"b"),b.Fc(9,"T\xedtulo:"),b.Nb(),b.Fc(10),b.Nb(),b.Ob(11,"div",1),b.Ob(12,"div",6),b.Jb(13,"p-avatar",7),b.Zb(14,"number"),b.Nb(),b.Ob(15,"div",8),b.Ob(16,"li"),b.Ob(17,"a"),b.Ob(18,"FONT",9),b.Ob(19,"b"),b.Fc(20,"\xc1reas de Conocimiento:"),b.Nb(),b.Fc(21),b.Nb(),b.Jb(22,"i"),b.Nb(),b.Nb(),b.Ob(23,"li"),b.Ob(24,"a"),b.Ob(25,"FONT",9),b.Ob(26,"b"),b.Fc(27,"Desarrollado por:"),b.Nb(),b.Fc(28),b.Nb(),b.Jb(29,"i"),b.Nb(),b.Nb(),b.Ob(30,"li"),b.Ob(31,"a"),b.Ob(32,"FONT",9),b.Ob(33,"b"),b.Fc(34,"Fecha de Publicaci\xf3n:"),b.Nb(),b.Fc(35),b.Zb(36,"date"),b.Nb(),b.Jb(37,"i"),b.Nb(),b.Nb(),b.Ob(38,"li"),b.Ob(39,"a"),b.Ob(40,"FONT",9),b.Ob(41,"b"),b.Fc(42,"Cobertura:"),b.Nb(),b.Fc(43),b.Nb(),b.Jb(44,"i"),b.Nb(),b.Nb(),b.Ob(45,"li"),b.Ob(46,"a"),b.Ob(47,"FONT",9),b.Ob(48,"b"),b.Fc(49,"Requerimientos:"),b.Nb(),b.Fc(50),b.Nb(),b.Jb(51,"i"),b.Nb(),b.Nb(),b.Nb(),b.Ob(52,"div",10),b.Jb(53,"img",11),b.Nb(),b.Nb(),b.Nb(),b.Ob(54,"div"),b.Ob(55,"p"),b.Ob(56,"a"),b.Ob(57,"b"),b.Fc(58,"Descripcion:"),b.Nb(),b.Ob(59,"a"),b.Fc(60),b.Nb(),b.Nb(),b.Jb(61,"br"),b.Ob(62,"a"),b.Ob(63,"b"),b.Fc(64,"Objetivo:"),b.Nb(),b.Fc(65),b.Nb(),b.Jb(66,"br"),b.Ob(67,"a"),b.Ob(68,"b"),b.Fc(69,"Palabras Clave:"),b.Nb(),b.Fc(70),b.Nb(),b.Jb(71,"br"),b.Ob(72,"a"),b.Ob(73,"b"),b.Fc(74,"Ubicaci\xf3n t\xe9cnica :"),b.Nb(),b.Fc(75),b.Nb(),b.Jb(76,"br"),b.Ob(77,"a"),b.Ob(78,"b"),b.Fc(79,"Cat\xe1logo :"),b.Nb(),b.Fc(80),b.Nb(),b.Jb(81,"br"),b.Ob(82,"a"),b.Ob(83,"b"),b.Fc(84,"Dificultad :"),b.Nb(),b.Fc(85),b.Nb(),b.Jb(86,"br"),b.Ob(87,"a"),b.Ob(88,"b"),b.Fc(89,"Idioma:"),b.Nb(),b.Fc(90),b.Nb(),b.Jb(91,"br"),b.Dc(92,v,4,1,"a",2),b.Jb(93,"br"),b.Dc(94,g,4,1,"a",2),b.Jb(95,"br"),b.Nb(),b.Nb(),b.Jb(96,"br"),b.Dc(97,z,53,10,"div",2),b.Dc(98,st,19,6,"div",2),b.Nb(),b.Nb(),b.Nb(),b.Nb()),2&t&&(b.xb(2),b.fc("ngIf",!e.validtotal),b.xb(1),b.fc("ngIf",e.validtotal),b.xb(7),b.Hc(" ",null==e.objectData?null:e.objectData.slug,""),b.xb(3),b.Bc(b.ic(30,rt)),b.gc("label",b.bc(14,24,null==e.objectData?null:e.objectData.rating,"1.1-2")),b.xb(8),b.Hc(" ",null==e.objectData?null:e.objectData.knowledge_area.name,""),b.xb(7),b.Ic(" ",null==e.objectData?null:e.objectData.user_created.first_name," ",null==e.objectData?null:e.objectData.user_created.last_name,""),b.xb(7),b.Hc(" ",b.bc(36,27,null==e.objectData?null:e.objectData.created,"MM/dd/yyyy"),""),b.xb(8),b.Hc(" ",null==e.objectData?null:e.objectData.general_coverage,""),b.xb(7),b.Hc(" ",null==e.objectData?null:e.objectData.technical_installationRremarks,""),b.xb(3),b.fc("src",null==e.objectData?null:e.objectData.avatar,b.xc),b.xb(7),b.Gc(null==e.objectData?null:e.objectData.general_description),b.xb(5),b.Hc(" ",null==e.objectData?null:e.objectData.educational_description,""),b.xb(5),b.Hc(" ",null==e.objectData?null:e.objectData.general_keyword,""),b.xb(5),b.Hc(" ",null==e.objectData?null:e.objectData.technical_location,""),b.xb(5),b.Hc(" ",null==e.objectData?null:e.objectData.relation_catalog,""),b.xb(5),b.Hc(" ",null==e.objectData?null:e.objectData.educational_difficulty,""),b.xb(5),b.Hc(" ",null==e.objectData?null:e.objectData.general_language,""),b.xb(2),b.fc("ngIf",!e.validtotal),b.xb(2),b.fc("ngIf",e.validtotal),b.xb(3),b.fc("ngIf",!e.validtotal),b.xb(1),b.fc("ngIf",e.validtotal))},directives:[a.l,n.a,r.b,r.a,a.k,u.a,p.b,d.j],pipes:[a.e,a.d],styles:["[_nghost-%COMP%]     .p-tabview-nav li:first-child a{color:#2e8b57!important}[_nghost-%COMP%]     .p-tabview-nav li:nth-child(2) a{color:sienna!important}[_nghost-%COMP%]     .p-tabview-nav li:nth-child(3) a{color:red!important}.tdid[_ngcontent-%COMP%]{overflow:hidden}[_nghost-%COMP%]     table{width:auto!important;background-color:#0ff}"]}),t})(),data:{breadcrumb:null}}];let pt=(()=>{class t{}return t.\u0275mod=b.Gb({type:t}),t.\u0275inj=b.Fb({factory:function(e){return new(e||t)},imports:[[c.h.forChild(ut)],c.h]}),t})();var dt=i("jeV5"),ft=i("ZZi9"),Ot=i("/RsI"),vt=i("jIHw"),gt=i("PCNd"),ht=i("QGhL");let Nt=(()=>{class t{}return t.\u0275mod=b.Gb({type:t}),t.\u0275inj=b.Fb({factory:function(e){return new(e||t)},imports:[[a.b,pt,n.b,dt.b,ft.a,u.b,r.c,Ot.b,vt.c,gt.a,ht.a]]}),t})()},QGhL:function(t,e,i){"use strict";i.d(e,"a",function(){return b});var a=i("ofXK"),n=i("PCNd"),c=i("3Pt+"),o=i("fXoL");let b=(()=>{class t{}return t.\u0275mod=o.Gb({type:t}),t.\u0275inj=o.Fb({factory:function(e){return new(e||t)},imports:[[a.b,n.a,c.n]]}),t})()},t3rE:function(t,e,i){"use strict";i.d(e,"a",function(){return r});var a=i("lJxs"),n=i("AytR"),c=i("uUT0"),o=i("fXoL"),b=i("tk/3"),l=i("n90K");const s=n.a.baseUrl;let r=(()=>{class t{constructor(t,e){this.http=t,this.storageService=e}getLearningObject(){return this.http.get(s+"/areas-de-conocimiento/").pipe(Object(a.a)(t=>t))}uploadObject(t){let e=new FormData;return e.append("file",t),this.http.post(s+"/learning-object-file/",e)}get urlUpload(){return s+"/learning-object-file/"}getObjectDetail(t){return this.http.get(`${s}/learning-object/${t}`)}getObjectDetailById(t){return this.http.get(`${s}/learning-object-metadata/${t}/`)}getComments(t){return this.http.get(`${s}/learning-objects/comments/${t}`)}addComent(t){return this.http.post(s+"/learning-object/create/commentary/",t)}addMetadata(t){let e=Object(c.serialize)(t);return this.http.post(s+"/learning-object-metadata/",e)}editMetadata(t){let e=Object(c.serialize)(t);return this.http.patch(`${s}/learning-object-metadata/${t.id}/`,e)}sendQualificationExpert(t){return this.http.post(s+"/learning-objects/register-evaluation-expert/",t)}sendQualificationExpertUpdate(t,e){return this.http.put(`${s}/learning-objects/register-evaluation-expert/${e}/`,t)}sendQualificationStudent(t){return this.http.post(s+"/learning-objects/student-evaluation/",t)}sendQualificationStudentUpdate(t,e){return this.http.put(`${s}/learning-objects/student-evaluation/${e}/`,t)}validateLike(t){return this.http.get(`${s}/learning-objects/liked/${t}`)}getRecommendedObjects(){return this.http.get(s+"/learning-objects/recommended/")}getResultsEvaluation(t){return this.http.get(`${s}/learning-objects/evaluations-result-expert/${t}`).pipe(Object(a.a)(t=>t))}interactionLike(t){return this.http.put(`${s}/object-learning/interaction/${t.id}/`,t)}interactionView(t){return this.http.post(s+"/object-learning/interaction/",t)}getObjectsTeacher(){return this.http.get(s+"/learning-objects/observation/")}getObjectsViewed(){return this.http.get(s+"/learning-objects/viewed/")}getObjectResultsEvaluation(t){return this.http.get(`${s}/learning-objects/evaluations-result-to-expert/${t}/`).pipe(Object(a.a)(t=>t))}getObjectResultsEvaluationStudent(t){return this.http.get(`${s}/learning-objects/student/result-to-student/${t}/`).pipe(Object(a.a)(t=>t))}getObjectResultsEvaluationAutomatic(t){return this.http.get(`${s}/learning-objects/evaluations-result-to-expert-automatic/${t}/`).pipe(Object(a.a)(t=>t))}getObjectResultsPublicEvaluationStudent(t){return this.http.get(`${s}/learning-objects/student/result-to-public-student/${t}/`).pipe(Object(a.a)(t=>t))}getPopulars(){return this.http.get(s+"/learning-objects/populars/").pipe(Object(a.a)(t=>t))}searchExpertNoRated(){return this.http.get(s+"/learning-objects/expert-collaborator/no-rated/").pipe(Object(a.a)(t=>t))}}return t.\u0275fac=function(e){return new(e||t)(o.Sb(b.b),o.Sb(l.a))},t.\u0275prov=o.Eb({token:t,factory:t.\u0275fac,providedIn:"root"}),t})()},uUT0:function(t,e){const i=t=>void 0===t,a=t=>Array.isArray(t),n=t=>t&&"number"==typeof t.size&&"string"==typeof t.type&&"function"==typeof t.slice,c=(t,e,o,b)=>((e=e||{}).indices=!i(e.indices)&&e.indices,e.nullsAsUndefineds=!i(e.nullsAsUndefineds)&&e.nullsAsUndefineds,e.booleansAsIntegers=!i(e.booleansAsIntegers)&&e.booleansAsIntegers,e.allowEmptyArrays=!i(e.allowEmptyArrays)&&e.allowEmptyArrays,o=o||new FormData,i(t)||(null===t?e.nullsAsUndefineds||o.append(b,""):"boolean"==typeof t?o.append(b,e.booleansAsIntegers?t?1:0:t):a(t)?t.length?t.forEach((t,i)=>{c(t,e,o,b+"["+(e.indices?i:"")+"]")}):e.allowEmptyArrays&&o.append(b+"[]",""):t instanceof Date?o.append(b,t.toISOString()):!(t=>t===Object(t))(t)||(t=>n(t)&&"string"==typeof t.name&&("object"==typeof t.lastModifiedDate||"number"==typeof t.lastModified))(t)||n(t)?o.append(b,t):Object.keys(t).forEach(i=>{const n=t[i];if(a(n))for(;i.length>2&&i.lastIndexOf("[]")===i.length-2;)i=i.substring(0,i.length-2);c(n,e,o,b?b+"["+i+"]":i)})),o);t.exports={serialize:c}}}]);