
import { Component, Input, OnInit } from "@angular/core";
import { NavigationExtras, Router } from "@angular/router";
import { ObjectLearning } from "../../../core/interfaces/ObjectLearning";
import { ConfirmationService, MessageService } from "primeng/api";
import { Subscription } from 'rxjs';
import { LearningObjectService } from 'src/app/services/learning-object.service';
import { LoginService } from "src/app/services/login.service";


@Component({
  selector: "app-card",
  templateUrl: "./card.component.html",
  styleUrls: ["./card.component.scss"],
})
export class CardComponent implements OnInit {
  @Input() object: ObjectLearning;
  @Input() teacherOptions?: boolean;

  public show: boolean = false;
  public showFla: boolean = false;

  private subscribes: Subscription[] = [];
  public resultsEv: any[];

  //>>>>>>>>>>>>>>>>>>>>
  public display: boolean=false;
  public displayautomatic: boolean=false;
  public displaystudent:boolean=false;
  

  public resultsEvAut: any[];

  public resultsEvStudent: any[];
  //>>>>>>>>>>>>>>>>>>>>

  constructor(
    private router:Router,
    private objectService: LearningObjectService,
    private confirmationService: ConfirmationService,
    private messageService: MessageService,
    private loginService: LoginService
    ) { }

  ngOnInit(): void {
    //console.log("objectparaK", this.object)
    this.loadData();
    this.loadDataAutomatic();
    this.loadstudent();
   
  }
  //>>>>>>>>>>>>>>>>>>>>>
  showDialog(){
    this.display=true;
  }
  showDialogstudent(){
    this.displaystudent=true;
  }
  showDialogautomatic(){
    this.displayautomatic=true;
  }
  
  //>>>>>>>>>>>>>>>>>>>>

  ngOnDestroy(): void {
    this.subscribes.forEach((subscription) => {
      subscription.unsubscribe();
    });
  }


  navigateTo(){
    this.router.navigate(['/object', this.object.slug])
  }

  async loadData(){
    if(this.roleExpert){
      let resultsEval = await this.objectService.getObjectResultsEvaluation(this.object.id).subscribe(res => {
        this.resultsEv = res.results.map((item: any) => {
          return {
            conceptEvaluations: item.concept_evaluations.map((item1: any) => {
              return {
                evaluationConcept: item1.evaluation_concept.concept,
                average: item1.average,
                questionEvaluations: item1.question_evaluations.map((item2: any) => { return { value: item2.id, questions: item2.question, qualification: item2.qualification } }),
              }
            }),
            observation: item.observation,
            id: item.id,
          }
          
        });
        console.log("--->log experto", this.resultsEv )
      });

      this.subscribes.push(resultsEval);
    }else{
      let resultsAns = await this.objectService.getResultsEvaluation(this.object.id).subscribe(res=>{
         this.resultsEv = res.results.map((item:any)=>{return{concepts:item.concept_evaluations.map((aux:any)=>{return{concepto: aux.evaluation_concept, total:aux.average}})}});
         this.resultsEv = this.resultsEv; 
         console.log("--->>log docente",this.resultsEv)
       });
       this.subscribes.push(resultsAns);
    }
  }

get objectId(){
  return this.object.id
}

  confirmDelete(evt) {
    this.confirmationService.confirm({
      target: evt.target,
      message: "¿Estás segura de que quieres continuar?",
      icon: "pi pi-exclamation-triangle",
      accept: () => {
        this.messageService.add({
          severity: "info",
          summary: "Eliminado",
          detail: "Se ha eliminado el objeto de aprendizaje",
        });
      },
      reject: () => {},
    });
  }

  onclickEdid() {
    //console.log("object id", this.object)
    this.router.navigateByUrl(`settings/edit-object/${this.object.id}`);
  }

  get roleExpert() {
    return this.loginService.validateRole("expert");
  }



  //>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
  async loadDataAutomatic(){
    let resultsEvalAutomatic = await this.objectService.getObjectResultsEvaluationAutomatic(this.object.id).subscribe(
      res =>{
        //console.log("aaaaaaaa",res.results)
        this.resultsEvAut=res.results.map((item:any)=>{
          return{
            rating:item.rating_schema,
            metadata_concept_evaluations:item.metadata_concept_evaluations.map((item1: any) => {
              return{
                evaluationConcept: item1.evaluation_concept.concept,
                average: item1.average_schema,
                metadata_evaluations:item1.metadata_evaluations.map((item2: any) => { return { 
                  value: item2.id, 
                  schema: item2.schema, 
                  qualification: item2.qualification,
                  description: item2.description
                }}),
              }})
          }});
        //console.log("--->>automatico",this.object.id,this.resultsEvAut)
        this.resultsEvAut=this.resultsEvAut
        //console.log("--->>automatico",this.resultsEvAut)
      } 
    )
    this.subscribes.push(resultsEvalAutomatic);
  }
  //>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

  async loadstudent(){
    let dataSstudent= await this.objectService.getObjectResultsPublicEvaluationStudent(this.object.id).subscribe(
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
        //console.log("estudiante--->",this.resultsEvStudent)
        let test=[]
        this.resultsEvStudent.forEach(element=>{ 
          element.evaluation_students.forEach(element2 => {
            test.push(element2.average_principle)
          });
        })
        //console.log("estudiante222--->",test)
        //console.log("estudiante--->",this.resultsEvStudent[0].evaluation_students[0].average_principle)
      } 
    );
    this.subscribes.push(dataSstudent);
    
  }

  navigateToReport(valid:boolean){
    if (valid) {
      let extras: NavigationExtras = {
        queryParams: {rstudent:true},
      };
      this.router.navigate(['/report', this.object.slug],extras)
    }else{
      this.router.navigate(['/report', this.object.slug])
    }
  }




















}
