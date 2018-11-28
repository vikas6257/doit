import { Inbox } from './inbox';

/*Schema for each friend. Used in case of add,get friend list. It is also Used
  at the places, when we need any info from DB for a friend*/
export class Friend {
  id? : string;
  username?: string;
  gender?  : string;
  inbox? : Inbox[];
  onlinestatus? : string; //either true or false
}
