import { send } from "../broadcast";
import { addCmd } from "../cmds";
import Database, { db, mail } from "../database";
import { DbObj } from "../definitions";
import flags from "../flags";
import { center, player } from "../utils";

interface Job {
  _id?: string;
  title: string;
  num: number;
  assignedTo?: string[];
  createdBy: string;
  description: string;
  status: string;
  type: string;
  createdAt: number;
  updatedAt: number;
  completedAt?: number;
  completedBy?: string;
  canceledAt?: number;
  canceledBy?: string;
  assignedAt?: number;
  assignedBy?: string;
  closedAt?: number;
  closedBy?: string;
  closedReason?: string;
  comments?: Comment[];
  tags?: string[];
  flags?: string;
  locked?: boolean;
  lock: string;
  priority?: string;
  dueDate?: number;
}

interface Comment {
  _id?: string;
  author: string;
  createdAt: number;
  text: string;
  private?: boolean;
}

export const jobDB = new Database<Job>("./data/jobs.db");

export default () => {
  addCmd({
    name: "@jobs/create",
    pattern: /^[@/+]?job\/create\s+(.*)\/(.*)\s*=\s*(.*)/i,
    flags: "connected builder+",
    hidden: true,
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
        comments: [
          {
            author: ctx.socket.cid || "",
            createdAt: Date.now(),
            text: description,
          },
        ],
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
    pattern: /^(?:[@/+]?jobs\/list|[@/+]jobs)$/i,
    flags: "connected builder+",
    hidden: true,
    render: async (ctx, args) => {
      const en = await player(ctx.socket.cid || "");
      const jobs = (await jobDB.find({})).sort((a, b) => a.num - b.num);
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
        if (!job.canceledAt && !job.completedAt && !job.closedAt) {
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
            `${job.assignedTo || "Unassigned"}`.padEnd(15).slice(0, 15) +
            "%cn\n";
        }
      });
      output += "=".repeat(80);

      send(ctx.socket.id, output);
    },
  });

  addCmd({
    name: "@jobs/view",
    pattern: /^[@/+]?(?:job\/view|job)\s+(.*)/i,
    flags: "connected builder+",
    hidden: true,
    render: async (ctx, args) => {
      const jobNum = parseInt(args[1]);
      const job = await jobDB.findOne({ num: jobNum });

      if (!job) return send(ctx.socket.id, "Invalid job number.");

      const en = await player(ctx.socket.cid || "");
      en.data ||= {};
      en.data.jobs ||= [];

      if (!en.data.jobs.includes(job._id)) {
        en.data.jobs.push(job._id);
        await db.update({ _id: en._id }, en);
      }

      let output = center(`%b%chJob View ${job.num}%b`, 80, "=") + "\n";
      output +=
        "%ch%cc" +
        "Type:".padStart(10) +
        `%cn ${job.type.toUpperCase()}`.padEnd(28).slice(0, 28) +
        "%ch%cc" +
        "Due On:".padStart(10) +
        `%cn ${
          job.dueDate
            ? new Date(job.dueDate).toLocaleDateString("en-US", {
                timeStyle: "short",
              })
            : "--------"
        }`.slice(0, 28) +
        "\n";

      const assigned = await Promise.all(
        job.assignedTo?.map(async (id) => (await player(id)).name) || ""
      );

      output +=
        "%ch%cc" +
        "Title:".padStart(10) +
        `%cn ${job.title}`.padEnd(28).slice(0, 28) +
        "%ch%cc" +
        "Assigned:".padStart(10) +
        `%cn ${assigned.length ? assigned.join(", ") : "Unassigned"}`
          .padEnd(28)
          .slice(0, 28) +
        "\n";

      output +=
        "%ch%cc" +
        "Status:".padStart(10) +
        `%cn ${job.status}`.padEnd(28) +
        "%ch%cc" +
        "Created:".padStart(10) +
        `%cn ${new Date(job.createdAt).toLocaleDateString("en-US")}`.padEnd(
          28
        ) +
        "\n";
      job.comments ||= [];
      for (const comment of job.comments) {
        if (!comment.private || flags.check(en.flags || " ", "builder+")) {
          output += "-".repeat(80) + "\n";
          output += `[%ch%cc${job.comments.indexOf(comment) + 1}%cn] ${
            comment.private ? "%ch%cy[Staff Only]%cn " : ""
          }%ch${(await player(comment.author)).name}%cn added on %ch${new Date(
            comment.createdAt
          ).toLocaleString("en-US")}%cn\n`;
          output += `${comment.text}\n`;
        }
      }

      output += "=".repeat(80);

      send(ctx.socket.id, output);
    },
  });

  addCmd({
    name: "@jobs/assign",
    pattern: /^[@/+]?job\/assign\s+(.*)\s*=\s*(.*)/i,
    flags: "connected builder+",
    hidden: true,
    render: async (ctx, args) => {
      const jobNum = parseInt(args[1]);
      const list = args[2].split(",").map((x) => x.trim());
      const ids: string[] = [];
      for (const target of list) {
        const p = await player(target);
        if (p._id) ids.push(p._id);
      }

      const job = await jobDB.findOne({ num: jobNum });

      if (!job) return send(ctx.socket.id, "Invalid job number.");
      if (job.completedAt || job.canceledAt)
        return send(ctx.socket.id, "Job is already completed or canceled.");

      job.assignedTo = ids;
      job.assignedBy = ctx.socket.cid;
      job.assignedAt = Date.now();

      await jobDB.update({ _id: job._id }, job);

      send(ctx.socket.id, "JOBS: Job assigned.");

      await mail.insert({
        to: ids,
        from: ctx.socket.cid || "",
        subject: `Job ${job.num} Assigned`,
        message: `You have been assigned to job ${job.num}.`,
        date: Date.now(),
      });

      send(ids, "%chMAIL:%cn You have new mail from the @jobs system.");
      send(ids, `JOBS: You have been assigned to job ${job.num}.`);
    },
  });

  addCmd({
    name: "@job/comment",
    pattern: /^[@/+]?job\/comment(?:\/(.*))?\s+(.*)\s*=\s*(.*)/i,
    flags: "connected builder+",
    hidden: true,
    render: async (ctx, args) => {
      const jobNum = parseInt(args[2]);
      const pri = args[1]?.match(/p[rivate]+/i) ? true : false;
      const comment = args[3];
      console.log(jobNum, comment, pri);
      const job = await jobDB.findOne({ num: jobNum });
      const en = await player(ctx.socket.cid || "");

      if (!job) return send(ctx.socket.id, "Invalid job number.");
      if (job.completedAt || job.canceledAt)
        return send(ctx.socket.id, "Job is already completed or canceled.");

      job.comments ||= [];
      job.assignedTo ||= [];
      job.updatedAt = Date.now();
      job.comments.push({
        author: ctx.socket.cid || "",
        text: comment,
        createdAt: Date.now(),
        private: pri,
      });

      send(ctx.socket.id, "JOBS: Comment added.");
      send(
        [...job?.assignedTo, job.createdBy],
        `JOBS: New comment on job %ch${job.num}%cn by %ch${en.name}%cn.`
      );

      await jobDB.update({ _id: job._id }, job);
    },
  });

  addCmd({
    name: "@job/hidecomment",
    pattern: /^[@/+]?job\/private\s+(.*)\s*=\s*(.*)/i,
    flags: "connected builder+",
    hidden: true,
    render: async (ctx, args) => {
      const jobNum = parseInt(args[1]);
      const commentNum = parseInt(args[2]);
      const en = await player(ctx.socket.cid || "");
      const job = await jobDB.findOne({ num: jobNum });

      if (!job) return send(ctx.socket.id, "Invalid job number.");
      if (job.completedAt || job.canceledAt)
        return send(ctx.socket.id, "Job is already completed or canceled.");

      job.comments ||= [];
      job.assignedTo ||= [];
      job.updatedAt = Date.now();
      job.comments[commentNum - 1].private =
        !job.comments[commentNum - 1].private;
      await jobDB.update({ _id: job._id }, job);

      send(ctx.socket.id, "JOBS: Comment marked private.");
      send(
        [...job?.assignedTo, job.createdBy],
        `JOBS: Comment on job %ch${job.num}%cn by %ch${en.name}%cn marked ${
          job.comments[commentNum - 1].private ? "private" : "public"
        }.`
      );
    },
  });

  addCmd({
    name: "@job/complete",
    pattern: /^[@/+]?job\/complete\s+(.*)\s*=\s*(.*)/i,
    flags: "connected builder+",
    hidden: true,
    render: async (ctx, args) => {
      const jobNum = parseInt(args[1]);
      const en = await player(ctx.socket.cid || "");
      const job = await jobDB.findOne({ num: jobNum });

      if (!job) return send(ctx.socket.id, "Invalid job number.");
      if (job.completedAt || job.canceledAt)
        return send(ctx.socket.id, "Job is already completed or canceled.");

      job.status = "Completed";
      job.updatedAt = Date.now();
      job.completedBy = ctx.socket.cid || "";
      job.completedAt = Date.now();
      job.assignedTo ||= [];
      job.comments ||= [];

      job.comments.push({
        author: ctx.socket.cid || "",
        text: args[2],
        createdAt: Date.now(),
      });

      await jobDB.update({ _id: job._id }, job);

      send(ctx.socket.id, "JOBS: Job marked completed.");
      send(
        [...job?.assignedTo, job.createdBy],
        `JOBS: Job %ch${job.num}%cn marked complete by %ch${en.name}%cn.`
      );

      await mail.insert({
        to: [...job?.assignedTo, job.createdBy],
        from: ctx.socket.cid || "",
        subject: `Job ${job.num} Completed`,
        message: `Job ${job.num} has been marked complete by ${en.name}.\n\nNote:${args[2]}`,
        date: Date.now(),
      });

      send(
        [...job?.assignedTo, ...job.createdBy],
        "%chMAIL:%cn You have new mail from the @jobs system."
      );
    },
  });

  addCmd({
    name: "@job/cancel",
    pattern: /^[@/+]?job\/cancel\s+(.*)\s*=\s*(.*)/i,
    flags: "connected builder+",
    hidden: true,
    render: async (ctx, args) => {
      const jobNum = parseInt(args[1]);
      const en = await player(ctx.socket.cid || "");
      const job = await jobDB.findOne({ num: jobNum });

      if (!job) return send(ctx.socket.id, "Invalid job number.");
      if (job.completedAt || job.canceledAt)
        return send(ctx.socket.id, "Job is already completed or canceled.");

      job.status = "Cancelled";
      job.updatedAt = Date.now();
      job.canceledBy = ctx.socket.cid || "";
      job.assignedTo ||= [];
      job.comments ||= [];

      job.comments.push({
        author: ctx.socket.cid || "",
        text: args[2],
        createdAt: Date.now(),
      });

      await jobDB.update({ _id: job }, job);

      send(ctx.socket.id, "JOBS: Job marked cancelled.");
      send(
        [...job?.assignedTo, job.createdBy],
        `JOBS: Job %ch${job.num}%cn marked cancelled by %ch${en.name}%cn.`
      );

      await mail.insert({
        to: [...job?.assignedTo, job.createdBy],
        from: ctx.socket.cid || "",
        subject: `Job ${job.num} Cancelled`,
        message: `Job ${job.num} has been marked cancelled by ${en.name}.\n\nReason: ${args[2]}`,
        date: Date.now(),
      });
    },
  });
};
