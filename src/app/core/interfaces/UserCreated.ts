/**
 * Resumen mínimo del autor o participante relacionado con un OA.
 */
export interface UserCreated {
  id?: number;
  /** UUID publico; identifica al autor en la ruta `author/:userKey`. */
  user_key?: string;
  first_name?: string;
  last_name?: string;
  email?: string;
  image_url?: string;
}
