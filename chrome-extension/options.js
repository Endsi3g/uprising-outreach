document.addEventListener('DOMContentLoaded', () => {
  const apiUrlInput = document.getElementById('apiUrl');
  const saveBtn = document.getElementById('saveBtn');
  const statusDiv = document.getElementById('status');

  // Load current setting
  chrome.storage.sync.get(['apiUrl'], (result) => {
    if (result.apiUrl) {
      apiUrlInput.value = result.apiUrl;
    } else {
      apiUrlInput.value = 'http://localhost:8000/api/v1'; // default
    }
  });

  // Save new setting
  saveBtn.addEventListener('click', () => {
    const url = apiUrlInput.value.trim();
    chrome.storage.sync.set({ apiUrl: url }, () => {
      statusDiv.textContent = 'Paramètres enregistrés avec succès !';
      setTimeout(() => {
        statusDiv.textContent = '';
      }, 3000);
    });
  });
});
