let audioContext = new AudioContext();
// w/ Web Audio everything begins with AudioContext. This obj handles all the audio processing we're going to do and as well, internally manages any communication with the audio hardware and the resources associated with it.

// to reproduce the phase-shifting process, by calling / playing two loops we need to abstract startLoop so that two source nodes that both play the same audioBuffer are created and started.
// we add stereo panning in start loop using stereoPannerNodes, and we add them to the audio graph. They can be used to pan their incoming audio signal to any point in the stereo field.
// StereoPannerNode has a pan attribute that can be set to a number between -1 (all the way to the left) and 1 (all the way to the right), with the default being 0 (in the center).
// The playback speed of an AudioBufferSourceNode can be set using the playbackRate attribute. The default value is 1 and setting it to something else makes it go slower or faster. For example, setting it to 2 doubles the playback speed, also halving the duration in the process.
function startLoop(audioBuffer, pan = 0, rate = 1) {
    let sourceNode = audioContext.createBufferSource()
    let pannerNode = audioContext.createStereoPanner()

    sourceNode.buffer = audioBuffer
    sourceNode.loop = true
    sourceNode.loopStart = 3.40
    sourceNode.loopEnd = 4.19
    sourceNode.playbackRate.value = rate
    pannerNode.pan.value = pan
    // no longer do you connect the source nodes directly to the audioContext destination like before. We connect them to the panner nodes, and then the panner nodes to the destionation. The audio signals flow through the panners
    // audioBufferSourceNode -----> stereoPannerNode -----> audioDestinationNode
    // we now have an audio graph with two loops panned to different ends of the stereo fields.

    sourceNode.connect(pannerNode)
    pannerNode.connect(audioContext.destination)

    // sourceNode.start(0, 3.40)
    sourceNode.start()
}

const fetchAndPlayAudioLoops = async () => {
    try {
        // fetch audio over network
        const loop = await fetch('itsgonnarain.mp3')
        // arrayBuffer() = let it be known we want incoming data as a binary arrayBuffer obj
        const arrayBuff = await loop.arrayBuffer()
        // call audioContext decodeAudioData method to turn out MP3 arrayBuffer into a decoded audioBuffer
        // this audioBuff is now something we can play
        const audioBuff = await audioContext.decodeAudioData(arrayBuff)
        // INSERTION OF using startLoop to play two loops
        startLoop(audioBuff, -1)
        startLoop(audioBuff, 1, 1.002)
        // --------------------------------------- Below is primary knowledge for setting up single loop.-----------------------------------------
        // we use audioContext again to create a buffer source, this is an object that knows how to play back an audioBuffer. We give it the buffer we have, connect it, and start it.
        // let sourceNode = audioContext.createBufferSource()
        // sourceNode.buffer = audioBuff
        // LOL sourceNode.loop = true negates the laborious process of finding right bit of tape and cutting and gluing. Sorry ENO!
        // sourceNode.loop = true;
        // Rather than doing that cutting and pasting, we can use loopStart and loopEnd to "cut" the tape, as it were.
        // sourceNode.loopStart = 3.35;
        // sourceNode.loopEnd = 4.15;
        // sourceNode.connect(audioContext.destination)
        // Tell the node we want you to start playing at the beginning of the loop
        // When to start playing, we set it to 0 because we want it to start playing immediately, this is the default, but we provide second arg, which is the offset, at which point we want to start playing the buffer.
        // sourceNode.start(0, 3.35);
        // this is an example of an audio-processing-graph, which consists of two nodes, one connected to the next
        // 1) an AudioBufferSourceNode that reads in the audioBuffer data and streams it to other nodes
        // 2) the AudioContext's built-in audioDestinationNode, which makes the sound audible on the machine's speakers.
        // audioBufferSourceNode e.g. buffer = itsgonnarain.mp3 ----> audioDestinationNode <
        // NOTE: in general, all audio processing with the Web Audio API happens with such graphs, through which audio signlas flow, starting from soruce nodes and ending up in destination nodes, possibly going through a number of intermediary ndoes.
        // These graphs may contain different kinds of nodes that generate, transform, measure or play audio. This is the simplest kind of audio processing graph, e.g. playback a sound.
    } catch (err) {
        console.error(err)
    }
}
// fetchAndPlayAudioLoops()

window.onload = function() {
    const button = document.getElementsByClassName("beginBtn")[0]
    button.addEventListener("click", function() { 
        button.disabled = true       
        fetchAndPlayAudioLoops()
    })
}

// In the end  what has been created is a web audio graph with two loops, panned and with phasing.
