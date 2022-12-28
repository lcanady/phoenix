# @MAIL

@mail[/<switches>] <player-list> = <subject>

@mail invokes the built-in MU\* mailer, which allows players to sendand receive mail. Pronoun function substitution is performed on any messages you may try to send.

A <player-list> is a comma-separated list of recipients, which may be:

- Player names
- Player dbref #'s

A <msg> is one of the following:

- A single msg # (ex: 3)
- A sender (ex: \*Hunger)
- One of the following: "read", "unread", "cleared", "tagged", "urgent"
- For certain commands, "all".

Related Topics:
mail-sending, mail-reading, mail-admin, @malias, mail-reviewing
