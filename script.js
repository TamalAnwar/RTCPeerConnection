let localStream, remoteStream, localPeerConnection, remotePeerConnection;

let servers = null;

let localVideo = document.querySelector('#localVideo');
let remoteVideo = document.querySelector('#remoteVideo');

let callButton = document.querySelector('#callButton');
let hangupButton = document.querySelector('#hangupButton');

// Local video callbacks
function gotLocalMediaStream(mediaStream) {
  localVideo.srcObject = mediaStream;
  localStream = mediaStream;
}

// Remote video callback
function gotRemoteMediaStream(event) {
  let mediaStream = event.stream;
  remoteVideo.srcObject = mediaStream;
  remoteStream = mediaStream;
}

navigator.mediaDevices
  .getUserMedia({ video: true })
  .then(gotLocalMediaStream)
  .catch((err) => console.log(err));

// Peer Connection callbacks
function handleConnection(event) {
  let peerConnection = event.target;
  let iceCandidate = event.candidate;
  if (iceCandidate) {
    let newIceCandidate = new RTCIceCandidate(iceCandidate);
    let otherPeer =
      peerConnection === localPeerConnection
        ? remotePeerConnection
        : localPeerConnection;

    otherPeer.addIceCandidate(newIceCandidate).catch((err) => console.log(err));
  }
}

// Offer callbacks
function createdOffer(description) {
  localPeerConnection
    .setLocalDescription(description)
    .catch((err) => console.log(err));

  remotePeerConnection
    .setRemoteDescription(description)
    .catch((err) => console.log(err));

  remotePeerConnection
    .createAnswer()
    .then(createdAnswer)
    .catch((err) => console.log(err));
}

function createdAnswer(description) {
  localPeerConnection
    .setRemoteDescription(description)
    .catch((err) => console.log(err));

  remotePeerConnection
    .setLocalDescription(description)
    .catch((err) => console.log(err));
}

function startCall() {
  localPeerConnection = new RTCPeerConnection(null);
  localPeerConnection.addEventListener('icecandidate', handleConnection);
  localPeerConnection.addEventListener('iceconnectionstatechange', () =>
    console.log('Connection state changed')
  );

  remotePeerConnection = new RTCPeerConnection(null);
  remotePeerConnection.addEventListener('icecandidate', handleConnection);
  remotePeerConnection.addEventListener('iceconnectionstatechange', () =>
    console.log('Connection state changed')
  );

  remotePeerConnection.addEventListener('addstream', gotRemoteMediaStream);

  localPeerConnection.addStream(localStream);

  localPeerConnection
    .createOffer({ offerToReceiveVideo: 1 })
    .then(createdOffer)
    .catch((err) => console.log(err));
}

function hangup() {
  localPeerConnection.close();
  remotePeerConnection.close();
  localPeerConnection = null;
  remotePeerConnection = null;
}

callButton.addEventListener('click', startCall);
hangupButton.addEventListener('click', hangup);
