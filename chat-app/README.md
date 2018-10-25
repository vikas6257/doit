Requirements:
-------------
1. Make GUI more beautiful by adding pictures, adding animation.
   a. Add a bar below heading , to display avtaar, user-id and total number of active-users.
   b. Add a component at the right side, to display friend list.
      Friend list
      ------------
        I. One row of friend list will be having three columns. One is for online-status,
           another one is for avtaar, hovering over which should display the picture in zoomed
           fashion, and last one is for user-id.
        II. A Row of a friend list will change its color, if it has received any message in offline
            mode. On clicking on that row will popover a chat window and shows the same message. Along
            with highlights of the row , we can also add count of messages received.
        III. All offline/online messages will be gone once user closes chat window.
   c. Rest of the spaces will be used for chat window.
      Chat window (With Friends)
      --------------------------
        I.   At the top,  minimize, and end chat options will be there.
        II.  Below then , it shows avtaar, userid and option to add it to friend-list, if not already present,
             otherwise shows as a friend.
        III. At the bottom , it has typing section, along with attachment and send button.
      Chat window (Random)
      --------------------------
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


Design
-------
TODO items:-
1. Have to finalize DB Schema for friend list.
2. What and all lists must be maintained by backend .
3. Do we need to use Graph, or simple list for one to many mapping ?? Or de we even need it?
