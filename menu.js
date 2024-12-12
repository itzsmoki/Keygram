document.getElementById('saveKey').addEventListener('click', function () {
  const newSecret = document.getElementById('newSecret')
  const serverURL = document.getElementById('serverURL')
  if (serverURL.checkValidity() && serverURL.value) {
    if (newSecret.value.trim() === "") {
      chrome.storage.local.set(
        {
          SERVER: serverURL.value
        },
        function () {
          window.close()
        }
      )
    } else {
      chrome.storage.local.set(
        {
          SECRET: newSecret.value,
          SERVER: serverURL.value
        },
        function () {
          window.close()
        }
      )
    }
  }
})


document.addEventListener('DOMContentLoaded', function () {
  const currentSecretInput = document.getElementById('currentSecret')
  const currentSecretDiv = document.getElementById('currentDiv')
  const serverURLInput = document.getElementById('serverURL')

  chrome.storage.local.get('SECRET', function (result) {
    if (result.SECRET) {
      currentSecretInput.value = result.SECRET
    } else {
      currentSecretDiv.style.display = 'none'
    }
  })

  chrome.storage.local.get('SERVER', function (result) {
    if (result.SERVER) {
      serverURLInput.value = result.SERVER
    }
  })
})

document.getElementById('showKey').addEventListener('click', function () {
  const currentSecretInput = document.getElementById('currentSecret')

  if (currentSecretInput.type === 'password') {
    currentSecretInput.type = 'text'
  } else {
    currentSecretInput.type = 'password'
  }
})
