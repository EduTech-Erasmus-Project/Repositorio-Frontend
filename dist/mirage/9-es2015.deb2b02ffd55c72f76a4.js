(window.webpackJsonp=window.webpackJsonp||[]).push([[9],{OARx:function(e,t,a){"use strict";a.r(t),a.d(t,"EditObjectModule",function(){return Y});var n=a("ofXK"),i=a("tyNb"),o=a("mrSG"),r=a("3Pt+"),l=a("fXoL"),c=a("rj1t"),s=a("t3rE"),b=a("l3hs"),d=a("7zfz"),u=a("Gxio"),p=a("7kUa"),m=a("zFJ7"),g=a("arFO"),h=a("+la4"),f=a("LuMj"),_=a("NCSE"),y=a("jIHw"),v=a("Q4Mo"),O=a("/RsI"),j=a("lUkA");let x=(()=>{class e{constructor(e,t,a){this.fb=e,this.objectService=t,this.messageService=a,this.clouceEvent=new l.n,this.updateEvent=new l.n,this.subscribes=[]}ngOnInit(){this.loadForm()}ngOnDestroy(){this.subscribes.forEach(e=>{e.unsubscribe()})}loadForm(){this.metadataForm=this.fb.group({general_catalog:[this.object.general_catalog||null],general_coverage:[this.object.general_coverage||null],general_entry:[this.object.general_entry||null],general_keyword:[this.object.general_keyword||null],general_language:[this.object.general_language||null],general_structure:[this.object.general_structure||null],life_cycle_role:[this.object.life_cycle_role||null],life_cycle_version:[this.object.life_cycle_version||null],meta_metadata_catalog:[this.object.meta_metadata_catalog||null],meta_metadata_description:[this.object.meta_metadata_description||null],meta_metadata_dateTime:[this.object.meta_metadata_dateTime||null],technical_description:[this.object.technical_description||null],technical_format:[this.object.technical_format||null],technical_installationRremarks:[this.object.technical_installationRremarks||null],technical_location:[this.object.technical_location||null],educational_description:[this.object.educational_description||null],educational_difficulty:[this.object.educational_difficulty||null],educational_language:[this.object.educational_language||null],educational_learningResourceType:[this.object.educational_learningResourceType||null],educational_procces_cognitve:[this.object.educational_procces_cognitve||null],educational_typicalLearningTime_description:[this.object.educational_typicalLearningTime_description||null],rights_copyrightAndOtherRestrictions:[this.object.rights_copyrightAndOtherRestrictions||null],annotation_date_description:[this.object.annotation_date_description||null],annotation_date_dateTime:[this.object.annotation_date_dateTime||null],annotation_description:[this.object.annotation_description||null],annotation_entity:[this.object.annotation_entity||null],annotation_modeaccess:[this.object.annotation_modeaccess||null],annotation_modeaccesssufficient:[this.object.annotation_modeaccesssufficient||null],relation_catalog:[this.object.relation_catalog||null],relation_description:[this.object.relation_description||null],relation_kind:[this.object.relation_kind||null],relation_entry:[this.object.relation_entry||null],classification_description:[this.object.classification_description||null],classification_keyword:[this.object.classification_keyword||null],classification_purpose:[this.object.classification_purpose||null],classification_taxonPath_source:[this.object.classification_taxonPath_source||null],classification_taxonPath_taxon:[this.object.classification_taxonPath_taxon||null],accesibility_summary:[this.object.accesibility_summary||null],accesibility_features:[this.object.accesibility_features||null],accesibility_hazard:[this.object.accesibility_hazard||null],accesibility_control:[this.object.accesibility_control||null],accesibility_api:[this.object.accesibility_api||null],rights_cost:[this.object.rights_cost||null],annotation_rol:[this.object.annotation_rol||null]})}onEditmetadata(){return Object(o.a)(this,void 0,void 0,function*(){let e=this.metadataForm.value;e.id=this.object.id;let t=yield this.objectService.editMetadata(e).subscribe(e=>{this.updateEvent.emit(!0),this.messageService.add({severity:"success",summary:"Success",detail:"Se han actualizado los datos."})},e=>{console.log("err",e),this.messageService.add({severity:"error",summary:"Error",detail:"Se ah producido un error al guardar los datos, intente de nuevo"})});this.subscribes.push(t)})}onClouceWindow(){this.clouceEvent.emit(!1)}}return e.\u0275fac=function(t){return new(t||e)(l.Ib(r.b),l.Ib(s.a),l.Ib(d.h))},e.\u0275cmp=l.Cb({type:e,selectors:[["app-edit-metadata"]],inputs:{object:"object"},outputs:{clouceEvent:"clouceEvent",updateEvent:"updateEvent"},decls:179,vars:10,consts:[[3,"formGroup","ngSubmit"],[1,"content"],["pInputText","","type","text","formControlName","general_catalog","name","general_catalog"],["pInputText","","type","text","formControlName","general_coverage","name","general_coverage"],["pInputText","","type","text","formControlName","general_entry","name","general_entry"],["pInputText","","type","text","formControlName","general_keyword","name","general_keyword"],["pInputText","","type","text","formControlName","general_language","name","general_language"],["pInputText","","type","text","formControlName","general_structure","name","general_structure"],["layout","horizontal","align","left"],["pInputText","","type","text","formControlName","life_cycle_role","name","life_cycle_role"],["pInputText","","type","text","formControlName","life_cycle_version","name","life_cycle_version"],["pInputText","","type","text","formControlName","meta_metadata_catalog","name","meta_metadata_catalog"],["pInputText","","type","text","formControlName","meta_metadata_description","name","meta_metadata_description"],["pInputText","","type","text","formControlName","technical_description","name","technical_description"],["pInputText","","type","text","formControlName","technical_format","name","technical_format"],["pInputText","","type","text","formControlName","technical_installationRremarks","name","technical_installationRremarks"],["pInputText","","type","text","formControlName","technical_location"],["pInputText","","type","text","formControlName","educational_description","name","educational_description"],["pInputText","","type","text","formControlName","educational_difficulty","name","educational_difficulty"],["pInputText","","type","text","formControlName","educational_language","name","educational_language"],["pInputText","","type","text","formControlName","educational_learningResourceType"],["pInputText","","type","text","formControlName","educational_procces_cognitve","name","educational_procces_cognitve"],["pInputText","","type","text","formControlName","educational_typicalLearningTime_description"],["pInputText","","type","text","formControlName","rights_copyrightAndOtherRestrictions","name","rights_copyrightAndOtherRestrictions"],["pInputText","","type","text","formControlName","rights_cost","name","rights_cost"],["pInputText","","type","text","placeholder","Description","formControlName","annotation_date_description","name","annotation_date_description"],["pInputText","","type","text","placeholder","Date","formControlName","annotation_date_dateTime","name","annotation_date_dateTime"],["pInputText","","type","text","formControlName","annotation_description","name","annotation_description"],["pInputText","","type","text","formControlName","annotation_entity","name","annotation_entity"],["pInputText","","type","text","formControlName","annotation_modeaccess","name","annotation_modeaccess"],["pInputText","","type","text","formControlName","annotation_modeaccesssufficient","name","annotation_modeaccesssufficient"],["pInputText","","type","text","formControlName","annotation_rol","name","annotation_rol"],["pInputText","","type","text","formControlName","relation_catalog","name","relation_catalog"],["pInputText","","type","text","formControlName","relation_description","name","relation_description"],["pInputText","","type","text","formControlName","relation_kind","name","relation_kind"],["pInputText","","type","text","formControlName","relation_entry","name","relation_entry"],["pInputText","","type","text","formControlName","classification_description","name","classification_description"],["pInputText","","type","text","formControlName","classification_keyword","name","classification_keyword"],["pInputText","","type","text","formControlName","classification_purpose","name","classification_purpose"],["pInputText","","type","text","formControlName","classification_taxonPath_source","name","classification_taxonPath_source"],["pInputText","","type","text","formControlName","classification_taxonPath_taxon","name","classification_taxonPath_taxon"],["pInputText","","type","text","formControlName","accesibility_summary","name","accesibility_summary"],["pInputText","","type","text","formControlName","accesibility_features","name","accesibility_features"],["pInputText","","type","text","formControlName","accesibility_hazard","name","accesibility_hazard"],["pInputText","","type","text","formControlName","accesibility_control","name","accesibility_control"],["pInputText","","type","text","formControlName","accesibility_api","name","accesibility_api"],[1,"buttons"],["type","submit","label","Actualizar","styleClass","p-button-text"],["label","Cancelar","styleClass","p-button-text",3,"click"]],template:function(e,t){1&e&&(l.Ob(0,"form",0),l.Vb("ngSubmit",function(){return t.onEditmetadata()}),l.Ob(1,"div",1),l.Ob(2,"h6"),l.Fc(3,"General"),l.Nb(),l.Ob(4,"ul"),l.Ob(5,"li"),l.Fc(6,"Catalog: "),l.Jb(7,"input",2),l.Nb(),l.Ob(8,"li"),l.Fc(9,"Coverage: "),l.Jb(10,"input",3),l.Nb(),l.Ob(11,"li"),l.Fc(12,"Entry: "),l.Jb(13,"input",4),l.Nb(),l.Ob(14,"li"),l.Fc(15,"Keyword: "),l.Jb(16,"input",5),l.Nb(),l.Ob(17,"li"),l.Fc(18,"Language: "),l.Jb(19,"input",6),l.Nb(),l.Ob(20,"li"),l.Fc(21,"Structure: "),l.Jb(22,"input",7),l.Nb(),l.Nb(),l.Jb(23,"p-divider",8),l.Ob(24,"h6"),l.Fc(25,"Life Cycle"),l.Nb(),l.Ob(26,"ul"),l.Ob(27,"li"),l.Ob(28,"strong"),l.Fc(29),l.Nb(),l.Fc(30),l.Zb(31,"date"),l.Nb(),l.Ob(32,"li"),l.Fc(33,"Role: "),l.Jb(34,"input",9),l.Nb(),l.Ob(35,"li"),l.Fc(36,"Version: "),l.Jb(37,"input",10),l.Nb(),l.Nb(),l.Jb(38,"p-divider",8),l.Ob(39,"h6"),l.Fc(40,"Meta-Metadata"),l.Nb(),l.Ob(41,"ul"),l.Ob(42,"li"),l.Fc(43,"Catalog: "),l.Jb(44,"input",11),l.Nb(),l.Ob(45,"li"),l.Fc(46,"Description: "),l.Jb(47,"input",12),l.Fc(48),l.Zb(49,"date"),l.Nb(),l.Nb(),l.Jb(50,"p-divider",8),l.Ob(51,"h6"),l.Fc(52,"Technical"),l.Nb(),l.Ob(53,"ul"),l.Ob(54,"li"),l.Fc(55,"Description: "),l.Jb(56,"input",13),l.Nb(),l.Ob(57,"li"),l.Fc(58,"Format: "),l.Jb(59,"input",14),l.Nb(),l.Ob(60,"li"),l.Fc(61,"Installation remarks: "),l.Jb(62,"input",15),l.Nb(),l.Ob(63,"li"),l.Fc(64,"Location: "),l.Jb(65,"input",16),l.Nb(),l.Nb(),l.Jb(66,"p-divider",8),l.Ob(67,"h6"),l.Fc(68,"Educational"),l.Nb(),l.Ob(69,"ul"),l.Ob(70,"li"),l.Fc(71,"Description: "),l.Jb(72,"input",17),l.Nb(),l.Ob(73,"li"),l.Fc(74,"difficulty: "),l.Jb(75,"input",18),l.Nb(),l.Ob(76,"li"),l.Fc(77,"Language: "),l.Jb(78,"input",19),l.Nb(),l.Ob(79,"li"),l.Fc(80,"Learning resource Type: "),l.Jb(81,"input",20),l.Nb(),l.Ob(82,"li"),l.Fc(83,"Procces cognitve: "),l.Jb(84,"input",21),l.Nb(),l.Ob(85,"li"),l.Fc(86,"Description: "),l.Jb(87,"input",22),l.Nb(),l.Nb(),l.Jb(88,"p-divider",8),l.Ob(89,"h6"),l.Fc(90,"Rights"),l.Nb(),l.Ob(91,"ul"),l.Ob(92,"li"),l.Fc(93,"Copyright and Other Restrictions: "),l.Jb(94,"input",23),l.Nb(),l.Ob(95,"li"),l.Fc(96,"Cost: "),l.Jb(97,"input",24),l.Nb(),l.Nb(),l.Jb(98,"p-divider",8),l.Ob(99,"h6"),l.Fc(100,"Annotation"),l.Nb(),l.Ob(101,"ul"),l.Ob(102,"li"),l.Fc(103,"Annotation date: "),l.Jb(104,"input",25),l.Fc(105," | "),l.Jb(106,"input",26),l.Nb(),l.Ob(107,"li"),l.Fc(108,"Description: "),l.Jb(109,"input",27),l.Nb(),l.Ob(110,"li"),l.Fc(111,"Entity: "),l.Jb(112,"input",28),l.Nb(),l.Ob(113,"li"),l.Fc(114,"Modeaccess: "),l.Jb(115,"input",29),l.Nb(),l.Ob(116,"li"),l.Fc(117,"Modeaccess sufficient: "),l.Jb(118,"input",30),l.Nb(),l.Ob(119,"li"),l.Fc(120,"Rol: "),l.Jb(121,"input",31),l.Nb(),l.Nb(),l.Jb(122,"p-divider",8),l.Ob(123,"h6"),l.Fc(124,"Relation"),l.Nb(),l.Ob(125,"ul"),l.Ob(126,"li"),l.Fc(127,"Catalog: "),l.Jb(128,"input",32),l.Nb(),l.Ob(129,"li"),l.Fc(130,"Description: "),l.Jb(131,"input",33),l.Nb(),l.Ob(132,"li"),l.Fc(133,"Kind: "),l.Jb(134,"input",34),l.Nb(),l.Ob(135,"li"),l.Fc(136,"Entry: "),l.Jb(137,"input",35),l.Nb(),l.Nb(),l.Jb(138,"p-divider",8),l.Ob(139,"h6"),l.Fc(140,"Classification"),l.Nb(),l.Ob(141,"ul"),l.Ob(142,"li"),l.Fc(143,"Description: "),l.Jb(144,"input",36),l.Nb(),l.Ob(145,"li"),l.Fc(146,"Keyword: "),l.Jb(147,"input",37),l.Nb(),l.Ob(148,"li"),l.Fc(149,"Purpose: "),l.Jb(150,"input",38),l.Nb(),l.Ob(151,"li"),l.Fc(152,"TaxonPath_source: "),l.Jb(153,"input",39),l.Nb(),l.Ob(154,"li"),l.Fc(155,"TaxonPath_taxon: "),l.Jb(156,"input",40),l.Nb(),l.Nb(),l.Jb(157,"p-divider",8),l.Ob(158,"h6"),l.Fc(159,"Accessibility"),l.Nb(),l.Ob(160,"ul"),l.Ob(161,"li"),l.Fc(162,"Summary: "),l.Jb(163,"input",41),l.Nb(),l.Ob(164,"li"),l.Fc(165,"Features: "),l.Jb(166,"input",42),l.Nb(),l.Ob(167,"li"),l.Fc(168,"Hazard: "),l.Jb(169,"input",43),l.Nb(),l.Ob(170,"li"),l.Fc(171,"Control:"),l.Jb(172,"input",44),l.Nb(),l.Ob(173,"li"),l.Fc(174,"Api: "),l.Jb(175,"input",45),l.Nb(),l.Nb(),l.Nb(),l.Ob(176,"div",46),l.Jb(177,"p-button",47),l.Ob(178,"p-button",48),l.Vb("click",function(){return t.onClouceWindow()}),l.Nb(),l.Nb(),l.Nb()),2&e&&(l.fc("formGroup",t.metadataForm),l.xb(29),l.Hc("",t.object.life_cycle_description||"unknown",": "),l.xb(1),l.Hc(" ",l.bc(31,4,t.object.life_cycle_dateTime,"medium"),""),l.xb(18),l.Hc(" ",l.bc(49,7,t.object.meta_metadata_dateTime,"medium"),""))},directives:[r.r,r.l,r.f,r.a,p.a,r.k,r.e,j.a,y.a],pipes:[n.d],styles:[".buttons[_ngcontent-%COMP%]{display:flex;justify-content:flex-end}input[_ngcontent-%COMP%]{margin-bottom:5px}"]}),e})();var N=a("vKg+"),w=a("sYmb"),F=a("9oW3");const I=function(){return{width:"50vw"}};function C(e,t){if(1&e){const e=l.Pb();l.Ob(0,"p-dialog",50),l.Vb("visibleChange",function(t){return l.uc(e),l.Yb(2).displayWindow=t}),l.Ob(1,"app-edit-metadata",51),l.Vb("clouceEvent",function(t){return l.uc(e),l.Yb(2).clouceEvent(t)})("updateEvent",function(t){return l.uc(e),l.Yb(2).updateMetadataEvt(t)}),l.Nb(),l.Nb()}if(2&e){const e=l.Yb(2);l.Bc(l.ic(6,I)),l.fc("header",e.object.general_title)("visible",e.displayWindow)("baseZIndex",1e4),l.xb(1),l.fc("object",e.object)}}function T(e,t){1&e&&(l.Ob(0,"small",52),l.Fc(1),l.Zb(2,"translate"),l.Nb()),2&e&&(l.xb(1),l.Gc(l.ac(2,1,"newObject.errors.title")))}function k(e,t){1&e&&(l.Ob(0,"small",53),l.Fc(1),l.Zb(2,"translate"),l.Nb()),2&e&&(l.xb(1),l.Gc(l.ac(2,1,"newObject.errors.description")))}function E(e,t){1&e&&(l.Ob(0,"small",54),l.Fc(1),l.Zb(2,"translate"),l.Nb()),2&e&&(l.xb(1),l.Hc("",l.ac(2,1,"newObject.errors.keywords")," "))}function J(e,t){1&e&&(l.Ob(0,"small",55),l.Fc(1),l.Zb(2,"translate"),l.Nb()),2&e&&(l.xb(1),l.Gc(l.ac(2,1,"newObject.errors.educationLevel")))}function R(e,t){1&e&&(l.Ob(0,"small",56),l.Fc(1),l.Zb(2,"translate"),l.Nb()),2&e&&(l.xb(1),l.Gc(l.ac(2,1,"newObject.errors.language")))}function A(e,t){1&e&&(l.Ob(0,"small",57),l.Fc(1),l.Zb(2,"translate"),l.Nb()),2&e&&(l.xb(1),l.Gc(l.ac(2,1,"newObject.errors.knowledgeArea")))}function S(e,t){1&e&&(l.Ob(0,"small",58),l.Fc(1),l.Zb(2,"translate"),l.Nb()),2&e&&(l.xb(1),l.Gc(l.ac(2,1,"newObject.errors.license")))}function D(e,t){1&e&&(l.Ob(0,"small",59),l.Fc(1),l.Zb(2,"translate"),l.Nb()),2&e&&(l.xb(1),l.Gc(l.ac(2,1,"newObject.errors.imgHelp")))}function Z(e,t){if(1&e&&l.Jb(0,"img",60),2&e){const e=l.Yb(2);l.fc("src",e.currentImg,l.xc)("alt",e.object.general_title)}}const q=function(e){return{"ng-dirty":e}},L=function(e){return{"ng-invalid ng-dirty":e}},$=function(){return{margin:"0 5px"}};function M(e,t){if(1&e){const e=l.Pb();l.Ob(0,"div",2,3),l.Jb(2,"iframe",4),l.Zb(3,"translate"),l.Zb(4,"urlsanitizer"),l.Dc(5,C,2,7,"p-dialog",5),l.Ob(6,"form",6),l.Vb("ngSubmit",function(){return l.uc(e),l.Yb().onSubmit()}),l.Ob(7,"div",7),l.Ob(8,"label",8),l.Fc(9),l.Zb(10,"translate"),l.Nb(),l.Jb(11,"input",9),l.Zb(12,"translate"),l.Dc(13,T,3,3,"small",10),l.Nb(),l.Ob(14,"div",7),l.Ob(15,"label",11),l.Fc(16),l.Zb(17,"translate"),l.Nb(),l.Jb(18,"textarea",12),l.Zb(19,"translate"),l.Dc(20,k,3,3,"small",13),l.Nb(),l.Ob(21,"div",7),l.Ob(22,"label",14),l.Fc(23),l.Zb(24,"translate"),l.Nb(),l.Jb(25,"input",15),l.Zb(26,"translate"),l.Dc(27,E,3,3,"small",16),l.Nb(),l.Ob(28,"div",17),l.Ob(29,"div",18),l.Ob(30,"div",19),l.Ob(31,"div",7),l.Ob(32,"label",20),l.Fc(33),l.Zb(34,"translate"),l.Nb(),l.Jb(35,"p-dropdown",21),l.Zb(36,"translate"),l.Dc(37,J,3,3,"small",22),l.Nb(),l.Nb(),l.Nb(),l.Ob(38,"div",18),l.Ob(39,"div",19),l.Ob(40,"div",7),l.Ob(41,"label",23),l.Fc(42),l.Zb(43,"translate"),l.Nb(),l.Jb(44,"p-dropdown",24),l.Zb(45,"translate"),l.Dc(46,R,3,3,"small",25),l.Nb(),l.Nb(),l.Nb(),l.Nb(),l.Ob(47,"div",17),l.Ob(48,"div",18),l.Ob(49,"div",19),l.Ob(50,"div",7),l.Ob(51,"label",26),l.Fc(52),l.Zb(53,"translate"),l.Nb(),l.Jb(54,"p-dropdown",27),l.Zb(55,"translate"),l.Dc(56,A,3,3,"small",28),l.Nb(),l.Nb(),l.Nb(),l.Ob(57,"div",18),l.Ob(58,"div",19),l.Ob(59,"div",7),l.Ob(60,"label",29),l.Fc(61),l.Zb(62,"translate"),l.Nb(),l.Jb(63,"p-dropdown",30),l.Zb(64,"translate"),l.Dc(65,S,3,3,"small",31),l.Nb(),l.Nb(),l.Nb(),l.Nb(),l.Ob(66,"div",17),l.Ob(67,"div",18),l.Ob(68,"div",32),l.Ob(69,"div",33),l.Ob(70,"label",34),l.Fc(71),l.Zb(72,"translate"),l.Nb(),l.Jb(73,"p-slider",35),l.Nb(),l.Nb(),l.Nb(),l.Ob(74,"div",18),l.Ob(75,"div",19),l.Ob(76,"div",7),l.Ob(77,"label",36),l.Fc(78),l.Zb(79,"translate"),l.Nb(),l.Ob(80,"div",37),l.Ob(81,"div",38),l.Jb(82,"p-radioButton",39),l.Ob(83,"label",40),l.Fc(84),l.Zb(85,"translate"),l.Nb(),l.Nb(),l.Ob(86,"div",38),l.Jb(87,"p-radioButton",41),l.Ob(88,"label",42),l.Fc(89),l.Zb(90,"translate"),l.Nb(),l.Nb(),l.Nb(),l.Nb(),l.Nb(),l.Nb(),l.Nb(),l.Ob(91,"div",17),l.Ob(92,"div",18),l.Ob(93,"div",7),l.Ob(94,"label",43),l.Fc(95),l.Zb(96,"translate"),l.Nb(),l.Ob(97,"p-fileUpload",44),l.Vb("onSelect",function(t){return l.uc(e),l.Yb().onSelectImage(t)}),l.Zb(98,"translate"),l.Zb(99,"translate"),l.Zb(100,"translate"),l.Nb(),l.Dc(101,D,3,3,"small",45),l.Nb(),l.Nb(),l.Ob(102,"div",18),l.Ob(103,"p"),l.Fc(104,"Imagen actual"),l.Nb(),l.Dc(105,Z,1,2,"img",46),l.Nb(),l.Nb(),l.Ob(106,"button",47),l.Vb("click",function(){return l.uc(e),l.Yb().navigateTo("settings/my-objects")}),l.Zb(107,"translate"),l.Nb(),l.Jb(108,"button",48),l.Zb(109,"translate"),l.Ob(110,"p-button",49),l.Vb("click",function(){return l.uc(e),l.Yb().showBasicDialog2()}),l.Zb(111,"translate"),l.Nb(),l.Nb(),l.Nb()}if(2&e){const e=l.Yb();l.xb(2),l.fc("title",l.ac(3,66,"object.titleIframe"))("src",l.ac(4,68,e.currentFile.url),l.wc),l.xb(3),l.fc("ngIf",e.object&&e.displayWindow),l.xb(1),l.fc("formGroup",e.objectForm),l.xb(3),l.Hc("",l.ac(10,70,"newObject.form.titleLabel"),"*"),l.xb(2),l.fc("ngClass",l.jc(120,q,e.getErrorFormRequired("general_title")))("placeholder",l.ac(12,72,"newObject.form.title")),l.xb(2),l.fc("ngIf",e.getErrorFormRequired("general_title")),l.xb(3),l.Hc("",l.ac(17,74,"newObject.form.descriptionLabel"),"*"),l.xb(2),l.fc("ngClass",l.jc(122,q,e.getErrorFormRequired("general_description")))("placeholder",l.ac(19,76,"newObject.form.description")),l.xb(2),l.fc("ngIf",e.getErrorFormRequired("general_description")),l.xb(3),l.Hc("",l.ac(24,78,"newObject.form.keywordsLabel"),"*"),l.xb(2),l.fc("ngClass",l.jc(124,L,e.getErrorFormRequired("general_keyword")))("placeholder",l.ac(26,80,"newObject.form.keywords")),l.xb(2),l.fc("ngIf",e.getErrorFormRequired("general_keyword")),l.xb(6),l.Hc("",l.ac(34,82,"newObject.form.educationLevelLabel"),"*"),l.xb(2),l.fc("ngClass",l.jc(126,L,e.getErrorFormRequired("education_levels")))("options",e.educationLevels)("placeholder",l.ac(36,84,"newObject.form.educationLevel"))("showClear",!0),l.xb(2),l.fc("ngIf",e.getErrorFormRequired("education_levels")),l.xb(5),l.Hc("",l.ac(43,86,"newObject.form.languageLabel"),"*"),l.xb(2),l.fc("ngClass",l.jc(128,L,e.getErrorFormRequired("general_language")))("options",e.language)("placeholder",l.ac(45,88,"newObject.form.language"))("showClear",!0),l.xb(2),l.fc("ngIf",e.getErrorFormRequired("general_language")),l.xb(6),l.Hc("",l.ac(53,90,"newObject.form.knowledgeAreaLabel"),"*"),l.xb(2),l.fc("ngClass",l.jc(130,L,e.getErrorFormRequired("knowledge_area")))("options",e.knowledgeArea)("placeholder",l.ac(55,92,"newObject.form.knowledgeArea"))("showClear",!0),l.xb(2),l.fc("ngIf",e.getErrorFormRequired("knowledge_area")),l.xb(5),l.Hc("",l.ac(62,94,"newObject.form.licenseLabel"),"*"),l.xb(2),l.fc("ngClass",l.jc(132,L,e.getErrorFormRequired("license")))("options",e.licenses)("placeholder",l.ac(64,96,"newObject.form.license"))("showClear",!0),l.xb(2),l.fc("ngIf",e.getErrorFormRequired("license")),l.xb(6),l.Ic("",l.ac(72,98,"newObject.form.ageLabel"),": ",(null==e.objectForm.controls.educational_typicalAgeRange?null:e.objectForm.controls.educational_typicalAgeRange.value[0])+" - "+(null==e.objectForm.controls.educational_typicalAgeRange?null:e.objectForm.controls.educational_typicalAgeRange.value[1]),""),l.xb(2),l.fc("min",5)("max",150)("range",!0),l.xb(5),l.Hc("",l.ac(79,100,"newObject.form.adaptationsLabel"),"*"),l.xb(4),l.fc("ngClass",l.jc(134,q,e.getErrorFormRequired("adaptation"))),l.xb(2),l.Gc(l.ac(85,102,"newObject.form.adaptationsYes")),l.xb(3),l.fc("ngClass",l.jc(136,q,e.getErrorFormRequired("adaptation"))),l.xb(2),l.Gc(l.ac(90,104,"newObject.form.adaptationsNo")),l.xb(6),l.Gc(l.ac(96,106,"newObject.form.imgLabel")),l.xb(2),l.fc("chooseLabel",l.ac(98,108,"newObject.form.imgSelect"))("showUploadButton",!1)("cancelLabel",l.ac(99,110,"newObject.form.imgCancel"))("invalidFileTypeMessageDetail",l.ac(100,112,"newObject.errors.img"))("multiple",!1),l.xb(4),l.fc("ngIf",e.getErrorFormRequired("avatar")),l.xb(4),l.fc("ngIf",e.currentImg),l.xb(1),l.Bc(l.ic(138,$)),l.fc("label",l.ac(107,114,"newObject.form.imgCancel")),l.xb(2),l.fc("disabled",e.loading)("label",l.ac(109,116,"newObject.form.btnSubmit")),l.xb(2),l.Bc(l.ic(139,$)),l.fc("label",l.ac(111,118,"newObject.form.btnShowMetadata"))}}function P(e,t){1&e&&(l.Ob(0,"p"),l.Fc(1,"Guardando..."),l.Nb())}const G=function(){return{width:"100px",height:"100px"}};function z(e,t){if(1&e&&(l.Ob(0,"div",61),l.Jb(1,"p-progressSpinner",62),l.Dc(2,P,2,0,"p",63),l.Nb()),2&e){const e=l.Yb();l.xb(1),l.Bc(l.ic(3,G)),l.xb(1),l.fc("ngIf",e.editData)}}const V=[{path:"",redirectTo:"/settings/my-objects",pathMatch:"full",data:{breadcrumb:null}},{path:":slug",component:(()=>{class e{constructor(e,t,a,n,i,o,r){this.tokenService=e,this.fb=t,this.route=a,this.objectService=n,this.searchService=i,this.router=o,this.messageService=r,this.subscribes=[],this.editData=!1,this.loading=!1,this.language=[{name:"Espa\xf1ol",code:"es"},{name:"Ingles",code:"en"}],this.route.params.subscribe(e=>{this.getObjectDetail(Number(e.slug))})}ngOnInit(){this.loading=!0,this.loadData()}ngOnDestroy(){this.subscribes.forEach(e=>{e.unsubscribe()})}getObjectDetail(e){return Object(o.a)(this,void 0,void 0,function*(){let t=yield this.objectService.getObjectDetailById(e).subscribe(e=>{this.object=e,this.currentFile=e.learning_object_file,this.currentImg=e.avatar,this.loadForm(),this.loading=!1},e=>{console.log("err",e),this.router.navigateByUrl("/settings/my-objects")});this.subscribes.push(t)})}loadData(){return Object(o.a)(this,void 0,void 0,function*(){let e=yield this.tokenService.refreshToken().subscribe(e=>{}),t=yield this.searchService.getPreferences().subscribe(e=>{this.preferencesData=e.map(e=>({name:e.description,code:e.id}))}),a=yield this.searchService.getLevelEducation().subscribe(e=>{this.educationLevels=e.values.map(e=>({name:e.name,code:e.id}))}),n=yield this.searchService.getInterestAreas().subscribe(e=>{this.knowledgeArea=e.values.map(e=>({name:e.name,code:e.id}))}),i=yield this.searchService.getLicenses().subscribe(e=>{this.licenses=e.values.map(e=>({name:e.name,code:e.id}))});this.subscribes.push(e,t,a,n,i)})}loadForm(){var e,t,a,n,i,o,l,c;this.objectForm=this.fb.group({general_title:[(null===(e=this.object)||void 0===e?void 0:e.general_title)||null,[r.q.required]],general_description:[(null===(t=this.object)||void 0===t?void 0:t.general_description)||null,[r.q.required]],general_keyword:[(null===(a=this.object)||void 0===a?void 0:a.general_keyword)||null,[r.q.required]],education_levels:[(null===(n=this.object)||void 0===n?void 0:n.education_levels.id)||null,[r.q.required]],general_language:[(null===(i=this.object)||void 0===i?void 0:i.general_language)||null,[r.q.required]],knowledge_area:[(null===(o=this.object)||void 0===o?void 0:o.knowledge_area.id)||null,[r.q.required]],license:[(null===(l=this.object)||void 0===l?void 0:l.license.id)||null,[r.q.required]],adaptation:[(null===(c=this.object)||void 0===c?void 0:c.adaptation)||"yes",[r.q.required]],educational_typicalAgeRange:[this.getRageAge(),[r.q.required,r.q.min(5),r.q.max(150)]],avatar:[null]})}getRageAge(){var e;if(this.object.educational_typicalAgeRange){let t=null===(e=this.object)||void 0===e?void 0:e.educational_typicalAgeRange.split("-");return 2===(null==t?void 0:t.length)?t.map(e=>parseInt(e)):[5,100]}return[5,100]}getErrorFormRequired(e){return this.objectForm.get(e).hasError("required")&&this.objectForm.get(e).touched}onSubmit(){return Object(o.a)(this,void 0,void 0,function*(){if(this.objectForm.valid){this.editData=!0,this.loading=!0;let e=this.objectForm.value;e.id=this.object.id,e.educational_typicalAgeRange=`${this.objectForm.value.educational_typicalAgeRange[0]}-${this.objectForm.value.educational_typicalAgeRange[1]}`,this.objectForm.value.avatar||delete e.avatar;let t=yield this.objectService.editMetadata(e).subscribe(e=>{this.object=e,this.currentImg=e.avatar,this.messageService.add({severity:"success",summary:"Success",detail:"Se han actualizado los datos."}),this.file=null,this.loading=!1,this.editData=!1},e=>{console.log("err",e),this.messageService.add({severity:"error",summary:"Error",detail:"Se ah producido un error al guardar los datos, intente de nuevo"}),this.loading=!1});this.subscribes.push(t)}else this.markTouchForm()})}markTouchForm(){Object.values(this.objectForm.controls).forEach(e=>{e.markAsTouched()})}onSelectImage(e){this.objectForm.patchValue({avatar:e.currentFiles[0]})}showBasicDialog2(){this.displayWindow=!0}navigateTo(e){this.router.navigate([e])}clouceEvent(e){this.displayWindow=e}updateMetadataEvt(e){e&&this.getObjectDetail(this.object.id)}}return e.\u0275fac=function(t){return new(t||e)(l.Ib(c.a),l.Ib(r.b),l.Ib(i.a),l.Ib(s.a),l.Ib(b.a),l.Ib(i.d),l.Ib(d.h))},e.\u0275cmp=l.Cb({type:e,selectors:[["app-edit-object"]],decls:3,vars:2,consts:[["class","web-view animate__animated animate__fadeIn",4,"ngIf"],["class","spinner",4,"ngIf"],[1,"web-view","animate__animated","animate__fadeIn"],["webView",""],["frameborder","0","allowfullscreen","",1,"frame-object",3,"title","src"],[3,"header","visible","style","baseZIndex","visibleChange",4,"ngIf"],[1,"animate__animated","animate__fadeIn",3,"formGroup","ngSubmit"],[1,"p-field","p-fluid"],["for","title"],["aria-describedby","title-help","pInputText","","name","general_title","type","text","formControlName","general_title","id","title",3,"ngClass","placeholder"],["id","title-help","class","p-error",4,"ngIf"],["for","description"],["rows","10","pInputTextarea","","name","general_description","formControlName","general_description","id","description","aria-describedby","description-help",3,"ngClass","placeholder"],["id","description-help","class","p-error",4,"ngIf"],["for","keywords"],["aria-describedby","keywords-help","pInputText","","type","text","formControlName","general_keyword","id","keywords","name","general_keyword",3,"ngClass","placeholder"],["id","keywords-help","class","p-error",4,"ngIf"],[1,"p-grid"],[1,"p-col-12","p-md-6","p-lg-6"],[1,"box","sidebar"],["for","level"],["id","level","aria-describedby","level-help","formControlName","education_levels","optionLabel","name","optionValue","code",3,"ngClass","options","placeholder","showClear"],["id","level-help","class","p-error",4,"ngIf"],["for","language"],["id","language","aria-describedby","language-help","formControlName","general_language","optionLabel","name","optionValue","code",3,"ngClass","options","placeholder","showClear"],["id","language-help","class","p-error",4,"ngIf"],["for","knowledgeArea"],["id","knowledgeArea","aria-describedby","knowledgeArea-help","formControlName","knowledge_area","optionLabel","name","optionValue","code",3,"ngClass","options","placeholder","showClear"],["id","knowledgeArea-help","class","p-error",4,"ngIf"],["for","license"],["id","license","aria-describedby","license-help","formControlName","license","optionLabel","name","optionValue","code",3,"ngClass","options","placeholder","showClear"],["id","license-help","class","p-error",4,"ngIf"],[1,"box","content"],[1,"p-field","p-fluid","slider"],["for","Correo"],["formControlName","educational_typicalAgeRange","name","educational_typicalAgeRange",3,"min","max","range"],["for","adaptations"],[1,"radio-buttons"],[1,"p-field-radiobutton"],["aria-describedby","adaptations-help","name","adaptation","formControlName","adaptation","inputId","yes","value","yes",3,"ngClass"],["for","yes"],["aria-describedby","adaptations-help","name","adaptation","value","no","formControlName","adaptation","inputId","no",3,"ngClass"],["for","no"],["for","fileImage"],["id","fileImage","name","fileImage","accept","image/*","aria-describedby","img-help",3,"chooseLabel","showUploadButton","cancelLabel","invalidFileTypeMessageDetail","multiple","onSelect"],["id","img-help","class","p-error",4,"ngIf"],["class","avatar-object",3,"src","alt",4,"ngIf"],["pButton","","pRipple","","type","submit",1,"p-button-danger",3,"label","click"],["pButton","","pRipple","","type","submit",1,"p-button-success",3,"disabled","label"],["icon","pi pi-external-link",3,"label","click"],[3,"header","visible","baseZIndex","visibleChange"],[3,"object","clouceEvent","updateEvent"],["id","title-help",1,"p-error"],["id","description-help",1,"p-error"],["id","keywords-help",1,"p-error"],["id","level-help",1,"p-error"],["id","language-help",1,"p-error"],["id","knowledgeArea-help",1,"p-error"],["id","license-help",1,"p-error"],["id","img-help",1,"p-error"],[1,"avatar-object",3,"src","alt"],[1,"spinner"],["styleClass","custom-spinner","strokeWidth","4","fill","#EEEEEE","animationDuration",".5s"],[4,"ngIf"]],template:function(e,t){1&e&&(l.Dc(0,M,112,140,"div",0),l.Dc(1,z,3,4,"div",1),l.Jb(2,"p-toast")),2&e&&(l.fc("ngIf",t.object&&!t.loading),l.xb(1),l.fc("ngIf",t.loading))},directives:[n.l,u.a,r.r,r.l,r.f,r.a,p.a,r.k,r.e,n.j,m.a,g.a,h.a,f.a,_.a,y.b,v.a,y.a,O.a,x,N.a],pipes:[w.c,F.a],styles:[".frame-object[_ngcontent-%COMP%]{width:100%;height:50vh}.avatar-object[_ngcontent-%COMP%]{width:100%}@media (max-width:700px){[_nghost-%COMP%]     .p-dialog{width:95vw!important}}"]}),e})(),data:{breadcrumb:null}}];let U=(()=>{class e{}return e.\u0275mod=l.Gb({type:e}),e.\u0275inj=l.Fb({factory:function(t){return new(t||e)},imports:[[i.h.forChild(V)],i.h]}),e})();var B=a("PCNd"),H=a("mXw8");let Y=(()=>{class e{}return e.\u0275mod=l.Gb({type:e}),e.\u0275inj=l.Fb({factory:function(t){return new(t||e)},imports:[[n.b,U,B.a,r.o,H.a]]}),e})()},t3rE:function(e,t,a){"use strict";a.d(t,"a",function(){return b});var n=a("lJxs"),i=a("AytR"),o=a("uUT0"),r=a("fXoL"),l=a("tk/3"),c=a("n90K");const s=i.a.baseUrl;let b=(()=>{class e{constructor(e,t){this.http=e,this.storageService=t}getLearningObject(){return this.http.get(s+"/areas-de-conocimiento/").pipe(Object(n.a)(e=>e))}uploadObject(e){let t=new FormData;return t.append("file",e),this.http.post(s+"/learning-object-file/",t)}get urlUpload(){return s+"/learning-object-file/"}getObjectDetail(e){return this.http.get(`${s}/learning-object/${e}`)}getObjectDetailById(e){return this.http.get(`${s}/learning-object-metadata/${e}/`)}getComments(e){return this.http.get(`${s}/learning-objects/comments/${e}`)}addComent(e){return this.http.post(s+"/learning-object/create/commentary/",e)}addMetadata(e){let t=Object(o.serialize)(e);return this.http.post(s+"/learning-object-metadata/",t)}editMetadata(e){let t=Object(o.serialize)(e);return this.http.patch(`${s}/learning-object-metadata/${e.id}/`,t)}sendQualificationExpert(e){return this.http.post(s+"/learning-objects/register-evaluation-expert/",e)}sendQualificationExpertUpdate(e,t){return this.http.put(`${s}/learning-objects/register-evaluation-expert/${t}/`,e)}sendQualificationStudent(e){return this.http.post(s+"/learning-objects/student-evaluation/",e)}sendQualificationStudentUpdate(e,t){return this.http.put(`${s}/learning-objects/student-evaluation/${t}/`,e)}validateLike(e){return this.http.get(`${s}/learning-objects/liked/${e}`)}getRecommendedObjects(){return this.http.get(s+"/learning-objects/recommended/")}getResultsEvaluation(e){return this.http.get(`${s}/learning-objects/evaluations-result-expert/${e}`).pipe(Object(n.a)(e=>e))}interactionLike(e){return this.http.put(`${s}/object-learning/interaction/${e.id}/`,e)}interactionView(e){return this.http.post(s+"/object-learning/interaction/",e)}getObjectsTeacher(){return this.http.get(s+"/learning-objects/observation/")}deleteObjestTeacher(e){return this.http.delete(`${s}/learning-object-file-delete/${e}`)}getObjectsViewed(){return this.http.get(s+"/learning-objects/viewed/")}getObjectResultsEvaluation(e){return this.http.get(`${s}/learning-objects/evaluations-result-to-expert/${e}/`).pipe(Object(n.a)(e=>e))}getObjectResultsEvaluationStudent(e){return this.http.get(`${s}/learning-objects/student/result-to-student/${e}/`).pipe(Object(n.a)(e=>e))}getObjectResultsEvaluationAutomatic(e){return this.http.get(`${s}/learning-objects/evaluations-result-to-expert-automatic/${e}/`).pipe(Object(n.a)(e=>e))}getObjectResultsPublicEvaluationStudent(e){return this.http.get(`${s}/learning-objects/student/result-to-public-student/${e}/`).pipe(Object(n.a)(e=>e))}getPopulars(){return this.http.get(s+"/learning-objects/populars/").pipe(Object(n.a)(e=>e))}searchExpertNoRated(){return this.http.get(s+"/learning-objects/expert-collaborator/no-rated/").pipe(Object(n.a)(e=>e))}}return e.\u0275fac=function(t){return new(t||e)(r.Sb(l.b),r.Sb(c.a))},e.\u0275prov=r.Eb({token:e,factory:e.\u0275fac,providedIn:"root"}),e})()},uUT0:function(e,t){const a=e=>void 0===e,n=e=>Array.isArray(e),i=e=>e&&"number"==typeof e.size&&"string"==typeof e.type&&"function"==typeof e.slice,o=(e,t,r,l)=>((t=t||{}).indices=!a(t.indices)&&t.indices,t.nullsAsUndefineds=!a(t.nullsAsUndefineds)&&t.nullsAsUndefineds,t.booleansAsIntegers=!a(t.booleansAsIntegers)&&t.booleansAsIntegers,t.allowEmptyArrays=!a(t.allowEmptyArrays)&&t.allowEmptyArrays,r=r||new FormData,a(e)||(null===e?t.nullsAsUndefineds||r.append(l,""):"boolean"==typeof e?r.append(l,t.booleansAsIntegers?e?1:0:e):n(e)?e.length?e.forEach((e,a)=>{o(e,t,r,l+"["+(t.indices?a:"")+"]")}):t.allowEmptyArrays&&r.append(l+"[]",""):e instanceof Date?r.append(l,e.toISOString()):!(e=>e===Object(e))(e)||(e=>i(e)&&"string"==typeof e.name&&("object"==typeof e.lastModifiedDate||"number"==typeof e.lastModified))(e)||i(e)?r.append(l,e):Object.keys(e).forEach(a=>{const i=e[a];if(n(i))for(;a.length>2&&a.lastIndexOf("[]")===a.length-2;)a=a.substring(0,a.length-2);o(i,t,r,l?l+"["+a+"]":a)})),r);e.exports={serialize:o}}}]);