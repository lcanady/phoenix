import { send } from "../broadcast";
import { addCmd, force } from "../cmds";
import { db, mail } from "../database";
import { center, player, target } from "../utils";

export default () => {
  addCmd({
    name: "@mail",
    pattern: /[@/+]?mail\s+(.*)\s*=\s*(.*)/,
    flags: "connected",
    hidden: true,
    render: async (ctx, args) => {
      const [targets, subject] = args.slice(1);
      const en = await player(ctx.socket.cid || "");
      const tars = [];
      for (const tar of targets.split(",")) {
        const t = await target(en, tar.trim());
        if (t) {
          tars.push(t);
        }
      }

      if (en) {
        en.data ||= {};
        const ids = tars.map((t) => t._id) as string[];
        if (en.data?.tempMail)
          return send(
            ctx.socket.id,
            "You already have a message started. Use @mail/send to send it."
          );

        en.data.tempMail = {
          from: en._id!,
          to: ids,
          subject,
          message: "",
        };

        await db.update({ _id: en._id }, en);
        send(
          ctx.socket.id,
          "Enter your message with '-<text>'. Use @mail/send to send it."
        );
      }
    },
  });

  addCmd({
    name: "-",
    pattern: /^(-|~)(.*)/,
    flags: "connected",
    hidden: true,
    render: async (ctx, args) => {
      const [marker, message] = args.slice(1);
      const en = await player(ctx.socket.cid || "");

      if (!en) return;
      en.data ||= {};
      if (!en.data.tempMail)
        return send(ctx.socket.id, "%chMAIL:%cn No message started.");

      if (marker === "~") {
        en.data.tempMail.message += message + " " + en.data.tempMail.message;
      } else if (marker === "-" && message === "-") {
        return force(ctx.socket, "@mail/send");
      } else {
        en.data.tempMail.message += message + " ";
      }

      await db.update({ _id: en._id }, en);
      send(ctx.socket.id, "%chMAIL:%cn Message updated.");
    },
  });

  addCmd({
    name: "@mail/send",
    pattern: /^(?:[@/+]?mail\/send|--)/i,
    flags: "connected",
    hidden: true,
    render: async (ctx) => {
      const en = await player(ctx.socket.cid || "");
      if (!en) return;
      en.data ||= {};
      if (!en.data.tempMail)
        return send(ctx.socket.id, "%chMAIL:%cn No message started.");

      const message = en.data.tempMail;
      if (!message.message)
        return send(
          ctx.socket.id,
          "%chMAIL:%cn No message entered. Use '-' to enter a message."
        );
      await mail.insert(message);
      send(ctx.socket.id, "%chMAIL:%cn Message sent.");
      send(
        en.data.tempMail.to,
        `%chMAIL:%cn You have a new message from ${en.name}`
      );
      delete en.data.tempMail;
      await db.update({ _id: en._id }, en);
    },
  });

  addCmd({
    name: "@mail/quick",
    pattern: /^[@/+]?mail\/quick\s+(.*)\/(.*)\s*=\s*(.*)/i,
    flags: "connected",
    hidden: true,
    render: async (ctx, args) => {
      const [targets, subject, message] = args.slice(1);
      const en = await player(ctx.socket.cid || "");
      const tars = [];
      for (const tar of targets.split(",")) {
        const t = await target(en, tar.trim());
        if (t) {
          tars.push(t);
        }
      }

      if (en) {
        const ids = tars.map((t) => t._id) as string[];
        const ml = {
          from: en._id!,
          to: ids,
          subject,
          message,
          read: false,
          time: Date.now(),
        };

        await mail.insert(ml);
        send(ctx.socket.id, "%chMAIL:%cn Message sent.");
        send(ids, `%chMAIL:%cn You have a new message from ${en.name}`);
      }
    },
  });

  addCmd({
    name: "@mail/proof",
    pattern: /^[@/+]?mail\/proof/i,
    flags: "connected",
    hidden: true,
    render: async (ctx) => {
      const en = await player(ctx.socket.cid || "");
      if (!en) return;
      en.data ||= {};
      if (!en.data.tempMail)
        return send(ctx.socket.id, "%chMAIL:%cn No message started.");

      let names: string[] = [];
      for (const id of en.data.tempMail.to) {
        const p = await player(id);
        if (p) {
          names.push(p.name);
        }
      }

      let cc: string[] = [];
      en.data.tempMail.cc ||= [];
      if (en.data.tempMail.cc.length > 0) {
        for (const id of en.data.tempMail.cc) {
          const p = await player(id);
          if (p) {
            cc.push(p.name);
          }
        }
      }

      let bcc: string[] = [];
      en.data.tempMail.bcc ||= [];
      if (en.data.tempMail?.bcc?.length > 0) {
        for (const id of en.data.tempMail.bcc) {
          const p = await player(id);
          if (p) {
            cc.push(p.name);
          }
        }
      }

      let output = "-".repeat(80) + "\n";
      output += `From: ${en.name.padEnd(
        20
      )} Subject: ${en.data.tempMail.subject.slice(0, 60)}\n`;
      output += `To: ${names.join(", ")}\n`;
      if (cc.length) output += `CC: ${cc.join(", ")}\n`;
      if (bcc.length) output += `BCC: ${bcc.join(", ")}\n`;
      output += "-".repeat(80) + "\n";
      output += en.data.tempMail.message.trim() + "\n";
      output += "-".repeat(80);
      send(ctx.socket.id, output);
    },
  });

  addCmd({
    name: "@mail/edit",
    pattern: /^[@/+]?mail\/edit\s+(.*)\s*=\s*(.*)/i,
    flags: "connected",
    hidden: true,
    render: async (ctx, args) => {
      const [before, after] = args.slice(1);
      const en = await player(ctx.socket.cid || "");
      if (!en) return;
      en.data ||= {};
      if (!en.data.tempMail)
        return send(ctx.socket.id, "%chMAIL:%cn No message started.");

      en.data.tempMail.message = en.data.tempMail.message.replace(
        before,
        after
      );
      console.log(before, after);
      await db.update({ _id: en._id }, en);
      send(ctx.socket.id, "%chMAIL:%cn Message updated.");
    },
  });

  addCmd({
    name: "@mail/abort",
    pattern: /^[@/+]?mail\/abort/i,
    flags: "connected",
    hidden: true,
    render: async (ctx) => {
      const en = await player(ctx.socket.cid || "");
      if (!en) return;
      en.data ||= {};
      if (!en.data.tempMail)
        return send(ctx.socket.id, "%chMAIL:%cn No message started.");

      delete en.data.tempMail;
      await db.update({ _id: en._id }, en);
      send(ctx.socket.id, "%chMAIL:%cn Message aborted.");
    },
  });

  addCmd({
    name: "@mail/cc",
    pattern: /^[@/+]?mail\/cc\s+(.*)/i,
    flags: "connected",
    hidden: true,
    render: async (ctx, args) => {
      const targets = args[1];
      const en = await player(ctx.socket.cid || "");
      if (!en) return;
      en.data ||= {};
      if (!en.data.tempMail)
        return send(ctx.socket.id, "%chMAIL:%cn No message started.");

      en.data.tempMail.cc ||= [];
      for (const tar of targets.split(",")) {
        const t = await target(en, tar.trim());
        if (t._id) en.data.tempMail.cc.push(t._id);
      }

      await db.update({ _id: en._id }, en);
      send(ctx.socket.id, "%chMAIL:%cn CC updated.");
    },
  });

  addCmd({
    name: "@mail/bcc",
    pattern: /^[@/+]?mail\/bcc\s+(.*)/i,
    flags: "connected",
    hidden: true,
    render: async (ctx, args) => {
      const targets = args[1];
      const en = await player(ctx.socket.cid || "");
      if (!en) return;
      en.data ||= {};
      if (!en.data.tempMail)
        return send(ctx.socket.id, "%chMAIL:%cn No message started.");

      en.data.tempMail.bcc ||= [];
      for (const tar of targets.split(",")) {
        const t = await target(en, tar);
        if (t._id) en.data.tempMail.bcc.push(t._id);
      }

      await db.update({ _id: en._id }, en);
      send(ctx.socket.id, "%chMAIL:%cn BCC updated.");
    },
  });

  addCmd({
    name: "@mail",
    pattern: /^[@/+]?mail$/i,
    flags: "connected",
    hidden: true,
    render: async (ctx, args) => {
      const targets = args[1];
      const en = await player(ctx.socket.cid || "");
      if (!en) return;
      const mails = await mail.find({ to: { $in: [en._id] } });
      let output = center(`%b%chMAIL: ${mails.length}%cn%b`, 80, "=") + "\n";
      for (const m of mails) {
        const from = await player(m.from);
        const to = await Promise.all(m.to.map((id) => player(id)));
        const cc = m.cc ? await Promise.all(m.cc.map((id) => player(id))) : "";
        const bcc = m.bcc
          ? await Promise.all(m.bcc.map((id) => player(id)))
          : "";
        output += `${en.data?.mailread?.includes(m._id!) ? " " : "U"} ${
          mails.indexOf(m) + 1
        } From: ${from.name.padEnd(15).slice(0, 15)} Subject: ${m.subject
          .padEnd(45)
          .slice(0, 45)}\n`;
      }
      output += "=".repeat(80);
      send(ctx.socket.id, output);
    },
  });

  addCmd({
    name: "@mail/read",
    pattern: /^[@/+]?mail\/read\s+(.*)/i,
    flags: "connected",
    hidden: true,
    render: async (ctx, args) => {
      const en = await player(ctx.socket.cid || "");
      if (!en) return;
      const mails = await mail.find({ to: { $in: [en._id] } });
      const num = parseInt(args[1]);
      if (num > mails.length || num < 1)
        return send(ctx.socket.id, "%chMAIL:%cn Invalid message number.");
      const m = mails[num - 1];
      const from = await player(m.from);
      const to = await Promise.all(m.to.map((id) => player(id)));
      const cc = m.cc ? await Promise.all(m.cc.map((id) => player(id))) : "";
      let output = center(`%b%chMAIL: ${num}%cn%b`, 80, "=") + "\n";
      output += `From: ${from.name.padEnd(15).slice(0, 25)} Subject: ${m.subject
        .padEnd(48)
        .slice(0, 48)}\n`;
      output += `To: ${to
        .map((p) => p.name)
        .join(", ")
        .padEnd(15)
        .slice(0, 15)}\n`;
      if (cc) output += `CC: ${cc.map((p) => p.name).join(", ")}\n`;
      output += "-".repeat(80) + "\n";
      output += m.message + "\n";
      output += "=".repeat(80);
      send(ctx.socket.id, output);
      en.data ||= {};
      en.data.mailread ||= [];
      if (!en.data.mailread.includes(m._id!)) {
        en.data.mailread.push(m._id!);
        await db.update({ _id: en._id }, en);
      }
    },
  });

  addCmd({
    name: "@mail/delete",
    pattern: /^[@/+]?mail\/delete\s+(.*)/i,
    flags: "connected",
    hidden: true,
    render: async (ctx, args) => {
      const en = await player(ctx.socket.cid || "");
      if (!en) return;
      const mails = await mail.find({ to: { $in: [en._id] } });
      const num = parseInt(args[1]);
      if (num > mails.length || num < 1)
        return send(ctx.socket.id, "%chMAIL:%cn Invalid message number.");
      const m = mails[num - 1];
      const readers = await db.find({ "data.mailread": { $in: [m._id] } });
      if (readers.length)
        return send(
          ctx.socket.id,
          "%chMAIL:%cn Message has been read, cannot delete."
        );

      await mail.remove({ _id: m._id });
      send(ctx.socket.id, "%chMAIL:%cn Message deleted.");
    },
  });

  addCmd({
    name: "@mail/reply",
    pattern: /^[@/+]?mail\/reply\s+(.*)/i,
    flags: "connected",
    hidden: true,
    render: async (ctx, args) => {
      const en = await player(ctx.socket.cid || "");
      if (!en) return;
      const mails = await mail.find({ to: { $in: [en._id] } });
      const num = parseInt(args[1]);
      if (num > mails.length || num < 1)
        return send(ctx.socket.id, "%chMAIL:%cn Invalid message number.");
      const m = mails[num - 1];
      const from = await player(m.from);
      en.data ||= {};

      en.data.tempMail = {
        to: [from._id!],
        subject: `Re: ${m.subject}`,
        message: "",
        from: en._id!,
      };

      await db.update({ _id: en._id }, en);
      send(ctx.socket.id, "%chMAIL:%cn Reply started.");
    },
  });

  addCmd({
    name: "@mail/notify",
    pattern: /^[@/+]?mail\/notify/i,
    flags: "connected",
    hidden: true,
    render: async (ctx) => {
      const en = await player(ctx.socket.cid || "");
      if (!en) return;
      const mails = await mail.find({
        $and: [{ to: { $in: [en._id] } }, { read: false }],
      });
      send(
        ctx.socket.id,
        `%chMAIL:%cn You have %ch${mails.length}%cn new messages.`
      );
    },
  });

  addCmd({
    name: "@mail/replyall",
    pattern: /^[@/+]?mail\/replyall\s+(.*)/i,
    flags: "connected",
    hidden: true,
    render: async (ctx, args) => {
      const en = await player(ctx.socket.cid || "");
      if (!en) return;
      const mails = await mail.find({ to: { $in: [en._id] } });
      const num = parseInt(args[1]);
      if (num > mails.length || num < 1)
        return send(ctx.socket.id, "%chMAIL:%cn Invalid message number.");
      const m = mails[num - 1];
      const from = await player(m.from);
      const to = await Promise.all(m.to.map((id) => player(id)));
      const cc = m.cc ? await Promise.all(m.cc.map((id) => player(id))) : "";
      en.data ||= {};

      en.data.tempMail = {
        to: [from._id!],
        subject: `Re: ${m.subject}`,
        message: "",
        from: en._id!,
      };

      if (to) en.data.tempMail.to.push(...to.map((p) => p._id!));
      if (cc) en.data.tempMail.to.push(...cc.map((p) => p._id!));

      await db.update({ _id: en._id }, en);
      send(ctx.socket.id, "%chMAIL:%cn Reply started.");
    },
  });

  addCmd({
    name: "@mail/forward",
    pattern: /^[@/+]?mail\/forward\s+(.*)\s*=\s*(.*)/i,
    flags: "connected",
    hidden: true,
    render: async (ctx, args) => {
      const en = await player(ctx.socket.cid || "");
      if (!en) return;
      const mails = await mail.find({ to: { $in: [en._id] } });
      const num = parseInt(args[1]);
      if (num > mails.length || num < 1)
        return send(ctx.socket.id, "%chMAIL:%cn Invalid message number.");
      const m = mails[num - 1];

      en.data ||= {};

      const to = await player(args[2]);
      if (!to) return send(ctx.socket.id, "%chMAIL:%cn Invalid recipient.");
      if (to._id) {
        en.data.tempMail = {
          to: [to?._id],
          subject: `Fwd: ${m.subject}`,
          message: `---------- Forwarded message ----------\nFrom: ${m.from}\nSubject: ${m.subject}\n\n${m.message}\n----------- End Forward Message -----------\n`,
          from: en._id!,
        };
      }

      await db.update({ _id: en._id }, en);
      send(ctx.socket.id, "%chMAIL:%cn Forward started.");
    },
  });
};
