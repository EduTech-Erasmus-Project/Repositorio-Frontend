/**
 * Pregunta y respuestas serializadas de la autoevaluación o evaluación guiada.
 */
export interface QuestionEvaluation {
  id: number;
  description: string;
  schemas_questions : unknown[]
}


/**
 * Par pregunta-respuesta enviado al backend al guardar una evaluación.
 */
export interface AnswerQuestionEvaluation{
  idQuestion:number;
  answer : string;
}

/**
 * Payload agrupado para registrar respuestas sobre un OA.
 */
export interface AnswerAnswerEvaluationResponse{
  learning_object_id : number,
  answerQuestion : AnswerQuestionEvaluation[]
}
