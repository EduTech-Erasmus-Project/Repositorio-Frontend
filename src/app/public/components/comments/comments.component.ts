import { ChangeDetectorRef, Component, Input, OnInit, Output, EventEmitter } from "@angular/core";
import { ToastMessageOptions } from "primeng/api";
import { Comment } from "src/app/core/interfaces/Comment";
import { CurrentUser } from "src/app/core/interfaces/CurrentUser";
import { CommentCreateResponse } from "src/app/core/interfaces/api-contracts";
import { LoginService } from "../../../services/login.service";
import { LearningObjectService } from "../../../services/learning-object.service";

/**
 * Gestiona el listado visible de comentarios y el alta rapida dentro del detalle de OA.
 *
 * Responsabilidades:
 * - Mostrar comentarios existentes en orden reciente.
 * - Validar y enviar nuevos comentarios del usuario autenticado.
 * - Notificar al contenedor cuando cambia el contador total.
 */
@Component({
    selector: "app-comments",
    templateUrl: "./comments.component.html",
    styleUrls: ["./comments.component.scss"],
    standalone: false
})
export class CommentsComponent implements OnInit {
  @Input() objectId!: number;
  @Input() comments: Comment[] = [];
  @Output() commentEmit = new EventEmitter<number>();

  public commentView = false;
  public loadingComment = false;
  public currentUser: CurrentUser | null;
  public commentDescription: string | null = null;
  public msg: ToastMessageOptions[] = [];

  constructor(
    private loginService: LoginService,
    private learningObjectService: LearningObjectService,
    private cdr: ChangeDetectorRef
  ) {
    this.currentUser = loginService.user;
  }

  ngOnInit(): void {
    if (this.comments?.length) {
      this.comments = [...this.comments].reverse();
    }
  }

  get commentCanSubmit(): boolean {
    return !!this.commentDescription?.trim() && !this.loadingComment;
  }

  toggleCommentView(show: boolean) {
    this.commentView = show;

    if (!show) {
      this.commentDescription = null;
      this.msg = [];
    }

    this.cdr.detectChanges();
  }

  onComment() {
    const description = this.commentDescription?.trim();

    if (!description || !this.currentUser) {
      return;
    }

    this.loadingComment = true;
    this.msg = [];
    this.cdr.detectChanges();

    const formData = {
      description,
      learning_object: this.objectId,
    };

    this.learningObjectService.addComent(formData).subscribe(
      (res: CommentCreateResponse) => {
        const comment: Comment = {
          description,
          created: res.created ? new Date(res.created) : undefined,
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
        this.cdr.detectChanges();
      },
      (err) => {
        this.msg = [
          { severity: "error", summary: "Internal Error", detail: err.message },
        ];
        this.loadingComment = false;
        this.cdr.detectChanges();
      }
    );

  }

  buildCommentMessage(message: { summary?: string; detail?: string }) {
    return message.summary ? `${message.summary}: ${message.detail}` : message.detail;
  }

  getCommentAuthor(comment: Comment): string {
    return `${comment.user.first_name || ""} ${comment.user.last_name || ""}`.trim();
  }

  getCommentInitials(comment: Comment): string {
    const fullName = this.getCommentAuthor(comment);

    return fullName
      .split(" ")
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part.charAt(0).toUpperCase())
      .join("");
  }

  trackByComment(index: number, comment: Comment): string {
    return `${comment.created || index}-${comment.description || ""}`;
  }
}
