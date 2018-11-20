Requirements:
-------------
1. Make GUI more beautiful by adding pictures, adding animation.
   a. Add a bar below heading , to display avtaar, user-id and total number of active-users.
   b. Add a component at the right side, to display friend list.
      Friend list:-
        I. One row of friend list will be having three columns. One is for online-status,
           another one is for avtaar, hovering over which should display the picture in zoomed
           fashion, and last one is for user-id.
        II. A Row of a friend list will change its color, if it has received any message in offline
            mode. On clicking on that row will popover a chat window and shows the same message. Along
            with highlights of the row , we can also add count of messages received.
        III. All offline/online messages will be gone once user closes chat window.
   c. Rest of the spaces will be used for chat window.
      Chat window (With Friends):-
        I.   At the top,  minimize, and end chat options will be there.
        II.  Below then , it shows avtaar, userid and option to add it to friend-list, if not already present,
             otherwise shows as a friend.
        III. At the bottom , it has typing section, along with attachment and send button.
      Chat window (Random):-
         It is different with normal chat-window in following terms.
            - It must be having a different color.
            - It must have a Start button on init()
            - It must be present by default at the init moment of chat-box, which comes after login.
   d. Need to pick a logo for website. And same will be added in heading.
   e. Domain name and website name will be decided accordingly.

2. Guest flow:
   a. Ask user to enter a unique name to start chat.
   b. Guest will not have any friend list.
   c. Guest will not be allowed to add user.
   d. Guest will be allowed to chat with stranger.

3. User flow:
   a. Allow user to add stranger as friend.
   b. Allow user to send message to an online or offline friend.
   c. Allow chat one to many simultaneously.

TODO items:-
1. Added backend code for stranger end to end chat. So same needs to be handled at frontend.
2. Frontend should send 'start-chat' to backend to get a stranger. Till the time a stranger is
   assigned back to user, option to again start chat with stranger should be disabled and chatbox
   should not be initiated. Once server replies with 'assigned-stranger', init chatbox componenet
   based on userid received from server.
3. Frontend should send 'end-chat', if user closes the chatbox for a stranger, so that another
   stranger's chatbox should also be closed saying that "stranger has ended chat with you", so
   to avoid unnecessary unicast of message.
4. Note:- There is no mechanism to close chatbox for a stranger if another stranger disconnects/logout.
   We don't even need this, because disconnected stranger will not be in connected_users list at
   backend. So there will not be any false unicast of message.
