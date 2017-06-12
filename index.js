// SPEECH RECOGNITION
var recognition;
var text_el = document.getElementById( 'text' );

if ( 'webkitSpeechRecognition' in window )
{
	recognition = new webkitSpeechRecognition();
	recognition.continuous = true;
	recognition.interimResults = true;
	recognition.addEventListener( 'start', recognitionStarted );
	recognition.addEventListener( 'end', recognitionEnded );
	recognition.addEventListener( 'result', recognitionTalked );
	recognition.addEventListener( 'error', function ( error ){ console.log( error ); } );
	recognition.start();
}

function recognitionStarted ()
{
	console.log( 'recognition started' );
}

function recognitionEnded ()
{
	console.log( 'recognition stopped' );
}

function recognitionTalked ( event )
{
	var text = '';

	if (
		event.results &&
		event.results.length
	)
	{
		for ( var i = event.resultIndex, len = event.results.length; i < len; ++i )
		{
			text += event.results[i][0].transcript;
		}

		text_el.innerText = text;
	}
}

// GETUSERMEDIA INPUT
navigator.getUserMedia = ( navigator.getUserMedia ||
                       navigator.webkitGetUserMedia ||
                       navigator.mozGetUserMedia ||
                       navigator.msGetUserMedia);
window.AudioContext = window.AudioContext || window.webkitAudioContext;

var volume_el = document.getElementById( 'volume' );
var stream;
var ctx = new AudioContext();
var analyzer = ctx.createAnalyser();
analyzer.smoothingTimeConstant = 0.18;
analyzer.fftSize = 256;

var frequencies = new Uint8Array( analyzer.frequencyBinCount );
var times = new Uint8Array( analyzer.frequencyBinCount );

navigator.getUserMedia ( { audio: true }, microphoneReady );

function microphoneReady( stream )
{
	var stream_source = ctx.createMediaStreamSource( stream );
	stream_source.connect( analyzer );
	loop();
}

function loop()
{
	analyzer.getByteFrequencyData( frequencies );
	analyzer.getByteTimeDomainData( times );

	volume_el.value = getVolume();
	
	setTimeout( loop, 10 );
}

function getVolume ()
{
	return parseInt( getFreqencyRange( 0, analyzer.frequencyBinCount - 1 ), 10 );
}

function getFreqencyRange ( from, to )
{
	var volume = 0;
	
	for ( var i = from; i < to; i++ )
	{
		volume += frequencies[i];
	}
	
	return volume / ( to - from );
}