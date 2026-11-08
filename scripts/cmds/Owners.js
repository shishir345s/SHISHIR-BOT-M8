const { createCanvas, loadImage } = require("canvas");
const fs = require("fs-extra");
const GIFEncoder = require("gifencoder");

module.exports = {
  config: {
    name: "owners",
    version: "13.0",
    author: "Ariyan ",
    countDown: 5,
    role: 0,
    description: "Fixed Admin Profile with Enhanced Neon & Particles",
    category: "info",
  },

  onStart: async function ({ event, api, message, usersData }) {
    // এখানে তোমার নিজের ফেসবুক আইডি বসানো হয়েছে যাতে সবসময় তোমার প্রোফাইল শো করে
    const ownerID = "61595106187744";

    try {
      const wait = await message.reply("⚡ abbu i's Coming please wait !");

      const userData = await usersData.get(ownerID);
      const avatarUrl = await usersData.getAvatarUrl(ownerID);
      const avatarImg = await loadImage(avatarUrl);

      const width = 700,
        height = 1000;
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext("2d");
      const encoder = new GIFEncoder(width, height);
      const path = __dirname + `/cache/owner_fixed_${ownerID}.gif`;

      if (!fs.existsSync(__dirname + "/cache"))
        fs.mkdirSync(__dirname + "/cache");

      const stream = fs.createWriteStream(path);
      encoder.createReadStream().pipe(stream);
      encoder.start();
      encoder.setRepeat(0);
      encoder.setDelay(70); // এনিমেশন আরও ফাস্ট এবং স্মুথ
      encoder.setQuality(1);

      // পার্টিকেলস সংখ্যা বাড়িয়ে ৮০ করা হয়েছে (Extra Premium)
      const particles = Array.from({ length: 80 }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        size: Math.random() * 3 + 0.5,
        speed: Math.random() * 6 + 2,
      }));

      for (let i = 0; i < 15; i++) {
        ctx.fillStyle = "#000000";
        ctx.fillRect(0, 0, width, height);

        // ঘন পার্টিকেলস ইফেক্ট
        ctx.fillStyle = "rgba(255, 255, 255, 0.7)";
        particles.forEach((p) => {
          ctx.beginPath();
          ctx.arc(p.x, (p.y - i * p.speed) % height, p.size, 0, Math.PI * 2);
          ctx.fill();
        });

        // নিওন বর্ডার যা অনেক দ্রুত এবং উজ্জ্বলভাবে ঘুরবে
        const hue = (i * 24) % 360;
        ctx.strokeStyle = `hsla(${hue}, 100%, 50%, 1)`;
        ctx.lineWidth = 18; // বর্ডার আরও মোটা করা হয়েছে
        ctx.shadowBlur = 35;
        ctx.shadowColor = `hsla(${hue}, 100%, 50%, 1)`;
        ctx.strokeRect(25, 25, width - 50, height - 50);
        ctx.shadowBlur = 0;

        // ওনার প্রোফাইল পিকচার (HD Circle)
        ctx.save();
        ctx.beginPath();
        ctx.arc(width / 2, 170, 115, 0, Math.PI * 2);
        ctx.clip();
        ctx.drawImage(avatarImg, width / 2 - 115, 55, 230, 230);
        ctx.restore();

        // প্রোফাইল গ্লোয়িং রিং
        ctx.beginPath();
        ctx.arc(width / 2, 170, 122, 0, Math.PI * 2);
        ctx.lineWidth = 7;
        ctx.strokeStyle = "#FFFFFF";
        ctx.stroke();

        // ওনারের নাম (Bright Neon Style)
        ctx.fillStyle = "#FFFFFF";
        ctx.font = "bold 55px Arial";
        ctx.textAlign = "center";
        ctx.shadowBlur = 20;
        ctx.shadowColor = "#00FFFF";
        ctx.fillText("AHMED SHISHIR 🌊", width / 2, 340);
        ctx.shadowBlur = 0;

        // পার্সোনাল ডাটা লিস্ট
        const info = [
          { l: "📍 LOCATION", v: "Dhaka" },
          { l: "💍 RELATIONSHIP", v: "Single" },
          { l: "🕋 REGION", v: "Islam" },
          { l: "📚 CLASS", v: "Nothing" },
          { l: "⚡ PREFIX", v: "!" },
          { l: "👑 ROLE", v: "Bot Owner / Main Admin" },
        ];

        info.forEach((item, index) => {
          const yPos = 440 + index * 75;
          ctx.fillStyle = "rgba(0, 255, 255, 0.15)";
          ctx.fillRect(70, yPos - 40, 560, 60);

          ctx.fillStyle = "#00FFFF";
          ctx.font = "bold 28px Arial";
          ctx.textAlign = "left";
          ctx.fillText(`>> ${item.l}`, 90, yPos + 2);

          ctx.fillStyle = "#FFFFFF";
          ctx.font = "28px Arial";
          ctx.textAlign = "right";
          ctx.fillText(item.v, width - 90, yPos + 2);
        });

        encoder.addFrame(ctx);
      }

      encoder.finish();

      stream.on("finish", () => {
        api.unsendMessage(wait.messageID);
        message.reply(
          {
            body: "👑 owner tor abba।",
            attachment: fs.createReadStream(path),
          },
          () => fs.unlinkSync(path)
        );
      });
    } catch (err) {
      message.reply("❌ জানু, তোমার প্রোফাইলটি লোড করতে সমস্যা হয়েছে।");
    }
  },
};
