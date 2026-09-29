import { NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormsModule } from "@angular/forms";
import { of } from "rxjs";

import { LearningObjectService } from "src/app/services/learning-object.service";
import { LoginService } from "src/app/services/login.service";
import { CommentsComponent } from "./comments.component";

describe("CommentsComponent", () => {
  let component: CommentsComponent;
  let fixture: ComponentFixture<CommentsComponent>;
  let learningObjectServiceSpy: jasmine.SpyObj<LearningObjectService>;

  const originalComments = [
    {
      description: "Comentario viejo",
      created: "2026-06-01",
      user: { first_name: "Ana", last_name: "Perez", image_url: "" },
    },
    {
      description: "Comentario nuevo",
      created: "2026-06-02",
      user: { first_name: "Luis", last_name: "Lopez", image_url: "" },
    },
  ] as any;

  beforeEach(async () => {
    learningObjectServiceSpy = jasmine.createSpyObj("LearningObjectService", ["addComent"]);
    learningObjectServiceSpy.addComent.and.returnValue(
      of({
        created: "2026-06-03",
      })
    );

    await TestBed.configureTestingModule({
      declarations: [CommentsComponent],
      imports: [FormsModule],
      providers: [
        {
          provide: LoginService,
          useValue: {
            user: {
              first_name: "Mario",
              last_name: "Rojas",
              image: "avatar.png",
            },
          },
        },
        { provide: LearningObjectService, useValue: learningObjectServiceSpy },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    })
      .overrideTemplate(CommentsComponent, "")
      .compileComponents();

    fixture = TestBed.createComponent(CommentsComponent);
    component = fixture.componentInstance;
    component.objectId = 10;
    component.comments = [...originalComments];
    fixture.detectChanges();
  });

  it("invierte una copia de los comentarios sin mutar el arreglo original", () => {
    expect(component.comments[0].description).toBe("Comentario nuevo");
    expect(originalComments[0].description).toBe("Comentario viejo");
  });

  it("permite enviar un comentario valido y lo agrega al inicio", () => {
    spyOn(component.commentEmit, "emit");
    component.commentDescription = "  Nuevo comentario  ";

    component.onComment();

    expect(learningObjectServiceSpy.addComent).toHaveBeenCalledWith({
      description: "Nuevo comentario",
      learning_object: 10,
    });
    expect(component.comments[0].description).toBe("Nuevo comentario");
    expect(component.loadingComment).toBeFalse();
    expect(component.commentView).toBeFalse();
    expect(component.commentEmit.emit).toHaveBeenCalledWith(1);
  });
});
