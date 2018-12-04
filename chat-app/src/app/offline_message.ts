/*Schema for offline messages*/
export class OfflineMessage {
  id?  : string;
  to_username? :string;
  from_username? :string;
  timestamp   :string;
  text : string;
}
