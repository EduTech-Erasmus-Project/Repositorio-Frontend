export interface QuestionEvaluation {
  id: number;
  description: string;
  schemas_questions : any[]
}


export interface AnswerQuestionEvaluation{
  idQuestion:number;
  answer : string;
}

export interface AnswerAnswerEvaluationResponse{
  learning_object_id : number,
  answerQuestion : AnswerQuestionEvaluation[]
}