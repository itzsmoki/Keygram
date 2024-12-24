let SECRET
let SERVER
const send = chrome.i18n.getMessage("send");

function updateStorageValues() {
  chrome.storage.local.get('SECRET', function (result) {
    SECRET = result.SECRET || '';
  });

  chrome.storage.local.get('SERVER', function (result) {
    SERVER = result.SERVER || '';
  });
}


const onStreamKeyBoxLoaded = () => {
  const streamKeyBox = document.querySelector(
    'input[name="live-creation-modal-start-pane-stream-key"]'
  )
  if (streamKeyBox) {
    let sendButton = streamKeyBox.parentNode.querySelector(
      'button.send-stream-key'
    )
    if (!sendButton) {
      sendButton = document.createElement('button')
      sendButton.textContent = send
      sendButton.classList.add('send-stream-key')
      sendButton.style.marginLeft = '2px'
      sendButton.style.backgroundColor = 'transparent'
      sendButton.style.color = '#0095f6'
      sendButton.style.border = 'none'
      sendButton.style.fontWeight = '500'

      sendButton.addEventListener('mouseover', () => {
        if (!sendButton.disabled) {
          sendButton.style.color = 'white'
        }
      })

      sendButton.addEventListener('mouseout', () => {
        if (!sendButton.disabled) {
          sendButton.style.color = '#0095f6'
        }
      })

      sendButton.addEventListener('mousedown', () => {
        sendButton.style.color = 'gray'
      })

      sendButton.addEventListener('mouseup', () => {
        sendButton.style.color = 'white'
      })

      sendButton.addEventListener('click', () => {
        sendButton.disabled = true
        sendButton.style.color = 'gray'
      })

      streamKeyBox.parentNode.appendChild(sendButton)

      sendButton.addEventListener('click', () => {
        const streamKey = streamKeyBox.value
        updateStorageValues();

        if (!streamKey) {
          sendButton.disabled = false
          sendButton.style.color = '#0095f6'
          return
        }

        fetch(SERVER, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ streamKey, serverKey: SECRET })
        })
          .then(response => {
            if (!response.ok) {
              throw new Error(response.status)
            }
            return response.text()
          })
          .then(data => {
          })
          .catch(error => {
            sendButton.disabled = false
            sendButton.style.color = '#0095f6'
          })
      })
    }
  } else {
  }
}

const observer = new MutationObserver((mutationsList, observer) => {
  const streamKeyBox = document.querySelector(
    'input[name="live-creation-modal-start-pane-stream-key"]'
  )
  if (streamKeyBox) {
    onStreamKeyBoxLoaded()
  }
})

observer.observe(document.body, { childList: true, subtree: true })