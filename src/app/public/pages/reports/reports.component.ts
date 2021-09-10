import { Component, OnInit } from '@angular/core';

import { ObjectLearning } from "src/app/core/interfaces/ObjectLearning";
import { LearningObjectService } from "../../../services/learning-object.service";
import { ActivatedRoute, Router } from "@angular/router";
import { LoginService } from "src/app/services/login.service";
import { element } from 'protractor';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss']
})
export class ReportsComponent implements OnInit {

  public objectData: ObjectLearning;
  public validtotal:boolean
  public resultsEv: any[];
  public resultsEvStudent: any[];

  public topyes
  public topno
  public toppartially

  public observationstudent
  public observationexpert
  public te=[1];
  
  public Stopyes
  public Stopno
  public Stoppartially
  
  public displayWindowmetadata: boolean;
  public displayWindowobject: boolean;

  public metadataEv=[];
  public metadataOb=[];
  public colsAnswer=[]


  
  
  constructor(
    private objectService: LearningObjectService,
    private route: ActivatedRoute,
    private loginService: LoginService,
  ) {
    this.route.params.subscribe((params) => {
      
      //this.loading = true;
      this.getObjectDetail(params.slug);
      //console.log(params.slug)
    });
    this.route.queryParams.subscribe((params) => {
      this.validtotal=params.rstudent as boolean

      //console.log("params2",this.validtodo)
    });  
  }

  ngOnInit(): void {
    
    
  }

  showBasicDialogObject() {
    this.displayWindowobject = true;
    
  }
  showBasicDialogMetadata() {
    this.displayWindowmetadata = true;
    
  }

  async getObjectDetail(slug: string) {
    //console.log("---->1",slug)
    let detailSub = await this.objectService.getObjectDetail(slug).subscribe(
      (res: any) => {
        //console.log('res typeof', typeof(this.objectData))
        this.objectData = res; 
        //console.log("---->2",this.objectData)
        //console.log("---->3",this.objectData.id)
        //console.log("---->4",this.objectData.slug)
        //console.log("Metadatos del Objeto------>",this.objectData)
        
        this.loadstudent(this.objectData.id)
       
        let array=[]
        Object.keys(this.objectData).forEach(key => 
          {
            if (key.includes("accesibility") || key.includes("annotation_mode")) {
              array.push((key+": "+this.objectData[key]).replace("_",""))
            }
          });
        //console.log("datossssssssOBJETO",array)


        let resultOb=[]
        array.forEach(element=>{
          var sep=element.split(':')
          var septwo=sep[1].split(",")
          //console.log(">>>>>>>><",element)
          septwo.forEach(element1 =>{
            var aux=sep[0].
            replace("accesibilityfeatures","accessibilityfeature").
            replace("accesibilitycontrol","accessibilitycontrol").
            replace("accesibilityhazard","accessibilityhazard").
            replace("annotationmodeaccess","accesmode").
            replace("accesibilityapi","accessibilityapi").
            replace("accesibilitysummary","accessibilitysummary")
            resultOb.push((aux.toLowerCase()+":"+element1.trim().toLowerCase()))
          } )
        })
        
        //console.log("respuestaaaaas------>",this.colsAnswer)
        

        this.loadDataExpert(this.objectData.id,resultOb)
    


        
        
        
        

      
        
  
    




      },
      (err) => {
        console.log("err", err);
      }
      
    );
   
  
  }

  async loadDataExpert(id: number,listm:any[]){
    let resultsAns = await this.objectService.getResultsEvaluation(id).subscribe(res=>{
       this.resultsEv = res.results.map((item:any)=>{return{
        observation:item.observation,
        concept_evaluations:item.concept_evaluations.map((item2:any)=>{return{
          average:item2.average,
          evaluation_concept:item2.evaluation_concept.concept,
          question_evaluations:item2.question_evaluations.map((item3:any)=>{return{
            question:item3.question,
            schema:item3.schema,
            qualification:item3.qualification,
            interpreter_yes:item3.interpreter_yes,
            interpreter_partially:item3.interpreter_partially,
            interpreter_no:item3.interpreter_no
          }})
        }})
       }})
       this.resultsEv = this.resultsEv; 

       //console.log("docente",this.resultsEv)
       var cont_yes=0
       var cont_partially=0
       var cont_no=0
       
       this.resultsEv.forEach(element =>{
         this.observationexpert=element.observation
         element.concept_evaluations.forEach(element2 => {
           element2.question_evaluations.forEach(element3 => {
             if (element3.qualification=='Si') {
               cont_yes+=1
             }
             if (element3.qualification=='Parcialmente') {
              cont_partially+=1
            }
            if (element3.qualification=='No') {
              cont_no+=1
            }
            this.metadataEv.push(element3.schema)
            //console.log("Metadatos de la Evaluacion Experto",)

            //console.log("aosdasdasd",element3.qualification)

             
           });
         });
       })
      // console.log("yes",cont_yes
       //this.metadataEv.push(ejemplo)
       //console.log("no",ejemplo)
       
       this.topyes=cont_yes
       this.topno=cont_no
       this.toppartially=cont_partially

       //console.log("lista evaluacion",this.metadataEv)
       //console.log("lista 2",listm)
       

       let concuerda=[]

       this.resultsEv.forEach(element =>{

        element.concept_evaluations.forEach(element2 => {
          element2.question_evaluations.forEach(element3 => {
            if (listm.includes(element3.schema.toLowerCase()) && element3.qualification=='Si' || listm.includes(element3.schema.toLowerCase()) && element3.qualification=='Parcialmente' ){
              
               
              concuerda.push("Si")
            }else if((!listm.includes(element3.schema.toLowerCase()) && element3.qualification=='No')){
              //console.log("no encontro")
              concuerda.push("Si")
            }else if((!listm.includes(element3.schema.toLowerCase()) && element3.qualification=='Si' || !listm.includes(element3.schema.toLowerCase()) && element3.qualification=='Parcialmente')){
             concuerda.push("No")
            }else if((listm.includes(element3.schema.toLowerCase()) && element3.qualification=='No')){
             concuerda.push("No")
            }
           //this.metadataEv.push(element3.schema)
           //console.log("Metadatos de la Evaluacion Experto",)

           //console.log("aosdasdasd",element3.qualification)

            
          });
        });
      })




       
       console.log("elemento",concuerda)
       let dontconcuerda=[]

       this.resultsEv.forEach(element =>{
        this.observationexpert=element.observation
        element.concept_evaluations.forEach(element2 => {
          element2.question_evaluations.forEach(element3 => {
            
              //console.log("elemento",element.toLowerCase())
              //console.log("----",element3.schema," ",element3.qualification)
      
              if (!listm.includes(element3.schema.toLowerCase()) && element3.qualification=='Si' || !listm.includes(element3.schema.toLowerCase()) && element3.qualification=='Parcialmente' ){
              
               
               dontconcuerda.push("incluir")
             }else if((listm.includes(element3.schema.toLowerCase()) && element3.qualification=='No')){
               //console.log("no encontro")
               dontconcuerda.push("quitar")
             }else if((listm.includes(element3.schema.toLowerCase()) && element3.qualification=='Si' || listm.includes(element3.schema.toLowerCase()) && element3.qualification=='Parcialmente')){
              dontconcuerda.push(" ")
             }else if((!listm.includes(element3.schema.toLowerCase()) && element3.qualification=='No')){
              dontconcuerda.push(" ")
             }

            






        
            
          });
        });
      })










       //console.log("elemento2",dontconcuerda)
       for (let i1 = 0; i1 < this.metadataEv.length; i1++) {
        //console.log("-----",this.M_E_features[i1],"-----",concuerda[i1],"-----",faltan[i1])
        if (this.metadataEv[i1]=="") {
          
        }else{
          this.colsAnswer.push({"id":this.metadataEv[i1],"concuerdan":concuerda[i1],"faltan":dontconcuerda[i1]})
        }
        
      }
     });
     
    }

    async loadstudent(id: number){
      let dataSstudent= await this.objectService.getObjectResultsPublicEvaluationStudent(id).subscribe(
        res => {
          this.resultsEvStudent=res.results.map((item:any) =>{return{
            rating_student:item.rating,
            observation:item.observation,
            evaluation_students:item.evaluation_students.map((item2:any)=>{return{
              average_principle:item2.average_principle,
              evaluation_principle:item2.evaluation_principle,
              principle_gl:item2.principle_gl.map((item3:any)=>{return{
                average_guideline:item3.average_guideline,
                guideline_pr:item3.guideline_pr.guideline,
                guideline_evaluations:item3.guideline_evaluations.map((item4:any)=>{return{
                  question:item4.question,
                  qualification:item4.qualification,
                  interpreter_st_yes:item4.interpreter_st_yes,
                  interpreter_st_no:item4.interpreter_st_no,
                  interpreter_st_partially:item4.interpreter_st_partially,
                  metadata:item4.metadata
                }})
              }})
            }}) 
           }});
          this.resultsEvStudent=this.resultsEvStudent
          //console.log("estudiante",this.resultsEvStudent)
          var cont_yes_st=0
          var cont_partially_st=0
          var cont_no_st=0
          this.resultsEvStudent.forEach(element => {
            this.observationstudent=element.observation
            element.evaluation_students.forEach(element2 => {
              element2.principle_gl.forEach(element3 => {
                element3.guideline_evaluations.forEach(element4 => {
                  //console.log("aaaaaa....",element4.qualification)
                  if (element4.qualification=='Si') {
                    cont_yes_st+=1
                  }
                  if (element4.qualification=='No') {
                    cont_no_st+=1
                  }
                  if (element4.qualification=='Parcialmente') {
                    cont_partially_st+=1
                  }
                });
              });
            });

          })
          //console.log("S-yes",cont_yes_st)
          //console.log("S-no",cont_no_st)
          //console.log("S-parcial",cont_partially_st)
          this.Stopyes=cont_yes_st
          this.Stopno=cont_no_st
          this.Stoppartially=cont_partially_st
       
          
        } 
      );
      
      







  }

}

