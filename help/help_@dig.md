#@DIG

COMMAND: @dig[/<switches>] <name> [= <exitlist> [, <exitlist>] ]

Creates a new room with the specified name and displays its number. This command costs 10 coins. If the [= <exitlist>] option is used, an exit will be opened from the current room to the new room automatically. If the second <exitlist> option (after the comma) is specified, an exit from the new room back to the current room with the specified [Exits] name is opened. Either exit creation may fail if you do not have sufficient rights to the current room to open or link🔗 the new exit. Example: The command

@dig Kitchen = Kitchen;k;north;n,south;s

will dig a room called Kitchen, and open an exit called 'Kitchen' in your current room. The ; symbol means that you may enter the exit by typing 'k', 'north' or 'n' also. This command also opens the exit 'south;s' from 'Kitchen' back to where you are. Only the first Exit name is displayed in the Obvious exits list.

If you specify the /teleport switch, then you are @teleported to the room after it is created and any exits are opened.

Related Topics: @destroy, @link, @open
