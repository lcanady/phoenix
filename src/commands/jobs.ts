import { send } from "../broadcast";
import { addCmd } from "../cmds";
import Database, { db } from "../database";
import { DbObj } from "../definitions";
import flags from "../flags";
import { center, player } from "../utils";

interface Job {
  _id?: string;
  title: string;
  num: number;
  assignedTo?: string;
  createdBy: string;
  description: string;
  status: string;
  type: string;
  createdAt: number;
  updatedAt: number;
  completedAt?: number;
  completedBy?: string;
  assignedAt?: number;
  assignedBy?: string;
  closedAt?: number;
  closedBy?: string;
  closedReason?: string;
  comments?: string[];
  tags?: string[];
  flags?: string;
  locked?: boolean;
  lock: string;
  priority?: string;
  dueDate?: number;
}

export const jobDB = new Database<Job>("../../data/jobs.db");

export default () => {
  addCmd({
    name: "@jobs/create",
    pattern: /^[@/+]?jobs\/create\s+(.*)\/(.*)\s*=\s*(.*)/i,
    flags: "connected builder+",
    render: async (ctx, args) => {
      const [type, title, description] = args.slice(1);

      if (
        type.toLowerCase() !== "code" &&
        type.toLowerCase() !== "request" &&
        type.toLowerCase() !== "bug" &&
        type.toLowerCase() !== "plot" &&
        type.toLowerCase() !== "building" &&
        type.toLowerCase() !== "other"
      ) {
        return send(
          ctx.socket.id,
          "Invalid job type. Valid types are: Code, Request, Bug, Plot, Building, Other"
        );
      }

      const job: Job = {
        title,
        description,
        num: (await jobDB.count({})) + 1,
        type: type.toLowerCase(),
        createdBy: ctx.socket.cid || "",
        createdAt: Date.now(),
        updatedAt: Date.now(),
        status: "New",
        lock: "admin+",
      };

      const en = await player(ctx.socket.cid || "");
      const staff = await db.find({
        $where: (obj: DbObj) => flags.check(obj?.flags || "", "builder+"),
      });
      const staffIds = staff.map((obj: DbObj) => obj._id) as string[];

      await jobDB.insert(job);
      const count = jobDB.count({});
      send(
        staffIds,
        `JOBS: Job %ch${job.num}%cn has been created by %ch${
          en.name
        }%cn in bucket %ch${job.type.toUpperCase()}%cn. Title: %ch${
          job.title
        }%cn`
      );
    },
  });

  addCmd({
    name: "@jobs/list",
    pattern: /^(?:[@/+]?jobs\/list|[@/+]jobs)/i,
    flags: "connected builder+",
    render: async (ctx, args) => {
      const en = await player(ctx.socket.cid || "");
      const jobs = await jobDB.find({});
      en.data ||= {};
      en.data.jobs ||= [];

      let output = center("%ch%bJOBS%cn%b", 80, "=") + "\n";
      output += "%ch *  JOB#".padEnd(10);
      output += " TYPE".padEnd(10);
      output += "TITLE".padEnd(35);
      output += "DUE ON".padEnd(10);
      output += "ASSIGNED TO%cn".padEnd(15) + "\n";
      output += "-".repeat(80) + "\n";

      jobs.forEach((job) => {
        output += en.data?.jobs.includes(job._id) ? "   " : "%ch%cr * %cn";

        const timestamp = Date.now() - (job.dueDate || 0);

        switch (true) {
          case timestamp < 0:
            output += "%ch%cr";
            break;
          case timestamp < 60 * 60 * 24 * 7:
            output += "%ch%cy";
            break;
          case timestamp < 60 * 60 * 24 * 14:
            output += "%ch%cg";
            break;
          default:
            output += "%ch%cg";
        }

        output += `${job.num}`.padStart(5).slice(0, 5);
        output += ` ${job.type.toUpperCase()}`.padEnd(10).slice(0, 10);
        output += `${job.title}`.padEnd(35).slice(0, 35);
        output += `${
          job.dueDate
            ? new Date(job.dueDate).toLocaleDateString("en-US", {
                timeStyle: "short",
              })
            : "--------"
        }`
          .padEnd(10)
          .slice(0, 10);
        output +=
          `${job.assignedTo || "Unassigned"}`.padEnd(15).slice(0, 15) + "%cn\n";
      });
      output += "=".repeat(80);

      send(ctx.socket.id, output);
    },
  });
};
