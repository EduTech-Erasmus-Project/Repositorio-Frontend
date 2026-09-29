import { UserCreated } from "./UserCreated";

/**
 * Comentario público asociado a un objeto de aprendizaje.
 */
export interface Comment {
  id?: number;
  description?: string;
  created?: Date;
  modified?: Date;
  user?: UserCreated;
}
