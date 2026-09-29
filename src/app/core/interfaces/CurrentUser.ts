import { AdministratorProfileSummary } from "./api-contracts";

/**
 * Usuario autenticado mínimo persistido en storage para shell y navegación.
 */
export interface CurrentUser {
  administrator?: AdministratorProfileSummary | null;
  email?: string;
  first_name?: string;
  id?: number;
  image?: string;
  last_name?: string;
  roles?: string[];
}
