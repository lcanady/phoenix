# @LINK

COMMAND: @link <object>=#<number>/here/home

When used on a player or a thing, this command sets the object's home to the indicated location. The destination must be owned by you or be an ABODE room, and you must pass the destination's LinkLock.

When used on a room, this command sets the room's drop-to, where objects dropped in the room go. The destination must be a room that is either owned by you or is LINK_OK, and you must pass the destination's LinkLock.

For exits, this command sets the destination if the exit is currently unlinked, you control the destination or it is set LINK_OK, and you pass the destination's LinkLock. You can @link an unlinked exit regardless of who owns it or the lock set on it, you are made the owner if you successfully link🔗 to the destination. Linking an exit costs 1 coin, and if the exit was
owned by someone else, you also reimburse the former owner 1 coin (making the total cost to you 2 coins).
