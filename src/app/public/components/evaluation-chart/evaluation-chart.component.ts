import { Component, Input,OnInit } from '@angular/core';


@Component({
  selector: 'app-evaluation-chart',
  templateUrl: './evaluation-chart.component.html',
  styleUrls: ['./evaluation-chart.component.scss']
})
export class EvaluationChartComponent implements OnInit {
  @Input() resultEv?:any[];
  @Input() resultsEvAut?:any[];
  @Input() resultsEvStudent?:any[];
  @Input() rating?:number;
  @Input() idexpe?:string

  public data_graf;
  public data_options;
  public ratingAutomatic:number;
  public valueratingAutomatic
  public ratingStudent:number;
  public valueratingStudent
  public valueratingExpert
  public valid
  public displayWindowSchema:boolean;
  



  constructor() { }

  ngOnInit(): void {
    //console.log("----->",this.idexpe)
    if(this.idexpe=="docente"){
      if (this.resultEv.length>0) {
        this.loaddatagraf();
      }
    }
    if(this.idexpe=="estudiante"){
      this.loaddatagraf2();
    }
    if(this.idexpe=="automatic"){
      this.loaddatagraf3();
    }
  }

  
  showBasicDialogSchema() {
    this.displayWindowSchema = true;
    
  }

  loaddatagraf(){
    this.valid="experto"
    this.valueratingExpert=Math.round((this.rating*100)/5);
    this.data_graf = {
      //labels:this.resultEv[0].concepts.map(concept=>concept.concepto.concept),
      labels:["Recursos Auditivos","Nivel De Interactividad","Recursos Visuales","Recursos Textuales"],
      datasets: [{
        label: 'Evaluacion de Accesibilidad',
        data: this.resultEv[0].concepts.map(concept=>concept.total),
        fill: true,
        backgroundColor: 'rgba(96, 127, 162, 0.2)',
        borderColor: 'rgb(96, 127, 162)',
        pointBackgroundColor: 'rgb(96, 127, 162)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgb(96, 127, 162)'
      },]
    }; 
    this.data_options = {
      scale:{
        ticks:{
          min:0,
          max:5,
        },pointLabels:{
          fontSize:15
        }
      }
    };
  }

  loaddatagraf2(){
    this.valid="student"
    let datastudent=[]
    let datastudent2=[]
    this.ratingStudent=this.resultsEvStudent[0].rating_student
    this.valueratingStudent=Math.round((this.ratingStudent*100)/5);
        this.resultsEvStudent.forEach(element=>{ 
          element.evaluation_students.forEach(element2 => {
            datastudent.push(element2.average_principle)
            datastudent2.push(element2.evaluation_principle.principle)
          });
        })
    this.data_graf = {
      labels:datastudent2,
      datasets: [{
        label: 'Evaluacion de Adaptabilidad',
        data: datastudent,
        fill: true,
        backgroundColor: 'rgba(96, 127, 162, 0.2)',
        borderColor: 'rgb(96, 127, 162)',
        pointBackgroundColor: 'rgb(96, 127, 162)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgb(96, 127, 162)'
      },]
    };
    this.data_options = {
      scale:{
        ticks:{
          min:0,
          max:5,
        },pointLabels:{
          fontSize:15
        }
      }
    };
  }


  loaddatagraf3(){
    this.valid="automatic"
    this.ratingAutomatic=this.resultsEvAut[0].rating
    this.valueratingAutomatic = Math.round((this.ratingAutomatic*100)/5);
    this.data_graf = {
      labels:["Nivel De Interactividad","Recursos Textuales","Recursos Auditivos","Recursos Visuales"],
      datasets: [{
        label: 'Evaluacion Preliminar',
        data: this.resultsEvAut[0].metadata_concept_evaluations.map(concept=>concept.average),
        fill: true,
        backgroundColor: 'rgba(96, 127, 162, 0.2)',
        borderColor: 'rgb(96, 127, 162)',
        pointBackgroundColor: 'rgb(96, 127, 162)',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: 'rgb(96, 127, 162)'
      },]
    };
    this.data_options = {
      scale:{
        ticks:{
          min:0,
          max:5,
        },pointLabels:{
          fontSize:15
        }
      }
    };
  }
}
