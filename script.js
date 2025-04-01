$(document).ready(function () {

    // functions
    const startRec = () =>{
        try {
            if (!isRecognitionStarted) {
                recognition.start();
                isRecognitionStarted = true;  // Set flag to true once recognition has started
                $('#start').prop('disabled', true);
                $('#stop').prop('disabled', false);
                $('#downloadText').prop('disabled', true);
                $('#downloadAudio').prop('disabled', true);
                $('#clearData').prop('disabled', true);  // Disable clearData until stop

                // Start recording audio
                navigator.mediaDevices.getUserMedia({ audio: true })
                    .then(function (stream) {
                        mediaRecorder = new MediaRecorder(stream);
                        mediaRecorder.ondataavailable = function (event) {
                            audioChunks.push(event.data);
                        };
                        mediaRecorder.onstop = function () {
                            let audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                            let audioUrl = URL.createObjectURL(audioBlob);
                            localStorage.setItem('meeting_audio', audioUrl);
                            audioChunks = [];
                        };
                        mediaRecorder.start();
                    })
                    .catch(function (err) {
                        alert('Access to microphone is required.');
                    });
            }
        } catch (err) {
            alert('Access to microphone is required.');
        }
    }

    const stopRec = ()=>{
        recognition.stop();
        mediaRecorder.stop();
        isRecognitionStarted = false;  // Reset flag when stopped
        $('#start').prop('disabled', false);
        $('#stop').prop('disabled', true);
        $('#downloadText').prop('disabled', false);
        $('#downloadAudio').prop('disabled', false);
        $('#clearData').prop('disabled', false);
    }

    // $('#my_form').toggle();
    $('#my_form').addClass('mything1')
    let typed = '';
    let mediaRecorder;
    let audioChunks = [];
    let isRecognitionStarted = false;

    // Detect key press to toggle form
    $('body').on('keydown', (event) => {
        typed += event.key;
        if (typed.includes('789')) {
            // $('#my_form').removeClass('mything1')
            $('#my_form').toggle();
            $('#fakk').toggle()
            typed = '';
        }
    });

    // Initialize speech recognition
    let recognition = new (window.SpeechRecognition || window.webkitSpeechRecognition)();
    recognition.continuous = true;  // Allow continuous recognition
    recognition.interimResults = true;  // Capture interim results
    recognition.lang = $('#languageSelect').val() || 'he-IL'; // Language from select

    let transcriptData = [];

    recognition.onresult = function (event) {
        for (let i = event.resultIndex; i < event.results.length; i++) {
            let text = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
                // Append final result to transcriptData
                transcriptData.push(text);
                let existingTranscript = JSON.parse(localStorage.getItem('meeting_transcript')) || [];
                existingTranscript.push(text);  // Append new text to existing data
                localStorage.setItem('meeting_transcript', JSON.stringify(existingTranscript));
            }
        }
    };

    recognition.onend = function () {
        if (isRecognitionStarted) {
            recognition.start(); // Restart recognition after it ends
        }
    };

    // Change the language when selecting a new option
    $('#languageSelect').change(function () {
        recognition.lang = $(this).val();
    });

    // Update threshold value display in real-time
    $('#thresholdInput').on('input', function () {
        $('#thresholdValue').text($(this).val());
    });

    // Start recognition on button click
    $('#start').click(function () {
        startRec()
    });

    // Stop recognition and recording
    $('#stop').click(function () {
        stopRec()
    });

    // Download text file with transcript
    $('#downloadText').click(function () {
        let textData = JSON.parse(localStorage.getItem('meeting_transcript')) || [];
        let blob = new Blob([textData.join('\n')], { type: 'text/plain' });
        let a = document.createElement('a');
        a.href = URL.createObjectURL(blob);
        a.download = 'meeting_transcript.txt';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    });

    // Download audio (if stored)
    $('#downloadAudio').click(function () {
        let audioUrl = localStorage.getItem('meeting_audio');
        if (audioUrl) {
            let a = document.createElement('a');
            a.href = audioUrl;
            a.download = 'meeting_audio.wav';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        }
    });

    // Clear data from localStorage
    $('#clearData').on('click', () => {
        localStorage.removeItem('meeting_transcript');
        localStorage.removeItem('meeting_audio');
        $('#clearData').prop('disabled', true);  // Disable clearData after clearing
    });

    // Enable the clear data button if data is available in localStorage
    if (localStorage.getItem('meeting_audio') || localStorage.getItem('meeting_transcript')) {
        $('#clearData').prop('disabled', false);
    } else {
        $('#clearData').prop('disabled', true);
    }

    // Refresh the page elements after any button click
    function renderAppState() {
        if (isRecognitionStarted) {
            $('#start').prop('disabled', true);
            $('#stop').prop('disabled', false);
            $('#downloadText').prop('disabled', true);
            $('#downloadAudio').prop('disabled', true);
            $('#clearData').prop('disabled', true);
        } else {
            $('#start').prop('disabled', false);
            $('#stop').prop('disabled', true);
            $('#downloadText').prop('disabled', false);
            $('#downloadAudio').prop('disabled', false);
            $('#clearData').prop('disabled', false);
        }
    }
    
    // Call renderAppState on every button click to ensure UI is updated
    $('#start, #stop, #downloadText, #downloadAudio, #clearData').click(function() {
        renderAppState();
    });
});
