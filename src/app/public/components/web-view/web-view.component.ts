import { Component, OnInit, ViewChild, ElementRef, Input, Output, EventEmitter, OnDestroy, OnChanges, SimpleChanges } from "@angular/core";
import { MenuItem, Message, MessageService } from "primeng/api";
import { LoginService } from "../../../services/login.service";
import { TranslateService } from "@ngx-translate/core";
import { LearningObjectService } from "src/app/services/learning-object.service";
import { ObjectLearning } from "../../../core/interfaces/ObjectLearning";
import { Subscription } from "rxjs";
import { NavigationEnd, Router } from "@angular/router";
import { StorageService } from "src/app/services/storage.service";

@Component({
  selector: "app-web-view",
  templateUrl: "./web-view.component.html",
  styleUrls: ["./web-view.component.scss"],
})
export class WebViewComponent implements OnInit, OnDestroy {
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
  public flagQuestionsExNumber: number = -1;

  public flagConfirm: boolean = false;
  public msgs1: Message[];

  //>>>>>>>>>>>>>>>>>>>>>>>>>>>
  public flagQuestionsEst: boolean = false;
  public flagQuestionsEstNumber: number = -1;

  public displayFormRatingStudent: boolean = false;
  public displayFormRatingStudentUpdate: boolean = false;
  //>>>>>>>>>>>>>>>>>>>>>>>>>>>

  public countViews: number = 0;
  public countDownloads: number = 0;

  public buttonMenuBoolean: boolean = false;
  public objectCollectionMenu: Object;
  public youNeedMenu: boolean = false;

  constructor(
    private loginService: LoginService,
    private learningObject: LearningObjectService,
    private messageService: MessageService,
    private router: Router,
    private localStorage: StorageService
  ) {

    let interactionOA = this.learningObject.interactionSideObjectSelect.subscribe(
      res => {
        if (res) {
          this.getNumberOfDownloads();
          this.getNumberOfViews();
        }
      }
    );
    this.subscribes.push(interactionOA);
  }


  ngOnDestroy(): void {
    this.subscribes.forEach((subscription) => {
      if (subscription != undefined) {
        subscription.unsubscribe();
      }
    });
  }

  ngOnInit(): void {
    (this.object.learning_object_file.url.indexOf('website_index.html') === -1) ? this.youNeedMenu = true : this.youNeedMenu = false;

    this.generateUserRefKey();

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

    this.loadData();
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
    if (this.roleExpert) {
      let resultsEval = await this.learningObject
        .getObjectResultsEvaluation(this.object.id)
        .subscribe((res) => {
          if (res.length > 0) {
            if (res.length == 0) {
              this.flagQuestionsEx = false;
              this.flagQuestionsExNumber = 0;
            } else {
              this.flagQuestionsEx = true;
              this.flagQuestionsExNumber = 1;
            }
          } else {
            this.flagQuestionsEx = false;
            this.flagQuestionsExNumber = 0;
          }
        });
      this.subscribes.push(resultsEval);
    }
  }

  async loadData() {
    var likedSub;
    if (this.loginService.user && (this.roleUserStudent || this.roleUserExpert || this.roleUserTeacher)) {
      likedSub = await this.learningObject
        .validateLike(this.object.id)
        .subscribe(
          (res: any) => {
            this.liked = res.liked; //verificar url de servidor
            this.interaction = res;
          },
          (err) => {
            this.liked = false;
          }
        );
    }

    this.subscribes.push(likedSub);
    this.getNumberOfDownloads();
    this.getNumberOfViews();
  }

  /**
   * Funcion para obtener el numero de vistas que 
   * existen dentro del objeto de aprendizaje.
   */
  private async getNumberOfViews() {
    let numberViews = await this.learningObject.getViewedCount(this.object.id).subscribe(
      async (res: any) => {
        if (res.length > 0) {
          this.countViews = res[0].view;
          if (this.validateOAExistArrayView() && this.exist_Key()) {
            if (!this.validateIdExistArrayLocalS(this.object.id)) {
              this.addNewItemArray(this.object.id);
              this.countUpdateViews();
            }
          } else if (this.exist_Key()) {
            this.createArrayLocalStorage([this.object.id]);
            this.countUpdateViews();
          }
        }
      }, error => {
        this.createNumberViews();

      }
    );
    this.subscribes.push(numberViews);
  }

  /**
   * Funcion para validar si existe el Id del objeto de aprendizaje
   * @param id 
   */
  private validateIdExistArrayLocalS(id: number) {
    let array_local = this.localStorage.getCookieItem('array_view')
    let array = JSON.parse(array_local);
    if (array.indexOf(id) !== -1) {
      return true;
    }
    return false;
  }

  private validateOAExistArrayView() {
    const array_view = this.localStorage.getCookieItem('array_view');
    if (array_view == null || array_view == undefined) {
      this.localStorage.saveCookieItem('array_view', JSON.stringify([]));
      return false;
    }
    return true;
  }

  /***
   * Funcion para actulazar el numero de vistas del objeto de aprendizaje 
   */
  private async countUpdateViews() {
    let dataUpdate = {
      learning_object: this.object.id,
      view: this.countViews + 1
    }

    let dataUpdateView = await this.learningObject.viewedUpdateCount(dataUpdate, this.object.id).subscribe(
      res => {
        this.countViews = this.countViews + 1;
      }, error => {
      }
    );

    this.subscribes.push(dataUpdateView);
  }

  private async createNumberViews() {
    let data = {
      learning_object: this.object.id,
      view: 1
    }

    let createViews = await this.learningObject.viewedCreateCount(data).subscribe(
      (res: any) => {
        this.countViews = res.view;
        if (this.validateOAExistArrayView() && this.exist_Key()) {
          this.addNewItemArray(this.object.id);
        } else if (this.exist_Key()) {
          this.createArrayLocalStorage([this.object.id]);
        }
      }
    );
    this.subscribes.push(createViews);

  }

  private exist_Key() {
    let key = this.localStorage.getCookieItem('key_ref')
    if (key === undefined || key === null) {
      return
      false;
    }

    return true;
  }
  /**
   * funcion para crear el nuevo array
   */
  private createArrayLocalStorage(array: number[]) {
    this.localStorage.saveCookieItem('array_view', JSON.stringify(array));
  }

  /**
   * Funcion para agregar un nuevo
   * regitro al array 
   */
  private addNewItemArray(item: number) {
    let arrayString = this.localStorage.getCookieItem('array_view');
    let array = JSON.parse(arrayString);
    array.push(item);
    this.localStorage.saveCookieItem('array_view', JSON.stringify(array));
  }

  /**
   * Obtener numero de descargas que tiene el objeto de aprendizaje 
   */
  private async getNumberOfDownloads() {
    let interationCountDownload = await this.learningObject.getdownloadCount(this.object.id).subscribe(
      (res: any) => {
        this.countDownloads = res.number;
      }, error => {
      }
    );

    this.subscribes.push(interationCountDownload);
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
  onDownloadFile(url: any) {
    if (this.loginService.user && (this.roleUserStudent || this.roleUserTeacher || this.roleUserExpert)) {
      this.onDonwloaded();
      window.open(url);
    } else {
      this.messageService.add(
        {
          severity: "error",
          summary: "Error",
          detail: "Debe iniciar sesión para realizar esta acción",
        },
      );
    }
  }

  get roleExpert() {
    return this.loginService.validateRole("expert");
  }

  get isloged() {
    return this.loginService.user;
  }

  get roleUserStudent() {
    return this.loginService.validateRole("student");
  }

  get roleUserExpert() {
    return this.loginService.validateRole("expert");
  }

  get roleUserTeacher() {
    return this.loginService.validateRole("teacher");
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

    if (this.interaction?.liked == undefined) {
      this.createILike();
    } else {

      this.interaction.liked = this.liked;

      let likeSub = await this.learningObject
        .interactionLike(this.interaction)
        .subscribe(
          (res) => {
            this.interaction = res;
          },
          (err) => {
            this.liked = !this.liked;
          }
        );
      this.subscribes.push(likeSub);
    }
  }

  /**
   *Funcion para crear la funcionalidad de me gusta
   */
  private async createILike() {

    this.interaction = {
      liked: this.liked,
      learning_object: this.object.id
    };

    let interaction = await this.learningObject.interactionView(this.interaction).subscribe(
      res => {
        this.interaction = res;
      }, error => {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'No se pudo guardar la interacción'
        })
      }
    );
    this.subscribes.push(interaction);
  }

  public async onDonwloaded() {
    if (this.countDownloads === 0) {
      const data = {
        downloaded: 1, learning_object: this.object.id
      }
      let downloaded = await this.learningObject.downloadCreateCount(data).subscribe(
        (res: any) => {
          this.interaction = res[0];
          this.countDownloads = 1;
        }, error => {

        }
      );
      this.subscribes.push(downloaded);
    } else {
      const data = {
        downloaded: this.interaction.downloaded, learning_object: this.object.id
      }
      let downloadedUpdate = await this.learningObject.downloadUpdateCount(data, this.object.id).subscribe(
        (res: any) => {
          if (res.length > 0) {
            this.interaction = res[0];
            this.getNumberOfDownloads();
          }
        }, error => {

        }
      );
      this.subscribes.push(downloadedUpdate);
    }
  }

  coutCommentstudent(evt) {
    this.displayFormRatingStudent = evt;
    this.flagQuestionsEst = true;
    this.flagQuestionsEstNumber = 1;
  }

  coutComments(evt) {
    this.displayFormRatingStudent = evt;
    if (this.flagQuestionsEst == true) {
      this.displayFormRatingStudentUpdate = evt;
    }
  }

  showFormRatingStudentUpdate() {
    this.displayFormRatingStudentUpdate = true;
  }

  async loadDataStudentEvaluation() {
    if (this.roleUserStudent) {
      let resultsEvalStudent = await this.learningObject.getObjectResultsEvaluationStudent(this.object.id).subscribe(res => {
        if (res.length > 0) {
          if (res.length == 0) {
            this.flagQuestionsEst = false;
            this.flagQuestionsEstNumber = 0;
          } else {
            this.flagQuestionsEst = true;
            this.flagQuestionsEstNumber = 1;
          }
        } else {
          this.flagQuestionsEst = false;
          this.flagQuestionsEstNumber = 0;
        }
      });
      this.subscribes.push(resultsEvalStudent);
    }
  }
  //>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>

  private async generateUserRefKey() {
    const key_ref = this.localStorage.getCookieItem('key_ref');
    if (key_ref == null || key_ref == undefined) {
      try {
        const userRefKey: any = await this.learningObject.getReferenceUserView().toPromise();
        this.localStorage.saveCookieItem('key_ref', userRefKey.reference);
      } catch (erro) {
        console.log(erro);
      }
    }
  }

  public sizeWindowMaxValue() {
    var ancho = window.innerWidth
    if (ancho <= 1300) {
      return '';
    } else {
      if(!this.buttonMenuBoolean && this.youNeedMenu == true ){
        return 'width:75%'
      }
    }
  }
}