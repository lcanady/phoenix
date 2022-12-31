# @jobs System

The @jobs system is a todo list at it's core. It's a way for staff to track requests from players under serveral different categories. It's also a way for players to request help from staff.

## Staff Commands

- **`@jobs`** - Displays a list of all jobs.
- **`@jobs <job>`** - Displays a specific job.
- **`@job/create <category>/<title>=<comment>`** - Creates a new job.
- **`@job/assign <job> <player>[, <player>, <player>]`** - Assigns a job to a player, or a comma seperated list of players..
- **`@job/comment[/private] <job>=<comment>`** - Adds a comment to a job. If the private switch is used, then the commaent becomes staff only, if job is exposed to players.
- **`@job/complete <job>`** - Completes a job.
- **`@job/cancel <job>`** - Cancel a job.

## Player Commands

- **`@myjobs`** - Displays a list of all jobs assigned to, or created by you.
- **`@myjobs <job>`** - Displays a specific job assigned to, or created by you.
- **`@myjob/comment[/private] <job>=<comment>`** - Adds a comment to a job.

### Shortcut commands

- **`@request <title>=<comment>`** - Creates a new job in the "Requests" category. -**`@bug <title>=<comment>`** - Creates a new job in the "Bugs" category.
