'use strict';
$(() => {
	// If this feature is not enabled, do not display the controls.
	if (!nodecg.bundleConfig.enable) {
		$('#wrapper').hide();
		$('#notEnabledText').show();
		return;
	}

	// Setting up replicants.
	var highlightRecording = nodecg.Replicant('twitchHighlightRecording');
	var timer = nodecg.Replicant('timer', 'nodecg-speedcontrol');
	var highlightHistory = nodecg.Replicant('twitchHighlightHistory');
	var highlightProcessing = nodecg.Replicant('twitchHighlightProcessing');

	// JQuery elements.
	var startHighlightButton = $('#startHighlight');
	var stopHighlightButton = $('#stopHighlight');
	var cancelHighlightButton = $('#cancelHighlight');
	var historyList = $('#history');
	var processingElem = $('#processing');
	var processingTitle = $('#processingTitle');

	// Turn the buttons into JQueryUI buttons.
	startHighlightButton.button();
	stopHighlightButton.button();
	cancelHighlightButton.button();

	highlightRecording.on('change', (newVal) => {
		// Only change buttons if run is currently not ongoing.
		if (timer.value.state === 'stopped' || timer.value.state === 'finished')
			toggleRecordingButtons(newVal)
	});

	timer.on('change', (newVal, oldVal) => {
		// Only turn off buttons if run is currently ongoing.
		if (newVal.state === 'running' || newVal.state === 'paused') {
			startHighlightButton.button({disabled:true});
			stopHighlightButton.button({disabled:true});
			cancelHighlightButton.button({disabled:true});
		}

		// If the timer isn't running, set the buttons to what they should be.
		else
			toggleRecordingButtons(highlightRecording.value);
	});

	function toggleRecordingButtons(recording) {
		if (recording) {
			startHighlightButton.button({disabled:true});
			stopHighlightButton.button({disabled:false});
			cancelHighlightButton.button({disabled:false});
		}

		else {
			startHighlightButton.button({disabled:false});
			stopHighlightButton.button({disabled:true});
			cancelHighlightButton.button({disabled:true});
		}
	}

	// Sending messages using the buttons.
	startHighlightButton.click(() => {
		nodecg.sendMessage('startTwitchHighlight');
	});
	stopHighlightButton.click(() => {
		nodecg.sendMessage('stopTwitchHighlight');
	});
	cancelHighlightButton.click(() => {
		nodecg.sendMessage('cancelTwitchHighlight');
	});

	// Replicant that tells us when a highlight is being processed/not being processed.
	// TODO: Remove element when value is null/undefined.
	highlightProcessing.on('change', (newVal, oldVal) => {
		if (!newVal)
			processingTitle.html('None');
		else
			processingTitle.html(newVal);
	});
	
	// Updates the highlight history list when needed.
	highlightHistory.on('change', (newVal, oldVal) => {
		if (!newVal.length)
			historyList.html('<br>None yet.');
		else {
			var html = '';
			newVal.forEach(highlight => {
				html += '<br><a href="'+highlight.url+'">'+highlight.title+'</a><br>';
			});
			historyList.html(html);
		}
	});
});
