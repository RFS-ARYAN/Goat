module.exports = {
	config: {
		name: "unsendReaction",
		version: "1.0",
		author: "Nix",
		category: "events",
		description: "Unsend message when admin/vip reacts with specific emoji"
	},

	onStart: async function() {},

	onEvent: async function({ api, event, threadsData, usersData }) {
		const config = global.GoatBot.config;
		
		if (!config.unsend || !config.unsend.enable) return;
		
		if (event.type !== "message_reaction") return;
		
		const { reaction, messageID, userID } = event;
		const unsendReaction = config.unsend.reaction || "😠";
		
		if (reaction !== unsendReaction) return;
		
		const adminBot = config.adminBot || [];
		const vipUser = config.vipUser || [];
		const allowedUsers = [...new Set([...adminBot, ...vipUser])];
		
		if (!allowedUsers.includes(userID.toString())) return;
		
		try {
			await api.unsendMessage(messageID);
		} catch (err) {
			console.log("Unsend error:", err.message);
		}
	}
};
