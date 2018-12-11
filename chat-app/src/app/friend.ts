import { OfflineMessage } from './offline_message';

/*Schema for each friend. Used in case of add,get friend list. It is also Used
  at the places, when we need any info from DB for a friend*/
export class Friend {
  id? : string;
  username?: string;
  gender?  : string; //either male of female
  inbox? : OfflineMessage[];
  onlinestatus? : string; //either true or false

  /**************************************************************************
  *variable to handle numbering message recieved during chatbox CloseWindow *
  **************************************************************************/
  unseen_message? : number;
  hasunseen_message? : boolean;
  dp_url? : string;
}
