const itunes = require("searchitunes");
const { getStreamFromURL } = global.utils;

module.exports = {
	config: {
		name: "appstore",
		aliases: ["app", "apps"],
		version: "2.0",
		author: "SHISHIR",
		countDown: 5,
		role: 0,

		description: {
			en: "Search apps from App Store"
		},

		category: "software",

		guide: {
			en: "{pn} <app name>\nExample: {pn} PUBG"
		},

		envConfig: {
			limitResult: 3
		}
	},

	langs: {
		en: {
			missingKeyword: "❌ | 𝙋𝙇𝙀𝘼𝙎𝙀 𝙀𝙉𝙏𝙀𝙍 𝘼𝙉 𝘼𝙋𝙋 𝙉𝘼𝙈𝙀!",
			noResult: "❌ | 𝙉𝙊 𝘼𝙋𝙋 𝙁𝙊𝙐𝙉𝘿 𝙁𝙊𝙍: %1"
		}
	},

	onStart: async function ({
		message,
		args,
		commandName,
		envCommands,
		getLang
	}) {
		if (!args.length)
			return message.reply(getLang("missingKeyword"));

		const keyword = args.join(" ");
		const limit = envCommands?.[commandName]?.limitResult || 3;

		try {
			const response = await itunes({
				entity: "software",
				country: "US",
				term: keyword,
				limit
			});

			const results = response?.results || [];

			if (!results.length)
				return message.reply(getLang("noResult", keyword));

			let msg = `╭━━━〔 📱 𝘼𝙋𝙋 𝙎𝙏𝙊𝙍𝙀 〕━━━╮\n`;
			msg += `┃ 🔎 𝙎𝙀𝘼𝙍𝘾𝙃: ${keyword}\n`;
			msg += `╰━━━━━━━━━━━━━━━━╯`;

			const pendingImages = [];

			for (let i = 0; i < results.length; i++) {
				const result = results[i];

				const name =
					result.trackCensoredName ||
					result.trackName ||
					"Unknown";

				const developer =
					result.artistName ||
					"Unknown";

				const price =
					result.formattedPrice ||
					"Free";

				const rating =
					typeof result.averageUserRating === "number"
						? result.averageUserRating
						: 0;

				const stars =
					rating > 0
						? "⭐".repeat(Math.min(5, Math.round(rating)))
						: "No rating";

				msg += `\n\n╭━━〔 ${i + 1} 〕━━
┃ 📱 𝙉𝘼𝙈𝙀: ${name}
┃ 👨‍💻 𝘿𝙀𝙑: ${developer}
┃ 💰 𝙋𝙍𝙄𝘾𝙀: ${price}
┃ ⭐ 𝙍𝘼𝙏𝙄𝙉𝙂: ${stars}
┃ 📊 𝙎𝘾𝙊𝙍𝙀: ${rating.toFixed(1)}/5
┃ 🔗 𝙇𝙄𝙉𝙆:
┃ ${result.trackViewUrl || "Not available"}
╰━━━━━━━━━━━━`;

				const imageUrl =
					result.artworkUrl512 ||
					result.artworkUrl100 ||
					result.artworkUrl60;

				if (imageUrl) {
					try {
						pendingImages.push(
							await getStreamFromURL(imageUrl)
						);
					} catch (error) {
						// Image load failed, continue without it
					}
				}
			}

			return message.reply({
				body: msg,
				attachment: await Promise.all(pendingImages)
			});

		} catch (error) {
			console.error("APPSTORE ERROR:", error);

			return message.reply(
				`❌ | 𝙎𝙀𝘼𝙍𝘾𝙃 𝙁𝘼𝙄𝙇𝙀𝘿!\n\n🔎 ${keyword}`
			);
		}
	}
};
