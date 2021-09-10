import { Component, Input, OnInit, Output, EventEmitter } from "@angular/core";
import { Comment } from "src/app/core/interfaces/Comment";
import { LoginService } from "../../../services/login.service";
import { LearningObjectService } from "../../../services/learning-object.service";

@Component({
  selector: "app-comments",
  templateUrl: "./comments.component.html",
  styleUrls: ["./comments.component.scss"],
})
export class CommentsComponent implements OnInit {
  @Input() objectId: number;
  @Input() comments: Comment[];
  @Output() commentEmit = new EventEmitter<number>();

  public commentView: boolean = false;
  public loadingComment: boolean = false;
  public currentUser: any;
  public commentDescription: string;
  public msg: any[] = [];

  constructor(
    private loginService: LoginService,
    private learningObjectService: LearningObjectService
  ) {
    this.currentUser = loginService.user;
  }

  ngOnInit(): void {
    //console.log("comennts in coments component", this.comments)
    //console.log("current user", this.currentUser)
    this.comments.reverse();
  }

  onComment() {
    this.loadingComment = true;

    let formData = {
      description: this.commentDescription,
      learning_object: this.objectId,
    };

    this.learningObjectService.addComent(formData).subscribe(
      (res:any) => {
        let comment: Comment = {
          description: this.commentDescription,
          created: res.created,
          user: {
            first_name: this.currentUser.first_name,
            last_name: this.currentUser.last_name,
            image_url: this.currentUser.image,
          },
        };
        this.comments.unshift(comment);
        this.loadingComment = false;
        this.commentView = false;
        this.commentEmit.emit(1);
        this.commentDescription = null;
      },
      (err) => {
        //console.log('err', err)
        this.msg = [
          { severity: "error", summary: "Internal Error", detail: err.message },
        ];
        this.loadingComment = false;
      }
    );

    //console.log(comment)
  }
}
