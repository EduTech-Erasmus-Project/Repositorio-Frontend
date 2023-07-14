import { UserCreated } from "./UserCreated";

export interface Comment {
  id?: number;
  description?: string;
  created?: Date;
  modified?: Date;
  user?: UserCreated;
}
