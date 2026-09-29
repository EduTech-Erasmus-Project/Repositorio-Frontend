/**
 * Contrato local para el catalogo publico del equipo de desarrollo.
 *
 * Notas:
 * - Vive en `public/data` porque hoy solo describe datos de presentacion del frente publico.
 * - Si este modelo empieza a reutilizarse fuera de `public`, convendra moverlo a una zona transversal.
 */
export interface DeveloperProfile {
  name: string;
  roleKey: string;
  bioKey?: string;
  image: string;
  emails: string[];
}
