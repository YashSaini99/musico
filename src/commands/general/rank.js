const { Command } = require('discord-akairo');
const { stripIndents } = require('common-tags');
const ProgressBar = require('../../util/bar');

module.exports = class extends Command {
	constructor() {
		super('rank', {
			aliases: ['rank'],
			category: 'general',
			description: {
				content: ''
			},
			args: [
				{
					id: 'member',
					type: 'member',
					default: m => m.member
				}
			]
		});
	}

	async exec(message, { member }) {
		const user = member.user;
		const userData = await this.client.mongo.db('musico').collection('levels').findOne({ user: user.id });

		if (!userData && !user.bot) {
			return message.util.send({
				embed: {
					color: 0xFF0000,
					description: `**${user.tag}** do not have any exp. Start chatting to earn them.`
				}
			});
		} else if (user.bot) {
			return message.util.send({
				embed: {
					color: 0xFF0000,
					description: `**${user.tag}** is a bot. What will bots do by earning exp?`
				}
			});
		}
		const currentLevel = this.client.levels.getLevelFromExp(userData.exp);
		const levelExp = this.client.levels.getLevelExp(currentLevel);
		const currentLevelExp = this.client.levels.getLevelProgress(userData.exp);
		const leaderboard = await this.client.levels.getLeaderboard();
		const rank = leaderboard.findIndex(item => item.user === user.id) + 1;

		const progress = new ProgressBar(currentLevelExp, levelExp, 20);

		const embed = this.client.util.embed()
			.setColor(11642864)
			.setAuthor(user.tag, user.displayAvatarURL({ dynamic: true }))
			.setThumbnail(user.displayAvatarURL({ dynamic: true }))
			.setDescription(stripIndents`
				**Rank:** \`#${rank}\`
				**Level:** \`${currentLevel}\`
				**Exp:** \`${currentLevelExp} / ${levelExp}\`
				**Total Exp:** \`${userData.exp}\`
				${progress.createBar(message, false)}
			`);

		return message.util.send({ embed });
	}
};

