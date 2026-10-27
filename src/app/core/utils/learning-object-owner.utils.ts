import { CurrentUser } from "../interfaces/CurrentUser";
import { ObjectLearning } from "../interfaces/ObjectLearning";

/**
 * Indica si el OA fue subido por el usuario de la sesión.
 *
 * Un usuario puede ser docente y experto a la vez: en sus propios OA no actúa
 * como experto (no puede calificarlos) sino como autor.
 */
export function isOwnLearningObject(
  object: Pick<ObjectLearning, "user_created"> | null | undefined,
  user: Pick<CurrentUser, "id"> | null | undefined
): boolean {
  const authorId = object?.user_created?.id;
  return authorId != null && authorId === user?.id;
}
