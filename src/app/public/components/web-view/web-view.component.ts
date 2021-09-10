import { Component, OnInit, ViewChild, ElementRef, Input, Output, EventEmitter } from "@angular/core";
import { MenuItem, Message } from "primeng/api";
import { LoginService } from "../../../services/login.service";
import { TranslateService } from "@ngx-translate/core";
import { LearningObjectService } from "src/app/services/learning-object.service";
import { ObjectLearning } from "../../../core/interfaces/ObjectLearning";
import { Subscription } from "rxjs";

@Component({
  selector: "app-web-view",
  templateUrl: "./web-view.component.html",
  styleUrls: ["./web-view.component.scss"],
})
export class WebViewComponent implements OnInit {
  @ViewChild("webView") webView: ElementRef;
  @Input() object: ObjectLearning;
  @Output() commentEmit1 = new EventEmitter<boolean>();

  public fullScreen: boolean = false;
  public rating: number = 3;
  public items: MenuItem[];
  public displayFormRating: boolean = false;
  public displayFormRatingExpert: boolean = false;
  public displayFormRatingExpertUpdate: boolean = false;

  public translate: TranslateService;
  public subscribes: Subscription[] = [];
  public liked: boolean = false;
  private interaction: any;
  public flagQuestionsEx: boolean = false;
  public flagConfirm: boolean = false;
  public msgs1: Message[];

  //>>>>>>>>>>>>>>>>>>>>>>>>>>>
  public flagQuestionsEst:boolean=false;
  public displayFormRatingStudent: boolean = false; 
  public displayFormRatingStudentUpdate: boolean = false;
  //>>>>>>>>>>>>>>>>>>>>>>>>>>>

  constructor(
    private loginService: LoginService,
    private learningObject: LearningObjectService
  ) {}

  ngOnDestroy(): void {
    this.subscribes.forEach((subscription) => {
      subscription.unsubscribe();
    });
  }

  ngOnInit(): void {
    //console.log("url", this.objectFile)
    //console.log("object param", this.object.id)
    this.items = [
      {
        label: "Facebook",
        icon: "pi pi-facebook",
        command: () => {
          //this.update();
        },
      },
      {
        label: "Twitter",
        icon: "pi pi-twitter",
        command: () => {
          //this.delete();
        },
      },
    ];

    this.onView();
    this.loadDataExpertEvaluation();
    this.loadDataStudentEvaluation()

    this.msgs1 = [
      {
        severity: "success",
        summary: "Success",
        detail: "Datos enviados con exito, gracias por realizar la evaluacion",
      },
    ];
  }

  async loadDataExpertEvaluation() {
    //error => { console.log("err", error)}
    if (this.roleExpert) {
      let resultsEval = await this.learningObject
        .getObjectResultsEvaluation(this.object.id)
        .subscribe((res) => {
          if (res.results.length == 0) {
            this.flagQuestionsEx = false;
          } else {
            this.flagQuestionsEx = true;
          }
          //console.log("Viene akias", res)
        });
      this.subscribes.push(resultsEval);
    }
  }

  async loadData() {
    var likedSub;
    if (this.loginService.user && this.roleUser) {
      likedSub = await this.learningObject
        .validateLike(this.object.id)
        .subscribe(
          (res: any) => {
            //console.log("interaction", res);
            this.liked = res.liked; //verificar url de servidor
            this.interaction = res;
          },
          (err) => {
            //console.log("err", err);
            this.liked = false;
          }
        );
    }

    this.subscribes.push(likedSub);
  }

  openFullscreen() {
    const elem = this.webView.nativeElement;
    this.fullScreen = true;

    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.msRequestFullscreen) {
      elem.msRequestFullscreen();
    } else if (elem.mozRequestFullScreen) {
      elem.mozRequestFullScreen();
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen();
    }
  }
  closeFullscreen() {
    //document.getElementById('')
    if (document.exitFullscreen) {
      document.exitFullscreen();
    }
    this.fullScreen = false;
  }
  showFormRating() {
    this.displayFormRating = true;
  }
  showFormRatingExpert() {
    this.displayFormRatingExpert = true;
  }
  showFormRatingExpertUpdate() {
    this.displayFormRatingExpertUpdate = true;
  }
  onDownloadFile(url: string) {
    window.open(url, "_blank");
  }

  get roleExpert() {
    return this.loginService.validateRole("expert");
  }

  get isloged() {
    return this.loginService.user;
  }

  get roleUser() {
    return this.loginService.validateRole("student");
  }

  coutComment(evt) {
    this.displayFormRatingExpert = evt;
    if (this.flagQuestionsEx == true) {
      this.displayFormRatingExpertUpdate = evt;
      this.commentEmit1.emit(true);
    }
   
  }

  coutComment1(evt) {
    if (evt == true) {
      this.flagConfirm = true;
      this.displayFormRatingExpert = false;
      this.ngOnInit();
    } else {
      this.flagConfirm = false;
    }
  }

  async onLike() {
    this.liked = !this.liked;

    this.interaction.liked = this.liked;

    let likeSub = await this.learningObject
      .interactionLike(this.interaction)
      .subscribe(
        (res) => {
          //console.log("res like", res);
        },
        (err) => {
          this.liked = !this.liked;
          //console.log(err);
          //mesage error user.
        }
      );
    this.subscribes.push(likeSub);
  }

  async onView() {
    try {
      if (this.loginService.user && this.roleUser) {
        let viewSub = await this.learningObject
          .interactionView({ viewed: true, learning_object: this.object.id })
          .subscribe(
            (res) => {
              //console.log("res", res);
              this.interaction = res;
            },
            (err) => {
              this.loadData();
              //console.log("err", err);
            }
          );
        this.subscribes.push(viewSub);
      }
    } catch (error) {}
  }


  //>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
  coutCommentstudent(evt) {
    this.displayFormRatingStudent = evt;
    //console.log("evento--",evt)
  }
  coutComments(evt) {
    this.displayFormRatingStudent = evt;
    if( this.flagQuestionsEst == true){
      this.displayFormRatingStudentUpdate = evt;
    }
  }
  showFormRatingStudentUpdate() {
    this.displayFormRatingStudentUpdate = true;
  }
  async loadDataStudentEvaluation() {
    //error => { console.log("err", error)}
    if (this.roleUser) {
      let resultsEvalStudent = await this.learningObject.getObjectResultsEvaluationStudent(this.object.id).subscribe(res => {
        //console.log(">>>>>>>>>>>>>>>>>qqq", res)
        if (res.results.length == 0) {
          this.flagQuestionsEst = false;
          console.log("objeto - - - falsoooooo",res.results.length)
        } else {
          this.flagQuestionsEst = true;
          console.log("objeto - - - true",res.results.length)
        }
        
      });
      //this.subscribes.push(resultsEval);
    }
  }
  //>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>
}
