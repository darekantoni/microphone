

'use strict';




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

window.AudioContext = window.AudioContext || window.webkitAudioContext;

var volume_el = document.getElementById( 'volume' );
var stream;
var ctx = new AudioContext();
var analyzer = ctx.createAnalyser();
analyzer.smoothingTimeConstant = 0.18;
analyzer.fftSize = 256;

var frequencies = new Uint8Array( analyzer.frequencyBinCount );
var times = new Uint8Array( analyzer.frequencyBinCount );


// Put variables in global scope to make them available to the browser console.
var audio = document.querySelector('audio');

var constraints = window.constraints = {
  audio: true,
  video: false
};

function handleSuccess(stream) {

  var stream_source = ctx.createMediaStreamSource( stream );
  stream_source.connect( analyzer );
  loop();

  var audioTracks = stream.getAudioTracks();
  console.log('Got stream with constraints:', constraints);
  console.log('Using audio device: ' + audioTracks[0].label);
  stream.oninactive = function() {
    console.log('Stream ended');
  };
  window.stream = stream; // make variable available to browser console
  audio.srcObject = stream;
}

function handleError(error) {
  console.log('navigator.getUserMedia error: ', error);
}

navigator.mediaDevices.getUserMedia(constraints).
    then(handleSuccess).catch(handleError);


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