class GitLabTimer {
	constructor (container, showHideButton) {
		this.container = container
		this.showHideButton = showHideButton

		this.render()
		this.bindEvents()

		this.output = this.container.querySelector('.gitlab-timer-output')

		this.shown = false
		this.running = false

		this.load()
	}

	start () {
		this.running = true
		this.startedAt = this.startedAt || new Date

		if (this.pausedAt) {
			this.startedAt = new Date((new Date) - (this.pausedAt - this.startedAt))
			this.pausedAt = undefined
		}

		this.update = setInterval(() => { this.tick() }, 1000)

		this.save()
	}

	pause () {
		this.running = false
		this.pausedAt = new Date()

		clearInterval(this.update)

		this.save()
	}

	stop (commit) {
		if (commit) {
			document.querySelector('#note-body').value = `/spend ${this.spentTime(true)}`
			document.querySelector('#note-body').dispatchEvent(new Event('change'))
			setTimeout(() => { document.querySelector('.js-comment-submit-button').click() }, 50)
		}

		this.running = false
		this.startedAt = undefined
		this.pausedAt = undefined

		this.output.innerText = '0m 0s'

		clearInterval(this.update)

		this.save()
	}

	tick () {
		if (! this.startedAt) {
			return this.output.innerText = '0m 0s'
		}

		let difference = this.spentTime()
		let formatted = this.formatTime(difference, true)

		this.output.innerText = formatted
	}

	spentTime (formatted) {
		let difference = Math.floor(((new Date()).getTime() - this.startedAt.getTime()) / 1000)

		return formatted ? this.formatTime(difference) : difference
	}

	formatTime (time, showSeconds) {
		let hours = Math.floor(time / 60 / 60)
		let minutes = Math.floor(time % (60 * 60) / 60)

		if (showSeconds) {
			let seconds = time % 60
			return hours ? `${hours}h ${minutes}m ${seconds}s` : `${minutes}m ${seconds}s`
		} else {
			return hours ? `${hours}h ${minutes}m` : `${minutes}m`
		}
	}

	load () {
		try {
			this.timers = JSON.parse(window.localStorage.getItem('gitlab-timer'))
		} catch (e) {}

		if (! (this.timers instanceof Object)) {
			this.timers = {}
		}

		let data = this.timers[window.location.href]

		if (data) {
			this.shown = data.shown
			this.running = data.running
			this.startedAt = data.startedAt ? new Date(data.startedAt) : undefined
			this.pausedAt = data.pausedAt ? new Date(data.pausedAt) : undefined

			this.output.innerText = data.outputText

			if (this.shown) this.show()
			if (this.running) this.start()
		}
	}

	save () {
		this.timers[window.location.href] = {
			shown: this.shown,
			running: this.running,
			startedAt: this.startedAt ? this.startedAt.getTime() : undefined,
			pausedAt: this.pausedAt ? this.pausedAt.getTime() : undefined,
			outputText: this.output.innerText
		}

		window.localStorage.setItem('gitlab-timer', JSON.stringify(this.timers))
	}

	show () {
		this.shown = true

		this.container.querySelector('.gitlab-timer').classList.add('gitlab-timer-shown')

		this.save()
	}

	hide () {
		this.shown = false

		this.container.querySelector('.gitlab-timer').classList.remove('gitlab-timer-shown')

		this.save()
	}

	render () {
		this.container.innerHTML = `
			<style>
				.gitlab-timer {
					background: #fff;
					border-top: 1px solid #ededed;
					border-bottom: 1px solid #ededed;
					color: #707070 !important;
					display: none !important;
					font-size: 16px;
					margin: 16px -20px 0;
					padding: 16px 20px;
					text-align: center;
				}
				.gitlab-timer > * { vertical-align: middle; }
				.gitlab-timer-shown { display: block !important; }
				.gitlab-timer-start { cursor: pointer; font-size: 30px; }
				.gitlab-timer-commit, .gitlab-timer-reset { cursor: pointer; font-size: 17px; }
				.gitlab-timer-button { margin-right: 5px; }
				.gitlab-timer-output { margin: 0 5px; }
				.gitlab-timer-icon-clock:before { content: "\\f017"; }
			</style>
			<span class="gitlab-timer">
				<span class="fa fa-question-circle gitlab-timer-icon-clock gitlab-timer-start"></span>
				<span class="gitlab-timer-output">0m 0s</span>
				<span class="fa fa-check-circle gitlab-timer-commit"></span>
				<span class="fa fa-refresh gitlab-timer-reset"></span>
			</span>
		`
	}

	bindEvents () {
		this.showHideButton.addEventListener('click', ev => {
			ev.stopPropagation()
			this.shown ? this.hide() : this.show()
		})

		this.container.querySelector('.gitlab-timer-start').addEventListener('click', ev => {
			this.running ? this.pause() : this.start()
		})

		this.container.querySelector('.gitlab-timer-commit').addEventListener('click', ev => {
			this.stop(true)
		})

		this.container.querySelector('.gitlab-timer-reset').addEventListener('click', ev => {
			this.stop()
		})
	}
}

let gitlabTimerContainer = document.createElement('div')
let gitlabTimerButton = document.createElement('span')
gitlabTimerButton.classList.add('fa', 'fa-question-circle', 'gitlab-timer-icon-clock', 'gitlab-timer-button')

document.querySelector('.time-tracking-component-wrap .help-button').prepend(gitlabTimerButton)
document.querySelector('.time-tracking-content').append(gitlabTimerContainer)

new GitLabTimer(gitlabTimerContainer, gitlabTimerButton)
